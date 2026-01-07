/**
 * Tests unitaires du middleware de validation
 */
const { validationResult } = require('express-validator');
const {
  validateRegistration,
  validateLogin,
  validateTripCreation,
} = require('../../middleware/validation');

describe('Validation Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  /**
   * Exécute une chaîne de middlewares de validation
   */
  const runValidation = async (validators, body) => {
    mockReq.body = body;
    
    for (const validator of validators) {
      if (typeof validator === 'function' && validator.length === 3) {
        // C'est un middleware, on l'exécute
        await new Promise((resolve) => {
          validator(mockReq, mockRes, resolve);
        });
      } else if (validator.run) {
        // C'est un validateur express-validator
        await validator.run(mockReq);
      }
    }
  };

  describe('validateRegistration', () => {
    it('devrait accepter des données d\'inscription valides', async () => {
      await runValidation(validateRegistration, {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '0612345678',
      });

      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });

    it('devrait rejeter un email invalide', async () => {
      await runValidation(validateRegistration, {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Données invalides',
        })
      );
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      await runValidation(validateRegistration, {
        email: 'user@example.com',
        password: '12345', // Moins de 6 caractères
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devrait rejeter un prénom trop court', async () => {
      await runValidation(validateRegistration, {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'J', // Moins de 2 caractères
        lastName: 'Doe',
      });

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devrait accepter une inscription sans téléphone', async () => {
      await runValidation(validateRegistration, {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        // Pas de téléphone
      });

      // Le téléphone est optionnel
      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });
  });

  describe('validateLogin', () => {
    it('devrait accepter des données de connexion valides', async () => {
      await runValidation(validateLogin, {
        email: 'user@example.com',
        password: 'password123',
      });

      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });

    it('devrait rejeter un email invalide', async () => {
      await runValidation(validateLogin, {
        email: 'not-an-email',
        password: 'password123',
      });

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devrait rejeter un mot de passe vide', async () => {
      await runValidation(validateLogin, {
        email: 'user@example.com',
        password: '',
      });

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateTripCreation', () => {
    const validTripData = () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      return {
        departureLocation: 'Paris, France',
        arrivalLocation: 'Amiens, France',
        departureDateTime: futureDate.toISOString(),
        availableSeats: 3,
        pricePerSeat: 15,
      };
    };

    it('devrait accepter des données de trajet valides', async () => {
      await runValidation(validateTripCreation, validTripData());

      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });

    it('devrait rejeter un lieu de départ trop court', async () => {
      const data = validTripData();
      data.departureLocation = 'AB';

      await runValidation(validateTripCreation, data);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devrait rejeter une date dans le passé', async () => {
      const data = validTripData();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      data.departureDateTime = pastDate.toISOString();

      await runValidation(validateTripCreation, data);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devrait rejeter un nombre de places invalide', async () => {
      const data = validTripData();
      data.availableSeats = 10; // Max est 8

      await runValidation(validateTripCreation, data);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devrait rejeter 0 places disponibles', async () => {
      const data = validTripData();
      data.availableSeats = 0;

      await runValidation(validateTripCreation, data);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
