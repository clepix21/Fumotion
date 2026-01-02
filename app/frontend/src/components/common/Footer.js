import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';
import logo from '../../assets/images/logo.png';
import freddy from '../../assets/images/fnaf/freddy.jpg';
import chica from '../../assets/images/fnaf/chica.jpg';
import bonnie from '../../assets/images/fnaf/bonnie.jpg';
import foxy from '../../assets/images/fnaf/foxy.jpg';


export default function Footer() {
    const [currentImage, setCurrentImage] = useState(null);

    const handleSocialClick = (image) => {
        setCurrentImage(image);
    };

    return (
        <footer className="footer">
            {currentImage && (
                <div className="freddy-overlay" onClick={() => setCurrentImage(null)}>
                    <div className="freddy-modal">
                        <img src={currentImage} alt="FNAF" className="freddy-image" />
                        <button className="freddy-close" onClick={() => setCurrentImage(null)}>✕</button>
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
                        <button onClick={() => handleSocialClick(freddy)} className="social-link">Twitter</button>
                        <button onClick={() => handleSocialClick(chica)} className="social-link">Instagram</button>
                        <button onClick={() => handleSocialClick(bonnie)} className="social-link">LinkedIn</button>
                        <button onClick={() => handleSocialClick(foxy)} className="social-link">Facebook</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
