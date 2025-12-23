const express = require('express');
const router = express.Router();
const TripController = require('../controllers/tripController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validateTripCreation } = require('../middleware/validation');

// Routes publiques (avec auth optionnelle)
router.get('/search', optionalAuth, TripController.searchTrips);
router.get('/:id', optionalAuth, TripController.getTripById);

// Routes protégées
router.post('/', authMiddleware, validateTripCreation, TripController.createTrip);
router.get('/', authMiddleware, TripController.getMyTrips);
router.put('/:id', authMiddleware, TripController.updateTrip);
router.put('/:id/complete', authMiddleware, TripController.completeTrip);
router.delete('/:id', authMiddleware, TripController.cancelTrip);

module.exports = router;