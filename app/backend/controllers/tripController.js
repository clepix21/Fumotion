/**
 * Contrôleur des trajets
 * CRUD complet + recherche avec filtres géographiques
 */
const db = require('../config/database');

class TripController {
  /**
   * Créer un nouveau trajet
   * Stocke les coordonnées GPS pour la carte
   */
  async createTrip(req, res) {
    try {
      const {
        departureLocation,
        arrivalLocation,
        departureDateTime,
        availableSeats,
        pricePerSeat,
        description,
        departureLatitude,
        departureLongitude,
        arrivalLatitude,
        arrivalLongitude
      } = req.body;

      const driverId = req.user.id; // ID du conducteur depuis le token JWT

      // Convertir ISO 8601 vers format MySQL (YYYY-MM-DD HH:MM:SS)
      const mysqlDateTime = new Date(departureDateTime)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const result = await db.run(
        `INSERT INTO trips (
          driver_id, departure_location, arrival_location, departure_datetime,
          available_seats, price_per_seat, description, departure_latitude,
          departure_longitude, arrival_latitude, arrival_longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          driverId, departureLocation, arrivalLocation, mysqlDateTime,
          availableSeats, pricePerSeat, description, departureLatitude,
          departureLongitude, arrivalLatitude, arrivalLongitude
        ]
      );

      const trip = await db.get(
        `SELECT t.*, u.first_name, u.last_name, u.email, u.profile_picture
         FROM trips t
         JOIN users u ON t.driver_id = u.id
         WHERE t.id = ?`,
        [result.id]
      );

      res.status(201).json({
        success: true,
        message: 'Trajet créé avec succès',
        data: trip
      });
    } catch (error) {
      console.error('Erreur lors de la création du trajet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création du trajet'
      });
    }
  }

  // Rechercher des trajets
  async searchTrips(req, res) {
    try {
      const {
        departure,
        arrival,
        date,
        passengers = 1,
        page = 1,
        limit = 10
      } = req.query;

      let query = `
        SELECT t.*, 
               u.first_name, u.last_name, u.email, u.profile_picture,
               (SELECT COALESCE(AVG(r2.rating), 0) 
                FROM reviews r2 
                WHERE r2.reviewed_id = u.id AND r2.type = 'driver') as driver_rating,
               (SELECT COUNT(r3.id) 
                FROM reviews r3 
                WHERE r3.reviewed_id = u.id AND r3.type = 'driver') as reviews_count,
               (t.available_seats - COALESCE(
                 (SELECT SUM(b2.seats_booked) 
                  FROM bookings b2 
                  WHERE b2.trip_id = t.id AND b2.status != 'cancelled'), 0)
               ) as remaining_seats
        FROM trips t
        JOIN users u ON t.driver_id = u.id
        WHERE t.status = 'active'
        AND t.departure_datetime > NOW()
      `;

      const params = [];

      if (departure) {
        query += ` AND t.departure_location LIKE ?`;
        params.push(`%${departure}%`);
      }

      if (arrival) {
        query += ` AND t.arrival_location LIKE ?`;
        params.push(`%${arrival}%`);
      }

      if (date) {
        query += ` AND DATE(t.departure_datetime) = DATE(?)`;
        params.push(date);
      }

      if (passengers) {
        query += ` AND (t.available_seats - COALESCE(
          (SELECT SUM(b2.seats_booked) 
           FROM bookings b2 
           WHERE b2.trip_id = t.id AND b2.status != 'cancelled'), 0)
        ) >= ?`;
        params.push(parseInt(passengers));
      }

      query += ` ORDER BY t.departure_datetime ASC`;

      // Pagination - MySQL a des problèmes avec LIMIT/OFFSET en tant que paramètres préparés
      const offset = (page - 1) * limit;
      const limitValue = parseInt(limit);
      const offsetValue = parseInt(offset);
      query += ` LIMIT ${limitValue} OFFSET ${offsetValue}`;

      const trips = await db.all(query, params);

      // Compter le total pour la pagination
      let countQuery = `
        SELECT COUNT(DISTINCT t.id) as total
        FROM trips t
        WHERE t.status = 'active'
        AND t.departure_datetime > NOW()
      `;
      const countParams = [];

      if (departure) {
        countQuery += ` AND t.departure_location LIKE ?`;
        countParams.push(`%${departure}%`);
      }

      if (arrival) {
        countQuery += ` AND t.arrival_location LIKE ?`;
        countParams.push(`%${arrival}%`);
      }

      if (date) {
        countQuery += ` AND DATE(t.departure_datetime) = DATE(?)`;
        countParams.push(date);
      }

      const { total } = await db.get(countQuery, countParams);

      res.json({
        success: true,
        data: {
          trips,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la recherche de trajets:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la recherche'
      });
    }
  }

  // Récupérer un trajet spécifique
  async getTripById(req, res) {
    try {
      const { id } = req.params;

      const trip = await db.get(
        `SELECT t.*, 
                u.first_name, u.last_name, u.email, u.phone,
                (SELECT AVG(rating) FROM reviews WHERE reviewed_id = u.id AND type = 'driver') as driver_rating,
                (SELECT COUNT(id) FROM reviews WHERE reviewed_id = u.id AND type = 'driver') as reviews_count,
                v.brand, v.model, v.color,
                (t.available_seats - COALESCE(SUM(b.seats_booked), 0)) as remaining_seats
         FROM trips t
         JOIN users u ON t.driver_id = u.id
         LEFT JOIN vehicles v ON t.vehicle_id = v.id
         LEFT JOIN bookings b ON t.id = b.trip_id AND b.status != 'cancelled'
         WHERE t.id = ?
         GROUP BY t.id`,
        [id]
      );

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trajet non trouvé'
        });
      }

      // Récupérer les passagers confirmés
      const passengers = await db.all(
        `SELECT u.first_name, u.last_name, b.seats_booked, b.status
         FROM bookings b
         JOIN users u ON b.passenger_id = u.id
         WHERE b.trip_id = ? AND b.status = 'confirmed'`,
        [id]
      );

      res.json({
        success: true,
        data: {
          ...trip,
          passengers
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du trajet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer les trajets de l'utilisateur connecté
  async getMyTrips(req, res) {
    try {
      const userId = req.user.id;
      const { type = 'all' } = req.query; // 'driving', 'passenger', 'all'

      let trips = [];

      if (type === 'driving' || type === 'all') {
        const drivingTrips = await db.all(
          `SELECT t.*, 
                  'driving' as trip_type,
                  COUNT(b.id) as bookings_count,
                  (t.available_seats - COALESCE(SUM(b.seats_booked), 0)) as remaining_seats
           FROM trips t
           LEFT JOIN bookings b ON t.id = b.trip_id AND b.status != 'cancelled'
           WHERE t.driver_id = ?
           GROUP BY t.id
           ORDER BY t.departure_datetime DESC`,
          [userId]
        );
        trips = [...trips, ...drivingTrips];
      }

      if (type === 'passenger' || type === 'all') {
        const passengerTrips = await db.all(
          `SELECT t.*, b.status as booking_status, b.seats_booked, b.total_price,
                  'passenger' as trip_type,
                  u.first_name as driver_first_name, u.last_name as driver_last_name
           FROM bookings b
           JOIN trips t ON b.trip_id = t.id
           JOIN users u ON t.driver_id = u.id
           WHERE b.passenger_id = ?
           ORDER BY t.departure_datetime DESC`,
          [userId]
        );
        trips = [...trips, ...passengerTrips];
      }

      // Trier par date de départ
      trips.sort((a, b) => new Date(b.departure_datetime) - new Date(a.departure_datetime));

      res.json({
        success: true,
        data: trips
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des trajets:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Modifier un trajet
  async updateTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Vérifier que l'utilisateur est le conducteur
      const trip = await db.get('SELECT driver_id FROM trips WHERE id = ?', [id]);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trajet non trouvé'
        });
      }

      if (trip.driver_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à modifier ce trajet'
        });
      }

      // Construire la requête de mise à jour
      const allowedFields = [
        'departure_location', 'arrival_location', 'departure_datetime',
        'available_seats', 'price_per_seat', 'description'
      ];

      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun champ valide à mettre à jour'
        });
      }

      updateValues.push(id);
      const query = `UPDATE trips SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      await db.run(query, updateValues);

      const updatedTrip = await db.get(
        `SELECT t.*, u.first_name, u.last_name, u.profile_picture
         FROM trips t
         JOIN users u ON t.driver_id = u.id
         WHERE t.id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Trajet mis à jour avec succès',
        data: updatedTrip
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du trajet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Annuler un trajet
  async cancelTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier que l'utilisateur est le conducteur
      const trip = await db.get('SELECT driver_id, status FROM trips WHERE id = ?', [id]);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trajet non trouvé'
        });
      }

      if (trip.driver_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à annuler ce trajet'
        });
      }

      if (trip.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Le trajet est déjà annulé'
        });
      }

      // Annuler le trajet
      await db.run(
        'UPDATE trips SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', id]
      );

      // Annuler toutes les réservations associées
      await db.run(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE trip_id = ?',
        ['cancelled', id]
      );

      res.json({
        success: true,
        message: 'Trajet annulé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation du trajet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Marquer un trajet comme terminé
  async completeTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier que l'utilisateur est le conducteur
      const trip = await db.get('SELECT driver_id, status, departure_datetime FROM trips WHERE id = ?', [id]);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trajet non trouvé'
        });
      }

      if (trip.driver_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à modifier ce trajet'
        });
      }

      if (trip.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Le trajet est déjà marqué comme terminé'
        });
      }

      if (trip.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Impossible de terminer un trajet annulé'
        });
      }

      // Marquer le trajet comme terminé
      await db.run(
        'UPDATE trips SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['completed', id]
      );

      // Mettre à jour le statut des réservations confirmées
      await db.run(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE trip_id = ? AND status = ?',
        ['completed', id, 'confirmed']
      );

      res.json({
        success: true,
        message: 'Trajet marqué comme terminé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la finalisation du trajet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
}

module.exports = new TripController();