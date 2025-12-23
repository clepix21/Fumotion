const db = require('../config/database');

class ReviewController {
  // Créer une évaluation
  async createReview(req, res) {
    try {
      const { bookingId } = req.params;
      const { rating, comment, type } = req.body;
      const reviewerId = req.user.id;

      // Valider la note
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'La note doit être comprise entre 1 et 5'
        });
      }

      // Valider le type
      if (!type || !['driver', 'passenger'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Le type doit être "driver" ou "passenger"'
        });
      }

      // Récupérer la réservation avec les infos du trajet
      const booking = await db.get(
        `SELECT b.*, t.driver_id, t.status as trip_status
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         WHERE b.id = ?`,
        [bookingId]
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      // Vérifier que le trajet est terminé
      if (booking.trip_status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Le trajet doit être terminé pour pouvoir évaluer'
        });
      }

      // Déterminer qui est évalué
      let reviewedId;
      if (type === 'driver') {
        // Le passager évalue le conducteur
        if (reviewerId !== booking.passenger_id) {
          return res.status(403).json({
            success: false,
            message: 'Seul le passager peut évaluer le conducteur'
          });
        }
        reviewedId = booking.driver_id;
      } else {
        // Le conducteur évalue le passager
        if (reviewerId !== booking.driver_id) {
          return res.status(403).json({
            success: false,
            message: 'Seul le conducteur peut évaluer le passager'
          });
        }
        reviewedId = booking.passenger_id;
      }

      // Vérifier qu'une évaluation n'existe pas déjà
      const existingReview = await db.get(
        'SELECT id FROM reviews WHERE booking_id = ? AND reviewer_id = ? AND type = ?',
        [bookingId, reviewerId, type]
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà évalué cette personne pour ce trajet'
        });
      }

      // Créer l'évaluation
      const result = await db.run(
        `INSERT INTO reviews (booking_id, reviewer_id, reviewed_id, rating, comment, type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bookingId, reviewerId, reviewedId, rating, comment || null, type]
      );

      // Récupérer l'évaluation créée
      const review = await db.get(
        `SELECT r.*, 
                u_reviewer.first_name as reviewer_first_name, 
                u_reviewer.last_name as reviewer_last_name,
                u_reviewed.first_name as reviewed_first_name, 
                u_reviewed.last_name as reviewed_last_name
         FROM reviews r
         JOIN users u_reviewer ON r.reviewer_id = u_reviewer.id
         JOIN users u_reviewed ON r.reviewed_id = u_reviewed.id
         WHERE r.id = ?`,
        [result.id]
      );

      res.status(201).json({
        success: true,
        message: 'Évaluation créée avec succès',
        data: review
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de l\'évaluation'
      });
    }
  }

  // Récupérer les évaluations d'un utilisateur
  async getUserReviews(req, res) {
    try {
      const { userId } = req.params;
      const { type } = req.query; // 'driver', 'passenger' ou null pour tous

      let query = `
        SELECT r.*, 
               u.first_name as reviewer_first_name, 
               u.last_name as reviewer_last_name,
               u.profile_picture as reviewer_profile_picture
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.reviewed_id = ?
      `;
      const params = [userId];

      if (type && ['driver', 'passenger'].includes(type)) {
        query += ' AND r.type = ?';
        params.push(type);
      }

      query += ' ORDER BY r.created_at DESC';

      const reviews = await db.all(query, params);

      // Calculer les moyennes
      const stats = await db.get(
        `SELECT 
           AVG(CASE WHEN type = 'driver' THEN rating END) as driver_avg,
           COUNT(CASE WHEN type = 'driver' THEN 1 END) as driver_count,
           AVG(CASE WHEN type = 'passenger' THEN rating END) as passenger_avg,
           COUNT(CASE WHEN type = 'passenger' THEN 1 END) as passenger_count,
           AVG(rating) as overall_avg,
           COUNT(*) as total_count
         FROM reviews WHERE reviewed_id = ?`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          reviews,
          stats: {
            driver_rating: stats.driver_avg ? parseFloat(stats.driver_avg).toFixed(1) : null,
            driver_reviews_count: stats.driver_count || 0,
            passenger_rating: stats.passenger_avg ? parseFloat(stats.passenger_avg).toFixed(1) : null,
            passenger_reviews_count: stats.passenger_count || 0,
            overall_rating: stats.overall_avg ? parseFloat(stats.overall_avg).toFixed(1) : null,
            total_reviews: stats.total_count || 0
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer les évaluations en attente pour l'utilisateur
  async getPendingReviews(req, res) {
    try {
      const userId = req.user.id;

      // Trajets terminés où l'utilisateur était passager et n'a pas encore évalué
      const asPassenger = await db.all(
        `SELECT b.id as booking_id, t.id as trip_id, 
                t.departure_location, t.arrival_location, t.departure_datetime,
                u.id as driver_id, u.first_name as driver_first_name, 
                u.last_name as driver_last_name, u.profile_picture as driver_profile_picture,
                'driver' as review_type
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         JOIN users u ON t.driver_id = u.id
         WHERE b.passenger_id = ? 
         AND t.status = 'completed'
         AND b.status = 'confirmed'
         AND NOT EXISTS (
           SELECT 1 FROM reviews r 
           WHERE r.booking_id = b.id AND r.reviewer_id = ? AND r.type = 'driver'
         )`,
        [userId, userId]
      );

      // Trajets terminés où l'utilisateur était conducteur et n'a pas encore évalué les passagers
      const asDriver = await db.all(
        `SELECT b.id as booking_id, t.id as trip_id,
                t.departure_location, t.arrival_location, t.departure_datetime,
                u.id as passenger_id, u.first_name as passenger_first_name, 
                u.last_name as passenger_last_name, u.profile_picture as passenger_profile_picture,
                'passenger' as review_type
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         JOIN users u ON b.passenger_id = u.id
         WHERE t.driver_id = ? 
         AND t.status = 'completed'
         AND b.status = 'confirmed'
         AND NOT EXISTS (
           SELECT 1 FROM reviews r 
           WHERE r.booking_id = b.id AND r.reviewer_id = ? AND r.type = 'passenger'
         )`,
        [userId, userId]
      );

      res.json({
        success: true,
        data: {
          asPassenger,
          asDriver,
          totalPending: asPassenger.length + asDriver.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations en attente:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Vérifier si une évaluation existe déjà
  async checkReviewExists(req, res) {
    try {
      const { bookingId } = req.params;
      const { type } = req.query;
      const userId = req.user.id;

      const review = await db.get(
        'SELECT id FROM reviews WHERE booking_id = ? AND reviewer_id = ? AND type = ?',
        [bookingId, userId, type]
      );

      res.json({
        success: true,
        exists: !!review
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
}

module.exports = new ReviewController();
