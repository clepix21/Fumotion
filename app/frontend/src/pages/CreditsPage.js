import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function CreditsPage() {
    const navigate = useNavigate();

    return (
        <div className="static-page">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand" onClick={() => navigate('/')}>
                        <img src={logo} alt="Fumotion" className="brand-logo" />
                        <span className="brand-name">Fumotion</span>
                    </div>
                    <button className="navbar-back" onClick={() => navigate(-1)}>
                        ← Retour
                    </button>
                </div>
            </nav>

            <main className="static-content">
                <h1>Crédits</h1>
                <p className="page-subtitle">
                    Fumotion est rendu possible grâce au travail et aux contributions de nombreuses personnes et projets.
                </p>

                <div className="static-section">
                    <h2>Équipe de développement</h2>
                    <ul>
                        <li><strong>Conception & Développement :</strong> Équipe Fumotion</li>
                        <li><strong>Design UI/UX :</strong> Équipe Fumotion</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>Technologies utilisées</h2>
                    <h3>Frontend</h3>
                    <ul>
                        <li><strong>React.js</strong> - Bibliothèque JavaScript pour les interfaces utilisateur</li>
                        <li><strong>React Router</strong> - Navigation côté client</li>
                        <li><strong>Leaflet</strong> - Cartes interactives</li>
                    </ul>

                    <h3>Backend</h3>
                    <ul>
                        <li><strong>Node.js</strong> - Environnement d'exécution JavaScript</li>
                        <li><strong>Express.js</strong> - Framework web</li>
                        <li><strong>MySQL</strong> - Base de données relationnelle</li>
                        <li><strong>JWT</strong> - Authentification sécurisée</li>
                    </ul>

                    <h3>Infrastructure</h3>
                    <ul>
                        <li><strong>Docker</strong> - Conteneurisation</li>
                        <li><strong>Nginx</strong> - Serveur web</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>Ressources graphiques</h2>
                    <ul>
                        <li><strong>Icônes :</strong> SVG personnalisés et icônes libres de droits</li>
                        <li><strong>Images :</strong> Ressources libres de droits</li>
                        <li><strong>Polices :</strong> Google Fonts</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>APIs externes</h2>
                    <ul>
                        <li><strong>OpenStreetMap</strong> - Données cartographiques</li>
                        <li><strong>Nominatim</strong> - Géocodage des adresses</li>
                        <li><strong>OSRM</strong> - Calcul d'itinéraires</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>Remerciements</h2>
                    <p>
                        Nous remercions la communauté open source pour les nombreux outils et bibliothèques 
                        qui rendent ce projet possible, ainsi que tous les utilisateurs qui contribuent 
                        à améliorer Fumotion par leurs retours.
                    </p>
                </div>

                <div className="static-section">
                    <h2>Licence</h2>
                    <p>
                        Fumotion © {new Date().getFullYear()} - Tous droits réservés.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
