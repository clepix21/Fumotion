/**
 * ProfileTab - Onglet profil du dashboard
 */
import Avatar from "../../../components/common/Avatar"

export default function ProfileTab({
    displayUser,
    myTrips,
    myBookings,
    editMode,
    profileFormData,
    setProfileFormData,
    savingProfile,
    uploading,
    bannerInputRef,
    avatarInputRef,
    handleBannerUpload,
    handleAvatarUpload,
    toggleEditMode
}) {
    return (
        <div className="profile-section">
            <div className="profile-card">
                {/* Bannière */}
                <div className="profile-banner-container">
                    <div
                        className="profile-banner"
                        style={{
                            backgroundImage: displayUser?.banner_picture
                                ? `url(/uploads/${displayUser.banner_picture})`
                                : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {editMode && (
                            <button
                                className="banner-edit-btn"
                                onClick={() => bannerInputRef.current?.click()}
                                disabled={uploading.banner}
                            >
                                {uploading.banner ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Upload...
                                    </>
                                ) : (
                                    <>
                                        Modifier la bannière
                                    </>
                                )}
                            </button>
                        )}
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Avatar */}
                    <div className="profile-avatar-container">
                        <Avatar
                            user={displayUser}
                            size="xlarge"
                            editable={editMode}
                            onEdit={() => avatarInputRef.current?.click()}
                            uploading={uploading.avatar}
                        />
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Informations du profil */}
                <div className="profile-content">
                    <div className="profile-header-info">
                        <div className="profile-name-section">
                            <h2>
                                {displayUser?.first_name || ''} {displayUser?.last_name || ''}
                            </h2>
                            <p className="profile-email">{displayUser?.email}</p>
                            <p className="profile-joined">
                                Membre depuis {displayUser?.created_at ? new Date(displayUser.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '2024'}
                            </p>
                            {editMode ? (
                                <textarea
                                    className="profile-bio-edit"
                                    value={profileFormData.bio}
                                    onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                                    placeholder="Écrivez votre biographie..."
                                    maxLength={67}
                                />
                            ) : (
                                <p className="profile-bio">
                                    {displayUser?.bio || 'sans biographie...'}
                                </p>
                            )}
                        </div>
                        <button
                            className="edit-profile-btn"
                            onClick={toggleEditMode}
                            disabled={savingProfile}
                        >
                            {savingProfile ? 'Enregistrement...' : (editMode ? 'Terminer' : 'Modifier le profil')}
                        </button>
                    </div>

                    {/* Statistiques */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{myTrips.length}</span>
                            <span className="stat-label">Trajets proposés</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{myBookings.length}</span>
                            <span className="stat-label">Réservations</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {displayUser?.driver_rating ? parseFloat(displayUser.driver_rating).toFixed(1) : '-'}
                            </span>
                            <span className="stat-label">Note Conducteur</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {displayUser?.passenger_rating ? parseFloat(displayUser.passenger_rating).toFixed(1) : '-'}
                            </span>
                            <span className="stat-label">Note Passager</span>
                        </div>
                    </div>

                    {/* Détails */}
                    <div className="profile-details">
                        <h3>Informations personnelles</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Téléphone</label>
                                <span>{displayUser?.phone || "Non renseigné"}</span>
                            </div>
                            <div className="detail-item">
                                <label>Numéro étudiant</label>
                                <span>{displayUser?.student_id || "Non renseigné"}</span>
                            </div>
                            <div className="detail-item">
                                <label>Établissement</label>
                                <span>{displayUser?.university || "Non renseigné"}</span>
                            </div>
                            <div className="detail-item">
                                <label>Ville d'étude</label>
                                <span>Amiens, Hauts-de-France</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
