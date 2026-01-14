import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../components/common/NotificationToast.css';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// Icons (simple SVGs)
const Icons = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    )
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Génère un ID unique pour chaque notif
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, exiting: true } : n
        ));

        // Wait for animation
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 300);
    }, []);

    const addNotification = useCallback((type, message, title = '') => {
        const id = generateId();
        const newNotification = {
            id,
            type,
            message: typeof message === 'object' ? JSON.stringify(message) : message,
            title
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after 5s
        setTimeout(() => {
            removeNotification(id);
        }, 5000);

        return id;
    }, [removeNotification]);

    // Helper functions for easier usage
    const success = useCallback((message, title) => addNotification('success', message, title || 'Succès'), [addNotification]);
    const error = useCallback((message, title) => addNotification('error', message, title || 'Erreur'), [addNotification]);
    const warning = useCallback((message, title) => addNotification('warning', message, title || 'Attention'), [addNotification]);
    const info = useCallback((message, title) => addNotification('info', message, title || 'Information'), [addNotification]);

    return (
        <NotificationContext.Provider value={{ success, error, warning, info, addNotification, removeNotification }}>
            {children}
            {createPortal(
                <div className="notification-container">
                    {notifications.map(note => (
                        <div
                            key={note.id}
                            className={`notification-toast ${note.type} ${note.exiting ? 'exiting' : ''}`}
                            role="alert"
                        >
                            <div className="notification-icon">
                                {Icons[note.type]}
                            </div>
                            <div className="notification-content">
                                {note.title && <div className="notification-title">{note.title}</div>}
                                <div className="notification-message">{note.message}</div>
                            </div>
                            <button
                                className="notification-close"
                                onClick={() => removeNotification(note.id)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </NotificationContext.Provider>
    );
};
