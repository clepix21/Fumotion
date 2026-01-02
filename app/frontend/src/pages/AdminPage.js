/**
 * Page d'administration
 * Tableau de bord, gestion des utilisateurs, trajets et réservations
 */
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { adminAPI } from "../services/adminApi"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import statsIcon from "../assets/icons/stats.svg"
import profileIcon from "../assets/icons/profile.svg"
import refreshIcon from "../assets/icons/refresh.svg"
import usersIcon from "../assets/icons/users.svg"
import voitureIcon from "../assets/icons/voiture.svg"
import clipboardIcon from "../assets/icons/clipboard.svg"
import alertIcon from "../assets/icons/alert.svg"
import moneyIcon from "../assets/icons/money.svg"
import checkCircleIcon from "../assets/icons/check-circle.svg"
import targetIcon from "../assets/icons/target.svg"
import clockIcon from "../assets/icons/clock.svg"
import locationIcon from "../assets/icons/location.svg"
import "../styles/Admin.css"
import "../styles/HomePage.css"

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, token, logout, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  
  // États du dashboard (statistiques globales)
  const [statistics, setStatistics] = useState(null)
  
  // États de la gestion des utilisateurs
  const [users, setUsers] = useState([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState(null)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersFilter, setUsersFilter] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [userDetailModal, setUserDetailModal] = useState(null)
  
  // États de la gestion des trajets
  const [trips, setTrips] = useState([])
  const [tripsPage, setTripsPage] = useState(1)
  const [tripsPagination, setTripsPagination] = useState(null)
  const [tripsFilter, setTripsFilter] = useState("")
  const [tripsSearch, setTripsSearch] = useState("")
  const [selectedTrips, setSelectedTrips] = useState([])
  
  // États de la gestion des réservations
  const [bookings, setBookings] = useState([])
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsPagination, setBookingsPagination] = useState(null)
  const [bookingsFilter, setBookingsFilter] = useState("")

  /** Affiche une notification temporaire */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  /** Formate une date en français */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  /** Formate une adresse (garde les 2 premiers éléments) */
  const formatAddress = (address) => {
    if (!address) return "-"
    const parts = address.split(',')
    return parts.length > 1 ? `${parts[0]}, ${parts[1]}` : address
  }

  /** Exporte les données en CSV */
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      showNotification("Aucune donnée à exporter", "warning")
      return
    }
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let value = row[header]
        if (value === null || value === undefined) value = ''
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`
        }
        return value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    showNotification("Export réussi !")
  }

  // Toggle selection helpers
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleTripSelection = (tripId) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    )
  }

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }

  const toggleAllTrips = () => {
    if (selectedTrips.length === trips.length) {
      setSelectedTrips([])
    } else {
      setSelectedTrips(trips.map(t => t.id))
    }
  }

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (authLoading) return // Attendre que l'authentification soit chargée
    
    if (!token || !user?.is_admin) {
      console.log("Accès admin refusé:", { token: !!token, user })
      navigate("/")
    }
  }, [user, token, navigate, authLoading])

  // Charger les statistiques
  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getStatistics()
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error("Erreur chargement statistiques:", error)
      showNotification("Erreur lors du chargement des statistiques", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page: usersPage, limit: 20 }
      if (usersSearch) params.search = usersSearch
      if (usersFilter) params.status = usersFilter

      const response = await adminAPI.getAllUsers(params)
      if (response.success) {
        setUsers(response.data)
        setUsersPagination(response.pagination)
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error)
      showNotification("Erreur lors du chargement des utilisateurs", "error")
    } finally {
      setLoading(false)
    }
  }, [usersPage, usersSearch, usersFilter])

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page: tripsPage, limit: 20 }
      if (tripsFilter) params.status = tripsFilter
      if (tripsSearch) params.search = tripsSearch

      const response = await adminAPI.getAllTrips(params)
      if (response.success) {
        setTrips(response.data)
        setTripsPagination(response.pagination)
      }
    } catch (error) {
      console.error("Erreur chargement trajets:", error)
      showNotification("Erreur lors du chargement des trajets", "error")
    } finally {
      setLoading(false)
    }
  }, [tripsPage, tripsFilter, tripsSearch])

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page: bookingsPage, limit: 20 }
      if (bookingsFilter) params.status = bookingsFilter

      const response = await adminAPI.getAllBookings(params)
      if (response.success) {
        setBookings(response.data)
        setBookingsPagination(response.pagination)
      }
    } catch (error) {
      console.error("Erreur chargement réservations:", error)
      showNotification("Erreur lors du chargement des réservations", "error")
    } finally {
      setLoading(false)
    }
  }, [bookingsPage, bookingsFilter])

  // Charger les données selon l'onglet actif
  useEffect(() => {
    if (authLoading || !token || !user?.is_admin) return
    
    const loadData = async () => {
      if (activeTab === "dashboard") {
        try {
          setLoading(true)
          const response = await adminAPI.getStatistics()
          if (response.success) {
            setStatistics(response.data)
          }
        } catch (error) {
          console.error("Erreur chargement statistiques:", error)
          showNotification("Erreur lors du chargement des statistiques", "error")
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authLoading, token, user?.is_admin])

  useEffect(() => {
    if (authLoading || !token || !user?.is_admin) return
    if (activeTab === "users") {
      loadUsers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authLoading, token, user?.is_admin, usersPage, usersSearch, usersFilter])

  useEffect(() => {
    if (authLoading || !token || !user?.is_admin) return
    if (activeTab === "trips") {
      loadTrips()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authLoading, token, user?.is_admin, tripsPage, tripsFilter, tripsSearch])

  useEffect(() => {
    if (authLoading || !token || !user?.is_admin) return
    if (activeTab === "bookings") {
      loadBookings()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authLoading, token, user?.is_admin, bookingsPage, bookingsFilter])

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await adminAPI.updateUser(userId, updates)
      if (response.success) {
        loadUsers()
        showNotification("Utilisateur mis à jour avec succès")
      }
    } catch (error) {
      console.error("Erreur mise à jour utilisateur:", error)
      showNotification("Erreur lors de la mise à jour", "error")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return

    try {
      const response = await adminAPI.deleteUser(userId)
      if (response.success) {
        loadUsers()
        showNotification("Utilisateur supprimé avec succès")
      }
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error)
      showNotification("Erreur lors de la suppression", "error")
    }
  }

  const handleBulkUserAction = async (action) => {
    if (selectedUsers.length === 0) {
      showNotification("Sélectionnez au moins un utilisateur", "warning")
      return
    }

    const confirmMsg = action === 'delete' 
      ? `Supprimer ${selectedUsers.length} utilisateur(s) ?`
      : `Appliquer l'action sur ${selectedUsers.length} utilisateur(s) ?`
    
    if (!window.confirm(confirmMsg)) return

    try {
      for (const userId of selectedUsers) {
        if (action === 'delete') {
          await adminAPI.deleteUser(userId)
        } else if (action === 'activate') {
          await adminAPI.updateUser(userId, { is_active: true })
        } else if (action === 'deactivate') {
          await adminAPI.updateUser(userId, { is_active: false })
        }
      }
      setSelectedUsers([])
      loadUsers()
      showNotification(`Action effectuée sur ${selectedUsers.length} utilisateur(s)`)
    } catch (error) {
      showNotification("Erreur lors de l'action groupée", "error")
    }
  }

  const handleUpdateTrip = async (tripId, status) => {
    try {
      const response = await adminAPI.updateTrip(tripId, { status })
      if (response.success) {
        loadTrips()
        showNotification("Trajet mis à jour avec succès")
      }
    } catch (error) {
      console.error("Erreur mise à jour trajet:", error)
      showNotification("Erreur lors de la mise à jour", "error")
    }
  }

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) return

    try {
      const response = await adminAPI.deleteTrip(tripId)
      if (response.success) {
        loadTrips()
        showNotification("Trajet supprimé avec succès")
      }
    } catch (error) {
      console.error("Erreur suppression trajet:", error)
      showNotification("Erreur lors de la suppression", "error")
    }
  }

  const handleBulkTripAction = async (action) => {
    if (selectedTrips.length === 0) {
      showNotification("Sélectionnez au moins un trajet", "warning")
      return
    }

    if (!window.confirm(`Appliquer l'action sur ${selectedTrips.length} trajet(s) ?`)) return

    try {
      for (const tripId of selectedTrips) {
        if (action === 'delete') {
          await adminAPI.deleteTrip(tripId)
        } else {
          await adminAPI.updateTrip(tripId, { status: action })
        }
      }
      setSelectedTrips([])
      loadTrips()
      showNotification(`Action effectuée sur ${selectedTrips.length} trajet(s)`)
    } catch (error) {
      showNotification("Erreur lors de l'action groupée", "error")
    }
  }

  const handleUpdateBooking = async (bookingId, updates) => {
    try {
      const response = await adminAPI.updateBooking(bookingId, updates)
      if (response.success) {
        loadBookings()
        showNotification("Réservation mise à jour avec succès")
      }
    } catch (error) {
      console.error("Erreur mise à jour réservation:", error)
      showNotification("Erreur lors de la mise à jour", "error")
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return

    try {
      const response = await adminAPI.deleteBooking(bookingId)
      if (response.success) {
        loadBookings()
        showNotification("Réservation supprimée avec succès")
      }
    } catch (error) {
      console.error("Erreur suppression réservation:", error)
      showNotification("Erreur lors de la suppression", "error")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="admin-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

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
            <div className="navbar-user-profile" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
              <Avatar user={user} size="medium" />
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.first_name} (Admin)</span>
              </div>
            </div>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-menu">
            <button 
              className={`sidebar-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="sidebar-icon">Tableau de bord</span>
            </button>
            <button 
              className={`sidebar-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <span className="sidebar-icon">Utilisateurs</span>
              {statistics?.users?.total && (
                <span className="sidebar-badge">{statistics.users.total}</span>
              )}
            </button>
            <button 
              className={`sidebar-item ${activeTab === "trips" ? "active" : ""}`}
              onClick={() => setActiveTab("trips")}
            >
              <span className="sidebar-icon">Trajets</span>
              {statistics?.trips?.total && (
                <span className="sidebar-badge">{statistics.trips.total}</span>
              )}
            </button>
            <button 
              className={`sidebar-item ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              <span className="sidebar-icon">Réservations</span>
              {statistics?.bookings?.pending > 0 && (
                <span className="sidebar-badge warning">{statistics.bookings.pending}</span>
              )}
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-info">
              <p>Connecté en tant que</p>
              <strong>{user?.email}</strong>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="admin-content">
          {activeTab === "dashboard" && (
            <div className="admin-section">
              <div className="admin-header">
                <div className="admin-header-content">
                  <h1 className="admin-title">Tableau de bord</h1>
                  <p className="admin-subtitle">Vue d'ensemble de votre plateforme</p>
                </div>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={loadStatistics}
                  disabled={loading}
                >
                  <img src={refreshIcon} alt="" className="btn-icon-svg" /> Actualiser
                </button>
              </div>
              
              {loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p>Chargement des statistiques...</p>
                </div>
              ) : statistics ? (
                <>
                  <div className="stats-grid">
                    <div className="stat-card users">
                      <div className="stat-icon-wrapper">
                        <span className="stat-icon"><img src={usersIcon} alt="" className="stat-icon-svg" /></span>
                      </div>
                      <div className="stat-content">
                        <div className="stat-header">
                          <div className="stat-label">Utilisateurs</div>
                          <div className="stat-trend positive">
                            <span>↗</span>
                            <span>{statistics.users.active > 0 ? Math.round((statistics.users.active / statistics.users.total) * 100) : 0}%</span>
                          </div>
                        </div>
                        <div className="stat-value">{statistics.users.total}</div>
                        <div className="stat-progress-bar">
                          <div 
                            className="stat-progress-fill active" 
                            style={{ width: `${statistics.users.total > 0 ? (statistics.users.active / statistics.users.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="stat-details">
                          <span className="stat-detail-item">
                            <span className="stat-dot active"></span>
                            {statistics.users.active} actifs
                          </span>
                          <span className="stat-detail-item">
                            <span className="stat-dot verified"></span>
                            {statistics.users.verified} vérifiés
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="stat-card trips">
                      <div className="stat-icon-wrapper">
                        <span className="stat-icon"><img src={voitureIcon} alt="" className="stat-icon-svg" /></span>
                      </div>
                      <div className="stat-content">
                        <div className="stat-header">
                          <div className="stat-label">Trajets</div>
                          <div className="stat-trend neutral">
                            <span>→</span>
                            <span>{statistics.trips.active} actifs</span>
                          </div>
                        </div>
                        <div className="stat-value">{statistics.trips.total}</div>
                        <div className="stat-progress-bar">
                          <div 
                            className="stat-progress-fill trips" 
                            style={{ width: `${statistics.trips.total > 0 ? (statistics.trips.completed / statistics.trips.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="stat-details">
                          <span className="stat-detail-item">
                            <span className="stat-dot active"></span>
                            {statistics.trips.active} en cours
                          </span>
                          <span className="stat-detail-item">
                            <span className="stat-dot completed"></span>
                            {statistics.trips.completed} terminés
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="stat-card bookings">
                      <div className="stat-icon-wrapper">
                        <span className="stat-icon"><img src={clipboardIcon} alt="" className="stat-icon-svg" /></span>
                      </div>
                      <div className="stat-content">
                        <div className="stat-header">
                          <div className="stat-label">Réservations</div>
                          {statistics.bookings.pending > 0 && (
                            <div className="stat-trend warning">
                              <span><img src={alertIcon} alt="" className="trend-icon-svg" /></span>
                              <span>{statistics.bookings.pending} en attente</span>
                            </div>
                          )}
                        </div>
                        <div className="stat-value">{statistics.bookings.total}</div>
                        <div className="stat-progress-bar">
                          <div 
                            className="stat-progress-fill bookings" 
                            style={{ width: `${statistics.bookings.total > 0 ? (statistics.bookings.confirmed / statistics.bookings.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="stat-details">
                          <span className="stat-detail-item">
                            <span className="stat-dot confirmed"></span>
                            {statistics.bookings.confirmed} confirmées
                          </span>
                          <span className="stat-detail-item">
                            <span className="stat-dot pending"></span>
                            {statistics.bookings.pending} en attente
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="stat-card revenue">
                      <div className="stat-icon-wrapper">
                        <span className="stat-icon"><img src={moneyIcon} alt="" className="stat-icon-svg" /></span>
                      </div>
                      <div className="stat-content">
                        <div className="stat-header">
                          <div className="stat-label">Revenu total</div>
                          <div className="stat-trend positive">
                            <span><img src={moneyIcon} alt="" className="trend-icon-svg" /></span>
                            <span>Transactions</span>
                          </div>
                        </div>
                        <div className="stat-value">{(statistics.revenue.total || 0).toFixed(2)}€</div>
                        <div className="stat-details">
                          <span className="stat-detail-item">
                            <span className="stat-dot confirmed"></span>
                            Paiements confirmés
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Summary */}
                  <div className="quick-stats-summary">
                    <div className="quick-stat-item">
                      <span className="quick-stat-icon"><img src={checkCircleIcon} alt="" className="quick-stat-icon-svg" /></span>
                      <div className="quick-stat-info">
                        <span className="quick-stat-value">{statistics.users.verified}</span>
                        <span className="quick-stat-label">Utilisateurs vérifiés</span>
                      </div>
                    </div>
                    <div className="quick-stat-item">
                      <span className="quick-stat-icon"><img src={targetIcon} alt="" className="quick-stat-icon-svg" /></span>
                      <div className="quick-stat-info">
                        <span className="quick-stat-value">{statistics.trips.active}</span>
                        <span className="quick-stat-label">Trajets actifs</span>
                      </div>
                    </div>
                    <div className="quick-stat-item">
                      <span className="quick-stat-icon"><img src={clockIcon} alt="" className="quick-stat-icon-svg" /></span>
                      <div className="quick-stat-info">
                        <span className="quick-stat-value">{statistics.bookings.pending}</span>
                        <span className="quick-stat-label">À traiter</span>
                      </div>
                    </div>
                    <div className="quick-stat-item">
                      <span className="quick-stat-icon">
                        <img src={statsIcon} alt="stats" className="icon-svg-quick" />
                      </span>
                      <div className="quick-stat-info">
                        <span className="quick-stat-value">
                          {statistics.bookings.total > 0 
                            ? Math.round((statistics.bookings.confirmed / statistics.bookings.total) * 100) 
                            : 0}%
                        </span>
                        <span className="quick-stat-label">Taux de confirmation</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-grid-2">
                    <div className="recent-section">
                      <div className="recent-header">
                        <div className="recent-header-title">
                          <img src={profileIcon} alt="" className="icon-svg-heading" />
                          <h2>Derniers utilisateurs</h2>
                        </div>
                        <button 
                          className="admin-btn-link"
                          onClick={() => setActiveTab("users")}
                        >
                          Voir tout →
                        </button>
                      </div>
                      <div className="recent-list">
                        {statistics.recent.users.length === 0 ? (
                          <div className="empty-state-small">
                            <img src={profileIcon} alt="" className="icon-svg-empty" />
                            <p>Aucun utilisateur récent</p>
                          </div>
                        ) : (
                          statistics.recent.users.map((u, index) => (
                            <div key={u.id} className="recent-item" style={{ animationDelay: `${index * 0.1}s` }}>
                              <div className="recent-item-left">
                                <Avatar user={u} size="small" />
                                <div className="recent-info">
                                  <div className="recent-name">{u.first_name} {u.last_name}</div>
                                  <div className="recent-detail">{u.email}</div>
                                </div>
                              </div>
                              <div className="recent-item-right">
                                <span className="recent-badge new">Nouveau</span>
                                <div className="recent-date">{formatDate(u.created_at)}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="recent-section">
                      <div className="recent-header">
                        <div className="recent-header-title">
                          <span className="recent-header-icon"><img src={voitureIcon} alt="" className="icon-svg-heading" /></span>
                          <h2>Derniers trajets</h2>
                        </div>
                        <button 
                          className="admin-btn-link"
                          onClick={() => setActiveTab("trips")}
                        >
                          Voir tout →
                        </button>
                      </div>
                      <div className="recent-list">
                        {statistics.recent.trips.length === 0 ? (
                          <div className="empty-state-small">
                            <span><img src={voitureIcon} alt="" className="icon-svg-empty" /></span>
                            <p>Aucun trajet récent</p>
                          </div>
                        ) : (
                          statistics.recent.trips.map((trip, index) => (
                            <div key={trip.id} className="recent-item trip-item" style={{ animationDelay: `${index * 0.1}s` }}>
                              <div className="recent-item-left">
                                <div className="recent-trip-icon">
                                  <span><img src={locationIcon} alt="" className="icon-svg-small" /></span>
                                </div>
                                <div className="recent-info">
                                  <div className="recent-name trip-route">
                                    <span className="route-from">{formatAddress(trip.departure_location)}</span>
                                    <span className="route-arrow">→</span>
                                    <span className="route-to">{formatAddress(trip.arrival_location)}</span>
                                  </div>
                                  <div className="recent-detail">
                                    <span className="driver-info"><img src={voitureIcon} alt="" className="icon-svg-inline" /> {trip.first_name} {trip.last_name}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="recent-item-right">
                                <span className={`recent-badge ${trip.status || 'active'}`}>
                                  {trip.status === 'completed' ? '✓ Terminé' : trip.status === 'cancelled' ? '✗ Annulé' : '● Actif'}
                                </span>
                                <div className="recent-date">{formatDate(trip.created_at)}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">
                    <img src={statsIcon} alt="stats" className="icon-svg-empty" />
                  </span>
                  <p>Impossible de charger les statistiques</p>
                  <button className="admin-btn admin-btn-primary" onClick={loadStatistics}>
                    <img src={refreshIcon} alt="" className="btn-icon-svg" /> Réessayer
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="admin-section">
              <div className="admin-header">
                <h1 className="admin-title">Gestion des utilisateurs</h1>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => exportToCSV(users, 'utilisateurs')}
                >
                  Exporter CSV
                </button>
              </div>
              
              <div className="admin-toolbar">
                <div className="admin-filters">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="admin-search"
                  />
                  <select
                    value={usersFilter}
                    onChange={(e) => setUsersFilter(e.target.value)}
                    className="admin-filter"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                </div>
                
                {selectedUsers.length > 0 && (
                  <div className="bulk-actions">
                    <span className="bulk-count">{selectedUsers.length} sélectionné(s)</span>
                    <button 
                      className="admin-btn admin-btn-sm"
                      onClick={() => handleBulkUserAction('activate')}
                    >
                      Activer
                    </button>
                    <button 
                      className="admin-btn admin-btn-sm"
                      onClick={() => handleBulkUserAction('deactivate')}
                    >
                      Désactiver
                    </button>
                    <button 
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => handleBulkUserAction('delete')}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p>Chargement...</p>
                </div>
              ) : (
                <>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            <input 
                              type="checkbox"
                              checked={selectedUsers.length === users.length && users.length > 0}
                              onChange={toggleAllUsers}
                            />
                          </th>
                          <th>Utilisateur</th>
                          <th>Contact</th>
                          <th>Université</th>
                          <th>Statut</th>
                          <th>Inscrit le</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="empty-row">Aucun utilisateur trouvé</td>
                          </tr>
                        ) : (
                          users.map(u => (
                            <tr key={u.id} className={selectedUsers.includes(u.id) ? 'selected' : ''}>
                              <td>
                                <input 
                                  type="checkbox"
                                  checked={selectedUsers.includes(u.id)}
                                  onChange={() => toggleUserSelection(u.id)}
                                />
                              </td>
                              <td>
                                <div className="user-cell">
                                  <Avatar user={u} size="small" />
                                  <div>
                                    <div className="user-name">{u.first_name} {u.last_name}</div>
                                    <div className="user-id">ID: {u.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="contact-cell">
                                  <div>{u.email}</div>
                                  <div className="text-muted">{u.phone || "-"}</div>
                                </div>
                              </td>
                              <td>{u.university || "-"}</td>
                              <td>
                                <div className="status-badges">
                                  <span className={`admin-badge ${u.is_active ? 'success' : 'danger'}`}>
                                    {u.is_active ? 'Actif' : 'Inactif'}
                                  </span>
                                  {u.is_verified && <span className="admin-badge info">Vérifié</span>}
                                  {u.is_admin && <span className="admin-badge warning">Admin</span>}
                                </div>
                              </td>
                              <td>{formatDate(u.created_at)}</td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    onClick={() => setUserDetailModal(u)}
                                    className="action-btn"
                                    title="Voir détails"
                                  >
                                    Voir
                                  </button>
                                  <button
                                    onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                                    className="action-btn"
                                    title={u.is_active ? "Désactiver" : "Activer"}
                                  >
                                    {u.is_active ? "Pause" : "Play"}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateUser(u.id, { is_verified: !u.is_verified })}
                                    className="action-btn"
                                    title={u.is_verified ? "Retirer vérification" : "Vérifier"}
                                  >
                                    V
                                  </button>
                                  <button
                                    onClick={() => handleUpdateUser(u.id, { is_admin: !u.is_admin })}
                                    className="action-btn"
                                    title={u.is_admin ? "Retirer admin" : "Promouvoir admin"}
                                    disabled={u.email === "admin@fumotion.com"}
                                  >
                                    A
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="action-btn danger"
                                    title="Supprimer"
                                    disabled={u.email === "admin@fumotion.com"}
                                  >
                                    X
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {usersPagination && usersPagination.pages > 1 && (
                    <div className="admin-pagination">
                      <button
                        onClick={() => setUsersPage(1)}
                        disabled={usersPage === 1}
                        className="pagination-btn"
                      >
                        Premier
                      </button>
                      <button
                        onClick={() => setUsersPage(usersPage - 1)}
                        disabled={usersPage === 1}
                        className="pagination-btn"
                      >
                        Précédent
                      </button>
                      <span className="pagination-info">
                        Page {usersPagination.page} sur {usersPagination.pages}
                        <span className="pagination-total">({usersPagination.total} résultats)</span>
                      </span>
                      <button
                        onClick={() => setUsersPage(usersPage + 1)}
                        disabled={usersPage >= usersPagination.pages}
                        className="pagination-btn"
                      >
                        Suivant
                      </button>
                      <button
                        onClick={() => setUsersPage(usersPagination.pages)}
                        disabled={usersPage >= usersPagination.pages}
                        className="pagination-btn"
                      >
                        Dernier
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "trips" && (
            <div className="admin-section">
              <div className="admin-header">
                <h1 className="admin-title">Gestion des trajets</h1>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => exportToCSV(trips, 'trajets')}
                >
                  Exporter CSV
                </button>
              </div>
              
              <div className="admin-toolbar">
                <div className="admin-filters">
                  <input
                    type="text"
                    placeholder="Rechercher un trajet..."
                    value={tripsSearch}
                    onChange={(e) => setTripsSearch(e.target.value)}
                    className="admin-search"
                  />
                  <select
                    value={tripsFilter}
                    onChange={(e) => setTripsFilter(e.target.value)}
                    className="admin-filter"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="completed">Terminés</option>
                    <option value="cancelled">Annulés</option>
                  </select>
                </div>
                
                {selectedTrips.length > 0 && (
                  <div className="bulk-actions">
                    <span className="bulk-count">{selectedTrips.length} sélectionné(s)</span>
                    <button 
                      className="admin-btn admin-btn-sm"
                      onClick={() => handleBulkTripAction('completed')}
                    >
                      Marquer terminé
                    </button>
                    <button 
                      className="admin-btn admin-btn-sm"
                      onClick={() => handleBulkTripAction('cancelled')}
                    >
                      Annuler
                    </button>
                    <button 
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => handleBulkTripAction('delete')}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p>Chargement...</p>
                </div>
              ) : (
                <>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            <input 
                              type="checkbox"
                              checked={selectedTrips.length === trips.length && trips.length > 0}
                              onChange={toggleAllTrips}
                            />
                          </th>
                          <th>ID</th>
                          <th>Conducteur</th>
                          <th>Itinéraire</th>
                          <th>Date</th>
                          <th>Places</th>
                          <th>Prix</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trips.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="empty-row">Aucun trajet trouvé</td>
                          </tr>
                        ) : (
                          trips.map(trip => (
                            <tr key={trip.id} className={selectedTrips.includes(trip.id) ? 'selected' : ''}>
                              <td>
                                <input 
                                  type="checkbox"
                                  checked={selectedTrips.includes(trip.id)}
                                  onChange={() => toggleTripSelection(trip.id)}
                                />
                              </td>
                              <td>#{trip.id}</td>
                              <td>
                                <div className="user-cell">
                                  <div>
                                    <div className="user-name">{trip.first_name} {trip.last_name}</div>
                                    <div className="text-muted">{trip.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="route-cell">
                                  <span className="route-from">{formatAddress(trip.departure_location)}</span>
                                  <span className="route-arrow">-</span>
                                  <span className="route-to">{formatAddress(trip.arrival_location)}</span>
                                </div>
                              </td>
                              <td>{formatDate(trip.departure_datetime)}</td>
                              <td>{trip.available_seats}</td>
                              <td><strong>{trip.price_per_seat}€</strong></td>
                              <td>
                                <span className={`admin-badge ${
                                  trip.status === 'active' ? 'success' : 
                                  trip.status === 'completed' ? 'info' : 'danger'
                                }`}>
                                  {trip.status === 'active' ? 'Actif' : 
                                   trip.status === 'completed' ? 'Terminé' : 'Annulé'}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <select
                                    value={trip.status}
                                    onChange={(e) => handleUpdateTrip(trip.id, e.target.value)}
                                    className="status-select"
                                  >
                                    <option value="active">Actif</option>
                                    <option value="completed">Terminé</option>
                                    <option value="cancelled">Annulé</option>
                                  </select>
                                  <button
                                    onClick={() => handleDeleteTrip(trip.id)}
                                    className="action-btn danger"
                                    title="Supprimer"
                                  >
                                    X
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {tripsPagination && tripsPagination.pages > 1 && (
                    <div className="admin-pagination">
                      <button
                        onClick={() => setTripsPage(1)}
                        disabled={tripsPage === 1}
                        className="pagination-btn"
                      >
                        Premier
                      </button>
                      <button
                        onClick={() => setTripsPage(tripsPage - 1)}
                        disabled={tripsPage === 1}
                        className="pagination-btn"
                      >
                        Précédent
                      </button>
                      <span className="pagination-info">
                        Page {tripsPagination.page} sur {tripsPagination.pages}
                        <span className="pagination-total">({tripsPagination.total} résultats)</span>
                      </span>
                      <button
                        onClick={() => setTripsPage(tripsPage + 1)}
                        disabled={tripsPage >= tripsPagination.pages}
                        className="pagination-btn"
                      >
                        Suivant
                      </button>
                      <button
                        onClick={() => setTripsPage(tripsPagination.pages)}
                        disabled={tripsPage >= tripsPagination.pages}
                        className="pagination-btn"
                      >
                        Dernier
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="admin-section">
              <div className="admin-header">
                <h1 className="admin-title">Gestion des réservations</h1>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => exportToCSV(bookings, 'reservations')}
                >
                  Exporter CSV
                </button>
              </div>
              
              <div className="admin-toolbar">
                <div className="admin-filters">
                  <select
                    value={bookingsFilter}
                    onChange={(e) => setBookingsFilter(e.target.value)}
                    className="admin-filter"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmées</option>
                    <option value="cancelled">Annulées</option>
                    <option value="completed">Terminées</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p>Chargement...</p>
                </div>
              ) : (
                <>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Passager</th>
                          <th>Conducteur</th>
                          <th>Trajet</th>
                          <th>Date</th>
                          <th>Places</th>
                          <th>Prix</th>
                          <th>Statut</th>
                          <th>Paiement</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="empty-row">Aucune réservation trouvée</td>
                          </tr>
                        ) : (
                          bookings.map(booking => (
                            <tr key={booking.id}>
                              <td>#{booking.id}</td>
                              <td>
                                <div className="user-name">{booking.passenger_first_name} {booking.passenger_last_name}</div>
                                <div className="text-muted">{booking.passenger_email}</div>
                              </td>
                              <td>{booking.driver_first_name} {booking.driver_last_name}</td>
                              <td>
                                <div className="route-cell">
                                  <span className="route-from">{formatAddress(booking.departure_location)}</span>
                                  <span className="route-arrow">-</span>
                                  <span className="route-to">{formatAddress(booking.arrival_location)}</span>
                                </div>
                              </td>
                              <td>{formatDate(booking.departure_datetime)}</td>
                              <td>{booking.seats_booked}</td>
                              <td><strong>{booking.total_price}€</strong></td>
                              <td>
                                <select
                                  value={booking.status}
                                  onChange={(e) => handleUpdateBooking(booking.id, { status: e.target.value })}
                                  className="status-select"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirmée</option>
                                  <option value="cancelled">Annulée</option>
                                  <option value="completed">Terminée</option>
                                </select>
                              </td>
                              <td>
                                <select
                                  value={booking.payment_status || 'pending'}
                                  onChange={(e) => handleUpdateBooking(booking.id, { payment_status: e.target.value })}
                                  className={`status-select payment-${booking.payment_status || 'pending'}`}
                                >
                                  <option value="pending">En attente</option>
                                  <option value="paid">Payé</option>
                                  <option value="refunded">Remboursé</option>
                                </select>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="action-btn danger"
                                    title="Supprimer"
                                  >
                                    X
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {bookingsPagination && bookingsPagination.pages > 1 && (
                    <div className="admin-pagination">
                      <button
                        onClick={() => setBookingsPage(1)}
                        disabled={bookingsPage === 1}
                        className="pagination-btn"
                      >
                        Premier
                      </button>
                      <button
                        onClick={() => setBookingsPage(bookingsPage - 1)}
                        disabled={bookingsPage === 1}
                        className="pagination-btn"
                      >
                        Précédent
                      </button>
                      <span className="pagination-info">
                        Page {bookingsPagination.page} sur {bookingsPagination.pages}
                        <span className="pagination-total">({bookingsPagination.total} résultats)</span>
                      </span>
                      <button
                        onClick={() => setBookingsPage(bookingsPage + 1)}
                        disabled={bookingsPage >= bookingsPagination.pages}
                        className="pagination-btn"
                      >
                        Suivant
                      </button>
                      <button
                        onClick={() => setBookingsPage(bookingsPagination.pages)}
                        disabled={bookingsPage >= bookingsPagination.pages}
                        className="pagination-btn"
                      >
                        Dernier
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal détail utilisateur */}
      {userDetailModal && (
        <div className="admin-modal-overlay" onClick={() => setUserDetailModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setUserDetailModal(null)}>X</button>
            
            <div className="admin-modal-header">
              <Avatar user={userDetailModal} size="large" />
              <div className="admin-modal-title">
                <h2>{userDetailModal.first_name} {userDetailModal.last_name}</h2>
                <p>{userDetailModal.email}</p>
              </div>
            </div>

            <div className="admin-modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID</label>
                  <span>{userDetailModal.id}</span>
                </div>
                <div className="detail-item">
                  <label>Téléphone</label>
                  <span>{userDetailModal.phone || "Non renseigné"}</span>
                </div>
                <div className="detail-item">
                  <label>Numéro étudiant</label>
                  <span>{userDetailModal.student_id || "Non renseigné"}</span>
                </div>
                <div className="detail-item">
                  <label>Université</label>
                  <span>{userDetailModal.university || "Non renseigné"}</span>
                </div>
                <div className="detail-item">
                  <label>Inscrit le</label>
                  <span>{formatDate(userDetailModal.created_at)}</span>
                </div>
                <div className="detail-item">
                  <label>Statuts</label>
                  <div className="status-badges">
                    <span className={`admin-badge ${userDetailModal.is_active ? 'success' : 'danger'}`}>
                      {userDetailModal.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {userDetailModal.is_verified && <span className="admin-badge info">Vérifié</span>}
                    {userDetailModal.is_admin && <span className="admin-badge warning">Admin</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  handleUpdateUser(userDetailModal.id, { is_active: !userDetailModal.is_active })
                  setUserDetailModal(null)
                }}
              >
                {userDetailModal.is_active ? 'Désactiver' : 'Activer'}
              </button>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={() => setUserDetailModal(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
