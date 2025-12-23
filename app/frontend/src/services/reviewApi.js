const API_URL = 'http://localhost:5000/api';

// Récupérer le token depuis le localStorage
const getToken = () => localStorage.getItem('token');

// Headers avec authentification
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const reviewAPI = {
  // Créer une évaluation
  async createReview(bookingId, reviewData) {
    const response = await fetch(`${API_URL}/reviews/bookings/${bookingId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(reviewData)
    });
    return response.json();
  },

  // Récupérer les évaluations en attente
  async getPendingReviews() {
    const response = await fetch(`${API_URL}/reviews/pending`, {
      headers: authHeaders()
    });
    return response.json();
  },

  // Récupérer les évaluations d'un utilisateur
  async getUserReviews(userId, type = null) {
    const url = type 
      ? `${API_URL}/reviews/user/${userId}?type=${type}`
      : `${API_URL}/reviews/user/${userId}`;
    const response = await fetch(url);
    return response.json();
  },

  // Vérifier si une évaluation existe
  async checkReviewExists(bookingId, type) {
    const response = await fetch(`${API_URL}/reviews/check/${bookingId}?type=${type}`, {
      headers: authHeaders()
    });
    return response.json();
  },

  // Marquer un trajet comme terminé
  async completeTrip(tripId) {
    const response = await fetch(`${API_URL}/trips/${tripId}/complete`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return response.json();
  }
};

export default reviewAPI;
