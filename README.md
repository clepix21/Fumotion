<p align="center">
  <img src="app/frontend/src/assets/images/logo.png" alt="Fumotion Logo" width="200" />
</p>

<h1 align="center">Fumotion</h1>

<p align="center">
  <b>Plateforme de covoiturage universitaire pour les étudiants</b>
</p>



<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-green" alt="License" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16.0.0-brightgreen" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB" alt="React" />
</p>

---

## Description

**Fumotion** est une application web de covoiturage conçue pour les étudiants d'Amiens. Elle permet de proposer, rechercher et réserver des trajets domicile-campus de manière simple, sécurisée et économique.

L'objectif est de promouvoir la mobilité durable, de réduire les coûts de transport des étudiants et de créer une communauté solidaire autour du covoiturage universitaire.


## Fonctionnalités

### Gestion des utilisateurs
- Inscription et connexion sécurisées (JWT + hashage bcrypt)
- Profil personnalisable (photo, bannière, bio, véhicule)
- Réinitialisation de mot de passe par email
- Panel d'administration pour la gestion des utilisateurs

### Gestion des trajets
- Création de trajets avec géolocalisation (Leaflet/OpenStreetMap)
- Recherche de trajets par lieu de départ/arrivée et date
- Calcul automatique des places restantes
- Historique complet des trajets

### Réservations
- Réservation de places en un clic
- Suivi du statut des réservations (en attente, confirmée, terminée)
- Annulation possible avant le départ

### Communication
- Messagerie intégrée entre conducteurs et passagers
- Notifications en temps réel pour les nouveaux messages
- Système d'évaluations et d'avis après chaque trajet

### Interface
- Design responsive (desktop, tablette, mobile)
- Mode sombre / clair
- Cartes interactives avec Leaflet


## Technologies

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 19.x | Framework UI |
| React Router | 6.x | Navigation SPA |
| Leaflet | 1.9.x | Cartes interactives |
| CSS3 | - | Styles avec variables CSS |

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | ≥16.0 | Runtime JavaScript |
| Express.js | 4.x | Framework API REST |
| MySQL | 8.0 | Base de données relationnelle |
| JWT | - | Authentification sécurisée |
| bcryptjs | - | Hashage des mots de passe |
| Nodemailer | - | Envoi d'emails |

### Infrastructure
| Technologie | Description |
|-------------|-------------|
| Docker | Conteneurisation des services |
| Docker Compose | Orchestration multi-conteneurs |
| Traefik | Reverse proxy avec SSL automatique (Let's Encrypt) |
| Nginx | Serveur web pour le frontend |


## Utilisation

### Créer un compte
1. Accédez à la page d'inscription
2. Remplissez vos informations (email, mot de passe, nom, prénom)
3. Confirmez votre inscription

### Proposer un trajet (Conducteur)
1. Connectez-vous à votre compte
2. Accédez à "Créer un trajet"
3. Renseignez les informations :
   - Lieu de départ et d'arrivée
   - Date et heure de départ
   - Nombre de places disponibles
   - Prix par place
4. Validez votre trajet

### Réserver un trajet (Passager)
1. Utilisez la barre de recherche sur la page d'accueil
2. Filtrez par date et lieu
3. Sélectionnez un trajet disponible
4. Réservez votre place

### Communiquer
1. Accédez à la messagerie depuis votre tableau de bord
2. Échangez avec le conducteur ou les passagers
3. Recevez des notifications pour les nouveaux messages

---

## Captures d'écran

> *Les captures d'écran seront ajoutées dans un dossier `/docs/screenshots/`*

| Page | Description |
|------|-------------|
| `homepage.png` | Page d'accueil avec recherche |
| `search.png` | Résultats de recherche de trajets |
| `dashboard.png` | Tableau de bord utilisateur |
| `create-trip.png` | Formulaire de création de trajet |
| `chat.png` | Interface de messagerie |

---

## Licence

Ce projet est sous licence **Creative Commons Attribution – Pas d'Utilisation Commerciale – Pas de Modification 4.0 International (CC BY-NC-ND 4.0)**.

Vous êtes autorisé à :
- **Partager** — copier et redistribuer le matériel sous tous formats

Sous les conditions suivantes :
- **Attribution** — Vous devez créditer l'auteur
- **Pas d'Utilisation Commerciale** — Interdiction d'usage commercial
- **Pas de Modification** — Interdiction de modifier ou transformer l'œuvre

[Voir la licence complète](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.fr)

---

<p align="center">
  Développé par <b>Clément LEMAIRE</b> — IUT Amiens 2026
</p>

<p align="center">
  <a href="https://fumotion.tech">Site Web</a> •
  <a href="mailto:fumotion.help@gmail.com">Contact</a>
</p>
