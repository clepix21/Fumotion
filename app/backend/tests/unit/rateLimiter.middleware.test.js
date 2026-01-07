/**
 * Tests unitaires du middleware rate limiter
 */
const {
  globalLimiter,
  authLimiter,
  registerLimiter,
  messageLimiter,
} = require('../../middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      path: '/api/test',
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      set: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('globalLimiter', () => {
    it('devrait être défini', () => {
      expect(globalLimiter).toBeDefined();
      expect(typeof globalLimiter).toBe('function');
    });

    it('devrait avoir une configuration correcte', () => {
      // Vérifier que le limiter existe et peut être appelé
      expect(() => globalLimiter(mockReq, mockRes, mockNext)).not.toThrow();
    });
  });

  describe('authLimiter', () => {
    it('devrait être défini', () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });
  });

  describe('registerLimiter', () => {
    it('devrait être défini', () => {
      expect(registerLimiter).toBeDefined();
      expect(typeof registerLimiter).toBe('function');
    });
  });

  describe('messageLimiter', () => {
    it('devrait être défini', () => {
      expect(messageLimiter).toBeDefined();
      expect(typeof messageLimiter).toBe('function');
    });
  });

  describe('Configuration des limiteurs', () => {
    it('tous les limiteurs requis devraient être exportés', () => {
      const rateLimiter = require('../../middleware/rateLimiter');
      
      expect(rateLimiter.globalLimiter).toBeDefined();
      expect(rateLimiter.authLimiter).toBeDefined();
      expect(rateLimiter.registerLimiter).toBeDefined();
      expect(rateLimiter.passwordResetLimiter).toBeDefined();
      expect(rateLimiter.tripCreationLimiter).toBeDefined();
      expect(rateLimiter.messageLimiter).toBeDefined();
      expect(rateLimiter.geocodeLimiter).toBeDefined();
    });
  });
});
