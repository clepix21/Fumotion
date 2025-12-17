import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import { messageService } from '../services/messageService';
import '../styles/Chat.css';

const ChatPage = () => {
    const { userId } = useParams(); // ID de l'utilisateur avec qui on veut chatter
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger les conversations au montage
    useEffect(() => {
        loadConversations();
        // Poll for new messages every 10 seconds (basic real-time)
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // Charger les messages quand un utilisateur est sélectionné
    useEffect(() => {
        if (userId) {
            loadMessages(userId);
            // Supposant que l'on veut mettre à jour selectedUser basé sur userId et conversations
            // On le fera après avoir chargé les conversations si possible, ou via une requête user details si nécessaire pour un nouveau chat
        }
    }, [userId]);

    const loadConversations = async () => {
        try {
            const response = await messageService.getConversations();
            if (response.success) {
                setConversations(response.data);

                // Si userId est dans l'URL, trouvez l'utilisateur correspondant dans les conversations
                if (userId) {
                    const user = response.data.find(c => c.id === parseInt(userId));
                    if (user) {
                        setSelectedUser(user);
                    } else {
                        // Si l'utilisateur n'est pas dans les conversations (nouveau chat), charger depuis l'API
                        try {
                            const userResponse = await import('../services/api').then(module => module.authAPI.getPublicProfile(userId));
                            if (userResponse.success) {
                                setSelectedUser(userResponse.data);
                            }
                        } catch (err) {
                            console.error("Impossible de charger l'utilisateur", err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Erreur chargement conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (otherId) => {
        try {
            const response = await messageService.getMessages(otherId);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error("Erreur chargement messages", error);
        }
    };

    const handleSelectUser = (id) => {
        navigate(`/chat/${id}`);
    };

    const handleSendMessage = async (text) => {
        if (!userId) return;

        try {
            const response = await messageService.sendMessage({
                receiver_id: userId,
                message: text
            });

            if (response.success) {
                // Ajouter le message à la liste locale immédiatement pour fluidité
                // (Idéalement, on utiliserait la réponse pour avoir l'ID serveur)
                const newMessage = response.data; // Supposons que le backend renvoie le message créé
                setMessages([...messages, newMessage]);
                loadConversations(); // Update conversation last message preview
            }
        } catch (error) {
            console.error("Erreur envoi message", error);
        }
    };

    if (!currentUser) return <div>Veuillez vous connecter.</div>;
    if (loading && conversations.length === 0) return <div className="chat-loading">Chargement...</div>;

    return (
        <div className="chat-page-container">
            <div className="conversation-sidebar">
                <ConversationList
                    conversations={conversations}
                    selectedUserId={userId ? parseInt(userId) : null}
                    onSelectUser={handleSelectUser}
                />
            </div>
            <ChatWindow
                messages={messages}
                currentUser={currentUser}
                otherUser={selectedUser}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
};

export default ChatPage;
