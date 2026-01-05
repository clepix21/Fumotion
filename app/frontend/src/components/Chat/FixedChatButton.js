import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
import chatIcon from '../../assets/icons/chat.svg';

const FixedChatButton = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const prevUnreadCountRef = useRef(0);

    // Vérifier les messages non lus
    useEffect(() => {
        if (!isAuthenticated()) return;

        const checkUnreadMessages = async () => {
            try {
                const response = await messageService.getConversations();
                if (response.success) {
                    // Compter les conversations non lues où le dernier message n'est pas de moi
                    const unread = response.data.filter(c =>
                        !c.is_read && c.last_message_sender_id !== user?.id
                    ).length;

                    // Si on a plus de messages non lus qu'avant, afficher la notification
                    if (unread > prevUnreadCountRef.current) {
                        setShowNotification(true);
                        // Cacher après 3 secondes
                        setTimeout(() => setShowNotification(false), 3000);
                    }

                    setUnreadCount(unread);
                    prevUnreadCountRef.current = unread;
                }
            } catch (error) {
                console.error("Erreur vérification messages", error);
            }
        };

        // Vérification initiale
        checkUnreadMessages();

        // Polling toutes les 3 secondes
        const interval = setInterval(checkUnreadMessages, 3000);

        return () => clearInterval(interval);
    }, [isAuthenticated, user?.id]);

    const handleClick = () => {
        if (isAuthenticated()) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="fixed-chat-wrapper">
            {showNotification && (
                <div className="chat-notification-bubble">
                    Nouveau message !
                </div>
            )}

            <button
                className="fixed-chat-button"
                onClick={handleClick}
                title="Messagerie"
            >
                <img src={chatIcon} alt="Chat" className="chat-icon-img" />
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                )}
                <span className="chat-tooltip">Chat</span>
            </button>
        </div>
    );
};

export default FixedChatButton;
