/**
 * Service API pour l'administration
 * CRUD utilisateurs, trajets, réservations + statistiques
 */
import { apiRequest } from './api'

export const adminAPI = {
  // Dashboard - Statistiques globales
  getStatistics: () => apiRequest('/api/admin/statistics', { method: 'GET' }),

  // CRUD Utilisateurs
  getAllUsers: (params) => {
    const query = params ? new URLSearchParams(params).toString() : ''
    return apiRequest(`/api/admin/users${query ? '?' + query : ''}`, { method: 'GET' })
  },
  updateUser: (id, data) => apiRequest(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // CRUD Trajets
  getAllTrips: (params) => {
    const query = params ? new URLSearchParams(params).toString() : ''
    return apiRequest(`/api/admin/trips${query ? '?' + query : ''}`, { method: 'GET' })
  },
  updateTrip: (id, data) => apiRequest(`/api/admin/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id) => apiRequest(`/api/admin/trips/${id}`, { method: 'DELETE' }),

  // CRUD Réservations
  getAllBookings: (params) => {
    const query = params ? new URLSearchParams(params).toString() : ''
    return apiRequest(`/api/admin/bookings${query ? '?' + query : ''}`, { method: 'GET' })
  },
  updateBooking: (id, data) => apiRequest(`/api/admin/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id) => apiRequest(`/api/admin/bookings/${id}`, { method: 'DELETE' })
}
