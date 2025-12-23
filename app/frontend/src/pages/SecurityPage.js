import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function SecurityPage() {
    const navigate = useNavigate();

    const securityFeatures = [
        {
            icon: '🔐',
            title: 'Vérification des profils',
            description: 'Tous les utilisateurs sont vérifiés via leur email universitaire pour garantir une communauté de confiance.'
        },
        {
            icon: '⭐',
            title: 'Système d\'avis',
            description: 'Consultez les avis et notes des conducteurs et passagers avant chaque trajet.'
        },
        {
            icon: '💬',
            title: 'Messagerie sécurisée',
            description: 'Communiquez en toute sécurité via notre messagerie intégrée sans partager vos coordonnées personnelles.'
        },
        {
            icon: '🛡️',
            title: 'Données protégées',
            description: 'Vos données personnelles sont cryptées et stockées de manière sécurisée conformément au RGPD.'
        },
        {
            icon: '📞',
            title: 'Support réactif',
            description: 'Notre équipe est disponible pour vous assister en cas de problème ou d\'urgence.'
        },
        {
            icon: '🚨',
            title: 'Signalement facile',
            description: 'Signalez tout comportement suspect ou problème directement depuis l\'application.'
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
                <h1>Confiance et sérénité</h1>
                <p className="page-subtitle">
                    Chez Fumotion, votre sécurité est notre priorité. Découvrez les mesures que nous mettons en place pour vous protéger.
                </p>

                <div className="security-features">
                    {securityFeatures.map((feature, index) => (
                        <div className="security-feature" key={index}>
                            <div className="security-feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="static-section">
                    <h2>Conseils pour voyager en toute sécurité</h2>
                    
                    <h3>Avant le trajet</h3>
                    <ul>
                        <li>Consultez le profil et les avis du conducteur ou des passagers</li>
                        <li>Vérifiez les détails du trajet (horaire, lieu de rendez-vous, véhicule)</li>
                        <li>Partagez les détails de votre trajet avec un proche</li>
                        <li>Communiquez via la messagerie Fumotion pour garder une trace des échanges</li>
                    </ul>

                    <h3>Pendant le trajet</h3>
                    <ul>
                        <li>Gardez votre téléphone chargé et à portée de main</li>
                        <li>Faites confiance à votre instinct : en cas de doute, n'hésitez pas à annuler</li>
                        <li>Respectez les règles de courtoisie et de savoir-vivre</li>
                    </ul>

                    <h3>Après le trajet</h3>
                    <ul>
                        <li>Laissez un avis honnête pour aider la communauté</li>
                        <li>Signalez tout problème rencontré via notre formulaire de contact</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>Un problème ?</h2>
                    <p>
                        Si vous rencontrez un problème ou souhaitez signaler un comportement inapproprié,
                        notre équipe est là pour vous aider.
                    </p>
                    <button 
                        className="submit-btn" 
                        onClick={() => navigate('/contact')}
                        style={{ marginTop: '1rem' }}
                    >
                        Nous contacter
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
