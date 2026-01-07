/**
 * Configuration globale des tests
 * Initialise l'environnement de test avant l'exécution
 */

// Charger les variables d'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = '5001';

// Timeout plus long pour les tests d'intégration
jest.setTimeout(30000);

// Supprimer les logs pendant les tests (optionnel)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
