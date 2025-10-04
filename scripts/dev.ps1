# Script de développement pour Fumotion (Windows PowerShell)
# Lance le backend et frontend en mode développement

param(
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\dev.ps1 [-Force] [-Help]" -ForegroundColor Green
    Write-Host "  -Force  : Force la réinstallation des dépendances"
    Write-Host "  -Help   : Affiche cette aide"
    exit 0
}

Write-Host "Demarrage de l'environnement de developpement Fumotion..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit etre execute depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
Write-Host "Verification des dependances..." -ForegroundColor Yellow

if ($Force -or -not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances racine..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dependances racine" -ForegroundColor Red
        exit 1
    }
}

if ($Force -or -not (Test-Path "app\backend\node_modules")) {
    Write-Host "Installation des dependances backend..." -ForegroundColor Cyan
    Push-Location "app\backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dependances backend" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

if ($Force -or -not (Test-Path "app\frontend\node_modules")) {
    Write-Host "Installation des dependances frontend..." -ForegroundColor Cyan
    Push-Location "app\frontend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dependances frontend" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# Créer les fichiers .env s'ils n'existent pas
Write-Host "Verification de la configuration..." -ForegroundColor Yellow

if (-not (Test-Path "app\backend\.env")) {
    Write-Host "Creation du fichier .env backend..." -ForegroundColor Cyan
    @"
PORT=5000
JWT_SECRET=fumotion_secret_key_change_in_production_2025
DB_PATH=./database/fumotion.db
NODE_ENV=development
"@ | Out-File -FilePath "app\backend\.env" -Encoding UTF8
}

if (-not (Test-Path "app\frontend\.env")) {
    Write-Host "Creation du fichier .env frontend..." -ForegroundColor Cyan
    "REACT_APP_API_URL=http://localhost:5000" | Out-File -FilePath "app\frontend\.env" -Encoding UTF8
}

# Vérifier que la base de données peut être créée
Write-Host "Verification de la base de donnees..." -ForegroundColor Yellow
if (-not (Test-Path "app\backend\database")) {
    New-Item -ItemType Directory -Path "app\backend\database" -Force | Out-Null
}

# Lancer les serveurs de développement
Write-Host "" -ForegroundColor White
Write-Host "Lancement des serveurs..." -ForegroundColor Green
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   Health check: http://localhost:5000/api/health" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Utilisez Ctrl+C pour arreter les serveurs" -ForegroundColor Yellow
Write-Host "Les serveurs se relancent automatiquement en cas de modification" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

try {
    # Utiliser concurrently pour lancer backend et frontend
    npm run dev
} catch {
    Write-Host "Erreur lors du lancement des serveurs" -ForegroundColor Red
    Write-Host "Verifiez que les ports 3000 et 5000 sont libres" -ForegroundColor Yellow
    exit 1
}