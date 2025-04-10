const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  owner: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  medicalHistory: [{
    date: {
      type: Date,
      required: true
    },
    diagnosis: {
      type: String,
      required: true
    },
    treatment: {
      type: String,
      required: true
    },
    veterinarian: {
      type: String,
      required: true
    },
    notes: String
  }],
  vaccinations: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    nextDue: {
      type: Date,
      required: true
    },
    administeredBy: {
      type: String,
      required: true
    }
  }],
  allergies: [{
    name: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    notes: String
  }],
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    prescribedBy: {
      type: String,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
patientSchema.index({ name: 1 });
patientSchema.index({ 'owner.email': 1 });
patientSchema.index({ 'owner.phone': 1 });
patientSchema.index({ species: 1 });
patientSchema.index({ breed: 1 });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient; 