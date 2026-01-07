/**
 * Tests unitaires du middleware d'authentification
 */
const jwt = require('jsonwebtoken');
const { generateTestToken, generateExpiredToken, createTestUser } = require('../helpers/testHelpers');

// Mock de la base de données
jest.mock('../../config/database', () => require('../mocks/database').mockDb);

const { authMiddleware, optionalAuth } = require('../../middleware/auth');
const { resetMockData, seedUser } = require('../mocks/database');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let testUser;

  beforeEach(async () => {
    resetMockData();
    
    // Créer un utilisateur de test
    testUser = seedUser({
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: 1,
      is_admin: 0,
    });

    // Mock de la requête
    mockReq = {
      header: jest.fn(),
    };

    // Mock de la réponse
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock de next()
    mockNext = jest.fn();
  });

  describe('authMiddleware', () => {
    it('devrait rejeter une requête sans header Authorization', async () => {
      mockReq.header.mockReturnValue(null);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Token d'accès requis",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter un header sans préfixe Bearer', async () => {
      mockReq.header.mockReturnValue('InvalidToken');

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter un token invalide', async () => {
      mockReq.header.mockReturnValue('Bearer invalid.token.here');

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token invalide',
      });
    });

    it('devrait rejeter un token expiré', async () => {
      const expiredToken = generateExpiredToken(testUser.id);
      mockReq.header.mockReturnValue(`Bearer ${expiredToken}`);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token invalide',
      });
    });

    it('devrait accepter un token valide et ajouter user à la requête', async () => {
      const validToken = generateTestToken(testUser.id);
      mockReq.header.mockReturnValue(`Bearer ${validToken}`);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(testUser.id);
      expect(mockReq.user.email).toBe(testUser.email);
    });

    it('devrait rejeter si l\'utilisateur n\'existe pas en base', async () => {
      const tokenForNonExistentUser = generateTestToken(9999);
      mockReq.header.mockReturnValue(`Bearer ${tokenForNonExistentUser}`);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non trouvé ou désactivé',
      });
    });

    it('devrait rejeter si l\'utilisateur est désactivé', async () => {
      const inactiveUser = seedUser({
        email: 'inactive@test.com',
        is_active: 0,
      });
      const token = generateTestToken(inactiveUser.id);
      mockReq.header.mockReturnValue(`Bearer ${token}`);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('optionalAuth', () => {
    it('devrait continuer sans user si pas de token', async () => {
      mockReq.header.mockReturnValue(null);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeNull();
    });

    it('devrait ajouter user si token valide présent', async () => {
      const validToken = generateTestToken(testUser.id);
      mockReq.header.mockReturnValue(`Bearer ${validToken}`);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(testUser.id);
    });

    it('devrait rejeter si token invalide est fourni', async () => {
      mockReq.header.mockReturnValue('Bearer invalid.token');

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
