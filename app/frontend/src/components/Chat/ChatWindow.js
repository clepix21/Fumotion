import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ messages, currentUser, otherUser, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        onSendMessage(newMessage);
        setNewMessage('');
    };

    if (!otherUser) {
        return (
            <div className="chat-window">
                <div className="chat-placeholder">
                    <span className="chat-placeholder-icon">💬</span>
                    <p className="text-xl">Sélectionnez une conversation</p>
                    <p className="text-sm">ou commencez un nouveau chat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <img
                    src={otherUser.profile_picture || 'https://via.placeholder.com/40'}
                    alt={`${otherUser.first_name} ${otherUser.last_name}`}
                    className="conversation-avatar"
                    style={{ width: '40px', height: '40px' }} // Override specific size
                />
                <div className="chat-partner-info">
                    <h3 className="chat-partner-name">
                        {otherUser.first_name} {otherUser.last_name}
                    </h3>
                    <span className="chat-status">En ligne</span>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                        <div
                            key={msg.id}
                            className={`message-wrapper ${isMe ? 'sent' : 'received'}`}
                        >
                            <div className="message-bubble">
                                <p style={{ margin: 0 }}>{msg.message}</p>
                                <span className="message-time">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="send-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
