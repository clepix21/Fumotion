import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => {
    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404</h1>
            <h2 className="not-found-subtitle">Oups ! Page introuvable</h2>
            <p className="not-found-text">
                Il semble que la page que vous cherchez a pris une autre route.
                Revenez sur le bon chemin avec nous !
            </p>
            <Link to="/" className="not-found-button">
                Retour à l'accueil
            </Link>
        </div>
    );
};

export default NotFoundPage;
