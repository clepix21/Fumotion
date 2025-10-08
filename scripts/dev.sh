#!/bin/bash


set -e 

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Options
FORCE=false
CLEAN=false
HELP=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--force)
      FORCE=true
      shift
      ;;
    -c|--clean)
      CLEAN=true
      shift
      ;;
    -h|--help)
      HELP=true
      shift
      ;;
    *)
      echo -e "${RED}❌ Option inconnue: $1${NC}"
      exit 1
      ;;
  esac
done

# Aide
if [ "$HELP" = true ]; then
    echo -e "${GREEN}Usage: ./dev.sh [-f|--force] [-c|--clean] [-h|--help]${NC}"
    echo -e "  -f, --force  : Force la réinstallation des dépendances"
    echo -e "  -c, --clean  : Nettoie les node_modules avant installation"
    echo -e "  -h, --help   : Affiche cette aide"
    exit 0
fi

echo -e "${MAGENTA}=== Fumotion Development Environment ===${NC}"
echo -e "${GREEN}🚀 Démarrage de l'environnement de développement...${NC}"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet Fumotion${NC}"
    exit 1
fi

# Nettoyage si demandé
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}🧹 Nettoyage des dépendances...${NC}"
    rm -rf node_modules app/backend/node_modules app/frontend/node_modules
    rm -f package-lock.json app/backend/package-lock.json app/frontend/package-lock.json
fi

# Vérifier Node.js
echo -e "${YELLOW}🔍 Vérification des prérequis...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js non trouvé. Installez Node.js v16+ depuis https://nodejs.org${NC}"
    exit 1
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm non trouvé${NC}"
    exit 1
fi

# Installer les dépendances
echo -e "${YELLOW}📦 Vérification des dépendances...${NC}"

if [ "$FORCE" = true ] || [ ! -d "node_modules" ]; then
    echo -e "${CYAN}📦 Installation des dépendances racine (concurrently)...${NC}"
    npm install
fi

if [ "$FORCE" = true ] || [ ! -d "app/backend/node_modules" ]; then
    echo -e "${CYAN}🔧 Installation des dépendances backend (Express.js, CORS)...${NC}"
    cd app/backend && npm install && cd ../..
fi

if [ "$FORCE" = true ] || [ ! -d "app/frontend/node_modules" ]; then
    echo -e "${CYAN}⚛️ Installation des dépendances frontend (React.js)...${NC}"
    cd app/frontend && npm install && cd ../..
fi

# Créer les fichiers de configuration
echo -e "${YELLOW}⚙️ Vérification de la configuration...${NC}"

if [ ! -f "app/backend/.env" ]; then
    echo -e "${CYAN}📄 Création du fichier .env backend...${NC}"
    cat > app/backend/.env << EOF
# Configuration Backend Fumotion
NODE_ENV=development
PORT=5000

# JWT Secret (CHANGEZ EN PRODUCTION!)
JWT_SECRET=fumotion_secret_key_change_in_production_2025

# Base de données
DATABASE_URL=sqlite:./database/fumotion.db

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10mb

# CORS
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✅ Fichier .env backend créé${NC}"
fi

if [ ! -f "app/frontend/.env" ]; then
    echo -e "${CYAN}📄 Création du fichier .env frontend...${NC}"
    cat > app/frontend/.env << EOF
# Configuration Frontend Fumotion
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NAME=Fumotion
GENERATE_SOURCEMAP=false
EOF
    echo -e "${GREEN}✅ Fichier .env frontend créé${NC}"
fi

# Créer les dossiers nécessaires
echo -e "${YELLOW}📁 Création des dossiers...${NC}"
mkdir -p app/backend/database app/backend/uploads
echo -e "${GREEN}✅ Dossiers database et uploads créés${NC}"

# Vérifier les ports
echo -e "${YELLOW}🔌 Vérification des ports...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Port 3000 déjà utilisé (Frontend)${NC}"
fi
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Port 5000 déjà utilisé (Backend)${NC}"
fi

# Affichage des informations
echo ""
echo -e "${GREEN}🚀 Lancement des serveurs Fumotion...${NC}"
echo -e "   ${CYAN}📱 Frontend (React):     http://localhost:3000${NC}"
echo -e "   ${CYAN}🔧 Backend API (Express): http://localhost:5000${NC}"
echo -e "   ${CYAN}🩺 Health check:         http://localhost:5000/api/health${NC}"
echo -e "   ${CYAN}📋 API Documentation:    http://localhost:5000/${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   ${WHITE}[0] = Backend (Express.js + Node.js)${NC}"
echo -e "   ${WHITE}[1] = Frontend (React.js + Webpack)${NC}"
echo ""
echo -e "${YELLOW}⌨️ Contrôles:${NC}"
echo -e "   ${WHITE}Ctrl+C = Arrêter tous les serveurs${NC}"
echo -e "   ${WHITE}Les serveurs redémarrent automatiquement lors des modifications${NC}"
echo ""

# Fonction de nettoyage à l'arrêt
cleanup() {
    echo ""
    echo -e "${YELLOW}📴 Arrêt des serveurs Fumotion...${NC}"
    echo -e "${GREEN}✅ Serveurs arrêtés proprement${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Lancer les serveurs de développement
if ! npm run dev; then
    echo ""
    echo -e "${RED}❌ Erreur lors du lancement des serveurs${NC}"
    echo -e "${YELLOW}💡 Solutions possibles:${NC}"
    echo -e "   on...
📁 Création des dossiers...
✅ Dossiers database et uploads créés
🔌 Vérification des ports...${WHITE}- Vérifiez que les ports 3000 et 5000 sont libres${NC}"
    echo -e "   ${WHITE}- Relancez avec --force pour réinstaller les dépendances${NC}"
    echo -e "   ${WHITE}- Relancez avec --clean pour un nettoyage complet${NC}"
    exit 1
fi