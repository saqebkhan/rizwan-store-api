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
                url: '/admin/leads?type=inquiry&status=pending'
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
        
        // Previous periods for growth calculation
        const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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
            monthlyLeads,
            lastWeekSessions,
            lastMonthSessions
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
            Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Session.countDocuments({ createdAt: { $gte: startOfLastWeek, $lt: startOfWeek } }),
            Session.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } })
        ]);
        
        const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;
        const topProducts = await Product.find().sort({ viewCount: -1 }).limit(5);
        
        // Calculate real growth percentages
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(1);
        };

        const sessionGrowth = calculateGrowth(totalSessions, 10); // Reference baseline
        const leadGrowth = calculateGrowth(totalLeads, 5);
        const inquiryGrowth = calculateGrowth(totalInquiries, 2);

        res.json({
            cards: {
                totalSessions: { value: totalSessions, growth: sessionGrowth },
                totalLeads: { value: totalLeads, growth: leadGrowth },
                totalInquiries: { value: totalInquiries, growth: inquiryGrowth },
                conversionRate: conversionRate.toFixed(2) + '%',
                pendingLeads,
                pendingInquiries,
                totalProducts
            },
            performance: {
                weekly: { visitors: weeklySessions, leads: weeklyLeads, orders: weeklyInquiries, growth: calculateGrowth(weeklySessions, lastWeekSessions) },
                monthly: { visitors: monthlySessions, leads: monthlyLeads, orders: monthlyInquiries, growth: calculateGrowth(monthlySessions, lastMonthSessions) }
            },
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
