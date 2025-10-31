"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Search.css"
import "../styles/HomePage.css"

export default function SearchPage() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, logout } = useAuth()
  const [searchParams, setSearchParams] = useState({
    departure: "",
    arrival: "",
    date: "",
  })
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    try {
      const queryParams = new URLSearchParams()
      if (searchParams.departure) queryParams.append("departure", searchParams.departure)
      if (searchParams.arrival) queryParams.append("arrival", searchParams.arrival)
      if (searchParams.date) queryParams.append("date", searchParams.date)

      const response = await fetch(`http://localhost:5000/api/trips/search?${queryParams}`)
      const data = await response.json()

      if (response.ok) {
        setTrips(data.data || [])
      } else {
        console.error("Erreur lors de la recherche:", data.message)
        setTrips([])
      }
    } catch (error) {
      console.error("Erreur:", error)
      setTrips([])
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
    if (!seats || isNaN(seats) || seats < 1) return

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip_id: tripId,
          seats_booked: Number.parseInt(seats),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Réservation effectuée avec succès!")
        handleSearch({ preventDefault: () => {} })
      } else {
        alert(data.message || "Erreur lors de la réservation")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la réservation")
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
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <span className="brand-logo">🚗</span>
            <span className="brand-name">Fumotion</span>
          </div>

          <div className="navbar-menu">
            <a href="/search" className="navbar-link">
              Rechercher un trajet
            </a>
            {isAuthenticated() ? (
              <>
                <button onClick={() => navigate("/dashboard")} className="navbar-btn-secondary">
                  Mon tableau de bord
                </button>
                <button onClick={() => navigate("/create-trip")} className="navbar-btn-primary">
                  Créer un trajet
                </button>
                <span className="navbar-user">
                  {user?.first_name || user?.email}
                </span>
                <button onClick={handleLogout} className="navbar-btn-secondary">
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

            {!loading && searched && trips.length === 0 && (
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
                            {trip.driver_first_name?.[0]}
                            {trip.driver_last_name?.[0]}
                          </div>
                          <div>
                            <strong>
                              {trip.driver_first_name} {trip.driver_last_name}
                            </strong>
                            <p className="driver-rating">⭐ 4.8 (12 avis)</p>
                          </div>
                        </div>

                        <div className="trip-meta">
                          <span className="meta-item">
                            <span className="meta-icon">👥</span>
                            {trip.remaining_seats || trip.available_seats} place
                            {(trip.remaining_seats || trip.available_seats) > 1 ? "s" : ""}
                          </span>
                          <span className="meta-item">
                            <span className="meta-icon">💰</span>
                            {trip.price_per_seat}€ / place
                          </span>
                        </div>

                        {trip.description && <p className="trip-description">{trip.description}</p>}
                      </div>
                    </div>

                    <div className="trip-actions">
                      <div className="trip-price">
                        <span className="price-label">Prix total</span>
                        <span className="price-amount">{trip.price_per_seat}€</span>
                      </div>
                      <button
                        onClick={() => handleBooking(trip.id)}
                        className="book-btn"
                        disabled={!trip.remaining_seats && !trip.available_seats}
                      >
                        {!trip.remaining_seats && !trip.available_seats ? "Complet" : "Réserver"}
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
