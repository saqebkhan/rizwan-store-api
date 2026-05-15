const nodemailer = require('nodemailer');

const sendEmail = async (mailOptions) => {
    try {
        const port = parseInt(process.env.SMTP_PORT || '587');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: port,
            secure: port === 465,
            family: 4, // Force IPv4 to fix Render/IPv6 ENETUNREACH issues
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
