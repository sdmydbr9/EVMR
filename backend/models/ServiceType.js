const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: [
            'Check-ups',
            'Consultations',
            'Surgeries',
            'Vaccinations',
            'Treatments',
            'Laboratory Tests',
            'Imaging',
            'Preventive Care',
            'Emergency Care',
            'Other'
        ],
        default: 'Check-ups'
    },
    requiresDoctor: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create indexes for efficient querying
serviceTypeSchema.index({ category: 1 });
serviceTypeSchema.index({ isActive: 1 });
serviceTypeSchema.index({ price: 1 });
serviceTypeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('ServiceType', serviceTypeSchema); 