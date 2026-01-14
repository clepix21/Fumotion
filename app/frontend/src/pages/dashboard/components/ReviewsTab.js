/**
 * ReviewsTab - Onglet des évaluations du dashboard
 */
import starIcon from "../../../assets/icons/star.svg"
import statsIcon from "../../../assets/icons/stats.svg"
import voiture from "../../../assets/icons/voiture.svg"
import profileIcon from "../../../assets/icons/profile.svg"

export default function ReviewsTab({
    pendingReviews,
    displayUser,
    openReviewModal
}) {
    return (
        <div className="reviews-section">
            <h1>Évaluations</h1>

            {/* Évaluations en attente */}
            {(pendingReviews.asPassenger?.length > 0 || pendingReviews.asDriver?.length > 0) && (
                <div className="pending-reviews-section">
                    <h2>Évaluations en attente</h2>
                    <p className="section-description">
                        Évaluez les personnes avec qui vous avez voyagé pour aider la communauté !
                    </p>

                    <div className="pending-reviews-grid">
                        {/* Évaluer les conducteurs */}
                        {pendingReviews.asPassenger?.map((item, index) => (
                            <div key={`driver-${index}`} className="pending-review-card">
                                <div className="pending-review-header">
                                    <div className="pending-review-avatar">
                                        {item.driver_first_name?.charAt(0)}
                                    </div>
                                    <div className="pending-review-info">
                                        <span className="pending-review-name">
                                            {item.driver_first_name} {item.driver_last_name}
                                        </span>
                                        <span className="pending-review-role">Conducteur</span>
                                    </div>
                                </div>
                                <div className="pending-review-trip">
                                    <span className="trip-route-mini">
                                        {item.departure_location?.split(',')[0]} → {item.arrival_location?.split(',')[0]}
                                    </span>
                                    <span className="trip-date-mini">
                                        {new Date(item.departure_datetime).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <button className="review-now-btn" onClick={() => openReviewModal(item)}>
                                    <img src={starIcon} alt="star" className="icon-svg-inline" /> Évaluer
                                </button>
                            </div>
                        ))}

                        {/* Évaluer les passagers */}
                        {pendingReviews.asDriver?.map((item, index) => (
                            <div key={`passenger-${index}`} className="pending-review-card">
                                <div className="pending-review-header">
                                    <div className="pending-review-avatar">
                                        {item.passenger_first_name?.charAt(0)}
                                    </div>
                                    <div className="pending-review-info">
                                        <span className="pending-review-name">
                                            {item.passenger_first_name} {item.passenger_last_name}
                                        </span>
                                        <span className="pending-review-role">Passager</span>
                                    </div>
                                </div>
                                <div className="pending-review-trip">
                                    <span className="trip-route-mini">
                                        {item.departure_location?.split(',')[0]} → {item.arrival_location?.split(',')[0]}
                                    </span>
                                    <span className="trip-date-mini">
                                        {new Date(item.departure_datetime).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <button className="review-now-btn" onClick={() => openReviewModal(item)}>
                                    Évaluer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Aucune évaluation en attente */}
            {pendingReviews.asPassenger?.length === 0 && pendingReviews.asDriver?.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <img src={starIcon} alt="star" className="icon-svg-large" />
                    </div>
                    <h3>Aucune évaluation en attente</h3>
                    <p>Vous avez évalué tous vos trajets terminés !</p>
                </div>
            )}

            <br />

            {/* Mes notes */}
            <div className="my-ratings-section">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={statsIcon} alt="stats" className="icon-svg-heading" />
                    Mes notes
                </h2>
                <div className="ratings-grid">
                    <div className="rating-card">
                        <div className="rating-icon"><img src={voiture} alt="" className="icon-svg-rating" /></div>
                        <div className="rating-info">
                            <span className="rating-value-large">
                                {displayUser?.driver_rating ? parseFloat(displayUser.driver_rating).toFixed(1) : '-'}
                            </span>
                            <span className="rating-label">Note Conducteur</span>
                        </div>
                    </div>
                    <div className="rating-card">
                        <div className="rating-icon"><img src={profileIcon} alt="" className="icon-svg-rating" /></div>
                        <div className="rating-info">
                            <span className="rating-value-large">
                                {displayUser?.passenger_rating ? parseFloat(displayUser.passenger_rating).toFixed(1) : '-'}
                            </span>
                            <span className="rating-label">Note Passager</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
