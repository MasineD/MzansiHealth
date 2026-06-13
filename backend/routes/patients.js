// =================== Patients Routes ===================
import express from 'express';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';   //Imports the protect middleware function from the auth.js file in the middleware directory. This middleware is used to protect certain routes by verifying the JWT token sent in the request cookies.

const router = express.Router();        //Create a router object using Express, which allows us to define routes for managing patient records in a modular way. This router will be exported and used in the main server file to handle patient-related requests.

// Route to get all patients (for admin and staff)
router.get('/patients', protect, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the protect middleware
        let patients;
        if (user.role === 'admin') {
            // Admin can see all patients
            const [rows] = await pool.query('SELECT * FROM users.patients WHERE registra_id = $1', [user.id]);
            patients = rows;
        } else {
            // Staff can see only their assigned patients
            const [rows] = await pool.query('SELECT * FROM users.patients WHERE assigned_to = $1', [user.id]);
            patients = rows;
        }
        res.json({ patients });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients' });
    }
});

// Route to add a new patient (for admin and staff)
router.post('/patients', protect, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the protect middleware
        const { fullname, identity, phone_number, email, assigned_to } = req.body;
        if (!fullname || !identity || !phone_number) {
            return res.status(400).json({ message: 'Please provide fullname, identity and phone number' });
        }
        // Validate identity (exactly 13 digits) to match database constraints
        if (!/^[0-9]{13}$/.test(identity)) {
            return res.status(400).json({ message: 'Identity number must be exactly 13 digits' });
        }
        // Validate phone number (exactly 10 digits) to match database constraints
        if (!/^[0-9]{10}$/.test(phone_number)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }
        // Only allow staff to assign patients to themselves
        let assignedTo = assigned_to;
        if (user.role === 'staff') {
            assignedTo = user.id;
        }
        const [result] = await pool.query('INSERT INTO users.patients (fullname, identity, phone_number, email, assigned_to, registra_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [fullname, identity, phone_number, email, assignedTo, user.id]);
        res.status(201).json({ patient: result[0] });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ message: 'Error adding patient' });
    }
});

export default router;
