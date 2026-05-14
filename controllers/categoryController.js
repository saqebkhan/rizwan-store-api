const Category = require('../models/Category');
const slugify = require('slugify');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const slug = slugify(name, { lower: true });
        
        const category = new Category({
            name,
            slug,
            image: req.file ? req.file.filename : ''
        });

        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.name) updates.slug = slugify(updates.name, { lower: true });
        if (req.file) updates.image = req.file.filename;

        const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
