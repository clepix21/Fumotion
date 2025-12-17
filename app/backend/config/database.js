const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

class Database {
  constructor() {
    this.pool = null
  }

  async connect() {
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fumotion",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }

    // Fonction de réessai pour attendre que MySQL soit prêt
    const connectWithRetry = async (retries = 5, delay = 5000) => {
      try {
        this.pool = mysql.createPool(dbConfig)
        // Tester la connexion
        await this.pool.query("SELECT 1")
        console.log("✅ Connecté à la base de données MySQL")
        console.log(`📍 Host: ${dbConfig.host}, Database: ${dbConfig.database}`)
        await this.initTables()
      } catch (err) {
        if (retries === 0) {
          console.error("❌ Impossible de se connecter à la base de données après plusieurs tentatives:", err)
          throw err
        }
        console.log(`⚠️ Échec de connexion à MySQL. Nouvelle tentative dans ${delay / 1000}s... (${retries} restants)`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        await connectWithRetry(retries - 1, delay)
      }
    }

    await connectWithRetry()
  }

  async initTables() {
    const queries = [
      // Table des utilisateurs
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Table des véhicules
      `CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        user_id INTEGER NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        color VARCHAR(50),
        license_plate VARCHAR(20),
        seats INTEGER NOT NULL DEFAULT 4,
        year INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Table des trajets
      `CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
      )`,

      // Table des réservations
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        trip_id INTEGER NOT NULL,
        passenger_id INTEGER NOT NULL,
        seats_booked INTEGER NOT NULL DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(trip_id, passenger_id)
      )`,

      // Table des évaluations
      `CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        booking_id INTEGER NOT NULL,
        reviewer_id INTEGER NOT NULL,
        reviewed_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        type VARCHAR(20) NOT NULL CHECK(type IN ('driver', 'passenger')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(booking_id, reviewer_id)
      )`,

      // Table des messages
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        trip_id INTEGER,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    ]

    for (const query of queries) {
      try {
        await this.pool.query(query)
      } catch (err) {
        console.error("Erreur lors de la création des tables:", err)
        throw err
      }
    }

    console.log("Tables initialisées avec succès")
    await this.createDefaultData()
  }

  async createDefaultData() {
    // Vérifier et ajouter des colonnes manquantes (migration simple)
    try {
      const [columns] = await this.pool.query("DESCRIBE users")
      const columnNames = columns.map((col) => col.Field)

      const hasBannerPicture = columnNames.includes("banner_picture")
      const hasIsAdmin = columnNames.includes("is_admin")

      if (!hasBannerPicture) {
        await this.pool.query("ALTER TABLE users ADD COLUMN banner_picture VARCHAR(255)")
        console.log("✅ Colonne banner_picture ajoutée")
      }

      if (!hasIsAdmin) {
        await this.pool.query("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
        console.log("✅ Colonne is_admin ajoutée")
      }

      // Migration for messages table
      const [msgColumns] = await this.pool.query("DESCRIBE messages")
      const msgColumnNames = msgColumns.map((col) => col.Field)

      if (!msgColumnNames.includes("receiver_id")) {
        await this.pool.query("ALTER TABLE messages ADD COLUMN receiver_id INTEGER")
        await this.pool.query("ALTER TABLE messages ADD CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE")
        console.log("✅ Colonne receiver_id ajoutée à la table messages")
      }

      // Make trip_id nullable if it's currently NOT NULL (MySQL specific roughly, usually easier to just modify column)
      // Note: modifying column to remove NOT NULL might vary by SQL dialect/version, but standard MySQL:
      await this.pool.query("ALTER TABLE messages MODIFY COLUMN trip_id INTEGER NULL")

      await this.createAdminUser()
    } catch (err) {
      console.error("Erreur lors de la vérification des colonnes:", err)
    }
  }

  async createAdminUser() {
    const adminEmail = "admin@fumotion.com"
    const adminPassword = await bcrypt.hash("admin123", 10)

    try {
      const [rows] = await this.pool.execute("SELECT id FROM users WHERE email = ?", [adminEmail])
      
      if (rows.length === 0) {
        await this.pool.execute(
          `INSERT INTO users (email, password, first_name, last_name, phone, is_verified, is_admin) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [adminEmail, adminPassword, "Admin", "Fumotion", "0123456789", 1, 1],
        )
        console.log("✅ Utilisateur admin créé avec succès")
        console.log("📧 Email: admin@fumotion.com")
        console.log("🔑 Mot de passe: admin123")
      } else {
        await this.pool.execute(
          "UPDATE users SET is_admin = 1, is_verified = 1 WHERE email = ?",
          [adminEmail]
        )
        console.log("ℹ️  Utilisateur admin déjà existant (droits vérifiés)")
      }
    } catch (err) {
      console.error("❌ Erreur lors de la gestion de l'admin:", err)
    }
  }

  // Wrapper methods compatibe with existing code
  async get(query, params = []) {
    try {
      const [rows] = await this.pool.execute(query, params)
      return rows[0]
    } catch (err) {
      console.error("Erreur DB get:", err)
      throw err
    }
  }

  async all(query, params = []) {
    try {
      const [rows] = await this.pool.execute(query, params)
      return rows
    } catch (err) {
      console.error("Erreur DB all:", err)
      throw err
    }
  }

  async run(query, params = []) {
    try {
      const [result] = await this.pool.execute(query, params)
      return { id: result.insertId, changes: result.affectedRows }
    } catch (err) {
      // console.error("Erreur DB run:", err) // Décommenter si besoin de debug
      throw err
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end()
      console.log("Connexion à la base de données fermée")
    }
  }
}

module.exports = new Database()
