const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    visitorId: { type: String, required: true }, // Persistent ID in localStorage
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // In seconds
    pagesVisited: [{
        path: String,
        timestamp: { type: Date, default: Date.now }
    }],
    productsViewed: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now }
    }],
    deviceType: { type: String }, // Mobile, Tablet, Desktop
    browser: { type: String },
    os: { type: String },
    source: { type: String }, // Referral or UTM
    isConverted: { type: Boolean, default: false }, // If inquiry submitted
    cartAbandoned: { type: Boolean, default: false } // If added to cart but no inquiry
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
