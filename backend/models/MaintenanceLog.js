const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Completed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Active'
  }
}, {
  timestamps: true
});

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
module.exports = MaintenanceLog;
