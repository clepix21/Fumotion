import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function LegalPage() {
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
                <h1>Mentions Légales</h1>
                <p className="last-updated">Dernière mise à jour : 23 décembre 2025</p>

                <div className="static-section">
                    <h2>1. Éditeur du site</h2>
                    <p>
                        Le site Fumotion accessible à l'adresse fumotion.com est édité par :
                    </p>
                    <ul>
                        <li><strong>Raison sociale :</strong> Fumotion SAS</li>
                        <li><strong>Forme juridique :</strong> Société par Actions Simplifiée</li>
                        <li><strong>Capital social :</strong> 10 000 €</li>
                        <li><strong>Siège social :</strong> 123 Avenue de l'Université, 75005 Paris, France</li>
                        <li><strong>SIRET :</strong> 123 456 789 00012</li>
                        <li><strong>RCS :</strong> Paris B 123 456 789</li>
                        <li><strong>TVA intracommunautaire :</strong> FR 12 345678901</li>
                        <li><strong>Email :</strong> <a href="mailto:contact@fumotion.com">contact@fumotion.com</a></li>
                        <li><strong>Téléphone :</strong> +33 1 23 45 67 89</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>2. Directeur de la publication</h2>
                    <p>
                        Le directeur de la publication est M./Mme [Nom du Directeur], en qualité de Président(e) 
                        de Fumotion SAS.
                    </p>
                </div>

                <div className="static-section">
                    <h2>3. Hébergement</h2>
                    <p>
                        Le site Fumotion est hébergé par :
                    </p>
                    <ul>
                        <li><strong>Hébergeur :</strong> OVH SAS</li>
                        <li><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</li>
                        <li><strong>Téléphone :</strong> +33 9 72 10 10 07</li>
                        <li><strong>Site web :</strong> <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer">www.ovh.com</a></li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>4. Propriété intellectuelle</h2>
                    <p>
                        L'ensemble du contenu du site Fumotion (textes, graphismes, images, logos, icônes, sons, 
                        logiciels, etc.) est la propriété exclusive de Fumotion SAS ou de ses partenaires et est 
                        protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
                    </p>
                    <p>
                        Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
                        des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf 
                        autorisation écrite préalable de Fumotion SAS.
                    </p>
                    <p>
                        Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient 
                        sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux 
                        dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                    </p>
                </div>

                <div className="static-section">
                    <h2>5. Protection des données personnelles</h2>
                    <p>
                        Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                        Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression 
                        et d'opposition aux données personnelles vous concernant.
                    </p>
                    <p>
                        Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter 
                        notre <a href="/privacy">Politique de Confidentialité</a>.
                    </p>
                    <p>
                        <strong>Délégué à la Protection des Données (DPO) :</strong><br />
                        Email : <a href="mailto:dpo@fumotion.com">dpo@fumotion.com</a>
                    </p>
                </div>

                <div className="static-section">
                    <h2>6. Cookies</h2>
                    <p>
                        Le site Fumotion utilise des cookies pour améliorer l'expérience utilisateur. Pour plus 
                        d'informations sur l'utilisation des cookies et la gestion de vos préférences, veuillez 
                        consulter notre <a href="/cookies">Politique des Cookies</a>.
                    </p>
                </div>

                <div className="static-section">
                    <h2>7. Liens hypertextes</h2>
                    <p>
                        Le site Fumotion peut contenir des liens hypertextes vers d'autres sites. Fumotion n'exerce 
                        aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou aux 
                        services qu'ils proposent.
                    </p>
                </div>

                <div className="static-section">
                    <h2>8. Limitation de responsabilité</h2>
                    <p>
                        Fumotion s'efforce de maintenir accessible le site 24h/24 et 7j/7, mais n'est tenu à 
                        aucune obligation de résultat. L'accès au site peut être interrompu notamment pour des 
                        raisons de maintenance, de mise à jour ou pour toute autre raison technique.
                    </p>
                    <p>
                        Fumotion ne saurait être tenu responsable de tout dommage direct ou indirect résultant 
                        de l'utilisation du site ou de l'impossibilité d'y accéder.
                    </p>
                </div>

                <div className="static-section">
                    <h2>9. Droit applicable et juridiction compétente</h2>
                    <p>
                        Les présentes mentions légales sont régies par le droit français. En cas de litige, 
                        et après tentative de recherche d'une solution amiable, les tribunaux français seront 
                        seuls compétents.
                    </p>
                </div>

                <div className="static-section">
                    <h2>10. Contact</h2>
                    <p>
                        Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :
                    </p>
                    <ul>
                        <li>Par email : <a href="mailto:legal@fumotion.com">legal@fumotion.com</a></li>
                        <li>Par courrier : Fumotion SAS, 123 Avenue de l'Université, 75005 Paris, France</li>
                        <li>Via notre <a href="/contact">formulaire de contact</a></li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>11. Crédits</h2>
                    <p>
                        <strong>Conception et développement :</strong> Équipe Fumotion<br />
                        <strong>Icônes :</strong> Diverses sources libres de droits<br />
                        <strong>Images :</strong> Fumotion et banques d'images libres de droits
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
