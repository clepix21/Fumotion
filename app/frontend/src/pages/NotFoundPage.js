/**
 * Page 404 - Page non trouvée
 * Animation style "DVD bouncing logo" avec un chien nerveux
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => {
    const logoRef = useRef(null);
    const containerRef = useRef(null);
    const [clickEffect, setClickEffect] = useState(false);
    
    useEffect(() => {
        const logo = logoRef.current;
        const container = containerRef.current;
        if (!logo || !container) return;

        const FPS = 60;
        const dogSize = 100;
        
        let xPosition = window.innerWidth / 2 - dogSize / 2;
        let yPosition = window.innerHeight / 2 - dogSize / 2;
        let xSpeed = 2.5 * (Math.random() > 0.5 ? 1 : -1);
        let ySpeed = 2.5 * (Math.random() > 0.5 ? 1 : -1);

        const updatePosition = () => {
            const maxX = window.innerWidth - dogSize;
            const maxY = window.innerHeight - dogSize;

            if (xPosition >= maxX || xPosition <= 0) xSpeed = -xSpeed;
            if (yPosition >= maxY || yPosition <= 0) ySpeed = -ySpeed;

            xPosition += xSpeed;
            yPosition += ySpeed;

            xPosition = Math.max(0, Math.min(xPosition, maxX));
            yPosition = Math.max(0, Math.min(yPosition, maxY));

            logo.style.left = xPosition + 'px';
            logo.style.top = yPosition + 'px';
        };

        const interval = setInterval(updatePosition, 1000 / FPS);

        const handleResize = () => {
            xPosition = Math.min(xPosition, window.innerWidth - dogSize);
            yPosition = Math.min(yPosition, window.innerHeight - dogSize);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleDogeClick = () => {
        setClickEffect(true);
        setTimeout(() => setClickEffect(false), 150);
    };

    return (
        <div ref={containerRef} className="not-found-container">
            {/* Chien rebondissant */}
            <div
                ref={logoRef}
                className={`bouncing-doge ${clickEffect ? 'clicked' : ''}`}
                onClick={handleDogeClick}
            >
                🐕
            </div>

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
