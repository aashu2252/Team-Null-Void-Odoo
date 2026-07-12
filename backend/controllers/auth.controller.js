const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// Helper function to sign JWT tokens
const generateToken = (id, role, permissions) => {
  return jwt.sign(
    { id, role, permissions },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName: firstNameInput, lastName: lastNameInput, fullName, email, password, role, mobile, address } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const nameParts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    const firstName = String(firstNameInput || (nameParts[0] || '')).trim();
    const lastName = String(lastNameInput || (nameParts.slice(1).join(' ') || 'User')).trim();

    let resolvedRoleId = null;
    if (role) {
      if (mongoose.isValidObjectId(role)) {
        resolvedRoleId = role;
      } else {
        const roleDoc = await Role.findOne({ name: { $regex: `^${String(role).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
        if (roleDoc) {
          resolvedRoleId = roleDoc._id;
        }
      }
    }

    if (!resolvedRoleId) {
      const fallbackRole = await Role.findOne({ name: 'Dispatcher' }) || await Role.findOne({});
      if (!fallbackRole) {
        return res.status(400).json({
          success: false,
          message: 'No role available for user creation'
        });
      }
      resolvedRoleId = fallbackRole._id;
    }

    // Check if email already registered
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create and save new user
    let user = await User.create({
      firstName: firstName || 'User',
      lastName: lastName || 'User',
      email: normalizedEmail,
      password,
      role: resolvedRoleId,
      mobile,
      address
    });

    user = await user.populate('role');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          mobile: user.mobile,
          address: user.address,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    // Locate the user and populate role to get permissions
    const user = await User.findOne({ email: { $regex: emailRegex } }).populate('role');
    console.log("userrr", user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    console.log("userrr", isMatch)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Extract permissions for token payload
    const permissions = user.role && user.role.permissions ? user.role.permissions : [];

    // Generate JWT token
    const token = generateToken(user._id, user.role?._id, permissions);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role, // Contains the full populated role object
          profilePicture: user.profilePicture,
          mobile: user.mobile,
          address: user.address,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).populate('role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        address: user.address,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
