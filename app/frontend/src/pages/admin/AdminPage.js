/**
 * Page d'administration - Composant principal
 * Tableau de bord, gestion des utilisateurs, trajets et réservations
 */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Avatar from "../../components/common/Avatar"
import logo from "../../assets/images/logo.png"
import "../../styles/Admin.css"
import "../../styles/HomePage.css"

// Hook et composants
import useAdminData from "./hooks/useAdminData"
import DashboardTab from "./components/DashboardTab"
import UsersTab from "./components/UsersTab"
import TripsTab from "./components/TripsTab"
import BookingsTab from "./components/BookingsTab"
import UserDetailModal from "./components/UserDetailModal"

export default function AdminPage() {
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Utilisation du hook centralisé
    const adminData = useAdminData()
    const {
        user, handleLogout,
        activeTab, setActiveTab, loading, notification,
        formatDate, formatAddress, exportToCSV, exportToJSON,
        statistics, loadStatistics,
        users, usersPage, setUsersPage, usersPagination,
        usersSearch, setUsersSearch, usersFilter, setUsersFilter,
        selectedUsers, toggleUserSelection, toggleAllUsers,
        userDetailModal, setUserDetailModal,
        handleUpdateUser, handleDeleteUser, handleBulkUserAction,
        trips, tripsPage, setTripsPage, tripsPagination,
        tripsSearch, setTripsSearch, tripsFilter, setTripsFilter,
        selectedTrips, toggleTripSelection, toggleAllTrips,
        handleUpdateTrip, handleDeleteTrip, handleBulkTripAction,
        bookings, bookingsPage, setBookingsPage, bookingsPagination,
        bookingsFilter, setBookingsFilter,
        handleUpdateBooking, handleDeleteBooking
    } = adminData

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
                                </button>
                            </div>
                            <DashboardTab
                                statistics={statistics}
                                loading={loading}
                                loadStatistics={loadStatistics}
                                formatDate={formatDate}
                                formatAddress={formatAddress}
                                setActiveTab={setActiveTab}
                            />
                        </div>
                    )}

                    {activeTab === "users" && (
                        <UsersTab
                            users={users}
                            loading={loading}
                            usersSearch={usersSearch}
                            setUsersSearch={setUsersSearch}
                            usersFilter={usersFilter}
                            setUsersFilter={setUsersFilter}
                            selectedUsers={selectedUsers}
                            toggleUserSelection={toggleUserSelection}
                            toggleAllUsers={toggleAllUsers}
                            usersPage={usersPage}
                            setUsersPage={setUsersPage}
                            usersPagination={usersPagination}
                            formatDate={formatDate}
                            exportToCSV={exportToCSV}
                            exportToJSON={exportToJSON}
                            setUserDetailModal={setUserDetailModal}
                            handleUpdateUser={handleUpdateUser}
                            handleDeleteUser={handleDeleteUser}
                            handleBulkUserAction={handleBulkUserAction}
                        />
                    )}

                    {activeTab === "trips" && (
                        <TripsTab
                            trips={trips}
                            loading={loading}
                            tripsSearch={tripsSearch}
                            setTripsSearch={setTripsSearch}
                            tripsFilter={tripsFilter}
                            setTripsFilter={setTripsFilter}
                            selectedTrips={selectedTrips}
                            toggleTripSelection={toggleTripSelection}
                            toggleAllTrips={toggleAllTrips}
                            tripsPage={tripsPage}
                            setTripsPage={setTripsPage}
                            tripsPagination={tripsPagination}
                            formatDate={formatDate}
                            formatAddress={formatAddress}
                            exportToCSV={exportToCSV}
                            exportToJSON={exportToJSON}
                            handleUpdateTrip={handleUpdateTrip}
                            handleDeleteTrip={handleDeleteTrip}
                            handleBulkTripAction={handleBulkTripAction}
                        />
                    )}

                    {activeTab === "bookings" && (
                        <BookingsTab
                            bookings={bookings}
                            loading={loading}
                            bookingsFilter={bookingsFilter}
                            setBookingsFilter={setBookingsFilter}
                            bookingsPage={bookingsPage}
                            setBookingsPage={setBookingsPage}
                            bookingsPagination={bookingsPagination}
                            formatDate={formatDate}
                            formatAddress={formatAddress}
                            exportToCSV={exportToCSV}
                            exportToJSON={exportToJSON}
                            handleUpdateBooking={handleUpdateBooking}
                            handleDeleteBooking={handleDeleteBooking}
                        />
                    )}
                </main>
            </div>

            {/* Modal détail utilisateur */}
            <UserDetailModal
                user={userDetailModal}
                onClose={() => setUserDetailModal(null)}
                formatDate={formatDate}
                handleUpdateUser={handleUpdateUser}
            />
        </div>
    )
}
