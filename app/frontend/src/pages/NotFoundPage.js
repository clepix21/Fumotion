/**
 * Page 404 - Page non trouvée
 * Animation style "DVD bouncing logo" avec un chien nerveux
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => {
    const logoRef = useRef(null);
    const sectionRef = useRef(null);
    const [clickEffect, setClickEffect] = useState(false);
    
    useEffect(() => {
        const logo = logoRef.current;
        const section = sectionRef.current;
        if (!logo || !section) return;

        const FPS = 60;
        const dogSize = 120;
        
        let xPosition = window.innerWidth / 2 - dogSize / 2;
        let yPosition = window.innerHeight / 2 - dogSize / 2;
        let xSpeed = 3 * (Math.random() > 0.5 ? 1 : -1);
        let ySpeed = 3 * (Math.random() > 0.5 ? 1 : -1);

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
        <section ref={sectionRef} className="not-found-section">
            {/* Étoiles animées en fond */}
            <div className="stars-container">
                {[...Array(80)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${1.5 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Chien rebondissant */}
            <div
                ref={logoRef}
                className={`bouncing-doge ${clickEffect ? 'clicked' : ''}`}
                onClick={handleDogeClick}
            >
                🐕
            </div>

            {/* Contenu 404 */}
            <div className="not-found-content">
                <h1 className="not-found-title glitch" data-text="404">404</h1>
                <h2 className="not-found-subtitle">Oups ! Page introuvable</h2>
                <p className="not-found-text">
                    Ce chien cherche la page partout mais ne la trouve pas...
                </p>
                <Link to="/" className="not-found-button">
                    🏠 Retour à l'accueil
                </Link>
            </div>
        </section>
    );
};

export default NotFoundPage;
