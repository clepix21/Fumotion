/**
 * Tests d'intégration des routes de trajets
 */
const request = require('supertest');
const express = require('express');

// Mock de la base de données
jest.mock('../../config/database', () => require('../mocks/database').mockDb);

// Mock du rate limiter pour éviter les blocages pendant les tests
jest.mock('../../middleware/rateLimiter', () => ({
  globalLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  registerLimiter: (req, res, next) => next(),
  passwordResetLimiter: (req, res, next) => next(),
  tripCreationLimiter: (req, res, next) => next(),
  messageLimiter: (req, res, next) => next(),
  geocodeLimiter: (req, res, next) => next(),
}));

const { resetMockData, seedUser, seedTrip, mockDb } = require('../mocks/database');
const { generateTestToken, validTripData } = require('../helpers/testHelpers');

// Créer une app Express de test
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  const tripRoutes = require('../../routes/trips');
  app.use('/api/trips', tripRoutes);
  
  return app;
};

describe('Trip Routes - Integration Tests', () => {
  let app;
  let testUser;
  let testTrip;
  let authToken;

  beforeEach(() => {
    resetMockData();
    app = createTestApp();
    
    // Créer un utilisateur de test
    testUser = seedUser({
      email: 'driver@test.com',
      first_name: 'Driver',
      last_name: 'Test',
      is_active: 1,
    });
    
    authToken = generateTestToken(testUser.id);
    
    // Créer un trajet de test
    testTrip = seedTrip({
      driver_id: testUser.id,
      departure_location: 'Paris',
      arrival_location: 'Amiens',
      available_seats: 3,
      price_per_seat: 15,
    });
  });

  describe('POST /api/trips', () => {
    it('devrait créer un trajet avec des données valides', async () => {
      mockDb.get.mockImplementationOnce(async () => testUser); // Pour auth
      mockDb.run.mockImplementationOnce(async () => ({ id: 2, affectedRows: 1 }));
      mockDb.get.mockImplementationOnce(async () => ({
        id: 2,
        ...validTripData(),
        driver_id: testUser.id,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
      }));

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTripData())
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('devrait rejeter sans authentification', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send(validTripData())
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('devrait rejeter un lieu de départ trop court', async () => {
      mockDb.get.mockImplementationOnce(async () => testUser);

      const invalidData = { ...validTripData(), departureLocation: 'AB' };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('devrait rejeter 0 places disponibles', async () => {
      mockDb.get.mockImplementationOnce(async () => testUser);

      const invalidData = { ...validTripData(), availableSeats: 0 };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('devrait rejeter plus de 8 places', async () => {
      mockDb.get.mockImplementationOnce(async () => testUser);

      const invalidData = { ...validTripData(), availableSeats: 10 };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/trips/search', () => {
    it('devrait retourner des trajets correspondant aux critères', async () => {
      mockDb.all.mockImplementationOnce(async () => [testTrip]);
      mockDb.get.mockImplementationOnce(async () => ({ total: 1 }));

      const response = await request(app)
        .get('/api/trips/search')
        .query({ departure: 'Paris', arrival: 'Amiens' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait fonctionner sans paramètres', async () => {
      mockDb.all.mockImplementationOnce(async () => []);
      mockDb.get.mockImplementationOnce(async () => ({ total: 0 }));

      const response = await request(app)
        .get('/api/trips/search')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('devrait filtrer par nombre de passagers', async () => {
      mockDb.all.mockImplementationOnce(async () => [testTrip]);
      mockDb.get.mockImplementationOnce(async () => ({ total: 1 }));

      const response = await request(app)
        .get('/api/trips/search')
        .query({ passengers: 2 })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/trips/:id', () => {
    it('devrait retourner un trajet par son ID', async () => {
      mockDb.get.mockImplementationOnce(async () => ({
        ...testTrip,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
      }));

      const response = await request(app)
        .get(`/api/trips/${testTrip.id}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTrip.id);
    });

    it('devrait retourner 404 pour un trajet inexistant', async () => {
      mockDb.get.mockImplementationOnce(async () => null);

      const response = await request(app)
        .get('/api/trips/9999')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/trips (mes trajets)', () => {
    it('devrait retourner les trajets de l\'utilisateur connecté', async () => {
      mockDb.get.mockImplementationOnce(async () => testUser); // Pour auth
      mockDb.all.mockImplementationOnce(async () => [testTrip]);

      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rejeter sans authentification', async () => {
      const response = await request(app)
        .get('/api/trips')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/trips/:id', () => {
    it('devrait annuler un trajet appartenant à l\'utilisateur', async () => {
      mockDb.get
        .mockImplementationOnce(async () => testUser) // Pour auth
        .mockImplementationOnce(async () => testTrip); // Pour vérifier le propriétaire
      mockDb.run.mockImplementationOnce(async () => ({ affectedRows: 1 }));

      const response = await request(app)
        .delete(`/api/trips/${testTrip.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('devrait rejeter l\'annulation d\'un trajet par un non-propriétaire', async () => {
      const otherUser = seedUser({ email: 'other@test.com' });
      const otherToken = generateTestToken(otherUser.id);
      
      mockDb.get
        .mockImplementationOnce(async () => otherUser) // Pour auth
        .mockImplementationOnce(async () => testTrip); // Trajet appartient à testUser

      const response = await request(app)
        .delete(`/api/trips/${testTrip.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });
  });
});
