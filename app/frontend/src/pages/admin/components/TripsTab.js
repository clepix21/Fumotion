/**
 * Composant TripsTab - Onglet gestion des trajets
 * Tableau des trajets avec recherche, filtres et actions
 */
export default function TripsTab({
    trips,
    loading,
    tripsSearch,
    setTripsSearch,
    tripsFilter,
    setTripsFilter,
    selectedTrips,
    toggleTripSelection,
    toggleAllTrips,
    tripsPage,
    setTripsPage,
    tripsPagination,
    formatDate,
    formatAddress,
    exportToCSV,
    exportToJSON,
    handleUpdateTrip,
    handleDeleteTrip,
    handleBulkTripAction
}) {
    return (
        <div className="admin-section">
            <div className="admin-header">
                <h1 className="admin-title">Gestion des trajets</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => exportToCSV(trips, 'trajets')}
                    >
                        Exporter CSV
                    </button>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => exportToJSON(trips, 'trajets')}
                    >
                        Exporter JSON
                    </button>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Rechercher un trajet..."
                        value={tripsSearch}
                        onChange={(e) => setTripsSearch(e.target.value)}
                        className="admin-search"
                    />
                    <select
                        value={tripsFilter}
                        onChange={(e) => setTripsFilter(e.target.value)}
                        className="admin-filter"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="completed">Terminés</option>
                        <option value="cancelled">Annulés</option>
                    </select>
                </div>

                {selectedTrips.length > 0 && (
                    <div className="bulk-actions">
                        <span className="bulk-count">{selectedTrips.length} sélectionné(s)</span>
                        <button
                            className="admin-btn admin-btn-sm"
                            onClick={() => handleBulkTripAction('completed')}
                        >
                            Marquer terminé
                        </button>
                        <button
                            className="admin-btn admin-btn-sm"
                            onClick={() => handleBulkTripAction('cancelled')}
                        >
                            Annuler
                        </button>
                        <button
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => handleBulkTripAction('delete')}
                        >
                            Supprimer
                        </button>
                    </div>
                )}
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
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedTrips.length === trips.length && trips.length > 0}
                                            onChange={toggleAllTrips}
                                        />
                                    </th>
                                    <th>ID</th>
                                    <th>Conducteur</th>
                                    <th>Itinéraire</th>
                                    <th>Date</th>
                                    <th>Places</th>
                                    <th>Prix</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="empty-row">Aucun trajet trouvé</td>
                                    </tr>
                                ) : (
                                    trips.map(trip => (
                                        <tr key={trip.id} className={selectedTrips.includes(trip.id) ? 'selected' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTrips.includes(trip.id)}
                                                    onChange={() => toggleTripSelection(trip.id)}
                                                />
                                            </td>
                                            <td>#{trip.id}</td>
                                            <td>
                                                <div className="user-cell">
                                                    <div>
                                                        <div className="user-name">{trip.first_name} {trip.last_name}</div>
                                                        <div className="text-muted">{trip.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="route-cell">
                                                    <span className="route-from">{formatAddress(trip.departure_location)}</span>
                                                    <span className="route-arrow">-</span>
                                                    <span className="route-to">{formatAddress(trip.arrival_location)}</span>
                                                </div>
                                            </td>
                                            <td>{formatDate(trip.departure_datetime)}</td>
                                            <td>{trip.available_seats}</td>
                                            <td><strong>{trip.price_per_seat}€</strong></td>
                                            <td>
                                                <span className={`admin-badge ${trip.status === 'active' ? 'success' :
                                                    trip.status === 'completed' ? 'info' : 'danger'
                                                    }`}>
                                                    {trip.status === 'active' ? 'Actif' :
                                                        trip.status === 'completed' ? 'Terminé' : 'Annulé'}
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

                    {tripsPagination && tripsPagination.pages > 1 && (
                        <div className="admin-pagination">
                            <button
                                onClick={() => setTripsPage(1)}
                                disabled={tripsPage === 1}
                                className="pagination-btn"
                            >
                                Premier
                            </button>
                            <button
                                onClick={() => setTripsPage(tripsPage - 1)}
                                disabled={tripsPage === 1}
                                className="pagination-btn"
                            >
                                Précédent
                            </button>
                            <span className="pagination-info">
                                Page {tripsPagination.page} sur {tripsPagination.pages}
                                <span className="pagination-total">({tripsPagination.total} résultats)</span>
                            </span>
                            <button
                                onClick={() => setTripsPage(tripsPage + 1)}
                                disabled={tripsPage >= tripsPagination.pages}
                                className="pagination-btn"
                            >
                                Suivant
                            </button>
                            <button
                                onClick={() => setTripsPage(tripsPagination.pages)}
                                disabled={tripsPage >= tripsPagination.pages}
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
