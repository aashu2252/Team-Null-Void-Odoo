const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver reference is required']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: [0, 'Cargo weight cannot be negative']
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Planned distance is required'],
    min: [0, 'Planned distance cannot be negative']
  },
  actualDistance: {
    type: Number,
    default: 0,
    min: [0, 'Actual distance cannot be negative']
  },
  startOdometer: {
    type: Number,
    min: [0, 'Start odometer cannot be negative']
  },
  endOdometer: {
    type: Number,
    min: [0, 'End odometer cannot be negative']
  },
  fuelConsumed: {
    type: Number,
    default: 0,
    min: [0, 'Fuel consumed cannot be negative']
  },
  revenue: {
    type: Number,
    default: 0,
    min: [0, 'Revenue cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Draft'
  },
  dispatchDate: {
    type: Date
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
