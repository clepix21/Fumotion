import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function PrivacyPage() {
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
                <h1>Politique de Confidentialité</h1>
                <p className="last-updated">Dernière mise à jour : 23 décembre 2025</p>

                <div className="static-section">
                    <h2>1. Introduction</h2>
                    <p>
                        Chez Fumotion, nous accordons une importance capitale à la protection de vos données 
                        personnelles. Cette politique de confidentialité vous informe sur la manière dont nous 
                        collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
                    </p>
                    <p>
                        En utilisant Fumotion, vous acceptez les pratiques décrites dans cette politique.
                    </p>
                </div>

                <div className="static-section">
                    <h2>2. Données collectées</h2>
                    <h3>2.1 Données que vous nous fournissez</h3>
                    <ul>
                        <li><strong>Informations d'inscription :</strong> nom, prénom, adresse email, mot de passe, numéro de téléphone</li>
                        <li><strong>Informations de profil :</strong> photo de profil, université, numéro étudiant</li>
                        <li><strong>Informations sur les trajets :</strong> lieux de départ et d'arrivée, dates, préférences</li>
                        <li><strong>Communications :</strong> messages échangés avec d'autres utilisateurs ou notre support</li>
                    </ul>

                    <h3>2.2 Données collectées automatiquement</h3>
                    <ul>
                        <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, appareil utilisé</li>
                        <li><strong>Données d'utilisation :</strong> pages consultées, actions effectuées, durée des sessions</li>
                        <li><strong>Cookies :</strong> identifiants de session, préférences (voir notre politique cookies)</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>3. Utilisation des données</h2>
                    <p>Nous utilisons vos données pour :</p>
                    <ul>
                        <li>Fournir et améliorer nos services de covoiturage</li>
                        <li>Créer et gérer votre compte utilisateur</li>
                        <li>Mettre en relation conducteurs et passagers</li>
                        <li>Traiter les paiements et réservations</li>
                        <li>Assurer la sécurité de la plateforme et prévenir les fraudes</li>
                        <li>Vous envoyer des notifications relatives à vos trajets</li>
                        <li>Répondre à vos demandes de support</li>
                        <li>Améliorer notre plateforme grâce à des analyses statistiques</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>4. Partage des données</h2>
                    <h3>4.1 Avec les autres utilisateurs</h3>
                    <p>
                        Certaines informations de votre profil (prénom, photo, avis) sont visibles par les autres 
                        utilisateurs pour permettre le bon fonctionnement du service de covoiturage.
                    </p>

                    <h3>4.2 Avec nos prestataires</h3>
                    <p>
                        Nous pouvons partager vos données avec des prestataires de services qui nous aident à 
                        exploiter la plateforme (hébergement, paiement, analytics). Ces prestataires sont 
                        contractuellement tenus de protéger vos données.
                    </p>

                    <h3>4.3 Obligations légales</h3>
                    <p>
                        Nous pouvons être amenés à divulguer vos données si la loi l'exige ou en réponse à une 
                        demande des autorités compétentes.
                    </p>
                </div>

                <div className="static-section">
                    <h2>5. Sécurité des données</h2>
                    <p>
                        Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées 
                        pour protéger vos données contre tout accès non autorisé, modification, divulgation ou 
                        destruction :
                    </p>
                    <ul>
                        <li>Chiffrement des données sensibles (mots de passe, données de paiement)</li>
                        <li>Connexions sécurisées (HTTPS)</li>
                        <li>Accès restreint aux données personnelles</li>
                        <li>Surveillance et audits réguliers de sécurité</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>6. Conservation des données</h2>
                    <p>
                        Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou 
                        que cela est nécessaire pour vous fournir nos services.
                    </p>
                    <p>
                        Après suppression de votre compte, certaines données peuvent être conservées pendant 
                        une durée limitée pour des obligations légales ou la résolution de litiges.
                    </p>
                </div>

                <div className="static-section">
                    <h2>7. Vos droits (RGPD)</h2>
                    <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                    <ul>
                        <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
                        <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes</li>
                        <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                        <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                        <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                        <li><strong>Droit de limitation :</strong> demander la limitation du traitement</li>
                    </ul>
                    <p>
                        Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@fumotion.com">privacy@fumotion.com</a>
                    </p>
                </div>

                <div className="static-section">
                    <h2>8. Transferts internationaux</h2>
                    <p>
                        Vos données sont principalement stockées sur des serveurs situés dans l'Union Européenne. 
                        En cas de transfert vers des pays tiers, nous nous assurons que des garanties appropriées 
                        sont en place conformément à la réglementation applicable.
                    </p>
                </div>

                <div className="static-section">
                    <h2>9. Mineurs</h2>
                    <p>
                        Fumotion n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas 
                        sciemment de données personnelles concernant des mineurs.
                    </p>
                </div>

                <div className="static-section">
                    <h2>10. Modifications</h2>
                    <p>
                        Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                        Nous vous informerons de tout changement significatif par email ou notification sur la plateforme.
                    </p>
                </div>

                <div className="static-section">
                    <h2>11. Contact</h2>
                    <p>
                        Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
                        contactez notre Délégué à la Protection des Données :
                    </p>
                    <ul>
                        <li>Email : <a href="mailto:privacy@fumotion.com">privacy@fumotion.com</a></li>
                        <li>Formulaire de contact : <a href="/contact">Nous contacter</a></li>
                    </ul>
                </div>
            </main>

            <Footer />
        </div>
    );
}
