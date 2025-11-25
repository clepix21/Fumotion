-- Table des utilisateurs
-- Stocke les informations des utilisateurs (conducteurs et passagers)
CREATE TABLE IF NOT EXISTS users (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des véhicules
-- Stocke les informations des véhicules des conducteurs
CREATE TABLE IF NOT EXISTS vehicles (
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
);

-- Table des trajets
-- Stocke les trajets proposés par les conducteurs
CREATE TABLE IF NOT EXISTS trips (
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
);

-- Table des réservations
-- Stocke les réservations des passagers pour les trajets
CREATE TABLE IF NOT EXISTS bookings (
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
);

-- Table des évaluations
-- Stocke les évaluations entre conducteurs et passagers
CREATE TABLE IF NOT EXISTS reviews (
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
);

-- Table des messages
-- Stocke les messages échangés concernant un trajet
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_datetime ON trips(departure_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_trip_id ON messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);

-- Insertion de données de test (utilisateur admin)
INSERT OR IGNORE INTO users (email, password, first_name, last_name, phone, is_verified)
VALUES ('admin@fumotion.com', '$2a$10$XYZ...', 'Admin', 'Fumotion', '0123456789', 1);
