/**
 * Hook personnalisé pour la gestion des données du dashboard utilisateur
 * Centralise tous les états et actions
 */
import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useNotification } from "../../../context/NotificationContext"

export default function useDashboardData() {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { user, token, logout, updateUser } = useAuth()
    const notification = useNotification()

    // ...

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { notification.error("L'image ne doit pas dépasser 5MB"); return }

        setUploading(prev => ({ ...prev, banner: true }))
        try {
            const formData = new FormData()
            formData.append('banner', file)
            const data = await apiRequest("/api/auth/profile/banner", { method: "POST", body: formData })
            if (data.success) {
                setProfileUser(prev => ({ ...prev, banner_picture: data.data.banner_picture }))
                notification.success("Bannière mise à jour avec succès")
            } else {
                notification.error(data.message || "Erreur lors de l'upload")
            }
        } catch (error) {
            console.error("Erreur:", error)
            notification.error("Erreur lors de l'upload de la bannière")
        } finally {
            setUploading(prev => ({ ...prev, banner: false }))
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { notification.error("L'image ne doit pas dépasser 2MB"); return }

        setUploading(prev => ({ ...prev, avatar: true }))
        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const data = await apiRequest("/api/auth/profile/avatar", { method: "POST", body: formData })
            if (data.success) {
                const newProfilePicture = data.data.profile_picture
                setProfileUser(prev => ({ ...prev, profile_picture: newProfilePicture }))
                updateUser({ profile_picture: newProfilePicture })
                notification.success("Photo de profil mise à jour")
            } else {
                notification.error(data.message || "Erreur lors de l'upload")
            }
        } catch (error) {
            console.error("Erreur:", error)
            notification.error("Erreur lors de l'upload de la photo")
        } finally {
            setUploading(prev => ({ ...prev, avatar: false }))
        }
    }

    const toggleEditMode = async () => {
        if (!editMode) {
            setProfileFormData({
                firstName: displayUser?.first_name || '', lastName: displayUser?.last_name || '',
                phone: displayUser?.phone || '', studentId: displayUser?.student_id || '',
                bio: displayUser?.bio || ''
            })
            setEditMode(true)
        } else {
            setSavingProfile(true)
            try {
                const response = await authAPI.updateProfile(profileFormData)
                if (response.success) {
                    setProfileUser(prev => ({
                        ...prev, first_name: profileFormData.firstName, last_name: profileFormData.lastName,
                        phone: profileFormData.phone, student_id: profileFormData.studentId, bio: profileFormData.bio
                    }))
                    updateUser({
                        first_name: profileFormData.firstName, last_name: profileFormData.lastName,
                        phone: profileFormData.phone, student_id: profileFormData.studentId, bio: profileFormData.bio
                    })
                    notification.success("Profil mis à jour avec succès")
                } else {
                    notification.error(response.message || "Erreur lors de la mise à jour")
                }
            } catch (error) {
                console.error("Erreur:", error)
                notification.error("Erreur lors de la mise à jour du profil")
            } finally {
                setSavingProfile(false)
                setEditMode(false)
            }
        }
    }

    // ...

    const handleSaveTrip = async () => {
        if (!selectedTrip) return
        setSaving(true)
        try {
            const data = await apiRequest(`/api/trips/${selectedTrip.id}`, {
                method: "PUT", body: JSON.stringify(editFormData)
            })
            if (data.success) {
                setMyTrips(prev => prev.map(t => t.id === selectedTrip.id ? { ...t, ...editFormData } : t))
                closeModals()
                notification.success("Trajet mis à jour avec succès !")
            } else {
                notification.error(data.message || "Erreur lors de la modification")
            }
        } catch (error) {
            console.error("Erreur:", error)
            notification.error("Erreur lors de la modification du trajet")
        } finally {
            setSaving(false)
        }
    }

    const handleCancelTrip = async (tripId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler ce trajet ?")) return
        try {
            const data = await apiRequest(`/api/trips/${tripId}`, { method: "DELETE" })
            if (data.success) {
                setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'cancelled' } : t))
                closeModals()
                notification.success("Trajet annulé avec succès")
            } else {
                notification.error(data.message || "Erreur lors de l'annulation")
            }
        } catch (error) {
            console.error("Erreur:", error)
            notification.error("Erreur lors de l'annulation du trajet")
        }
    }

    const handleCompleteTrip = async (tripId) => {
        if (!window.confirm("Confirmer que ce trajet a bien été effectué ?")) return
        try {
            const data = await reviewAPI.completeTrip(tripId)
            if (data.success) {
                setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'completed' } : t))
                closeModals()
                try {
                    const pendingData = await reviewAPI.getPendingReviews()
                    if (pendingData.success) {
                        setPendingReviews(pendingData.data)
                        const firstReview = pendingData.data.asDriver?.[0] || pendingData.data.asPassenger?.[0]
                        if (firstReview) openReviewModal(firstReview)
                    }
                } catch (error) {
                    console.error("Erreur:", error)
                }
                loadDashboardData()
                notification.success("Trajet marqué comme terminé")
            } else {
                notification.error(data.message || "Erreur lors de la finalisation")
            }
        } catch (error) {
            console.error("Erreur:", error)
            notification.error("Erreur lors de la finalisation du trajet")
        }
    }

    // ========== GESTION DES ÉVALUATIONS ==========
    const openReviewModal = (reviewItem) => {
        setCurrentReview(reviewItem)
        setReviewData({ rating: 5, comment: '' })
        setShowReviewModal(true)
    }

    const handleSubmitReview = async () => {
        if (!currentReview) return
        setSubmittingReview(true)
        try {
            const data = await reviewAPI.createReview(currentReview.booking_id, {
                rating: reviewData.rating, comment: reviewData.comment, type: currentReview.review_type
            })
            if (data.success) {
                notification.success("Évaluation envoyée avec succès !")
                setShowReviewModal(false)
                setCurrentReview(null)
                loadDashboardData()
            } else {
                notification.error(data.message || "Erreur lors de l'envoi")
            }
        } catch (error) {
            console.error("Erreur:", error)
            notification.error("Erreur lors de l'envoi de l'évaluation")
        } finally {
            setSubmittingReview(false)
        }
    }

    return {
        // Auth & Navigation
        user, token, userId, navigate, isOwnProfile, handleLogout,
        // État général
        activeTab, setActiveTab, loading, mobileMenuOpen, setMobileMenuOpen,
        displayUser, profileUser,
        // Utilitaires
        formatDate, formatAddress, loadDashboardData,
        // Profil
        uploading, editMode, profileFormData, setProfileFormData, savingProfile,
        bannerInputRef, avatarInputRef,
        handleBannerUpload, handleAvatarUpload, toggleEditMode,
        // Trajets
        myTrips, selectedTrip, showDetailsModal, showEditModal,
        editFormData, setEditFormData, tripPassengers, modalLoading, saving,
        openDetailsModal, openEditModal, closeModals,
        handleSaveTrip, handleCancelTrip, handleCompleteTrip,
        // Réservations
        myBookings,
        // Évaluations
        pendingReviews, showReviewModal, setShowReviewModal,
        reviewData, setReviewData, currentReview, submittingReview,
        openReviewModal, handleSubmitReview
    }
}
