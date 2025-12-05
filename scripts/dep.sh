#!/bin/bash

# Script pour déployer Fumotion avec Docker en local

set -e

echo "======================================================="
echo "🚀 Fumotion - Déploiement Docker Local"
echo "======================================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé!"
    echo "Installez Docker depuis: https://docs.docker.com/get-docker/"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé!"
    exit 1
fi

# Charger les variables d'environnement
if [ -f .env.production ]; then
    echo "📝 Chargement des variables d'environnement..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "⚠️ Fichier .env.production non trouvé. Utilisation des valeurs par défaut."
fi

# Arrêter les conteneurs existants
echo ""
echo "🛑 Arrêt des conteneurs existants..."
docker compose down

# Construire les images
echo ""
echo "🔨 Construction des images Docker..."
echo "Cela peut prendre plusieurs minutes..."
docker compose build

# Démarrer les conteneurs
echo ""
echo "▶️ Démarrage des conteneurs..."
docker compose up -d

# Attendre que les conteneurs soient prêts
echo ""
echo "⏳ Vérification de l'état des conteneurs..."
sleep 5

# Afficher le statut
echo ""
echo "📋 Statut des conteneurs:"
docker compose ps

echo ""
echo "======================================================="
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo "======================================================="
echo ""
echo "🌐 Application accessible sur:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 Commandes utiles:"
echo "   docker compose logs -f         # Voir les logs en temps réel"
echo "   docker compose ps              # Voir le statut"
echo "   docker compose down            # Arrêter les conteneurs"
echo "   docker compose restart         # Redémarrer"
echo ""