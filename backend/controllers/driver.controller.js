const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Private
const createDriver = async (req, res) => {
  try {
    const {
      firstName, lastName, email, mobile, profilePicture,
      licenseNumber, licenseCategory, licenseExpiryDate, safetyScore, status
    } = req.body;

    if (!firstName || !lastName || !email || !mobile || !licenseNumber || !licenseCategory || !licenseExpiryDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const driverRole = await Role.findOne({ name: 'Driver' });
      if (!driverRole) return res.status(500).json({ success: false, message: 'Driver role not found' });

      user = await User.create({
        firstName, lastName, email, mobile,
        profilePicture: profilePicture || '',
        role: driverRole._id,
        password: 'transitops_driver_123'
      });
    }

    const userLinkedDriver = await Driver.findOne({ user: user._id });
    if (userLinkedDriver) {
      return res.status(400).json({ success: false, message: 'This User is already linked to a Driver profile' });
    }

    const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingDriver) {
      return res.status(400).json({ success: false, message: 'A driver with this license number already exists' });
    }

    const driver = await Driver.create({
      licenseNumber: licenseNumber.trim(),
      licenseCategory: licenseCategory.trim(),
      licenseExpiryDate,
      safetyScore: safetyScore || 100,
      status: status || 'Available',
      user: user._id
    });

    return res.status(201).json({ success: true, message: 'Driver created successfully', data: driver });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
const getAllDrivers = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.licenseCategory) query.licenseCategory = req.query.licenseCategory;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    const total = await Driver.countDocuments(query);
    const drivers = await Driver.find(query)
      .populate('user', 'firstName lastName email mobile profilePicture role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: drivers,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single driver by ID
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const driver = await Driver.findById(id).populate('user', 'firstName lastName email mobile profilePicture role');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    return res.status(200).json({ success: true, data: driver });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update driver details
// @route   PUT /api/drivers/:id
// @access  Private
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const {
      firstName, lastName, email, mobile, profilePicture,
      licenseNumber, licenseCategory, licenseExpiryDate, safetyScore, status
    } = req.body;

    if (licenseNumber) {
      const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.trim(), _id: { $ne: id } });
      if (existingDriver) return res.status(400).json({ success: false, message: 'License number already exists' });
    }

    const driver = await Driver.findById(id).populate('user');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (driver.user) {
      if (firstName !== undefined) driver.user.firstName = firstName;
      if (lastName !== undefined) driver.user.lastName = lastName;
      if (email !== undefined) driver.user.email = email;
      if (mobile !== undefined) driver.user.mobile = mobile;
      if (profilePicture !== undefined) driver.user.profilePicture = profilePicture;
      await driver.user.save();
    }

    if (licenseNumber !== undefined) driver.licenseNumber = licenseNumber.trim();
    if (licenseCategory !== undefined) driver.licenseCategory = licenseCategory.trim();
    if (licenseExpiryDate !== undefined) driver.licenseExpiryDate = licenseExpiryDate;
    if (safetyScore !== undefined) driver.safetyScore = safetyScore;
    if (status !== undefined) driver.status = status;

    const updatedDriver = await driver.save();
    return res.status(200).json({ success: true, message: 'Driver updated successfully', data: updatedDriver });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const driver = await Driver.findById(id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const Vehicle = require('../models/Vehicle');
    const linkedVehicles = await Vehicle.countDocuments({ driver: id });
    if (linkedVehicles > 0) return res.status(400).json({ success: false, message: 'Cannot delete driver assigned to vehicles' });

    await driver.deleteOne();
    return res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createDriver, getAllDrivers, getDriverById, updateDriver, deleteDriver };
