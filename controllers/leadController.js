const Lead = require('../models/Lead');
const { sendPushNotificationToAll } = require('./notificationController');

exports.createLead = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const lead = new Lead({ name, phone });
        await lead.save();

        // Push Notification
        sendPushNotificationToAll({
            title: '🔥 New Popup Lead!',
            body: `${name} just submitted their contact info (${phone}).`,
            url: '/admin'
        });

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
exports.updateLeadStatus = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
