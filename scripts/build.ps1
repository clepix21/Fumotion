# Script de build de production pour Fumotion (Windows PowerShell)
# Build le frontend et prépare le backend pour la production

param(
    [switch]$SkipTests,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\build.ps1 [-SkipTests] [-Help]" -ForegroundColor Green
    Write-Host "  -SkipTests : Ignore l'exécution des tests"
    Write-Host "  -Help      : Affiche cette aide"
    exit 0
}

Write-Host "Build de production Fumotion..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Nettoyer les builds précédents
Write-Host "Nettoyage des builds précédents..." -ForegroundColor Yellow
if (Test-Path "app\frontend\build") { Remove-Item "app\frontend\build" -Recurse -Force }
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
New-Item -ItemType Directory -Path "dist" -Force | Out-Null

# Installer les dépendances
Write-Host "Installation des dépendances..." -ForegroundColor Yellow

Write-Host "  - Dépendances racine..." -ForegroundColor Cyan
npm ci --only=production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dépendances racine" -ForegroundColor Red
    exit 1
}

Write-Host "  - Dépendances backend..." -ForegroundColor Cyan
Push-Location "app\backend"
npm ci --only=production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dépendances backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "  - Dépendances frontend..." -ForegroundColor Cyan
Push-Location "app\frontend"
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dépendances frontend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Lancer les tests
if (-not $SkipTests) {
    Write-Host "Exécution des tests..." -ForegroundColor Yellow
    
    Write-Host "  - Tests frontend..." -ForegroundColor Cyan
    Push-Location "app\frontend"
    npm test -- --coverage --watchAll=false --passWithNoTests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tests frontend échoués" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location

    Write-Host "  - Tests backend (si disponibles)..." -ForegroundColor Cyan
    Push-Location "app\backend"
    npm test --if-present -- --passWithNoTests
    Pop-Location
}

# Build du frontend
Write-Host "⚛️ Build du frontend React..." -ForegroundColor Yellow
Push-Location "app\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build frontend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Copier les fichiers pour la production
Write-Host "Préparation des fichiers de production..." -ForegroundColor Yellow

# Copier le backend
Copy-Item "app\backend" "dist\" -Recurse -Force
# Nettoyer les dev dependencies du backend copié
Push-Location "dist\backend"
npm ci --only=production
Pop-Location

# Copier le build frontend
Copy-Item "app\frontend\build" "dist\frontend" -Recurse -Force

# Copier les fichiers de configuration
Copy-Item "package.json" "dist\" -Force -ErrorAction SilentlyContinue
Copy-Item "README.md" "dist\" -Force -ErrorAction SilentlyContinue
Copy-Item ".env.example" "dist\" -Force -ErrorAction SilentlyContinue

# Créer un package.json simplifié pour la production
$productionPackageJson = @"
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
"@
$productionPackageJson | Out-File -FilePath "dist\package.json" -Encoding UTF8

# Créer le fichier de démarrage PowerShell
$startScript = @"
# Script de démarrage Fumotion (Production)
Write-Host "Démarrage de Fumotion en production..." -ForegroundColor Green
Write-Host "Installation des dépendances..." -ForegroundColor Yellow
npm run install-deps
if (`$LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}
Write-Host "Lancement du serveur..." -ForegroundColor Green
npm start
"@
$startScript | Out-File -FilePath "dist\start.ps1" -Encoding UTF8

# Créer un Dockerfile de base
$dockerfile = @"
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
"@
$dockerfile | Out-File -FilePath "dist\Dockerfile" -Encoding UTF8

Write-Host "Build de production terminé !" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Fichiers générés dans .\dist\" -ForegroundColor White
Write-Host "Pour démarrer en production:" -ForegroundColor White
Write-Host "   cd dist" -ForegroundColor Cyan
Write-Host "   .\start.ps1" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Pour build Docker:" -ForegroundColor White
Write-Host "   cd dist" -ForegroundColor Cyan
Write-Host "   docker build -t fumotion ." -ForegroundColor Cyan
Write-Host "   docker run -p 5000:5000 fumotion" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

# Afficher la taille du build
$distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Taille du build: $([math]::Round($distSize, 2)) MB" -ForegroundColor Yellow