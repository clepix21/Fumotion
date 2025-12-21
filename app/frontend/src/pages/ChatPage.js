import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import { messageService } from '../services/messageService';
import logo from '../assets/images/logo.png';
import '../styles/Chat.css';
import '../styles/HomePage.css';

const ChatPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showConversations, setShowConversations] = useState(true);
    const messagesIntervalRef = useRef(null);

    // Charger les conversations
    const loadConversations = useCallback(async () => {
        try {
            const response = await messageService.getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error("Erreur chargement conversations", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les messages
    const loadMessages = useCallback(async (otherId) => {
        if (!otherId) return;
        try {
            const response = await messageService.getMessages(otherId);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error("Erreur chargement messages", error);
        }
    }, []);

    // Charger les infos de l'utilisateur sélectionné
    const loadSelectedUser = useCallback(async (id) => {
        // D'abord chercher dans les conversations
        const conv = conversations.find(c => c.id === parseInt(id));
        if (conv) {
            setSelectedUser(conv);
            return;
        }
        
        // Sinon charger depuis l'API
        try {
            const { authAPI } = await import('../services/api');
            const response = await authAPI.getPublicProfile(id);
            if (response.success) {
                setSelectedUser(response.data);
            }
        } catch (err) {
            console.error("Impossible de charger l'utilisateur", err);
        }
    }, [conversations]);

    // Initialisation
    useEffect(() => {
        loadConversations();
        // Rafraîchir les conversations toutes les 15 secondes
        const interval = setInterval(loadConversations, 15000);
        return () => clearInterval(interval);
    }, [loadConversations]);

    // Quand userId change
    useEffect(() => {
        if (userId) {
            loadMessages(userId);
            loadSelectedUser(userId);
            setShowConversations(false);
            
            // Rafraîchir les messages toutes les 3 secondes
            if (messagesIntervalRef.current) {
                clearInterval(messagesIntervalRef.current);
            }
            messagesIntervalRef.current = setInterval(() => {
                loadMessages(userId);
            }, 3000);
        } else {
            setMessages([]);
            setSelectedUser(null);
            setShowConversations(true);
        }

        return () => {
            if (messagesIntervalRef.current) {
                clearInterval(messagesIntervalRef.current);
            }
        };
    }, [userId, loadMessages, loadSelectedUser]);

    const handleSelectUser = (id) => {
        navigate(`/chat/${id}`);
    };

    const handleSendMessage = async (text) => {
        if (!userId || sending) return;

        setSending(true);
        try {
            const response = await messageService.sendMessage({
                receiver_id: parseInt(userId),
                message: text
            });

            if (response.success) {
                // Ajouter le message localement pour une réponse immédiate
                setMessages(prev => [...prev, response.data]);
                loadConversations();
            }
        } catch (error) {
            console.error("Erreur envoi message", error);
            alert("Erreur lors de l'envoi du message");
        } finally {
            setSending(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleBackToList = () => {
        navigate('/chat');
        setShowConversations(true);
    };

    if (!currentUser) {
        return (
            <div className="chat-not-logged">
                <p>Veuillez vous connecter pour accéder aux messages.</p>
                <Link to="/login" className="chat-login-btn">Se connecter</Link>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand" onClick={() => navigate("/")}>
                        <img src={logo} alt="Fumotion" className="brand-logo" />
                        <span className="brand-name">Fumotion</span>
                    </div>

                    <button
                        className="navbar-mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                        <Link to="/search" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                            Rechercher
                        </Link>
                        <div className="navbar-divider"></div>
                        <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
                            Tableau de bord
                        </button>
                        <button onClick={() => { navigate("/chat"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                            💬 Messages
                        </button>
                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
                            <span>🚪</span> Déconnexion
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="chat-page-container">
                {/* Sidebar - visible sur desktop, conditionnel sur mobile */}
                <div className={`conversation-sidebar ${!showConversations && userId ? 'hidden-mobile' : ''}`}>
                    <ConversationList
                        conversations={conversations}
                        selectedUserId={userId ? parseInt(userId) : null}
                        onSelectUser={handleSelectUser}
                        loading={loading}
                    />
                </div>

                {/* Chat window */}
                <div className={`chat-main ${showConversations && !userId ? 'hidden-mobile' : ''}`}>
                    <ChatWindow
                        messages={messages}
                        currentUser={currentUser}
                        otherUser={selectedUser}
                        onSendMessage={handleSendMessage}
                        onBack={handleBackToList}
                        sending={sending}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
