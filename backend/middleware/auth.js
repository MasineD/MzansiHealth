// ================= Authentication Middleware for Protecting Routes ==============
import jwt from 'jsonwebtoken';   //Imports the jsonwebtoken library, which is used for creating and verifying JSON Web Tokens (JWTs) for authentication purposes.
import pool from '../config/database.js';   //Imports the database connection pool from the configuration file, which allows the middleware to query the database for user information when verifying JWT tokens.

const protect = async (req, res, next) => {   //Defines an asynchronous middleware function named protect that takes the request (req), response (res), and next function as parameters. This middleware will be used to protect routes by verifying the JWT token sent in the request cookies.
    try {
        const token = req.cookies.token;   //Extracts the JWT token from the request cookies. The token is expected to be stored in a cookie named 'token'.
        if(!token) {   //If no token is found in the cookies, it returns a 401 Unauthorized response with an error message.
            return res.status(401).json({ message: 'Not authorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);   //Verifies the JWT token using the secret key stored in environment variables.
        
        let user;
        if (decoded.role === 'patient') {
            const result = await pool.query(
                `SELECT p.id, p.fullname, p.identity, p.email, p.phone_number, 'patient' AS role, u.organization, p.fulfillment_code 
                 FROM users.patients p
                 LEFT JOIN users.user_profiles u ON p.registra_id = u.id
                 WHERE p.id = $1`,
                [decoded.id]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        } else if (decoded.role === 'chw') {
            const result = await pool.query(
                `SELECT c.id, c.fullname, c.identity, c.email, c.phone_number, 'chw' AS role, u.organization, c.fulfillment_code 
                 FROM users.community_health_workers c
                 LEFT JOIN users.user_profiles u ON c.registra_id = u.id
                 WHERE c.id = $1`,
                [decoded.id]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        } else {
            const result = await pool.query(
                'SELECT id, fullname, identity, email, phone_number, role, organization, facility_code, staff_number, profession, fulfillment_code FROM users.user_profiles WHERE id = $1',
                [decoded.id]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        }

        if(!user) {   //If no user is found, it returns a 401 Unauthorized response with an error message.
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;   //Attaches the user information to the request object (req.user) for use in subsequent middleware or route handlers.
        next();   //Calls the next middleware function in the stack.
    } catch (error) {
        console.error('Error in auth middleware:', error);   //Logs any errors that occur during the token verification process to the console for debugging purposes.
        res.status(401).json({ message: 'Not authorized' });   //Returns a 401 Unauthorized response with an error message if the token is invalid or cannot be verified.
    }
};

export default protect;   //Exports the protect function so that it can be imported and used in other parts of the application to protect routes.