const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).populate('role');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    const updatableFields = ['firstName', 'lastName', 'email', 'role', 'isActive', 'password'];
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        // Only update password if it is actually provided (not empty string)
        if (field === 'password' && req.body.password.trim() === '') {
          continue;
        }
        user[field] = req.body[field];
      }
    }

    await user.save();
    
    // Populate role for response
    await user.populate('role');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('role');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role && user.role.name === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete a Super Admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser
};
