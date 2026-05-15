const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const Session = require('../models/Session');
const { sendPushNotificationToAll } = require('./notificationController');

exports.createInquiry = async (req, res) => {
    try {
        const inquiryData = req.body;
        const inquiry = new Inquiry(inquiryData);
        await inquiry.save();

        // Update product order counts
        for (let item of inquiryData.products) {
            await Product.findByIdAndUpdate(item.product, { $inc: { orderCount: 1 } });
        }

        // Update session conversion status
        if (inquiryData.visitorId) {
            await Session.findOneAndUpdate(
                { visitorId: inquiryData.visitorId, endTime: { $exists: false } },
                { isConverted: true },
                { returnDocument: 'after' }
            );
        }

        // Push Notification (Only if NOT placed by Admin)
        if (!inquiryData.isAdmin) {
            sendPushNotificationToAll({
                title: '🛍️ New Order Received!',
                body: `${inquiryData.fullName} just placed an order for ₹${inquiryData.totalAmount}.`,
                url: '/admin'
            });
        }

        res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateInquiryStatus = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
        res.json(inquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalInquiries = await Inquiry.countDocuments();
        const totalSessions = await Session.countDocuments();
        const convertedSessions = await Session.countDocuments({ isConverted: true });
        
        // Calculate Conversion Rate
        const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;

        // Top Products
        const topProducts = await Product.find().sort({ viewCount: -1 }).limit(5);
        
        // Cart Abandonment (Sessions with product views or cart additions but no conversion)
        // For simplicity, we define it as sessions with cart additions but no conversion
        const cartAdditions = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$cartAddCount" } } }]);
        const cartAbandonment = cartAdditions[0] ? Math.max(0, cartAdditions[0].total - totalInquiries) : 0;

        res.json({
            cards: {
                totalProducts,
                totalInquiries,
                totalSessions,
                conversionRate: conversionRate.toFixed(2) + '%',
                cartAbandonment
            },
            topProducts,
            // ... more stats can be added
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
