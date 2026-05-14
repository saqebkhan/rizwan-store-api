const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    // User Details
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    notes: { type: String },

    // Order Details
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number }
    }],
    totalAmount: { type: Number, required: true },

    // Tracking info
    visitorId: { type: String }, // From localStorage
    sessionDuration: { type: Number }, // In seconds
    source: { type: String }, // UTM or Referral

    // Admin Status
    status: {
        type: String,
        enum: ['pending', 'contacted', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);
