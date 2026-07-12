const mongoose = require('mongoose');
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// @desc    Create a new maintenance record
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceRecord = async (req, res) => {
  try {
    const {
      vehicle,
      title,
      description,
      cost,
      startDate,
      endDate,
      status
    } = req.body;

    // Check required fields
    if (!vehicle || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: vehicle, title'
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(vehicle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Vehicle ID format'
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

    const maintenanceLog = await MaintenanceLog.create({
      vehicle,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      cost,
      startDate,
      endDate,
      status
    });

    return res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenanceLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all maintenance records (with pagination, filtering, populate & sorting)
// @route   GET /api/maintenance
// @access  Private
const getAllMaintenanceRecords = async (req, res) => {
  try {
    const query = {};

    // Specific filters
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
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

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await MaintenanceLog.countDocuments(query);
    const maintenanceRecords = await MaintenanceLog.find(query)
      .populate('vehicle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Maintenance records retrieved successfully',
      data: {
        maintenanceRecords,
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

// @desc    Get maintenance record by ID (with populate)
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Maintenance Record ID format'
      });
    }

    const maintenanceRecord = await MaintenanceLog.findById(id).populate('vehicle');
    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Maintenance record retrieved successfully',
      data: maintenanceRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update maintenance record details
// @route   PUT /api/maintenance/:id
// @access  Private
const updateMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Maintenance Record ID format'
      });
    }

    const {
      vehicle,
      title,
      description,
      cost,
      startDate,
      endDate,
      status
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

    const maintenanceRecord = await MaintenanceLog.findById(id);
    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    // Update fields
    if (vehicle !== undefined) maintenanceRecord.vehicle = vehicle;
    if (title !== undefined) maintenanceRecord.title = title.trim();
    if (description !== undefined) maintenanceRecord.description = description.trim();
    if (cost !== undefined) maintenanceRecord.cost = cost;
    if (startDate !== undefined) maintenanceRecord.startDate = startDate;
    if (endDate !== undefined) maintenanceRecord.endDate = endDate;
    if (status !== undefined) maintenanceRecord.status = status;

    const updatedRecord = await maintenanceRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private
const deleteMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Maintenance Record ID format'
      });
    }

    const maintenanceRecord = await MaintenanceLog.findByIdAndDelete(id);
    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully',
      data: maintenanceRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createMaintenanceRecord,
  getAllMaintenanceRecords,
  getMaintenanceById,
  updateMaintenanceRecord,
  deleteMaintenanceRecord
};
