import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { tripsAPI } from "../services/api"
import MapComponent, { AddressSearch } from "../components/common/MapComponent"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import { reverseGeocode, formatAddressShort } from "../utils/geocoding"
import "../styles/CreateTrip.css"
import "../styles/HomePage.css"

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState([49.8942, 2.2957]) // Amiens par défaut
  const [markers, setMarkers] = useState([])
  const [selectingPoint, setSelectingPoint] = useState(null) // 'departure' ou 'arrival'
  const geocodeTimeoutRef = useRef(null)
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

  useEffect(() => {
    // Géolocalisation automatique au chargement
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

  // Géocoder les adresses quand elles changent
  useEffect(() => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current)
    }

    geocodeTimeoutRef.current = setTimeout(async () => {
      const newMarkers = []
      const loadingText = 'Recherche de l\'adresse...'

      if (formData.departure_location.trim() && formData.departure_location !== loadingText) {
        const geo = await geocodeAddress(formData.departure_location)
        if (geo) {
          setFormData(prev => ({
            ...prev,
            departure_latitude: geo.lat,
            departure_longitude: geo.lng,
          }))
          newMarkers.push({
            lat: geo.lat,
            lng: geo.lng,
            type: 'departure',
            popup: { title: 'Départ', description: formData.departure_location }
          })
          setMapCenter([geo.lat, geo.lng])
        }
      }

      if (formData.arrival_location.trim() && formData.arrival_location !== loadingText) {
        const geo = await geocodeAddress(formData.arrival_location)
        if (geo) {
          setFormData(prev => ({
            ...prev,
            arrival_latitude: geo.lat,
            arrival_longitude: geo.lng,
          }))
          newMarkers.push({
            lat: geo.lat,
            lng: geo.lng,
            type: 'arrival',
            popup: { title: 'Arrivée', description: formData.arrival_location }
          })
        }
      }

      setMarkers(newMarkers)
    }, 1000) // Délai de 1 seconde après la saisie

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current)
      }
    }
  }, [formData.departure_location, formData.arrival_location])

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
      const geocodeResult = await reverseGeocode(lat, lng)

      // Utiliser le formatage court de l'adresse
      let locationText = formatAddressShort(geocodeResult)

      if (!locationText) {
        locationText = `Localisation : ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }

      // Si le géocodage a échoué, réessayer une fois après un court délai
      if (!geocodeResult || !geocodeResult.address) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryResult = await reverseGeocode(lat, lng)
        if (retryResult) {
          locationText = formatAddressShort(retryResult) || locationText
        }
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

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="/search" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Rechercher
            </a>
            <div className="navbar-divider"></div>
            <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
              Tableau de bord
            </button>
            <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
              Créer un trajet
            </button>
            {user?.is_admin && (
              <button onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }} className="navbar-btn-admin">
                👑 Admin
              </button>
            )}
            <div className="navbar-user-profile">
              <Avatar user={user} size="medium" />
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.first_name || user?.email}</span>
              </div>
            </div>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="create-trip-main">
        {/* Header avec breadcrumb */}
        <div className="page-header">
          <div className="header-content">
            <Link to="/dashboard" className="back-link">
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>

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
                  <label htmlFor="departure_location" className="form-label">
                    Lieu de départ
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="departure_location"
                      name="departure_location"
                      value={formData.departure_location}
                      onChange={handleChange}
                      placeholder="Ex: Amiens, Gare SNCF"
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectingPoint(selectingPoint === 'departure' ? null : 'departure')}
                      className={`map-select-btn ${selectingPoint === 'departure' ? 'active' : ''}`}
                    >
                      {selectingPoint === 'departure' ? 'Annuler' : '📍 Carte'}
                    </button>
                  </div>
                  {selectingPoint === 'departure' && (
                    <small className="helper-text">
                      Cliquez sur la carte pour sélectionner le point de départ
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="arrival_location" className="form-label">
                    Lieu d'arrivée
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="arrival_location"
                      name="arrival_location"
                      value={formData.arrival_location}
                      onChange={handleChange}
                      placeholder="Ex: IUT Amiens"
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectingPoint(selectingPoint === 'arrival' ? null : 'arrival')}
                      className={`map-select-btn ${selectingPoint === 'arrival' ? 'active' : ''}`}
                    >
                      {selectingPoint === 'arrival' ? 'Annuler' : '📍 Carte'}
                    </button>
                  </div>
                  {selectingPoint === 'arrival' && (
                    <small className="helper-text">
                      Cliquez sur la carte pour sélectionner le point d'arrivée
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
                      height="300px"
                      interactive={true}
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
    </div>
  )
}
