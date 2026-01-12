/**
 * Modales du Dashboard - Détails, Édition, Évaluation
 */
import starIcon from "../../../assets/icons/star.svg"

export function TripDetailsModal({
    selectedTrip,
    tripPassengers,
    modalLoading,
    formatDate,
    closeModals,
    openEditModal,
    handleCompleteTrip,
    handleCancelTrip
}) {
    if (!selectedTrip) return null

    return (
        <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content trip-details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModals}>✕</button>

                <div className="modal-header">
                    <h2>Détails du trajet</h2>
                    <span className={`trip-status ${selectedTrip.status}`}>
                        {selectedTrip.status === "active" ? "Actif" : selectedTrip.status === "completed" ? "Terminé" : "Annulé"}
                    </span>
                </div>

                {modalLoading ? (
                    <div className="modal-loading">
                        <div className="loading-spinner"></div>
                        <p>Chargement des détails...</p>
                    </div>
                ) : (
                    <>
                        <div className="trip-details-content">
                            <div className="detail-section">
                                <h3>Itinéraire</h3>
                                <div className="route-details">
                                    <div className="route-point departure-point">
                                        <div className="point-marker departure-marker"></div>
                                        <div className="point-info">
                                            <span className="point-label">Départ</span>
                                            <span className="point-address">{selectedTrip.departure_location}</span>
                                        </div>
                                    </div>
                                    <div className="route-line"></div>
                                    <div className="route-point arrival-point">
                                        <div className="point-marker arrival-marker"></div>
                                        <div className="point-info">
                                            <span className="point-label">Arrivée</span>
                                            <span className="point-address">{selectedTrip.arrival_location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Informations</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div>
                                            <span className="info-label">Date et heure</span>
                                            <span className="info-value">{formatDate(selectedTrip.departure_datetime)}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div>
                                            <span className="info-label">Places disponibles</span>
                                            <span className="info-value">{selectedTrip.remaining_seats || selectedTrip.available_seats} / {selectedTrip.available_seats}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div>
                                            <span className="info-label">Prix par place</span>
                                            <span className="info-value price">{selectedTrip.price_per_seat}€</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div>
                                            <span className="info-label">Réservations</span>
                                            <span className="info-value">{selectedTrip.bookings_count || 0} réservation(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedTrip.description && (
                                <div className="detail-section">
                                    <h3>Description</h3>
                                    <p className="trip-description">{selectedTrip.description}</p>
                                </div>
                            )}

                            <div className="detail-section">
                                <h3>Passagers confirmés ({tripPassengers.length})</h3>
                                {tripPassengers.length === 0 ? (
                                    <p className="no-passengers">Aucun passager pour le moment</p>
                                ) : (
                                    <div className="passengers-list">
                                        {tripPassengers.map((passenger, index) => (
                                            <div key={index} className="passenger-item">
                                                <div className="passenger-avatar">
                                                    {passenger.first_name?.charAt(0)}{passenger.last_name?.charAt(0)}
                                                </div>
                                                <div className="passenger-info">
                                                    <span className="passenger-name">{passenger.first_name} {passenger.last_name}</span>
                                                    <span className="passenger-seats">{passenger.seats_booked} place(s)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions">
                            {selectedTrip.status === 'active' && (
                                <button className="btn-success" onClick={() => handleCompleteTrip(selectedTrip.id)}>
                                    Trajet effectué
                                </button>
                            )}
                            <button
                                className="btn-secondary"
                                onClick={() => { closeModals(); openEditModal(selectedTrip); }}
                                disabled={selectedTrip.status !== 'active'}
                            >
                                Modifier
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => handleCancelTrip(selectedTrip.id)}
                                disabled={selectedTrip.status !== 'active'}
                            >
                                Annuler le trajet
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export function TripEditModal({
    selectedTrip,
    editFormData,
    setEditFormData,
    saving,
    closeModals,
    handleSaveTrip
}) {
    if (!selectedTrip) return null

    return (
        <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content trip-edit-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModals}>✕</button>

                <div className="modal-header">
                    <h2>Modifier le trajet</h2>
                </div>

                <form className="edit-trip-form" onSubmit={(e) => { e.preventDefault(); handleSaveTrip(); }}>
                    <div className="modal-form-group">
                        <label>Lieu de départ</label>
                        <input
                            type="text"
                            value={editFormData.departure_location}
                            onChange={(e) => setEditFormData({ ...editFormData, departure_location: e.target.value })}
                            placeholder="Adresse de départ"
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Lieu d'arrivée</label>
                        <input
                            type="text"
                            value={editFormData.arrival_location}
                            onChange={(e) => setEditFormData({ ...editFormData, arrival_location: e.target.value })}
                            placeholder="Adresse d'arrivée"
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Date et heure de départ</label>
                        <input
                            type="datetime-local"
                            value={editFormData.departure_datetime}
                            onChange={(e) => setEditFormData({ ...editFormData, departure_datetime: e.target.value })}
                            required
                        />
                    </div>
                    <div className="modal-form-row">
                        <div className="modal-form-group">
                            <label>Places disponibles</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={editFormData.available_seats}
                                onChange={(e) => setEditFormData({ ...editFormData, available_seats: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="modal-form-group">
                            <label>Prix par place (€)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={editFormData.price_per_seat}
                                onChange={(e) => setEditFormData({ ...editFormData, price_per_seat: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-form-group">
                        <label>Description (optionnel)</label>
                        <textarea
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            placeholder="Informations supplémentaires..."
                            rows="3"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={closeModals}>Annuler</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? (<><span className="spinner-small"></span>Enregistrement...</>) : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function ReviewModal({
    currentReview,
    reviewData,
    setReviewData,
    submittingReview,
    setShowReviewModal,
    handleSubmitReview
}) {
    if (!currentReview) return null

    return (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowReviewModal(false)}>✕</button>

                <div className="modal-header">
                    <h2>Évaluer {currentReview.review_type === 'driver' ? 'le conducteur' : 'le passager'}</h2>
                </div>

                <div className="review-content">
                    <div className="review-user-info">
                        <div className="review-avatar">
                            {currentReview.review_type === 'driver'
                                ? (currentReview.driver_first_name?.charAt(0) || '?')
                                : (currentReview.passenger_first_name?.charAt(0) || '?')
                            }
                        </div>
                        <div className="review-user-details">
                            <span className="review-user-name">
                                {currentReview.review_type === 'driver'
                                    ? `${currentReview.driver_first_name} ${currentReview.driver_last_name}`
                                    : `${currentReview.passenger_first_name} ${currentReview.passenger_last_name}`
                                }
                            </span>
                            <span className="review-trip-info">
                                {currentReview.departure_location?.split(',')[0]} → {currentReview.arrival_location?.split(',')[0]}
                            </span>
                        </div>
                    </div>

                    <div className="rating-section">
                        <label>Note</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= reviewData.rating ? 'active' : ''}`}
                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                >
                                    <img src={starIcon} alt="star" className="icon-svg-star" />
                                </button>
                            ))}
                        </div>
                        <span className="rating-value">{reviewData.rating}/5</span>
                    </div>

                    <div className="modal-form-group">
                        <label>Commentaire (optionnel)</label>
                        <textarea
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                            placeholder="Partagez votre expérience..."
                            rows="4"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowReviewModal(false)}>
                        Annuler
                    </button>
                    <button type="button" className="btn-primary" onClick={handleSubmitReview} disabled={submittingReview}>
                        {submittingReview ? 'Envoi...' : "Envoyer l'évaluation"}
                    </button>
                </div>
            </div>
        </div>
    )
}
