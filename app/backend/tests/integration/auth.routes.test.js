/**
 * Tests d'intégration des routes d'authentification
 * Utilise supertest pour simuler des requêtes HTTP
 */
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

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

const { resetMockData, seedUser, mockDb } = require('../mocks/database');
const { generateTestToken, hashPassword } = require('../helpers/testHelpers');

// Créer une app Express de test
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Importer les routes après le mock
  const authRoutes = require('../../routes/auth');
  app.use('/api/auth', authRoutes);
  
  return app;
};

describe('Auth Routes - Integration Tests', () => {
  let app;
  let testUser;
  let testUserPassword;

  beforeEach(async () => {
    resetMockData();
    jest.clearAllMocks();
    app = createTestApp();
    
    // Créer un utilisateur de test avec mot de passe hashé
    testUserPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testUserPassword, 10);
    
    testUser = seedUser({
      email: 'existing@test.com',
      password: hashedPassword,
      first_name: 'Existing',
      last_name: 'User',
      is_active: 1,
    });
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'newuser@test.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      phone: '0612345678',
    };

    it('devrait rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: '123',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('devrait rejeter si le prénom est manquant', async () => {
      const { firstName, ...dataWithoutFirstName } = validRegistrationData;
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(dataWithoutFirstName)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('devrait rejeter si le nom est trop court', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          lastName: 'X',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Mock spécial pour le login - retourne l'utilisateur avec le bon mot de passe
      mockDb.get.mockImplementationOnce(async () => testUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUserPassword,
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('devrait rejeter un email inexistant', async () => {
      mockDb.get.mockImplementationOnce(async () => null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('incorrect');
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      mockDb.get.mockImplementationOnce(async () => testUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter un utilisateur désactivé', async () => {
      const inactiveUser = { ...testUser, is_active: 0 };
      mockDb.get.mockImplementationOnce(async () => inactiveUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: inactiveUser.email,
          password: testUserPassword,
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('désactivé');
    });

    it('devrait rejeter une requête sans mot de passe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('devrait rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123',
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('devrait rejeter sans token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter avec un token invalide', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('devrait rejeter sans préfixe Bearer', async () => {
      const token = generateTestToken(testUser.id);
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', token) // Sans Bearer
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});
