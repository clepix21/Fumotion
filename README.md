<p align="center">
  <img src="app/frontend/src/assets/images/logo.png" alt="Fumotion Logo" width="200" />
</p>

<h1 align="center">Fumotion</h1>

<p align="center">
  <b>Plateforme de covoiturage universitaire pour les étudiants</b>
</p>

<p align="center">
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#technologies">Technologies</a> •
  <a href="#installation">Installation</a> •
  <a href="#utilisation">Utilisation</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-green" alt="License" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16.0.0-brightgreen" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB" alt="React" />
</p>

---

## Description

**Fumotion** est une application web de covoiturage conçue spécifiquement pour les étudiants de l'IUT d'Amiens. Elle permet de proposer, rechercher et réserver des trajets domicile-campus de manière simple, sécurisée et économique.

L'objectif est de promouvoir la mobilité durable, de réduire les coûts de transport des étudiants et de créer une communauté solidaire autour du covoiturage universitaire.

---

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

---

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

---

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 16.0.0
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/) (pour le déploiement)
- [MySQL](https://www.mysql.com/) 8.0 (pour le développement local)

### Installation locale

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-username/fumotion.git
   cd fumotion
   ```

2. **Installer les dépendances**
   ```bash
   # Installation de toutes les dépendances
   npm run install-all
   ```

3. **Configurer les variables d'environnement**
   
   Créer un fichier `.env` dans `app/backend/` :
   ```env
   PORT=5000
   JWT_SECRET=votre_secret_jwt_securise
   DB_HOST=localhost
   DB_USER=fumotion
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=fumotion
   SMTP_EMAIL=votre_email@gmail.com
   SMTP_PASSWORD=votre_app_password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Initialiser la base de données**
   ```bash
   # Exécuter le script SQL
   mysql -u root -p < app/backend/database/schema.sql
   ```

5. **Lancer l'application**
   ```bash
   # Lancement du backend et du frontend simultanément
   npm run dev
   ```

   L'application sera accessible sur :
   - Frontend : `http://localhost:3000`
   - Backend API : `http://localhost:5000`

### Déploiement avec Docker

```bash
# Construire et lancer tous les services
docker-compose up --build -d

# Vérifier le statut des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f
```

---

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

## Architecture

### Structure du projet

```
Fumotion/
├── app/
│   ├── backend/                 # API Express.js
│   │   ├── config/              # Configuration (DB, etc.)
│   │   ├── controllers/         # Logique métier
│   │   ├── database/            # Scripts SQL
│   │   ├── middleware/          # Auth, validation, CSRF
│   │   ├── routes/              # Endpoints API
│   │   ├── uploads/             # Fichiers uploadés
│   │   └── server.js            # Point d'entrée
│   │
│   └── frontend/                # Application React
│       ├── src/
│       │   ├── assets/          # Images, icônes
│       │   ├── components/      # Composants réutilisables
│       │   ├── context/         # Contextes React
│       │   ├── pages/           # Pages de l'application
│       │   ├── services/        # Appels API
│       │   ├── styles/          # Feuilles de style CSS
│       │   └── utils/           # Fonctions utilitaires
│       └── package.json
│
├── docs/                        # Documentation
│   ├── cahier_des_charges.md
│   ├── documentation_technique.md
│   └── guide_utilisateur.md
│
├── .github/                     # GitHub Actions CI/CD
├── docker-compose.yml           # Configuration Docker production
├── docker-compose.local.yml     # Configuration Docker développement
├── traefik.yml                  # Configuration Traefik
├── LICENCE                      # Licence CC BY-NC-ND 4.0
└── README.md
```

### Schéma de la base de données

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │    vehicles     │
├─────────────────┤       ├─────────────────┤
│ id              │◄──────│ user_id         │
│ email           │       │ brand           │
│ password        │       │ model           │
│ first_name      │       │ color           │
│ last_name       │       │ seats           │
│ phone           │       └─────────────────┘
│ is_verified     │
│ is_admin        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│     trips       │       │    bookings     │
├─────────────────┤       ├─────────────────┤
│ id              │◄──────│ trip_id         │
│ driver_id       │       │ passenger_id    │
│ departure_loc   │       │ seats_booked    │
│ arrival_loc     │       │ status          │
│ departure_time  │       │ payment_status  │
│ available_seats │       └─────────────────┘
│ price_per_seat  │
└─────────────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│    reviews      │       │    messages     │
├─────────────────┤       ├─────────────────┤
│ booking_id      │       │ sender_id       │
│ reviewer_id     │       │ receiver_id     │
│ reviewed_id     │       │ trip_id         │
│ rating (1-5)    │       │ message         │
│ comment         │       │ is_read         │
└─────────────────┘       └─────────────────┘
```

---

## Bonnes pratiques & Conventions

### Code
- **ESLint** : Configuration `react-app` pour le linting
- **Nommage** : camelCase pour les variables/fonctions, PascalCase pour les composants
- **CSS** : Variables CSS pour les couleurs et thèmes (mode clair/sombre)
- **API** : Architecture REST avec préfixe `/api`

### Git
- **Branches** : `main` (production), `develop` (développement)
- **Commits** : Messages descriptifs en français
- **CI/CD** : GitHub Actions pour les tests automatisés

### Sécurité
- Mots de passe hashés avec bcrypt
- Authentification JWT avec cookies HttpOnly
- Protection CSRF sur les requêtes mutantes
- Rate limiting pour prévenir les abus
- Validation des entrées avec express-validator

---

## Roadmap

### Version 0.1.0 (Actuelle)
- [x] Authentification utilisateur (inscription, connexion, reset password)
- [x] Création et recherche de trajets
- [x] Système de réservation
- [x] Messagerie entre utilisateurs
- [x] Système d'évaluations
- [x] Panel d'administration
- [x] Mode sombre/clair
- [x] Déploiement Docker + SSL

### Version 0.2.0 (Prévue)
- [ ] Notifications push en temps réel
- [ ] Système de paiement intégré
- [ ] Trajets récurrents
- [ ] Amélioration de la géolocalisation (autocomplétion)
- [ ] Application mobile (React Native)

### Futures améliorations
- [ ] Intégration avec calendrier universitaire
- [ ] Gamification (badges, statistiques)
- [ ] Covoiturage pour événements
- [ ] Multi-universités

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

## Remerciements

- **IUT d'Amiens** — Pour le cadre pédagogique de ce projet
- **Équipe enseignante** — Pour l'accompagnement et les conseils
- **OpenStreetMap & Leaflet** — Pour les outils de cartographie
- **La communauté Open Source** — Pour les outils et frameworks utilisés

---

<p align="center">
  Développé par <b>Clément LEMAIRE</b> — IUT Amiens 2026
</p>

<p align="center">
  <a href="https://fumotion.tech">Site Web</a> •
  <a href="mailto:fumotion.help@gmail.com">Contact</a>
</p>
