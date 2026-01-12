/**
 * Page Tableau de bord utilisateur - Composant Principal
 * Affiche profil, trajets, réservations et statistiques
 */
import { Link } from "react-router-dom"
import Avatar from "../../components/common/Avatar"
import logo from "../../assets/images/logo.png"
import voiture from "../../assets/icons/voiture.svg"
import ticketIcon from "../../assets/icons/ticket.svg"
import starIcon from "../../assets/icons/star.svg"
import statsIcon from "../../assets/icons/stats.svg"
import profileIcon from "../../assets/icons/profile.svg"
import lumenIcon from "../../assets/icons/lumen.webp"
import "../../styles/Dashboard.css"
import "../../styles/HomePage.css"
import Footer from "../../components/common/Footer"
import FixedChatButton from "../../components/Chat/FixedChatButton"

// Hook et composants
import useDashboardData from "./hooks/useDashboardData"
import OverviewTab from "./components/OverviewTab"
import TripsTab from "./components/TripsTab"
import BookingsTab from "./components/BookingsTab"
import ReviewsTab from "./components/ReviewsTab"
import ProfileTab from "./components/ProfileTab"
import { TripDetailsModal, TripEditModal, ReviewModal } from "./components/Modals"

export default function DashboardPage() {
    const data = useDashboardData()
    const {
        user, userId, navigate, isOwnProfile, handleLogout,
        activeTab, setActiveTab, loading, mobileMenuOpen, setMobileMenuOpen,
        displayUser, formatDate, formatAddress,
        uploading, editMode, profileFormData, setProfileFormData, savingProfile,
        bannerInputRef, avatarInputRef, handleBannerUpload, handleAvatarUpload, toggleEditMode,
        myTrips, selectedTrip, showDetailsModal, showEditModal,
        editFormData, setEditFormData, tripPassengers, modalLoading, saving,
        openDetailsModal, openEditModal, closeModals,
        handleSaveTrip, handleCancelTrip, handleCompleteTrip,
        myBookings,
        pendingReviews, showReviewModal, setShowReviewModal,
        reviewData, setReviewData, currentReview, submittingReview,
        openReviewModal, handleSubmitReview
    } = data

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement du profil...</p>
            </div>
        )
    }

    // Vue profil d'un autre utilisateur
    if (!isOwnProfile) {
        return (
            <div className="dashboard">
                <nav className="navbar">
                    <div className="navbar-container">
                        <div className="navbar-brand" onClick={() => navigate("/")}>
                            <img src={logo} alt="Fumotion" className="brand-logo" />
                            <span className="brand-name">Fumotion</span>
                        </div>
                        <div className="navbar-menu">
                            <Link to="/search" className="navbar-link">Rechercher</Link>
                            <div className="navbar-divider"></div>
                            <button onClick={() => navigate("/dashboard")} className="navbar-btn-primary">
                                Mon profil
                            </button>
                        </div>
                    </div>
                </nav>
                <div className="dashboard-container" style={{ paddingTop: '2rem' }}>
                    <main className="dashboard-main" style={{ marginLeft: 0, maxWidth: '800px', margin: '0 auto' }}>
                        <div className="profile-section">
                            <div className="profile-card">
                                <div className="profile-banner-container">
                                    <div
                                        className="profile-banner"
                                        style={{
                                            backgroundImage: displayUser?.banner_picture
                                                ? `url(/uploads/${displayUser.banner_picture})`
                                                : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                                            backgroundSize: 'cover', backgroundPosition: 'center'
                                        }}
                                    />
                                    <div className="profile-avatar-container">
                                        <Avatar user={displayUser} size="xlarge" />
                                    </div>
                                </div>
                                <div className="profile-content">
                                    <div className="profile-header-info">
                                        <div className="profile-name-section">
                                            <h2>{displayUser?.first_name || ''} {displayUser?.last_name || ''}</h2>
                                            <p className="profile-joined">
                                                Membre depuis {displayUser?.created_at ? new Date(displayUser.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '2024'}
                                            </p>
                                            <p className="profile-bio">{displayUser?.bio || 'Pas de biographie...'}</p>
                                        </div>
                                        <button className="navbar-btn-primary" onClick={() => navigate(`/chat/${userId}`)}>
                                            Envoyer un message
                                        </button>
                                    </div>
                                    <div className="profile-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">{displayUser?.driver_rating ? parseFloat(displayUser.driver_rating).toFixed(1) : '-'}</span>
                                            <span className="stat-label">Note conducteur</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">{displayUser?.passenger_rating ? parseFloat(displayUser.passenger_rating).toFixed(1) : '-'}</span>
                                            <span className="stat-label">Note passager</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="dashboard">
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
                        <a href="/search" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                            Rechercher
                        </a>
                        <div className="navbar-divider"></div>
                        <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                            Créer un trajet
                        </button>
                        <div className="navbar-user-profile" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
                            <Avatar user={user} size="medium" />
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">{user?.first_name || user?.email}</span>
                            </div>
                        </div>
                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
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
                        <button className={`sidebar-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
                            <span className="btn-icon"><img src={statsIcon} alt="stats" className="icon-svg" /></span>
                            Vue d'ensemble
                        </button>
                    </div>
                    <div className="sidebar-section">
                        <h3>Trajets à Amiens</h3>
                        <button className={`sidebar-btn ${activeTab === "trips" ? "active" : ""}`} onClick={() => setActiveTab("trips")}>
                            <span className="btn-icon"><img src={voiture} alt="voiture" style={{ width: '30px', height: 'auto' }} /></span>
                            Mes trajets
                        </button>
                        <button className={`sidebar-btn ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
                            <span className="btn-icon"><img src={ticketIcon} alt="ticket" className="icon-svg" /></span>
                            Mes réservations
                        </button>
                        <button className={`sidebar-btn ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
                            <span className="btn-icon"><img src={starIcon} alt="star" className="icon-svg" /></span>
                            Évaluations
                            {(pendingReviews.asPassenger?.length > 0 || pendingReviews.asDriver?.length > 0) && (
                                <span className="badge-notification">
                                    {(pendingReviews.asPassenger?.length || 0) + (pendingReviews.asDriver?.length || 0)}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="sidebar-section">
                        <h3>Compte</h3>
                        <button className={`sidebar-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
                            <img src={profileIcon} alt="" className="icon-svg-sidebar" />
                            Profil
                        </button>
                        {!!user?.is_admin && (
                            <button className="sidebar-btn admin-btn" onClick={() => navigate("/admin")}>
                                <span className="btn-icon"><img src={lumenIcon} alt="Admin" style={{ width: '20px', height: '20px' }} /></span>
                                Administration
                            </button>
                        )}
                    </div>
                </aside>

                {/* Contenu principal */}
                <main className="dashboard-main">
                    {activeTab === "overview" && (
                        <OverviewTab
                            displayUser={displayUser}
                            myTrips={myTrips}
                            myBookings={myBookings}
                            pendingReviews={pendingReviews}
                            formatAddress={formatAddress}
                            setActiveTab={setActiveTab}
                        />
                    )}
                    {activeTab === "trips" && (
                        <TripsTab
                            myTrips={myTrips}
                            formatDate={formatDate}
                            formatAddress={formatAddress}
                            openDetailsModal={openDetailsModal}
                            openEditModal={openEditModal}
                            handleCompleteTrip={handleCompleteTrip}
                        />
                    )}
                    {activeTab === "bookings" && (
                        <BookingsTab
                            myBookings={myBookings}
                            formatDate={formatDate}
                        />
                    )}
                    {activeTab === "reviews" && (
                        <ReviewsTab
                            pendingReviews={pendingReviews}
                            displayUser={displayUser}
                            openReviewModal={openReviewModal}
                        />
                    )}
                    {activeTab === "profile" && (
                        <ProfileTab
                            displayUser={displayUser}
                            myTrips={myTrips}
                            myBookings={myBookings}
                            editMode={editMode}
                            profileFormData={profileFormData}
                            setProfileFormData={setProfileFormData}
                            savingProfile={savingProfile}
                            uploading={uploading}
                            bannerInputRef={bannerInputRef}
                            avatarInputRef={avatarInputRef}
                            handleBannerUpload={handleBannerUpload}
                            handleAvatarUpload={handleAvatarUpload}
                            toggleEditMode={toggleEditMode}
                        />
                    )}
                </main>
            </div>

            {/* Modales */}
            {showDetailsModal && selectedTrip && (
                <TripDetailsModal
                    selectedTrip={selectedTrip}
                    tripPassengers={tripPassengers}
                    modalLoading={modalLoading}
                    formatDate={formatDate}
                    closeModals={closeModals}
                    openEditModal={openEditModal}
                    handleCompleteTrip={handleCompleteTrip}
                    handleCancelTrip={handleCancelTrip}
                />
            )}
            {showEditModal && selectedTrip && (
                <TripEditModal
                    selectedTrip={selectedTrip}
                    editFormData={editFormData}
                    setEditFormData={setEditFormData}
                    saving={saving}
                    closeModals={closeModals}
                    handleSaveTrip={handleSaveTrip}
                />
            )}
            {showReviewModal && currentReview && (
                <ReviewModal
                    currentReview={currentReview}
                    reviewData={reviewData}
                    setReviewData={setReviewData}
                    submittingReview={submittingReview}
                    setShowReviewModal={setShowReviewModal}
                    handleSubmitReview={handleSubmitReview}
                />
            )}

            {/* Notification évaluations */}
            {(pendingReviews.asPassenger?.length > 0 || pendingReviews.asDriver?.length > 0) && (
                <div className="pending-reviews-notification">
                    <div className="notification-content">
                        <span className="notification-icon">
                            <img src={starIcon} alt="star" className="icon-svg-notif" />
                        </span>
                        <span className="notification-text">
                            Vous avez {(pendingReviews.asPassenger?.length || 0) + (pendingReviews.asDriver?.length || 0)} évaluation(s) en attente
                        </span>
                        <button className="notification-btn" onClick={() => setActiveTab("reviews")}>
                            Évaluer maintenant
                        </button>
                    </div>
                </div>
            )}

            <Footer />
            <FixedChatButton />
        </div>
    )
}
