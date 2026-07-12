const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const protect = require('../middleware/auth.middleware');

// Public endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected test endpoint to verify JWT auth middleware
router.get('/profile-test', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to secure route data.',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
