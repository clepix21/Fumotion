/**
 * Page de recherche de trajets
 * Affiche les résultats filtrés avec carte et réservation
 */
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { tripsAPI, bookingsAPI } from "../services/api"
import MapComponent, { AddressSearch } from "../components/common/MapComponent"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import voiture from "../assets/icons/voiture.svg"
import starIcon from "../assets/icons/star.svg"
import warningCircle from "../assets/icons/warning-circle.svg"
import usersIcon from "../assets/icons/users.svg"
import moneyIcon from "../assets/icons/money.svg"
import chatIcon from "../assets/icons/chat.svg"
import { formatAddressShort } from "../utils/geocoding"
import "../styles/Search.css"
import "../styles/HomePage.css"
import Footer from "../components/common/Footer"


export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParamsURL] = useSearchParams()
  const { user, isAuthenticated, logout } = useAuth()

  // Critères de recherche
  const [searchParams, setSearchParams] = useState({
    departure: "",
    arrival: "",
    date: "",
    passengers: 1,
  })

  // Résultats et état
  const [trips, setTrips] = useState([])        // Trajets trouvés
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false) // Recherche effectuée ?
  const [error, setError] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)

  // Charger les paramètres de recherche depuis l'URL
  useEffect(() => {
    const departure = searchParamsURL.get("departure") || ""
    const arrival = searchParamsURL.get("arrival") || ""
    const date = searchParamsURL.get("date") || ""
    const passengers = parseInt(searchParamsURL.get("passengers") || "1", 10)

    if (departure || arrival || date) {
      setSearchParams({ departure, arrival, date, passengers })
      // Recherche automatique si paramètres présents
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

  // Handler pour la sélection d'adresse de départ via recherche
  const handleDepartureSelect = (suggestion) => {
    const formatted = formatAddressShort(suggestion) || suggestion.display_name.split(',').slice(0, 2).join(',')
    setSearchParams(prev => ({
      ...prev,
      departure: formatted
    }))
  }

  // Handler pour la sélection d'adresse d'arrivée via recherche
  const handleArrivalSelect = (suggestion) => {
    const formatted = formatAddressShort(suggestion) || suggestion.display_name.split(',').slice(0, 2).join(',')
    setSearchParams(prev => ({
      ...prev,
      arrival: formatted
    }))
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
        handleSearch({ preventDefault: () => { } })
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

          {/* Menu desktop */}
          <div className="navbar-menu-desktop">
            {isAuthenticated() ? (
              <>
                <button onClick={() => navigate("/dashboard")} className="navbar-btn-secondary">
                  Tableau de bord
                </button>
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
              </>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="navbar-btn-secondary">
                  Connexion
                </button>
                <button onClick={() => navigate("/register")} className="navbar-btn-primary">
                  Inscription
                </button>
              </>
            )}
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




            {isAuthenticated() ? (
              <>
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
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
                  Connexion
                </button>
                <button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                  Inscription
                </button>
              </>
            )}
          </div>
        </>
      )}

      <main className="search-main">
        <div className="search-container">
          <div className="search-header">
            <h1>Rechercher un trajet</h1>
            <p>Trouvez le covoiturage parfait pour vos déplacements</p>
          </div>

          <div className="search-card">
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Départ</label>
                  <AddressSearch
                    value={searchParams.departure}
                    onChange={(value) => setSearchParams({ ...searchParams, departure: value })}
                    onSelect={handleDepartureSelect}
                    placeholder="Rue de Midgard, Amiens"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <AddressSearch
                    value={searchParams.arrival}
                    onChange={(value) => setSearchParams({ ...searchParams, arrival: value })}
                    onSelect={handleArrivalSelect}
                    placeholder="TP11, Amiens"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  />
                </div>


                <div className="form-group">
                  <label className="form-label">Passagers</label>
                  <select
                    className="form-input"
                    value={searchParams.passengers}
                    onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value, 10) })}
                  >
                    <option value="1">1 passager</option>
                    <option value="2">2 passagers</option>
                    <option value="3">3 passagers</option>
                    <option value="4">4 passagers</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="search-button" disabled={loading}>
                {loading ? "Recherche..." : "Rechercher"}
              </button>
            </form>
          </div>

          <div className="results-section">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Recherche en cours...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <div className="error-icon">
                  <img src={warningCircle} alt="Attention" style={{ width: '48px', height: '48px' }} />
                </div>
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
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h2>
                    {trips.length} trajet{trips.length > 1 ? "s" : ""} trouvé{trips.length > 1 ? "s" : ""}
                  </h2>
                  <MapComponent
                    center={selectedTrip && selectedTrip.departure_latitude
                      ? [selectedTrip.departure_latitude, selectedTrip.departure_longitude]
                      : (trips[0]?.departure_latitude && trips[0]?.departure_longitude
                        ? [trips[0].departure_latitude, trips[0].departure_longitude]
                        : [49.8942, 2.2957])}
                    zoom={selectedTrip ? 13 : 12}
                    markers={
                      (selectedTrip ? [selectedTrip] : trips)
                        .filter(trip => trip.departure_latitude && trip.departure_longitude)
                        .map(trip => ({
                          lat: trip.departure_latitude,
                          lng: trip.departure_longitude,
                          type: 'departure',
                          popup: {
                            title: `Départ: ${trip.departure_location}`,
                            description: `${trip.price_per_seat}€ - ${trip.available_seats} places`
                          }
                        }))
                        .concat(
                          (selectedTrip ? [selectedTrip] : trips)
                            .filter(trip => trip.arrival_latitude && trip.arrival_longitude)
                            .map(trip => ({
                              lat: trip.arrival_latitude,
                              lng: trip.arrival_longitude,
                              type: 'arrival',
                              popup: {
                                title: `Arrivée: ${trip.arrival_location}`,
                                description: `${trip.price_per_seat}€ - ${trip.available_seats} places`
                              }
                            }))
                        )
                    }
                    height="500px"
                    interactive={true}
                    showRoute={!!selectedTrip || trips.length === 1}
                  />
                </div>
                <div className="results-list">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="trip-result-card"
                      onMouseEnter={() => setSelectedTrip(trip)}
                      onMouseLeave={() => setSelectedTrip(null)}
                    >
                      <div className="trip-info">
                        <div className="trip-route">
                          <div className="route-point">
                            <div>
                              <strong>{trip.departure_location}</strong>
                              <p className="route-time">{formatDate(trip.departure_datetime)}</p>
                            </div>
                          </div>
                          <div className="route-line"></div>
                          <div className="route-point">
                            <div>
                              <strong>{trip.arrival_location}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="trip-details">
                          <div className="driver-info">
                            <Avatar
                              user={{
                                first_name: trip.first_name || trip.driver_first_name,
                                last_name: trip.last_name || trip.driver_last_name,
                                profile_picture: trip.profile_picture || trip.driver_profile_picture
                              }}
                              size="medium"
                            />
                            <div>
                              <strong>
                                {trip.first_name || trip.driver_first_name || "Conducteur"} {trip.last_name || trip.driver_last_name || ""}
                              </strong>
                              {trip.driver_rating && (
                                <p className="driver-rating">
                                  <img src={starIcon} alt="star" className="icon-svg-rating" /> {parseFloat(trip.driver_rating).toFixed(1)}
                                  {trip.reviews_count > 0 && ` (${trip.reviews_count} avis)`}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="trip-meta">
                            <span className="meta-item">
                              <span className="meta-icon">
                                <img src={usersIcon} alt="passengers" style={{ width: '16px', height: '16px' }} />
                              </span>
                              {trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats} place
                              {(trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats) > 1 ? "s" : ""} disponible
                            </span>
                            <span className="meta-item">
                              <span className="meta-icon">
                                <img src={moneyIcon} alt="price" style={{ width: '16px', height: '16px' }} />
                              </span>
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
                        <div className="trip-buttons" style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => {
                              if (!isAuthenticated()) {
                                navigate("/login");
                                return;
                              }
                              navigate(`/chat/${trip.driver_id}`);
                            }}
                            className="contact-btn"
                          >
                            <img src={chatIcon} alt="chat" style={{ width: '20px', height: '20px' }} />
                          </button>
                          <button
                            onClick={() => handleBooking(trip.id)}
                            className="book-btn"
                            disabled={(trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats) <= 0}
                          >
                            {(trip.remaining_seats !== undefined ? trip.remaining_seats : trip.available_seats) <= 0 ? "Complet" : "Réserver"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!searched && !loading && (
              <div className="initial-state">
                <div className="initial-icon">
                  <img src={voiture} alt="voiture logo" style={{ width: '100px', height: 'auto' }} />
                </div>
                <h3>Commencez votre recherche</h3>
                <p>Entrez vos critères de recherche pour trouver des trajets disponibles</p>
              </div>
            )}
          </div>
        </div>


      </main >
      <Footer />
    </div >
  )
}
