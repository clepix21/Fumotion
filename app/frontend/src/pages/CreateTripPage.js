/**
 * Page de création de trajet
 * Permet au conducteur de publier un nouveau trajet avec carte interactive
 */
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { tripsAPI } from "../services/api"
import MapComponent, { AddressSearch } from "../components/common/MapComponent"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import { reverseGeocode, formatAddressShort } from "../utils/geocoding"
import "../styles/CreateTrip.css"
import "../styles/HomePage.css"
import ThemeToggle from "../components/common/ThemeToggle"


export default function CreateTripPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // États du formulaire
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // États de la carte
  const [mapCenter, setMapCenter] = useState([49.8942, 2.2957]) // Amiens par défaut
  const [markers, setMarkers] = useState([])                    // Marqueurs départ/arrivée
  const [selectingPoint, setSelectingPoint] = useState(null)    // 'departure' ou 'arrival'
  const [routeInfo, setRouteInfo] = useState(null)              // Distance et durée

  // Données du formulaire
  const [formData, setFormData] = useState({
    departure_location: "",
    arrival_location: "",
    departure_datetime: "",
    available_seats: 1,
    price_per_seat: "",
    description: "",
    departure_latitude: null,
    departure_longitude: null,
    arrival_latitude: null,
    arrival_longitude: null,
  })

  // Géolocalisation automatique au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.log("Géolocalisation non disponible:", error)
        }
      )
    }
  }, [])

  // Bloquer le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }

    // Cleanup au démontage du composant
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [mobileMenuOpen])

  // Mettre à jour les marqueurs quand les coordonnées changent
  useEffect(() => {
    const newMarkers = []

    if (formData.departure_latitude && formData.departure_longitude) {
      newMarkers.push({
        lat: formData.departure_latitude,
        lng: formData.departure_longitude,
        type: 'departure',
        popup: { title: 'Départ', description: formData.departure_location }
      })
    }

    if (formData.arrival_latitude && formData.arrival_longitude) {
      newMarkers.push({
        lat: formData.arrival_latitude,
        lng: formData.arrival_longitude,
        type: 'arrival',
        popup: { title: 'Arrivée', description: formData.arrival_location }
      })
    }

    setMarkers(newMarkers)
  }, [formData.departure_latitude, formData.departure_longitude, formData.arrival_latitude, formData.arrival_longitude, formData.departure_location, formData.arrival_location])

  // Handler pour la sélection d'adresse de départ via recherche
  const handleDepartureSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      departure_location: formatAddressShort(suggestion) || suggestion.display_name.split(',').slice(0, 2).join(','),
      departure_latitude: suggestion.lat,
      departure_longitude: suggestion.lng,
    }))
    setMapCenter([suggestion.lat, suggestion.lng])
  }

  // Handler pour la sélection d'adresse d'arrivée via recherche
  const handleArrivalSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      arrival_location: formatAddressShort(suggestion) || suggestion.display_name.split(',').slice(0, 2).join(','),
      arrival_latitude: suggestion.lat,
      arrival_longitude: suggestion.lng,
    }))
  }

  const validateForm = () => {
    if (!formData.departure_location.trim()) {
      setError("Veuillez saisir un lieu de départ")
      return false
    }
    if (!formData.arrival_location.trim()) {
      setError("Veuillez saisir un lieu d'arrivée")
      return false
    }
    if (!formData.departure_datetime) {
      setError("Veuillez sélectionner une date et heure de départ")
      return false
    }
    if (!formData.price_per_seat || parseFloat(formData.price_per_seat) <= 0) {
      setError("Veuillez saisir un prix valide (supérieur à 0)")
      return false
    }

    const localDate = new Date(formData.departure_datetime)
    if (isNaN(localDate.getTime())) {
      setError("Date invalide")
      return false
    }
    if (localDate <= new Date()) {
      setError("La date de départ doit être dans le futur")
      return false
    }

    const availableSeats = parseInt(formData.available_seats, 10)
    if (isNaN(availableSeats) || availableSeats < 1 || availableSeats > 8) {
      setError("Le nombre de places doit être entre 1 et 8")
      return false
    }

    const pricePerSeat = parseFloat(formData.price_per_seat)
    if (isNaN(pricePerSeat) || pricePerSeat <= 0) {
      setError("Le prix doit être un nombre positif")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const localDate = new Date(formData.departure_datetime)
      const departureDateTimeISO = localDate.toISOString()
      const availableSeats = parseInt(formData.available_seats, 10)
      const pricePerSeat = parseFloat(formData.price_per_seat)

      const tripData = {
        departureLocation: formData.departure_location.trim(),
        arrivalLocation: formData.arrival_location.trim(),
        departureDateTime: departureDateTimeISO,
        availableSeats: availableSeats,
        pricePerSeat: pricePerSeat,
        description: formData.description.trim() || null,
        departureLatitude: formData.departure_latitude,
        departureLongitude: formData.departure_longitude,
        arrivalLatitude: formData.arrival_latitude,
        arrivalLongitude: formData.arrival_longitude
      }

      const data = await tripsAPI.create(tripData)

      if (data.success) {
        // Réinitialiser le formulaire
        setFormData({
          departure_location: "",
          arrival_location: "",
          departure_datetime: "",
          available_seats: 1,
          price_per_seat: "",
          description: "",
          departure_latitude: null,
          departure_longitude: null,
          arrival_latitude: null,
          arrival_longitude: null,
        })
        setMarkers([])
        navigate("/dashboard")
      } else {
        const errorMessage = data.errors
          ? data.errors.map(err => err.msg || err.message).join('\n')
          : data.message || "Erreur lors de la création du trajet"
        setError(errorMessage)
      }
    } catch (error) {
      console.error("Erreur complète:", error)
      let errorMessage = "Erreur lors de la création du trajet"

      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.map(err => err.msg || err.message || JSON.stringify(err)).join('\n')
      } else if (error.data && error.data.errors && Array.isArray(error.data.errors)) {
        errorMessage = error.data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join('\n')
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null) // Effacer l'erreur quand l'utilisateur modifie
  }

  const handleMapClick = async (latlng) => {
    if (selectingPoint) {
      const { lat, lng } = latlng
      const pointType = selectingPoint // Sauvegarder la valeur avant de la réinitialiser

      // Désactiver immédiatement le mode sélection pour éviter les clics multiples
      setSelectingPoint(null)

      // Indiquer qu'on est en train de charger l'adresse
      const loadingText = 'Recherche de l\'adresse...'

      if (pointType === 'departure') {
        setFormData(prev => ({
          ...prev,
          departure_location: loadingText,
          departure_latitude: lat,
          departure_longitude: lng,
        }))
      } else if (pointType === 'arrival') {
        setFormData(prev => ({
          ...prev,
          arrival_location: loadingText,
          arrival_latitude: lat,
          arrival_longitude: lng,
        }))
      }

      // Récupérer l'adresse via géocodage inverse
      let geocodeResult = await reverseGeocode(lat, lng)
      console.log('handleMapClick geocodeResult:', geocodeResult)

      // Si le géocodage a échoué, réessayer une fois après un court délai
      if (!geocodeResult) {
        console.log('Geocode failed, retrying...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        geocodeResult = await reverseGeocode(lat, lng)
        console.log('Retry geocodeResult:', geocodeResult)
      }

      // Utiliser le formatage court de l'adresse
      let locationText = null

      if (geocodeResult) {
        locationText = formatAddressShort(geocodeResult)
        console.log('formatAddressShort result:', locationText)
      }

      // Fallback : utiliser display_name directement
      if (!locationText && geocodeResult && geocodeResult.display_name) {
        const parts = geocodeResult.display_name.split(',').map(p => p.trim())
        locationText = parts.slice(0, 2).join(', ')
      }

      // Fallback final avec les coordonnées
      if (!locationText) {
        locationText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }

      // Mettre à jour avec l'adresse finale
      if (pointType === 'departure') {
        setFormData(prev => ({
          ...prev,
          departure_location: locationText,
        }))
      } else if (pointType === 'arrival') {
        setFormData(prev => ({
          ...prev,
          arrival_location: locationText,
        }))
      }
    }
  }

  // Calcul des économies de CO2
  // Émissions moyennes: voiture seule = 120g CO2/km, covoiturage = divisé par nb personnes
  const calculateCO2Savings = (distanceKm, seats) => {
    if (!distanceKm || distanceKm <= 0) return null
    const co2PerKm = 120 // grammes de CO2 par km pour une voiture moyenne
    const totalCO2 = distanceKm * co2PerKm // CO2 total du trajet
    // Économie = CO2 que les passagers auraient émis s'ils avaient pris leur propre voiture
    const savedCO2 = totalCO2 * seats // CO2 économisé par les passagers
    return {
      totalKg: (totalCO2 / 1000).toFixed(2),
      savedKg: (savedCO2 / 1000).toFixed(2),
      savedTrees: (savedCO2 / 21000).toFixed(2), // Un arbre absorbe ~21kg CO2/an
    }
  }

  // Callback quand la route est calculée
  const handleRouteCalculated = (info) => {
    setRouteInfo(info)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="create-trip-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Fumotion" className="brand-logo" />
            <span className="brand-name">Fumotion</span>
          </div>

          <div className="navbar-theme-toggle hide-mobile" style={{ marginLeft: 'auto', marginRight: '1rem' }}>
            <ThemeToggle />
          </div>


          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Menu desktop */}
          <div className="navbar-menu navbar-menu-desktop">
            <a href="/search" className="navbar-link">
              Rechercher
            </a>
            <div className="navbar-divider"></div>
            <button onClick={() => navigate("/create-trip")} className="navbar-btn-primary">
              Créer un trajet
            </button>
            <div className="navbar-user-profile" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
              <Avatar user={user} size="medium" />
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.first_name || user?.email}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="navbar-btn-logout">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile - en dehors de la navbar */}
      {mobileMenuOpen && (
        <>
          <div
            className="navbar-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="navbar-menu-mobile">
            <button
              className="navbar-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              ✕
            </button>

            <div className="navbar-mobile-theme-item show-mobile-only" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Mode sombre</span>
              <ThemeToggle />
            </div>


            <a href="/search" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Rechercher
            </a>
            <div className="navbar-divider"></div>
            <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
              Créer un trajet
            </button>
            {user?.is_admin && (
              <button onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }} className="navbar-btn-admin">
                👑 Admin
              </button>
            )}
            <div className="navbar-user-profile" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
              <Avatar user={user} size="medium" />
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.first_name || user?.email}</span>
              </div>
            </div>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
              Déconnexion
            </button>
          </div>
        </>
      )
      }

      <main className="create-trip-main">
        <div className="create-trip-container">
          {/* Formulaire principal */}
          <div className="create-trip-card">
            <div className="trip-header">
              <h1>Proposer un trajet</h1>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="trip-form">
              {/* Section Itinéraire */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-icon">📍</span>
                  <h2>Itinéraire</h2>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Lieu de départ
                  </label>
                  <div className="address-input-group">
                    <AddressSearch
                      value={formData.departure_location}
                      onChange={(value) => setFormData(prev => ({ ...prev, departure_location: value }))}
                      onSelect={handleDepartureSelect}
                      placeholder="Rechercher une adresse de départ..."
                    />
                    <button
                      type="button"
                      onClick={() => setSelectingPoint(selectingPoint === 'departure' ? null : 'departure')}
                      className={`map-select-btn ${selectingPoint === 'departure' ? 'active' : ''}`}
                      title="Sélectionner sur la carte"
                    >
                      {selectingPoint === 'departure' ? '✕' : '🗺️'}
                    </button>
                  </div>
                  {formData.departure_latitude && (
                    <small className="coordinates-info">
                      ✓ Position: {formData.departure_latitude.toFixed(4)}, {formData.departure_longitude.toFixed(4)}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Lieu d'arrivée
                  </label>
                  <div className="address-input-group">
                    <AddressSearch
                      value={formData.arrival_location}
                      onChange={(value) => setFormData(prev => ({ ...prev, arrival_location: value }))}
                      onSelect={handleArrivalSelect}
                      placeholder="Rechercher une adresse d'arrivée..."
                    />
                    <button
                      type="button"
                      onClick={() => setSelectingPoint(selectingPoint === 'arrival' ? null : 'arrival')}
                      className={`map-select-btn ${selectingPoint === 'arrival' ? 'active' : ''}`}
                      title="Sélectionner sur la carte"
                    >
                      {selectingPoint === 'arrival' ? '✕' : '🗺️'}
                    </button>
                  </div>
                  {formData.arrival_latitude && (
                    <small className="coordinates-info">
                      ✓ Position: {formData.arrival_latitude.toFixed(4)}, {formData.arrival_longitude.toFixed(4)}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Carte interactive
                    {selectingPoint && (
                      <span className="selection-mode-indicator">
                        Mode sélection {selectingPoint === 'departure' ? 'départ' : 'arrivée'} actif
                      </span>
                    )}
                  </label>
                  <div className={`map-container ${selectingPoint ? 'selection-mode' : ''}`}>
                    <MapComponent
                      center={mapCenter}
                      zoom={13}
                      markers={markers}
                      onMapClick={handleMapClick}
                      height="350px"
                      interactive={true}
                      showRoute={true}
                      onRouteCalculated={handleRouteCalculated}
                    />
                    {selectingPoint && (
                      <div className="map-overlay-hint">
                        <div className="hint-content">
                          <span className="hint-icon">👇</span>
                          <p>Cliquez sur la carte pour sélectionner le point de {selectingPoint === 'departure' ? 'départ' : 'arrivée'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Affichage de l'économie CO2 */}
                  {routeInfo && routeInfo.distance > 0 && (
                    <div className="eco-impact-card">
                      <div className="eco-impact-header">
                        <span className="eco-icon">🌱</span>
                        <h4>Impact écologique du covoiturage</h4>
                      </div>
                      <div className="eco-stats">
                        <div className="eco-stat">
                          <span className="eco-stat-value">{routeInfo.distance} km</span>
                          <span className="eco-stat-label">Distance</span>
                        </div>
                        <div className="eco-stat">
                          <span className="eco-stat-value">{routeInfo.duration} min</span>
                          <span className="eco-stat-label">Durée estimée</span>
                        </div>
                        <div className="eco-stat highlight">
                          <span className="eco-stat-value">
                            {calculateCO2Savings(routeInfo.distance, parseInt(formData.available_seats) || 1)?.savedKg || '0'} kg
                          </span>
                          <span className="eco-stat-label">CO₂ économisé</span>
                        </div>
                      </div>
                      <div className="eco-message">
                        <span className="eco-tree">🌳</span>
                        <p>
                          En partageant ce trajet avec <strong>{formData.available_seats} passager{parseInt(formData.available_seats) > 1 ? 's' : ''}</strong>,
                          vous économisez l'équivalent de <strong>{calculateCO2Savings(routeInfo.distance, parseInt(formData.available_seats) || 1)?.savedTrees || '0'}</strong> arbres
                          absorbant du CO₂ pendant un an !
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="departure_datetime" className="form-label">
                    Date et heure de départ
                  </label>
                  <input
                    type="datetime-local"
                    id="departure_datetime"
                    name="departure_datetime"
                    value={formData.departure_datetime}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Section Détails */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-icon">⚙️</span>
                  <h2>Détails du trajet</h2>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="available_seats" className="form-label">
                      Places disponibles
                    </label>
                    <select
                      id="available_seats"
                      name="available_seats"
                      value={formData.available_seats}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="1">1 place</option>
                      <option value="2">2 places</option>
                      <option value="3">3 places</option>
                      <option value="4">4 places</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="price_per_seat" className="form-label">
                      Prix par place (€)
                    </label>
                    <input
                      type="number"
                      id="price_per_seat"
                      name="price_per_seat"
                      value={formData.price_per_seat}
                      onChange={handleChange}
                      placeholder="5.00"
                      step="0.50"
                      min="0"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description (optionnel)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ajoutez des informations supplémentaires sur votre trajet (point de rendez-vous, bagages, etc.)"
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Publication en cours...
                    </>
                  ) : (
                    "Publier le trajet"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar avec conseils */}
          <aside className="tips-sidebar">
            <div className="tips-card">
              <h3>💡 Conseils pour un bon trajet</h3>
              <ul className="tips-list">
                <li>
                  <span className="tip-icon">✓</span>
                  <span>Indiquez un point de rendez-vous précis et facile à trouver</span>
                </li>
                <li>
                  <span className="tip-icon">✓</span>
                  <span>Fixez un prix équitable qui couvre vos frais d'essence</span>
                </li>
                <li>
                  <span className="tip-icon">✓</span>
                  <span>Ajoutez des détails utiles (bagages, animaux, arrêts possibles)</span>
                </li>
                <li>
                  <span className="tip-icon">✓</span>
                  <span>Soyez ponctuel et communiquez avec vos passagers</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div >
  )
}
