import twilio from 'twilio';
import dotenv from 'dotenv';

// Load variables from both backend .env and frontend/src/.env
dotenv.config();
dotenv.config({ path: '../frontend/src/.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to, body) {
    if (!accountSid || !authToken || !twilioPhone) {
        console.warn('Twilio credentials missing. SMS skipped.');
        return;
    }

    if (!to || !to.trim()) {
        console.warn('Recipient phone number missing. SMS skipped.');
        return;
    }

    // Normalise South African numbers to E.164 if they start with '0'
    let formattedTo = to.trim();
    if (formattedTo.startsWith('0') && formattedTo.length === 10) {
        formattedTo = '+27' + formattedTo.substring(1);
    }

    try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
            from: twilioPhone,
            to: formattedTo,
            body: body
        });
        console.log(`SMS successfully sent to ${formattedTo}: SID ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`Error sending SMS to ${to}:`, error);
    }
}
