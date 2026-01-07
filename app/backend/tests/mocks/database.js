/**
 * Mock de la base de données pour les tests unitaires
 * Simule les opérations DB sans connexion réelle
 */

// Données de test en mémoire
const mockUsers = new Map();
const mockTrips = new Map();
const mockBookings = new Map();
const mockMessages = new Map();

let autoIncrementId = 1;

/**
 * Réinitialise toutes les données mock
 */
const resetMockData = () => {
  mockUsers.clear();
  mockTrips.clear();
  mockBookings.clear();
  mockMessages.clear();
  autoIncrementId = 1;
};

/**
 * Ajoute un utilisateur de test
 */
const seedUser = (userData) => {
  const id = autoIncrementId++;
  const user = {
    id,
    email: userData.email || `user${id}@test.com`,
    password: userData.password || '$2a$10$hashedpassword',
    first_name: userData.first_name || 'Test',
    last_name: userData.last_name || 'User',
    phone: userData.phone || null,
    is_active: userData.is_active !== undefined ? userData.is_active : 1,
    is_admin: userData.is_admin || 0,
    profile_picture: userData.profile_picture || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.set(id, user);
  return user;
};

/**
 * Ajoute un trajet de test
 */
const seedTrip = (tripData) => {
  const id = autoIncrementId++;
  const trip = {
    id,
    driver_id: tripData.driver_id,
    departure_location: tripData.departure_location || 'Paris',
    arrival_location: tripData.arrival_location || 'Amiens',
    departure_datetime: tripData.departure_datetime || new Date().toISOString(),
    available_seats: tripData.available_seats || 3,
    price_per_seat: tripData.price_per_seat || 15,
    status: tripData.status || 'active',
    created_at: new Date().toISOString(),
  };
  mockTrips.set(id, trip);
  return trip;
};

/**
 * Mock du module database
 */
const mockDb = {
  // Simule db.get() - retourne un seul résultat
  get: jest.fn(async (query, params) => {
    const lowerQuery = query.toLowerCase();
    
    // Recherche utilisateur par email
    if (lowerQuery.includes('from users') && lowerQuery.includes('email')) {
      const email = params[0];
      for (const user of mockUsers.values()) {
        if (user.email === email) return user;
      }
      return null;
    }
    
    // Recherche utilisateur par ID
    if (lowerQuery.includes('from users') && lowerQuery.includes('where id')) {
      const id = parseInt(params[0]);
      return mockUsers.get(id) || null;
    }
    
    // Recherche trajet par ID
    if (lowerQuery.includes('from trips') && lowerQuery.includes('where')) {
      const id = parseInt(params[0]);
      return mockTrips.get(id) || null;
    }
    
    return null;
  }),

  // Simule db.all() - retourne un tableau
  all: jest.fn(async (query, params) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('from users')) {
      return Array.from(mockUsers.values());
    }
    
    if (lowerQuery.includes('from trips')) {
      return Array.from(mockTrips.values());
    }
    
    return [];
  }),

  // Simule db.run() - insert/update/delete
  run: jest.fn(async (query, params) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('insert into users')) {
      const user = seedUser({
        email: params[0],
        password: params[1],
        first_name: params[2],
        last_name: params[3],
        phone: params[4],
      });
      return { id: user.id, affectedRows: 1 };
    }
    
    if (lowerQuery.includes('insert into trips')) {
      const trip = seedTrip({
        driver_id: params[0],
        departure_location: params[1],
        arrival_location: params[2],
        departure_datetime: params[3],
        available_seats: params[4],
        price_per_seat: params[5],
      });
      return { id: trip.id, affectedRows: 1 };
    }
    
    if (lowerQuery.includes('update')) {
      return { affectedRows: 1 };
    }
    
    if (lowerQuery.includes('delete')) {
      return { affectedRows: 1 };
    }
    
    return { affectedRows: 0 };
  }),

  // Connexion mock
  connect: jest.fn(async () => {
    console.log('Mock database connected');
  }),

  close: jest.fn(() => {
    console.log('Mock database closed');
  }),
};

module.exports = {
  mockDb,
  resetMockData,
  seedUser,
  seedTrip,
  mockUsers,
  mockTrips,
  mockBookings,
  mockMessages,
};
