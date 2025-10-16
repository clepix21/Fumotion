const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../config/database")

class AuthController {
  // Inscription
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, studentId } = req.body

      console.log("[v0] Tentative d'inscription pour:", email)

      // Vérifier si l'email existe déjà
      const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email])
      if (existingUser) {
        console.log("[v0] Email déjà existant:", email)
        return res.status(400).json({
          success: false,
          message: "Un compte avec cet email existe déjà",
        })
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10)

      // Créer l'utilisateur
      const result = await db.run(
        `INSERT INTO users (email, password, first_name, last_name, phone, student_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, firstName, lastName, phone, studentId],
      )

      console.log("[v0] Utilisateur créé avec ID:", result.id)

      // Générer le token JWT
      const token = jwt.sign({ userId: result.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      // Récupérer les informations de l'utilisateur créé
      const user = await db.get(
        "SELECT id, email, first_name, last_name, phone, student_id, created_at FROM users WHERE id = ?",
        [result.id],
      )

      console.log("[v0] Inscription réussie pour:", email)

      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      console.error("[v0] Erreur lors de l'inscription:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'inscription",
      })
    }
  }

  // Connexion
  async login(req, res) {
    try {
      const { email, password } = req.body

      console.log("[v0] Tentative de connexion pour:", email)

      // Vérifier si l'utilisateur existe
      const user = await db.get(
        "SELECT id, email, password, first_name, last_name, phone, is_active FROM users WHERE email = ?",
        [email],
      )

      if (!user) {
        console.log("[v0] Utilisateur non trouvé:", email)
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        })
      }

      if (!user.is_active) {
        console.log("[v0] Compte désactivé:", email)
        return res.status(401).json({
          success: false,
          message: "Compte désactivé",
        })
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log("[v0] Mot de passe incorrect pour:", email)
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        })
      }

      // Générer le token JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      // Retourner les informations utilisateur (sans le mot de passe)
      const { password: _, ...userInfo } = user

      console.log("[v0] Connexion réussie pour:", email)

      res.json({
        success: true,
        message: "Connexion réussie",
        data: {
          user: userInfo,
          token,
        },
      })
    } catch (error) {
      console.error("[v0] Erreur lors de la connexion:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la connexion",
      })
    }
  }

  // Profil utilisateur
  async getProfile(req, res) {
    try {
      const user = await db.get(
        `SELECT u.*, 
                COUNT(DISTINCT t.id) as trips_created,
                COUNT(DISTINCT b.id) as bookings_made,
                AVG(r.rating) as average_rating
         FROM users u
         LEFT JOIN trips t ON u.id = t.driver_id
         LEFT JOIN bookings b ON u.id = b.passenger_id
         LEFT JOIN reviews r ON u.id = r.reviewed_id
         WHERE u.id = ?
         GROUP BY u.id`,
        [req.user.id],
      )

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        })
      }

      const { password: _, ...userProfile } = user

      res.json({
        success: true,
        data: userProfile,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
      })
    }
  }

  // Mise à jour du profil
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone, studentId } = req.body
      const userId = req.user.id

      await db.run(
        `UPDATE users 
         SET first_name = ?, last_name = ?, phone = ?, student_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [firstName, lastName, phone, studentId, userId],
      )

      const updatedUser = await db.get(
        "SELECT id, email, first_name, last_name, phone, student_id FROM users WHERE id = ?",
        [userId],
      )

      res.json({
        success: true,
        message: "Profil mis à jour avec succès",
        data: updatedUser,
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour",
      })
    }
  }

  // Vérification du token
  async verifyToken(req, res) {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    })
  }
}

module.exports = new AuthController()
