/**
 * Service de messagerie
 * Appels API pour la gestion des conversations et messages
 */
import { get, post } from './api';

export const messageService = {
    getConversations: () => get('/api/messages/conversations'),        // Liste des conversations
    getMessages: (otherUserId) => get(`/api/messages/${otherUserId}`), // Messages avec un utilisateur
    sendMessage: (data) => post('/api/messages', data),                // Envoyer un message
};
