const express = require('express');
const router = express.Router();
const {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/trip.controller');
const protect = require('../middleware/auth.middleware');

// Protect all endpoints in this router using the existing JWT authentication middleware
router.use(protect);

// RESTful routes for Trip CRUD
router.post('/', createTrip);
router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
