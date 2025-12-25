import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import profileIcon from '../assets/icons/profile.svg';
import '../styles/StaticPages.css';

export default function HelpPage() {
    const navigate = useNavigate();

    const helpCategories = [
        {
            icon: '🚗',
            title: 'Trajets & Réservations',
            description: 'Comment rechercher, réserver ou proposer un trajet sur Fumotion.',
            link: '/faq#trajets'
        },
        {
            icon: <img src={profileIcon} alt="" className="help-icon-svg" />,
            title: 'Mon Compte',
            description: 'Gérer votre profil, vos préférences et vos informations personnelles.',
            link: '/faq#compte'
        },
        {
            icon: '💳',
            title: 'Paiements',
            description: 'Questions sur les paiements, remboursements et facturations.',
            link: '/faq#paiements'
        },
        {
            icon: '🔒',
            title: 'Sécurité',
            description: 'Protégez votre compte et voyagez en toute sérénité.',
            link: '/security'
        },
        {
            icon: '💬',
            title: 'Messagerie',
            description: 'Communiquer avec les autres membres de la communauté.',
            link: '/faq#messagerie'
        },
        {
            icon: '⚠️',
            title: 'Signalements',
            description: 'Signaler un problème ou un comportement inapproprié.',
            link: '/contact'
        }
    ];

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
                <h1>Centre d'aide</h1>
                <p className="page-subtitle">
                    Bienvenue dans notre centre d'aide. Trouvez rapidement des réponses à vos questions.
                </p>

                <div className="help-cards">
                    {helpCategories.map((category, index) => (
                        <div className="help-card" key={index}>
                            <div className="help-card-icon">{category.icon}</div>
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                            <Link to={category.link} className="help-card-link">
                                En savoir plus →
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="static-section">
                    <h2>Vous ne trouvez pas ce que vous cherchez ?</h2>
                    <p>
                        Notre équipe est là pour vous aider. N'hésitez pas à nous contacter directement
                        et nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Link to="/contact" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1rem' }}>
                        Nous contacter
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
