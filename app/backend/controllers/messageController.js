const db = require('../config/database');
const { validationResult } = require('express-validator');

// Envoyer un message
exports.sendMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { receiver_id, message, trip_id } = req.body;
        const sender_id = req.user.id;

        // Vérifier si le destinataire existe
        if (receiver_id) {
            const receiver = await db.get('SELECT id FROM users WHERE id = ?', [receiver_id]);
            if (!receiver) {
                return res.status(404).json({ message: 'Destinataire non trouvé' });
            }
        }

        const query = `
      INSERT INTO messages (sender_id, receiver_id, trip_id, message)
      VALUES (?, ?, ?, ?)
    `;

        const result = await db.run(query, [sender_id, receiver_id || null, trip_id || null, message]);

        const newMessage = await db.get(
            'SELECT * FROM messages WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'Message envoyé',
            data: newMessage
        });

    } catch (error) {
        console.error('Erreur sendMessage:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
    }
};

// Récupérer les conversations (liste des utilisateurs avec qui on a discuté)
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Cette requête récupère les utilisateurs avec qui l'utilisateur connecté a échangé des messages (envoyés ou reçus)
        // Elle récupère aussi le dernier message échangé
        const query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_picture,
        m.message as last_message,
        m.created_at as last_message_date,
        m.is_read,
        m.sender_id as last_message_sender_id
      FROM users u
      JOIN (
        SELECT 
          CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          MAX(id) as max_id
        FROM messages 
        WHERE (sender_id = ? OR receiver_id = ?) AND trip_id IS NULL
        GROUP BY other_user_id
      ) latest ON u.id = latest.other_user_id
      JOIN messages m ON m.id = latest.max_id
      ORDER BY m.created_at DESC
    `;

        const conversations = await db.all(query, [userId, userId, userId]);

        res.json({
            success: true,
            data: conversations
        });

    } catch (error) {
        console.error('Erreur getConversations:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des conversations' });
    }
};

// Récupérer les messages d'une conversation spécifique
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        const messages = await db.all(
            `SELECT m.*, 
        s.first_name as sender_first_name, s.last_name as sender_last_name, s.profile_picture as sender_profile_picture
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
            [userId, otherUserId, otherUserId, userId]
        );

        // Marquer les messages reçus comme lus
        await db.run(
            `UPDATE messages SET is_read = 1 
       WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`,
            [userId, otherUserId]
        );

        res.json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('Erreur getMessages:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
    }
};
