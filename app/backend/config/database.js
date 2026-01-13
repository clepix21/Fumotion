/**
 * Configuration et gestion de la base de données MySQL
 * Utilise mysql2/promise pour les opérations asynchrones
 */
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

class Database {
  constructor() {
    this.pool = null // Pool de connexions MySQL
  }

  /**
   * Établit la connexion à la base de données avec retry automatique
   * Attend que MySQL soit prêt (utile avec Docker)
   */
  async connect() {
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fumotion",
      waitForConnections: true,
      connectionLimit: 10, // Nombre max de connexions simultanées
      queueLimit: 0,
    }

    // Retry automatique si MySQL n'est pas encore prêt
    const connectWithRetry = async (retries = 5, delay = 5000) => {
      try {
        this.pool = mysql.createPool(dbConfig)
        // Tester la connexion
        await this.pool.query("SELECT 1")
        console.log(" Connecté à la base de données MySQL")
        console.log(`Host: ${dbConfig.host}, Database: ${dbConfig.database}`)
        await this.initTables()
      } catch (err) {
        if (retries === 0) {
          console.error(" Impossible de se connecter à la base de données après plusieurs tentatives:", err)
          throw err
        }
        console.log(`Échec de connexion à MySQL. Nouvelle tentative dans ${delay / 1000}s... (${retries} restants)`)
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
        bio TEXT,
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
      const hasBio = columnNames.includes("bio")

      if (!hasBannerPicture) {
        await this.pool.query("ALTER TABLE users ADD COLUMN banner_picture VARCHAR(255)")
        console.log(" Colonne banner_picture ajoutée")
      }

      if (!hasIsAdmin) {
        await this.pool.query("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
        console.log(" Colonne is_admin ajoutée")
      }

      if (!hasBio) {
        await this.pool.query("ALTER TABLE users ADD COLUMN bio TEXT")
        console.log(" Colonne bio ajoutée")
      }

      const [msgColumns] = await this.pool.query("DESCRIBE messages")
      const msgColumnNames = msgColumns.map((col) => col.Field)

      if (!msgColumnNames.includes("receiver_id")) {
        await this.pool.query("ALTER TABLE messages ADD COLUMN receiver_id INTEGER")
        await this.pool.query("ALTER TABLE messages ADD CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE")
        console.log(" Colonne receiver_id ajoutée à la table messages")
      }

      if (!columnNames.includes("reset_token")) {
        await this.pool.query("ALTER TABLE users ADD COLUMN reset_token TEXT")
        console.log(" Colonne reset_token ajoutée")
      }

      if (!columnNames.includes("reset_token_expires")) {
        await this.pool.query("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME")
        console.log(" Colonne reset_token_expires ajoutée")
      }

      if (!columnNames.includes("last_active_at")) {
        await this.pool.query("ALTER TABLE users ADD COLUMN last_active_at DATETIME")
        console.log(" Colonne last_active_at ajoutée")
      }

      await this.pool.query("ALTER TABLE messages MODIFY COLUMN trip_id INTEGER NULL")

    } catch (err) {
      console.error("Erreur lors de la vérification des colonnes:", err)
    }
  }


  /**
   * Crée les vues SQL et les index pour optimiser les performances
   */
  async createViewsAndIndexes() {
    console.log("Création des vues et index d'optimisation...")

    const views = [
      // VUE 1: v_trip_details - Trajet complet avec infos conducteur
      `CREATE OR REPLACE VIEW v_trip_details AS
       SELECT 
         t.id, t.driver_id, t.vehicle_id,
         t.departure_location, t.departure_latitude, t.departure_longitude,
         t.arrival_location, t.arrival_latitude, t.arrival_longitude,
         t.departure_datetime, t.available_seats, t.price_per_seat,
         t.description, t.status, t.created_at, t.updated_at,
         u.first_name AS driver_first_name, u.last_name AS driver_last_name,
         u.email AS driver_email, u.phone AS driver_phone,
         u.profile_picture AS driver_profile_picture,
         (t.available_seats - COALESCE(
           (SELECT SUM(b.seats_booked) FROM bookings b 
            WHERE b.trip_id = t.id AND b.status != 'cancelled'), 0)
         ) AS remaining_seats,
         COALESCE(
           (SELECT AVG(r.rating) FROM reviews r 
            WHERE r.reviewed_id = t.driver_id AND r.type = 'driver'), 0
         ) AS driver_rating,
         (SELECT COUNT(*) FROM reviews r 
          WHERE r.reviewed_id = t.driver_id AND r.type = 'driver'
         ) AS driver_reviews_count,
         v.brand AS vehicle_brand, v.model AS vehicle_model,
         v.color AS vehicle_color, v.license_plate AS vehicle_license_plate
       FROM trips t
       JOIN users u ON t.driver_id = u.id
       LEFT JOIN vehicles v ON t.vehicle_id = v.id`,

      // VUE 2: v_booking_details - Réservation complète
      `CREATE OR REPLACE VIEW v_booking_details AS
       SELECT 
         b.id, b.trip_id, b.passenger_id, b.seats_booked, b.total_price,
         b.status, b.payment_status, b.booking_date, b.updated_at,
         t.departure_location, t.arrival_location, t.departure_datetime,
         t.price_per_seat, t.driver_id,
         ud.first_name AS driver_first_name, ud.last_name AS driver_last_name,
         ud.email AS driver_email, ud.phone AS driver_phone,
         ud.profile_picture AS driver_profile_picture,
         up.first_name AS passenger_first_name, up.last_name AS passenger_last_name,
         up.email AS passenger_email, up.phone AS passenger_phone,
         up.profile_picture AS passenger_profile_picture
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN users ud ON t.driver_id = ud.id
       JOIN users up ON b.passenger_id = up.id`,

      // VUE 3: v_user_stats - Statistiques par utilisateur
      `CREATE OR REPLACE VIEW v_user_stats AS
       SELECT 
         u.id, u.email, u.first_name, u.last_name, u.profile_picture,
         u.is_verified, u.is_active, u.is_admin, u.created_at,
         (SELECT COUNT(*) FROM trips t WHERE t.driver_id = u.id) AS trips_as_driver,
         (SELECT COUNT(*) FROM trips t WHERE t.driver_id = u.id AND t.status = 'completed') AS completed_trips,
         (SELECT COUNT(*) FROM bookings b WHERE b.passenger_id = u.id) AS bookings_as_passenger,
         COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'driver'), 0) AS rating_as_driver,
         (SELECT COUNT(*) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'driver') AS reviews_as_driver,
         COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'passenger'), 0) AS rating_as_passenger,
         COALESCE((SELECT SUM(b.total_price) FROM bookings b JOIN trips t ON b.trip_id = t.id 
                   WHERE t.driver_id = u.id AND b.payment_status = 'paid'), 0) AS total_earnings
       FROM users u`,

      // VUE 4: v_platform_stats - Statistiques globales
      `CREATE OR REPLACE VIEW v_platform_stats AS
       SELECT
         (SELECT COUNT(*) FROM users) AS total_users,
         (SELECT COUNT(*) FROM users WHERE is_active = 1) AS active_users,
         (SELECT COUNT(*) FROM users WHERE is_verified = 1) AS verified_users,
         (SELECT COUNT(*) FROM trips) AS total_trips,
         (SELECT COUNT(*) FROM trips WHERE status = 'active') AS active_trips,
         (SELECT COUNT(*) FROM trips WHERE status = 'completed') AS completed_trips,
         (SELECT COUNT(*) FROM bookings) AS total_bookings,
         (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') AS confirmed_bookings,
         (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
         COALESCE((SELECT SUM(b.total_price) FROM bookings b JOIN trips t ON b.trip_id = t.id WHERE t.status = 'completed' AND b.status != 'cancelled'), 0) AS total_revenue`,

      // VUE 5: v_active_trips - Trajets actifs pour recherche
      `CREATE OR REPLACE VIEW v_active_trips AS
       SELECT * FROM v_trip_details
       WHERE status = 'active'
       AND departure_datetime > NOW()
       AND remaining_seats > 0`
    ]

    const indexes = [
      // Index sur les trajets
      "CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)",
      "CREATE INDEX IF NOT EXISTS idx_trips_departure_datetime ON trips(departure_datetime)",
      "CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id)",
      // Index sur les réservations
      "CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id)",
      "CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id)",
      "CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)",
      // Index sur les avis
      "CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id)",
      "CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(type)",
      // Index sur les messages
      "CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)",
      "CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)",
      // Index composites
      "CREATE INDEX IF NOT EXISTS idx_trips_status_datetime ON trips(status, departure_datetime)",
      "CREATE INDEX IF NOT EXISTS idx_bookings_trip_status ON bookings(trip_id, status)"
    ]

    // Créer les vues
    for (const view of views) {
      try {
        await this.pool.query(view)
      } catch (err) {
        console.error("Erreur création vue:", err.message)
      }
    }
    console.log("Vues SQL créées (5 vues)")

    // Créer les index (ignorer si existe déjà)
    for (const index of indexes) {
      try {
        await this.pool.query(index)
      } catch (err) {
        // Index existe probablement déjà, ignorer
        if (!err.message.includes('Duplicate')) {
          // console.error("Erreur création index:", err.message)
        }
      }
    }
    console.log("Index de performance créés (12 index)")
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
