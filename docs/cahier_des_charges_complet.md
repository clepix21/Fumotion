# Cahier des Charges Complet - FUMOTION

## Plateforme de Covoiturage Universitaire

---

**Version :** 2.0  
**Date :** Janvier 2026  
**Établissement :** IUT Amiens  
**URL Production :** https://fumotion.tech

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte et problématique](#2-contexte-et-problématique)
3. [Objectifs](#3-objectifs)
4. [Périmètre fonctionnel](#4-périmètre-fonctionnel)
5. [Spécifications fonctionnelles](#5-spécifications-fonctionnelles)
6. [Spécifications techniques](#6-spécifications-techniques)
7. [Architecture technique](#7-architecture-technique)
8. [Modèle de données](#8-modèle-de-données)
9. [Interfaces utilisateur](#9-interfaces-utilisateur)
10. [Sécurité](#10-sécurité)
11. [Contraintes et exigences](#11-contraintes-et-exigences)
12. [Planning et livrables](#12-planning-et-livrables)

---

## 1. Présentation du projet

### 1.1 Nom du projet
**FUMOTION** - Fusion de "Fumo" et "Motion" (mouvement)

### 1.2 Description générale
Fumotion est une application web de covoiturage conçue pour les étudiants de l'IUT d'Amiens. Elle permet de proposer, rechercher et réserver des trajets domicile-campus de manière simple, sécurisée et économique.

### 1.3 Public cible
- **Utilisateurs principaux :** Étudiants de l'IUT d'Amiens
- **Utilisateurs secondaires :** Personnel enseignant et administratif
- **Administrateurs :** Gestionnaires de la plateforme

### 1.4 Portée
Application web responsive accessible via navigateur, optimisée pour desktop et mobile.

---

## 2. Contexte et problématique

### 2.1 Contexte
Les étudiants font face à plusieurs défis :
- Coût élevé des transports (essence, stationnement)
- Manque de transports en commun adaptés aux horaires universitaires
- Impact environnemental des déplacements individuels
- Isolement des étudiants habitant en périphérie

### 2.2 Problématique
**Comment faciliter et optimiser les déplacements des étudiants vers leur campus tout en réduisant les coûts et l'impact environnemental ?**

### 2.3 Solutions existantes et limites
| Solution | Inconvénients |
|----------|---------------|
| BlaBlaCar | Non adapté aux trajets courts et quotidiens |
| Transports en commun | Horaires contraignants, zones mal desservies |
| Groupes Facebook/WhatsApp | Pas de système de réservation, difficile à suivre |
| Covoiturage informel | Aucune traçabilité, problèmes de confiance |

### 2.4 Proposition de valeur
- Inscription centralisée pour étudiants
- Trajets courts et récurrents
- Système d'évaluation pour la confiance
- Interface moderne et intuitive

---

## 3. Objectifs

### 3.1 Objectifs principaux
| # | Objectif | Indicateur de succès |
|---|----------|---------------------|
| 1 | Faciliter la mise en relation conducteurs/passagers | Nombre de trajets créés |
| 2 | Réduire les coûts de transport | Économies moyennes par utilisateur |
| 3 | Promouvoir la mobilité durable | Réduction CO2 estimée |
| 4 | Créer une communauté étudiante | Taux d'engagement, avis positifs |

### 3.2 Critères de réussite
- **100+** utilisateurs actifs dans les 3 premiers mois
- **Note moyenne** ≥ 4/5 sur les évaluations
- **Taux de complétion** des trajets ≥ 85%

---

## 4. Périmètre fonctionnel

### 4.1 Fonctionnalités implémentées (v1.0)

#### Module Authentification ✅
- Inscription utilisateur avec validation
- Connexion / Déconnexion sécurisée (JWT)
- Réinitialisation mot de passe par email
- Gestion du profil utilisateur complet

#### Module Trajets ✅
- Création de trajet avec géolocalisation
- Recherche de trajets multi-critères
- Affichage sur carte interactive Leaflet
- Modification / Annulation de trajets
- Marquage "trajet effectué"

#### Module Réservations ✅
- Réservation de places en un clic
- Gestion des statuts (pending/confirmed/cancelled/completed)
- Historique des réservations

#### Module Communication ✅
- Messagerie temps réel entre utilisateurs
- Notifications in-app (toast)
- Liste des conversations triée

#### Module Évaluations ✅
- Notation 1-5 étoiles après trajet
- Commentaires textuels
- Affichage moyenne sur profil
- Évaluations évaluations croisées (conducteur ↔ passager)

#### Module Administration ✅
- Dashboard avec statistiques globales
- Gestion utilisateurs (activation/désactivation/suppression)
- Gestion trajets (modification statut/suppression)
- Gestion réservations
- Export CSV/JSON

### 4.2 Fonctionnalités hors périmètre (v2 potentielle)
- Paiement en ligne intégré
- Application mobile native
- Notifications push
- Trajets récurrents automatiques
- Intégration calendrier universitaire

---

## 5. Spécifications fonctionnelles

### 5.1 Gestion des utilisateurs

#### SF-01 : Inscription
| Champ | Type | Obligatoire | Validation |
|-------|------|-------------|------------|
| Email | Email | Oui | Format valide, unicité |
| Mot de passe | Texte | Oui | Min 6 caractères |
| Prénom | Texte | Oui | Max 100 caractères |
| Nom | Texte | Oui | Max 100 caractères |
| Téléphone | Texte | Non | Format téléphone |
| N° étudiant | Texte | Non | Max 50 caractères |

#### SF-02 : Connexion
- Authentification email + mot de passe
- Token JWT valide 7 jours
- Protection CSRF obligatoire

#### SF-03 : Profil utilisateur
- Photo de profil (upload max 2Mo)
- Bannière de profil (upload max 5Mo)
- Biographie (texte libre)
- Statistiques affichées (trajets, notes)

#### SF-04 : Réinitialisation mot de passe
- Envoi lien par email (Nodemailer/Gmail SMTP)
- Token valide 1 heure
- Formulaire nouveau mot de passe

### 5.2 Gestion des trajets

#### SF-05 : Création de trajet
| Champ | Type | Obligatoire | Validation |
|-------|------|-------------|------------|
| Lieu de départ | Adresse + GPS | Oui | Géocodage OSM/Nominatim |
| Lieu d'arrivée | Adresse + GPS | Oui | Géocodage OSM/Nominatim |
| Date/Heure départ | DateTime | Oui | Date future |
| Places disponibles | Entier | Oui | 1-8 |
| Prix par place | Décimal | Oui | 0-100€ |
| Description | Texte | Non | Max 500 caractères |

#### SF-06 : Recherche de trajets
- Critères : départ, arrivée, date
- Filtre par prix, heure, places
- Tri par pertinence, prix, date
- Affichage carte + liste

#### SF-07 : Cycle de vie trajet
```
[active] → [completed] (marqué par conducteur)
    ↓
[cancelled] (annulé)
```

### 5.3 Gestion des réservations

#### SF-08 : Création de réservation
- Sélection nombre de places
- Calcul prix automatique
- Vérification disponibilité
- Statut initial : "pending"

#### SF-09 : Cycle de vie réservation
```
[pending] → [confirmed] → [completed]
    ↓           ↓
[cancelled]  [cancelled]
```

### 5.4 Messagerie

#### SF-10 : Conversations
- Messages temps réel (polling 10s)
- Liste triée par dernière activité
- Indicateur non-lus
- Historique complet

### 5.5 Évaluations

#### SF-11 : Système notation
- Note 1-5 étoiles obligatoire
- Commentaire optionnel (max 500 car.)
- Types : "driver" ou "passenger"
- Affichage moyenne profil
- Déclenchement après "completed"

---

## 6. Spécifications techniques

### 6.1 Stack technologique

#### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.x | Framework UI |
| React Router | 6.x | Navigation SPA |
| Leaflet | 1.9.x | Cartes interactives |
| CSS3 Variables | - | Thème clair/sombre |

#### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | ≥16.0 | Runtime JS |
| Express.js | 4.x | API REST |
| MySQL | 8.0 | Base de données |
| JWT | - | Authentification |
| bcryptjs | - | Hashage MDP |
| Nodemailer | - | Envoi emails |
| Multer | - | Upload fichiers |

#### Infrastructure
| Technologie | Usage |
|-------------|-------|
| Docker | Conteneurisation |
| Docker Compose | Orchestration |
| Traefik | Reverse proxy + SSL |
| Nginx | Serveur frontend |

### 6.2 API REST - Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/profile` | Profil utilisateur |
| PUT | `/api/auth/profile` | Mise à jour profil |
| POST | `/api/auth/forgot-password` | Demande reset |
| POST | `/api/auth/reset-password` | Reset MDP |
| GET | `/api/trips` | Liste trajets |
| POST | `/api/trips` | Créer trajet |
| GET | `/api/trips/:id` | Détail trajet |
| PUT | `/api/trips/:id` | Modifier trajet |
| DELETE | `/api/trips/:id` | Annuler trajet |
| POST | `/api/trips/:id/complete` | Marquer terminé |
| GET | `/api/bookings` | Mes réservations |
| POST | `/api/bookings` | Créer réservation |
| GET | `/api/messages` | Conversations |
| POST | `/api/messages/:userId` | Envoyer message |
| GET | `/api/reviews/pending` | Avis à faire |
| POST | `/api/reviews` | Créer avis |
| GET | `/api/admin/statistics` | Stats admin |
| GET | `/api/admin/users` | Liste users |
| GET | `/api/admin/trips` | Liste trajets |

---

## 7. Architecture technique

### 7.1 Architecture globale
```
┌──────────────────────────────────────────────────────┐
│                     INTERNET                          │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│              TRAEFIK (Reverse Proxy)                 │
│              SSL/TLS Let's Encrypt                   │
│              Port 80/443                             │
└──────────────────────────────────────────────────────┘
                    │           │
                    ▼           ▼
┌────────────────────────┐ ┌────────────────────────────┐
│   FRONTEND (Nginx)     │ │    BACKEND (Node.js)       │
│   React SPA Build      │ │    Express.js API          │
│   Static files         │ │    Port 5000               │
└────────────────────────┘ └────────────────────────────┘
                                    │
                                    ▼
                           ┌────────────────────┐
                           │   MySQL Database   │
                           │   Port 3306        │
                           └────────────────────┘
```

### 7.2 Structure projet
```
fumotion/
├── app/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── assets/        # Images, icônes
│   │   │   ├── components/    # Composants React
│   │   │   ├── context/       # AuthContext, ThemeContext, NotificationContext
│   │   │   ├── pages/         # Pages (Home, Dashboard, Admin, Chat...)
│   │   │   ├── services/      # API services
│   │   │   └── styles/        # CSS
│   │   └── Dockerfile
│   │
│   └── backend/
│       ├── controllers/       # Logique métier
│       ├── routes/            # Routes Express
│       ├── middleware/        # Auth, CSRF, upload
│       ├── database/          # Schéma SQL
│       ├── uploads/           # Fichiers uploadés
│       └── Dockerfile
│
├── docker-compose.yml
├── traefik.yml
└── docs/
```

---

## 8. Modèle de données

### 8.1 Tables principales

#### USERS (18 colonnes)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK | Identifiant |
| email | VARCHAR(255) UNIQUE | Email |
| password | VARCHAR(255) | Hash bcrypt |
| first_name, last_name | VARCHAR(100) | Nom, prénom |
| phone | VARCHAR(20) | Téléphone |
| student_id | VARCHAR(50) | N° étudiant |
| university | VARCHAR(255) | Établissement |
| bio | TEXT | Biographie |
| profile_picture | VARCHAR(255) | Photo |
| banner_picture | VARCHAR(255) | Bannière |
| is_verified, is_active, is_admin | BOOLEAN | Statuts |
| reset_token | TEXT | Token reset |
| reset_token_expires | DATETIME | Expiration |
| last_active_at | DATETIME | Dernière activité |
| created_at, updated_at | TIMESTAMP | Dates |

#### TRIPS (15 colonnes)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK | Identifiant |
| driver_id | INT FK→users | Conducteur |
| vehicle_id | INT FK→vehicles | Véhicule (optionnel) |
| departure_location | VARCHAR(255) | Adresse départ |
| departure_latitude/longitude | DECIMAL | Coordonnées |
| arrival_location | VARCHAR(255) | Adresse arrivée |
| arrival_latitude/longitude | DECIMAL | Coordonnées |
| departure_datetime | DATETIME | Date/heure |
| available_seats | INT | Places |
| price_per_seat | DECIMAL | Prix |
| description | TEXT | Description |
| status | ENUM | active/completed/cancelled |
| created_at, updated_at | TIMESTAMP | Dates |

#### BOOKINGS (8 colonnes)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK | Identifiant |
| trip_id | INT FK→trips | Trajet |
| passenger_id | INT FK→users | Passager |
| seats_booked | INT | Nb places |
| total_price | DECIMAL | Prix total |
| status | ENUM | pending/confirmed/cancelled/completed |
| payment_status | ENUM | pending/paid/refunded |
| booking_date | TIMESTAMP | Date résa |

#### REVIEWS (7 colonnes)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK | Identifiant |
| booking_id | INT FK→bookings | Réservation |
| reviewer_id | INT FK→users | Auteur |
| reviewed_id | INT FK→users | Évalué |
| rating | INT (1-5) | Note |
| comment | TEXT | Commentaire |
| type | ENUM | driver/passenger |

#### MESSAGES (6 colonnes)
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT PK | Identifiant |
| sender_id | INT FK→users | Expéditeur |
| receiver_id | INT FK→users | Destinataire |
| trip_id | INT FK→trips | Trajet (optionnel) |
| message | TEXT | Contenu |
| is_read | BOOLEAN | Lu |
| created_at | TIMESTAMP | Date |

### 8.2 Vues SQL
- `v_trip_details` : Trajets avec infos conducteur et places restantes
- `v_booking_details` : Réservations complètes
- `v_user_stats` : Statistiques par utilisateur
- `v_platform_stats` : Stats globales
- `v_active_trips` : Trajets disponibles

---

## 9. Interfaces utilisateur

### 9.1 Charte graphique

#### Couleurs
| Couleur | Code | Usage |
|---------|------|-------|
| Bleu primaire | #4facfe | Actions, liens |
| Bleu secondaire | #00f2fe | Dégradés |
| Vert succès | #10b981 | Validations |
| Orange attention | #f59e0b | Alertes |
| Rouge erreur | #ef4444 | Erreurs |

#### Typographie
- Police : Inter (Google Fonts)
- Titres : 700 (bold)
- Texte : 400 (regular)

### 9.2 Liste des pages
| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Hero, recherche, trajets récents |
| Connexion | `/login` | Formulaire login |
| Inscription | `/register` | Formulaire inscription |
| Mot de passe oublié | `/forgot-password` | Email reset |
| Recherche | `/search` | Résultats + carte |
| Créer trajet | `/create-trip` | Formulaire création |
| Dashboard | `/dashboard` | Aperçu, mes trajets, réservations |
| Profil public | `/dashboard/:userId` | Profil d'un utilisateur |
| Messagerie | `/chat` | Conversations |
| Administration | `/admin` | Panel admin |

### 9.3 Responsive
- Desktop : ≥ 1024px
- Tablette : 768-1023px
- Mobile : < 768px

### 9.4 Thèmes
- Mode clair (défaut)
- Mode sombre (toggle)

---

## 10. Sécurité

### 10.1 Authentification
- Hashage bcryptjs (10 rounds)
- Tokens JWT signés (secret 256 bits)
- Expiration : 7 jours
- Stockage sécurisé localStorage

### 10.2 Protection des données
- CSRF tokens synchronisés
- Headers sécurité (via config)
- CORS domaine unique
- HTTPS obligatoire (Let's Encrypt)

### 10.3 Validation
- Validation client (React)
- Validation serveur (express-validator)
- Requêtes SQL paramétrées
- Sanitization HTML

### 10.4 Uploads
- Types autorisés : image/*
- Taille max : 2Mo (avatar), 5Mo (bannière)
- Nommage UUID sécurisé
- Stockage serveur `/uploads/`

---

## 11. Contraintes et exigences

### 11.1 Contraintes techniques
- Hébergement VPS Linux
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Pas de services payants externes

### 11.2 Contraintes réglementaires
- Conformité RGPD
- Mentions légales
- CGU et politique de confidentialité

### 11.3 Performances
| Métrique | Objectif |
|----------|----------|
| Temps chargement | < 3s |
| Temps réponse API | < 500ms |
| Disponibilité | 99% |

---

## 12. Planning et livrables

### 12.1 Livrables
| # | Livrable | État |
|---|----------|------|
| 1 | Cahier des charges | ✅ |
| 2 | Schéma base de données | ✅ |
| 3 | Application frontend | ✅ |
| 4 | API backend | ✅ |
| 5 | Documentation | ✅ |
| 6 | Déploiement production | ✅ |

---

**Document rédigé dans le cadre du projet de sae 3 - IUT Amiens 2026**
