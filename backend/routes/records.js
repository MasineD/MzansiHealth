import express from 'express';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate the next routine occurrence date
function calculateNextRoutineDate(range, day) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (range === 'weekly') {
        const weekdays = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
        const targetDayNum = weekdays[day.toLowerCase().trim()];
        if (targetDayNum === undefined) return today;

        const currentDayNum = today.getDay();
        let daysToAdd = targetDayNum - currentDayNum;
        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysToAdd);
        return nextDate;
    } else if (range === 'monthly') {
        const targetDay = parseInt(day, 10);
        if (isNaN(targetDay) || targetDay < 1 || targetDay > 28) return today;

        const nextDate = new Date(today);
        nextDate.setDate(targetDay);
        if (nextDate <= today) {
            nextDate.setMonth(today.getMonth() + 1);
        }
        return nextDate;
    }
    return today;
}

// 4. Create routine under a record (Only Admin, Staff, CHW)
router.post('/routines', protect, async (req, res) => {
    try {
        if (!['admin', 'staff', 'chw'].includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied. You do not have permissions to manage routines.' });
        }

        const { record_id, routine_range, routine_day, description, attended } = req.body;

        if (!record_id || !routine_range || !routine_day || !description) {
            return res.status(400).json({ message: 'Fields record_id, routine_range, routine_day, and description are required.' });
        }

        const range = routine_range.toLowerCase().trim();
        if (!['weekly', 'monthly'].includes(range)) {
            return res.status(400).json({ message: 'Routine range must be either "weekly" or "monthly".' });
        }

        if (range === 'weekly') {
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            if (!validDays.includes(routine_day.toLowerCase().trim())) {
                return res.status(400).json({ message: 'Weekly routines can only be scheduled on weekdays (Monday to Friday).' });
            }
        } else if (range === 'monthly') {
            const dayNum = parseInt(routine_day, 10);
            if (isNaN(dayNum) || dayNum < 1 || dayNum > 28) {
                return res.status(400).json({ message: 'Monthly routines can only be scheduled between day 1 and 28.' });
            }
        }

        const nextDate = calculateNextRoutineDate(range, routine_day);

        const result = await pool.query(
            `INSERT INTO patients.routines (record_id, date, description, attended, routine_range, routine_day)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [record_id, nextDate, description.trim(), attended || false, routine_range.trim(), routine_day.toString().trim()]
        );

        return res.status(201).json({ routine: result.rows[0] });
    } catch (error) {
        console.error('Error creating routine:', error);
        return res.status(500).json({ message: 'Server error creating routine' });
    }
});

// 5. Update a routine
router.put('/routines/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        if (!['admin', 'staff', 'chw'].includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied. You do not have permissions to manage routines.' });
        }

        const { routine_range, routine_day, description, attended, patient_identity } = req.body;

        if (!routine_range || !routine_day || !description) {
            return res.status(400).json({ message: 'Fields routine_range, routine_day, and description are required.' });
        }

        // Fetch existing routine to check state
        const routineQuery = await pool.query('SELECT * FROM patients.routines WHERE id = $1', [id]);
        if (routineQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }
        const existingRoutine = routineQuery.rows[0];

        // Guard: After a routine is marked as attended, it can no longer be edited.
        if (existingRoutine.attended === true) {
            return res.status(400).json({ message: 'After a routine is marked as attended, it can no longer be edited.' });
        }

        // Verification logic for marking routine as attended
        const isMarkingAttended = (attended === true || attended === 'true');
        if (isMarkingAttended) {
            if (!patient_identity || !patient_identity.trim()) {
                return res.status(400).json({ message: 'Verification required: Please provide the patient\'s identity number to mark this routine as attended.' });
            }

            // Fetch patient identity from DB
            const patientQuery = await pool.query(
                `SELECT p.identity FROM users.patients p
                 JOIN patients.records r ON r.patient_id = p.id
                 WHERE r.id = $1`,
                [existingRoutine.record_id]
            );
            if (patientQuery.rows.length === 0) {
                return res.status(404).json({ message: 'Patient not found for this routine.' });
            }
            const dbIdentity = patientQuery.rows[0].identity;
            if (dbIdentity.trim().toLowerCase() !== patient_identity.trim().toLowerCase()) {
                return res.status(400).json({ message: 'Verification failed: Provided patient identity number does not match our database records.' });
            }
        }

        const range = routine_range.toLowerCase().trim();
        if (!['weekly', 'monthly'].includes(range)) {
            return res.status(400).json({ message: 'Routine range must be either "weekly" or "monthly".' });
        }

        if (range === 'weekly') {
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            if (!validDays.includes(routine_day.toLowerCase().trim())) {
                return res.status(400).json({ message: 'Weekly routines can only be scheduled on weekdays (Monday to Friday).' });
            }
        } else if (range === 'monthly') {
            const dayNum = parseInt(routine_day, 10);
            if (isNaN(dayNum) || dayNum < 1 || dayNum > 28) {
                return res.status(400).json({ message: 'Monthly routines can only be scheduled between day 1 and 28.' });
            }
        }

        const nextDate = calculateNextRoutineDate(range, routine_day);

        const result = await pool.query(
            `UPDATE patients.routines 
             SET date = $1, description = $2, attended = $3, routine_range = $4, routine_day = $5
             WHERE id = $6
             RETURNING *`,
            [nextDate, description.trim(), attended || false, routine_range.trim(), routine_day.toString().trim(), id]
        );

        return res.json({ routine: result.rows[0] });
    } catch (error) {
        console.error('Error updating routine:', error);
        return res.status(500).json({ message: 'Server error updating routine' });
    }
});

// 1. Retrieve health records, routines, appointments, and referrals for a patient
router.get('/:patientId', protect, async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId, 10);
        if (isNaN(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID' });
        }

        const user = req.user;
        const role = user.role?.toLowerCase();

        // A. Authorization check
        let isAuthorized = false;

        if (role === 'patient') {
            // Patients can only see their own records
            if (Number(user.id) === patientId) {
                isAuthorized = true;
            }
        } else if (role === 'admin') {
            // Admin can see if:
            // 1. Patient belongs to their organization (registrar matches Admin's organization)
            const patientCheck = await pool.query(
                `SELECT 1 FROM users.patients 
                 WHERE id = $1 AND registra_id IN (
                     SELECT id FROM users.user_profiles 
                     WHERE LOWER(organization) = LOWER($2) AND role = 'admin'
                 )`,
                [patientId, user.organization || '']
            );
            
            // 2. OR patient was referred to their organization
            const referralCheck = await pool.query(
                `SELECT 1 FROM todos.referrals 
                 WHERE patient_id = $1 AND LOWER(organization_to) = LOWER($2)`,
                [patientId, user.organization || '']
            );

            if (patientCheck.rows.length > 0 || referralCheck.rows.length > 0) {
                isAuthorized = true;
            }
        } else if (role === 'staff') {
            // Staff can see if:
            // 1. Patient has a referral assigned to them
            const referralCheck = await pool.query(
                `SELECT 1 FROM todos.referrals 
                 WHERE patient_id = $1 AND LOWER(staff_to) = LOWER($2)`,
                [patientId, user.fullname || '']
            );

            // 2. OR patient has an appointment assigned to them
            const appointmentCheck = await pool.query(
                `SELECT 1 FROM todos.appointments 
                 WHERE visitor_id = $1 AND care_giver = $2`,
                [patientId, user.id.toString()]
            );

            if (referralCheck.rows.length > 0 || appointmentCheck.rows.length > 0) {
                isAuthorized = true;
            }
        } else if (role === 'chw') {
            // CHW can see if patient is assigned to them (chw_id = chw.id)
            const patientCheck = await pool.query(
                `SELECT 1 FROM users.patients WHERE id = $1 AND chw_id = $2`,
                [patientId, user.id]
            );
            if (patientCheck.rows.length > 0) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Access denied. You do not have permissions to view this patient\'s record.' });
        }

        // B. Fetch record entries
        const recordsRes = await pool.query(
            `SELECT * FROM patients.records WHERE patient_id = $1 ORDER BY admission_date DESC`,
            [patientId]
        );
        const records = recordsRes.rows;

        // C. Fetch routines associated with these records
        let routines = [];
        if (records.length > 0) {
            const recordIds = records.map(r => r.id);
            const routinesRes = await pool.query(
                `SELECT * FROM patients.routines WHERE record_id = ANY($1) ORDER BY create_at DESC`,
                [recordIds]
            );
            routines = routinesRes.rows;
        }

        // D. Fetch appointments and referrals to support period filters on the client
        const appointmentsRes = await pool.query(
            `SELECT a.*, 
                    (SELECT fullname FROM users.user_profiles WHERE id = CASE WHEN a.care_giver ~ '^[0-9]+$' THEN CAST(a.care_giver AS BIGINT) ELSE NULL END) AS care_giver_name
             FROM todos.appointments a 
             WHERE visitor_id = $1 ORDER BY date_time DESC`,
            [patientId]
        );

        const referralsRes = await pool.query(
            `SELECT r.*,
                    (SELECT fullname FROM users.user_profiles WHERE id = r.referrer_id) AS referrer_name,
                    CASE LOWER((SELECT role FROM users.user_profiles WHERE id = r.referrer_id))
                      WHEN 'admin' THEN 'Administrator'
                      WHEN 'staff' THEN 'Staff Member'
                      ELSE 'Referrer'
                    END AS referrer_role,
                    (SELECT organization FROM users.user_profiles WHERE id = r.referrer_id) AS organization_from
             FROM todos.referrals r 
             WHERE patient_id = $1 ORDER BY created_at DESC`,
            [patientId]
        );

        // Retrieve organization name and patient details
        const patientInfoRes = await pool.query(
            `SELECT p.id, p.fullname, p.identity, p.gender, p.email, p.phone_number,
                    p.nok_fullname, p.nok_phone, p.nok_email, p.diagnosis,
                    p.house_number, p.surbub, p.municipality, p.city, p.chw_id,
                    COALESCE(
                        (SELECT organization FROM users.user_profiles WHERE id = p.registra_id),
                        'Mzansi Health'
                    ) AS organization_name
             FROM users.patients p WHERE p.id = $1`,
            [patientId]
        );
        const patientInfo = patientInfoRes.rows[0] || null;
        const orgWatermark = patientInfo ? patientInfo.organization_name : 'Mzansi Health';

        return res.json({
            records,
            routines,
            appointments: appointmentsRes.rows,
            referrals: referralsRes.rows,
            organizationWatermark: orgWatermark,
            patientInfo
        });
    } catch (error) {
        console.error('Error fetching patient records:', error);
        return res.status(500).json({ message: 'Server error fetching health record' });
    }
});

// 2. Create a new health record entry (Only Admin, Staff, CHW)
router.post('/:patientId', protect, async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId, 10);
        if (isNaN(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID' });
        }

        if (!['admin', 'staff', 'chw'].includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied. You do not have permissions to create records.' });
        }

        const {
            blood_group, weight, height, temperature, blood_pressure, heart_rate,
            symptoms, allergies, diagnosis, procedures, admission_date, release_date,
            prescription, long_term_treatment, care_giver
        } = req.body;

        const result = await pool.query(
            `INSERT INTO patients.records (
                patient_id, blood_group, weight, height, temperature, blood_pressure, heart_rate,
                symptoms, allergies, diagnosis, procedures, admission_date, release_date,
                prescription, long_term_treatment, care_giver
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             RETURNING *`,
            [
                patientId, blood_group || null, weight || null, height || null, temperature || null,
                blood_pressure || null, heart_rate || null, symptoms || null, allergies || null,
                diagnosis || null, procedures || null, admission_date || new Date(), release_date || null,
                prescription || null, long_term_treatment || false, care_giver || null
            ]
        );

        return res.status(201).json({ record: result.rows[0] });
    } catch (error) {
        console.error('Error creating record:', error);
        return res.status(500).json({ message: 'Server error creating health record' });
    }
});

// 3. Edit a health record entry (Requires Name and Identity verification)
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        if (!['admin', 'staff', 'chw'].includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied. You do not have permissions to edit records.' });
        }

        const {
            patient_name, patient_identity, blood_group, weight, height, temperature,
            blood_pressure, heart_rate, symptoms, allergies, diagnosis, procedures,
            admission_date, release_date, prescription, long_term_treatment, care_giver
        } = req.body;

        // Verification validation: Name and Identity are required to edit
        if (!patient_name || !patient_name.trim() || !patient_identity || !patient_identity.trim()) {
            return res.status(400).json({ message: 'Verification required: Please provide the patient\'s name and identity number to edit.' });
        }

        // Check record exists
        const recordQuery = await pool.query('SELECT * FROM patients.records WHERE id = $1', [id]);
        if (recordQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Health record entry not found' });
        }
        const record = recordQuery.rows[0];

        // Verify that patient_name and patient_identity match users.patients table record
        const patientVerify = await pool.query(
            "SELECT 1 FROM users.patients WHERE id = $1 AND LOWER(fullname) = LOWER($2) AND LOWER(identity) = LOWER($3)",
            [record.patient_id, patient_name.trim(), patient_identity.trim()]
        );

        if (patientVerify.rows.length === 0) {
            return res.status(400).json({ message: 'Verification failed: Provided patient name and identity number do not match our database records.' });
        }

        // Apply update
        const result = await pool.query(
            `UPDATE patients.records 
             SET blood_group = $1, weight = $2, height = $3, temperature = $4, blood_pressure = $5, heart_rate = $6,
                 symptoms = $7, allergies = $8, diagnosis = $9, procedures = $10, admission_date = $11, release_date = $12,
                 prescription = $13, long_term_treatment = $14, care_giver = $15
             WHERE id = $16
             RETURNING *`,
            [
                blood_group || null, weight || null, height || null, temperature || null,
                blood_pressure || null, heart_rate || null, symptoms || null, allergies || null,
                diagnosis || null, procedures || null, admission_date || null, release_date || null,
                prescription || null, long_term_treatment || false, care_giver || null, id
            ]
        );

        return res.json({ record: result.rows[0] });
    } catch (error) {
        console.error('Error editing record:', error);
        return res.status(500).json({ message: 'Server error updating health record' });
    }
});

export default router;
