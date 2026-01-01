import React from 'react';

const ConversationList = ({ conversations, selectedUserId, onSelectUser, loading }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Moins d'une minute
        if (diff < 60000) return 'À l\'instant';
        // Moins d'une heure
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        // Aujourd'hui
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        // Hier
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        }
        // Cette semaine
        if (diff < 604800000) {
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        }
        // Plus vieux
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    const truncateMessage = (msg, maxLength = 35) => {
        if (!msg) return '';
        return msg.length > maxLength ? msg.substring(0, maxLength) + '...' : msg;
    };

    return (
        <>
            <div className="conversation-header">
                <h2>💬 Messages</h2>
                {loading && <span className="loading-indicator">⟳</span>}
            </div>

            <div className="conversation-list">
                {conversations.length === 0 ? (
                    <div className="empty-conversations">
                        <p>Aucune conversation</p>
                        <small>Commencez une discussion depuis le profil d'un conducteur</small>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isUnread = !conv.is_read && conv.last_message_sender_id !== selectedUserId;
                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectUser(conv.id)}
                                className={`conversation-item ${selectedUserId === conv.id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                            >
                                <div className="conversation-avatar-container">
                                    {conv.profile_picture ? (
                                        <img
                                            src={`http://localhost:5000/uploads/${conv.profile_picture}`}
                                            alt={`${conv.first_name} ${conv.last_name}`}
                                            className="conversation-avatar"
                                        />
                                    ) : (
                                        <div className="conversation-avatar conversation-avatar-initials">
                                            {conv.first_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {isUnread && <span className="unread-dot"></span>}
                                </div>

                                <div className="conversation-info">
                                    <div className="conversation-top">
                                        <span className="conversation-name">
                                            {conv.first_name} {conv.last_name}
                                        </span>
                                        <span className="conversation-date">
                                            {formatDate(conv.last_message_date)}
                                        </span>
                                    </div>

                                    <p className={`conversation-preview ${isUnread ? 'unread' : ''}`}>
                                        {conv.last_message_sender_id === conv.id ? '' : 'Vous: '}
                                        {truncateMessage(conv.last_message)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default ConversationList;
