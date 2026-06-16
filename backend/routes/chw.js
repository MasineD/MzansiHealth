// =================== Community Health Workers Routes ===================
import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Get CHWs registered by the logged-in admin
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const result = await pool.query(
            `SELECT id, registra_id, employee_id, fullname, identity, email, phone_number, created_at 
             FROM users.community_health_workers 
             WHERE registra_id = $1 
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.json({ chws: result.rows });
    } catch (error) {
        console.error('Error fetching CHWs:', error);
        return res.status(500).json({ message: 'Server error fetching community health workers' });
    }
});

const generateUniqueFulfillmentCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const pRes = await pool.query("SELECT 1 FROM users.patients WHERE fulfillment_code = $1", [code]);
        const chwRes = await pool.query("SELECT 1 FROM users.community_health_workers WHERE fulfillment_code = $1", [code]);
        const userRes = await pool.query("SELECT 1 FROM users.user_profiles WHERE fulfillment_code = $1", [code]);
        if (pRes.rows.length === 0 && chwRes.rows.length === 0 && userRes.rows.length === 0) {
            isUnique = true;
        }
    }
    return code;
};

// Register a new CHW (admin only)
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const {
            employee_id, fullname, identity, password, email, phone_number
        } = req.body;

        // Validation for required fields
        if (!employee_id || !employee_id.trim() ||
            !fullname || !fullname.trim() ||
            !identity || !identity.trim() ||
            !password || !password.trim()) {
            return res.status(400).json({ message: 'Please provide all required fields: employee_id, fullname, identity, and password' });
        }

        // Validate identity (exactly 13 digits)
        if (!/^[0-9]{13}$/.test(identity.trim())) {
            return res.status(400).json({ message: 'Identity number must be exactly 13 digits' });
        }

        // Validate phone_number if provided (exactly 10 digits)
        if (phone_number && phone_number.trim() && !/^[0-9]{10}$/.test(phone_number.trim())) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Check if CHW identity is already registered
        const chwExists = await pool.query(
            'SELECT 1 FROM users.community_health_workers WHERE identity = $1',
            [identity.trim()]
        );
        if (chwExists.rows.length > 0) {
            return res.status(400).json({ message: 'A Community Health Worker with this identity number is already registered' });
        }

        // Hash the CHW's password
        const hashedPassword = await bcrypt.hash(password, 10);
        const fulfillment_code = await generateUniqueFulfillmentCode();

        // Insert new CHW into the database
        const result = await pool.query(
            `INSERT INTO users.community_health_workers (
                registra_id, employee_id, fullname, identity, password, email, phone_number, fulfillment_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, registra_id, employee_id, fullname, identity, email, phone_number, created_at, fulfillment_code`,
            [
                req.user.id,
                employee_id.trim(),
                fullname.trim(),
                identity.trim(),
                hashedPassword,
                (email && email.trim()) ? email.trim() : null,
                (phone_number && phone_number.trim()) ? phone_number.trim() : null,
                fulfillment_code
            ]
        );

        return res.status(201).json({ chw: result.rows[0] });
    } catch (error) {
        console.error('Error registering CHW:', error);
        return res.status(500).json({ message: 'Server error during CHW registration' });
    }
});

export default router;
