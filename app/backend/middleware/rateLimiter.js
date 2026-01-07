/**
 * Middleware de Rate Limiting
 * Protège contre les attaques brute-force et le spam
 */
const rateLimit = require('express-rate-limit');

/**
 * Limiteur global - toutes les requêtes API
 * 100 requêtes par minute par IP
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requêtes max par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer dans une minute'
  },
  standardHeaders: true, // Retourne les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  skip: (req) => {
    // Ne pas limiter les routes de health check
    return req.path === '/api/health';
  }
});

/**
 * Limiteur strict pour l'authentification
 * 5 tentatives par 15 minutes (protection brute-force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne compte que les échecs
});

/**
 * Limiteur pour la création de compte
 * 3 créations par heure par IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions max
  message: {
    success: false,
    message: 'Trop de créations de compte, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiteur pour la récupération de mot de passe
 * 3 demandes par heure par IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 demandes max
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiteur pour la création de trajets
 * 10 trajets par heure par utilisateur
 */
const tripCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 trajets max
  message: {
    success: false,
    message: 'Trop de trajets créés, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiteur pour les messages
 * 30 messages par minute (anti-spam)
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages max
  message: {
    success: false,
    message: 'Trop de messages envoyés, veuillez patienter'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiteur pour le géocodage
 * 60 requêtes par minute (respecte les limites Nominatim)
 */
const geocodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requêtes max (1/seconde en moyenne)
  message: {
    success: false,
    message: 'Trop de requêtes de géocodage, veuillez patienter'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  tripCreationLimiter,
  messageLimiter,
  geocodeLimiter
};
