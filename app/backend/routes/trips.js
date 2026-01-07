/**
 * Routes des trajets
 * /api/trips/...
 */
const express = require('express');
const router = express.Router();
const TripController = require('../controllers/tripController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validateTripCreation } = require('../middleware/validation');
const { tripCreationLimiter } = require('../middleware/rateLimiter');

// ========== ROUTES PUBLIQUES (auth optionnelle) ==========
router.get('/search', optionalAuth, TripController.searchTrips); // Recherche de trajets
router.get('/:id', optionalAuth, TripController.getTripById);    // Détails d'un trajet

// ========== ROUTES PROTÉGÉES (token requis) ==========
router.post('/', authMiddleware, tripCreationLimiter, validateTripCreation, TripController.createTrip); // Créer
router.get('/', authMiddleware, TripController.getMyTrips);      // Mes trajets
router.put('/:id', authMiddleware, TripController.updateTrip);   // Modifier
router.put('/:id/complete', authMiddleware, TripController.completeTrip); // Terminer
router.delete('/:id', authMiddleware, TripController.cancelTrip); // Annuler

module.exports = router;