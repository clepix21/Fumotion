const bcrypt = require("bcryptjs")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")

// Connexion à la base de données
const dbPath = path.join(__dirname, "../database/fumotion.db")
const db = new sqlite3.Database(dbPath)

const testUsers = [
  {
    email: "pierre.martin@etudiant.univ-amiens.fr",
    password: "password123",
    firstName: "Pierre",
    lastName: "Martin",
    phone: "0612345678",
    studentId: "IUT2024001",
    university: "IUT Amiens",
  },
  {
    email: "marie.dubois@etudiant.u-picardie.fr",
    password: "password123",
    firstName: "Marie",
    lastName: "Dubois",
    phone: "0623456789",
    studentId: "UPJV2024002",
    university: "UPJV Campus Citadelle",
  },
  {
    email: "thomas.leroy@etudiant.univ-amiens.fr",
    password: "password123",
    firstName: "Thomas",
    lastName: "Leroy",
    phone: "0634567890",
    studentId: "IUT2024003",
    university: "IUT Amiens",
  },
]

async function seedTestUsers() {
  console.log("🌱 Création des utilisateurs de test...\n")

  for (const user of testUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE email = ?", [user.email], (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      })

      if (existingUser) {
        console.log(`⏭️  ${user.email} existe déjà`)
        continue
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10)

      // Créer l'utilisateur
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (email, password, first_name, last_name, phone, student_id, university, is_verified) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [user.email, hashedPassword, user.firstName, user.lastName, user.phone, user.studentId, user.university],
          function (err) {
            if (err) reject(err)
            else resolve(this.lastID)
          },
        )
      })

      console.log(`✅ ${user.firstName} ${user.lastName} (${user.email}) créé avec succès`)
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${user.email}:`, error.message)
    }
  }

  console.log("\n✨ Utilisateurs de test créés avec succès!\n")
  console.log("📝 Vous pouvez maintenant vous connecter avec:")
  console.log("   Email: pierre.martin@etudiant.univ-amiens.fr")
  console.log("   Mot de passe: password123\n")

  db.close()
}

seedTestUsers().catch(console.error)
