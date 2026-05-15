const nodemailer = require('nodemailer');
const dns = require('dns');

const getIPv4 = (domain) => new Promise((resolve, reject) => {
    dns.lookup(domain, { family: 4 }, (err, address) => {
        if (err) reject(err);
        else resolve(address);
    });
});

const sendEmail = async (mailOptions) => {
    try {
        // Force IPv4 resolution to fix Render ENETUNREACH issue
        const smtpIp = await getIPv4('smtp.gmail.com');
        
        const transporter = nodemailer.createTransport({
            host: smtpIp,
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Important: Need to provide servername because we are connecting via IP
                servername: 'smtp.gmail.com',
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw error;
    }
};

module.exports = { sendEmail };
