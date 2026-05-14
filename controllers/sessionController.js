const Session = require('../models/Session');
const Product = require('../models/Product');

exports.startSession = async (req, res) => {
    try {
        const { visitorId, deviceType, browser, os, source } = req.body;
        const session = new Session({
            visitorId,
            deviceType,
            browser,
            os,
            source
        });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { visitorId, path, productId } = req.body;
        const session = await Session.findOne({ visitorId, endTime: { $exists: false } }).sort({ createdAt: -1 });
        
        if (session) {
            if (path) session.pagesVisited.push({ path });
            if (productId) {
                session.productsViewed.push({ productId });
                await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
            }
            await session.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.endSession = async (req, res) => {
    try {
        const { visitorId } = req.body;
        const session = await Session.findOne({ visitorId, endTime: { $exists: false } }).sort({ createdAt: -1 });
        
        if (session) {
            session.endTime = new Date();
            session.duration = (session.endTime - session.startTime) / 1000; // in seconds
            await session.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSessionHistory = async (req, res) => {
    try {
        const sessions = await Session.find().populate('productsViewed.productId').sort({ createdAt: -1 }).limit(100);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
