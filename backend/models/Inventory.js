const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Vaccines', 'Medications', 'Supplies', 'Equipment', 'Food', 'Other']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    usageCount: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    reorderLevel: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date
    },
    supplier: {
        type: String
    },
    location: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

inventorySchema.index({ category: 1 });
inventorySchema.index({ name: 1 });
inventorySchema.index({ quantity: 1 });

module.exports = mongoose.model('Inventory', inventorySchema); 