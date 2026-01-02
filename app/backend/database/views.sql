-- ============================================
-- FUMOTION - Vues et Optimisations SQL
-- Améliore les performances et simplifie les requêtes
-- ============================================

-- ============================================
-- VUE 1: v_trip_details
-- Trajet complet avec infos conducteur et places restantes
-- ============================================
CREATE OR REPLACE VIEW v_trip_details AS
SELECT 
    t.id,
    t.driver_id,
    t.vehicle_id,
    t.departure_location,
    t.departure_latitude,
    t.departure_longitude,
    t.arrival_location,
    t.arrival_latitude,
    t.arrival_longitude,
    t.departure_datetime,
    t.available_seats,
    t.price_per_seat,
    t.description,
    t.status,
    t.created_at,
    t.updated_at,
    -- Infos conducteur
    u.first_name AS driver_first_name,
    u.last_name AS driver_last_name,
    u.email AS driver_email,
    u.phone AS driver_phone,
    u.profile_picture AS driver_profile_picture,
    -- Places restantes calculées
    (t.available_seats - COALESCE(
        (SELECT SUM(b.seats_booked) 
         FROM bookings b 
         WHERE b.trip_id = t.id AND b.status != 'cancelled'), 0)
    ) AS remaining_seats,
    -- Note moyenne du conducteur
    COALESCE(
        (SELECT AVG(r.rating) 
         FROM reviews r 
         WHERE r.reviewed_id = t.driver_id AND r.type = 'driver'), 0
    ) AS driver_rating,
    -- Nombre d'avis du conducteur
    (SELECT COUNT(*) 
     FROM reviews r 
     WHERE r.reviewed_id = t.driver_id AND r.type = 'driver'
    ) AS driver_reviews_count,
    -- Infos véhicule
    v.brand AS vehicle_brand,
    v.model AS vehicle_model,
    v.color AS vehicle_color,
    v.license_plate AS vehicle_license_plate
FROM trips t
JOIN users u ON t.driver_id = u.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id;

-- ============================================
-- VUE 2: v_booking_details
-- Réservation complète avec infos trajet et utilisateurs
-- ============================================
CREATE OR REPLACE VIEW v_booking_details AS
SELECT 
    b.id,
    b.trip_id,
    b.passenger_id,
    b.seats_booked,
    b.total_price,
    b.status,
    b.payment_status,
    b.booking_date,
    b.updated_at,
    -- Infos trajet
    t.departure_location,
    t.arrival_location,
    t.departure_datetime,
    t.price_per_seat,
    t.driver_id,
    -- Infos conducteur
    ud.first_name AS driver_first_name,
    ud.last_name AS driver_last_name,
    ud.email AS driver_email,
    ud.phone AS driver_phone,
    ud.profile_picture AS driver_profile_picture,
    -- Infos passager
    up.first_name AS passenger_first_name,
    up.last_name AS passenger_last_name,
    up.email AS passenger_email,
    up.phone AS passenger_phone,
    up.profile_picture AS passenger_profile_picture
FROM bookings b
JOIN trips t ON b.trip_id = t.id
JOIN users ud ON t.driver_id = ud.id
JOIN users up ON b.passenger_id = up.id;

-- ============================================
-- VUE 3: v_user_stats
-- Statistiques par utilisateur
-- ============================================
CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.profile_picture,
    u.is_verified,
    u.is_active,
    u.is_admin,
    u.created_at,
    -- Statistiques conducteur
    (SELECT COUNT(*) FROM trips t WHERE t.driver_id = u.id) AS trips_as_driver,
    (SELECT COUNT(*) FROM trips t WHERE t.driver_id = u.id AND t.status = 'completed') AS completed_trips_as_driver,
    -- Statistiques passager
    (SELECT COUNT(*) FROM bookings b WHERE b.passenger_id = u.id) AS bookings_as_passenger,
    (SELECT COUNT(*) FROM bookings b WHERE b.passenger_id = u.id AND b.status = 'completed') AS completed_bookings,
    -- Note moyenne en tant que conducteur
    COALESCE(
        (SELECT AVG(r.rating) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'driver'), 0
    ) AS rating_as_driver,
    (SELECT COUNT(*) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'driver') AS reviews_as_driver,
    -- Note moyenne en tant que passager
    COALESCE(
        (SELECT AVG(r.rating) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'passenger'), 0
    ) AS rating_as_passenger,
    (SELECT COUNT(*) FROM reviews r WHERE r.reviewed_id = u.id AND r.type = 'passenger') AS reviews_as_passenger,
    -- Revenus générés (en tant que conducteur)
    COALESCE(
        (SELECT SUM(b.total_price) 
         FROM bookings b 
         JOIN trips t ON b.trip_id = t.id 
         WHERE t.driver_id = u.id AND b.payment_status = 'paid'), 0
    ) AS total_earnings,
    -- Dépenses (en tant que passager)
    COALESCE(
        (SELECT SUM(b.total_price) 
         FROM bookings b 
         WHERE b.passenger_id = u.id AND b.payment_status = 'paid'), 0
    ) AS total_spent
FROM users u;

-- ============================================
-- VUE 4: v_platform_stats
-- Statistiques globales de la plateforme
-- ============================================
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT
    -- Utilisateurs
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE is_active = 1) AS active_users,
    (SELECT COUNT(*) FROM users WHERE is_verified = 1) AS verified_users,
    (SELECT COUNT(*) FROM users WHERE is_admin = 1) AS admin_users,
    -- Trajets
    (SELECT COUNT(*) FROM trips) AS total_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'active') AS active_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'completed') AS completed_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'cancelled') AS cancelled_trips,
    -- Réservations
    (SELECT COUNT(*) FROM bookings) AS total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') AS confirmed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') AS cancelled_bookings,
    -- Revenus
    COALESCE((SELECT SUM(total_price) FROM bookings WHERE payment_status = 'paid'), 0) AS total_revenue,
    COALESCE((SELECT SUM(total_price) FROM bookings WHERE payment_status = 'pending'), 0) AS pending_revenue,
    -- Avis
    (SELECT COUNT(*) FROM reviews) AS total_reviews,
    COALESCE((SELECT AVG(rating) FROM reviews), 0) AS average_rating,
    -- Messages
    (SELECT COUNT(*) FROM messages) AS total_messages,
    (SELECT COUNT(*) FROM messages WHERE is_read = 0) AS unread_messages;

-- ============================================
-- VUE 5: v_active_trips
-- Trajets actifs avec places disponibles (pour recherche)
-- ============================================
CREATE OR REPLACE VIEW v_active_trips AS
SELECT 
    td.*
FROM v_trip_details td
WHERE td.status = 'active'
AND td.departure_datetime > NOW()
AND td.remaining_seats > 0;

-- ============================================
-- VUE 6: v_recent_activity
-- Activité récente (derniers trajets et réservations)
-- ============================================
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    'trip' AS activity_type,
    t.id AS activity_id,
    t.created_at AS activity_date,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.profile_picture AS user_picture,
    CONCAT('Nouveau trajet: ', t.departure_location, ' → ', t.arrival_location) AS description
FROM trips t
JOIN users u ON t.driver_id = u.id
UNION ALL
SELECT 
    'booking' AS activity_type,
    b.id AS activity_id,
    b.booking_date AS activity_date,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.profile_picture AS user_picture,
    CONCAT('Réservation pour ', t.departure_location, ' → ', t.arrival_location) AS description
FROM bookings b
JOIN users u ON b.passenger_id = u.id
JOIN trips t ON b.trip_id = t.id
ORDER BY activity_date DESC
LIMIT 20;

-- ============================================
-- INDEX pour optimisation des performances
-- ============================================

-- Index sur les trajets
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_datetime ON trips(departure_datetime);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_location ON trips(departure_location(100));
CREATE INDEX IF NOT EXISTS idx_trips_arrival_location ON trips(arrival_location(100));

-- Index sur les réservations
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Index sur les avis
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(type);

-- Index sur les messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Index composites pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_trips_status_datetime ON trips(status, departure_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_status ON bookings(trip_id, status);
