const Subscription = require('../models/Subscription');
const webpush = require('web-push');

exports.subscribe = async (req, res) => {
    try {
        const subscriptionData = req.body;
        
        // Save or update subscription
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

exports.sendPushNotificationToAll = async (payload) => {
    try {
        const subscriptions = await Subscription.find();
        const notifications = subscriptions.map(sub => 
            webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    // Subscription has expired or is no longer valid
                    return Subscription.findByIdAndDelete(sub._id);
                } else {
                    console.error('Push Error:', err);
                }
            })
        );
        await Promise.all(notifications);
    } catch (error) {
        console.error('Failed to send push notifications:', error);
    }
};

