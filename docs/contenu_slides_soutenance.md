# 📽️ Contenu des Slides - Soutenance SAE 3 FUMOTION

> **Groupe GK** - Mercredi 14 janvier 2026, 15h45-16h25  
> **Durée** : 25 min de présentation + 15 min de questions  
> **Membres** : Clément Lemaire, Maxence Lepeuve, Louka Carpentier, Léanne Basin, Noa Arnould, Loïc Restout  
> **Temps par personne** : ~4 min 10 sec

---

## 📑 SLIDE 1 - Page de Titre ✅
**Contenu actuel correct**
- SAE 3 - FUMOTION
- Covoiturage pour Étudiants
- Noms des membres
- BUT 2 - 2025-2026
- Logo IUT

---

## 📑 SLIDE 2 - Sommaire (À COMPLÉTER)

| N° | Titre |
|----|-------|
| 01 | Contexte & Problématique |
| 02 | Analyse & Conception |
| 03 | Choix Techniques & Architecture |
| 04 | Démonstration |
| 05 | Gestion de Projet |
| 06 | Méthodologie & Organisation |
| 07 | Bilan & Perspectives |
| 08 | Conclusion |

---

## 📑 SLIDE 3 - Contexte & Problématique (Titre de section) ✅

---

## 📑 SLIDE 4 - Le besoin de mobilité à l'IUT ✅
**Contenu actuel correct** - Garder tel quel

---

## 📑 SLIDE 5 - Objectifs Pédagogiques & Techniques ✅
**Contenu actuel correct** - Garder tel quel

---

## 📑 SLIDE 6 - Analyse & Conception (Titre de section) ✅

---

## 📑 SLIDE 7 - Les Acteurs du Système ✅
**Contenu actuel correct** - Garder tel quel

---

## 📑 SLIDE 8 - Périmètre Fonctionnel ✅
**Contenu actuel correct** - Garder tel quel

---

## 📑 SLIDE 9 - Conception Graphique (À ENRICHIR)

**Ajouter des visuels :**
- Capture de maquette Figma (côté gauche)
- Screenshot de l'application finale (côté droit)
- Palette de couleurs utilisée (bleu #0EA5E9, blanc, gris)

---

## 📑 SLIDE 10 - Architecture des Données (À ENRICHIR)

**MLD Simplifié - Schéma à ajouter :**

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │     TRIPS       │       │    BOOKINGS     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ driver_id (FK)  │◄─┘    │ trip_id (FK)    │◄─┐
│ password_hash   │  └───►│ departure       │       │ passenger_id(FK)│  │
│ first_name      │       │ destination     │       │ status          │  │
│ last_name       │       │ departure_time  │       │ seats_booked    │  │
│ phone           │       │ available_seats │       │ created_at      │  │
│ is_admin        │       │ price           │       └─────────────────┘  │
│ created_at      │       │ created_at      │──────────────────────────►─┘
└─────────────────┘       └─────────────────┘

        │                         │
        │    ┌─────────────────┐  │    ┌─────────────────┐
        │    │    MESSAGES     │  │    │     REVIEWS     │
        │    ├─────────────────┤  │    ├─────────────────┤
        └───►│ sender_id (FK)  │  └───►│ trip_id (FK)    │
             │ receiver_id(FK) │       │ author_id (FK)  │
             │ content         │       │ target_id (FK)  │
             │ created_at      │       │ rating (1-5)    │
             │ read            │       │ comment         │
             └─────────────────┘       └─────────────────┘
```

**Notes :**
- Base MySQL en production (Docker)
- Facilité de migration SQLite → MySQL
- Relations : Users ↔ Trips ↔ Bookings ↔ Reviews ↔ Messages

---

## 📑 SLIDE 11 - Choix Techniques & Architecture (Titre de section) ✅

---

## 📑 SLIDE 12 - Technologies Utilisées ✅
**Contenu actuel correct** - Garder tel quel

---

## 📑 SLIDE 13 - Architecture Client-Serveur (À CRÉER)

**Schéma à intégrer :**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         TRAEFIK (Reverse Proxy)                           │
│                    🔒 HTTPS + Let's Encrypt SSL                           │
│                         fumotion.tech                                     │
└──────────────────────────────────────────────────────────────────────────┘
                         │                    │
                         ▼                    ▼
        ┌─────────────────────────┐   ┌─────────────────────────┐
        │      FRONTEND           │   │       BACKEND           │
        │   ⚛️ React + Nginx      │   │   💚 Node.js + Express  │
        │   📱 Responsive         │   │   🔐 JWT + bcrypt       │
        │   🗺️ Leaflet Maps       │   │   📧 Nodemailer         │
        │                         │   │                         │
        │   Port: 80              │   │   Port: 5000            │
        └─────────────────────────┘   └─────────────────────────┘
                                                  │
                                                  ▼
                              ┌─────────────────────────────────┐
                              │          DATABASE               │
                              │        🐬 MySQL 8.0             │
                              │                                 │
                              │   Volume persistant Docker      │
                              └─────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                        SERVICES EXTERNES                                  │
│   🗺️ OpenStreetMap    🔍 Nominatim (Géocodage)    📧 SMTP (Emails)       │
└──────────────────────────────────────────────────────────────────────────┘
```

**Points clés à mentionner :**
- Architecture en 3 conteneurs Docker
- Communication via API REST (JSON)
- Reverse proxy Traefik pour le routage
- SSL/HTTPS automatique avec Let's Encrypt

---

## 📑 SLIDE 14 - Intégration de la Carte (À CRÉER)

**Contenu suggéré :**

### Technologies utilisées
- **Leaflet** : Bibliothèque JS open-source pour cartes interactives
- **React-Leaflet** : Binding React pour Leaflet
- **OpenStreetMap** : Tuiles de carte (gratuit, open-source)
- **Nominatim** : API de géocodage (adresse → coordonnées)
- **OSRM** : Calcul d'itinéraires routiers

### Fonctionnalités implémentées
1. 📍 Affichage des points de départ/arrivée
2. 🛣️ Tracé de l'itinéraire sur la carte
3. 🔍 Recherche d'adresse avec autocomplétion
4. 📏 Calcul automatique de la distance

### Screenshot
*Ajouter une capture d'écran du MapComponent en action*

---

## 📑 SLIDE 15 - Gestion de Projet & Bilan (Titre de section) ✅

---

## 📑 SLIDE 16 - Méthodologie (À CRÉER)

**Contenu suggéré :**

### Approche Agile
- Sprints de 2 semaines
- Daily meetings (Discord)
- Répartition des tâches par fonctionnalité

### Outils de collaboration
| Outil | Usage |
|-------|-------|
| **Git/GitHub** | Versioning du code, branches feature |
| **Discord** | Communication quotidienne |
| **Trello/Notion** | Suivi des tâches (Kanban) |
| **Figma** | Maquettes UI/UX |

### Répartition des rôles
| Membre | Responsabilités principales |
|--------|----------------------------|
| Clément | Backend API, Auth, DevOps |
| Maxence | Frontend, Intégration |
| Louka | Frontend, UI/UX |
| Léanne | Base de données, Tests |
| Noa | Messagerie, Reviews |
| Loïc | Documentation, Carte |

### Planning respecté
- Semaine 1-2 : Analyse & Conception
- Semaine 3-4 : Développement Backend
- Semaine 5-6 : Développement Frontend
- Semaine 7 : Intégration & Tests
- Semaine 8 : Documentation & Préparation soutenance

---

## 📑 SLIDE 17 - Retour d'Expérience (À CRÉER)

**Contenu suggéré :**

### ✅ Ce qui a bien fonctionné
- Communication régulière en équipe
- Architecture Docker → déploiement simplifié
- Choix de React → composants réutilisables
- Git avec branches → travail parallèle efficace

### ⚠️ Difficultés rencontrées
- Intégration Leaflet avec React (compatibilité)
- Gestion CORS entre Frontend et Backend
- Configuration HTTPS avec Traefik
- Synchronisation des styles CSS

### 📚 Apprentissages
- Travail en équipe sur un projet conséquent
- Découverte de Docker et du déploiement
- Approfondissement de React et Node.js
- Gestion de projet agile

---

## 📑 SLIDE 18 - Bilan et Perspectives (À CRÉER)

**Contenu suggéré :**

### ✅ Objectifs atteints
- Application fonctionnelle et déployée
- Toutes les fonctionnalités minimales implémentées
- Extensions réalisées : Carte, Messagerie, Avis
- Interface responsive (mobile + desktop)
- Sécurité : JWT, hash mots de passe, HTTPS

### 🚀 Améliorations futures
- Notifications push en temps réel (WebSocket)
- Application mobile native (React Native)
- Intégration paiement (Stripe)
- Système de récurrence des trajets
- Mode hors-ligne (PWA)

### 📊 Statistiques du projet
| Métrique | Valeur |
|----------|--------|
| Commits Git | ~XXX |
| Fichiers | ~XX |
| Lignes de code | ~XXXX |
| Endpoints API | 25+ |

---

## 📑 SLIDE 19 - Merci pour votre attention ✅
**Contenu actuel correct** - Garder tel quel

---

## 💡 CONSEILS POUR LA PRÉSENTATION

### Organisation du temps (~4 min par personne)
| Ordre | Membre | Slides | Thème |
|-------|--------|--------|-------|
| 1 | Membre A | 1-4 | Introduction, Contexte |
| 2 | Membre B | 5-8 | Analyse, Acteurs, Fonctionnalités |
| 3 | Membre C | 9-10 | Conception graphique, BDD |
| 4 | Membre D | 11-14 | Technologies, Architecture, Carte |
| 5 | Membre E | 15-17 | Gestion projet, Méthodologie, Retour d'XP |
| 6 | Membre F | 18-19 | Bilan, Perspectives, Conclusion |

### Points importants
- ❌ Pas de lecture des slides
- ❌ Pas de casquette/bonnet
- ✅ Tenue correcte
- ✅ Regarder le jury
- ✅ Captures d'écran plutôt que démo live
- ✅ Chacun doit connaître TOUT le projet (questions individuelles)

---

## 🖼️ SCREENSHOTS À AJOUTER

1. **Slide 9** : Maquette Figma vs Application finale
2. **Slide 10** : Schéma MLD (ou screenshot de phpMyAdmin/DBeaver)
3. **Slide 13** : Schéma d'architecture (draw.io ou Excalidraw)
4. **Slide 14** : Capture du MapComponent avec itinéraire
5. **Slide 16** : Screenshot Trello/GitHub Projects
6. **Slide 17** : Graph commits GitHub / screenshot du repo
