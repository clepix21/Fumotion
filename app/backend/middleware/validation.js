const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array()
    });
  }
  next();
};

// Validation pour l'inscription
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone invalide'),
  handleValidationErrors
];

// Validation pour la connexion
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  handleValidationErrors
];

// Validation pour la création de trajet
const validateTripCreation = [
  body('departureLocation')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Le lieu de départ doit contenir au moins 3 caractères'),
  body('arrivalLocation')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Le lieu d\'arrivée doit contenir au moins 3 caractères'),
  body('departureDateTime')
    .isISO8601()
    .custom((value) => {
      const departureDate = new Date(value);
      const now = new Date();
      if (departureDate <= now) {
        throw new Error('La date de départ doit être dans le futur');
      }
      return true;
    }),
  body('availableSeats')
    .isInt({ min: 1, max: 8 })
    .withMessage('Le nombre de places doit être entre 1 et 8'),
  body('pricePerSeat')
    .isFloat({ min: 0 })
    .withMessage('Le prix par place doit être un nombre positif'),
  handleValidationErrors
];

// Validation pour la réservation
const validateBooking = [
  body('seatsBooked')
    .isInt({ min: 1, max: 8 })
    .withMessage('Le nombre de places à réserver doit être entre 1 et 8'),
  handleValidationErrors
];

// Validation pour l'évaluation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateTripCreation,
  validateBooking,
  validateReview,
  handleValidationErrors
};