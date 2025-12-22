import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { adminAPI } from "../services/adminApi"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import "../styles/Admin.css"
import "../styles/HomePage.css"

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  
  // États pour le dashboard
  const [statistics, setStatistics] = useState(null)
  
  // États pour les utilisateurs
  const [users, setUsers] = useState([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState(null)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersFilter, setUsersFilter] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [userDetailModal, setUserDetailModal] = useState(null)
  
  // États pour les trajets
  const [trips, setTrips] = useState([])
  const [tripsPage, setTripsPage] = useState(1)
  const [tripsPagination, setTripsPagination] = useState(null)
  const [tripsFilter, setTripsFilter] = useState("")
  const [tripsSearch, setTripsSearch] = useState("")
  const [selectedTrips, setSelectedTrips] = useState([])
  
  // États pour les réservations
  const [bookings, setBookings] = useState([])
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsPagination, setBookingsPagination] = useState(null)
  const [bookingsFilter, setBookingsFilter] = useState("")

  // Notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Format helpers
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address) => {
    if (!address) return "-"
    const parts = address.split(',')
    return parts.length > 1 ? `${parts[0]}, ${parts[1]}` : address
  }

  // Export CSV
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
    
    if (!isAuthenticated() || !user?.is_admin) {
      console.log("Accès admin refusé:", { isAuthenticated: isAuthenticated(), user })
      navigate("/")
    }
  }, [user, isAuthenticated, navigate, authLoading])

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
    if (activeTab === "dashboard") {
      loadStatistics()
    }
  }, [activeTab, loadStatistics])

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers()
    }
  }, [activeTab, loadUsers])

  useEffect(() => {
    if (activeTab === "trips") {
      loadTrips()
    }
  }, [activeTab, loadTrips])

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings()
    }
  }, [activeTab, loadBookings])

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
            <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
              Tableau de bord
            </button>
            <div className="navbar-user-profile">
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
                <h1 className="admin-title">Tableau de bord</h1>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={loadStatistics}
                  disabled={loading}
                >
                  Actualiser
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
                      <div className="stat-content">
                        <div className="stat-value">{statistics.users.total}</div>
                        <div className="stat-label">Utilisateurs</div>
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
                      <div className="stat-content">
                        <div className="stat-value">{statistics.trips.total}</div>
                        <div className="stat-label">Trajets</div>
                        <div className="stat-details">
                          <span className="stat-detail-item">
                            <span className="stat-dot active"></span>
                            {statistics.trips.active} actifs
                          </span>
                          <span className="stat-detail-item">
                            <span className="stat-dot completed"></span>
                            {statistics.trips.completed} terminés
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="stat-card bookings">
                      <div className="stat-content">
                        <div className="stat-value">{statistics.bookings.total}</div>
                        <div className="stat-label">Réservations</div>
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
                      <div className="stat-content">
                        <div className="stat-value">{(statistics.revenue.total || 0).toFixed(2)}€</div>
                        <div className="stat-label">Revenu total</div>
                        <div className="stat-details">
                          <span className="stat-detail-item">Transactions payées</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-grid-2">
                    <div className="recent-section">
                      <div className="recent-header">
                        <h2>Derniers utilisateurs</h2>
                        <button 
                          className="admin-btn-link"
                          onClick={() => setActiveTab("users")}
                        >
                          Voir tout
                        </button>
                      </div>
                      <div className="recent-list">
                        {statistics.recent.users.length === 0 ? (
                          <p className="empty-text">Aucun utilisateur récent</p>
                        ) : (
                          statistics.recent.users.map(u => (
                            <div key={u.id} className="recent-item">
                              <Avatar user={u} size="small" />
                              <div className="recent-info">
                                <div className="recent-name">{u.first_name} {u.last_name}</div>
                                <div className="recent-detail">{u.email}</div>
                              </div>
                              <div className="recent-date">{formatDate(u.created_at)}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="recent-section">
                      <div className="recent-header">
                        <h2>Derniers trajets</h2>
                        <button 
                          className="admin-btn-link"
                          onClick={() => setActiveTab("trips")}
                        >
                          Voir tout
                        </button>
                      </div>
                      <div className="recent-list">
                        {statistics.recent.trips.length === 0 ? (
                          <p className="empty-text">Aucun trajet récent</p>
                        ) : (
                          statistics.recent.trips.map(trip => (
                            <div key={trip.id} className="recent-item">
                              <div className="recent-trip-icon">T</div>
                              <div className="recent-info">
                                <div className="recent-name">{formatAddress(trip.departure_location)} - {formatAddress(trip.arrival_location)}</div>
                                <div className="recent-detail">Par {trip.first_name} {trip.last_name}</div>
                              </div>
                              <div className="recent-date">{formatDate(trip.created_at)}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>Impossible de charger les statistiques</p>
                  <button className="admin-btn admin-btn-primary" onClick={loadStatistics}>
                    Réessayer
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
              <h1 className="admin-title">Gestion des réservations</h1>
              
              <div className="admin-filters">
                <select
                  value={bookingsFilter}
                  onChange={(e) => setBookingsFilter(e.target.value)}
                  className="admin-filter"
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="cancelled">Annulées</option>
                  <option value="completed">Terminées</option>
                </select>
              </div>

              {loading ? (
                <div className="loading">Chargement...</div>
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
                        {bookings.map(booking => (
                          <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.passenger_first_name} {booking.passenger_last_name}</td>
                            <td>{booking.driver_first_name} {booking.driver_last_name}</td>
                            <td>{booking.departure_location} → {booking.arrival_location}</td>
                            <td>{new Date(booking.departure_datetime).toLocaleDateString()}</td>
                            <td>{booking.seats_booked}</td>
                            <td>{booking.total_price}€</td>
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
                                value={booking.payment_status}
                                onChange={(e) => handleUpdateBooking(booking.id, { payment_status: e.target.value })}
                                className="status-select"
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
                                  className="btn-action btn-danger"
                                  title="Supprimer"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {bookingsPagination && (
                    <div className="pagination">
                      <button
                        onClick={() => setBookingsPage(bookingsPage - 1)}
                        disabled={bookingsPage === 1}
                        className="pagination-btn"
                      >
                        ← Précédent
                      </button>
                      <span className="pagination-info">
                        Page {bookingsPagination.page} / {bookingsPagination.pages}
                      </span>
                      <button
                        onClick={() => setBookingsPage(bookingsPage + 1)}
                        disabled={bookingsPage >= bookingsPagination.pages}
                        className="pagination-btn"
                      >
                        Suivant →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
