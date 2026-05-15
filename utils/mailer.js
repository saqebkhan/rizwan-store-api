const nodemailer = require('nodemailer');
const dns = require('dns');

// CRITICAL FIX FOR RENDER: Force Node.js 18+ to use IPv4 instead of IPv6 for DNS resolution
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (mailOptions) => {
    try {
        // Force port 465 for secure TLS, ignoring env if it's 587 (which causes STARTTLS/IPv6 issues on Render)
        const envPort = parseInt(process.env.SMTP_PORT || '465');
        const port = envPort === 587 ? 465 : envPort; 

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: port,
            secure: port === 465,
            family: 4, // Keep this as backup
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw error;
    }
};

module.exports = { sendEmail };
