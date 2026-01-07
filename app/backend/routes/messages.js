/**
 * Routes de messagerie
 * /api/messages/... - Toutes protégées par auth
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');

// Authentification requise pour toutes les routes
router.use(authMiddleware);

router.get('/conversations', messageController.getConversations); // Liste des conversations
router.get('/:otherUserId', messageController.getMessages);        // Messages avec un utilisateur

// Envoi d'un message (validation du contenu + rate limiting)
router.post(
    '/',
    messageLimiter,
    [
        body('message').trim().notEmpty().withMessage('Le message ne peut pas être vide'),
        body('receiver_id').if(body('trip_id').not().exists()).isInt().withMessage('ID du destinataire invalide')
    ],
    messageController.sendMessage
);

module.exports = router;
