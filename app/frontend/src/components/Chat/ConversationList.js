import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConversationList = ({ conversations, selectedUserId, onSelectUser }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="conversation-header">
                <h2>Messages</h2>
            </div>

            <div className="conversation-list">
                {conversations.length === 0 ? (
                    <div className="empty-conversations">
                        Aucune conversation pour le moment.
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectUser(conv.id)}
                            className={`conversation-item ${selectedUserId === conv.id ? 'active' : ''}`}
                        >
                            <div className="conversation-avatar-container">
                                <img
                                    src={conv.profile_picture || 'https://via.placeholder.com/40'}
                                    alt={`${conv.first_name} ${conv.last_name}`}
                                    className="conversation-avatar"
                                />
                            </div>

                            <div className="conversation-info">
                                <div className="conversation-top">
                                    <span className="conversation-name">
                                        {conv.first_name} {conv.last_name}
                                    </span>
                                    {conv.last_message_date && (
                                        <span className="conversation-date">
                                            {new Date(conv.last_message_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <p className={`conversation-preview ${!conv.is_read && conv.last_message_sender_id !== conv.id ? 'unread' : ''}`}>
                                    {conv.last_message_sender_id === conv.id ? 'Vous: ' : ''}{conv.last_message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default ConversationList;
