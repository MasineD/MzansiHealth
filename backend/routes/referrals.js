// =================== Referrals Routes ===================
import express from 'express';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';
import { sendSMS } from '../utils/sms.js';

const router = express.Router();

// Generate a random 6-character alphanumeric key
const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 6; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
};

// Helper query block to map patient/referrer names, roles, and source organization
const buildReferralsSelectQuery = (whereClause = '') => {
    return `
        SELECT r.*,
          COALESCE(
            (SELECT fullname FROM users.patients WHERE id = r.patient_id),
            (SELECT fullname FROM users.user_profiles WHERE id = r.patient_id),
            (SELECT fullname FROM users.community_health_workers WHERE id = r.patient_id)
          ) AS patient_name,
          COALESCE(
            (SELECT identity FROM users.patients WHERE id = r.patient_id),
            (SELECT identity FROM users.user_profiles WHERE id = r.patient_id),
            (SELECT identity FROM users.community_health_workers WHERE id = r.patient_id)
          ) AS patient_identity,
          (SELECT fullname FROM users.user_profiles WHERE id = r.referrer_id) AS referrer_name,
          CASE LOWER((SELECT role FROM users.user_profiles WHERE id = r.referrer_id))
            WHEN 'admin' THEN 'Administrator'
            WHEN 'staff' THEN 'Staff Member'
            ELSE 'Referrer'
          END AS referrer_role,
          (SELECT organization FROM users.user_profiles WHERE id = r.referrer_id) AS organization_from
        FROM todos.referrals r
        ${whereClause}
        ORDER BY r.created_at DESC
    `;
};

// Retrieve referrals list with role-specific filters and key redaction
router.get('/', protect, async (req, res) => {
    try {
        let queryText = '';
        let queryParams = [];

        if (req.user.role === 'admin') {
            // Admins see all referrals to their organization, or created by staff under their organization
            queryText = buildReferralsSelectQuery(`
                WHERE LOWER(r.organization_to) = LOWER($1)
                   OR r.referrer_id IN (
                       SELECT id FROM users.user_profiles 
                       WHERE LOWER(organization) = LOWER($2)
                   )
            `);
            queryParams = [req.user.organization || '', req.user.organization || ''];
        } else if (req.user.role === 'staff') {
            // Staff see only referrals they are associated with (created by them OR referred to them)
            queryText = buildReferralsSelectQuery(`
                WHERE r.referrer_id = $1 
                   OR LOWER(r.staff_to) = LOWER($2)
            `);
            queryParams = [req.user.id, req.user.fullname || ''];
        } else {
            // Patients see only referrals associated with them
            queryText = buildReferralsSelectQuery('WHERE r.patient_id = $1');
            queryParams = [req.user.id];
        }

        const result = await pool.query(queryText, queryParams);

        // Security check: only the patient can see their referral key
        const sanitizedRows = result.rows.map(row => {
            if (Number(row.patient_id) !== Number(req.user.id)) {
                delete row.referral_key;
            }
            return row;
        });

        return res.json({ referrals: sanitizedRows });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        return res.status(500).json({ message: 'Server error fetching referrals' });
    }
});

// Create a new referral (all registered users except patients can make referrals)
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role?.toLowerCase() === 'patient') {
            return res.status(403).json({ message: 'Access denied. Patients cannot create referrals.' });
        }

        const { patient_id, organization_to, department_to, staff_to, reason, arrival_date } = req.body;

        if (!patient_id || !organization_to || !organization_to.trim() || !department_to || !department_to.trim() || !reason || !reason.trim() || !arrival_date) {
            return res.status(400).json({ message: 'All fields are required: patient_id, organization_to, department_to, reason, and arrival_date.' });
        }

        const referralDateStr = arrival_date.substring(0, 10);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (referralDateStr < todayStr) {
            return res.status(400).json({ message: 'Referral arrival date cannot be in the past' });
        }

        // Check role-based constraints:
        // Non-admin roles can only refer patients, whereas admins can refer both patients and community health workers.
        if (req.user.role?.toLowerCase() !== 'admin') {
            // Verify patient_id exists in users.patients table
            const patientCheck = await pool.query('SELECT 1 FROM users.patients WHERE id = $1', [patient_id]);
            if (patientCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Access denied. Only patients can be referred.' });
            }
        } else {
            // Verify patient_id exists in users.patients OR users.community_health_workers
            const patientCheck = await pool.query('SELECT 1 FROM users.patients WHERE id = $1', [patient_id]);
            const chwCheck = await pool.query('SELECT 1 FROM users.community_health_workers WHERE id = $1', [patient_id]);
            if (patientCheck.rows.length === 0 && chwCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid patient selection. Admins can only refer patients and community health workers.' });
            }
        }

        // Fetch the referred user's unique fulfillment code from patients, CHWs, or user profiles
        let patientCode = null;
        const patientCodeRes = await pool.query('SELECT fulfillment_code FROM users.patients WHERE id = $1', [patient_id]);
        if (patientCodeRes.rows.length > 0) {
            patientCode = patientCodeRes.rows[0].fulfillment_code;
        } else {
            const chwCodeRes = await pool.query('SELECT fulfillment_code FROM users.community_health_workers WHERE id = $1', [patient_id]);
            if (chwCodeRes.rows.length > 0) {
                patientCode = chwCodeRes.rows[0].fulfillment_code;
            } else {
                const userCodeRes = await pool.query('SELECT fulfillment_code FROM users.user_profiles WHERE id = $1', [patient_id]);
                if (userCodeRes.rows.length > 0) {
                    patientCode = userCodeRes.rows[0].fulfillment_code;
                }
            }
        }

        const referral_key = patientCode || generateKey();

        const result = await pool.query(
            `INSERT INTO todos.referrals (patient_id, organization_to, department_to, staff_to, reason, arrival_date, status, referral_key, referrer_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                patient_id,
                organization_to.trim(),
                department_to.trim(),
                staff_to ? staff_to.trim() : null,
                reason.trim(),
                arrival_date,
                'pending',
                referral_key,
                req.user.id
            ]
        );

        const completeResult = await pool.query(
            buildReferralsSelectQuery('WHERE r.id = $1'),
            [result.rows[0].id]
        );

        // Sanitize return values (hide key if recipient is not patient)
        const responseData = completeResult.rows[0];
        if (Number(responseData.patient_id) !== Number(req.user.id)) {
            delete responseData.referral_key;
        }

        // Trigger notifications for both the referred patient/CHW, the creator/referrer user, and destination staff
        const createNotification = req.app.get('createNotification');
        if (createNotification) {
            const referrerChatId = `user_${req.user.id}`;
            const isPatient = await pool.query('SELECT 1 FROM users.patients WHERE id = $1', [patient_id]).then(r => r.rows.length > 0);
            const patientChatId = `${isPatient ? 'patient' : 'chw'}_${patient_id}`;
            const patientName = responseData.patient_name || 'Patient';
            const destOrg = organization_to.trim();

            // Notify creator
            createNotification(
                referrerChatId,
                'Referral Logged',
                `You successfully referred ${patientName} to "${destOrg}" (${department_to.trim()}).`
            );

            // Notify referred patient/CHW
            createNotification(
                patientChatId,
                'New Referral Received',
                `A new referral has been logged for you to "${destOrg}" (${department_to.trim()}) by ${req.user.fullname || 'your health provider'}.`
            );

            // Notify destination staff if assigned
            if (staff_to) {
                pool.query(
                    "SELECT id FROM users.user_profiles WHERE LOWER(fullname) = LOWER($1) AND LOWER(role) = 'staff'",
                    [staff_to.trim()]
                ).then(staffResult => {
                    if (staffResult.rows.length > 0) {
                        const staffUserId = `user_${staffResult.rows[0].id}`;
                        createNotification(
                            staffUserId,
                            'New Referral Assigned',
                            `A new referral for ${patientName} has been assigned to you at "${destOrg}" (${department_to.trim()}) by ${req.user.fullname || 'another provider'}.`
                        );
                    }
                }).catch(err => {
                    console.error('Error notifying target referral staff:', err);
                });
            }
        }

        // SMS notification dispatch logic (specific to patients)
        pool.query(
            "SELECT fullname, phone_number, nok_fullname, nok_phone FROM users.patients WHERE id = $1",
            [patient_id]
        ).then(patientQuery => {
            if (patientQuery.rows.length > 0) {
                const patient = patientQuery.rows[0];
                const destOrg = organization_to.trim();

                // 1. Send SMS to Patient containing referral key
                const patientSmsBody = `Hello ${patient.fullname}, a new referral has been logged for you to "${destOrg}" (${department_to.trim()}). Your verification key is: ${referral_key}.`;
                sendSMS(patient.phone_number, patientSmsBody);

                // 2. Send SMS to Next of Kin containing referral details
                if (patient.nok_phone) {
                    const nokSmsBody = `Hello ${patient.nok_fullname}, this is to inform you that a referral has been logged for ${patient.fullname} to "${destOrg}" (${department_to.trim()}) expected on ${new Date(arrival_date).toLocaleDateString()}.`;
                    sendSMS(patient.nok_phone, nokSmsBody);
                }
            }
        }).catch(err => {
            console.error("Error dispatching referral SMS notifications:", err);
        });

        // Return response without the key, as creator must not see the key
        return res.status(201).json({ referral: responseData });
    } catch (error) {
        console.error('Error creating referral:', error);
        return res.status(500).json({ message: 'Server error creating referral' });
    }
});

// Update a referral
router.put('/:id', protect, async (req, res) => {
    try {
        if (req.user.role?.toLowerCase() === 'patient') {
            return res.status(403).json({ message: 'Access denied. Patients cannot edit referrals.' });
        }

        const { id } = req.params;
        const { patient_id, organization_to, department_to, staff_to, reason, arrival_date } = req.body;

        if (!patient_id || !organization_to || !organization_to.trim() || !department_to || !department_to.trim() || !reason || !reason.trim() || !arrival_date) {
            return res.status(400).json({ message: 'All fields are required: patient_id, organization_to, department_to, reason, and arrival_date.' });
        }

        const referralDateStr = arrival_date.substring(0, 10);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (referralDateStr < todayStr) {
            return res.status(400).json({ message: 'Referral arrival date cannot be in the past' });
        }

        // Check role-based constraints
        if (req.user.role?.toLowerCase() !== 'admin') {
            const patientCheck = await pool.query('SELECT 1 FROM users.patients WHERE id = $1', [patient_id]);
            if (patientCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Access denied. Only patients can be referred.' });
            }
        } else {
            const patientCheck = await pool.query('SELECT 1 FROM users.patients WHERE id = $1', [patient_id]);
            const chwCheck = await pool.query('SELECT 1 FROM users.community_health_workers WHERE id = $1', [patient_id]);
            if (patientCheck.rows.length === 0 && chwCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid patient selection. Admins can only refer patients and community health workers.' });
            }
        }

        const referralResult = await pool.query('SELECT * FROM todos.referrals WHERE id = $1', [id]);
        if (referralResult.rows.length === 0) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        const referral = referralResult.rows[0];

        // A fulfilled referral cannot be edited
        if (referral.status === 'fulfilled') {
            return res.status(400).json({ message: 'Access denied. A fulfilled referral cannot be edited.' });
        }

        // Guard: receiver cannot edit the referral
        const isReceiver = (req.user.organization && referral.organization_to && req.user.organization.trim().toLowerCase() === referral.organization_to.trim().toLowerCase()) ||
                           (req.user.fullname && referral.staff_to && req.user.fullname.trim().toLowerCase() === referral.staff_to.trim().toLowerCase());
        if (isReceiver) {
            return res.status(403).json({ message: 'Access denied. The receiver of a referral cannot edit or delete it.' });
        }

        // Authorization checks: Only the creator of the referral can edit it
        const isCreator = Number(referral.referrer_id) === Number(req.user.id);
        if (!isCreator) {
            return res.status(403).json({ message: 'Access denied. Only the creator of this referral can edit it.' });
        }

        await pool.query(
            `UPDATE todos.referrals 
             SET patient_id = $1, organization_to = $2, department_to = $3, staff_to = $4, reason = $5, arrival_date = $6
             WHERE id = $7`,
            [patient_id, organization_to.trim(), department_to.trim(), staff_to ? staff_to.trim() : null, reason.trim(), arrival_date, id]
        );

        const completeResult = await pool.query(
            buildReferralsSelectQuery('WHERE r.id = $1'),
            [id]
        );

        const responseData = completeResult.rows[0];
        if (Number(responseData.patient_id) !== Number(req.user.id)) {
            delete responseData.referral_key;
        }

        return res.json({ referral: responseData });
    } catch (error) {
        console.error('Error updating referral:', error);
        return res.status(500).json({ message: 'Server error updating referral' });
    }
});

// Delete a referral
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user.role?.toLowerCase() === 'patient') {
            return res.status(403).json({ message: 'Access denied. Patients cannot delete referrals.' });
        }

        const { id } = req.params;

        const referralResult = await pool.query('SELECT * FROM todos.referrals WHERE id = $1', [id]);
        if (referralResult.rows.length === 0) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        const referral = referralResult.rows[0];

        // Guard: receiver cannot delete the referral
        const isReceiver = (req.user.organization && referral.organization_to && req.user.organization.trim().toLowerCase() === referral.organization_to.trim().toLowerCase()) ||
                           (req.user.fullname && referral.staff_to && req.user.fullname.trim().toLowerCase() === referral.staff_to.trim().toLowerCase());
        if (isReceiver) {
            return res.status(403).json({ message: 'Access denied. The receiver of a referral cannot edit or delete it.' });
        }

        // Authorization checks: Only the creator of the referral can delete it
        const isCreator = Number(referral.referrer_id) === Number(req.user.id);
        if (!isCreator) {
            return res.status(403).json({ message: 'Access denied. Only the creator of this referral can delete it.' });
        }

        await pool.query('DELETE FROM todos.referrals WHERE id = $1', [id]);
        return res.json({ message: 'Referral deleted successfully', id });
    } catch (error) {
        console.error('Error deleting referral:', error);
        return res.status(500).json({ message: 'Server error deleting referral' });
    }
});

// Fulfill a referral (Admin and Staff only, requires patient's key)
router.put('/:id/fulfill', protect, async (req, res) => {
    try {
        if (!['admin', 'staff'].includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied. Only Admins and Staff can fulfill referrals.' });
        }

        const { id } = req.params;
        const { referral_key } = req.body;

        if (!referral_key || !referral_key.trim()) {
            return res.status(400).json({ message: 'Referral fulfillment key is required.' });
        }

        const referralResult = await pool.query('SELECT * FROM todos.referrals WHERE id = $1', [id]);
        if (referralResult.rows.length === 0) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        const referral = referralResult.rows[0];

        // Fulfill authorization (only staff or admins of organization_to can fulfill)
        const isAuthorizedOrg = req.user.organization?.toLowerCase() === referral.organization_to?.toLowerCase();
        if (!isAuthorizedOrg) {
            return res.status(403).json({ message: 'Access denied. Only staff or admins of the destination organization can fulfill this referral.' });
        }

        // Validate key
        if (referral.referral_key?.trim().toLowerCase() !== referral_key.trim().toLowerCase()) {
            return res.status(400).json({ message: 'Invalid referral verification key. Fulfillment rejected.' });
        }

        await pool.query(
            `UPDATE todos.referrals 
             SET status = 'fulfilled' 
             WHERE id = $1`,
            [id]
        );

        const completeResult = await pool.query(
            buildReferralsSelectQuery('WHERE r.id = $1'),
            [id]
        );

        const responseData = completeResult.rows[0];
        if (Number(responseData.patient_id) !== Number(req.user.id)) {
            delete responseData.referral_key;
        }

        return res.json({ referral: responseData });
    } catch (error) {
        console.error('Error fulfilling referral:', error);
        return res.status(500).json({ message: 'Server error fulfilling referral' });
    }
});

export default router;
