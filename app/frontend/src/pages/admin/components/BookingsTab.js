/**
 * Composant BookingsTab - Onglet gestion des réservations
 * Tableau des réservations avec filtres et actions
 */
export default function BookingsTab({
    bookings,
    loading,
    bookingsFilter,
    setBookingsFilter,
    bookingsPage,
    setBookingsPage,
    bookingsPagination,
    formatDate,
    formatAddress,
    exportToCSV,
    exportToJSON,
    handleUpdateBooking,
    handleDeleteBooking
}) {
    return (
        <div className="admin-section">
            <div className="admin-header">
                <h1 className="admin-title">Gestion des réservations</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => exportToCSV(bookings, 'reservations')}
                    >
                        Exporter CSV
                    </button>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => exportToJSON(bookings, 'reservations')}
                    >
                        Exporter JSON
                    </button>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-filters">
                    <select
                        value={bookingsFilter}
                        onChange={(e) => setBookingsFilter(e.target.value)}
                        className="admin-filter"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmées</option>
                        <option value="cancelled">Annulées</option>
                        <option value="completed">Terminées</option>
                    </select>
                </div>
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
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="empty-row">Aucune réservation trouvée</td>
                                    </tr>
                                ) : (
                                    bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>#{booking.id}</td>
                                            <td>
                                                <div className="user-name">{booking.passenger_first_name} {booking.passenger_last_name}</div>
                                                <div className="text-muted">{booking.passenger_email}</div>
                                            </td>
                                            <td>{booking.driver_first_name} {booking.driver_last_name}</td>
                                            <td>
                                                <div className="route-cell">
                                                    <span className="route-from">{formatAddress(booking.departure_location)}</span>
                                                    <span className="route-arrow">-</span>
                                                    <span className="route-to">{formatAddress(booking.arrival_location)}</span>
                                                </div>
                                            </td>
                                            <td>{formatDate(booking.departure_datetime)}</td>
                                            <td>{booking.seats_booked}</td>
                                            <td><strong>{booking.total_price}€</strong></td>
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
                                                    value={booking.payment_status || 'pending'}
                                                    onChange={(e) => handleUpdateBooking(booking.id, { payment_status: e.target.value })}
                                                    className={`status-select payment-${booking.payment_status || 'pending'}`}
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

                    {bookingsPagination && bookingsPagination.pages > 1 && (
                        <div className="admin-pagination">
                            <button
                                onClick={() => setBookingsPage(1)}
                                disabled={bookingsPage === 1}
                                className="pagination-btn"
                            >
                                Premier
                            </button>
                            <button
                                onClick={() => setBookingsPage(bookingsPage - 1)}
                                disabled={bookingsPage === 1}
                                className="pagination-btn"
                            >
                                Précédent
                            </button>
                            <span className="pagination-info">
                                Page {bookingsPagination.page} sur {bookingsPagination.pages}
                                <span className="pagination-total">({bookingsPagination.total} résultats)</span>
                            </span>
                            <button
                                onClick={() => setBookingsPage(bookingsPage + 1)}
                                disabled={bookingsPage >= bookingsPagination.pages}
                                className="pagination-btn"
                            >
                                Suivant
                            </button>
                            <button
                                onClick={() => setBookingsPage(bookingsPagination.pages)}
                                disabled={bookingsPage >= bookingsPagination.pages}
                                className="pagination-btn"
                            >
                                Dernier
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
