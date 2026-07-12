const express = require('express');
const router = express.Router();
const {
  createFuelLog,
  getAllFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog
} = require('../controllers/fuelLog.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all endpoints in this router using the existing JWT authentication middleware
router.use(protect);

// RESTful routes for Fuel Log CRUD
router.post('/', createFuelLog);
router.get('/', getAllFuelLogs);
router.get('/:id', getFuelLogById);
router.put('/:id', updateFuelLog);
router.delete('/:id', deleteFuelLog);

module.exports = router;
