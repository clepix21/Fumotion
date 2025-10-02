#!/bin/bash

# Script de build de production pour Fumotion
# Build le frontend et prépare le backend pour la production

set -e  # Arrêter en cas d'erreur

echo "Build de production Fumotion..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Nettoyer les builds précédents
echo "Nettoyage des builds précédents..."
rm -rf app/frontend/build
rm -rf dist
mkdir -p dist

# Installer les dépendances
echo "Installation des dépendances..."
echo "  - Dépendances racine..."
npm ci --only=production

echo "  - Dépendances backend..."
cd app/backend
npm ci --only=production
cd ../..

echo "  - Dépendances frontend..."
cd app/frontend
npm ci
cd ../..

# Lancer les tests
echo "Exécution des tests..."
echo "  - Tests frontend..."
cd app/frontend
npm test -- --coverage --watchAll=false --passWithNoTests
cd ../..

echo "  - Tests backend (si disponibles)..."
cd app/backend
npm test --if-present -- --passWithNoTests
cd ../..

# Build du frontend
echo "Build du frontend React..."
cd app/frontend
npm run build
cd ../..

# Copier les fichiers pour la production
echo "Préparation des fichiers de production..."

# Copier le backend
cp -r app/backend dist/
# Nettoyer les dev dependencies du backend copié
cd dist/backend
npm ci --only=production
cd ../..

# Copier le build frontend
cp -r app/frontend/build dist/frontend

# Copier les fichiers de configuration
cp package.json dist/
cp README.md dist/ 2>/dev/null || echo "Pas de README.md à copier"
cp .env.example dist/ 2>/dev/null || echo "Pas de .env.example à copier"

# Créer un package.json simplifié pour la production
cat > dist/package.json << EOF
{
  "name": "fumotion-production",
  "version": "1.0.0",
  "description": "Fumotion - Application de production",
  "main": "backend/server.js",
  "scripts": {
    "start": "cd backend && node server.js",
    "install-deps": "cd backend && npm ci --only=production"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
EOF

# Créer le fichier de démarrage
cat > dist/start.sh << 'EOF'
#!/bin/bash
echo "Démarrage de Fumotion en production..."
echo "Installation des dépendances..."
npm run install-deps
echo "Lancement du serveur..."
npm start
EOF
chmod +x dist/start.sh

# Créer un Dockerfile de base
cat > dist/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances backend
RUN cd backend && npm ci --only=production

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["npm", "start"]
EOF

echo "Build de production terminé !"
echo ""
echo "Fichiers générés dans ./dist/"
echo "Pour démarrer en production:"
echo "   cd dist && ./start.sh"
echo ""
echo "Pour build Docker:"
echo "   cd dist && docker build -t fumotion ."
echo "   docker run -p 5000:5000 fumotion"
echo ""
echo "Taille du build:"
du -sh dist/