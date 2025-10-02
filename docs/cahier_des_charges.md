# Cahier des charges - Plateforme de covoiturage universitaire

## 1. Contexte et objectifs
L’université, et en particulier l’IUT d’Amiens, souhaite encourager la mobilité durable et réduire les coûts de transport des étudiants.  
Une plateforme web de covoiturage sera développée, dédiée aux trajets domicile-campus.  
L’application doit permettre aux étudiants de proposer et de réserver des trajets de manière simple et sécurisée.

### Objectifs pédagogiques
1. Analyser et formaliser le besoin client.  
2. Concevoir une architecture logicielle adaptée (base de données, API, front-end).  
3. Développer une application web sécurisée et responsive.  
4. Mettre en place une gestion de projet collaborative.  
5. Présenter un prototype fonctionnel avec une démonstration.  

---

## 2. Acteurs et rôles
- **Conducteur** : propose un trajet, indique nombre de places disponibles.  
- **Passager** : recherche un trajet, réserve une place.  
- **Administrateur** : gère les utilisateurs et modère les trajets.  

---

## 3. Fonctionnalités attendues

### Version minimale
1. **Gestion des utilisateurs**  
   - Inscription et authentification sécurisée (mots de passe hashés).  
   - Profil utilisateur (nom, prénom, courriel, téléphone, véhicule, places disponibles).  

2. **Proposition de trajets**  
   - Création d’un trajet (lieu de départ, arrivée, date, heure, nombre de places).  
   - Visualisation des trajets proposés par l’utilisateur.  

3. **Recherche et réservation**  
   - Recherche par lieu et date.  
   - Réservation d’une place sur un trajet proposé.  
   - Suivi des réservations (historique).  

4. **Interface utilisateur**  
   - Responsive (ordinateur et mobile).  
   - Navigation claire et intuitive.  

### Fonctionnalités optionnelles
- Géolocalisation avec API Google Maps ou OpenStreetMap.  
- Système de messagerie entre conducteur et passager.  
- Notifications (courriel ou in-app).  
- Gestion des annulations et avis utilisateurs.  

---

## 4. Contraintes techniques
- Développement web (front-end + back-end).  
- Base de données relationnelle (SQL).  
- Authentification sécurisée (hashage des mots de passe).  
- Application responsive (PC et mobile).  
- Utilisation d’un dépôt Git pour la gestion du code source.  

---

## 5. Cas d’utilisation (exemples)

### Cas d’utilisation : Proposer un trajet
1. Le conducteur se connecte.  
2. Il renseigne départ, arrivée, date/heure, nombre de places.  
3. Le trajet est enregistré et devient visible pour les passagers.  

### Cas d’utilisation : Réserver un trajet
1. Le passager se connecte.  
2. Il recherche un trajet par lieu/date.  
3. Il réserve une place disponible.  
4. Le conducteur est notifié de la réservation.  

---

## 6. Maquettes fonctionnelles (à produire)
- Page d’accueil avec recherche de trajets.  
- Page de connexion/inscription.  
- Page "Proposer un trajet".  
- Page "Mes réservations".  

---

## 7. Livrables attendus
1. Cahier des charges (ce document).  
2. Conception de la base de données (MCD, MLD, SQL).  
3. Code source de l’application (front-end + back-end).  
4. Documentation technique (installation, architecture, schémas).  
5. Guide utilisateur.  
6. Soutenance orale (40-50 min) avec démonstration.  

---

## 8. Évaluation (grille indicative)
- Analyse & conception : 25 %  
- Développement (fonctionnalités, qualité du code) : 35 %  
- Gestion de projet (organisation, Git, répartition du travail) : 15 %  
- Documentation : 10 %  
- Soutenance & démo : 15 %  

---
