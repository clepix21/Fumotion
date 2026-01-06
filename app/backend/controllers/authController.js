/**
 * Contrôleur d'authentification
 * Gère inscription, connexion, profil et mot de passe
 */
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../config/database")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const nodemailer = require("nodemailer");

class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   * Hash le mot de passe et génère un token JWT
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, studentId, university } = req.body

      console.log("Tentative d'inscription pour:", email)

      // Vérifier l'unicité de l'email
      const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email])
      if (existingUser) {
        console.log("Email déjà existant:", email)
        return res.status(400).json({
          success: false,
          message: "Un compte avec cet email existe déjà",
        })
      }

      // Sécuriser le mot de passe avec bcrypt (10 rounds)
      const hashedPassword = await bcrypt.hash(password, 10)

      // Créer l'utilisateur
      const result = await db.run(
        `INSERT INTO users (email, password, first_name, last_name, phone, student_id, university) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, firstName, lastName, phone, studentId, university || 'IUT Amiens'],
      )

      console.log("Utilisateur créé avec ID:", result.id)

      // Générer le token JWT
      const token = jwt.sign({ userId: result.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      // Récupérer les informations de l'utilisateur créé
      const user = await db.get(
        "SELECT id, email, first_name, last_name, phone, student_id, created_at FROM users WHERE id = ?",
        [result.id],
      )

      console.log("Inscription réussie pour:", email)

      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
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

      console.log("Tentative de connexion pour:", email)

      // Vérifier si l'utilisateur existe
      const user = await db.get(
        "SELECT id, email, password, first_name, last_name, phone, is_active, is_admin, profile_picture FROM users WHERE email = ?",
        [email],
      )

      if (!user) {
        console.log("Utilisateur non trouvé:", email)
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        })
      }

      if (!user.is_active) {
        console.log("Compte désactivé:", email)
        return res.status(401).json({
          success: false,
          message: "Compte désactivé",
        })
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log("Mot de passe incorrect pour:", email)
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        })
      }

      // Générer le token JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      // Retourner les informations utilisateur (sans le mot de passe)
      const { password: _, ...userInfo } = user

      console.log("Connexion réussie pour:", email)

      res.json({
        success: true,
        message: "Connexion réussie",
        data: {
          user: userInfo,
          token,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
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
                (SELECT AVG(rating) FROM reviews WHERE reviewed_id = u.id AND type = 'driver') as driver_rating,
                (SELECT AVG(rating) FROM reviews WHERE reviewed_id = u.id AND type = 'passenger') as passenger_rating,
                (SELECT AVG(rating) FROM reviews WHERE reviewed_id = u.id) as average_rating
         FROM users u
         LEFT JOIN trips t ON u.id = t.driver_id
         LEFT JOIN bookings b ON u.id = b.passenger_id
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
      const { firstName, lastName, phone, studentId, bio } = req.body
      const userId = req.user.id

      await db.run(
        `UPDATE users 
         SET first_name = ?, last_name = ?, phone = ?, student_id = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [firstName, lastName, phone, studentId, bio, userId],
      )

      const updatedUser = await db.get(
        "SELECT id, email, first_name, last_name, phone, student_id, bio, profile_picture FROM users WHERE id = ?",
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

  // Upload de la bannière
  async uploadBanner(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni",
        })
      }

      const userId = req.user.id
      const filename = req.file.filename

      // Récupérer l'ancienne bannière si elle existe
      const user = await db.get("SELECT banner_picture FROM users WHERE id = ?", [userId])
      if (user && user.banner_picture) {
        const oldFilePath = path.join(__dirname, "../uploads", user.banner_picture)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Mettre à jour la base de données
      await db.run("UPDATE users SET banner_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [filename, userId])

      res.json({
        success: true,
        message: "Bannière mise à jour avec succès",
        data: {
          banner_picture: filename,
        },
      })
    } catch (error) {
      console.error("Erreur lors de l'upload de la bannière:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'upload",
      })
    }
  }

  // Upload de l'avatar
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni",
        })
      }

      const userId = req.user.id
      const filename = req.file.filename

      // Récupérer l'ancien avatar si il existe
      const user = await db.get("SELECT profile_picture FROM users WHERE id = ?", [userId])
      if (user && user.profile_picture) {
        const oldFilePath = path.join(__dirname, "../uploads", user.profile_picture)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Mettre à jour la base de données
      await db.run("UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [filename, userId])

      res.json({
        success: true,
        message: "Photo de profil mise à jour avec succès",
        data: {
          profile_picture: filename,
        },
      })
    } catch (error) {
      console.error("Erreur lors de l'upload de l'avatar:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'upload",
      })
    }
  }

  // Demande de réinitialisation de mot de passe (Email + Token)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body

      console.log("Demande de réinitialisation de mot de passe pour:", email)

      const user = await db.get(
        "SELECT id, email FROM users WHERE email = ?",
        [email]
      )

      // Pour la sécurité, on ne dit pas si l'email existe ou non, sauf logs serveur
      if (!user) {
        console.log("Utilisateur non trouvé (email inconnu)")
        return res.json({
          success: true,
          message: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé."
        })
      }

      // Générer un token sécurisé
      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 3600000) // 1 heure

      // Sauvegarder le token
      await db.run(
        "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
        [token, expires, user.id]
      )

      // Configuration du transporteur Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail", // Peut être changé selon le fournisseur
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      // Générer le lien (Prod vs Dev)
      const baseUrl = process.env.FRONTEND_URL || "https://fumotion.tech";
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      const mailOptions = {
        from: '"Support Fumotion" <fumotion.help@gmail.com>',
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur Fumotion.</p>
            <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
            <p>
              <a href="${resetLink}" style="background-color: #5B9FED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p style="font-size: 0.9em; color: #777;">Ce lien est valide pour 1 heure.</p>
            <hr>
            <p style="font-size: 0.8em; color: #999;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
          </div>
        `,
      }

      // Envoi de l'email
      try {
        await transporter.sendMail(mailOptions)
        console.log(`📧 Email de réinitialisation envoyé à ${email}`)
      } catch (emailError) {
        console.error("Erreur d'envoi d'email:", emailError)
        // On ne bloque pas la réponse pour autant
      }

      res.json({
        success: true,
        message: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé."
      })
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la demande"
      })
    }
  }

  // Effectuer la réinitialisation (Token + Nouveau mot de passe)
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body

      console.log("Tentative de réinitialisation avec token")

      // Vérifier le token et l'expiration
      const user = await db.get(
        "SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
        [token]
      )

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Le lien de réinitialisation est invalide ou a expiré."
        })
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10)

      // Mettre à jour le mot de passe et effacer le token
      await db.run(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, user.id]
      )

      console.log("Mot de passe réinitialisé avec succès pour:", user.email)

      res.json({
        success: true,
        message: "Votre mot de passe a été modifié avec succès."
      })
    } catch (error) {
      console.error("Erreur lors de la réinitialisation finale:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la réinitialisation"
      })
    }
  }

  // Récupérer le profil public d'un utilisateur par ID
  async getUserPublicProfile(req, res) {
    try {
      const { id } = req.params;
      const user = await db.get(
        "SELECT id, first_name, last_name, profile_picture, created_at, last_active_at FROM users WHERE id = ?",
        [id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error("Erreur getUserPublicProfile:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }
}

module.exports = new AuthController()
