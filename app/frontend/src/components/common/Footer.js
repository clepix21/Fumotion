import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';
import logo from '../../assets/images/logo.png';
import freddy from '../../assets/images/fnaf/freddy.jpg';

export default function Footer() {
    const [showFreddy, setShowFreddy] = useState(false);

    const handleSocialClick = (e) => {
        e.preventDefault();
        setShowFreddy(true);
    };

    return (
        <footer className="footer">
            {showFreddy && (
                <div className="freddy-overlay" onClick={() => setShowFreddy(false)}>
                    <div className="freddy-modal">
                        <img src={freddy} alt="Freddy" className="freddy-image" />
                        <button className="freddy-close" onClick={() => setShowFreddy(false)}>✕</button>
                    </div>
                </div>
            )}
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <div className="footer-brand">
                            <img src={logo} alt="Fumotion" className="footer-logo-img" />
                            <span className="footer-name">Fumotion</span>
                        </div>
                        <p className="footer-tagline">
                            La plateforme de covoiturage pour les étudiants, sécurisée et conviviale pour tous vos trajets quotidiens.
                        </p>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Découvrir</h4>
                        <ul className="footer-links">
                            <li><Link to="/search">Rechercher un trajet</Link></li>
                            <li><Link to="/create-trip">Proposer un trajet</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h4 className="footer-heading">Légal</h4>
                        <ul className="footer-links">
                            <li><Link to="/credits">Crédits</Link></li>
                            <li><Link to="/terms">Conditions générales</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Fumotion. Tous droits réservés.</p>
                    <div className="footer-social">
                        <button onClick={handleSocialClick} className="social-link">Twitter</button>
                        <button onClick={handleSocialClick} className="social-link">Instagram</button>
                        <button onClick={handleSocialClick} className="social-link">LinkedIn</button>
                        <button onClick={handleSocialClick} className="social-link">Facebook</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
