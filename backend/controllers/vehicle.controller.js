const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      vehicleName,
      model,
      type,
      region,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
      fuel,
      health,
      driver,
      image
    } = req.body;

    // Check required fields
    if (!registrationNumber || !vehicleName || !model || !type || !region || maxLoadCapacity === undefined || acquisitionCost === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: registrationNumber, vehicleName, model, type, region, maxLoadCapacity, acquisitionCost'
      });
    }

    // Check duplicate registrationNumber
    const existingVehicle = await Vehicle.findOne({ registrationNumber: registrationNumber.trim() });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this registration number already exists'
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber: registrationNumber.trim(),
      vehicleName: vehicleName.trim(),
      model: model.trim(),
      type: type.trim(),
      region: region.trim(),
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
      fuel,
      health,
      driver: driver || null,
      image: image || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: A vehicle with this registration number already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all vehicles (with pagination, filtering, search & sorting)
// @route   GET /api/vehicles
// @access  Private
const getAllVehicles = async (req, res) => {
  try {
    const query = {};

    // Specific filters
    if (req.query.registrationNumber) {
      query.registrationNumber = { $regex: req.query.registrationNumber, $options: 'i' };
    }
    if (req.query.vehicleName) {
      query.vehicleName = { $regex: req.query.vehicleName, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.type) {
      query.type = { $regex: req.query.type, $options: 'i' };
    }
    if (req.query.region) {
      query.region = { $regex: req.query.region, $options: 'i' };
    }

    // Generic search query parameter (searches registrationNumber or vehicleName)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { registrationNumber: searchRegex },
        { vehicleName: searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'firstName lastName email role' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: {
        vehicles,
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

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID format'
      });
    }

    const vehicle = await Vehicle.findById(id).populate({
      path: 'driver',
      populate: { path: 'user', select: 'firstName lastName email role' }
    });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle retrieved successfully',
      data: vehicle
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update vehicle details
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID format'
      });
    }

    const {
      registrationNumber,
      vehicleName,
      model,
      type,
      region,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
      fuel,
      health,
      driver,
      image
    } = req.body;

    // If registration number is provided, check for uniqueness among other vehicles
    if (registrationNumber) {
      const existingVehicle = await Vehicle.findOne({
        registrationNumber: registrationNumber.trim(),
        _id: { $ne: id }
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'A vehicle with this registration number already exists'
        });
      }
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Update updated fields
    if (registrationNumber !== undefined) vehicle.registrationNumber = registrationNumber.trim();
    if (vehicleName !== undefined) vehicle.vehicleName = vehicleName.trim();
    if (model !== undefined) vehicle.model = model.trim();
    if (type !== undefined) vehicle.type = type.trim();
    if (region !== undefined) vehicle.region = region.trim();
    if (maxLoadCapacity !== undefined) vehicle.maxLoadCapacity = maxLoadCapacity;
    if (odometer !== undefined) vehicle.odometer = odometer;
    if (acquisitionCost !== undefined) vehicle.acquisitionCost = acquisitionCost;
    if (status !== undefined) vehicle.status = status;
    if (fuel !== undefined) vehicle.fuel = fuel;
    if (health !== undefined) vehicle.health = health;
    if (driver !== undefined) vehicle.driver = driver || null;
    if (image !== undefined) vehicle.image = image;

    const updatedVehicle = await vehicle.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: A vehicle with this registration number already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID format'
      });
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
      data: vehicle
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};
