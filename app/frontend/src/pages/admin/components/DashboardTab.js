/**
 * Composant DashboardTab - Onglet tableau de bord admin
 * Affiche les statistiques globales et les éléments récents
 */
import statsIcon from "../../../assets/icons/stats.svg"
import usersIcon from "../../../assets/icons/users.svg"
import voitureIcon from "../../../assets/icons/voiture.svg"
import clipboardIcon from "../../../assets/icons/clipboard.svg"
import alertIcon from "../../../assets/icons/alert.svg"
import moneyIcon from "../../../assets/icons/money.svg"
import checkCircleIcon from "../../../assets/icons/check-circle.svg"
import targetIcon from "../../../assets/icons/target.svg"
import clockIcon from "../../../assets/icons/clock.svg"
import locationIcon from "../../../assets/icons/location.svg"
import profileIcon from "../../../assets/icons/profile.svg"
import refreshIcon from "../../../assets/icons/refresh.svg"
import Avatar from "../../../components/common/Avatar"

export default function DashboardTab({
    statistics,
    loading,
    loadStatistics,
    formatDate,
    formatAddress,
    setActiveTab
}) {
    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner"></div>
                <p>Chargement des statistiques...</p>
            </div>
        )
    }

    if (!statistics) {
        return (
            <div className="empty-state">
                <span className="empty-state-icon">
                    <img src={statsIcon} alt="stats" className="icon-svg-empty" />
                </span>
                <p>Impossible de charger les statistiques</p>
                <button className="admin-btn admin-btn-primary" onClick={loadStatistics}>
                    <img src={refreshIcon} alt="" className="btn-icon-svg" /> Réessayer
                </button>
            </div>
        )
    }

    return (
        <>
            <div className="stats-grid">
                {/* Utilisateurs */}
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

                {/* Trajets */}
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

                {/* Réservations */}
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

                {/* Revenu */}
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
                        <div className="stat-value">{(parseFloat(statistics.revenue.total) || 0).toFixed(2)}€</div>
                        <div className="stat-details">
                            <span className="stat-detail-item">
                                <span className="stat-dot confirmed"></span>
                                Paiements confirmés
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
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

            {/* Sections récentes */}
            <div className="admin-grid-2">
                {/* Derniers utilisateurs */}
                <div className="recent-section">
                    <div className="recent-header">
                        <div className="recent-header-title">
                            <img src={profileIcon} alt="" className="icon-svg-heading" />
                            <h2>Derniers utilisateurs</h2>
                        </div>
                        <button className="admin-btn-link" onClick={() => setActiveTab("users")}>
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

                {/* Derniers trajets */}
                <div className="recent-section">
                    <div className="recent-header">
                        <div className="recent-header-title">
                            <span className="recent-header-icon"><img src={voitureIcon} alt="" className="icon-svg-heading" /></span>
                            <h2>Derniers trajets</h2>
                        </div>
                        <button className="admin-btn-link" onClick={() => setActiveTab("trips")}>
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
    )
}
