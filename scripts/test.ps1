# Script de test pour vérifier que Fumotion fonctionne correctement
# Teste les endpoints principaux de l'API

param(
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$Verbose
)

Write-Host "🧪 Test de l'API Fumotion" -ForegroundColor Green
Write-Host "📡 URL de base: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

# Fonction pour faire des requêtes HTTP
function Invoke-ApiTest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "🔍 Test: $Description" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ Succès" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "   📄 Réponse: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        }
        
        return $response
    } catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Variables globales pour les tests
$global:testToken = $null
$global:testUserId = $null
$global:testTripId = $null

Write-Host "🔍 Tests de base" -ForegroundColor Magenta

# Test 1: Health check
$health = Invoke-ApiTest -Url "$BaseUrl/api/health" -Description "Health check de l'API"

if (-not $health) {
    Write-Host "❌ L'API n'est pas accessible. Vérifiez que le serveur backend est démarré." -ForegroundColor Red
    exit 1
}

# Test 2: Page d'accueil de l'API
$home = Invoke-ApiTest -Url "$BaseUrl/" -Description "Page d'accueil de l'API"

Write-Host ""
Write-Host "🔐 Tests d'authentification" -ForegroundColor Magenta

# Test 3: Inscription d'un utilisateur de test
$testUser = @{
    firstName = "Test"
    lastName = "User"
    email = "test.$(Get-Random)@fumotion.test"
    phone = "0123456789"
    studentId = "TEST123"
    password = "testpass123"
} | ConvertTo-Json

$registerResponse = Invoke-ApiTest -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $testUser -Description "Inscription d'un utilisateur de test"

if ($registerResponse -and $registerResponse.success) {
    $global:testToken = $registerResponse.data.token
    $global:testUserId = $registerResponse.data.user.id
    Write-Host "   📝 Token obtenu pour les tests suivants" -ForegroundColor Cyan
}

# Test 4: Vérification du token
if ($global:testToken) {
    $headers = @{ "Authorization" = "Bearer $global:testToken" }
    $profile = Invoke-ApiTest -Url "$BaseUrl/api/auth/verify-token" -Headers $headers -Description "Vérification du token"
}

Write-Host ""
Write-Host "🚗 Tests des trajets" -ForegroundColor Magenta

# Test 5: Création d'un trajet de test
if ($global:testToken) {
    $testTrip = @{
        departureLocation = "Amiens, IUT"
        arrivalLocation = "Paris, Châtelet"
        departureDateTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
        availableSeats = 3
        pricePerSeat = 15.50
        description = "Trajet de test - retour weekend"
    } | ConvertTo-Json
    
    $headers = @{ "Authorization" = "Bearer $global:testToken" }
    $tripResponse = Invoke-ApiTest -Url "$BaseUrl/api/trips" -Method "POST" -Headers $headers -Body $testTrip -Description "Création d'un trajet de test"
    
    if ($tripResponse -and $tripResponse.success) {
        $global:testTripId = $tripResponse.data.id
    }
}

# Test 6: Recherche de trajets
$searchResponse = Invoke-ApiTest -Url "$BaseUrl/api/trips/search?departure=Amiens&arrival=Paris" -Description "Recherche de trajets (Amiens → Paris)"

# Test 7: Récupération d'un trajet spécifique
if ($global:testTripId) {
    $tripDetails = Invoke-ApiTest -Url "$BaseUrl/api/trips/$global:testTripId" -Description "Récupération des détails d'un trajet"
}

Write-Host ""
Write-Host "🎫 Tests des réservations" -ForegroundColor Magenta

# Test 8: Récupération des trajets de l'utilisateur
if ($global:testToken) {
    $headers = @{ "Authorization" = "Bearer $global:testToken" }
    $myTrips = Invoke-ApiTest -Url "$BaseUrl/api/trips" -Headers $headers -Description "Récupération de mes trajets"
}

# Test 9: Récupération de mes réservations
if ($global:testToken) {
    $headers = @{ "Authorization" = "Bearer $global:testToken" }
    $myBookings = Invoke-ApiTest -Url "$BaseUrl/api/bookings" -Headers $headers -Description "Récupération de mes réservations"
}

Write-Host ""
Write-Host "📊 Résumé des tests" -ForegroundColor Green

# Compter les tests réussis
$totalTests = 9
$successfulTests = 0

if ($health) { $successfulTests++ }
if ($home) { $successfulTests++ }
if ($registerResponse -and $registerResponse.success) { $successfulTests++ }
if ($profile) { $successfulTests++ }
if ($tripResponse -and $tripResponse.success) { $successfulTests++ }
if ($searchResponse) { $successfulTests++ }
if ($tripDetails) { $successfulTests++ }
if ($myTrips) { $successfulTests++ }
if ($myBookings) { $successfulTests++ }

$percentage = [math]::Round(($successfulTests / $totalTests) * 100, 1)

Write-Host ""
Write-Host "🎯 Tests réussis: $successfulTests/$totalTests ($percentage%)" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 60) { "Yellow" } else { "Red" })

if ($percentage -eq 100) {
    Write-Host "🎉 Excellent ! Toutes les fonctionnalités de base fonctionnent correctement." -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "✅ Très bien ! La plupart des fonctionnalités fonctionnent." -ForegroundColor Yellow
} elseif ($percentage -ge 60) {
    Write-Host "⚠️  Correct, mais quelques problèmes à résoudre." -ForegroundColor Yellow
} else {
    Write-Host "❌ Des problèmes importants ont été détectés." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Pour tester l'interface utilisateur:" -ForegroundColor Cyan
Write-Host "   🌐 Ouvrez http://localhost:3000 dans votre navigateur" -ForegroundColor White
Write-Host "   👤 Créez un compte ou utilisez: admin@fumotion.com / admin123" -ForegroundColor White
Write-Host ""