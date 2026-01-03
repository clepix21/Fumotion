/**
 * Liste des conversations
 * Affiche toutes les discussions avec d'autres utilisateurs
 */
import React, { useState, useRef, useEffect } from 'react';

const ConversationList = ({ conversations, selectedUserId, onSelectUser, loading }) => {
    const [profilePopup, setProfilePopup] = useState(null);
    const popupRef = useRef(null);

    // Fermer le popup quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setProfilePopup(null);
            }
        };

        if (profilePopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profilePopup]);

    /** Formate la date du dernier message (relatif) */
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'À l\'instant';           // < 1 min
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`; // < 1h
        if (date.toDateString() === now.toDateString()) {  // Aujourd'hui
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Hier';
        if (diff < 604800000) return date.toLocaleDateString('fr-FR', { weekday: 'short' }); // Cette semaine
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    /** Tronque le message si trop long */
    const truncateMessage = (msg, maxLength = 35) => {
        if (!msg) return '';
        return msg.length > maxLength ? msg.substring(0, maxLength) + '...' : msg;
    };

    return (
        <>
            <div className="conversation-header">
                <h2>Messages</h2>
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
                                <div 
                                    className="conversation-avatar-container"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setProfilePopup(profilePopup === conv.id ? null : conv.id);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {conv.profile_picture ? (
                                        <img
                                            src={`/uploads/${conv.profile_picture}`}
                                            alt={`${conv.first_name} ${conv.last_name}`}
                                            className="conversation-avatar clickable-avatar"
                                        />
                                    ) : (
                                        <div className="conversation-avatar conversation-avatar-initials clickable-avatar">
                                            {conv.first_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {isUnread && <span className="unread-dot"></span>}

                                    {/* Popup de profil */}
                                    {profilePopup === conv.id && (
                                        <div className="profile-popup conversation-profile-popup" ref={popupRef}>
                                            <div className="profile-popup-header">
                                                {conv.profile_picture ? (
                                                    <img
                                                        src={`/uploads/${conv.profile_picture}`}
                                                        alt={conv.first_name}
                                                        className="profile-popup-avatar"
                                                    />
                                                ) : (
                                                    <div className="profile-popup-avatar profile-popup-initials">
                                                        {conv.first_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="profile-popup-info">
                                                    <h3>{conv.first_name} {conv.last_name}</h3>
                                                    <p className="profile-popup-joined">
                                                        Membre depuis {conv.created_at ? new Date(conv.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '2024'}
                                                    </p>
                                                </div>
                                            </div>
                                            {conv.bio && (
                                                <p className="profile-popup-bio">{conv.bio}</p>
                                            )}
                                            <div className="profile-popup-stats">
                                                <div className="profile-popup-stat">
                                                    <span className="stat-value">{conv.driver_rating ? parseFloat(conv.driver_rating).toFixed(1) : '-'}</span>
                                                    <span className="stat-label">Conducteur</span>
                                                </div>
                                                <div className="profile-popup-stat">
                                                    <span className="stat-value">{conv.passenger_rating ? parseFloat(conv.passenger_rating).toFixed(1) : '-'}</span>
                                                    <span className="stat-label">Passager</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
