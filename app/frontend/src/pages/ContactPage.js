import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function ContactPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulation d'envoi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitted(true);
        setLoading(false);
    };

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
                <h1>Nous contacter</h1>
                <p className="page-subtitle">
                    Une question, une suggestion ou un problème ? Notre équipe est à votre écoute.
                </p>

                <div className="static-section">
                    <h2>Informations de contact</h2>
                    <ul>
                        <li><strong>Email :</strong> support@fumotion.com</li>
                        <li><strong>Horaires :</strong> Du lundi au vendredi, 9h - 18h</li>
                        <li><strong>Délai de réponse :</strong> Sous 24 à 48 heures ouvrées</li>
                    </ul>
                </div>

                {submitted ? (
                    <div className="static-section">
                        <div className="help-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="help-card-icon">✅</div>
                            <h3>Message envoyé !</h3>
                            <p>
                                Merci de nous avoir contacté. Notre équipe reviendra vers vous dans les plus brefs délais.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="contact-form">
                        <h2 style={{ marginBottom: '1.5rem' }}>Envoyez-nous un message</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nom complet *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Votre nom"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Sujet *</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionnez un sujet</option>
                                    <option value="reservation">Problème de réservation</option>
                                    <option value="paiement">Question sur un paiement</option>
                                    <option value="compte">Mon compte</option>
                                    <option value="signalement">Signalement</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="Décrivez votre demande en détail..."
                                />
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
