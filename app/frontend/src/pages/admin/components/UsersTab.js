/**
 * Composant UsersTab - Onglet gestion des utilisateurs
 * Tableau des utilisateurs avec recherche, filtres et actions
 */
import Avatar from "../../../components/common/Avatar"

export default function UsersTab({
    users,
    loading,
    usersSearch,
    setUsersSearch,
    usersFilter,
    setUsersFilter,
    selectedUsers,
    toggleUserSelection,
    toggleAllUsers,
    usersPage,
    setUsersPage,
    usersPagination,
    formatDate,
    exportToCSV,
    exportToJSON,
    setUserDetailModal,
    handleUpdateUser,
    handleDeleteUser,
    handleBulkUserAction
}) {
    return (
        <div className="admin-section">
            <div className="admin-header">
                <h1 className="admin-title">Gestion des utilisateurs</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => exportToCSV(users, 'utilisateurs')}
                    >
                        Exporter CSV
                    </button>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => exportToJSON(users, 'utilisateurs')}
                    >
                        Exporter JSON
                    </button>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        className="admin-search"
                    />
                    <select
                        value={usersFilter}
                        onChange={(e) => setUsersFilter(e.target.value)}
                        className="admin-filter"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                    </select>
                </div>

                {selectedUsers.length > 0 && (
                    <div className="bulk-actions">
                        <span className="bulk-count">{selectedUsers.length} sélectionné(s)</span>
                        <button
                            className="admin-btn admin-btn-sm"
                            onClick={() => handleBulkUserAction('activate')}
                        >
                            Activer
                        </button>
                        <button
                            className="admin-btn admin-btn-sm"
                            onClick={() => handleBulkUserAction('deactivate')}
                        >
                            Désactiver
                        </button>
                        <button
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => handleBulkUserAction('delete')}
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
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onChange={toggleAllUsers}
                                        />
                                    </th>
                                    <th>Utilisateur</th>
                                    <th>Contact</th>
                                    <th>Université</th>
                                    <th>Statut</th>
                                    <th>Inscrit le</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-row">Aucun utilisateur trouvé</td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className={selectedUsers.includes(u.id) ? 'selected' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(u.id)}
                                                    onChange={() => toggleUserSelection(u.id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="user-cell">
                                                    <Avatar user={u} size="small" />
                                                    <div>
                                                        <div className="user-name">{u.first_name} {u.last_name}</div>
                                                        <div className="user-id">ID: {u.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-cell">
                                                    <div>{u.email}</div>
                                                    <div className="text-muted">{u.phone || "-"}</div>
                                                </div>
                                            </td>
                                            <td>{u.university || "-"}</td>
                                            <td>
                                                <div className="status-badges">
                                                    <span className={`admin-badge ${u.is_active ? 'success' : 'danger'}`}>
                                                        {u.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                    <span className={`admin-badge ${u.is_verified ? 'info' : 'danger'}`}>
                                                        {u.is_verified ? 'Vérifié' : 'Non vérifié'}
                                                    </span>
                                                    <span className={`admin-badge ${u.is_admin ? 'warning' : 'danger'}`}>
                                                        {u.is_admin ? 'Admin' : 'Utilisateur'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{formatDate(u.created_at)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        onClick={() => setUserDetailModal(u)}
                                                        className="action-btn"
                                                        title="Voir détails"
                                                    >
                                                        Voir
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                                                        className="action-btn"
                                                        title={u.is_active ? "Désactiver" : "Activer"}
                                                    >
                                                        {u.is_active ? "Désactiver" : "Activer"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateUser(u.id, { is_verified: !u.is_verified })}
                                                        className="action-btn"
                                                        title={u.is_verified ? "Retirer vérification" : "Vérifier"}
                                                    >
                                                        V
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateUser(u.id, { is_admin: !u.is_admin })}
                                                        className="action-btn"
                                                        title={u.is_admin ? "Retirer admin" : "Promouvoir admin"}
                                                        disabled={u.email === "admin@fumotion.com"}
                                                    >
                                                        A
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="action-btn danger"
                                                        title="Supprimer"
                                                        disabled={u.email === "admin@fumotion.com"}
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

                    {usersPagination && usersPagination.pages > 1 && (
                        <div className="admin-pagination">
                            <button
                                onClick={() => setUsersPage(1)}
                                disabled={usersPage === 1}
                                className="pagination-btn"
                            >
                                Premier
                            </button>
                            <button
                                onClick={() => setUsersPage(usersPage - 1)}
                                disabled={usersPage === 1}
                                className="pagination-btn"
                            >
                                Précédent
                            </button>
                            <span className="pagination-info">
                                Page {usersPagination.page} sur {usersPagination.pages}
                                <span className="pagination-total">({usersPagination.total} résultats)</span>
                            </span>
                            <button
                                onClick={() => setUsersPage(usersPage + 1)}
                                disabled={usersPage >= usersPagination.pages}
                                className="pagination-btn"
                            >
                                Suivant
                            </button>
                            <button
                                onClick={() => setUsersPage(usersPagination.pages)}
                                disabled={usersPage >= usersPagination.pages}
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
