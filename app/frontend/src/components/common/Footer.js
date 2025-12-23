import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';
import logo from '../../assets/images/logo.png';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <div className="footer-brand">
                            <img src={logo} alt="Fumotion" className="footer-logo-img" />
                            <span className="footer-name">Fumotion</span>
                        </div>
                        <p className="footer-tagline">
                            La plateforme de covoiturage moderne, sécurisée et conviviale pour tous vos trajets quotidiens.
                        </p>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Découvrir</h4>
                        <ul className="footer-links">
                            <li><Link to="/search">Rechercher un trajet</Link></li>
                            <li><Link to="/create-trip">Proposer un trajet</Link></li>
                            <li><Link to="/about">Qui sommes-nous</Link></li>
                            <li><Link to="#features">Fonctionnalités</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Support</h4>
                        <ul className="footer-links">
                            <li><Link to="/help">Centre d'aide</Link></li>
                            <li><Link to="/contact">Nous contacter</Link></li>
                            <li><Link to="/security">Confiance et sérénité</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Légal</h4>
                        <ul className="footer-links">
                            <li><Link to="/terms">Conditions générales</Link></li>
                            <li><Link to="/privacy">Confidentialité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Fumotion. Tous droits réservés.</p>
                    <div className="footer-social">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">LinkedIn</a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
