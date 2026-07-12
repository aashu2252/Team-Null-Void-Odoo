const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const {
      vehicle,
      trip,
      type,
      amount,
      description,
      date
    } = req.body;

    // Check required fields
    if (!vehicle || !trip || !type || amount === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: vehicle, trip, type, amount, date'
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

    // Create Expense
    const expense = await Expense.create({
      vehicle,
      trip,
      type,
      amount,
      description: description ? description.trim() : undefined,
      date
    });

    const populatedExpense = await Expense.findById(expense._id).populate('vehicle').populate('trip');

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all expenses (with pagination, filtering, populate & sorting)
// @route   GET /api/expenses
// @access  Private
const getAllExpenses = async (req, res) => {
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
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.date) {
      query.date = req.query.date;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('vehicle')
      .populate('trip')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: {
        expenses,
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

// @desc    Get expense by ID (with populate)
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Expense ID format'
      });
    }

    const expense = await Expense.findById(id).populate('vehicle').populate('trip');
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense retrieved successfully',
      data: expense
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update expense details
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Expense ID format'
      });
    }

    const {
      vehicle,
      trip,
      type,
      amount,
      description,
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

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update fields
    if (vehicle !== undefined) expense.vehicle = vehicle;
    if (trip !== undefined) expense.trip = trip;
    if (type !== undefined) expense.type = type;
    if (amount !== undefined) expense.amount = amount;
    if (description !== undefined) expense.description = description.trim();
    if (date !== undefined) expense.date = date;

    const updatedExpense = await expense.save();

    const populatedExpense = await Expense.findById(updatedExpense._id).populate('vehicle').populate('trip');

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: populatedExpense
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Expense ID format'
      });
    }

    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: expense
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
