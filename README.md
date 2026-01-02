# Fumotion

![fumotion](https://media1.tenor.com/m/aGTGyIrG8ZcAAAAd/motion.gif)

> **Plateforme de covoiturage pour les étudiants de l'IUT d'Amiens**

Fumotion est une application web full-stack permettant aux étudiants de l'IUT d'Amiens de proposer, rechercher et réserver des trajets de covoiturage. Elle facilite les déplacements quotidiens tout en réduisant l'empreinte carbone et les coûts de transport.

---

## Fonctionnalités

- Authentification sécurisée - Inscription, connexion, réinitialisation de mot de passe (JWT)
- Gestion des trajets - Créer, rechercher et réserver des covoiturages
- Messagerie intégrée - Discussion en temps réel entre conducteurs et passagers
- Système d'avis - Évaluation des conducteurs et passagers
- Cartes interactives - Visualisation des trajets avec Leaflet
- Profils utilisateurs - Avatars, tableau de bord personnel
- Panneau d'administration - Gestion des utilisateurs et modération

---

## Stack Technique

| Composant | Technologies |
|-----------|-------------|
| **Frontend** | React 19, React Router 6, Leaflet, CSS3 |
| **Backend** | Node.js, Express.js, JWT, Multer |
| **Base de données** | MySQL 8.0 |
| **Conteneurisation** | Docker, Docker Compose |
| **Serveur web** | Nginx (production) |

---

## Structure du Projet

```
Fumotion/
├── docker-compose.yml
├── package.json
├── app/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   ├── services/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── Dockerfile
│   └── backend/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── config/
│       ├── uploads/
│       └── Dockerfile
├── docs/
└── scripts/
```

---

## Démarrage Rapide

### Prérequis

- Docker et Docker Compose installés
- Git pour cloner le projet

### Installation avec Docker

```bash
git clone https://github.com/votre-username/Fumotion.git
cd Fumotion
docker-compose up -d --build
```

L'application sera accessible sur :
- Frontend : http://localhost
- API Backend : http://localhost:5000
- MySQL : localhost:3306

### Variables d'environnement

```env
FRONTEND_PORT=80
BACKEND_PORT=5000
DB_USER=fumotion
DB_PASSWORD=fumotion_password
DB_NAME=fumotion
MYSQL_ROOT_PASSWORD=root_password
JWT_SECRET=votre_secret_jwt_super_securise
```

---

## Développement Local

### Prérequis

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL 8.0

### Installation

```bash
npm run install-all
npm run dev
```

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance backend + frontend en parallèle |
| `npm run backend` | Lance uniquement le backend |
| `npm run frontend` | Lance uniquement le frontend |
| `npm run install-all` | Installe les dépendances partout |

---

## API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/forgot-password` | Mot de passe oublié |
| POST | `/api/auth/reset-password` | Réinitialisation |

### Trajets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/trips` | Rechercher des trajets |
| POST | `/api/trips` | Créer un trajet |
| GET | `/api/trips/:id` | Détails d'un trajet |
| PUT | `/api/trips/:id` | Modifier un trajet |
| DELETE | `/api/trips/:id` | Supprimer un trajet |

### Réservations
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/bookings` | Réserver un trajet |
| GET | `/api/bookings` | Mes réservations |
| PUT | `/api/bookings/:id` | Modifier une réservation |

### Messagerie
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/messages/conversations` | Liste des conversations |
| GET | `/api/messages/:userId` | Messages avec un utilisateur |
| POST | `/api/messages` | Envoyer un message |

### Avis
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/reviews` | Laisser un avis |
| GET | `/api/reviews/user/:userId` | Avis d'un utilisateur |

---

## Commandes Docker

```bash
docker-compose up -d --build
docker-compose logs -f
docker-compose logs -f backend
docker-compose down
docker-compose down -v
docker-compose build --no-cache frontend
```

---

## Tests

```bash
cd app/frontend
npm test
npm run test:watch
```

---

## Documentation

La documentation complète du projet se trouve dans le dossier `docs/` :

- [Cahier des charges](docs/cahier_des_charges.md)
- [Documentation technique](docs/documentation_technique.md)
- [Guide utilisateur](docs/guide_utilisateur.md)

---

## Résolution des problèmes

### Port déjà utilisé

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

```bash
sudo lsof -t -i tcp:5000 | xargs kill -9
```

### Problème de connexion à la BDD

```bash
docker-compose ps
docker-compose logs mysql
```

### Réinitialiser complètement

```bash
docker-compose down -v
docker-compose up -d --build
```

---

## Équipe

Projet développé par l'**Équipe Fumotion** - IUT d'Amiens

---

## Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## Contribution

1. Créez une branche feature (`git checkout -b feature/amazing-feature`)
2. Committez vos changements (`git commit -m 'Add amazing feature'`)
3. Push sur la branche (`git push origin feature/amazing-feature`)
4. Ouvrez une Pull Request

## Support

Pour toute question ou problème, veuillez ouvrir une issue.
