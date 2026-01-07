/**
 * Configuration Jest pour les tests backend
 */
module.exports = {
  // Environnement de test
  testEnvironment: 'node',

  // Répertoires de tests
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],

  // Fichiers à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
  ],

  // Fichier de setup exécuté avant les tests
  setupFilesAfterEnv: ['./tests/setup.js'],

  // Couverture de code
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
  ],

  // Répertoire de sortie de la couverture
  coverageDirectory: 'coverage',

  // Seuils de couverture (optionnel)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Affichage détaillé
  verbose: true,

  // Timeout pour chaque test
  testTimeout: 10000,

  // Nettoyage automatique des mocks
  clearMocks: true,
  resetMocks: true,

  // Force la sortie après les tests
  forceExit: true,

  // Détection des handles ouverts
  detectOpenHandles: true,
};
