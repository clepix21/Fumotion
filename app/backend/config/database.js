const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const bcrypt = require("bcryptjs")
const fs = require("fs")

class Database {
  constructor() {
    this.db = null
    const dbDir = path.join(__dirname, "../database")
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      console.log("📁 Dossier database créé")
    }
    this.dbPath = path.join(dbDir, "fumotion.db")
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("❌ Erreur de connexion à la base de données:", err)
          reject(err)
        } else {
          console.log("✅ Connecté à la base de données SQLite")
          console.log("📍 Chemin:", this.dbPath)
          this.initTables().then(resolve).catch(reject)
        }
      })
    })
  }

  async initTables() {
    return new Promise((resolve, reject) => {
      const queries = [
        // Table des utilisateurs
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          student_id VARCHAR(50),
          university VARCHAR(255) DEFAULT 'IUT Amiens',
          profile_picture VARCHAR(255),
          banner_picture VARCHAR(255),
          is_verified BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          is_admin BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // Table des véhicules
        `CREATE TABLE IF NOT EXISTS vehicles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          brand VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          color VARCHAR(50),
          license_plate VARCHAR(20),
          seats INTEGER NOT NULL DEFAULT 4,
          year INTEGER,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // Table des trajets
        `CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          driver_id INTEGER NOT NULL,
          vehicle_id INTEGER,
          departure_location VARCHAR(255) NOT NULL,
          departure_latitude DECIMAL(10, 8),
          departure_longitude DECIMAL(11, 8),
          arrival_location VARCHAR(255) NOT NULL,
          arrival_latitude DECIMAL(10, 8),
          arrival_longitude DECIMAL(11, 8),
          departure_datetime DATETIME NOT NULL,
          available_seats INTEGER NOT NULL,
          price_per_seat DECIMAL(10, 2) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
        )`,

        // Table des réservations
        `CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          passenger_id INTEGER NOT NULL,
          seats_booked INTEGER NOT NULL DEFAULT 1,
          total_price DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
          payment_status VARCHAR(20) DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
          booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(trip_id, passenger_id)
        )`,

        // Table des évaluations
        `CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          booking_id INTEGER NOT NULL,
          reviewer_id INTEGER NOT NULL,
          reviewed_id INTEGER NOT NULL,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
          comment TEXT,
          type VARCHAR(20) NOT NULL CHECK(type IN ('driver', 'passenger')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(booking_id, reviewer_id)
        )`,

        // Table des messages
        `CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
      ]

      let completed = 0
      const total = queries.length

      queries.forEach((query) => {
        this.db.run(query, (err) => {
          if (err) {
            console.error("Erreur lors de la création des tables:", err)
            reject(err)
            return
          }

          completed++
          if (completed === total) {
            console.log("Tables initialisées avec succès")
            this.createDefaultData().then(resolve).catch(reject)
          }
        })
      })
    })
  }

  async createDefaultData() {
    // Ajouter les colonnes manquantes si nécessaire
    return new Promise((resolve) => {
      this.db.all("PRAGMA table_info(users)", (err, columns) => {
        if (err) {
          console.error("Erreur lors de la vérification des colonnes:", err)
          resolve()
          return
        }

        const hasBannerPicture = columns.some(col => col.name === 'banner_picture')
        const hasIsAdmin = columns.some(col => col.name === 'is_admin')
        
        const addColumns = []
        
        if (!hasBannerPicture) {
          addColumns.push(new Promise((res) => {
            this.db.run("ALTER TABLE users ADD COLUMN banner_picture VARCHAR(255)", (err) => {
              if (err) console.error("Erreur lors de l'ajout de banner_picture:", err)
              else console.log("✅ Colonne banner_picture ajoutée")
              res()
            })
          }))
        }
        
        if (!hasIsAdmin) {
          addColumns.push(new Promise((res) => {
            this.db.run("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0", (err) => {
              if (err) console.error("Erreur lors de l'ajout de is_admin:", err)
              else console.log("✅ Colonne is_admin ajoutée")
              res()
            })
          }))
        }

        Promise.all(addColumns).then(() => {
          this.createAdminUser().then(resolve).catch(() => resolve())
        })
      })
    })
  }

  async createAdminUser() {
    // Créer un utilisateur admin par défaut
    const adminEmail = "admin@fumotion.com"
    const adminPassword = await bcrypt.hash("admin123", 10)

    return new Promise((resolve) => {
      this.db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
        if (!row) {
          this.db.run(
            `INSERT INTO users (email, password, first_name, last_name, phone, is_verified, is_admin) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [adminEmail, adminPassword, "Admin", "Fumotion", "0123456789", 1, 1],
            (err) => {
              if (err) {
                console.error("❌ Erreur lors de la création de l'admin:", err)
              } else {
                console.log("✅ Utilisateur admin créé avec succès")
                console.log("📧 Email: admin@fumotion.com")
                console.log("🔑 Mot de passe: admin123")
              }
              resolve()
            },
          )
        } else {
          // S'assurer que l'utilisateur admin existant a les droits admin
          this.db.run(
            "UPDATE users SET is_admin = 1, is_verified = 1 WHERE email = ?",
            [adminEmail],
            (err) => {
              if (err) {
                console.error("❌ Erreur lors de la mise à jour de l'admin:", err)
              } else {
                console.log("ℹ️  Utilisateur admin déjà existant (droits vérifiés)")
              }
              resolve()
            }
          )
        }
      })
    })
  }

  // Méthodes utilitaires pour les requêtes
  async get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  async all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  async run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) reject(err)
        else resolve({ id: this.lastID, changes: this.changes })
      })
    })
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error("Erreur lors de la fermeture de la base de données:", err)
        } else {
          console.log("Connexion à la base de données fermée")
        }
      })
    }
  }
}

module.exports = new Database()
