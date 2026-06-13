// ============== Setting Up the Express Server ==============
import express from 'express';
import cors from 'cors';        //Allowing Cross-Origin Resource Sharing (CORS) to enable communication between the frontend and backend servers, which may be running on different ports during development.
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';        //To read environment variables from a .env file, which is useful for storing sensitive information like database credentials and API keys.
import authRoutes from './routes/auth.js';   //Importing the authentication routes defined in the auth.js file, which will handle user registration, login, and other authentication-related endpoints.
// import bcrypt from 'bcryptjs';

dotenv.config();
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
// app.use(bodyParser.json());

app.use('/api/auth', authRoutes);   //Mounts the authentication routes defined in the authRoutes module at the '/api/auth' path. This means that any requests to endpoints like '/api/auth/register' or '/api/auth/login' will be handled by the corresponding route handlers defined in the authRoutes module.

const Port = process.env.PORT || 5000;
app.listen(Port, () => {        //Server listens on port 5000
  console.log(`Server is running on port ${Port}`);
});