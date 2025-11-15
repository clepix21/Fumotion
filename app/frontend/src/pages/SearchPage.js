import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { tripsAPI, bookingsAPI } from "../services/api"
import "../styles/Search.css"
import "../styles/HomePage.css"

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParamsURL] = useSearchParams()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchParams, setSearchParams] = useState({
    departure: "",
    arrival: "",
    date: "",
    passengers: 1,
  })
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Charger les paramètres depuis l'URL si présents
  useEffect(() => {
    const departure = searchParamsURL.get("departure") || ""
    const arrival = searchParamsURL.get("arrival") || ""
    const date = searchParamsURL.get("date") || ""
    const passengers = parseInt(searchParamsURL.get("passengers") || "1", 10)

    if (departure || arrival || date) {
      setSearchParams({
        departure,
        arrival,
        date,
        passengers,
      })
      // Lancer la recherche automatiquement si des paramètres sont présents
      handleSearchFromParams({ departure, arrival, date, passengers })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsURL])

  const handleSearchFromParams = async (params) => {
    setLoading(true)
    setSearched(true)
    setError(null)

    try {
      const searchQuery = {}
      if (params.departure) searchQuery.departure = params.departure
      if (params.arrival) searchQuery.arrival = params.arrival
      if (params.date) searchQuery.date = params.date
      if (params.passengers) searchQuery.passengers = params.passengers

      const data = await tripsAPI.search(searchQuery)

      if (data.success && data.data) {
        setTrips(data.data.trips || [])
      } else {
        setTrips([])
        setError(data.message || "Aucun trajet trouvé")
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      setTrips([])
      setError(error.message || "Erreur lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    setError(null)

    try {
      const searchQuery = {}
      if (searchParams.departure.trim()) {
        searchQuery.departure = searchParams.departure.trim()
      }
      if (searchParams.arrival.trim()) {
        searchQuery.arrival = searchParams.arrival.trim()
      }
      if (searchParams.date) {
        searchQuery.date = searchParams.date
      }
      if (searchParams.passengers) {
        searchQuery.passengers = searchParams.passengers
      }

      const data = await tripsAPI.search(searchQuery)

      if (data.success && data.data) {
        setTrips(data.data.trips || [])
        if (data.data.trips && data.data.trips.length === 0) {
          setError("Aucun trajet trouvé pour ces critères")
        }
      } else {
        setTrips([])
        setError(data.message || "Aucun trajet trouvé")
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      setTrips([])
      setError(error.message || "Erreur lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (tripId) => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    const seats = prompt("Combien de places souhaitez-vous réserver ?", "1")
    if (!seats || isNaN(seats) || parseInt(seats, 10) < 1) {
      return
    }

    const seatsNumber = parseInt(seats, 10)

    try {
      const data = await bookingsAPI.create(tripId, {
        seatsBooked: seatsNumber,
      })

      if (data.success) {
        alert("Réservation effectuée avec succès!")
        // Recharger les résultats de recherche
        handleSearch({ preventDefault: () => {} })
      } else {
        alert(data.message || "Erreur lors de la réservation")
      }
    } catch (error) {
      console.error("Erreur:", error)
      const errorMessage = error.message || "Erreur lors de la réservation"
      alert(errorMessage)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="search-page">
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
            {isAuthenticated() ? (
              <>
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
              </>
            ) : (
              <>
                <div className="navbar-divider"></div>
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
                  Connexion
                </button>
                <button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                  Inscription
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="search-main">
        <div className="search-container">
          <div className="search-header">
            <h1>Rechercher un trajet</h1>
            <p>Trouvez le covoiturage parfait pour vos déplacements</p>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departure">
                  <span className="label-icon">📍</span>
                  Départ
                </label>
                <input
                  type="text"
                  id="departure"
                  value={searchParams.departure}
                  onChange={(e) => setSearchParams({ ...searchParams, departure: e.target.value })}
                  placeholder="Ville de départ"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="arrival">
                  <span className="label-icon">🎯</span>
                  Arrivée
                </label>
                <input
                  type="text"
                  id="arrival"
                  value={searchParams.arrival}
                  onChange={(e) => setSearchParams({ ...searchParams, arrival: e.target.value })}
                  placeholder="Ville d'arrivée"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  <span className="label-icon">📅</span>
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="passengers">
                  <span className="label-icon">👥</span>
                  Passagers
                </label>
                <select
                  id="passengers"
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value, 10) })}
                  className="form-input"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? "Recherche..." : "Rechercher"}
              </button>
            </div>
          </form>

          <div className="results-section">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Recherche en cours...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Erreur</h3>
                <p>{error}</p>
              </div>
            )}

            {!loading && searched && !error && trips.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Aucun trajet trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </div>
            )}

            {!loading && trips.length > 0 && (
              <div className="results-list">
                <h2>
                  {trips.length} trajet{trips.length > 1 ? "s" : ""} trouvé{trips.length > 1 ? "s" : ""}
                </h2>

                {trips.map((trip) => (
                  <div key={trip.id} className="trip-result-card">
                    <div className="trip-info">
                      <div className="trip-route">
                        <div className="route-point">
                          <span className="route-icon">📍</span>
                          <div>
                            <strong>{trip.departure_location}</strong>
                            <p className="route-time">{formatDate(trip.departure_datetime)}</p>
                          </div>
                        </div>
                        <div className="route-line"></div>
                        <div className="route-point">
                          <span className="route-icon">🎯</span>
                          <div>
                            <strong>{trip.arrival_location}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="trip-details">
                        <div className="driver-info">
                          <div className="driver-avatar">
                            {trip.first_name?.[0] || trip.driver_first_name?.[0] || "?"}
                            {trip.last_name?.[0] || trip.driver_last_name?.[0] || ""}
                          </div>
                          <div>
                            <strong>
                              {trip.first_name || trip.driver_first_name || "Conducteur"} {trip.last_name || trip.driver_last_name || ""}
                            </strong>
                            {trip.driver_rating && (
                              <p className="driver-rating">
                                ⭐ {parseFloat(trip.driver_rating).toFixed(1)} 
                                {trip.reviews_count > 0 && ` (${trip.reviews_count} avis)`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="trip-meta">
                          <span className="meta-item">
                            <span className="meta-icon">👥</span>
                            {trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats} place
                            {(trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats) > 1 ? "s" : ""} disponible
                          </span>
                          <span className="meta-item">
                            <span className="meta-icon">💰</span>
                            {parseFloat(trip.price_per_seat).toFixed(2)}€ / place
                          </span>
                        </div>

                        {trip.description && <p className="trip-description">{trip.description}</p>}
                      </div>
                    </div>

                    <div className="trip-actions">
                      <div className="trip-price">
                        <span className="price-label">Prix par place</span>
                        <span className="price-amount">{parseFloat(trip.price_per_seat).toFixed(2)}€</span>
                      </div>
                      <button
                        onClick={() => handleBooking(trip.id)}
                        className="book-btn"
                        disabled={(trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats) <= 0}
                      >
                        {(trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats) <= 0 ? "Complet" : "Réserver"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searched && !loading && (
              <div className="initial-state">
                <div className="initial-icon">🚗</div>
                <h3>Commencez votre recherche</h3>
                <p>Entrez vos critères de recherche pour trouver des trajets disponibles</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
