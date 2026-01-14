/**
 * Page de messagerie
 * Affiche les conversations et permet d'échanger des messages
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import Avatar from '../components/common/Avatar';
import { messageService } from '../services/messageService';
import logo from '../assets/images/logo.png';
import '../styles/Chat.css';
import '../styles/HomePage.css';

const ChatPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();
    const notification = useNotification();

    // États de la messagerie
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showConversations, setShowConversations] = useState(true);
    const messagesIntervalRef = useRef(null);

    /** Charge la liste des conversations */
    const loadConversations = useCallback(async () => {
        try {
            const response = await messageService.getConversations();
            if (response.success) {
                // Trier par date de dernier message (plus récent en premier)
                const sorted = response.data.sort((a, b) =>
                    new Date(b.last_message_date) - new Date(a.last_message_date)
                );
                setConversations(sorted);
            }
        } catch (error) {
            console.error("Erreur chargement conversations", error);
        } finally {
            setLoading(false);
        }
    }, []);

    /** Charge les messages avec un utilisateur */
    const loadMessages = useCallback(async (otherId) => {
        if (!otherId) return;
        try {
            const response = await messageService.getMessages(otherId);
            if (response.success) setMessages(response.data);
        } catch (error) {
            console.error("Erreur chargement messages", error);
        }
    }, []);

    /** Charge les infos de l'utilisateur sélectionné */
    const loadSelectedUser = useCallback(async (id) => {
        try {
            const { authAPI } = await import('../services/api');
            const response = await authAPI.getPublicProfile(id);
            if (response.success) {
                setSelectedUser(response.data);
            } else {
                // Fallback si l'API échoue
                const conv = conversations.find(c => c.id === parseInt(id));
                if (conv) setSelectedUser(conv);
            }
        } catch (err) {
            console.error("Impossible de charger l'utilisateur", err);
            const conv = conversations.find(c => c.id === parseInt(id));
            if (conv) setSelectedUser(conv);
        }
    }, [conversations]);

    // Initialisation et rafraîchissement périodique des conversations
    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 15000);
        return () => clearInterval(interval);
    }, [loadConversations]);

    // Quand userId change
    useEffect(() => {
        if (userId) {
            loadMessages(userId);
            loadSelectedUser(userId);
            setShowConversations(false);

            // Rafraîchir les messages et le statut toutes les 3 secondes
            if (messagesIntervalRef.current) {
                clearInterval(messagesIntervalRef.current);
            }
            messagesIntervalRef.current = setInterval(() => {
                loadMessages(userId);
                loadSelectedUser(userId);
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
            notification.error("Erreur lors de l'envoi du message");
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

                    {/* Menu desktop - visible seulement sur grand écran */}
                    <div className="navbar-menu navbar-menu-desktop">
                        <Link to="/search" className="navbar-link">
                            Rechercher
                        </Link>
                        <div className="navbar-divider"></div>
                        <button onClick={() => navigate("/chat")} className="navbar-btn-primary">
                            Messages
                        </button>
                        <div className="navbar-user-profile" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
                            <Avatar user={currentUser} size="medium" />
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">{currentUser?.first_name || currentUser?.email}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="navbar-btn-logout">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </nav>

            {/* Menu mobile - en dehors de la navbar */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="navbar-overlay"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="navbar-menu-mobile">
                        <button
                            className="navbar-menu-close"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Fermer le menu"
                        >
                            ✕
                        </button>

                        <Link to="/search" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                            Rechercher
                        </Link>
                        <div className="navbar-divider"></div>
                        <button onClick={() => { navigate("/chat"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                            Messages
                        </button>
                        <div className="navbar-user-profile" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
                            <Avatar user={currentUser} size="medium" />
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">{currentUser?.first_name || currentUser?.email}</span>
                            </div>
                        </div>
                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
                            Déconnexion
                        </button>
                    </div>
                </>
            )}

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
