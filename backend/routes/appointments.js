// =================== Appointments Routes ===================
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

// Normalize date_time input so if time is missing, it defaults to 00:00:00
const normalizeDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const trimmed = dateTimeStr.trim();
    // Match YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return `${trimmed}T00:00:00`;
    }
    // Match YYYY-MM-DD HH:MM or YYYY-MM-DDTHH:MM
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}$/.test(trimmed)) {
        const normalized = trimmed.replace(' ', 'T');
        return `${normalized}:00`;
    }
    return trimmed.replace(' ', 'T');
};

// Format Date/Timestamp safely for SMS and notification messages
const formatAppointmentDateTime = (dateTimeVal) => {
    if (!dateTimeVal) return '';
    const dateObj = typeof dateTimeVal === 'string' ? new Date(dateTimeVal) : dateTimeVal;
    if (isNaN(dateObj.getTime())) return dateTimeVal.toString();
    
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
        // Return date only
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    return dateObj.toLocaleString();
};


// Retrieve care givers (staff members) for a given organization (public endpoint)
router.get('/public/caregivers', async (req, res) => {
    try {
        const { organization } = req.query;
        if (!organization) {
            return res.status(400).json({ message: 'Organization query parameter is required' });
        }

        const result = await pool.query(
            `SELECT id, fullname FROM users.user_profiles 
             WHERE LOWER(role) = 'staff' AND LOWER(organization) = LOWER($1)
             ORDER BY fullname ASC`,
            [organization.trim()]
        );
        return res.json({ caregivers: result.rows });
    } catch (error) {
        console.error('Error fetching public caregivers:', error);
        return res.status(500).json({ message: 'Server error fetching caregivers' });
    }
});

// Create a new public/guest appointment (unauthenticated)
router.post('/public', async (req, res) => {
    try {
        const { visitor_name, organization, care_giver, reason, date_time, contact_email, contact_phone } = req.body;

        if (!visitor_name || !visitor_name.trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }
        if (!organization || !organization.trim()) {
            return res.status(400).json({ message: 'Organization is required for scheduling an appointment' });
        }
        const normalizedDateTime = normalizeDateTime(date_time);
        if (!reason || !reason.trim() || !normalizedDateTime) {
            return res.status(400).json({ message: 'Please provide appointment reason and date_time' });
        }

        const appointmentDateStr = normalizedDateTime.substring(0, 10);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (appointmentDateStr < todayStr) {
            return res.status(400).json({ message: 'Appointment date cannot be in the past' });
        }
        if ((!contact_email || !contact_email.trim()) && (!contact_phone || !contact_phone.trim())) {
            return res.status(400).json({ message: 'Please provide either an email address or a phone number to receive the verification key' });
        }

        // Generate the 6-character key
        const appointment_key = generateKey();

        const result = await pool.query(
            `INSERT INTO todos.appointments (visitor_id, visitor_name, organization, care_giver, reason, date_time, status, appointment_key, contact_email, contact_phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                0, // visitor_id = 0 for unregistered/guest appointments
                visitor_name.trim(),
                organization.trim(),
                care_giver ? care_giver.toString().trim() : null,
                reason.trim(),
                normalizedDateTime,
                'pending',
                appointment_key,
                contact_email ? contact_email.trim() : null,
                contact_phone ? contact_phone.trim() : null
            ]
        );

        const createdId = result.rows[0].id;
        const completeResult = await pool.query(
            `SELECT a.*, 
                    COALESCE(
                        (SELECT fullname FROM users.user_profiles WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.patients WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.community_health_workers WHERE id = a.visitor_id),
                        a.visitor_name,
                        'Unregistered User'
                    ) AS visitor_name,
                    (SELECT fullname FROM users.user_profiles WHERE id = CASE WHEN a.care_giver ~ '^[0-9]+$' THEN CAST(a.care_giver AS BIGINT) ELSE NULL END) AS care_giver_name
             FROM todos.appointments a
             WHERE a.id = $1`,
            [createdId]
        );

        const appointmentData = completeResult.rows[0];

        // Trigger notifications to caregiver and admins
        const createNotification = req.app.get('createNotification');
        const formattedDate = formatAppointmentDateTime(normalizedDateTime);

        if (createNotification) {
            // Notify the caregiver if assigned
            if (care_giver) {
                createNotification(
                    `user_${care_giver}`,
                    'New Appointment Assigned',
                    `A new guest appointment has been scheduled and assigned to you on ${formattedDate}. Reason: "${reason.trim()}".`
                );
            }

            // Notify all admins of the organization
            try {
                const adminsResult = await pool.query(
                    `SELECT id FROM users.user_profiles WHERE LOWER(role) = 'admin' AND LOWER(organization) = LOWER($1)`,
                    [organization.trim()]
                );
                adminsResult.rows.forEach(admin => {
                    createNotification(
                        `user_${admin.id}`,
                        'New Guest Appointment Received',
                        `A new guest appointment has been booked for your organization on ${formattedDate}. Reason: "${reason.trim()}".`
                    );
                });
            } catch (err) {
                console.error('Error notifying admins of guest appointment:', err);
            }
        }

        // Send SMS containing appointment key if phone number provided
        if (contact_phone && contact_phone.trim()) {
            const smsBody = `Hello, your appointment at "${organization.trim()}" is scheduled for ${formattedDate}. Your verification key is: ${appointment_key}.`;
            sendSMS(contact_phone, smsBody);
        }

        // Log email simulation if email address provided
        if (contact_email && contact_email.trim()) {
            console.log(`[Email Sent] To: ${contact_email.trim()} | Body: Hello, your appointment at "${organization.trim()}" is scheduled for ${formattedDate}. Your verification key is: ${appointment_key}.`);
        }

        return res.status(201).json({ appointment: appointmentData });
    } catch (error) {
        console.error('Error creating public appointment:', error);
        return res.status(500).json({ message: 'Server error creating appointment' });
    }
});

// Retrieve care givers (staff members) for a given organization
router.get('/caregivers', protect, async (req, res) => {
    try {
        const { organization } = req.query;
        if (!organization) {
            return res.status(400).json({ message: 'Organization query parameter is required' });
        }

        const result = await pool.query(
            `SELECT id, fullname FROM users.user_profiles 
             WHERE LOWER(role) = 'staff' AND LOWER(organization) = LOWER($1)
             ORDER BY fullname ASC`,
            [organization.trim()]
        );
        return res.json({ caregivers: result.rows });
    } catch (error) {
        console.error('Error fetching caregivers:', error);
        return res.status(500).json({ message: 'Server error fetching caregivers' });
    }
});

// Retrieve appointments list with role-specific access and redacted keys
router.get('/', protect, async (req, res) => {
    try {
        let queryText = '';
        let queryParams = [];

        // Build the subquery to fetch the visitor name from the three possible tables
        const visitorSubquery = `
            COALESCE(
                (SELECT fullname FROM users.user_profiles WHERE id = a.visitor_id),
                (SELECT fullname FROM users.patients WHERE id = a.visitor_id),
                (SELECT fullname FROM users.community_health_workers WHERE id = a.visitor_id),
                a.visitor_name,
                'Unregistered User'
            ) AS visitor_name
        `;

        // Fetch the caregiver's fullname
        const caregiverSubquery = `
            (SELECT fullname FROM users.user_profiles WHERE id = CASE WHEN a.care_giver ~ '^[0-9]+$' THEN CAST(a.care_giver AS BIGINT) ELSE NULL END) AS care_giver_name
        `;

        if (req.user.role === 'admin') {
            // Admins see all appointments made to their organization
            queryText = `
                SELECT a.*, ${visitorSubquery}, ${caregiverSubquery}
                FROM todos.appointments a
                WHERE LOWER(a.organization) = LOWER($1)
                ORDER BY a.date_time DESC
            `;
            queryParams = [req.user.organization || ''];
        } else if (req.user.role === 'staff') {
            // Staff see appointments they created (visitor) or are assigned to (care_giver)
            queryText = `
                SELECT a.*, ${visitorSubquery}, ${caregiverSubquery}
                FROM todos.appointments a
                WHERE a.visitor_id = $1 OR a.care_giver = $2
                ORDER BY a.date_time DESC
            `;
            queryParams = [req.user.id, req.user.id.toString()];
        } else {
            // Patients & CHWs see appointments they created (visitor)
            queryText = `
                SELECT a.*, ${visitorSubquery}, ${caregiverSubquery}
                FROM todos.appointments a
                WHERE a.visitor_id = $1
                ORDER BY a.date_time DESC
            `;
            queryParams = [req.user.id];
        }

        const result = await pool.query(queryText, queryParams);

        // Security check: only the creator (visitor) can see the appointment key
        const sanitizedRows = result.rows.map(row => {
            if (Number(row.visitor_id) !== Number(req.user.id)) {
                delete row.appointment_key;
            }
            return row;
        });

        return res.json({ appointments: sanitizedRows });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ message: 'Server error fetching appointments' });
    }
});

// Create a new appointment
router.post('/', protect, async (req, res) => {
    try {
        const { organization, care_giver, reason, date_time } = req.body;

        const normalizedDateTime = normalizeDateTime(date_time);
        if (!reason || !reason.trim() || !normalizedDateTime) {
            return res.status(400).json({ message: 'Please provide appointment reason and date_time' });
        }

        const appointmentDateStr = normalizedDateTime.substring(0, 10);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (appointmentDateStr < todayStr) {
            return res.status(400).json({ message: 'Appointment date cannot be in the past' });
        }

        // Use requested organization or fall back to user's registered organization
        const finalOrganization = organization || req.user.organization;
        if (!finalOrganization) {
            return res.status(400).json({ message: 'Organization is required for scheduling an appointment' });
        }

        // Use user's unique fulfillment_code as appointment key, or generate fallback if not found
        const appointment_key = req.user.fulfillment_code || generateKey();

        const result = await pool.query(
            `INSERT INTO todos.appointments (visitor_id, organization, care_giver, reason, date_time, status, appointment_key)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                req.user.id,
                finalOrganization.trim(),
                care_giver ? care_giver.toString().trim() : null,
                reason.trim(),
                normalizedDateTime,
                'pending',
                appointment_key
            ]
        );

        // Fetch name mapping to return a complete record
        const createdId = result.rows[0].id;
        const completeResult = await pool.query(
            `SELECT a.*, 
                    COALESCE(
                        (SELECT fullname FROM users.user_profiles WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.patients WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.community_health_workers WHERE id = a.visitor_id),
                        a.visitor_name,
                        'Unregistered User'
                    ) AS visitor_name,
                    (SELECT fullname FROM users.user_profiles WHERE id = CASE WHEN a.care_giver ~ '^[0-9]+$' THEN CAST(a.care_giver AS BIGINT) ELSE NULL END) AS care_giver_name
             FROM todos.appointments a
             WHERE a.id = $1`,
            [createdId]
        );

        const appointmentData = completeResult.rows[0];

        // Trigger notifications
        const createNotification = req.app.get('createNotification');
        const formattedDate = formatAppointmentDateTime(normalizedDateTime);

        if (createNotification) {
            const visitorChatId = `${req.user.role === 'admin' || req.user.role === 'staff' ? 'user' : req.user.role}_${req.user.id}`;
            
            // Notify the patient/visitor
            createNotification(
                visitorChatId,
                'Appointment Scheduled',
                `A new appointment at "${finalOrganization.trim()}" has been scheduled for you on ${formattedDate}. Reason: "${reason.trim()}".`
            );

            // Notify the caregiver if assigned
            if (care_giver) {
                createNotification(
                    `user_${care_giver}`,
                    'New Appointment Assigned',
                    `You have been assigned as the caregiver for ${appointmentData.visitor_name}'s appointment on ${formattedDate}.`
                );
            }
        }

        // SMS notification dispatch logic (specific to patients)
        pool.query(
            "SELECT fullname, phone_number, nok_fullname, nok_phone FROM users.patients WHERE id = $1",
            [appointmentData.visitor_id]
        ).then(patientQuery => {
            if (patientQuery.rows.length > 0) {
                const patient = patientQuery.rows[0];

                // 1. Send SMS to Patient containing appointment key
                const patientSmsBody = `Hello ${patient.fullname}, your appointment at "${finalOrganization.trim()}" is scheduled for ${formattedDate}. Your verification key is: ${appointment_key}.`;
                sendSMS(patient.phone_number, patientSmsBody);

                // 2. Send SMS to Next of Kin containing appointment details
                if (patient.nok_phone) {
                    const nokSmsBody = `Hello ${patient.nok_fullname}, this is to inform you that ${patient.fullname} has scheduled an appointment at "${finalOrganization.trim()}" on ${formattedDate}. Reason: "${reason.trim()}".`;
                    sendSMS(patient.nok_phone, nokSmsBody);
                }
            }
        }).catch(err => {
            console.error("Error dispatching appointment SMS notifications:", err);
        });

        return res.status(201).json({ appointment: appointmentData });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ message: 'Server error creating appointment' });
    }
});

// Update appointment status (approve/cancel)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update. Must be approved or cancelled' });
        }

        const appointmentResult = await pool.query('SELECT * FROM todos.appointments WHERE id = $1', [id]);
        if (appointmentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = appointmentResult.rows[0];

        // Guard: an appointment cannot be cancelled when it has a status of fulfilled
        if (status === 'cancelled' && appointment.status === 'fulfilled') {
            return res.status(400).json({ message: 'An appointment cannot be cancelled when it has a status of fulfilled.' });
        }

        // Authorization checks
        const isAdminOfOrg = req.user.role === 'admin' && req.user.organization?.toLowerCase() === appointment.organization?.toLowerCase();
        const isAssignedCaregiver = appointment.care_giver && appointment.care_giver.toString() === req.user.id.toString();
        const isVisitor = Number(appointment.visitor_id) === Number(req.user.id);

        if (status === 'approved') {
            // Only care_giver or admin can approve
            if (!isAdminOfOrg && !isAssignedCaregiver) {
                return res.status(403).json({ message: 'Access denied. Only the assigned caregiver or organization admin can approve appointments.' });
            }
        } else if (status === 'cancelled') {
            // Visitor, caregiver, or admin can cancel
            if (!isVisitor && !isAdminOfOrg && !isAssignedCaregiver) {
                return res.status(403).json({ message: 'Access denied. You are not authorized to cancel this appointment.' });
            }
        }

        const result = await pool.query(
            `UPDATE todos.appointments 
             SET status = $1 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        const updatedApp = result.rows[0];
        const isRegistered = Number(updatedApp.visitor_id) !== 0;
        let recipientPhone = null;
        let recipientName = 'User';
        let visitorChatId = null;

        if (isRegistered) {
            // Check patients first
            const patientRes = await pool.query("SELECT fullname, phone_number FROM users.patients WHERE id = $1", [updatedApp.visitor_id]);
            if (patientRes.rows.length > 0) {
                recipientPhone = patientRes.rows[0].phone_number;
                recipientName = patientRes.rows[0].fullname;
                visitorChatId = `patient_${updatedApp.visitor_id}`;
            } else {
                // Check user_profiles
                const userRes = await pool.query("SELECT fullname, phone_number FROM users.user_profiles WHERE id = $1", [updatedApp.visitor_id]);
                if (userRes.rows.length > 0) {
                    recipientPhone = userRes.rows[0].phone_number;
                    recipientName = userRes.rows[0].fullname;
                    visitorChatId = `user_${updatedApp.visitor_id}`;
                } else {
                    // Check community_health_workers
                    const chwRes = await pool.query("SELECT fullname, phone_number FROM users.community_health_workers WHERE id = $1", [updatedApp.visitor_id]);
                    if (chwRes.rows.length > 0) {
                        recipientPhone = chwRes.rows[0].phone_number;
                        recipientName = chwRes.rows[0].fullname;
                        visitorChatId = `chw_${updatedApp.visitor_id}`;
                    }
                }
            }
        } else {
            recipientPhone = updatedApp.contact_phone;
            recipientName = updatedApp.visitor_name || 'Guest';
        }

        // Trigger status update notifications & SMS
        const formattedDate = formatAppointmentDateTime(updatedApp.date_time);
        const statusVerb = status === 'approved' ? 'approved' : 'cancelled/rejected';
        
        // 1. Send SMS if phone number is available
        if (recipientPhone && recipientPhone.trim()) {
            const smsBody = `Hello ${recipientName}, your appointment at "${updatedApp.organization.trim()}" on ${formattedDate} has been ${statusVerb}.`;
            sendSMS(recipientPhone, smsBody);
        }

        // 2. Log/simulate email if guest only provided contact_email
        if (!isRegistered && updatedApp.contact_email && updatedApp.contact_email.trim()) {
            console.log(`[Email Sent] To: ${updatedApp.contact_email.trim()} | Body: Hello ${recipientName}, your appointment at "${updatedApp.organization.trim()}" on ${formattedDate} has been ${statusVerb}.`);
        }

        // 3. Send in-app notification if registered
        const createNotification = req.app.get('createNotification');
        if (isRegistered && visitorChatId && createNotification) {
            createNotification(
                visitorChatId,
                `Appointment ${status === 'approved' ? 'Approved' : 'Cancelled'}`,
                `Your appointment at "${updatedApp.organization.trim()}" on ${formattedDate} has been ${statusVerb}.`
            );
        }

        const completeResult = await pool.query(
            `SELECT a.*, 
                    COALESCE(
                        (SELECT fullname FROM users.user_profiles WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.patients WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.community_health_workers WHERE id = a.visitor_id),
                        a.visitor_name,
                        'Unregistered User'
                    ) AS visitor_name,
                    (SELECT fullname FROM users.user_profiles WHERE id = CASE WHEN a.care_giver ~ '^[0-9]+$' THEN CAST(a.care_giver AS BIGINT) ELSE NULL END) AS care_giver_name
             FROM todos.appointments a
             WHERE a.id = $1`,
            [id]
        );

        // Sanitize return
        const responseData = completeResult.rows[0];
        if (Number(responseData.visitor_id) !== Number(req.user.id)) {
            delete responseData.appointment_key;
        }

        return res.json({ appointment: responseData });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return res.status(500).json({ message: 'Server error updating appointment status' });
    }
});

// Fulfill appointment (requires verification key check)
router.put('/:id/fulfill', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { appointment_key } = req.body;

        if (!appointment_key || !appointment_key.trim()) {
            return res.status(400).json({ message: 'Fulfillment verification key is required' });
        }

        const appointmentResult = await pool.query('SELECT * FROM todos.appointments WHERE id = $1', [id]);
        if (appointmentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = appointmentResult.rows[0];

        // Authorization checks (only care_giver or organization admin can mark fulfilled)
        const isAdminOfOrg = req.user.role === 'admin' && req.user.organization?.toLowerCase() === appointment.organization?.toLowerCase();
        const isAssignedCaregiver = appointment.care_giver && appointment.care_giver.toString() === req.user.id.toString();

        if (!isAdminOfOrg && !isAssignedCaregiver) {
            return res.status(403).json({ message: 'Access denied. Only the assigned caregiver or organization admin can fulfill appointments.' });
        }

        // Verify key (case-insensitive check)
        if (appointment.appointment_key?.trim().toLowerCase() !== appointment_key.trim().toLowerCase()) {
            return res.status(400).json({ message: 'Invalid appointment verification key. Fulfillment rejected.' });
        }

        const result = await pool.query(
            `UPDATE todos.appointments 
             SET status = 'fulfilled' 
             WHERE id = $1 
             RETURNING *`,
            [id]
        );

        const completeResult = await pool.query(
            `SELECT a.*, 
                    COALESCE(
                        (SELECT fullname FROM users.user_profiles WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.patients WHERE id = a.visitor_id),
                        (SELECT fullname FROM users.community_health_workers WHERE id = a.visitor_id),
                        a.visitor_name,
                        'Unregistered User'
                    ) AS visitor_name,
                    (SELECT fullname FROM users.user_profiles WHERE id = CASE WHEN a.care_giver ~ '^[0-9]+$' THEN CAST(a.care_giver AS BIGINT) ELSE NULL END) AS care_giver_name
             FROM todos.appointments a
             WHERE a.id = $1`,
            [id]
        );

        // Sanitize return
        const responseData = completeResult.rows[0];
        if (Number(responseData.visitor_id) !== Number(req.user.id)) {
            delete responseData.appointment_key;
        }

        return res.json({ appointment: responseData });
    } catch (error) {
        console.error('Error fulfilling appointment:', error);
        return res.status(500).json({ message: 'Server error fulfilling appointment' });
    }
});

export default router;
