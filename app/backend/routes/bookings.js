/**
 * Routes des réservations
 * /api/bookings/... - Toutes protégées par auth
 */
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

// Toutes les routes nécessitent une authentification
router.post('/trips/:tripId/book', authMiddleware, validateBooking, BookingController.createBooking); // Réserver
router.get('/', authMiddleware, BookingController.getMyBookings);           // Mes réservations
router.get('/my-trips', authMiddleware, BookingController.getBookingsForMyTrips); // Réservations sur mes trajets
router.get('/:id', authMiddleware, BookingController.getBookingById);       // Détails
router.put('/:id/cancel', authMiddleware, BookingController.cancelBooking); // Annuler
router.put('/:id/status', authMiddleware, BookingController.updateBookingStatus); // Changer statut

module.exports = router;