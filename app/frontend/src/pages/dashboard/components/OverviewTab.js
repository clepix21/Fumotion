/**
 * OverviewTab - Onglet vue d'ensemble du dashboard
 */
import { Link } from "react-router-dom"
import voiture from "../../../assets/icons/voiture.svg"
import ticketIcon from "../../../assets/icons/ticket.svg"
import starIcon from "../../../assets/icons/star.svg"
import targetIcon from "../../../assets/icons/target.svg"
import clockIcon from "../../../assets/icons/clock.svg"
import usersIcon from "../../../assets/icons/users.svg"
import moneyIcon from "../../../assets/icons/money.svg"

export default function OverviewTab({
    displayUser,
    myTrips,
    myBookings,
    pendingReviews,
    formatAddress,
    setActiveTab
}) {
    return (
        <div className="overview-section">
            <div className="overview-header">
                <div className="overview-welcome">
                    <h1>Bienvenue, {displayUser?.first_name || 'Utilisateur'} !</h1>
                    <p className="overview-subtitle">Voici un résumé de votre activité sur Fumotion</p>
                </div>
                <div className="overview-date">
                    <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-trips">
                    <div className="stat-icon-wrapper">
                        <img src={voiture} alt="voiture logo" style={{ width: '32px', height: 'auto' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-header-row">
                            <span className="stat-label">Trajets proposés</span>
                            <span className="stat-badge active">{myTrips.filter(t => t.status === 'active').length} actifs</span>
                        </div>
                        <h3>{myTrips.length}</h3>
                        <div className="stat-progress">
                            <div
                                className="stat-progress-bar trips"
                                style={{ width: `${myTrips.length > 0 ? (myTrips.filter(t => t.status === 'completed').length / myTrips.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="stat-detail">{myTrips.filter(t => t.status === 'completed').length} terminés</span>
                    </div>
                </div>

                <div className="stat-card stat-bookings">
                    <div className="stat-icon-wrapper">
                        <img src={ticketIcon} alt="ticket" className="icon-svg-stat" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-header-row">
                            <span className="stat-label">Réservations</span>
                            <span className="stat-badge pending">{myBookings.filter(b => b.status === 'pending').length} en attente</span>
                        </div>
                        <h3>{myBookings.length}</h3>
                        <div className="stat-progress">
                            <div
                                className="stat-progress-bar bookings"
                                style={{ width: `${myBookings.length > 0 ? (myBookings.filter(b => b.status === 'confirmed').length / myBookings.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="stat-detail">{myBookings.filter(b => b.status === 'confirmed').length} confirmées</span>
                    </div>
                </div>

                <div className="stat-card stat-rating">
                    <div className="stat-icon-wrapper">
                        <img src={starIcon} alt="star" className="icon-svg-stat" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-header-row">
                            <span className="stat-label">Note moyenne</span>
                            <span className="stat-badge rating">
                                {(() => {
                                    const rating = parseFloat(displayUser?.driver_rating) || 0;
                                    if (rating >= 4.5) return 'Excellent conducteur';
                                    if (rating >= 4) return 'Très bon conducteur';
                                    if (rating >= 3) return 'Bon conducteur';
                                    if (rating >= 2) return 'Conducteur à améliorer';
                                    if (rating > 0) return 'Conducteur débutant';
                                    return 'Pas encore noté';
                                })()}
                            </span>
                        </div>
                        <h3>{displayUser?.driver_rating ? parseFloat(displayUser.driver_rating).toFixed(1) : '-'}</h3>
                        <div className="star-display">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`star ${star <= Math.round(displayUser?.driver_rating || 4.8) ? 'filled' : ''}`}>★</span>
                            ))}
                        </div>
                        <span className="stat-detail">Basé sur {myTrips.filter(t => t.status === 'completed').length || 0} trajets</span>
                    </div>
                </div>
            </div>

            {/* Section Prochains trajets */}
            <div className="upcoming-section">
                <div className="section-header-row">
                    <h2><span className="section-icon"><img src={targetIcon} alt="target" className="icon-svg-heading" /></span> Prochains trajets</h2>
                    <button className="view-all-btn" onClick={() => setActiveTab("trips")}>Voir tout →</button>
                </div>

                {myTrips.filter(t => t.status === 'active' && new Date(t.departure_datetime) > new Date()).length === 0 ? (
                    <div className="upcoming-empty">
                        <p>Aucun trajet à venir</p>
                        <Link to="/create-trip" className="create-trip-mini">+ Créer un trajet</Link>
                    </div>
                ) : (
                    <div className="upcoming-trips-list">
                        {myTrips
                            .filter(t => t.status === 'active' && new Date(t.departure_datetime) > new Date())
                            .sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime))
                            .slice(0, 3)
                            .map((trip, index) => (
                                <div key={trip.id} className="upcoming-trip-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="trip-time-badge">
                                        <span className="trip-day">{new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                                        <span className="trip-date-num">{new Date(trip.departure_datetime).getDate()}</span>
                                        <span className="trip-month">{new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                                    </div>
                                    <div className="trip-route-info">
                                        <div className="route-visual">
                                            <span className="route-dot start"></span>
                                            <span className="route-line-mini"></span>
                                            <span className="route-dot end"></span>
                                        </div>
                                        <div className="route-addresses">
                                            <span className="route-from">{formatAddress(trip.departure_location)}</span>
                                            <span className="route-to">{formatAddress(trip.arrival_location)}</span>
                                        </div>
                                    </div>
                                    <div className="trip-meta">
                                        <span className="trip-time-display">
                                            <img src={clockIcon} alt="clock" className="icon-svg-inline" /> {new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="trip-seats-display">
                                            <img src={usersIcon} alt="users" className="icon-svg-inline" /> {trip.remaining_seats || trip.available_seats} places
                                        </span>
                                        <span className="trip-price-display">
                                            <img src={moneyIcon} alt="price" className="icon-svg-inline" /> {trip.price_per_seat}€
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Évaluations en attente */}
            {(pendingReviews.asPassenger?.length > 0 || pendingReviews.asDriver?.length > 0) && (
                <div className="pending-reviews-overview">
                    <div className="reviews-alert">
                        <span className="alert-icon">
                            <img src={starIcon} alt="star" className="icon-svg-alert" />
                        </span>
                        <div className="alert-content">
                            <h3>Évaluations en attente</h3>
                            <p>Vous avez {(pendingReviews.asPassenger?.length || 0) + (pendingReviews.asDriver?.length || 0)} évaluation(s) à effectuer</p>
                        </div>
                        <button className="review-action-btn" onClick={() => setActiveTab("reviews")}>
                            Évaluer maintenant
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
