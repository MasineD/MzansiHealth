// ============== Setting Up the Express Server ==============
import express from 'express';
import cors from 'cors';        //Allowing Cross-Origin Resource Sharing (CORS) to enable communication between the frontend and backend servers, which may be running on different ports during development.
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';        //To read environment variables from a .env file, which is useful for storing sensitive information like database credentials and API keys.
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';   //Importing the authentication routes defined in the auth.js file, which will handle user registration, login, and other authentication-related endpoints.
import patientRoutes from './routes/patients.js';
import chwRoutes from './routes/chw.js';
import appointmentRoutes from './routes/appointments.js';
import reviewRoutes from './routes/reviews.js';
import referralRoutes from './routes/referrals.js';
import pool from './config/database.js';

dotenv.config();
dotenv.config({ path: '../frontend/src/.env' });
const app = express();
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174'
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true   //Enables sending cookies and other credentials in cross-origin requests, which is necessary for maintaining user sessions and authentication state between the frontend and backend.
}));
app.use(express.json());        //Middleware to parse incoming JSON requests and make the data available in req.body. This is essential for handling API requests that send data in JSON format, such as user registration and login requests.
app.use(cookieParser());

app.use('/api/auth', authRoutes);   //Mounts the authentication routes defined in the authRoutes module at the '/api/auth' path. This means that any requests to endpoints like '/api/auth/register' or '/api/auth/login' will be handled by the corresponding route handlers defined in the authRoutes module.
app.use('/api/patients', patientRoutes);
app.use('/api/chw', chwRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/referrals', referralRoutes);

// In-memory message and notification storage
const globalMessages = [];
const globalNotifications = [];
const activeUsers = new Map(); // userId -> Set of socket.ids

const createNotification = (userId, title, message) => {
    const notif = {
        id: Date.now().toString() + Math.random().toString().substring(2, 6),
        userId,
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
    };
    globalNotifications.push(notif);

    const userSockets = activeUsers.get(userId);
    if (userSockets) {
        userSockets.forEach(sid => io.to(sid).emit('receive_notification', notif));
    }
    return notif;
};

// Expose createNotification to express app
app.set('createNotification', createNotification);

const Port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

app.set('io', io);

async function getUserDetails(chatId) {
    if (!chatId) return null;
    const parts = chatId.split('_');
    if (parts.length < 2) return null;
    const type = parts[0];
    const id = parseInt(parts[1], 10);
    if (isNaN(id)) return null;

    try {
        if (type === 'user') {
            const res = await pool.query('SELECT role, organization, fullname FROM users.user_profiles WHERE id = $1', [id]);
            if (res.rows.length > 0) {
                return { 
                    id, 
                    role: res.rows[0].role?.toLowerCase(), 
                    organization: res.rows[0].organization,
                    fullname: res.rows[0].fullname
                };
            }
        } else if (type === 'patient') {
            const res = await pool.query(`
                SELECT 'patient' AS role, fullname,
                       (SELECT organization FROM users.user_profiles WHERE id = p.registra_id) AS organization
                FROM users.patients p WHERE id = $1`, [id]);
            if (res.rows.length > 0) {
                return { 
                    id, 
                    role: 'patient', 
                    organization: res.rows[0].organization,
                    fullname: res.rows[0].fullname
                };
            }
        } else if (type === 'chw') {
            const res = await pool.query(`
                SELECT 'chw' AS role, fullname,
                       (SELECT organization FROM users.user_profiles WHERE id = c.registra_id) AS organization
                FROM users.community_health_workers c WHERE id = $1`, [id]);
            if (res.rows.length > 0) {
                return { 
                    id, 
                    role: 'chw', 
                    organization: res.rows[0].organization,
                    fullname: res.rows[0].fullname
                };
            }
        }
    } catch (err) {
        console.error('Error fetching user details in socket:', err);
    }
    return null;
}

io.on('connection', (socket) => {
    let currentUserId = null;

    socket.on('register', async (userId) => {
        currentUserId = userId;
        if (!activeUsers.has(userId)) {
            activeUsers.set(userId, new Set());
        }
        activeUsers.get(userId).add(socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);

        const userDetails = await getUserDetails(userId);
        socket.user = userDetails; // Attach user metadata to socket instance

        // Send existing messages associated with this user (direct messages + group announcements)
        const userMsgs = globalMessages.filter(m => {
            if (m.sender === userId || m.recipient === userId || m.recipient === 'All') return true;
            if (userDetails && userDetails.organization) {
                const org = userDetails.organization.toLowerCase().trim();
                if (m.recipient === `all_patients_${org}` && userDetails.role === 'patient') return true;
                if (m.recipient === `all_staff_${org}` && userDetails.role === 'staff') return true;
            }
            return false;
        });
        socket.emit('chat_history', userMsgs);

        // Send existing notifications associated with this user
        const userNotifs = globalNotifications.filter(n => n.userId === userId);
        socket.emit('notifications_history', userNotifs);
    });

    socket.on('send_message', async (data) => {
        const newMessage = {
            id: Date.now().toString() + Math.random().toString().substring(2, 6),
            sender: data.sender,
            recipient: data.recipient,
            message: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        globalMessages.push(newMessage);

        // Group message delivery check
        if (data.recipient.startsWith('all_patients_') || data.recipient.startsWith('all_staff_')) {
            const targetGroup = data.recipient; // e.g. "all_patients_mitchells plain clinic"
            const isTargetPatients = targetGroup.startsWith('all_patients_');
            const targetOrgName = targetGroup.substring(isTargetPatients ? 13 : 10).toLowerCase().trim();

            // Emit message to all active users matching the group criteria
            const sockets = await io.fetchSockets();
            for (const s of sockets) {
                if (s.user) {
                    const matchesOrg = s.user.organization?.toLowerCase().trim() === targetOrgName;
                    const matchesRole = isTargetPatients ? (s.user.role === 'patient') : (s.user.role === 'staff');
                    if (matchesOrg && matchesRole) {
                        s.emit('receive_message', newMessage);
                    }
                }
            }

            // Also send back to the sender (the Admin)
            const senderSockets = activeUsers.get(data.sender);
            if (senderSockets) {
                senderSockets.forEach(sid => io.to(sid).emit('receive_message', newMessage));
            }

            // Generate group notifications (persistent in-memory for matching user IDs)
            try {
                let userIds = [];
                if (isTargetPatients) {
                    const patientsDb = await pool.query(
                        `SELECT id FROM users.patients 
                         WHERE registra_id IN (
                             SELECT id FROM users.user_profiles 
                             WHERE LOWER(organization) = LOWER($1) AND role = 'admin'
                         )`,
                        [targetOrgName]
                    );
                    userIds = patientsDb.rows.map(p => `patient_${p.id}`);
                } else {
                    const staffDb = await pool.query(
                        `SELECT id FROM users.user_profiles 
                         WHERE LOWER(organization) = LOWER($1) AND role = 'staff'`,
                        [targetOrgName]
                    );
                    userIds = staffDb.rows.map(s => `user_${s.id}`);
                }

                const senderName = data.senderName || 'Administrator';
                userIds.forEach(uid => {
                    createNotification(
                        uid,
                        'New Group Announcement',
                        `New group announcement from ${senderName}: "${data.message.substring(0, 30)}${data.message.length > 30 ? '...' : ''}"`
                    );
                });
            } catch (err) {
                console.error('Error sending group notifications:', err);
            }
        } else {
            // Direct message delivery
            const recipientSockets = activeUsers.get(data.recipient);
            if (recipientSockets) {
                recipientSockets.forEach(sid => io.to(sid).emit('receive_message', newMessage));
            }
            const senderSockets = activeUsers.get(data.sender);
            if (senderSockets) {
                senderSockets.forEach(sid => io.to(sid).emit('receive_message', newMessage));
            }

            // Generate chat room notification for recipient
            const senderName = data.senderName || 'Another User';
            createNotification(
                data.recipient,
                'New Chat Message',
                `New message from ${senderName}: "${data.message.substring(0, 30)}${data.message.length > 30 ? '...' : ''}"`
            );
        }
    });

    socket.on('mark_notification_read', (notifId) => {
        const notif = globalNotifications.find(n => n.id === notifId);
        if (notif) {
            notif.read = true;
        }
        if (currentUserId) {
            const userNotifs = globalNotifications.filter(n => n.userId === currentUserId);
            const userSockets = activeUsers.get(currentUserId);
            if (userSockets) {
                userSockets.forEach(sid => io.to(sid).emit('notifications_history', userNotifs));
            }
        }
    });

    socket.on('disconnect', () => {
        if (currentUserId && activeUsers.has(currentUserId)) {
            activeUsers.get(currentUserId).delete(socket.id);
            if (activeUsers.get(currentUserId).size === 0) {
                activeUsers.delete(currentUserId);
            }
            console.log(`User ${currentUserId} disconnected socket ${socket.id}`);
        }
    });
});

httpServer.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});