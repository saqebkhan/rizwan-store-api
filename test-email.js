require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing Email with:');
    console.log('User:', process.env.SMTP_USER);
    // Don't log full pass for security, just check length
    console.log('Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: 'Test Email from Local',
        text: 'This is a test email.'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Success! Message ID:', info.messageId);
    } catch (error) {
        console.error('Email failed to send. Error details:');
        console.error(error);
    }
}

testEmail();
