const Banner = require('../models/Banner');

exports.createBanner = async (req, res) => {
    try {
        const banner = new Banner({
            ...req.body,
            image: req.file ? req.file.filename : ''
        });
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.file) updates.image = req.file.filename;
        const banner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
