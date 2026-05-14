const Product = require('../models/Product');
const slugify = require('slugify');

exports.createProduct = async (req, res) => {
    try {
        const data = { ...req.body };
        data.slug = slugify(data.title, { lower: true });
        
        // Calculate final price safely
        const price = Number(data.price) || 0;
        const discount = Number(data.discountPercentage) || 0;
        data.finalPrice = price - (price * (discount / 100));

        // Handle images
        if (req.files) {
            if (req.files.thumbnail) data.thumbnail = req.files.thumbnail[0].filename;
            if (req.files.images) data.images = req.files.images.map(f => f.filename);
        }

        // Parse JSON strings if they come from FormData
        if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
        if (typeof data.features === 'string') data.features = JSON.parse(data.features);
        if (typeof data.specifications === 'string') data.specifications = JSON.parse(data.specifications);
        if (typeof data.highlights === 'string') data.highlights = JSON.parse(data.highlights);

        const product = new Product(data);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { category, sort, search, minPrice, maxPrice, featured, newArrival, bestSeller } = req.query;
        let query = { isActive: true };

        if (category) query.category = category;
        if (featured) query.isFeatured = true;
        if (newArrival) query.isNewArrival = true;
        if (bestSeller) query.isBestSeller = true;
        if (minPrice || maxPrice) {
            query.finalPrice = {};
            if (minPrice) query.finalPrice.$gte = Number(minPrice);
            if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        let sortQuery = {};
        if (sort === 'price-low') sortQuery.finalPrice = 1;
        else if (sort === 'price-high') sortQuery.finalPrice = -1;
        else if (sort === 'newest') sortQuery.createdAt = -1;
        else sortQuery.viewCount = -1; // Default to popularity

        const products = await Product.find(query).sort(sortQuery).populate('category');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('category');
        
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        
        const suggestions = await Product.find(
            { title: { $regex: q, $options: 'i' }, isActive: true },
            { title: 1, slug: 1, thumbnail: 1 }
        ).limit(5);
        
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.title) updates.slug = slugify(updates.title, { lower: true });
        
        if (updates.price || updates.discountPercentage) {
            const product = await Product.findById(req.params.id);
            const p = Number(updates.price) || product.price;
            const d = updates.discountPercentage !== undefined ? Number(updates.discountPercentage) : product.discountPercentage;
            updates.finalPrice = p - (p * (d / 100));
        }

        if (req.files) {
            if (req.files.thumbnail) updates.thumbnail = req.files.thumbnail[0].filename;
            if (req.files.images) updates.images = req.files.images.map(f => f.filename);
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
