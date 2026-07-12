const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const User = require('../models/User');

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Private
const createDriver = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
      user
    } = req.body;

    // Check required fields
    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber || !user) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, user'
      });
    }

    // Validate User ObjectId format
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format'
      });
    }

    // Validate User exists
    const existingUser = await User.findById(user).populate('role');
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Referenced User not found'
      });
    }

    // Validate User role is "Driver"
    if (!existingUser.role || existingUser.role.name !== 'Driver') {
      return res.status(400).json({
        success: false,
        message: 'Referenced User must have the role "Driver"'
      });
    }

    // Ensure the User is not already linked to another Driver profile
    const userLinkedDriver = await Driver.findOne({ user });
    if (userLinkedDriver) {
      return res.status(400).json({
        success: false,
        message: 'This User is already linked to another Driver profile'
      });
    }

    // Check duplicate licenseNumber
    const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'A driver with this license number already exists'
      });
    }

    const driver = await Driver.create({
      name: name.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseCategory: licenseCategory.trim(),
      licenseExpiryDate,
      contactNumber: contactNumber.trim(),
      safetyScore,
      status,
      user
    });

    return res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: A driver with this license number or linked user already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all drivers (with pagination, filtering, search, populate & sorting)
// @route   GET /api/drivers
// @access  Private
const getAllDrivers = async (req, res) => {
  try {
    const query = {};

    // Specific filters
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.licenseNumber) {
      query.licenseNumber = { $regex: req.query.licenseNumber, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.licenseCategory) {
      query.licenseCategory = { $regex: req.query.licenseCategory, $options: 'i' };
    }

    // Generic search parameter (searches name or licenseNumber)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { licenseNumber: searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Driver.countDocuments(query);
    const drivers = await Driver.find(query)
      .populate('user', 'fullName name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Drivers retrieved successfully',
      data: {
        drivers,
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

// @desc    Get driver by ID
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Driver ID format'
      });
    }

    const driver = await Driver.findById(id).populate('user', 'fullName name email role');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Driver retrieved successfully',
      data: driver
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update driver details
// @route   PUT /api/drivers/:id
// @access  Private
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Driver ID format'
      });
    }

    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
      user
    } = req.body;

    // If license number is updated, verify unique constraints among other drivers
    if (licenseNumber) {
      const existingDriver = await Driver.findOne({
        licenseNumber: licenseNumber.trim(),
        _id: { $ne: id }
      });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: 'A driver with this license number already exists'
        });
      }
    }

    // If user is updated, validate User reference, role, and uniqueness
    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid User ID format'
        });
      }

      // Check User exists
      const existingUser = await User.findById(user).populate('role');
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Referenced User not found'
        });
      }

      // Check User role is "Driver"
      if (!existingUser.role || existingUser.role.name !== 'Driver') {
        return res.status(400).json({
          success: false,
          message: 'Referenced User must have the role "Driver"'
        });
      }

      // Ensure no duplicate mapping
      const userLinkedDriver = await Driver.findOne({
        user,
        _id: { $ne: id }
      });
      if (userLinkedDriver) {
        return res.status(400).json({
          success: false,
          message: 'This User is already linked to another Driver profile'
        });
      }
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Update fields
    if (name !== undefined) driver.name = name.trim();
    if (licenseNumber !== undefined) driver.licenseNumber = licenseNumber.trim();
    if (licenseCategory !== undefined) driver.licenseCategory = licenseCategory.trim();
    if (licenseExpiryDate !== undefined) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber !== undefined) driver.contactNumber = contactNumber.trim();
    if (safetyScore !== undefined) driver.safetyScore = safetyScore;
    if (status !== undefined) driver.status = status;
    if (user !== undefined) driver.user = user;

    const updatedDriver = await driver.save();

    return res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: updatedDriver
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: A driver with this license number or linked user already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete driver (only Driver profile is deleted, not the User)
// @route   DELETE /api/drivers/:id
// @access  Private
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Driver ID format'
      });
    }

    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Driver deleted successfully',
      data: driver
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
