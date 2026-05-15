const Lead = require('../models/Lead');
const { sendEmail } = require('../utils/mailer');

exports.createLead = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const lead = new Lead({ name, phone });
        await lead.save();

        // Email Notification
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Lead Captured!',
            html: `
                <h2>New Visitor Lead</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Captured At:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        sendEmail(mailOptions)
            .then(info => console.log('Lead Email Sent! Message ID:', info.messageId))
            .catch(err => console.error('Lead Email Error:', err));

        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
