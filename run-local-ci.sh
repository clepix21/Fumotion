#!/bin/bash
# Script pour exécuter les tests CI en local

set -e  # Arrête l'exécution en cas d'erreur

echo "🚀 Démarrage des tests CI locaux pour Fumotion"
echo "============================================="

# Configuration des variables d'environnement
export NODE_ENV=test

# 1. Tests Backend
echo "📋 1. TESTS BACKEND"
echo "-------------------"

echo "🔧 Installation des dépendances backend"
cd app/backend
npm ci

echo "📝 Création du fichier d'environnement de test"
echo "PORT=5000" > .env
echo "JWT_SECRET=cle_secrete_test_local" >> .env
echo "DB_PATH=./database/test.db" >> .env
echo "NODE_ENV=test" >> .env

echo "📁 Création du répertoire de base de données"
mkdir -p database

echo "🧪 Exécution des tests unitaires backend"
npm test || { echo "❌ Tests backend échoués"; exit 1; }

echo "🔄 Démarrage du serveur backend pour les tests API"
npm start &
SERVER_PID=$!

echo "⏳ Attente du démarrage du serveur..."
for i in {1..30}; do
  if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Serveur démarré avec succès après $i secondes"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Timeout: Le serveur n'a pas démarré dans le temps imparti"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

echo "🧪 Tests API backend"
curl -f http://localhost:5000/api/health || { echo "❌ Test de santé API échoué"; kill $SERVER_PID 2>/dev/null; exit 1; }
echo "✅ Test de santé API réussi"

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"Local","email":"test@local.com","password":"motdepasse123"}' \
  || { echo "❌ Test d'inscription échoué"; kill $SERVER_PID 2>/dev/null; exit 1; }
echo "✅ Test d'inscription réussi"

curl -f http://localhost:5000/api/trips/search || { echo "❌ Test de recherche de trajets échoué"; kill $SERVER_PID 2>/dev/null; exit 1; }
echo "✅ Test de recherche de trajets réussi"

# Conservez le serveur en cours d'exécution pour les tests d'intégration
cd ../..

# 2. Tests Frontend
echo ""
echo "📋 2. TESTS FRONTEND"
echo "-------------------"

echo "🔧 Installation des dépendances frontend"
cd app/frontend
npm ci

echo "🔧 Configuration du mock pour CSS dans Jest"
echo '{
  "jest": {
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
  }
}' > jest.config.json
npm install --save-dev identity-obj-proxy

echo "📝 Création du fichier d'environnement frontend"
echo "REACT_APP_API_URL=http://localhost:5000" > .env

echo "🧪 Vérification du linting"
npm run lint || echo "⚠️ Vérification lint terminée avec avertissements"

echo "🧪 Exécution des tests frontend"
CI=true npm test -- --watchAll=false --config=jest.config.json || { echo "❌ Tests frontend échoués"; kill $SERVER_PID 2>/dev/null; exit 1; }

echo "📦 Build de production frontend"
npm run build || { echo "❌ Build frontend échoué"; kill $SERVER_PID 2>/dev/null; exit 1; }
echo "✅ Build frontend réussi"

cd ../..

# 3. Analyse de sécurité
echo ""
echo "📋 3. ANALYSE DE SÉCURITÉ"
echo "------------------------"

echo "🔒 Audit de sécurité Backend"
cd app/backend
npm audit --production --audit-level=high || echo "⚠️ Des vulnérabilités ont été détectées dans le backend"

echo "🔒 Audit de sécurité Frontend"
cd ../frontend
npm audit --production --audit-level=high || echo "⚠️ Des vulnérabilités ont été détectées dans le frontend"

cd ../..

# 4. Contrôle qualité code
echo ""
echo "📋 4. CONTRÔLE QUALITÉ CODE"
echo "--------------------------"

echo "🔍 Installation des outils d'analyse"
npm install -g eslint jscpd || echo "⚠️ Installation des outils d'analyse ignorée, utilisation des outils existants"

echo "🔍 Vérification de la structure et duplication du code backend"
cd app/backend
find . -name "*.js" -not -path "./node_modules/*" | wc -l
echo "🔍 Analyse duplication code backend"
jscpd . --ignore "node_modules/**" --threshold 5 || echo "⚠️ Attention: Code dupliqué détecté dans le backend"

echo "🔍 Vérification de la structure et duplication du code frontend"
cd ../frontend
find src -name "*.js" -o -name "*.jsx" | wc -l
echo "🔍 Analyse duplication code frontend"
jscpd src --threshold 5 || echo "⚠️ Attention: Code dupliqué détecté dans le frontend"

cd ../..

# 5. Nettoyage
echo ""
echo "📋 5. NETTOYAGE"
echo "-------------"
echo "🧹 Arrêt du serveur backend"
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✨ TESTS CI TERMINÉS"
echo "==================="
echo "Tous les tests ont été exécutés avec succès !"