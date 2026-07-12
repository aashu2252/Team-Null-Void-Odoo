const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const {
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      actualDistance,
      startOdometer,
      endOdometer,
      fuelConsumed,
      revenue,
      status,
      dispatchDate,
      completionDate
    } = req.body;

    // Check required fields
    if (!source || !destination || !vehicle || !driver || cargoWeight === undefined || plannedDistance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: source, destination, vehicle, driver, cargoWeight, plannedDistance'
      });
    }

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(vehicle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID format'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(driver)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Driver ID format'
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

    // Verify Driver exists
    const existingDriver = await Driver.findById(driver);
    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: 'Referenced Driver not found'
      });
    }

    const trip = await Trip.create({
      source: source.trim(),
      destination: destination.trim(),
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      actualDistance,
      startOdometer,
      endOdometer,
      fuelConsumed,
      revenue,
      status,
      dispatchDate,
      completionDate
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'firstName lastName email' } });

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: populatedTrip
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all trips (with pagination, filtering, populate & sorting)
// @route   GET /api/trips
// @access  Private
const getAllTrips = async (req, res) => {
  try {
    const query = {};

    // Specific filters
    if (req.query.source) {
      query.source = { $regex: req.query.source, $options: 'i' };
    }
    if (req.query.destination) {
      query.destination = { $regex: req.query.destination, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.vehicle) {
      if (!mongoose.Types.ObjectId.isValid(req.query.vehicle)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle ID query format'
        });
      }
      query.vehicle = req.query.vehicle;
    }
    if (req.query.driver) {
      if (!mongoose.Types.ObjectId.isValid(req.query.driver)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver ID query format'
        });
      }
      query.driver = req.query.driver;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'firstName lastName email' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Trips retrieved successfully',
      data: {
        trips,
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

// @desc    Get trip by ID (with populate)
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Trip ID format'
      });
    }

    const trip = await Trip.findById(id)
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'firstName lastName email' } });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip retrieved successfully',
      data: trip
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update trip details
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Trip ID format'
      });
    }

    const {
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      actualDistance,
      startOdometer,
      endOdometer,
      fuelConsumed,
      revenue,
      status,
      dispatchDate,
      completionDate
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

    // Validate Driver reference if provided
    if (driver) {
      if (!mongoose.Types.ObjectId.isValid(driver)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Driver ID format'
        });
      }
      const existingDriver = await Driver.findById(driver);
      if (!existingDriver) {
        return res.status(404).json({
          success: false,
          message: 'Referenced Driver not found'
        });
      }
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Update fields
    if (source !== undefined) trip.source = source.trim();
    if (destination !== undefined) trip.destination = destination.trim();
    if (vehicle !== undefined) trip.vehicle = vehicle;
    if (driver !== undefined) trip.driver = driver;
    if (cargoWeight !== undefined) trip.cargoWeight = cargoWeight;
    if (plannedDistance !== undefined) trip.plannedDistance = plannedDistance;
    if (actualDistance !== undefined) trip.actualDistance = actualDistance;
    if (startOdometer !== undefined) trip.startOdometer = startOdometer;
    if (endOdometer !== undefined) trip.endOdometer = endOdometer;
    if (fuelConsumed !== undefined) trip.fuelConsumed = fuelConsumed;
    if (revenue !== undefined) trip.revenue = revenue;
    if (status !== undefined) trip.status = status;
    if (dispatchDate !== undefined) trip.dispatchDate = dispatchDate;
    if (completionDate !== undefined) trip.completionDate = completionDate;

    const updatedTrip = await trip.save();
    const populatedTrip = await Trip.findById(updatedTrip._id)
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'firstName lastName email' } });

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: populatedTrip
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Trip ID format'
      });
    }

    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
      data: trip
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip
};
