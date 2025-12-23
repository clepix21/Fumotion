import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function CookiesPage() {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: true,
        marketing: false
    });
    const [saved, setSaved] = useState(false);

    const handleToggle = (key) => {
        if (key === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setSaved(false);
    };

    const savePreferences = () => {
        // Sauvegarde des préférences dans localStorage
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
                <h1>Politique des Cookies</h1>
                <p className="last-updated">Dernière mise à jour : 23 décembre 2025</p>

                <div className="static-section">
                    <h2>Qu'est-ce qu'un cookie ?</h2>
                    <p>
                        Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, 
                        smartphone) lorsque vous visitez un site web. Les cookies permettent au site de reconnaître 
                        votre appareil et de mémoriser certaines informations sur vos préférences ou actions passées.
                    </p>
                </div>

                <div className="static-section">
                    <h2>Comment utilisons-nous les cookies ?</h2>
                    <p>
                        Fumotion utilise différents types de cookies pour améliorer votre expérience sur notre 
                        plateforme et vous fournir des services personnalisés.
                    </p>
                </div>

                <div className="static-section">
                    <h2>Types de cookies utilisés</h2>

                    <h3>🔒 Cookies strictement nécessaires</h3>
                    <p>
                        Ces cookies sont essentiels au fonctionnement de la plateforme. Ils vous permettent de 
                        naviguer sur le site et d'utiliser ses fonctionnalités (connexion, réservation, panier). 
                        Sans ces cookies, les services que vous avez demandés ne peuvent pas être fournis.
                    </p>
                    <ul>
                        <li>Cookie de session utilisateur</li>
                        <li>Cookie d'authentification</li>
                        <li>Cookie de sécurité (protection CSRF)</li>
                    </ul>

                    <h3>📊 Cookies analytiques</h3>
                    <p>
                        Ces cookies nous permettent de comprendre comment les visiteurs utilisent notre site en 
                        collectant des informations de manière anonyme. Ils nous aident à améliorer le fonctionnement 
                        de notre plateforme.
                    </p>
                    <ul>
                        <li>Pages visitées et temps passé</li>
                        <li>Source du trafic</li>
                        <li>Erreurs rencontrées</li>
                    </ul>

                    <h3>🎯 Cookies marketing</h3>
                    <p>
                        Ces cookies sont utilisés pour suivre les visiteurs sur les sites web. L'intention est 
                        d'afficher des publicités pertinentes et engageantes pour l'utilisateur.
                    </p>
                </div>

                <div className="static-section">
                    <h2>Gérer vos préférences</h2>
                    <p>
                        Vous pouvez gérer vos préférences de cookies ci-dessous. Notez que la désactivation de 
                        certains cookies peut affecter votre expérience sur notre plateforme.
                    </p>

                    <div className="cookie-preferences">
                        <div className="cookie-option">
                            <div className="cookie-option-info">
                                <h4>Cookies nécessaires</h4>
                                <p>Essentiels au fonctionnement du site. Ne peuvent pas être désactivés.</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.necessary} 
                                    disabled 
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="cookie-option">
                            <div className="cookie-option-info">
                                <h4>Cookies analytiques</h4>
                                <p>Nous aident à comprendre comment vous utilisez le site.</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.analytics} 
                                    onChange={() => handleToggle('analytics')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="cookie-option">
                            <div className="cookie-option-info">
                                <h4>Cookies marketing</h4>
                                <p>Permettent d'afficher des publicités personnalisées.</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.marketing} 
                                    onChange={() => handleToggle('marketing')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <button 
                            className="submit-btn" 
                            onClick={savePreferences}
                            style={{ marginTop: '1.5rem', width: '100%' }}
                        >
                            {saved ? '✓ Préférences enregistrées' : 'Enregistrer mes préférences'}
                        </button>
                    </div>
                </div>

                <div className="static-section">
                    <h2>Durée de conservation</h2>
                    <p>
                        La durée de conservation des cookies varie selon leur type :
                    </p>
                    <ul>
                        <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
                        <li><strong>Cookies persistants :</strong> conservés jusqu'à 13 mois maximum</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>Comment supprimer les cookies ?</h2>
                    <p>
                        Vous pouvez à tout moment supprimer les cookies stockés sur votre appareil via les 
                        paramètres de votre navigateur. Voici les liens vers les instructions pour les 
                        navigateurs les plus courants :
                    </p>
                    <ul>
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                        <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>Contact</h2>
                    <p>
                        Pour toute question concernant notre utilisation des cookies, contactez-nous à : 
                        <a href="mailto:privacy@fumotion.com"> privacy@fumotion.com</a>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
