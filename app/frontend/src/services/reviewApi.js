/**
 * Service d'évaluation
 * Appels API pour noter les conducteurs/passagers
 */
import { apiRequest } from './api';

export const reviewAPI = {
  /** Créer une évaluation après un trajet */
  async createReview(bookingId, reviewData) {
    return apiRequest(`/api/reviews/bookings/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  /** Récupérer les évaluations non effectuées */
  async getPendingReviews() {
    return apiRequest('/api/reviews/pending');
  },

  /** Récupérer les notes d'un utilisateur */
  async getUserReviews(userId, type = null) {
    const url = type
      ? `/api/reviews/user/${userId}?type=${type}`
      : `/api/reviews/user/${userId}`;
    return apiRequest(url);
  },

  /** Vérifier si déjà noté */
  async checkReviewExists(bookingId, type) {
    return apiRequest(`/api/reviews/check/${bookingId}?type=${type}`);
  },

  /** Marquer un trajet comme terminé */
  async completeTrip(tripId) {
    return apiRequest(`/api/trips/${tripId}/complete`, {
      method: 'PUT'
    });
  }
};

export default reviewAPI;
