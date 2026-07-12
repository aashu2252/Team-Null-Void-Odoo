const express = require('express');
const router = express.Router();
const {
  createMaintenanceRecord,
  getAllMaintenanceRecords,
  getMaintenanceById,
  updateMaintenanceRecord,
  deleteMaintenanceRecord
} = require('../controllers/maintenance.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all endpoints in this router using the existing JWT authentication middleware
router.use(protect);

// RESTful routes for Maintenance CRUD
router.post('/', createMaintenanceRecord);
router.get('/', getAllMaintenanceRecords);
router.get('/:id', getMaintenanceById);
router.put('/:id', updateMaintenanceRecord);
router.delete('/:id', deleteMaintenanceRecord);

module.exports = router;
