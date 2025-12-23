const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d\'accès requis' 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier que l'utilisateur existe toujours
      const user = await db.get(
        'SELECT id, email, first_name, last_name, is_active, is_admin FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Utilisateur non trouvé ou désactivé' 
        });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('Erreur JWT:', jwtError);
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
  } catch (error) {
    console.error('Erreur dans authMiddleware:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la vérification du token' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  
  // Pas de token, continuer sans utilisateur
  req.user = null;
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth
};