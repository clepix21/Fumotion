import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import logo from '../assets/images/logo.png';
import '../styles/StaticPages.css';

export default function TermsPage() {
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
                <h1>Conditions Générales d'Utilisation</h1>
                <p className="last-updated">Dernière mise à jour : 23 décembre 2025</p>

                <div className="static-section">
                    <h2>1. Objet</h2>
                    <p>
                        Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
                        et conditions d'utilisation de la plateforme Fumotion, accessible à l'adresse fumotion.com, 
                        ainsi que les droits et obligations des utilisateurs.
                    </p>
                    <p>
                        Fumotion est une plateforme de mise en relation entre conducteurs et passagers souhaitant 
                        partager un trajet en covoiturage, principalement destinée aux étudiants universitaires.
                    </p>
                </div>

                <div className="static-section">
                    <h2>2. Acceptation des CGU</h2>
                    <p>
                        L'utilisation de la plateforme Fumotion implique l'acceptation pleine et entière des présentes 
                        CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services.
                    </p>
                    <p>
                        Fumotion se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
                        seront informés des modifications par email ou notification sur la plateforme.
                    </p>
                </div>

                <div className="static-section">
                    <h2>3. Inscription et compte utilisateur</h2>
                    <h3>3.1 Conditions d'inscription</h3>
                    <p>Pour créer un compte sur Fumotion, l'utilisateur doit :</p>
                    <ul>
                        <li>Être âgé d'au moins 16 ans</li>
                        <li>Disposer d'une adresse email valide (de préférence universitaire)</li>
                        <li>Fournir des informations exactes et à jour</li>
                        <li>Accepter les présentes CGU et la Politique de confidentialité</li>
                    </ul>

                    <h3>3.2 Sécurité du compte</h3>
                    <p>
                        L'utilisateur est responsable de la confidentialité de son mot de passe et de toutes les 
                        activités effectuées sous son compte. Il s'engage à informer immédiatement Fumotion de 
                        toute utilisation non autorisée de son compte.
                    </p>
                </div>

                <div className="static-section">
                    <h2>4. Services proposés</h2>
                    <h3>4.1 Pour les conducteurs</h3>
                    <p>
                        Les conducteurs peuvent publier des trajets en indiquant le lieu de départ, la destination, 
                        la date, l'heure, le nombre de places disponibles et le prix par passager.
                    </p>

                    <h3>4.2 Pour les passagers</h3>
                    <p>
                        Les passagers peuvent rechercher des trajets correspondant à leurs besoins et effectuer 
                        des réservations auprès des conducteurs.
                    </p>

                    <h3>4.3 Rôle de Fumotion</h3>
                    <p>
                        Fumotion agit uniquement en qualité d'intermédiaire technique permettant la mise en relation 
                        entre conducteurs et passagers. Fumotion n'est pas partie au contrat de transport qui lie 
                        le conducteur et le passager.
                    </p>
                </div>

                <div className="static-section">
                    <h2>5. Obligations des utilisateurs</h2>
                    <h3>5.1 Obligations générales</h3>
                    <ul>
                        <li>Fournir des informations exactes et véridiques</li>
                        <li>Respecter les autres utilisateurs et adopter un comportement courtois</li>
                        <li>Ne pas utiliser la plateforme à des fins illégales ou frauduleuses</li>
                        <li>Respecter les lois et réglementations en vigueur</li>
                    </ul>

                    <h3>5.2 Obligations des conducteurs</h3>
                    <ul>
                        <li>Posséder un permis de conduire valide</li>
                        <li>Disposer d'une assurance automobile en cours de validité couvrant le covoiturage</li>
                        <li>Maintenir le véhicule en bon état de fonctionnement</li>
                        <li>Respecter le Code de la route</li>
                        <li>Honorer les réservations acceptées</li>
                    </ul>

                    <h3>5.3 Obligations des passagers</h3>
                    <ul>
                        <li>Se présenter à l'heure et au lieu de rendez-vous convenus</li>
                        <li>Respecter le véhicule du conducteur</li>
                        <li>Payer le prix convenu pour le trajet</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>6. Tarification et paiement</h2>
                    <p>
                        Le prix des trajets est fixé librement par les conducteurs. Il doit correspondre à un 
                        partage des frais (carburant, péage) et ne peut en aucun cas constituer une source de profit.
                    </p>
                    <p>
                        Fumotion peut prélever des frais de service sur chaque transaction. Ces frais sont clairement 
                        indiqués avant la confirmation de la réservation.
                    </p>
                </div>

                <div className="static-section">
                    <h2>7. Annulation</h2>
                    <p>
                        Les conditions d'annulation sont les suivantes :
                    </p>
                    <ul>
                        <li>Annulation par le conducteur : le passager est intégralement remboursé</li>
                        <li>Annulation par le passager plus de 24h avant le départ : remboursement intégral</li>
                        <li>Annulation par le passager moins de 24h avant le départ : remboursement partiel ou nul selon les conditions du trajet</li>
                    </ul>
                </div>

                <div className="static-section">
                    <h2>8. Responsabilité</h2>
                    <p>
                        Fumotion ne peut être tenu responsable des dommages directs ou indirects résultant de 
                        l'utilisation de la plateforme, de l'inexécution ou de la mauvaise exécution du trajet 
                        par le conducteur, ou du comportement des utilisateurs.
                    </p>
                    <p>
                        Chaque utilisateur est responsable de ses actes et de leur conformité avec les lois applicables.
                    </p>
                </div>

                <div className="static-section">
                    <h2>9. Propriété intellectuelle</h2>
                    <p>
                        L'ensemble des éléments constituant la plateforme Fumotion (textes, graphismes, logos, 
                        images, logiciels) sont la propriété exclusive de Fumotion et sont protégés par les lois 
                        relatives à la propriété intellectuelle.
                    </p>
                </div>

                <div className="static-section">
                    <h2>10. Résiliation</h2>
                    <p>
                        L'utilisateur peut à tout moment demander la suppression de son compte en contactant 
                        notre service support.
                    </p>
                    <p>
                        Fumotion se réserve le droit de suspendre ou supprimer tout compte en cas de violation 
                        des présentes CGU, sans préavis ni indemnité.
                    </p>
                </div>

                <div className="static-section">
                    <h2>11. Droit applicable</h2>
                    <p>
                        Les présentes CGU sont régies par le droit français. Tout litige relatif à leur 
                        interprétation ou exécution sera soumis aux tribunaux français compétents.
                    </p>
                </div>
            </main>

            <Footer/>
        </div>
    );
}
