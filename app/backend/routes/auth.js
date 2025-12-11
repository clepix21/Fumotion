const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Routes publiques
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);

// Routes protégées
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.get('/verify-token', authMiddleware, AuthController.verifyToken);
router.post('/profile/banner', authMiddleware, upload.single('banner'), AuthController.uploadBanner);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), AuthController.uploadAvatar);

module.exports = router;