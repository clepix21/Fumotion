import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { tripsAPI } from "../services/api"
import "../styles/CreateTrip.css"
import "../styles/HomePage.css"

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    departure_location: "",
    arrival_location: "",
    departure_datetime: "",
    available_seats: 1,
    price_per_seat: "",
    description: "",
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }
  }, [navigate, isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation côté client
      if (!formData.departure_location.trim()) {
        alert("Veuillez saisir un lieu de départ")
        setLoading(false)
        return
      }
      if (!formData.arrival_location.trim()) {
        alert("Veuillez saisir un lieu d'arrivée")
        setLoading(false)
        return
      }
      if (!formData.departure_datetime) {
        alert("Veuillez sélectionner une date et heure de départ")
        setLoading(false)
        return
      }
      if (!formData.price_per_seat || parseFloat(formData.price_per_seat) <= 0) {
        alert("Veuillez saisir un prix valide (supérieur à 0)")
        setLoading(false)
        return
      }

      // Convertir la date : datetime-local retourne "YYYY-MM-DDTHH:mm" (sans timezone)
      // On doit la convertir en ISO8601 avec timezone
      let departureDateTimeISO = null
      if (formData.departure_datetime) {
        // datetime-local retourne "YYYY-MM-DDTHH:mm" (sans timezone)
        // On crée une date en utilisant le format local
        // Note: new Date() avec datetime-local interprète la date comme locale
        const dateString = formData.departure_datetime
        // Si le format est "YYYY-MM-DDTHH:mm", on l'utilise directement
        // Sinon on crée une date locale
        const localDate = new Date(dateString)
        
        // Vérifier que la date est valide
        if (isNaN(localDate.getTime())) {
          alert("Date invalide")
          setLoading(false)
          return
        }
        
        // Vérifier que la date est dans le futur
        if (localDate <= new Date()) {
          alert("La date de départ doit être dans le futur")
          setLoading(false)
          return
        }
        
        // Convertir en ISO8601 (UTC)
        departureDateTimeISO = localDate.toISOString()
      }

      // Convertir les nombres
      const availableSeats = parseInt(formData.available_seats, 10)
      const pricePerSeat = parseFloat(formData.price_per_seat)
      
      // Vérifier que les conversions sont valides
      if (isNaN(availableSeats) || availableSeats < 1 || availableSeats > 8) {
        alert("Le nombre de places doit être entre 1 et 8")
        setLoading(false)
        return
      }
      
      if (isNaN(pricePerSeat) || pricePerSeat <= 0) {
        alert("Le prix doit être un nombre positif")
        setLoading(false)
        return
      }

      // Convertir les données du formulaire au format attendu par le backend (camelCase)
      const tripData = {
        departureLocation: formData.departure_location.trim(),
        arrivalLocation: formData.arrival_location.trim(),
        departureDateTime: departureDateTimeISO,
        availableSeats: availableSeats,
        pricePerSeat: pricePerSeat,
        description: formData.description.trim() || null,
        // Les coordonnées GPS sont optionnelles pour l'instant
        departureLatitude: null,
        departureLongitude: null,
        arrivalLatitude: null,
        arrivalLongitude: null
      }

      console.log("Données envoyées:", tripData)
      console.log("Date ISO:", departureDateTimeISO)

      const data = await tripsAPI.create(tripData)

      if (data.success) {
        alert("Trajet créé avec succès!")
        // Réinitialiser le formulaire
        setFormData({
          departure_location: "",
          arrival_location: "",
          departure_datetime: "",
          available_seats: 1,
          price_per_seat: "",
          description: "",
        })
        navigate("/dashboard")
      } else {
        // Afficher les erreurs de validation si disponibles
        const errorMessage = data.errors 
          ? data.errors.map(err => err.msg || err.message).join('\n')
          : data.message || "Erreur lors de la création du trajet"
        alert(errorMessage)
      }
    } catch (error) {
      console.error("Erreur complète:", error)
      console.error("Détails de l'erreur:", error.data)
      
      // Essayer de récupérer les détails de l'erreur
      let errorMessage = "Erreur lors de la création du trajet"
      
      // Si l'erreur contient des détails de validation
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.map(err => err.msg || err.message || JSON.stringify(err)).join('\n')
      } else if (error.data && error.data.errors && Array.isArray(error.data.errors)) {
        errorMessage = error.data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join('\n')
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
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
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="create-trip-page">
      {/* Navbar - Moderne et Professionnelle */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <span className="brand-logo">🚗</span>
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
            <span className="navbar-user">
              {user?.first_name || user?.email}
            </span>
            <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
              Tableau de bord
            </button>
            <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
              Créer un trajet
            </button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="create-trip-main">
        <div className="create-trip-container">
          <div className="form-header">
            <h1>Proposer un trajet</h1>
            <p>Partagez votre trajet et vos frais avec d'autres étudiants</p>
          </div>

          <form onSubmit={handleSubmit} className="trip-form">
            <div className="form-section">
              <h2>Itinéraire</h2>

              <div className="form-group">
                <label htmlFor="departure_location">
                  <span className="label-icon">📍</span>
                  Lieu de départ
                </label>
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
              </div>

              <div className="form-group">
                <label htmlFor="arrival_location">
                  <span className="label-icon">🎯</span>
                  Lieu d'arrivée
                </label>
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
              </div>

              <div className="form-group">
                <label htmlFor="departure_datetime">
                  <span className="label-icon">📅</span>
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

            <div className="form-section">
              <h2>Détails du trajet</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="available_seats">
                    <span className="label-icon">👥</span>
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
                  <label htmlFor="price_per_seat">
                    <span className="label-icon">💰</span>
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
                <label htmlFor="description">
                  <span className="label-icon">📝</span>
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ajoutez des informations supplémentaires sur votre trajet..."
                  rows="4"
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Création..." : "Publier le trajet"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
