# Modèle Conceptuel de Données (MCD) - Fumotion

## Diagramme des entités et associations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SYSTÈME DE COVOITURAGE FUMOTION                       │
└─────────────────────────────────────────────────────────────────────────────┘


                              ┌─────────────────┐
                              │     USERS       │
                              ├─────────────────┤
                              │ id (PK)         │
                              │ email           │
                              │ password        │
                              │ first_name      │
                              │ last_name       │
                              │ phone           │
                              │ student_id      │
                              │ university      │
                              │ profile_picture │
                              │ banner_picture  │
                              │ is_verified     │
                              │ is_active       │
                              │ created_at      │
                              │ updated_at      │
                              └────────┬────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 │                     │                     │
                 │ Possède         Conduit                Réserve
                 │ (1,n)            (1,n)                  (1,n)
                 │                     │                     │
                 ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
        │  VEHICLES    │      │    TRIPS     │     │   BOOKINGS   │
        ├──────────────┤      ├──────────────┤     ├──────────────┤
        │ id (PK)      │      │ id (PK)      │     │ id (PK)      │
        │ user_id (FK) │      │ driver_id(FK)│◄────│ trip_id (FK) │
        │ brand        │      │ vehicle_id   │     │ passenger_id │
        │ model        │      │ departure_*  │     │ seats_booked │
        │ color        │      │ arrival_*    │     │ total_price  │
        │ license_plate│      │ datetime     │     │ status       │
        │ seats        │      │ avail_seats  │     │ payment_*    │
        │ year         │      │ price/seat   │     │ booking_date │
        │ is_active    │      │ description  │     │ updated_at   │
        │ created_at   │      │ status       │     └──────┬───────┘
        └──────────────┘      │ created_at   │            │
                │             │ updated_at   │            │
                │             └──────┬───────┘            │
                │                    │                    │
                │                    │ Utilise        Concerne
                └────────────────────┤ (0,1)          (1,1)
                                     │                    │
                                     │                    ▼
                                     │            ┌──────────────┐
                                     │            │   REVIEWS    │
                                     │            ├──────────────┤
                                     │            │ id (PK)      │
                                     │            │ booking_id   │
                                     │            │ reviewer_id  │
                                     │            │ reviewed_id  │
                                     │            │ rating       │
                                     │            │ comment      │
                                     │            │ type         │
                                     │            │ created_at   │
                                     │            └──────────────┘
                                     │
                                     │ Discute
                                     │ (1,n)
                                     │
                                     ▼
                             ┌──────────────┐
                             │   MESSAGES   │
                             ├──────────────┤
                             │ id (PK)      │
                             │ trip_id (FK) │
                             │ sender_id(FK)│
                             │ message      │
                             │ is_read      │
                             │ created_at   │
                             └──────────────┘
```

---

## Description des entités

### 1. USERS (Utilisateurs)
**Description :** Représente tous les utilisateurs de la plateforme (conducteurs et passagers)

**Attributs clés :**
- Identifiant unique (id)
- Informations personnelles (nom, prénom, email, téléphone)
- Informations académiques (student_id, university)
- Profil visuel (profile_picture, banner_picture)
- Statut du compte (is_verified, is_active)

### 2. VEHICLES (Véhicules)
**Description :** Représente les véhicules appartenant aux conducteurs

**Attributs clés :**
- Informations du véhicule (marque, modèle, couleur, plaque)
- Capacité (nombre de sièges)
- Statut (actif/inactif)

### 3. TRIPS (Trajets)
**Description :** Représente les trajets proposés par les conducteurs

**Attributs clés :**
- Localisation (départ et arrivée avec coordonnées GPS)
- Planification (date et heure de départ)
- Disponibilité (places disponibles)
- Tarification (prix par place)
- Statut (active, completed, cancelled)

### 4. BOOKINGS (Réservations)
**Description :** Représente les réservations effectuées par les passagers

**Attributs clés :**
- Référence au trajet et au passager
- Nombre de places réservées
- Prix total
- Statut de la réservation et du paiement

### 5. REVIEWS (Évaluations)
**Description :** Représente les évaluations entre conducteurs et passagers

**Attributs clés :**
- Note de 1 à 5 étoiles
- Commentaire textuel
- Type d'évaluation (conducteur ou passager)

### 6. MESSAGES (Messages)
**Description :** Représente les messages échangés concernant un trajet

**Attributs clés :**
- Contenu du message
- Statut de lecture
- Horodatage

---

## Cardinalités des associations

### USERS ↔ VEHICLES
- **Relation :** "Possède"
- **Cardinalité :** 1 utilisateur possède 0 à N véhicules (1,n)
- **Cardinalité :** 1 véhicule appartient à 1 utilisateur (1,1)

### USERS ↔ TRIPS (en tant que conducteur)
- **Relation :** "Conduit"
- **Cardinalité :** 1 utilisateur conduit 0 à N trajets (1,n)
- **Cardinalité :** 1 trajet est conduit par 1 utilisateur (1,1)

### VEHICLES ↔ TRIPS
- **Relation :** "Utilise"
- **Cardinalité :** 1 véhicule est utilisé pour 0 à N trajets (0,n)
- **Cardinalité :** 1 trajet utilise 0 ou 1 véhicule (0,1)

### USERS ↔ BOOKINGS (en tant que passager)
- **Relation :** "Réserve"
- **Cardinalité :** 1 utilisateur réserve 0 à N trajets (1,n)
- **Cardinalité :** 1 réservation concerne 1 utilisateur (1,1)

### TRIPS ↔ BOOKINGS
- **Relation :** "Est réservé par"
- **Cardinalité :** 1 trajet a 0 à N réservations (0,n)
- **Cardinalité :** 1 réservation concerne 1 trajet (1,1)

### BOOKINGS ↔ REVIEWS
- **Relation :** "Est évalué par"
- **Cardinalité :** 1 réservation a 0 à 2 évaluations (0,2) [conducteur + passager]
- **Cardinalité :** 1 évaluation concerne 1 réservation (1,1)

### TRIPS ↔ MESSAGES
- **Relation :** "Discute sur"
- **Cardinalité :** 1 trajet a 0 à N messages (0,n)
- **Cardinalité :** 1 message concerne 1 trajet (1,1)

### USERS ↔ MESSAGES (en tant qu'expéditeur)
- **Relation :** "Envoie"
- **Cardinalité :** 1 utilisateur envoie 0 à N messages (1,n)
- **Cardinalité :** 1 message est envoyé par 1 utilisateur (1,1)

---

## Contraintes d'intégrité

### Contraintes d'entité
1. **Unicité des emails** : Un email ne peut être associé qu'à un seul utilisateur
2. **Plaques d'immatriculation** : Une plaque d'immatriculation doit être unique (si renseignée)
3. **Réservation unique** : Un passager ne peut réserver qu'une fois le même trajet

### Contraintes de domaine
1. **rating** : Doit être compris entre 1 et 5
2. **status (trips)** : Doit être 'active', 'completed' ou 'cancelled'
3. **status (bookings)** : Doit être 'pending', 'confirmed', 'cancelled' ou 'completed'
4. **payment_status** : Doit être 'pending', 'paid' ou 'refunded'
5. **type (reviews)** : Doit être 'driver' ou 'passenger'
6. **available_seats** : Doit être positif
7. **price_per_seat** : Doit être positif

### Contraintes référentielles
1. La suppression d'un **utilisateur** entraîne la suppression de :
   - Ses véhicules (CASCADE)
   - Ses trajets en tant que conducteur (CASCADE)
   - Ses réservations en tant que passager (CASCADE)
   - Ses messages (CASCADE)
   - Ses évaluations (CASCADE)

2. La suppression d'un **véhicule** :
   - Ne supprime pas les trajets associés (SET NULL)

3. La suppression d'un **trajet** entraîne la suppression de :
   - Toutes les réservations associées (CASCADE)
   - Tous les messages associés (CASCADE)

4. La suppression d'une **réservation** entraîne la suppression de :
   - Toutes les évaluations associées (CASCADE)

---

## Règles métier

1. **Disponibilité des places** : Le nombre de places réservées ne peut pas dépasser le nombre de places disponibles
2. **Évaluation unique** : Un utilisateur ne peut évaluer qu'une seule fois une même réservation
3. **Statut cohérent** : 
   - Un trajet complété ne peut plus être modifié
   - Une réservation annulée ne peut pas être confirmée
4. **Prix cohérent** : total_price = seats_booked × price_per_seat
5. **Double évaluation** : Après un trajet, le conducteur peut évaluer le passager ET le passager peut évaluer le conducteur
6. **Vérification** : Seuls les utilisateurs vérifiés peuvent proposer des trajets
7. **Dates** : La date de départ d'un trajet doit être dans le futur lors de la création
8. **Messages** : Seuls les participants d'un trajet (conducteur et passagers ayant réservé) peuvent envoyer des messages

---

## Optimisations

### Index créés
- **idx_trips_status** : Accélère les recherches de trajets actifs
- **idx_trips_departure_datetime** : Accélère les recherches par date
- **idx_bookings_trip_id** : Accélère les recherches de réservations par trajet
- **idx_bookings_passenger_id** : Accélère les recherches de réservations par passager
- **idx_bookings_status** : Accélère les recherches par statut de réservation
- **idx_messages_trip_id** : Accélère les recherches de messages par trajet
- **idx_vehicles_user_id** : Accélère les recherches de véhicules par utilisateur

### Dénormalisation envisagée
- Stockage des coordonnées GPS pour accélérer les recherches géographiques
- Cache des notes moyennes des utilisateurs pour l'affichage rapide

---

## Évolutions futures possibles

1. **Favoris** : Permettre aux utilisateurs de sauvegarder des trajets favoris
2. **Notifications** : Ajouter une table pour gérer les notifications push
3. **Historique** : Conserver un historique des modifications de statut
4. **Paiements** : Intégrer un système de paiement en ligne
5. **Conversations** : Évolution vers un système de chat privé entre utilisateurs
6. **Préférences** : Ajouter des préférences utilisateur (musique, climatisation, etc.)
