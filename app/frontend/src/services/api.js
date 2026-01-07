/**
 * Service API principal
 * Centralise toutes les requêtes HTTP vers le backend
 */

const BASE_URL = process.env.REACT_APP_API_URL || '';

// Stockage du token CSRF en mémoire
let csrfToken = null;

// Récupère le token JWT depuis le localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Récupère un token CSRF depuis le serveur
 * Appelé automatiquement lors de la première requête mutante
 */
const fetchCsrfToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Inclure les cookies
    });
    
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
  }
  return null;
};

/**
 * Retourne le token CSRF, le récupère si nécessaire
 */
const getCsrfToken = async () => {
  if (!csrfToken) {
    await fetchCsrfToken();
  }
  return csrfToken;
};

/**
 * Fonction générique pour les appels API
 * Gère automatiquement : headers, auth, CSRF, erreurs 401/403
 */
export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getAuthToken();
  const method = options.method || 'GET';
  
  // Pour les requêtes mutantes (POST, PUT, DELETE), ajouter le token CSRF
  const isMutatingRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  let csrf = null;
  
  if (isMutatingRequest) {
    csrf = await getCsrfToken();
  }

  // Headers par défaut avec token si disponible
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(csrf && { 'X-CSRF-Token': csrf }),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { 
      ...options, 
      headers,
      credentials: 'include', // Toujours inclure les cookies
    });
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      // Token expiré/invalide : déconnecter et rediriger
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Token CSRF invalide : le renouveler et réessayer une fois
      if (res.status === 403 && data?.message?.includes('CSRF')) {
        csrfToken = null; // Invalider le token actuel
        const newCsrf = await fetchCsrfToken();
        if (newCsrf) {
          // Réessayer la requête avec le nouveau token
          headers['X-CSRF-Token'] = newCsrf;
          const retryRes = await fetch(url, { 
            ...options, 
            headers,
            credentials: 'include',
          });
          if (retryRes.ok) {
            const retryData = retryRes.headers.get('content-type')?.includes('application/json')
              ? await retryRes.json()
              : await retryRes.text();
            return retryData;
          }
        }
      }

      // Construire une erreur détaillée pour le debugging
      const error = new Error((data && data.message) || res.statusText || 'Erreur requête API');
      if (data && data.errors) error.errors = data.errors;
      if (data && data.success !== undefined) error.success = data.success;
      error.response = res;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ========== MÉTHODES HTTP ==========
export function post(path, body) {
  return apiRequest(path, { method: 'POST', body: JSON.stringify(body) });
}

export function get(path) {
  return apiRequest(path, { method: 'GET' });
}

export function put(path, body) {
  return apiRequest(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function del(path) {
  return apiRequest(path, { method: 'DELETE' });
}

// ========== API AUTHENTIFICATION ==========
export const authAPI = {
  login: (credentials) => post('/api/auth/login', credentials),
  register: (userData) => post('/api/auth/register', userData),
  getProfile: () => get('/api/auth/profile'),
  getPublicProfile: (id) => get(`/api/auth/users/${id}`),
  updateProfile: (userData) => put('/api/auth/profile', userData),
  verifyToken: () => get('/api/auth/verify-token'),
};

// Fonctions spécifiques pour les trajets
export const tripsAPI = {
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return get(`/api/trips/search?${queryString}`);
  },
  getById: (id) => get(`/api/trips/${id}`),
  create: (tripData) => post('/api/trips', tripData),
  update: (id, tripData) => put(`/api/trips/${id}`, tripData),
  delete: (id) => del(`/api/trips/${id}`),
  getMyTrips: (type) => {
    const query = type ? `?type=${type}` : '';
    return get(`/api/trips${query}`);
  },
};

// Fonctions spécifiques pour les réservations
export const bookingsAPI = {
  create: (tripId, bookingData) => post(`/api/bookings/trips/${tripId}/book`, bookingData),
  getMyBookings: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return get(`/api/bookings${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => get(`/api/bookings/${id}`),
  cancel: (id) => put(`/api/bookings/${id}/cancel`),
  updateStatus: (id, status) => put(`/api/bookings/${id}/status`, { status }),
  getBookingsForMyTrips: () => get('/api/bookings/my-trips'),
};

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Fonction pour déconnecter l'utilisateur
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Fonction pour récupérer les données utilisateur du localStorage
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};
