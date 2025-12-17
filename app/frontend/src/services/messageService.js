import { get, post } from './api';

export const messageService = {
    // Récupérer la liste des conversations
    getConversations: () => get('/api/messages/conversations'),

    // Récupérer les messages avec un utilisateur spécifique
    getMessages: (otherUserId) => get(`/api/messages/${otherUserId}`),

    // Envoyer un message
    sendMessage: (data) => post('/api/messages', data),
};
