/**
 * Fenêtre de conversation
 * Affiche les messages et permet d'en envoyer de nouveaux
 */
import chatIcon from "../../assets/icons/chat.svg"
import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ messages, currentUser, otherUser, onSendMessage, onBack, sending }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const profilePopupRef = useRef(null);

    // Vérifier si l'utilisateur est en ligne (actif dans les 5 dernières minutes)
    const isOnline = React.useMemo(() => {
        if (!otherUser?.last_active_at) return false;
        const lastActive = new Date(otherUser.last_active_at);
        const now = new Date();
        const diff = now - lastActive;
        return diff < 5 * 60 * 1000; // 5 minutes
    }, [otherUser?.last_active_at]);

    // Scroll automatique vers le bas à chaque nouveau message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => scrollToBottom(), [messages]);

    // Focus sur l'input quand on sélectionne une conversation
    useEffect(() => {
        if (otherUser && inputRef.current) inputRef.current.focus();
    }, [otherUser]);

    // Fermer le popup quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
                setShowProfilePopup(false);
            }
        };

        if (showProfilePopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfilePopup]);

    /** Envoi du message */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        onSendMessage(newMessage.trim());
        setNewMessage('');
    };

    /** Envoi avec Entrée (sans Shift) */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    /** Formate l'heure d'un message */
    const formatMessageTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    /** Formate la date d'un message (Aujourd'hui, Hier, ou date complète) */
    const formatMessageDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) return "Aujourd'hui";

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return "Hier";

        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    // Grouper les messages par date
    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const date = new Date(msg.created_at).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    if (!otherUser) {
        return (
            <div className="chat-window">
                <div className="chat-placeholder">
                    <img src={chatIcon} alt="Chat" className="chat-chat-icon-img" />
                    <h3>Bienvenue dans vos messages</h3>
                    <p>Sélectionnez une conversation pour commencer à discuter</p>
                </div>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);



    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <button className="back-button mobile-only" onClick={onBack}>
                    ←
                </button>
                {otherUser.profile_picture ? (
                    <img
                        src={`/uploads/${otherUser.profile_picture}`}
                        alt={`${otherUser.first_name} ${otherUser.last_name}`}
                        className="chat-avatar clickable-avatar"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProfilePopup(!showProfilePopup);
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                ) : (
                    <div
                        className="chat-avatar chat-avatar-initials clickable-avatar"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProfilePopup(!showProfilePopup);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {otherUser.first_name?.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Popup de profil */}
                {showProfilePopup && (
                    <div className="profile-popup" ref={profilePopupRef}>
                        <div className="profile-popup-header">
                            {otherUser.profile_picture ? (
                                <img
                                    src={`/uploads/${otherUser.profile_picture}`}
                                    alt={otherUser.first_name}
                                    className="profile-popup-avatar"
                                />
                            ) : (
                                <div className="profile-popup-avatar profile-popup-initials">
                                    {otherUser.first_name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="profile-popup-info">
                                <h3>{otherUser.first_name} {otherUser.last_name}</h3>
                                <p className="profile-popup-joined">
                                    Membre depuis {otherUser.created_at ? new Date(otherUser.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '2024'}
                                </p>
                            </div>
                        </div>
                        {otherUser.bio && (
                            <p className="profile-popup-bio">{otherUser.bio}</p>
                        )}
                        <div className="profile-popup-stats">
                            <div className="profile-popup-stat">
                                <span className="stat-value">{otherUser.driver_rating ? parseFloat(otherUser.driver_rating).toFixed(1) : '-'}</span>
                                <span className="stat-label">Conducteur</span>
                            </div>
                            <div className="profile-popup-stat">
                                <span className="stat-value">{otherUser.passenger_rating ? parseFloat(otherUser.passenger_rating).toFixed(1) : '-'}</span>
                                <span className="stat-label">Passager</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="chat-partner-info">
                    <h3 className="chat-partner-name">
                        {otherUser.first_name} {otherUser.last_name}
                    </h3>
                    <span className={`chat-status ${isOnline ? 'online' : 'offline'}`}>
                        <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        {isOnline ? 'En ligne' : 'Hors ligne'}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>Commencez la conversation !</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date} className="message-date-group">
                            <div className="date-separator">
                                <span>{formatMessageDate(msgs[0].created_at)}</span>
                            </div>
                            {msgs.map((msg) => {
                                const isMe = msg.sender_id === currentUser.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-wrapper ${isMe ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-bubble">
                                            <p className="message-text">{msg.message}</p>
                                            <span className="message-time">
                                                {formatMessageTime(msg.created_at)}
                                                {isMe && (
                                                    <span className="message-status">
                                                        {msg.is_read ? ' ✓✓' : ' ✓'}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Écrivez votre message..."
                        className="chat-input"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="send-button"
                    >
                        {sending ? (
                            <span className="sending-spinner">⟳</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
