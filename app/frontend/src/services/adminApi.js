import { apiRequest } from './api'

// Fonctions spécifiques pour l'administration
export const adminAPI = {
  // Statistiques
  getStatistics: () => apiRequest('/api/admin/statistics', { method: 'GET' }),

  // Utilisateurs
  getAllUsers: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return apiRequest(`/api/admin/users${queryString ? '?' + queryString : ''}`, { method: 'GET' })
  },
  updateUser: (id, data) => apiRequest(`/api/admin/users/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // Trajets
  getAllTrips: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return apiRequest(`/api/admin/trips${queryString ? '?' + queryString : ''}`, { method: 'GET' })
  },
  updateTrip: (id, data) => apiRequest(`/api/admin/trips/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  deleteTrip: (id) => apiRequest(`/api/admin/trips/${id}`, { method: 'DELETE' }),

  // Réservations
  getAllBookings: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return apiRequest(`/api/admin/bookings${queryString ? '?' + queryString : ''}`, { method: 'GET' })
  },
  updateBooking: (id, data) => apiRequest(`/api/admin/bookings/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  deleteBooking: (id) => apiRequest(`/api/admin/bookings/${id}`, { method: 'DELETE' })
}
