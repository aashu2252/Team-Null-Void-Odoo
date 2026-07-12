const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  vehicleName: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    trim: true
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Max load capacity is required'],
    min: [0, 'Max load capacity cannot be negative']
  },
  odometer: {
    type: Number,
    default: 0,
    min: [0, 'Odometer cannot be negative']
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Acquisition cost is required'],
    min: [0, 'Acquisition cost cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'On Trip', 'In Shop', 'Retired'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Available'
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
