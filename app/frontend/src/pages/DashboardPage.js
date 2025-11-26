import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/api"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import "../styles/Dashboard.css"
import "../styles/HomePage.css"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, logout, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("trips")
  const [myTrips, setMyTrips] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileUser, setProfileUser] = useState(null)
  const [uploading, setUploading] = useState({ banner: false, avatar: false })
  const [editMode, setEditMode] = useState(false)
  const bannerInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  const loadDashboardData = useCallback(async () => {
    try {
      // Charger le profil utilisateur
      try {
        const profileData = await authAPI.getProfile()
        if (profileData.success) {
          setProfileUser(profileData.data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error)
      }

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

  const formatAddress = (fullAddress) => {
    if (!fullAddress) return "Adresse non disponible"
    
    // Extraire le numéro, rue et ville de l'adresse complète
    const parts = fullAddress.split(',').map(p => p.trim())
    
    if (parts.length >= 2) {
      // Prendre les 2 premières parties (numéro + rue, ville)
      return `${parts[0]}, ${parts[1]}`
    }
    
    return fullAddress
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB")
      return
    }

    setUploading({ ...uploading, banner: true })
    try {
      const formData = new FormData()
      formData.append('banner', file)

      const response = await fetch("http://localhost:5000/api/auth/profile/banner", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setProfileUser(prev => ({ ...prev, banner_picture: data.data.banner_picture }))
      } else {
        alert(data.message || "Erreur lors de l'upload de la bannière")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'upload de la bannière")
    } finally {
      setUploading({ ...uploading, banner: false })
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 2MB")
      return
    }

    setUploading({ ...uploading, avatar: true })
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch("http://localhost:5000/api/auth/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        const newProfilePicture = data.data.profile_picture;
        setProfileUser(prev => ({ ...prev, profile_picture: newProfilePicture }))
        updateUser({ profile_picture: newProfilePicture })
      } else {
        alert(data.message || "Erreur lors de l'upload de la photo")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'upload de la photo")
    } finally {
      setUploading({ ...uploading, avatar: false })
    }
  }

  const displayUser = profileUser || user

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
                          <div className="route-location">
                            <span className="departure">{formatAddress(trip.departure_location)}</span>
                          </div>
                          <span className="arrow">→</span>
                          <div className="route-location">
                            <span className="arrival">{formatAddress(trip.arrival_location)}</span>
                          </div>
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
              <div className="profile-card">
                {/* Bannière */}
                <div className="profile-banner-container">
                  <div 
                    className="profile-banner"
                    style={{
                      backgroundImage: displayUser?.banner_picture 
                        ? `url(http://localhost:5000/uploads/${displayUser.banner_picture})`
                        : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {editMode && (
                      <button
                        className="banner-edit-btn"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploading.banner}
                      >
                        {uploading.banner ? (
                          <>
                            <span className="spinner-small"></span>
                            Upload...
                          </>
                        ) : (
                          <>
                            <span>📷</span>
                            Modifier la bannière
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  {/* Avatar */}
                  <div className="profile-avatar-container">
                    <Avatar 
                      user={displayUser}
                      size="xlarge"
                      editable={editMode}
                      onEdit={() => avatarInputRef.current?.click()}
                      uploading={uploading.avatar}
                    />
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Informations du profil */}
                <div className="profile-content">
                  <div className="profile-header-info">
                    <div className="profile-name-section">
                      <h2>
                        {displayUser?.first_name || ''} {displayUser?.last_name || ''}
                      </h2>
                      <p className="profile-email">{displayUser?.email}</p>
                      <p className="profile-joined">
                        Membre depuis {displayUser?.created_at ? new Date(displayUser.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '2024'}
                      </p>
                      <p className="location-info">
                        <span className="location-icon">📍</span>
                        Étudiant à {displayUser?.university || 'IUT Amiens'}, Amiens
                      </p>
                    </div>
                    <button 
                      className="edit-profile-btn"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Annuler' : '✏️ Modifier le profil'}
                    </button>
                  </div>

                  {/* Statistiques */}
                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-value">{myTrips.length}</span>
                      <span className="stat-label">Trajets proposés</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{myBookings.length}</span>
                      <span className="stat-label">Réservations</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {displayUser?.average_rating ? parseFloat(displayUser.average_rating).toFixed(1) : '4.8'}
                      </span>
                      <span className="stat-label">Note moyenne</span>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="profile-details">
                    <h3>Informations personnelles</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>
                          <span className="detail-icon">📞</span>
                          Téléphone
                        </label>
                        <span>{displayUser?.phone || "Non renseigné"}</span>
                      </div>
                      <div className="detail-item">
                        <label>
                          <span className="detail-icon">🎓</span>
                          Numéro étudiant
                        </label>
                        <span>{displayUser?.student_id || "Non renseigné"}</span>
                      </div>
                      <div className="detail-item">
                        <label>
                          <span className="detail-icon">🏫</span>
                          Établissement
                        </label>
                        <span>{displayUser?.university || "IUT Amiens"}</span>
                      </div>
                      <div className="detail-item">
                        <label>
                          <span className="detail-icon">📍</span>
                          Ville d'étude
                        </label>
                        <span>Amiens, Hauts-de-France</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
