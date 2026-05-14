const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    tags: [{ type: String }],
    features: [{ type: String }],
    specifications: [{ type: Map, of: String }],
    highlights: [{ type: String }],
    deliveryInfo: { type: String },
    returnInfo: { type: String },
    
    // Status Toggles
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },

    // Tracking Stats
    viewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    cartAddCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
