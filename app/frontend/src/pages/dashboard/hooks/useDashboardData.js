/**
 * Hook personnalisé pour la gestion des données du dashboard utilisateur
 * Centralise tous les états et actions
 */
import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import { authAPI, apiRequest } from "../../../services/api"
import { reviewAPI } from "../../../services/reviewApi"
import { useNotification } from "../../../context/NotificationContext"

export default function useDashboardData() {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { user, token, logout, updateUser } = useAuth()
    const notification = useNotification()

    // Détermine si on affiche son propre profil
    const isOwnProfile = !userId || (user && parseInt(userId) === user.id)

    // États principaux
    const [activeTab, setActiveTab] = useState("overview")
    const [myTrips, setMyTrips] = useState([])
    const [myBookings, setMyBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileUser, setProfileUser] = useState(null)
    const [uploading, setUploading] = useState({ banner: false, avatar: false })
    const [editMode, setEditMode] = useState(false)
    const [profileFormData, setProfileFormData] = useState({
        firstName: '', lastName: '', phone: '', studentId: '', bio: ''
    })
    const [savingProfile, setSavingProfile] = useState(false)
    const bannerInputRef = useRef(null)
    const avatarInputRef = useRef(null)

    // États modales trajets
    const [selectedTrip, setSelectedTrip] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editFormData, setEditFormData] = useState({
        departure_location: '', arrival_location: '', departure_datetime: '',
        available_seats: 1, price_per_seat: 0, description: ''
    })
    const [tripPassengers, setTripPassengers] = useState([])
    const [modalLoading, setModalLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // États évaluations
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [pendingReviews, setPendingReviews] = useState({ asPassenger: [], asDriver: [] })
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
    const [currentReview, setCurrentReview] = useState(null)
    const [submittingReview, setSubmittingReview] = useState(false)

    const displayUser = profileUser || user

    // ========== FONCTIONS UTILITAIRES ==========
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        })
    }

    const formatAddress = (fullAddress) => {
        if (!fullAddress) return "Adresse non disponible"
        const parts = fullAddress.split(',').map(p => p.trim())
        if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`
        return fullAddress
    }

    // ========== CHARGEMENT DES DONNÉES ==========
    const loadDashboardData = useCallback(async () => {
        try {
            if (!isOwnProfile && userId) {
                try {
                    const profileData = await authAPI.getPublicProfile(userId)
                    if (profileData.success) setProfileUser(profileData.data)
                } catch (error) {
                    console.error("Erreur lors du chargement du profil:", error)
                }
                setLoading(false)
                return
            }

            // Charger le profil
            try {
                const profileData = await authAPI.getProfile()
                if (profileData.success) setProfileUser(profileData.data)
            } catch (error) {
                console.error("Erreur lors du chargement du profil:", error)
            }

            // Charger les trajets
            const tripsResponse = await fetch("/api/trips?type=driving", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (tripsResponse.ok) {
                const tripsData = await tripsResponse.json()
                setMyTrips(tripsData.data || [])
            }

            // Charger les réservations
            const bookingsResponse = await fetch("/api/bookings", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json()
                setMyBookings(bookingsData.data || [])
            }

            // Charger les évaluations
            try {
                const pendingData = await reviewAPI.getPendingReviews()
                if (pendingData.success) setPendingReviews(pendingData.data)
            } catch (error) {
                console.error("Erreur lors du chargement des évaluations:", error)
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error)
        } finally {
            setLoading(false)
        }
    }, [token, isOwnProfile, userId])

    useEffect(() => {
        loadDashboardData()
    }, [loadDashboardData])

    // ========== ACTIONS ==========
    const handleLogout = () => {
        logout()
        navigate("/")
    }

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

    // ========== GESTION DES TRAJETS ==========
    const openDetailsModal = async (trip) => {
        setSelectedTrip(trip)
        setShowDetailsModal(true)
        setModalLoading(true)
        try {
            const response = await fetch(`/api/trips/${trip.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setSelectedTrip(data.data)
                    setTripPassengers(data.data.passengers || [])
                }
            }
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setModalLoading(false)
        }
    }

    const openEditModal = (trip) => {
        setSelectedTrip(trip)
        setEditFormData({
            departure_location: trip.departure_location || '',
            arrival_location: trip.arrival_location || '',
            departure_datetime: trip.departure_datetime ? new Date(trip.departure_datetime).toISOString().slice(0, 16) : '',
            available_seats: trip.available_seats || 1,
            price_per_seat: trip.price_per_seat || 0,
            description: trip.description || ''
        })
        setShowEditModal(true)
    }

    const closeModals = () => {
        setShowDetailsModal(false)
        setShowEditModal(false)
        setSelectedTrip(null)
        setTripPassengers([])
    }

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
