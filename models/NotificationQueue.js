const mongoose = require('mongoose');

const notificationQueueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: { type: String, default: '/admin/leads' },
    delivered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Auto-expire delivered notifications after 24 hours
notificationQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('NotificationQueue', notificationQueueSchema);
