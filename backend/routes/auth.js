// ================= User Authentication Routes =================
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';   //Imports the protect middleware function from the auth.js file in the middleware directory. This middleware is used to protect certain routes by verifying the JWT token sent in the request cookies.

const router = express.Router();        //Create a router object using Express, which allows us to define routes for user authentication (registration and login) in a modular way. This router will be exported and used in the main server file to handle authentication-related requests.

const cookieOptions = {
    httpOnly: true,        //Ensures that the cookie cannot be accessed via client-side JavaScript, providing protection against cross-site scripting (XSS) attacks.
    secure: process.env.NODE_ENV === 'production', //Ensures that the cookie is only sent over HTTPS connections in production environments, enhancing security.
    sameSite: 'strict',   //Prevents the browser from sending the cookie along with cross-site requests, providing protection against cross-site request forgery (CSRF) attacks.
    maxAge: 30 * 24 * 60 * 60 * 1000 //Sets the cookie to expire after 30 days, which is a common duration for session cookies.
};
// function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET,
        { expiresIn: '30d' }); //Generates a JSON Web Token (JWT) that includes the user's ID and username as payload. The token is signed using a secret key from the environment variables and is set to expire in 30 days.
};
router.post('/register', async (req, res) => {
    try {
        const { fullname, identity, password, email, phone_number, role, organization } = req.body;    //Extracts the registration fields from the request body.
        if(!fullname || !identity || !password || !phone_number) {     //Checks if the required fields are missing.
            return res.status(400).json({ message: 'Please provide fullname, identity, phone number and password' });
        }
        
        // Validate identity (exactly 13 digits) to match database constraints
        if (!/^[0-9]{13}$/.test(identity)) {
            return res.status(400).json({ message: 'Identity number must be exactly 13 digits' });
        }

        // Validate phone number (exactly 10 digits) to match database constraints
        if (!/^[0-9]{10}$/.test(phone_number)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Validate organization for admin/staff
        if ((role === 'admin' || role === 'staff') && (!organization || !organization.trim())) {
            return res.status(400).json({ message: 'Organization name is required for Admins and Staff' });
        }

        // Validate that organization exists for staff members
        if (role === 'staff') {
            const orgExists = await pool.query(
                "SELECT 1 FROM users.user_profiles WHERE LOWER(organization) = LOWER($1)",
                [organization.trim()]
            );
            if (orgExists.rows.length === 0) {
                return res.status(400).json({ message: 'Selected organization does not exist in the database' });
            }
        }

        const userExists = await pool.query('SELECT * FROM users.user_profiles WHERE identity = $1', [identity]);   //Queries the database to check if a user with the provided identity already exists.
        if(userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);    //Hashes the user's password using bcrypt with a salt round of 10.
        const newUser = await pool.query('INSERT INTO users.user_profiles (fullname, identity, password, email, phone_number, role, organization) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id,fullname,identity,email,phone_number,role,organization',
            [fullname, identity, hashedPassword, email, phone_number, role || 'patient', (role === 'admin' || role === 'staff') ? organization.trim() : null]
        );   //Inserts the new user into the database with the hashed password, role, and organization, and returns the newly created user record.
        const token = generateToken(newUser.rows[0].id);   //Generates a JWT token for the newly registered user using their ID.
        res.cookie('token', token, cookieOptions);   //Sets a cookie named 'token' with the generated JWT token and the defined cookie options for security.
        
        return res.status(201).json({ user: newUser.rows[0]});   //Returns a 201 Created response with the newly created user.
    } catch (error) {
        console.error('Error in registration route:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});
// User login route
router.post('/login', async (req, res) => {
    try {
        const { identity, password } = req.body;   //Extracts the identity and password from the request body, which is sent by the client when a user tries to log in.
        if(!identity || !password) {   //Checks if the identity or password is missing from the request. If either field is not provided, it returns a 400 Bad Request response with an error message.
            return res.status(400).json({ message: 'Please provide identity and password' });
        }
        const user = await pool.query('SELECT * FROM users.user_profiles WHERE identity = $1', [identity]);   //Queries the database to find a user with the provided identity.
        if(user.rows.length === 0) {   //If no user is found, it returns a 400 Bad Request response with an error message.
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const userData = user.rows[0];   //If a user is found, it retrieves the user data from the query result.

        const isMatch = await bcrypt.compare(password, user.rows[0].password);   //Compares the provided password with the hashed password stored in the database.
        if(!isMatch) {   //If the passwords do not match, it returns a 400 Bad Request response with an error message.
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(userData.id);   //Generates a JWT token for the logged-in user using their ID.
        res.cookie('token', token, cookieOptions);   //Sets a cookie named 'token' with the generated JWT token and the defined cookie options for security.
        
        res.json({ user: { id: userData.id, fullname: userData.fullname, identity: userData.identity, email: userData.email, phone_number: userData.phone_number, role: userData.role, organization: userData.organization } });
        // return res.status(200).json({ user: user.rows[0], token });   //Returns a 200 OK response with the logged-in user and the JWT token in the response body.
    } catch (error) {
        console.error('Error in login route:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
}); 
// Current user route
router.get('/current', protect, async (req, res) => {
    res.json({ user: req.user });   //Returns the current authenticated user's information in the response body. This route is typically protected by authentication middleware that verifies the JWT token and attaches the user information to the request object (req.user) before reaching this handler.
});
// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token');   //Clears the 'token' cookie from the client's browser, effectively logging the user out by removing the JWT token that was used for authentication.
    res.json({ message: 'Logged out successfully' });   //Returns a JSON response indicating that the user has been logged out successfully.
});

// Get list of unique organizations
router.get('/organizations', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT organization FROM users.user_profiles WHERE organization IS NOT NULL AND TRIM(organization) != '' ORDER BY organization ASC"
        );
        const organizations = result.rows.map(row => row.organization);
        return res.json({ organizations });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return res.status(500).json({ message: 'Server error fetching organizations' });
    }
});

// Get list of all users (admin only)
router.get('/users', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const result = await pool.query(
            "SELECT id, fullname, identity, email, phone_number, role, organization, created_at FROM users.user_profiles ORDER BY created_at DESC"
        );
        return res.json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Server error fetching users' });
    }
});

export default router;   //Exports the router object so that it can be imported and used in the main server file to handle authentication-related routes.