const express = require('express');
const router = express.Router();
const {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
} = require('../controllers/driver.controller');
const protect = require('../middleware/auth.middleware');

// Protect all endpoints in this router using the existing JWT authentication middleware
router.use(protect);

// RESTful routes for Driver CRUD
router.post('/', createDriver);
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

module.exports = router;
