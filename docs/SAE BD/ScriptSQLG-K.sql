CREATE TABLE users(
   user_id INT AUTO_INCREMENT,
   email VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL,
   first_name VARCHAR(100) NOT NULL,
   last_name VARCHAR(100) NOT NULL,
   phone VARCHAR(20),
   student_id VARCHAR(50),
   university VARCHAR(255) DEFAULT 'IUT Amiens',
   profile_picture VARCHAR(255),
   banner_picture VARCHAR(255),
   is_verified_flag VARCHAR(1) DEFAULT 'N' CHECK (is_verified_flag IN ('Y', 'N')),
   is_active_flag VARCHAR(1) DEFAULT 'Y' CHECK (is_active_flag IN ('Y', 'N')),
   is_admin_flag VARCHAR(1) DEFAULT 'N' CHECK (is_admin_flag IN ('Y', 'N')),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id),
   UNIQUE(email)
);

CREATE TABLE vehicles(
   vehicle_id INT AUTO_INCREMENT,
   brand VARCHAR(100) NOT NULL,
   model VARCHAR(100) NOT NULL,
   color VARCHAR(50),
   license_plate VARCHAR(20),
   seats INT NOT NULL DEFAULT 4,
   year_vehicle INT,
   is_active_flag VARCHAR(1) DEFAULT 'Y' CHECK (is_active_flag IN ('Y', 'N')),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   user_id INT NOT NULL,
   PRIMARY KEY(vehicle_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE trips(
   trip_id INT AUTO_INCREMENT,
   departure_location VARCHAR(255) NOT NULL,
   departure_latitude DECIMAL(10,8),
   departure_longitude DECIMAL(11,8),
   arrival_location VARCHAR(255) NOT NULL,
   available_seats INT NOT NULL,
   price_per_seat DECIMAL(10,2) NOT NULL,
   description TEXT,
   estimated_duration INT NOT NULL CHECK (estimated_duration > 0),
   status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')),
   arrival_latitude DECIMAL(10,8),
   arrival_longitude DECIMAL(11,8),
   departure_datetime DATETIME NOT NULL,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   vehicle_id INT NOT NULL,
   driver_id INT NOT NULL,
   PRIMARY KEY(trip_id),
   FOREIGN KEY(vehicle_id) REFERENCES vehicles(vehicle_id),
   FOREIGN KEY(driver_id) REFERENCES users(user_id)
);

CREATE TABLE bookings(
   booking_id INT AUTO_INCREMENT,
   seats_booked INT NOT NULL DEFAULT 1,
   total_price DECIMAL(10,2) NOT NULL,
   status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
   payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
   booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   trip_id INT NOT NULL,
   passenger_id INT NOT NULL,
   PRIMARY KEY(booking_id),
   FOREIGN KEY(trip_id) REFERENCES trips(trip_id),
   FOREIGN KEY(passenger_id) REFERENCES users(user_id)
);

CREATE TABLE reviews(
   review_id INT AUTO_INCREMENT,
   rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
   comment TEXT,
   type VARCHAR(20) NOT NULL CHECK (type IN ('driver', 'passenger')),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   reviewer_id INT NOT NULL,
   booking_id INT NOT NULL,
   PRIMARY KEY(review_id),
   UNIQUE(booking_id, reviewer_id),
   FOREIGN KEY(reviewer_id) REFERENCES users(user_id),
   FOREIGN KEY(booking_id) REFERENCES bookings(booking_id)
);

CREATE TABLE messages(
   message_id INT AUTO_INCREMENT,
   message TEXT NOT NULL,
   is_read_flag VARCHAR(1) DEFAULT 'N' CHECK (is_read_flag IN ('Y', 'N')),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   sender_id INT NOT NULL,
   trip_id INT NOT NULL,
   PRIMARY KEY(message_id),
   FOREIGN KEY(sender_id) REFERENCES users(user_id),
   FOREIGN KEY(trip_id) REFERENCES trips(trip_id)
);