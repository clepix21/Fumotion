/**
 * Fonctions utilitaires pour les tests
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Génère un token JWT valide pour les tests
 */
const generateTestToken = (userId, expiresIn = '1h') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret-key-for-testing-only',
    { expiresIn }
  );
};

/**
 * Génère un token JWT expiré
 */
const generateExpiredToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret-key-for-testing-only',
    { expiresIn: '-1s' }
  );
};

/**
 * Hash un mot de passe pour les tests
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Crée un utilisateur de test avec données complètes
 */
const createTestUser = async (overrides = {}) => {
  const hashedPassword = await hashPassword(overrides.password || 'password123');
  return {
    id: overrides.id || 1,
    email: overrides.email || 'test@example.com',
    password: hashedPassword,
    first_name: overrides.first_name || 'John',
    last_name: overrides.last_name || 'Doe',
    phone: overrides.phone || '0612345678',
    is_active: overrides.is_active !== undefined ? overrides.is_active : 1,
    is_admin: overrides.is_admin || 0,
    created_at: new Date().toISOString(),
  };
};

/**
 * Crée un trajet de test
 */
const createTestTrip = (overrides = {}) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  
  return {
    id: overrides.id || 1,
    driver_id: overrides.driver_id || 1,
    departure_location: overrides.departure_location || 'Paris',
    arrival_location: overrides.arrival_location || 'Amiens',
    departure_datetime: overrides.departure_datetime || futureDate.toISOString(),
    available_seats: overrides.available_seats || 3,
    price_per_seat: overrides.price_per_seat || 15.00,
    description: overrides.description || 'Trajet de test',
    status: overrides.status || 'active',
    created_at: new Date().toISOString(),
  };
};

/**
 * Données de requête valides pour l'inscription
 */
const validRegistrationData = {
  email: 'newuser@test.com',
  password: 'password123',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '0698765432',
};

/**
 * Données de requête valides pour la connexion
 */
const validLoginData = {
  email: 'test@example.com',
  password: 'password123',
};

/**
 * Données de requête valides pour la création de trajet
 */
const validTripData = () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  
  return {
    departureLocation: 'Paris, France',
    arrivalLocation: 'Amiens, France',
    departureDateTime: futureDate.toISOString(),
    availableSeats: 3,
    pricePerSeat: 15,
    description: 'Trajet confortable en voiture',
    departureLatitude: 48.8566,
    departureLongitude: 2.3522,
    arrivalLatitude: 49.8941,
    arrivalLongitude: 2.2958,
  };
};

module.exports = {
  generateTestToken,
  generateExpiredToken,
  hashPassword,
  createTestUser,
  createTestTrip,
  validRegistrationData,
  validLoginData,
  validTripData,
};
