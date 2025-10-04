const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

// Toutes les routes de réservation nécessitent une authentification
router.post('/trips/:tripId/book', authMiddleware, validateBooking, BookingController.createBooking);
router.get('/', authMiddleware, BookingController.getMyBookings);
router.get('/my-trips', authMiddleware, BookingController.getBookingsForMyTrips);
router.get('/:id', authMiddleware, BookingController.getBookingById);
router.put('/:id/cancel', authMiddleware, BookingController.cancelBooking);
router.put('/:id/status', authMiddleware, BookingController.updateBookingStatus);

module.exports = router;