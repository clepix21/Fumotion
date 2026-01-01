import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

import membre1 from '../assets/images/membres/membre1.png';
import membre2 from '../assets/images/membres/membre1.png';
import membre3 from '../assets/images/membres/membre1.png';
import membre4 from '../assets/images/membres/membre1.png';
import membre5 from '../assets/images/membres/membre1.png';
import membre6 from '../assets/images/membres/membre1.png';

// Logos des technologies
import reactLogo from '../assets/images/logos/react.png';
import nodeLogo from '../assets/images/logos/nodejs.svg';
import expressLogo from '../assets/images/logos/express.svg';
import mysqlLogo from '../assets/images/logos/mysql.png';
import dockerLogo from '../assets/images/logos/docker.png';
import nginxLogo from '../assets/images/logos/nginx.png';
import leafletLogo from '../assets/images/logos/leaflet.png';
import jwtLogo from '../assets/images/logos/jwt.png';

// Logos des APIs
import osmLogo from '../assets/images/logos/openstreetmap.png';
import nominatimLogo from '../assets/images/logos/nominatim.png';
import osrmLogo from '../assets/images/logos/osrm.svg';

export default function CreditsPage() {
    const navigate = useNavigate();

    const teamMembers = [
        { name: 'Clément', role: 'Développeur Full Stack', image: membre1, color: '#3498db' },
        { name: 'Membre 2', role: 'Designer UI/UX', image: membre2, color: '#9b59b6' },
        { name: 'Membre 3', role: 'Développeur Backend', image: membre3, color: '#e74c3c' },
        { name: 'Membre 4', role: 'Développeur Frontend', image: membre4, color: '#2ecc71' },
        { name: 'Membre 5', role: 'Chef de projet', image: membre5, color: '#f39c12' },
        { name: 'Membre 6', role: 'Testeur QA', image: membre6, color: '#1abc9c' }
    ];

    const technologies = [
        { name: 'React.js', category: 'Frontend', logo: reactLogo, description: 'Bibliothèque JavaScript pour les interfaces utilisateur' },
        { name: 'Node.js', category: 'Backend', logo: nodeLogo, description: 'Environnement d\'exécution JavaScript côté serveur' },
        { name: 'Express.js', category: 'Backend', logo: expressLogo, description: 'Framework web minimaliste et flexible' },
        { name: 'MySQL', category: 'Base de données', logo: mysqlLogo, description: 'Système de gestion de base de données relationnelle' },
        { name: 'Docker', category: 'Infrastructure', logo: dockerLogo, description: 'Plateforme de conteneurisation' },
        { name: 'Nginx', category: 'Infrastructure', logo: nginxLogo, description: 'Serveur web haute performance' },
        { name: 'Leaflet', category: 'Frontend', logo: leafletLogo, description: 'Bibliothèque de cartes interactives' },
        { name: 'JWT', category: 'Sécurité', logo: jwtLogo, description: 'Authentification sécurisée par tokens' }
    ];

    const apis = [
        { name: 'OpenStreetMap', logo: osmLogo, description: 'Données cartographiques libres' },
        { name: 'Nominatim', logo: nominatimLogo, description: 'Service de géocodage des adresses' },
        { name: 'OSRM', logo: osrmLogo, description: 'Calcul d\'itinéraires et navigation' }
    ];

    return (
        <div className="static-page credits-page">
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

            <main className="static-content credits-content">
                {/* Hero Section */}
                <div className="credits-hero">
                    <h1>Crédits</h1>
                    <p className="credits-subtitle">
                        Découvrez les personnes talentueuses et les technologies qui font vivre Fumotion
                    </p>
                </div>

                {/* Team Section */}
                <section className="credits-section">

                    <div className="team-grid">
                        {teamMembers.map((member, index) => (
                            <div 
                                key={index} 
                                className="team-card"
                                style={{ '--accent-color': member.color }}
                            >
                                <div className="team-avatar">
                                    <img src={member.image} alt={member.name} className="team-photo" />
                                </div>
                                <h3 className="team-name">{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technologies Section */}
                <section className="credits-section">
                    <div className="section-header">
                        <h2>Technologies Utilisées</h2>
                    </div>
                    <p className="section-description">
                        Les outils modernes qui propulsent notre application
                    </p>
                    <div className="tech-grid">
                        {technologies.map((tech, index) => (
                            <div key={index} className="tech-card">
                                <div className="tech-icon">
                                    <img src={tech.logo} alt={tech.name} className="tech-logo" />
                                </div>
                                <div className="tech-info">
                                    <h4 className="tech-name">{tech.name}</h4>
                                    <span className="tech-category">{tech.category}</span>
                                    <p className="tech-description">{tech.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* APIs Section */}
                <section className="credits-section">
                    <div className="section-header">
                        <h2>APIs & Services Externes</h2>
                    </div>
                    <div className="api-list">
                        {apis.map((api, index) => (
                            <div key={index} className="api-item">
                                <div className="api-icon">
                                    <img src={api.logo} alt={api.name} className="api-logo" />
                                </div>
                                <div>
                                    <strong>{api.name}</strong>
                                    <p>{api.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Thanks Section */}
                <section className="credits-section thanks-section">
                    <div className="thanks-card">
                        <h2>Remerciements</h2>
                        <div className="thanks-content">
                            <p>
                                <strong>À la communauté Open Source</strong> pour les innombrables bibliothèques 
                                et outils qui rendent ce projet possible.
                            </p>
                            <p>
                                <strong>À nos professeurs et encadrants</strong> pour leur accompagnement 
                                et leurs précieux conseils tout au long du développement.
                            </p>
                            <p>
                                <strong>À tous les utilisateurs</strong> qui font confiance à Fumotion 
                                et contribuent à améliorer l'application par leurs retours.
                            </p>
                            <p>
                                <strong>À nos familles et amis</strong> pour leur soutien indéfectible 
                                durant ce projet.
                            </p>
                        </div>
                        <div className="thanks-emoji-row">
                            <span>🙏</span>
                            <span>❤️</span>
                            <span>🎉</span>
                            <span>🚀</span>
                            <span>✨</span>
                        </div>
                    </div>
                </section>

                {/* Footer Credits */}
                <div className="credits-footer">
                    <p className="credits-copyright">
                        Fumotion © {new Date().getFullYear()} - Tous droits réservés
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
