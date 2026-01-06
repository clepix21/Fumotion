/**
 * Routes d'authentification
 * /api/auth/...
 */
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const upload = require('../middleware/upload');

// ========== ROUTES PUBLIQUES ==========
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// ========== ROUTES PROTÉGÉES (token requis) ==========
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.get('/verify-token', authMiddleware, AuthController.verifyToken);
router.post('/profile/banner', authMiddleware, upload.single('banner'), AuthController.uploadBanner);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), AuthController.uploadAvatar);
router.get('/users/:id', authMiddleware, AuthController.getUserPublicProfile);

module.exports = router;