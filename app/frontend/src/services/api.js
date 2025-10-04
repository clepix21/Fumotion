const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Fonction utilitaire pour récupérer le token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Fonction principale pour les requêtes API
export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {}),
  };
  
  try {
    const res = await fetch(url, { ...options, headers });
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    if (!res.ok) {
      // Si le token est invalide, rediriger vers la page de connexion
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      const message = (data && data.message) || res.statusText || 'Erreur requête API';
      throw new Error(message);
    }
    
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Méthodes HTTP
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

// Fonctions spécifiques pour l'authentification
export const authAPI = {
  login: (credentials) => post('/api/auth/login', credentials),
  register: (userData) => post('/api/auth/register', userData),
  getProfile: () => get('/api/auth/profile'),
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
