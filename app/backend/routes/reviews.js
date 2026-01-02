/**
 * Routes des évaluations
 * /api/reviews/... - Permet de noter les trajets effectués
 */
const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

router.post('/bookings/:bookingId', authMiddleware, ReviewController.createReview);  // Créer une évaluation
router.get('/pending', authMiddleware, ReviewController.getPendingReviews);          // Évaluations en attente
router.get('/check/:bookingId', authMiddleware, ReviewController.checkReviewExists); // Vérifier si déjà noté
router.get('/user/:userId', ReviewController.getUserReviews);                         // Notes d'un utilisateur

module.exports = router;
