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

Write-Host "Démarrage de l'environnement de développement Fumotion..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
Write-Host "Vérification des dépendances..." -ForegroundColor Yellow

if ($Force -or -not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances racine..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances racine" -ForegroundColor Red
        exit 1
    }
}

if ($Force -or -not (Test-Path "app\backend\node_modules")) {
    Write-Host "Installation des dépendances backend..." -ForegroundColor Cyan
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
    Write-Host "Installation des dépendances frontend..." -ForegroundColor Cyan
    Push-Location "app\frontend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances frontend" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# Créer les fichiers .env s'ils n'existent pas
Write-Host "Vérification de la configuration..." -ForegroundColor Yellow

if (-not (Test-Path "app\backend\.env") -and (Test-Path ".env.example")) {
    Write-Host "Création du fichier .env backend depuis .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" "app\backend\.env"
}

if (-not (Test-Path "app\frontend\.env")) {
    Write-Host "Création du fichier .env frontend..." -ForegroundColor Cyan
    "REACT_APP_API_URL=http://localhost:5000" | Out-File -FilePath "app\frontend\.env" -Encoding UTF8
}

# Lancer les serveurs de développement
Write-Host "" -ForegroundColor White
Write-Host "Lancement des serveurs..." -ForegroundColor Green
Write-Host "  - Backend: http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Utilisez Ctrl+C pour arrêter les serveurs" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

# Utiliser concurrently pour lancer backend et frontend
npm run dev