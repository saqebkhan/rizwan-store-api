const Subscription = require('../models/Subscription');
const NotificationQueue = require('../models/NotificationQueue');
const webpush = require('web-push');

exports.subscribe = async (req, res) => {
    try {
        const subscriptionData = req.body;
        
        // Save or update subscription - upsert ensures only one valid endpoint per device
        await Subscription.findOneAndUpdate(
            { endpoint: subscriptionData.endpoint },
            subscriptionData,
            { upsert: true, new: true }
        );
        
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        await Subscription.findOneAndDelete({ endpoint });
        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Fetch pending (undelivered) notifications — used by SW on internet reconnect
exports.getPendingNotifications = async (req, res) => {
    try {
        const pending = await NotificationQueue.find({ delivered: false }).sort({ createdAt: 1 }).limit(20);
        
        // Mark as delivered immediately so we don't flood on next poll
        if (pending.length > 0) {
            const ids = pending.map(n => n._id);
            await NotificationQueue.updateMany({ _id: { $in: ids } }, { delivered: true });
        }
        
        res.json({ notifications: pending });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.sendPushNotificationToAll = async (payload) => {
    try {
        const subscriptions = await Subscription.find();
        
        // Always queue the notification for offline delivery / missed notifications
        await NotificationQueue.create({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/admin/leads'
        });

        if (subscriptions.length === 0) return;

        const notifications = subscriptions.map(sub => 
            webpush.sendNotification(sub, JSON.stringify(payload), {
                TTL: 2419200, // 28 days — deliver even if device is offline for weeks
                urgency: 'high', // Bypasses OS battery optimization
                topic: 'admin-alerts' // Deduplicates on the push server side
            })
                .catch(async err => {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        // Subscription has expired or is no longer valid - remove it
                        await Subscription.findByIdAndDelete(sub._id);
                        console.log('[Push] Removed stale subscription:', sub.endpoint);
                    } else {
                        console.error('[Push] Delivery error:', err.statusCode, sub.endpoint);
                    }
                })
        );
        await Promise.all(notifications);
    } catch (error) {
        console.error('[Push] Broadcast Failure:', error);
    }
};
