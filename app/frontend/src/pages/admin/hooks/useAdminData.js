/**
 * Hook personnalisé pour la gestion des données admin
 * Centralise tous les états, chargements et actions de l'interface admin
 */
import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import { adminAPI } from "../../../services/adminApi"

export default function useAdminData() {
    const navigate = useNavigate()
    const { user, token, logout, loading: authLoading } = useAuth()

    // État général
    const [activeTab, setActiveTab] = useState("dashboard")
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    // États du dashboard
    const [statistics, setStatistics] = useState(null)

    // États des utilisateurs
    const [users, setUsers] = useState([])
    const [usersPage, setUsersPage] = useState(1)
    const [usersPagination, setUsersPagination] = useState(null)
    const [usersSearch, setUsersSearch] = useState("")
    const [usersFilter, setUsersFilter] = useState("")
    const [selectedUsers, setSelectedUsers] = useState([])
    const [userDetailModal, setUserDetailModal] = useState(null)

    // États des trajets
    const [trips, setTrips] = useState([])
    const [tripsPage, setTripsPage] = useState(1)
    const [tripsPagination, setTripsPagination] = useState(null)
    const [tripsFilter, setTripsFilter] = useState("")
    const [tripsSearch, setTripsSearch] = useState("")
    const [selectedTrips, setSelectedTrips] = useState([])

    // États des réservations
    const [bookings, setBookings] = useState([])
    const [bookingsPage, setBookingsPage] = useState(1)
    const [bookingsPagination, setBookingsPagination] = useState(null)
    const [bookingsFilter, setBookingsFilter] = useState("")

    // ========== FONCTIONS UTILITAIRES ==========

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const formatAddress = (address) => {
        if (!address) return "-"
        const parts = address.split(',')
        return parts.length > 1 ? `${parts[0]}, ${parts[1]}` : address
    }

    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            showNotification("Aucune donnée à exporter", "warning")
            return
        }
        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                let value = row[header]
                if (value === null || value === undefined) value = ''
                if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`
                }
                return value
            }).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        showNotification("Export réussi !")
    }

    const exportToJSON = (data, filename) => {
        if (!data || data.length === 0) {
            showNotification("Aucune donnée à exporter", "warning")
            return
        }
        const jsonContent = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
        link.click()
        showNotification("Export JSON réussi !")
    }

    // ========== SÉLECTION ==========

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleTripSelection = (tripId) => {
        setSelectedTrips(prev =>
            prev.includes(tripId)
                ? prev.filter(id => id !== tripId)
                : [...prev, tripId]
        )
    }

    const toggleAllUsers = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.id))
        }
    }

    const toggleAllTrips = () => {
        if (selectedTrips.length === trips.length) {
            setSelectedTrips([])
        } else {
            setSelectedTrips(trips.map(t => t.id))
        }
    }

    // ========== CHARGEMENT DES DONNÉES ==========

    const loadStatistics = useCallback(async () => {
        try {
            setLoading(true)
            const response = await adminAPI.getStatistics()
            if (response.success) {
                setStatistics(response.data)
            }
        } catch (error) {
            console.error("Erreur chargement statistiques:", error)
            showNotification("Erreur lors du chargement des statistiques", "error")
        } finally {
            setLoading(false)
        }
    }, [])

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true)
            const params = { page: usersPage, limit: 20 }
            if (usersSearch) params.search = usersSearch
            if (usersFilter) params.status = usersFilter

            const response = await adminAPI.getAllUsers(params)
            if (response.success) {
                setUsers(response.data)
                setUsersPagination(response.pagination)
            }
        } catch (error) {
            console.error("Erreur chargement utilisateurs:", error)
            showNotification("Erreur lors du chargement des utilisateurs", "error")
        } finally {
            setLoading(false)
        }
    }, [usersPage, usersSearch, usersFilter])

    const loadTrips = useCallback(async () => {
        try {
            setLoading(true)
            const params = { page: tripsPage, limit: 20 }
            if (tripsFilter) params.status = tripsFilter
            if (tripsSearch) params.search = tripsSearch

            const response = await adminAPI.getAllTrips(params)
            if (response.success) {
                setTrips(response.data)
                setTripsPagination(response.pagination)
            }
        } catch (error) {
            console.error("Erreur chargement trajets:", error)
            showNotification("Erreur lors du chargement des trajets", "error")
        } finally {
            setLoading(false)
        }
    }, [tripsPage, tripsFilter, tripsSearch])

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true)
            const params = { page: bookingsPage, limit: 20 }
            if (bookingsFilter) params.status = bookingsFilter

            const response = await adminAPI.getAllBookings(params)
            if (response.success) {
                setBookings(response.data)
                setBookingsPagination(response.pagination)
            }
        } catch (error) {
            console.error("Erreur chargement réservations:", error)
            showNotification("Erreur lors du chargement des réservations", "error")
        } finally {
            setLoading(false)
        }
    }, [bookingsPage, bookingsFilter])

    // ========== ACTIONS UTILISATEURS ==========

    const handleUpdateUser = async (userId, updates) => {
        if (updates.hasOwnProperty('is_admin')) {
            const message = updates.is_admin
                ? "Êtes-vous sûr de vouloir promouvoir cet utilisateur administrateur ?"
                : "Êtes-vous sûr de vouloir retirer les droits administrateur de cet utilisateur ?"

            if (!window.confirm(message)) return
        }

        try {
            const response = await adminAPI.updateUser(userId, updates)
            if (response.success) {
                loadUsers()
                showNotification("Utilisateur mis à jour avec succès")
            }
        } catch (error) {
            console.error("Erreur mise à jour utilisateur:", error)
            showNotification("Erreur lors de la mise à jour", "error")
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return
        try {
            const response = await adminAPI.deleteUser(userId)
            if (response.success) {
                loadUsers()
                showNotification("Utilisateur supprimé avec succès")
            }
        } catch (error) {
            console.error("Erreur suppression utilisateur:", error)
            showNotification("Erreur lors de la suppression", "error")
        }
    }

    const handleBulkUserAction = async (action) => {
        if (selectedUsers.length === 0) {
            showNotification("Sélectionnez au moins un utilisateur", "warning")
            return
        }
        const confirmMsg = action === 'delete'
            ? `Supprimer ${selectedUsers.length} utilisateur(s) ?`
            : `Appliquer l'action sur ${selectedUsers.length} utilisateur(s) ?`
        if (!window.confirm(confirmMsg)) return

        try {
            for (const userId of selectedUsers) {
                if (action === 'delete') {
                    await adminAPI.deleteUser(userId)
                } else if (action === 'activate') {
                    await adminAPI.updateUser(userId, { is_active: true })
                } else if (action === 'deactivate') {
                    await adminAPI.updateUser(userId, { is_active: false })
                }
            }
            setSelectedUsers([])
            loadUsers()
            showNotification(`Action effectuée sur ${selectedUsers.length} utilisateur(s)`)
        } catch (error) {
            showNotification("Erreur lors de l'action groupée", "error")
        }
    }

    // ========== ACTIONS TRAJETS ==========

    const handleUpdateTrip = async (tripId, status) => {
        try {
            const response = await adminAPI.updateTrip(tripId, { status })
            if (response.success) {
                loadTrips()
                showNotification("Trajet mis à jour avec succès")
            }
        } catch (error) {
            console.error("Erreur mise à jour trajet:", error)
            showNotification("Erreur lors de la mise à jour", "error")
        }
    }

    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) return
        try {
            const response = await adminAPI.deleteTrip(tripId)
            if (response.success) {
                loadTrips()
                showNotification("Trajet supprimé avec succès")
            }
        } catch (error) {
            console.error("Erreur suppression trajet:", error)
            showNotification("Erreur lors de la suppression", "error")
        }
    }

    const handleBulkTripAction = async (action) => {
        if (selectedTrips.length === 0) {
            showNotification("Sélectionnez au moins un trajet", "warning")
            return
        }
        if (!window.confirm(`Appliquer l'action sur ${selectedTrips.length} trajet(s) ?`)) return

        try {
            for (const tripId of selectedTrips) {
                if (action === 'delete') {
                    await adminAPI.deleteTrip(tripId)
                } else {
                    await adminAPI.updateTrip(tripId, { status: action })
                }
            }
            setSelectedTrips([])
            loadTrips()
            showNotification(`Action effectuée sur ${selectedTrips.length} trajet(s)`)
        } catch (error) {
            showNotification("Erreur lors de l'action groupée", "error")
        }
    }

    // ========== ACTIONS RÉSERVATIONS ==========

    const handleUpdateBooking = async (bookingId, updates) => {
        try {
            const response = await adminAPI.updateBooking(bookingId, updates)
            if (response.success) {
                loadBookings()
                showNotification("Réservation mise à jour avec succès")
            }
        } catch (error) {
            console.error("Erreur mise à jour réservation:", error)
            showNotification("Erreur lors de la mise à jour", "error")
        }
    }

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return
        try {
            const response = await adminAPI.deleteBooking(bookingId)
            if (response.success) {
                loadBookings()
                showNotification("Réservation supprimée avec succès")
            }
        } catch (error) {
            console.error("Erreur suppression réservation:", error)
            showNotification("Erreur lors de la suppression", "error")
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    // ========== EFFETS ==========

    // Vérifier accès admin
    useEffect(() => {
        if (authLoading) return
        if (!token || !user?.is_admin) {
            console.log("Accès admin refusé:", { token: !!token, user })
            navigate("/")
        }
    }, [user, token, navigate, authLoading])

    // Charger données selon l'onglet
    useEffect(() => {
        if (authLoading || !token || !user?.is_admin) return
        if (activeTab === "dashboard") loadStatistics()
    }, [activeTab, authLoading, token, user?.is_admin, loadStatistics])

    useEffect(() => {
        if (authLoading || !token || !user?.is_admin) return
        if (activeTab === "users") loadUsers()
    }, [activeTab, authLoading, token, user?.is_admin, usersPage, usersSearch, usersFilter, loadUsers])

    useEffect(() => {
        if (authLoading || !token || !user?.is_admin) return
        if (activeTab === "trips") loadTrips()
    }, [activeTab, authLoading, token, user?.is_admin, tripsPage, tripsFilter, tripsSearch, loadTrips])

    useEffect(() => {
        if (authLoading || !token || !user?.is_admin) return
        if (activeTab === "bookings") loadBookings()
    }, [activeTab, authLoading, token, user?.is_admin, bookingsPage, bookingsFilter, loadBookings])

    return {
        // Auth
        user, token, authLoading, handleLogout,
        // État général
        activeTab, setActiveTab, loading, notification,
        // Utilitaires
        formatDate, formatAddress, exportToCSV, exportToJSON, showNotification,
        // Dashboard
        statistics, loadStatistics,
        // Utilisateurs
        users, usersPage, setUsersPage, usersPagination,
        usersSearch, setUsersSearch, usersFilter, setUsersFilter,
        selectedUsers, toggleUserSelection, toggleAllUsers,
        userDetailModal, setUserDetailModal,
        handleUpdateUser, handleDeleteUser, handleBulkUserAction,
        // Trajets
        trips, tripsPage, setTripsPage, tripsPagination,
        tripsSearch, setTripsSearch, tripsFilter, setTripsFilter,
        selectedTrips, toggleTripSelection, toggleAllTrips,
        handleUpdateTrip, handleDeleteTrip, handleBulkTripAction,
        // Réservations
        bookings, bookingsPage, setBookingsPage, bookingsPagination,
        bookingsFilter, setBookingsFilter,
        handleUpdateBooking, handleDeleteBooking
    }
}
