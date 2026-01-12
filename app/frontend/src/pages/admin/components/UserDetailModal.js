/**
 * Composant UserDetailModal - Modal détails utilisateur
 * Affiche les informations complètes d'un utilisateur
 */
import Avatar from "../../../components/common/Avatar"

export default function UserDetailModal({
    user,
    onClose,
    formatDate,
    handleUpdateUser
}) {
    if (!user) return null

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={onClose}>X</button>

                <div className="admin-modal-header" style={{ flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div
                        style={{
                            width: '100%',
                            height: '120px',
                            background: user.banner_picture
                                ? `url(/uploads/${user.banner_picture}) center/cover`
                                : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                            marginBottom: '-40px'
                        }}
                    />
                    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div style={{ border: '4px solid white', borderRadius: '50%' }}>
                            <Avatar user={user} size="large" />
                        </div>
                        <div className="admin-modal-title" style={{ marginTop: '12px', textAlign: 'center' }}>
                            <h2>{user.first_name} {user.last_name}</h2>
                            <p>{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-modal-body">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>ID</label>
                            <span>{user.id}</span>
                        </div>
                        <div className="detail-item">
                            <label>Téléphone</label>
                            <span>{user.phone || "Non renseigné"}</span>
                        </div>
                        <div className="detail-item">
                            <label>Numéro étudiant</label>
                            <span>{user.student_id || "Non renseigné"}</span>
                        </div>
                        <div className="detail-item">
                            <label>Université</label>
                            <span>{user.university || "Non renseigné"}</span>
                        </div>
                        <div className="detail-item">
                            <label>Inscrit le</label>
                            <span>{formatDate(user.created_at)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Statuts</label>
                            <div className="status-badges">
                                <span className={`admin-badge ${Boolean(user.is_active) ? 'success' : 'danger'}`}>
                                    {Boolean(user.is_active) ? 'Actif' : 'Inactif'}
                                </span>
                                <span className={`admin-badge ${Boolean(user.is_verified) ? 'info' : 'danger'}`}>
                                    {Boolean(user.is_verified) ? 'Vérifié' : 'Non vérifié'}
                                </span>
                                <span className={`admin-badge ${Boolean(user.is_admin) ? 'warning' : 'danger'}`}>
                                    {Boolean(user.is_admin) ? 'Admin' : 'Utilisateur'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-modal-footer">
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => {
                            handleUpdateUser(user.id, { is_active: !user.is_active })
                            onClose()
                        }}
                    >
                        {user.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={onClose}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}
