#!/bin/bash

# Script de développement pour Fumotion
# Lance le backend et frontend en mode développement

set -e  # Arrêter en cas d'erreur

echo "Démarrage de l'environnement de développement Fumotion..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Installer les dépendances si nécessaire
echo "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances racine..."
    npm install
fi

if [ ! -d "app/backend/node_modules" ]; then
    echo "Installation des dépendances backend..."
    cd app/backend && npm install && cd ../..
fi

if [ ! -d "app/frontend/node_modules" ]; then
    echo "Installation des dépendances frontend..."
    cd app/frontend && npm install && cd ../..
fi

# Créer les fichiers .env s'ils n'existent pas
echo "Vérification de la configuration..."
if [ ! -f "app/backend/.env" ] && [ -f ".env.example" ]; then
    echo "Création du fichier .env backend depuis .env.example..."
    cp .env.example app/backend/.env
fi

if [ ! -f "app/frontend/.env" ]; then
    echo "Création du fichier .env frontend..."
    echo "REACT_APP_API_URL=http://localhost:5000" > app/frontend/.env
fi

# Lancer les serveurs de développement
echo "Lancement des serveurs..."
echo "  - Backend: http://localhost:5000"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "Utilisez Ctrl+C pour arrêter les serveurs"
echo ""

# Utiliser concurrently pour lancer backend et frontend
npm run dev