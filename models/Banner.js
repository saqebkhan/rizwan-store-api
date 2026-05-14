const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: { type: String },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    buttonText: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
