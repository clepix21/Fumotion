/**
 * BookingsTab - Onglet des réservations du dashboard
 */
import { Link, useNavigate } from "react-router-dom"
import ticketIcon from "../../../assets/icons/ticket.svg"

export default function BookingsTab({
    myBookings,
    formatDate
}) {
    const navigate = useNavigate()

    return (
        <div className="bookings-section">
            <h1>Mes réservations à Amiens</h1>

            {myBookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <img src={ticketIcon} alt="ticket" className="icon-svg-large" />
                    </div>
                    <h3>Aucune réservation</h3>
                    <p>Vous n'avez pas encore réservé de trajet dans Amiens</p>
                    <Link to="/search" className="empty-action">
                        Chercher un trajet
                    </Link>
                </div>
            ) : (
                <div className="bookings-list">
                    {myBookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-info">
                                <div className="booking-route">
                                    <span className="departure">{booking.departure_location}</span>
                                    <span className="arrow">→</span>
                                    <span className="arrival">{booking.arrival_location}</span>
                                </div>
                                <p className="booking-date">{formatDate(booking.departure_datetime)}</p>
                                <p className="booking-driver">
                                    Conducteur: {booking.driver_first_name} {booking.driver_last_name}
                                </p>
                            </div>
                            <div className="booking-details">
                                <span className="booking-price">{booking.total_price}€</span>
                                <span className="booking-seats">{booking.seats_booked} place(s)</span>
                                <span className={`booking-status ${booking.status || booking.booking_status}`}>
                                    {booking.status === "confirmed"
                                        ? "Confirmé"
                                        : booking.status === "pending"
                                            ? "En attente"
                                            : booking.status === "cancelled"
                                                ? "Annulé"
                                                : "Terminé"}
                                </span>
                                {booking.driver_id && (
                                    <button
                                        onClick={() => navigate(`/chat/${booking.driver_id}`)}
                                        className="contact-driver-btn"
                                    >
                                        Contacter le conducteur
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
