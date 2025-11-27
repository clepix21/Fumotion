# Dictionnaire de données - Fumotion

## Table : `users` (Utilisateurs)
Stocke les informations des utilisateurs de la plateforme (conducteurs et passagers)

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| id | INTEGER | - | PK, AUTO_INCREMENT | Identifiant unique de l'utilisateur |
| email | VARCHAR | 255 | NOT NULL, UNIQUE | Adresse email de l'utilisateur (login) |
| password | VARCHAR | 255 | NOT NULL | Mot de passe hashé (bcrypt) |
| first_name | VARCHAR | 100 | NOT NULL | Prénom de l'utilisateur |
| last_name | VARCHAR | 100 | NOT NULL | Nom de famille de l'utilisateur |
| phone | VARCHAR | 20 | NULL | Numéro de téléphone |
| student_id | VARCHAR | 50 | NULL | Numéro d'étudiant |
| university | VARCHAR | 255 | DEFAULT 'IUT Amiens' | Établissement universitaire |
| profile_picture | VARCHAR | 255 | NULL | Chemin vers la photo de profil |
| banner_picture | VARCHAR | 255 | NULL | Chemin vers l'image de bannière |
| is_verified | BOOLEAN | - | DEFAULT 0 | Compte vérifié (0=non, 1=oui) |
| is_active | BOOLEAN | - | DEFAULT 1 | Compte actif (0=inactif, 1=actif) |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de création du compte |
| updated_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de dernière modification |

---

## Table : `vehicles` (Véhicules)
Stocke les informations des véhicules appartenant aux conducteurs

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| id | INTEGER | - | PK, AUTO_INCREMENT | Identifiant unique du véhicule |
| user_id | INTEGER | - | FK, NOT NULL | Référence vers le propriétaire (users.id) |
| brand | VARCHAR | 100 | NOT NULL | Marque du véhicule (ex: Renault) |
| model | VARCHAR | 100 | NOT NULL | Modèle du véhicule (ex: Clio) |
| color | VARCHAR | 50 | NULL | Couleur du véhicule |
| license_plate | VARCHAR | 20 | NULL | Plaque d'immatriculation |
| seats | INTEGER | - | NOT NULL, DEFAULT 4 | Nombre de places disponibles |
| year | INTEGER | - | NULL | Année de mise en circulation |
| is_active | BOOLEAN | - | DEFAULT 1 | Véhicule actif (0=inactif, 1=actif) |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date d'ajout du véhicule |

**Relations :**
- `user_id` → `users(id)` [ON DELETE CASCADE]

---

## Table : `trips` (Trajets)
Stocke les trajets proposés par les conducteurs

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| id | INTEGER | - | PK, AUTO_INCREMENT | Identifiant unique du trajet |
| driver_id | INTEGER | - | FK, NOT NULL | Référence vers le conducteur (users.id) |
| vehicle_id | INTEGER | - | FK, NULL | Référence vers le véhicule (vehicles.id) |
| departure_location | VARCHAR | 255 | NOT NULL | Adresse de départ |
| departure_latitude | DECIMAL | 10,8 | NULL | Latitude du point de départ |
| departure_longitude | DECIMAL | 11,8 | NULL | Longitude du point de départ |
| arrival_location | VARCHAR | 255 | NOT NULL | Adresse d'arrivée |
| arrival_latitude | DECIMAL | 10,8 | NULL | Latitude du point d'arrivée |
| arrival_longitude | DECIMAL | 11,8 | NULL | Longitude du point d'arrivée |
| departure_datetime | DATETIME | - | NOT NULL | Date et heure de départ |
| available_seats | INTEGER | - | NOT NULL | Nombre de places disponibles |
| price_per_seat | DECIMAL | 10,2 | NOT NULL | Prix par place (en euros) |
| description | TEXT | - | NULL | Description ou notes supplémentaires |
| status | VARCHAR | 20 | DEFAULT 'active', CHECK | Statut du trajet (active, completed, cancelled) |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de création du trajet |
| updated_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de dernière modification |

**Relations :**
- `driver_id` → `users(id)` [ON DELETE CASCADE]
- `vehicle_id` → `vehicles(id)` [ON DELETE SET NULL]

**Contraintes :**
- `status` ∈ {'active', 'completed', 'cancelled'}

---

## Table : `bookings` (Réservations)
Stocke les réservations effectuées par les passagers

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| id | INTEGER | - | PK, AUTO_INCREMENT | Identifiant unique de la réservation |
| trip_id | INTEGER | - | FK, NOT NULL | Référence vers le trajet (trips.id) |
| passenger_id | INTEGER | - | FK, NOT NULL | Référence vers le passager (users.id) |
| seats_booked | INTEGER | - | NOT NULL, DEFAULT 1 | Nombre de places réservées |
| total_price | DECIMAL | 10,2 | NOT NULL | Prix total de la réservation |
| status | VARCHAR | 20 | DEFAULT 'pending', CHECK | Statut de la réservation |
| payment_status | VARCHAR | 20 | DEFAULT 'pending', CHECK | Statut du paiement |
| booking_date | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de la réservation |
| updated_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de dernière modification |

**Relations :**
- `trip_id` → `trips(id)` [ON DELETE CASCADE]
- `passenger_id` → `users(id)` [ON DELETE CASCADE]

**Contraintes :**
- `status` ∈ {'pending', 'confirmed', 'cancelled', 'completed'}
- `payment_status` ∈ {'pending', 'paid', 'refunded'}
- UNIQUE(`trip_id`, `passenger_id`) : un passager ne peut réserver qu'une fois par trajet

---

## Table : `reviews` (Évaluations)
Stocke les évaluations entre conducteurs et passagers après un trajet

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| id | INTEGER | - | PK, AUTO_INCREMENT | Identifiant unique de l'évaluation |
| booking_id | INTEGER | - | FK, NOT NULL | Référence vers la réservation (bookings.id) |
| reviewer_id | INTEGER | - | FK, NOT NULL | Référence vers l'évaluateur (users.id) |
| reviewed_id | INTEGER | - | FK, NOT NULL | Référence vers l'évalué (users.id) |
| rating | INTEGER | - | NOT NULL, CHECK | Note de 1 à 5 étoiles |
| comment | TEXT | - | NULL | Commentaire sur l'expérience |
| type | VARCHAR | 20 | NOT NULL, CHECK | Type d'évaluation (driver, passenger) |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date de l'évaluation |

**Relations :**
- `booking_id` → `bookings(id)` [ON DELETE CASCADE]
- `reviewer_id` → `users(id)` [ON DELETE CASCADE]
- `reviewed_id` → `users(id)` [ON DELETE CASCADE]

**Contraintes :**
- `rating` ∈ [1, 5]
- `type` ∈ {'driver', 'passenger'}
- UNIQUE(`booking_id`, `reviewer_id`) : un utilisateur ne peut évaluer qu'une fois par réservation

---

## Table : `messages` (Messages)
Stocke les messages échangés concernant un trajet spécifique

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| id | INTEGER | - | PK, AUTO_INCREMENT | Identifiant unique du message |
| trip_id | INTEGER | - | FK, NOT NULL | Référence vers le trajet (trips.id) |
| sender_id | INTEGER | - | FK, NOT NULL | Référence vers l'expéditeur (users.id) |
| message | TEXT | - | NOT NULL | Contenu du message |
| is_read | BOOLEAN | - | DEFAULT 0 | Message lu (0=non lu, 1=lu) |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Date d'envoi du message |

**Relations :**
- `trip_id` → `trips(id)` [ON DELETE CASCADE]
- `sender_id` → `users(id)` [ON DELETE CASCADE]

---

## Index de la base de données

| Index | Table | Colonnes | Objectif |
|-------|-------|----------|----------|
| idx_trips_status | trips | status | Optimiser les recherches de trajets par statut |
| idx_trips_departure_datetime | trips | departure_datetime | Optimiser les recherches de trajets par date |
| idx_bookings_trip_id | bookings | trip_id | Optimiser les recherches de réservations par trajet |
| idx_bookings_passenger_id | bookings | passenger_id | Optimiser les recherches de réservations par passager |
| idx_bookings_status | bookings | status | Optimiser les recherches de réservations par statut |
| idx_messages_trip_id | messages | trip_id | Optimiser les recherches de messages par trajet |
| idx_vehicles_user_id | vehicles | user_id | Optimiser les recherches de véhicules par utilisateur |

---

## Règles de gestion

1. Un utilisateur peut être conducteur et/ou passager
2. Un conducteur peut posséder plusieurs véhicules
3. Un trajet est associé à un seul conducteur et un seul véhicule (optionnel)
4. Un passager peut réserver plusieurs places sur un même trajet (seats_booked)
5. Un passager ne peut pas réserver deux fois le même trajet (contrainte UNIQUE)
6. Une réservation peut avoir plusieurs statuts : pending, confirmed, cancelled, completed
7. Une évaluation est liée à une réservation terminée
8. Chaque participant (conducteur/passager) peut évaluer l'autre après le trajet
9. Les messages sont liés à un trajet spécifique
10. La suppression d'un utilisateur entraîne la suppression de ses trajets, véhicules, réservations (CASCADE)
11. La suppression d'un véhicule ne supprime pas les trajets associés (SET NULL)
