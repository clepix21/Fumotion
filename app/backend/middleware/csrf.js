/**
 * Middleware de protection CSRF
 * Implémente le pattern Double Submit Cookie
 * 
 * Fonctionnement :
 * 1. Le serveur génère un token CSRF et l'envoie via cookie + header
 * 2. Le client doit renvoyer ce token dans le header X-CSRF-Token
 * 3. Le serveur vérifie que les deux correspondent
 */
const crypto = require('crypto');

// Durée de validité du token CSRF (1 heure)
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000;

// Nom du cookie et du header
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Génère un token CSRF sécurisé
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware pour générer et envoyer le token CSRF
 * À appeler sur les routes GET qui précèdent les formulaires
 */
const csrfTokenGenerator = (req, res, next) => {
  // Générer un nouveau token
  const csrfToken = generateCsrfToken();

  // Stocker dans un cookie HttpOnly
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: CSRF_TOKEN_EXPIRY
  });

  // Ajouter au header de réponse pour que le client puisse le récupérer
  res.setHeader(CSRF_HEADER_NAME, csrfToken);

  next();
};

/**
 * Middleware de validation CSRF
 * Vérifie que le token du header correspond au cookie
 */
const csrfProtection = (req, res, next) => {
  // Ignorer les méthodes sûres (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // En développement, on peut désactiver la protection CSRF
  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_CSRF === 'true') {
    return next();
  }

  // Récupérer le token du cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  // Récupérer le token du header
  const headerToken = req.headers[CSRF_HEADER_NAME];

  // Vérifier la présence des tokens
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: 'Token CSRF manquant'
    });
  }

  // Comparer les tokens de manière sécurisée (timing-safe)
  try {
    const cookieBuffer = Buffer.from(cookieToken);
    const headerBuffer = Buffer.from(headerToken);

    if (cookieBuffer.length !== headerBuffer.length ||
      !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
      return res.status(403).json({
        success: false,
        message: 'Token CSRF invalide'
      });
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token CSRF invalide'
    });
  }

  next();
};

/**
 * Route pour obtenir un nouveau token CSRF
 * Le client appelle cette route au chargement de l'app
 */
const csrfTokenRoute = (req, res) => {
  const csrfToken = generateCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: CSRF_TOKEN_EXPIRY
  });

  res.json({
    success: true,
    csrfToken: csrfToken
  });
};

module.exports = {
  csrfProtection,
  csrfTokenGenerator,
  csrfTokenRoute,
  CSRF_HEADER_NAME,
  CSRF_COOKIE_NAME
};
