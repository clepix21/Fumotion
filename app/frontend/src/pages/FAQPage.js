import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function FAQPage() {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const faqData = [
        {
            category: 'Trajets',
            id: 'trajets',
            questions: [
                {
                    q: 'Comment rechercher un trajet ?',
                    a: 'Rendez-vous sur la page de recherche, entrez votre lieu de départ, votre destination et la date souhaitée. Vous pouvez également filtrer par nombre de places disponibles.'
                },
                {
                    q: 'Comment proposer un trajet ?',
                    a: 'Connectez-vous à votre compte, cliquez sur "Créer un trajet" et remplissez les informations demandées : départ, arrivée, date, heure, prix et nombre de places.'
                },
                {
                    q: 'Puis-je modifier ou annuler mon trajet ?',
                    a: 'Oui, vous pouvez modifier ou annuler votre trajet depuis votre tableau de bord tant que celui-ci n\'a pas encore eu lieu. Les passagers seront notifiés automatiquement.'
                },
                {
                    q: 'Que faire si le conducteur annule le trajet ?',
                    a: 'En cas d\'annulation, vous serez immédiatement notifié et remboursé intégralement si le paiement a déjà été effectué.'
                }
            ]
        },
        {
            category: 'Compte',
            id: 'compte',
            questions: [
                {
                    q: 'Comment créer un compte ?',
                    a: 'Cliquez sur "S\'inscrire" et remplissez le formulaire avec votre email universitaire, votre nom et un mot de passe sécurisé.'
                },
                {
                    q: 'Comment modifier mes informations personnelles ?',
                    a: 'Accédez à votre tableau de bord et cliquez sur "Mon profil" pour modifier vos informations, votre photo ou vos préférences.'
                },
                {
                    q: 'J\'ai oublié mon mot de passe, que faire ?',
                    a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email pour réinitialiser votre mot de passe.'
                },
                {
                    q: 'Comment supprimer mon compte ?',
                    a: 'Contactez notre équipe support via le formulaire de contact pour demander la suppression de votre compte.'
                }
            ]
        },
        {
            category: 'Paiements',
            id: 'paiements',
            questions: [
                {
                    q: 'Quels modes de paiement sont acceptés ?',
                    a: 'Nous acceptons les cartes bancaires (Visa, Mastercard) via notre plateforme de paiement sécurisée.'
                },
                {
                    q: 'Quand suis-je prélevé ?',
                    a: 'Le paiement est prélevé au moment de la réservation et le conducteur reçoit le paiement après la réalisation du trajet.'
                },
                {
                    q: 'Comment obtenir un remboursement ?',
                    a: 'Les remboursements sont automatiques en cas d\'annulation par le conducteur. Pour les autres cas, contactez notre support.'
                },
                {
                    q: 'Les frais de service sont-ils inclus dans le prix ?',
                    a: 'Oui, le prix affiché inclut tous les frais. Aucun frais caché ne vous sera demandé.'
                }
            ]
        },
        {
            category: 'Messagerie',
            id: 'messagerie',
            questions: [
                {
                    q: 'Comment contacter un conducteur ou un passager ?',
                    a: 'Après avoir effectué une réservation, vous pouvez accéder à la messagerie depuis votre tableau de bord pour échanger avec l\'autre partie.'
                },
                {
                    q: 'Mes messages sont-ils privés ?',
                    a: 'Oui, vos conversations sont privées et sécurisées. Seuls vous et votre interlocuteur pouvez les lire.'
                },
                {
                    q: 'Puis-je partager mon numéro de téléphone ?',
                    a: 'Nous vous conseillons d\'utiliser la messagerie intégrée pour protéger vos données personnelles.'
                }
            ]
        }
    ];

    const toggleQuestion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    let globalIndex = 0;

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
                <h1>Foire aux questions</h1>
                <p className="page-subtitle">
                    Trouvez rapidement des réponses aux questions les plus fréquentes.
                </p>

                {faqData.map((section) => (
                    <div className="static-section" key={section.id} id={section.id}>
                        <h2>{section.category}</h2>
                        <div className="faq-list">
                            {section.questions.map((item) => {
                                const currentIndex = globalIndex++;
                                return (
                                    <div className="faq-item" key={currentIndex}>
                                        <button
                                            className={`faq-question ${activeIndex === currentIndex ? 'active' : ''}`}
                                            onClick={() => toggleQuestion(currentIndex)}
                                        >
                                            {item.q}
                                            <span className="icon">▼</span>
                                        </button>
                                        <div className={`faq-answer ${activeIndex === currentIndex ? 'active' : ''}`}>
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="static-section">
                    <h2>Vous n'avez pas trouvé votre réponse ?</h2>
                    <p>
                        Notre équipe support est disponible pour répondre à toutes vos questions.
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
