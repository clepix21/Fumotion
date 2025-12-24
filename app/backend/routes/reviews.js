const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

// Créer une évaluation pour une réservation
router.post('/bookings/:bookingId', authMiddleware, ReviewController.createReview);

// Récupérer les évaluations en attente de l'utilisateur connecté
router.get('/pending', authMiddleware, ReviewController.getPendingReviews);

// Vérifier si une évaluation existe
router.get('/check/:bookingId', authMiddleware, ReviewController.checkReviewExists);

// Récupérer les évaluations d'un utilisateur
router.get('/user/:userId', ReviewController.getUserReviews);

module.exports = router;
