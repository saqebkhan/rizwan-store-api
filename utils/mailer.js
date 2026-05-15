const nodemailer = require('nodemailer');
const dns = require('dns');

// CRITICAL FIX FOR RENDER: Force Node.js 18+ to use IPv4 instead of IPv6 for DNS resolution
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (mailOptions) => {
    try {
        // Render's firewall or Google seems to block port 465 (Direct TLS), causing ETIMEDOUT.
        // We MUST use port 587 (STARTTLS) along with IPv4 forced resolution.
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 587,
            secure: false, // MUST be false for port 587 (uses STARTTLS instead of Direct TLS)
            requireTLS: true, // Force TLS upgrade
            family: 4, // Keep IPv4 backup
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
