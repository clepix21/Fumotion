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
  
  // États pour le dashboard
  const [statistics, setStatistics] = useState(null)
  
  // États pour les utilisateurs
  const [users, setUsers] = useState([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState(null)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersFilter, setUsersFilter] = useState("")
  
  // États pour les trajets
  const [trips, setTrips] = useState([])
  const [tripsPage, setTripsPage] = useState(1)
  const [tripsPagination, setTripsPagination] = useState(null)
  const [tripsFilter, setTripsFilter] = useState("")
  
  // États pour les réservations
  const [bookings, setBookings] = useState([])
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsPagination, setBookingsPagination] = useState(null)
  const [bookingsFilter, setBookingsFilter] = useState("")

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
    } finally {
      setLoading(false)
    }
  }, [usersPage, usersSearch, usersFilter])

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page: tripsPage, limit: 20 }
      if (tripsFilter) params.status = tripsFilter

      const response = await adminAPI.getAllTrips(params)
      if (response.success) {
        setTrips(response.data)
        setTripsPagination(response.pagination)
      }
    } catch (error) {
      console.error("Erreur chargement trajets:", error)
    } finally {
      setLoading(false)
    }
  }, [tripsPage, tripsFilter])

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
      }
    } catch (error) {
      console.error("Erreur mise à jour utilisateur:", error)
      alert("Erreur lors de la mise à jour")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return

    try {
      const response = await adminAPI.deleteUser(userId)
      if (response.success) {
        loadUsers()
      }
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleUpdateTrip = async (tripId, status) => {
    try {
      const response = await adminAPI.updateTrip(tripId, { status })
      if (response.success) {
        loadTrips()
      }
    } catch (error) {
      console.error("Erreur mise à jour trajet:", error)
      alert("Erreur lors de la mise à jour")
    }
  }

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) return

    try {
      const response = await adminAPI.deleteTrip(tripId)
      if (response.success) {
        loadTrips()
      }
    } catch (error) {
      console.error("Erreur suppression trajet:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleUpdateBooking = async (bookingId, updates) => {
    try {
      const response = await adminAPI.updateBooking(bookingId, updates)
      if (response.success) {
        loadBookings()
      }
    } catch (error) {
      console.error("Erreur mise à jour réservation:", error)
      alert("Erreur lors de la mise à jour")
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return

    try {
      const response = await adminAPI.deleteBooking(bookingId)
      if (response.success) {
        loadBookings()
      }
    } catch (error) {
      console.error("Erreur suppression réservation:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Fumotion" className="brand-logo" />
            <span className="brand-name">Fumotion Admin</span>
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
              <span className="sidebar-icon">📊</span>
              <span>Tableau de bord</span>
            </button>
            <button 
              className={`sidebar-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <span className="sidebar-icon">👥</span>
              <span>Utilisateurs</span>
            </button>
            <button 
              className={`sidebar-item ${activeTab === "trips" ? "active" : ""}`}
              onClick={() => setActiveTab("trips")}
            >
              <span className="sidebar-icon">🚗</span>
              <span>Trajets</span>
            </button>
            <button 
              className={`sidebar-item ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              <span className="sidebar-icon">📝</span>
              <span>Réservations</span>
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="admin-content">
          {activeTab === "dashboard" && (
            <div className="admin-section">
              <h1 className="admin-title">Tableau de bord</h1>
              
              {loading ? (
                <div className="loading">Chargement...</div>
              ) : statistics ? (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <div className="stat-value">{statistics.users.total}</div>
                        <div className="stat-label">Utilisateurs</div>
                        <div className="stat-details">
                          {statistics.users.active} actifs • {statistics.users.verified} vérifiés
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">🚗</div>
                      <div className="stat-content">
                        <div className="stat-value">{statistics.trips.total}</div>
                        <div className="stat-label">Trajets</div>
                        <div className="stat-details">
                          {statistics.trips.active} actifs • {statistics.trips.completed} terminés
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">📝</div>
                      <div className="stat-content">
                        <div className="stat-value">{statistics.bookings.total}</div>
                        <div className="stat-label">Réservations</div>
                        <div className="stat-details">
                          {statistics.bookings.confirmed} confirmées • {statistics.bookings.pending} en attente
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <div className="stat-value">{statistics.revenue.total.toFixed(2)}€</div>
                        <div className="stat-label">Revenu total</div>
                        <div className="stat-details">Transactions payées</div>
                      </div>
                    </div>
                  </div>

                  <div className="recent-section">
                    <h2>Derniers utilisateurs</h2>
                    <div className="recent-list">
                      {statistics.recent.users.map(user => (
                        <div key={user.id} className="recent-item">
                          <div>{user.first_name} {user.last_name}</div>
                          <div className="recent-detail">{user.email}</div>
                          <div className="recent-date">{new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="recent-section">
                    <h2>Derniers trajets</h2>
                    <div className="recent-list">
                      {statistics.recent.trips.map(trip => (
                        <div key={trip.id} className="recent-item">
                          <div>{trip.departure_location} → {trip.arrival_location}</div>
                          <div className="recent-detail">Par {trip.first_name} {trip.last_name}</div>
                          <div className="recent-date">{new Date(trip.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {activeTab === "users" && (
            <div className="admin-section">
              <h1 className="admin-title">Gestion des utilisateurs</h1>
              
              <div className="admin-filters">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="admin-search"
                />
                <select
                  value={usersFilter}
                  onChange={(e) => setUsersFilter(e.target.value)}
                  className="admin-filter"
                >
                  <option value="">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
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
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Université</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.first_name} {user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone || "-"}</td>
                            <td>{user.university}</td>
                            <td>
                              <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                {user.is_active ? 'Actif' : 'Inactif'}
                              </span>
                              {user.is_verified && <span className="status-badge verified">✓</span>}
                              {user.is_admin && <span className="status-badge admin">Admin</span>}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                                  className="btn-action"
                                  title={user.is_active ? "Désactiver" : "Activer"}
                                >
                                  {user.is_active ? "⏸" : "▶"}
                                </button>
                                <button
                                  onClick={() => handleUpdateUser(user.id, { is_verified: !user.is_verified })}
                                  className="btn-action"
                                  title={user.is_verified ? "Retirer vérification" : "Vérifier"}
                                >
                                  {user.is_verified ? "✓" : "?"}
                                </button>
                                <button
                                  onClick={() => handleUpdateUser(user.id, { is_admin: !user.is_admin })}
                                  className="btn-action"
                                  title={user.is_admin ? "Retirer admin" : "Promouvoir admin"}
                                  disabled={user.email === "admin@fumotion.com"}
                                >
                                  👑
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="btn-action btn-danger"
                                  title="Supprimer"
                                  disabled={user.email === "admin@fumotion.com"}
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

                  {usersPagination && (
                    <div className="pagination">
                      <button
                        onClick={() => setUsersPage(usersPage - 1)}
                        disabled={usersPage === 1}
                        className="pagination-btn"
                      >
                        ← Précédent
                      </button>
                      <span className="pagination-info">
                        Page {usersPagination.page} / {usersPagination.pages}
                      </span>
                      <button
                        onClick={() => setUsersPage(usersPage + 1)}
                        disabled={usersPage >= usersPagination.pages}
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

          {activeTab === "trips" && (
            <div className="admin-section">
              <h1 className="admin-title">Gestion des trajets</h1>
              
              <div className="admin-filters">
                <select
                  value={tripsFilter}
                  onChange={(e) => setTripsFilter(e.target.value)}
                  className="admin-filter"
                >
                  <option value="">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Terminés</option>
                  <option value="cancelled">Annulés</option>
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
                          <th>Conducteur</th>
                          <th>Départ</th>
                          <th>Arrivée</th>
                          <th>Date</th>
                          <th>Places</th>
                          <th>Prix</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trips.map(trip => (
                          <tr key={trip.id}>
                            <td>{trip.id}</td>
                            <td>{trip.first_name} {trip.last_name}</td>
                            <td>{trip.departure_location}</td>
                            <td>{trip.arrival_location}</td>
                            <td>{new Date(trip.departure_datetime).toLocaleString()}</td>
                            <td>{trip.available_seats}</td>
                            <td>{trip.price_per_seat}€</td>
                            <td>
                              <span className={`status-badge ${trip.status}`}>
                                {trip.status === 'active' ? 'Actif' : trip.status === 'completed' ? 'Terminé' : 'Annulé'}
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

                  {tripsPagination && (
                    <div className="pagination">
                      <button
                        onClick={() => setTripsPage(tripsPage - 1)}
                        disabled={tripsPage === 1}
                        className="pagination-btn"
                      >
                        ← Précédent
                      </button>
                      <span className="pagination-info">
                        Page {tripsPagination.page} / {tripsPagination.pages}
                      </span>
                      <button
                        onClick={() => setTripsPage(tripsPage + 1)}
                        disabled={tripsPage >= tripsPagination.pages}
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
