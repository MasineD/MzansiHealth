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
// // function to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET,
        { expiresIn: '30d' }); //Generates a JSON Web Token (JWT) that includes the user's ID and role as payload. The token is signed using a secret key from the environment variables and is set to expire in 30 days.
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
        const token = generateToken(newUser.rows[0].id, newUser.rows[0].role);   //Generates a JWT token for the newly registered user using their ID.
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
        const { identity, password } = req.body;   //Extracts the identity and password from the request body.
        if(!identity || !password) {
            return res.status(400).json({ message: 'Please provide identity and password' });
        }
        
        let userResult = await pool.query('SELECT * FROM users.user_profiles WHERE identity = $1', [identity]);
        let userData;
        
        if (userResult.rows.length > 0) {
            userData = userResult.rows[0];
        } else {
            // Check patients table if not found in user_profiles
            const patientResult = await pool.query(
                `SELECT p.*, u.organization 
                 FROM users.patients p
                 LEFT JOIN users.user_profiles u ON p.registra_id = u.id
                 WHERE p.identity = $1`,
                [identity]
            );
            if (patientResult.rows.length > 0) {
                userData = patientResult.rows[0];
                userData.role = 'patient'; // Ensure role is 'patient'
            } else {
                // Check community_health_workers table if not found in patients either
                const chwResult = await pool.query(
                    `SELECT c.*, u.organization 
                     FROM users.community_health_workers c
                     LEFT JOIN users.user_profiles u ON c.registra_id = u.id
                     WHERE c.identity = $1`,
                    [identity]
                );
                if (chwResult.rows.length > 0) {
                    userData = chwResult.rows[0];
                    userData.role = 'chw'; // Ensure role is 'chw'
                }
            }
        }

        if(!userData) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, userData.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(userData.id, userData.role);
        res.cookie('token', token, cookieOptions);
        
        res.json({ user: { id: userData.id, fullname: userData.fullname, identity: userData.identity, email: userData.email, phone_number: userData.phone_number, role: userData.role, organization: userData.organization } });
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

// Get contact list for chat (available to any authenticated user)
router.get('/contacts', protect, async (req, res) => {
    try {
        const staffAdminResult = await pool.query(
            "SELECT id, fullname, role, organization FROM users.user_profiles ORDER BY fullname ASC"
        );
        const patientResult = await pool.query(`
            SELECT p.id, p.fullname, 'patient' AS role, 
                   COALESCE(
                       (SELECT organization FROM users.user_profiles WHERE id = p.registra_id),
                       'Patient'
                   ) AS organization
            FROM users.patients p 
            ORDER BY p.fullname ASC
        `);
        const chwResult = await pool.query(`
            SELECT c.id, c.fullname, 'chw' AS role, 
                   COALESCE(
                       (SELECT organization FROM users.user_profiles WHERE id = c.registra_id),
                       'Community Health Worker'
                   ) AS organization
            FROM users.community_health_workers c 
            ORDER BY c.fullname ASC
        `);

        // Map them to include chat_id
        const staffAdminContacts = staffAdminResult.rows.map(u => ({
            id: u.id,
            fullname: u.fullname,
            role: u.role,
            organization: u.organization,
            chat_id: `user_${u.id}`
        }));

        const patientContacts = patientResult.rows.map(p => ({
            id: p.id,
            fullname: p.fullname,
            role: 'patient',
            organization: p.organization,
            chat_id: `patient_${p.id}`
        }));

        const chwContacts = chwResult.rows.map(c => ({
            id: c.id,
            fullname: c.fullname,
            role: 'chw',
            organization: c.organization,
            chat_id: `chw_${c.id}`
        }));

        // Combine contacts
        const allContacts = [...staffAdminContacts, ...patientContacts, ...chwContacts];

        // Filter out the requesting user themselves
        const requesterChatId = `${req.user.role === 'admin' || req.user.role === 'staff' ? 'user' : req.user.role}_${req.user.id}`;
        let filteredContacts = allContacts.filter(c => c.chat_id !== requesterChatId);

        // Enforce organizational isolation for non-admins
        if (req.user.role !== 'admin') {
            let requesterOrg = req.user.organization;
            if (!requesterOrg) {
                if (req.user.role === 'patient') {
                    const orgRes = await pool.query(
                        "SELECT organization FROM users.user_profiles WHERE id = (SELECT registra_id FROM users.patients WHERE id = $1)",
                        [req.user.id]
                    );
                    if (orgRes.rows.length > 0) requesterOrg = orgRes.rows[0].organization;
                } else if (req.user.role === 'chw') {
                    const orgRes = await pool.query(
                        "SELECT organization FROM users.user_profiles WHERE id = (SELECT registra_id FROM users.community_health_workers WHERE id = $1)",
                        [req.user.id]
                    );
                    if (orgRes.rows.length > 0) requesterOrg = orgRes.rows[0].organization;
                }
            }

            if (requesterOrg) {
                const normalizedRequesterOrg = requesterOrg.toLowerCase().trim();
                filteredContacts = filteredContacts.filter(c => 
                    c.organization && c.organization.toLowerCase().trim() === normalizedRequesterOrg
                );
            } else {
                filteredContacts = [];
            }
        }

        // For the admin, inject group options at the top of their contact list
        if (req.user.role === 'admin' && req.user.organization) {
            const org = req.user.organization;
            filteredContacts.unshift(
                {
                    id: `all_patients_${org.toLowerCase().trim()}`,
                    fullname: `📢 All Patients (${org})`,
                    role: 'group',
                    organization: org,
                    chat_id: `all_patients_${org.toLowerCase().trim()}`
                },
                {
                    id: `all_staff_${org.toLowerCase().trim()}`,
                    fullname: `📢 All Staff (${org})`,
                    role: 'group',
                    organization: org,
                    chat_id: `all_staff_${org.toLowerCase().trim()}`
                }
            );
        }

        return res.json({ contacts: filteredContacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({ message: 'Server error fetching contacts' });
    }
});

export default router;   //Exports the router object so that it can be imported and used in the main server file to handle authentication-related routes.