const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({

  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  licenseCategory: {
    type: String,
    required: [true, 'License category is required'],
    trim: true
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required']
  },

  safetyScore: {
    type: Number,
    default: 100,
    min: [0, 'Safety score cannot be less than 0'],
    max: [100, 'Safety score cannot be more than 100']
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Available'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  }
}, {
  timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
