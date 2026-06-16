// =================== Patients Routes ===================
import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';
import { sendSMS } from '../utils/sms.js';

const router = express.Router();

// Route to get all patients (for admin, staff, and chw)
router.get('/', protect, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the protect middleware
        const role = user.role?.toLowerCase();
        const profession = user.profession?.toLowerCase();
        let patients;

        if (role === 'chw' || (role === 'staff' && ['doctor', 'nurse', 'social worker'].includes(profession))) {
            // New logic: patients who made appointments with them or were referred to them
            const result = await pool.query(
                `SELECT * FROM users.patients 
                 WHERE id IN (
                     SELECT visitor_id FROM todos.appointments 
                     WHERE care_giver = $1
                 )
                 OR id IN (
                     SELECT patient_id FROM todos.referrals 
                     WHERE LOWER(staff_to) = LOWER($2)
                 )
                 ORDER BY created_at DESC`,
                [user.id.toString(), (user.fullname || '').trim()]
            );
            patients = result.rows;
        } else if (role === 'admin') {
            // Admin can see patients they registered
            const result = await pool.query('SELECT * FROM users.patients WHERE registra_id = $1 ORDER BY created_at DESC', [user.id]);
            patients = result.rows;
        } else {
            // Staff/Other can see patients of their organization (registered by admins of the same organization)
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

// Helper to get next Monday's date
function getNextMonday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay();
    let daysToAdd = 1 - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysToAdd);
    return nextMonday;
}

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

// Route to add a new patient (for admin and staff)
router.post('/', protect, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the protect middleware
        const {
            fullname, identity, gender, password, email, phone_number,
            diagnosis, house_number, surbub, municipality, city,
            nok_fullname, nok_phone, nok_email, chw_id
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
        const fulfillment_code = await generateUniqueFulfillmentCode();

        const result = await pool.query(
            `INSERT INTO users.patients (
                fullname, identity, gender, password, email, phone_number,
                diagnosis, house_number, surbub, municipality, city,
                nok_fullname, nok_phone, nok_email, registra_id, chw_id,
                fulfillment_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
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
                user.id,
                chw_id ? parseInt(chw_id, 10) : null,
                fulfillment_code
            ]
        );

        const newPatient = result.rows[0];

        // 1. Create a default record entry
        const defaultRecordRes = await pool.query(
            `INSERT INTO patients.records (
                patient_id, blood_group, weight, height, temperature, blood_pressure, heart_rate,
                symptoms, allergies, diagnosis, procedures, admission_date, prescription,
                long_term_treatment, care_giver
            ) VALUES ($1, null, null, null, null, null, null, null, null, $2, null, CURRENT_TIMESTAMP, null, false, null)
            RETURNING *`,
            [newPatient.id, newPatient.diagnosis || 'Initial Admission Check']
        );
        
        const defaultRecord = defaultRecordRes.rows[0];

        // 2. Create a default weekly routine for Monday
        const nextMonday = getNextMonday();
        await pool.query(
            `INSERT INTO patients.routines (
                record_id, date, description, attended, routine_range, routine_day
            ) VALUES ($1, $2, $3, false, 'weekly', 'Monday')`,
            [defaultRecord.id, nextMonday, 'Weekly health condition check-in']
        );

        // SMS notification dispatch logic for registration
        try {
            const orgName = req.user.organization || 'Mzansi Health';
            
            // 1. Send SMS to Patient
            const patientSmsBody = `Hello ${newPatient.fullname}, you have been successfully registered on Mzansi Health. You can access your portal using your ID number: ${newPatient.identity}.`;
            sendSMS(newPatient.phone_number, patientSmsBody);

            // 2. Send SMS to Next of Kin
            if (newPatient.nok_phone) {
                const nokSmsBody = `Hello ${newPatient.nok_fullname}, this is to inform you that ${newPatient.fullname} has been registered on Mzansi Health under ${orgName}.`;
                sendSMS(newPatient.nok_phone, nokSmsBody);
            }
        } catch (smsErr) {
            console.error("Error dispatching registration SMS notifications:", smsErr);
        }

        res.status(201).json({ patient: newPatient });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ message: 'Error adding patient' });
    }
});

// Route to edit patient (Admins can assign CHWs and update other fields)
router.put('/:id', protect, async (req, res) => {
    try {
        const user = req.user;
        const patientId = req.params.id;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only Admins can edit patient details.' });
        }

        const {
            fullname, identity, gender, email, phone_number,
            diagnosis, house_number, surbub, municipality, city,
            nok_fullname, nok_phone, nok_email, chw_id
        } = req.body;

        if (!fullname || !fullname.trim() ||
            !identity || !identity.trim() ||
            !phone_number || !phone_number.trim()) {
            return res.status(400).json({ message: 'Please provide all required fields: fullname, identity, and phone_number' });
        }

        // Validate identity (exactly 13 digits)
        if (!/^[0-9]{13}$/.test(identity.trim())) {
            return res.status(400).json({ message: 'Identity number must be exactly 13 digits' });
        }

        // Validate phone number (exactly 10 digits)
        if (!/^[0-9]{10}$/.test(phone_number.trim())) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Check if patient identity is already registered under another ID
        const identityCheck = await pool.query(
            'SELECT 1 FROM users.patients WHERE identity = $1 AND id <> $2',
            [identity.trim(), patientId]
        );
        if (identityCheck.rows.length > 0) {
            return res.status(400).json({ message: 'A patient with this identity number is already registered' });
        }

        const result = await pool.query(
            `UPDATE users.patients SET
                fullname = $1, identity = $2, gender = $3, email = $4, phone_number = $5,
                diagnosis = $6, house_number = $7, surbub = $8, municipality = $9, city = $10,
                nok_fullname = $11, nok_phone = $12, nok_email = $13, chw_id = $14
             WHERE id = $15 RETURNING *`,
            [
                fullname.trim(),
                identity.trim(),
                gender ? gender.trim() : null,
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
                chw_id ? parseInt(chw_id, 10) : null,
                patientId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ patient: result.rows[0] });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ message: 'Error updating patient' });
    }
});

export default router;
