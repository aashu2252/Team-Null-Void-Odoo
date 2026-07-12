const mongoose = require('mongoose');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc    Create a new fuel log
// @route   POST /api/fuel-logs
// @access  Private
const createFuelLog = async (req, res) => {
  try {
    const {
      vehicle,
      trip,
      liters,
      cost,
      date
    } = req.body;

    // Check required fields
    if (!vehicle || !trip || liters === undefined || cost === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: vehicle, trip, liters, cost, date'
      });
    }

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(vehicle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID format'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(trip)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Trip ID format'
      });
    }

    // Verify Vehicle exists
    const existingVehicle = await Vehicle.findById(vehicle);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Referenced Vehicle not found'
      });
    }

    // Verify Trip exists
    const existingTrip = await Trip.findById(trip);
    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: 'Referenced Trip not found'
      });
    }

    const fuelLog = await FuelLog.create({
      vehicle,
      trip,
      liters,
      cost,
      date
    });

    const populatedLog = await FuelLog.findById(fuelLog._id).populate('vehicle').populate('trip');

    return res.status(201).json({
      success: true,
      message: 'Fuel log created successfully',
      data: populatedLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all fuel logs (with pagination, filtering, populate & sorting)
// @route   GET /api/fuel-logs
// @access  Private
const getAllFuelLogs = async (req, res) => {
  try {
    const query = {};

    // Specific filters
    if (req.query.vehicle) {
      if (!mongoose.Types.ObjectId.isValid(req.query.vehicle)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle ID query format'
        });
      }
      query.vehicle = req.query.vehicle;
    }
    if (req.query.trip) {
      if (!mongoose.Types.ObjectId.isValid(req.query.trip)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trip ID query format'
        });
      }
      query.trip = req.query.trip;
    }
    if (req.query.date) {
      // Support querying exact date or parseable date string
      query.date = req.query.date;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await FuelLog.countDocuments(query);
    const fuelLogs = await FuelLog.find(query)
      .populate('vehicle')
      .populate('trip')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Fuel logs retrieved successfully',
      data: {
        fuelLogs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get fuel log by ID (with populate)
// @route   GET /api/fuel-logs/:id
// @access  Private
const getFuelLogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Fuel Log ID format'
      });
    }

    const fuelLog = await FuelLog.findById(id).populate('vehicle').populate('trip');
    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fuel log retrieved successfully',
      data: fuelLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update fuel log details
// @route   PUT /api/fuel-logs/:id
// @access  Private
const updateFuelLog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Fuel Log ID format'
      });
    }

    const {
      vehicle,
      trip,
      liters,
      cost,
      date
    } = req.body;

    // Validate Vehicle reference if provided
    if (vehicle) {
      if (!mongoose.Types.ObjectId.isValid(vehicle)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Vehicle ID format'
        });
      }
      const existingVehicle = await Vehicle.findById(vehicle);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Referenced Vehicle not found'
        });
      }
    }

    // Validate Trip reference if provided
    if (trip) {
      if (!mongoose.Types.ObjectId.isValid(trip)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Trip ID format'
        });
      }
      const existingTrip = await Trip.findById(trip);
      if (!existingTrip) {
        return res.status(404).json({
          success: false,
          message: 'Referenced Trip not found'
        });
      }
    }

    const fuelLog = await FuelLog.findById(id);
    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log not found'
      });
    }

    // Update fields
    if (vehicle !== undefined) fuelLog.vehicle = vehicle;
    if (trip !== undefined) fuelLog.trip = trip;
    if (liters !== undefined) fuelLog.liters = liters;
    if (cost !== undefined) fuelLog.cost = cost;
    if (date !== undefined) fuelLog.date = date;

    const updatedFuelLog = await fuelLog.save();

    const populatedLog = await FuelLog.findById(updatedFuelLog._id).populate('vehicle').populate('trip');

    return res.status(200).json({
      success: true,
      message: 'Fuel log updated successfully',
      data: populatedLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete fuel log
// @route   DELETE /api/fuel-logs/:id
// @access  Private
const deleteFuelLog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Fuel Log ID format'
      });
    }

    const fuelLog = await FuelLog.findByIdAndDelete(id);
    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fuel log deleted successfully',
      data: fuelLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createFuelLog,
  getAllFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog
};
