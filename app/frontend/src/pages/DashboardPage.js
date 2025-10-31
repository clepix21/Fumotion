"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Dashboard.css"
import "../styles/HomePage.css"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("trips")
  const [myTrips, setMyTrips] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      // Charger mes trajets
      const tripsResponse = await fetch("http://localhost:5000/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json()
        setMyTrips(tripsData.data || [])
      }

      // Charger mes réservations
      const bookingsResponse = await fetch("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setMyBookings(bookingsData.data || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // Vérifier l'authentification avec le contexte
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    loadDashboardData()
  }, [navigate, isAuthenticated, loadDashboardData])

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de votre tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Navbar - identique à la HomePage */}
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
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-section">
            <h3>Tableau de bord</h3>
            <button
              className={`sidebar-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="btn-icon">📊</span>
              Vue d'ensemble
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Trajets à Amiens</h3>
            <button
              className={`sidebar-btn ${activeTab === "trips" ? "active" : ""}`}
              onClick={() => setActiveTab("trips")}
            >
              <span className="btn-icon">🚗</span>
              Mes trajets
            </button>
            <button
              className={`sidebar-btn ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              <span className="btn-icon">🎫</span>
              Mes réservations
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Compte</h3>
            <button
              className={`sidebar-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <span className="btn-icon">👤</span>
              Profil
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === "overview" && (
            <div className="overview-section">
              <h1>Vue d'ensemble - Amiens</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-content">
                    <h3>{myTrips.length}</h3>
                    <p>Trajets proposés</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-content">
                    <h3>{myBookings.length}</h3>
                    <p>Réservations effectuées</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <h3>4.8</h3>
                    <p>Note moyenne</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>€125</h3>
                    <p>Économisés ce mois</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h2>Actions rapides</h2>
                <div className="action-cards">
                  <Link to="/create-trip" className="action-card">
                    <div className="action-icon">➕</div>
                    <h3>Proposer un trajet</h3>
                    <p>Créez un nouveau trajet dans Amiens et partagez vos frais</p>
                  </Link>
                  <Link to="/search" className="action-card">
                    <div className="action-icon">🔍</div>
                    <h3>Trouver un trajet</h3>
                    <p>Recherchez un trajet pour vos déplacements dans Amiens</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "trips" && (
            <div className="trips-section">
              <div className="section-header">
                <h1>Mes trajets proposés à Amiens</h1>
                <Link to="/create-trip" className="create-btn">
                  Nouveau trajet
                </Link>
              </div>

              {myTrips.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚗</div>
                  <h3>Aucun trajet proposé</h3>
                  <p>Commencez par proposer votre premier trajet dans Amiens</p>
                  <Link to="/create-trip" className="empty-action">
                    Proposer un trajet
                  </Link>
                </div>
              ) : (
                <div className="trips-grid">
                  {myTrips.map((trip) => (
                    <div key={trip.id} className="trip-card">
                      <div className="trip-header">
                        <div className="trip-route">
                          <span className="departure">{trip.departure_location}</span>
                          <span className="arrow">→</span>
                          <span className="arrival">{trip.arrival_location}</span>
                        </div>
                        <span className={`trip-status ${trip.status}`}>
                          {trip.status === "active" ? "Actif" : trip.status === "completed" ? "Terminé" : "Annulé"}
                        </span>
                      </div>
                      <div className="trip-details">
                        <p className="trip-date">{formatDate(trip.departure_datetime)}</p>
                        <p className="trip-price">{trip.price_per_seat}€ par place</p>
                        <p className="trip-seats">{trip.remaining_seats || trip.available_seats} places disponibles</p>
                      </div>
                      <div className="trip-actions">
                        <button className="trip-btn secondary">Modifier</button>
                        <button className="trip-btn primary">Voir détails</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bookings-section">
              <h1>Mes réservations à Amiens</h1>

              {myBookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎫</div>
                  <h3>Aucune réservation</h3>
                  <p>Vous n'avez pas encore réservé de trajet dans Amiens</p>
                  <Link to="/search" className="empty-action">
                    Chercher un trajet
                  </Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-info">
                        <div className="booking-route">
                          <span className="departure">{booking.departure_location}</span>
                          <span className="arrow">→</span>
                          <span className="arrival">{booking.arrival_location}</span>
                        </div>
                        <p className="booking-date">{formatDate(booking.departure_datetime)}</p>
                        <p className="booking-driver">
                          Conducteur: {booking.driver_first_name} {booking.driver_last_name}
                        </p>
                      </div>
                      <div className="booking-details">
                        <span className="booking-price">{booking.total_price}€</span>
                        <span className="booking-seats">{booking.seats_booked} place(s)</span>
                        <span className={`booking-status ${booking.status || booking.booking_status}`}>
                          {booking.status === "confirmed"
                            ? "Confirmé"
                            : booking.status === "pending"
                              ? "En attente"
                              : booking.status === "cancelled"
                                ? "Annulé"
                                : "Terminé"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="profile-section">
              <h1>Mon profil</h1>
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </div>
                  <div className="profile-info">
                    <h2>
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p>{user?.email}</p>
                    <p>Membre depuis {new Date(user?.created_at).getFullYear()}</p>
                    <p className="location-info">📍 Étudiant à Amiens</p>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-item">
                    <label>Téléphone</label>
                    <span>{user?.phone || "Non renseigné"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Numéro étudiant</label>
                    <span>{user?.student_id || "Non renseigné"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Établissement</label>
                    <span>{user?.university || "IUT Amiens"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ville d'étude</label>
                    <span>Amiens, Hauts-de-France</span>
                  </div>
                </div>

                <button className="edit-profile-btn">Modifier le profil</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
