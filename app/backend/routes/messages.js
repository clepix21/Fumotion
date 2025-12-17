const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes nécessitent d'être connecté
router.use(authMiddleware);

// Obtenir la liste des conversations
router.get('/conversations', messageController.getConversations);

// Obtenir les messages d'une conversation spécifique
router.get('/:otherUserId', messageController.getMessages);

// Envoyer un message
router.post(
    '/',
    [
        body('message').trim().notEmpty().withMessage('Le message ne peut pas être vide'),
        // receiver_id est optionnel seulement si trip_id est présent (cas non traité ici pour simplicité, on focus sur DM)
        // Mais pour DM pur, receiver_id est requis.
        body('receiver_id').if(body('trip_id').not().exists()).isInt().withMessage('ID du destinataire invalide')
    ],
    messageController.sendMessage
);

module.exports = router;
