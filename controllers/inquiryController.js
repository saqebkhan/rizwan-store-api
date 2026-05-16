const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const Session = require('../models/Session');
const Lead = require('../models/Lead');
const { sendPushNotificationToAll } = require('./notificationController');

exports.createInquiry = async (req, res) => {
    try {
        const inquiryData = req.body;
        const inquiry = new Inquiry(inquiryData);
        await inquiry.save();

        for (let item of inquiryData.products) {
            await Product.findByIdAndUpdate(item.product, { $inc: { orderCount: 1 } });
        }

        if (inquiryData.visitorId) {
            await Session.findOneAndUpdate(
                { visitorId: inquiryData.visitorId, endTime: { $exists: false } },
                { isConverted: true },
                { returnDocument: 'after' }
            );
        }

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
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalProducts,
            totalInquiries,
            totalSessions,
            convertedSessions,
            totalLeads,
            pendingLeads,
            pendingInquiries,
            weeklySessions,
            monthlySessions,
            weeklyInquiries,
            monthlyInquiries,
            weeklyLeads,
            monthlyLeads
        ] = await Promise.all([
            Product.countDocuments(),
            Inquiry.countDocuments(),
            Session.countDocuments(),
            Session.countDocuments({ isConverted: true }),
            Lead.countDocuments(),
            Lead.countDocuments({ status: 'pending' }),
            Inquiry.countDocuments({ status: 'pending' }),
            Session.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Session.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Inquiry.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Inquiry.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Lead.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Lead.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);
        
        const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;
        const topProducts = await Product.find().sort({ viewCount: -1 }).limit(5);
        const cartAdditions = await Product.aggregate([{ $group: { _id: null, total: { $sum: "$cartAddCount" } } }]);
        const cartAbandonment = cartAdditions[0] ? Math.max(0, cartAdditions[0].total - totalInquiries) : 0;

        // Calculate growth (mock comparison for demo, in production use previous week/month)
        const weeklyGrowth = weeklySessions > 0 ? ((weeklyInquiries / weeklySessions) * 100).toFixed(1) : 0;
        const monthlyGrowth = monthlySessions > 0 ? ((monthlyInquiries / monthlySessions) * 100).toFixed(1) : 0;

        res.json({
            cards: {
                totalSessions,
                totalLeads,
                totalInquiries,
                conversionRate: conversionRate.toFixed(2) + '%',
                pendingLeads,
                pendingInquiries,
                cartAbandonment
            },
            performance: {
                weekly: { visitors: weeklySessions, leads: weeklyLeads, orders: weeklyInquiries, growth: weeklyGrowth },
                monthly: { visitors: monthlySessions, leads: monthlyLeads, orders: monthlyInquiries, growth: monthlyGrowth }
            },
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
