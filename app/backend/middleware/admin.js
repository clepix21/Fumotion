/**
 * Middleware de vérification des droits administrateur
 * Vérifie que l'utilisateur connecté a le rôle admin
 */
const db = require("../config/database")

exports.isAdmin = async (req, res, next) => {
  try {
    // Vérifie que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      })
    }

    // Vérifie le flag is_admin en base
    const user = await db.get(
      "SELECT is_admin FROM users WHERE id = ?",
      [req.user.id]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      })
    }

    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : droits administrateur requis"
      })
    }

    next()
  } catch (error) {
    console.error("Erreur middleware admin:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    })
  }
}
