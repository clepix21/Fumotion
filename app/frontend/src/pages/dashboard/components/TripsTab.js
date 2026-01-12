/**
 * TripsTab - Onglet gestion des trajets du dashboard
 */
import { Link } from "react-router-dom"
import voiture from "../../../assets/icons/voiture.svg"

export default function TripsTab({
    myTrips,
    formatDate,
    formatAddress,
    openDetailsModal,
    openEditModal,
    handleCompleteTrip
}) {
    return (
        <div className="trips-section">
            <div className="section-header">
                <h1>Mes trajets proposés à Amiens</h1>
                <Link to="/create-trip" className="create-btn">
                    Nouveau trajet
                </Link>
            </div>

            {myTrips.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <img src={voiture} alt="voiture logo" style={{ width: '50px', height: 'auto' }} />
                    </div>
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
                                {trip.status === 'active' && (
                                    <button
                                        className="trip-btn success"
                                        onClick={() => handleCompleteTrip(trip.id)}
                                    >
                                        Trajet effectué
                                    </button>
                                )}
                                <button
                                    className="trip-btn secondary"
                                    onClick={() => openEditModal(trip)}
                                    disabled={trip.status !== 'active'}
                                >
                                    Modifier
                                </button>
                                <button
                                    className="trip-btn primary"
                                    onClick={() => openDetailsModal(trip)}
                                >
                                    Voir détails
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
