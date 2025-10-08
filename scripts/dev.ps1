param(
    [switch]$Force,
    [switch]$Help,
    [switch]$Clean
)

if ($Help) {
    Write-Host "Usage: .\dev.ps1 [-Force] [-Help] [-Clean]" -ForegroundColor Green
    Write-Host "  -Force  : Force la réinstallation des dépendances"
    Write-Host "  -Clean  : Nettoie les node_modules avant installation"
    Write-Host "  -Help   : Affiche cette aide"
    exit 0
}

Write-Host "=== Fumotion Development Environment ===" -ForegroundColor Magenta
Write-Host "Démarrage de l'environnement de développement..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis la racine du projet Fumotion" -ForegroundColor Red
    exit 1
}

# Nettoyage si demandé
if ($Clean) {
    Write-Host "Nettoyage des dépendances..." -ForegroundColor Yellow
    if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
    if (Test-Path "app\backend\node_modules") { Remove-Item "app\backend\node_modules" -Recurse -Force }
    if (Test-Path "app\frontend\node_modules") { Remove-Item "app\frontend\node_modules" -Recurse -Force }
    if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
    if (Test-Path "app\backend\package-lock.json") { Remove-Item "app\backend\package-lock.json" -Force }
    if (Test-Path "app\frontend\package-lock.json") { Remove-Item "app\frontend\package-lock.json" -Force }
}

# Vérifier Node.js
Write-Host "Vérification des prérequis..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js non trouvé. Installez Node.js v16+ depuis https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Installer les dépendances
Write-Host "Vérification des dépendances..." -ForegroundColor Yellow

if ($Force -or -not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances racine (concurrently)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances racine" -ForegroundColor Red
        exit 1
    }
}

if ($Force -or -not (Test-Path "app\backend\node_modules")) {
    Write-Host "Installation des dépendances backend (Express.js, CORS)..." -ForegroundColor Cyan
    Push-Location "app\backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances backend" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

if ($Force -or -not (Test-Path "app\frontend\node_modules")) {
    Write-Host "Installation des dépendances frontend (React.js)..." -ForegroundColor Cyan
    Push-Location "app\frontend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances frontend" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# Créer les fichiers de configuration
Write-Host "Vérification de la configuration..." -ForegroundColor Yellow

if (-not (Test-Path "app\backend\.env")) {
    Write-Host "Création du fichier .env backend..." -ForegroundColor Cyan
    @"
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
"@ | Out-File -FilePath "app\backend\.env" -Encoding UTF8
    Write-Host "Fichier .env backend créé" -ForegroundColor Green
}

if (-not (Test-Path "app\frontend\.env")) {
    Write-Host "Création du fichier .env frontend..." -ForegroundColor Cyan
    @"
# Configuration Frontend Fumotion
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NAME=Fumotion
GENERATE_SOURCEMAP=false
"@ | Out-File -FilePath "app\frontend\.env" -Encoding UTF8
    Write-Host "Fichier .env frontend créé" -ForegroundColor Green
}

# Créer les dossiers nécessaires
Write-Host "Création des dossiers..." -ForegroundColor Yellow
if (-not (Test-Path "app\backend\database")) {
    New-Item -ItemType Directory -Path "app\backend\database" -Force | Out-Null
    Write-Host "Dossier database créé" -ForegroundColor Green
}
if (-not (Test-Path "app\backend\uploads")) {
    New-Item -ItemType Directory -Path "app\backend\uploads" -Force | Out-Null
    Write-Host "Dossier uploads créé" -ForegroundColor Green
}

# Vérifier les ports
Write-Host "Vérification des ports..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "Port 3000 déjà utilisé (Frontend)" -ForegroundColor Yellow
}
if ($port5000) {
    Write-Host "Port 5000 déjà utilisé (Backend)" -ForegroundColor Yellow
}

# Affichage des informations
Write-Host "" -ForegroundColor White
Write-Host "Lancement des serveurs Fumotion..." -ForegroundColor Green
Write-Host "   Frontend (React):     http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API (Express): http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Health check:         http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "   API Documentation:    http://localhost:5000/" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "   [0] = Backend (Express.js + Node.js)" -ForegroundColor White
Write-Host "   [1] = Frontend (React.js + Webpack)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Contrôles:" -ForegroundColor Yellow
Write-Host "   Ctrl+C = Arrêter tous les serveurs" -ForegroundColor White
Write-Host "   Les serveurs redémarrent automatiquement lors des modifications" -ForegroundColor White
Write-Host "" -ForegroundColor White

try {
    # Utiliser concurrently pour lancer backend et frontend
    npm run dev
} catch {
    Write-Host "" -ForegroundColor White
    Write-Host "Erreur lors du lancement des serveurs" -ForegroundColor Red
    Write-Host "Solutions possibles:" -ForegroundColor Yellow
    Write-Host "   - Vérifiez que les ports 3000 et 5000 sont libres" -ForegroundColor White
    Write-Host "   - Relancez avec -Force pour réinstaller les dépendances" -ForegroundColor White
    Write-Host "   - Relancez avec -Clean pour un nettoyage complet" -ForegroundColor White
    exit 1
}