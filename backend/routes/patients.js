// =================== Patients Routes ===================
import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Route to get all patients (for admin and staff)
router.get('/', protect, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the protect middleware
        let patients;
        if (user.role === 'admin') {
            // Admin can see patients they registered
            const result = await pool.query('SELECT * FROM users.patients WHERE registra_id = $1 ORDER BY created_at DESC', [user.id]);
            patients = result.rows;
        } else {
            // Staff can see patients of their organization (registered by admins of the same organization)
            const result = await pool.query(
                `SELECT * FROM users.patients 
                 WHERE registra_id IN (
                     SELECT id FROM users.user_profiles 
                     WHERE LOWER(organization) = LOWER($1) AND role = 'admin'
                 )
                 ORDER BY created_at DESC`,
                [user.organization || '']
            );
            patients = result.rows;
        }
        res.json({ patients });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients' });
    }
});

// Route to add a new patient (for admin and staff)
router.post('/', protect, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the protect middleware
        const {
            fullname, identity, gender, password, email, phone_number,
            diagnosis, house_number, surbub, municipality, city,
            nok_fullname, nok_phone, nok_email
        } = req.body;

        if (!fullname || !fullname.trim() ||
            !identity || !identity.trim() ||
            !phone_number || !phone_number.trim() ||
            !password || !password.trim()) {
            return res.status(400).json({ message: 'Please provide all required fields: fullname, identity, phone_number, and password' });
        }

        // Validate identity (exactly 13 digits) to match database constraints
        if (!/^[0-9]{13}$/.test(identity.trim())) {
            return res.status(400).json({ message: 'Identity number must be exactly 13 digits' });
        }

        // Validate phone number (exactly 10 digits) to match database constraints
        if (!/^[0-9]{10}$/.test(phone_number.trim())) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Check if patient identity is already registered
        const patientExists = await pool.query(
            'SELECT 1 FROM users.patients WHERE identity = $1',
            [identity.trim()]
        );
        if (patientExists.rows.length > 0) {
            return res.status(400).json({ message: 'A patient with this identity number is already registered' });
        }

        // Hash the password for login
        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        const result = await pool.query(
            `INSERT INTO users.patients (
                fullname, identity, gender, password, email, phone_number,
                diagnosis, house_number, surbub, municipality, city,
                nok_fullname, nok_phone, nok_email, registra_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [
                fullname.trim(),
                identity.trim(),
                gender ? gender.trim() : null,
                hashedPassword,
                email ? email.trim() : null,
                phone_number.trim(),
                diagnosis ? diagnosis.trim() : null,
                house_number ? house_number.trim() : null,
                surbub ? surbub.trim() : null,
                municipality ? municipality.trim() : null,
                city ? city.trim() : null,
                nok_fullname ? nok_fullname.trim() : null,
                nok_phone ? nok_phone.trim() : null,
                nok_email ? nok_email.trim() : null,
                user.id
            ]
        );

        res.status(201).json({ patient: result.rows[0] });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ message: 'Error adding patient' });
    }
});

export default router;
