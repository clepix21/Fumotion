# Fumotion

![fumotion](https://media1.tenor.com/m/aGTGyIrG8ZcAAAAd/motion.gif)

**Fumotion** est une application web moderne de gestion de voyages permettant aux utilisateurs de réserver, planifier et gérer leurs déplacements avec une interface intuitive.

## Architecture

L'application suit une architecture **full-stack** moderne :

- **Frontend** : React.js avec Create React App
- **Backend** : Node.js avec Express.js
- **Base de données** : Base de données relationnelle
- **API** : REST API avec authentification JWT


```
Fumotion/
├── app/
│   ├── frontend/          # Application React
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── backend/           # API Express
│       ├── routes/
│       ├── config/
│       ├── uploads/
│       └── server.js
├── scripts/              # Scripts de déploiement
└── package.json         # Configuration racine
```

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 16 ou supérieure)
- **npm** (généralement inclus avec Node.js)
- **Git** pour cloner le projet

### Vérification des prérequis

```bash
node --version    # doit afficher v16+ 
npm --version     # doit afficher 8+
git --version     # doit afficher 2+
```

## ⚡ Installation rapide

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/Fumotion.git
cd Fumotion
```

### 2. Installation des dépendances

**Installation globale :**
```bash
npm install
```

**Installation séparée (si nécessaire) :**
```bash
# Backend
cd app/backend
npm install

# Frontend  
cd ../frontend
npm install

# Retour à la racine
cd ../..
```

### 3. Configuration de l'environnement

Créez un fichier `.env` dans `app/backend/` :

```bash
cp app/backend/.env.example app/backend/.env
```

Configurez les variables d'environnement :
```env
# app/backend/.env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
```

### 4. Démarrage en mode développement

```bash
npm run dev
```

Cette commande lance simultanément :
- **Backend** sur `http://localhost:5000`
- **Frontend** sur `http://localhost:3000`

## 🔧 Scripts disponibles

### Développement
```bash
npm run dev        # Lance frontend + backend
npm run frontend   # Frontend uniquement
npm run backend    # Backend uniquement
```

### Production
```bash
npm run build      # Build du frontend
npm start          # Démarre en mode production
```

### Utilitaires
```bash
npm run test       # Tests unitaires
npm audit          # Vérification sécurité
npm run clean      # Nettoyage des dépendances
```

## Fonctionnement de l'application

### Frontend (React)

**Structure principale :**
```
src/
├── components/    # Composants réutilisables
├── pages/        # Pages de l'application
├── hooks/        # Hooks personnalisés
├── services/     # Appels API
├── utils/        # Fonctions utilitaires
└── styles/       # Styles CSS/SCSS
```

**Fonctionnalités clés :**
- 🔐 **Authentification** : Inscription/Connexion des utilisateurs
- 🗺️ **Gestion des voyages** : Création, modification, suppression de trips
- 📅 **Réservations** : Système de booking intégré
- 📱 **Responsive** : Interface adaptative mobile/desktop
- 🔄 **État global** : Gestion centralisée avec Context API

### Backend (Express.js)

**Structure API :**
```
routes/
├── auth.js       # Authentification (register, login, logout)
├── trips.js      # CRUD des voyages
└── bookings.js   # Gestion des réservations
```

**Endpoints principaux :**
```
POST   /api/auth/register     # Inscription
POST   /api/auth/login        # Connexion
GET    /api/trips             # Liste des voyages
POST   /api/trips             # Créer un voyage
GET    /api/trips/:id         # Détails d'un voyage
PUT    /api/trips/:id         # Modifier un voyage
DELETE /api/trips/:id         # Supprimer un voyage
POST   /api/bookings          # Créer une réservation
GET    /api/bookings          # Mes réservations
```

**Middlewares :**
- 🛡️ **CORS** : Gestion des requêtes cross-origin
- 🔒 **Authentification JWT** : Protection des routes
- 📝 **Logging** : Traçabilité des requêtes
- 🚫 **Gestion d'erreurs** : Réponses d'erreur standardisées

### Base de données

**Tables principales :**
- `users` : Informations des utilisateurs
- `trips` : Données des voyages
- `bookings` : Réservations effectuées
- `categories` : Catégories de voyages

## 🔄 Flux de données

```
Frontend (React) → API Calls → Backend (Express) → Database
     ↑                                               ↓
     ←←←←←←← JSON Response ←←←←←←← Query Results ←←←←←←
```

1. **L'utilisateur** interagit avec l'interface React
2. **Le frontend** envoie des requêtes HTTP à l'API
3. **Le backend** traite les requêtes et interroge la base
4. **Les données** sont renvoyées au frontend en JSON
5. **React** met à jour l'interface utilisateur

## Résolution des problèmes

### Erreurs communes

**Port déjà utilisé :**
```bash
# Tuer le processus sur le port 3000
sudo lsof -t -i tcp:3000 | xargs kill -9
```

**Modules manquants :**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problèmes CORS :**
Vérifiez que le frontend (`http://localhost:3000`) est autorisé dans la configuration CORS du backend.

### Logs et debugging

**Backend logs :**
```bash
cd app/backend
npm start
# Les logs s'affichent dans le terminal
```

**Frontend debugging :**
- Ouvrez les **DevTools** dans le navigateur (F12)
- Consultez l'onglet **Console** pour les erreurs
- Vérifiez l'onglet **Network** pour les requêtes API

## 🚀 Déploiement

### Développement local
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Scripts Windows (PowerShell)
```powershell
.\scripts\dev.ps1     # Développement
.\scripts\build.ps1   # Build production
```

## 🤝 Contribution


1. Créez une branche feature (`git checkout -b feature/amazing-feature`)
2. Committez vos changements (`git commit -m 'Add amazing feature'`)
3. Push sur la branche (`git push origin feature/amazing-feature`)
4. Ouvrez une Pull Request

## 🆘 Support

En cas de problème :
- ah ouais les gars 