const db = require('../config/database');

class BookingController {
  // Créer une nouvelle réservation
  async createBooking(req, res) {
    try {
      const { tripId } = req.params;
      const { seatsBooked } = req.body;
      const passengerId = req.user.id;

      // Vérifier que le trajet existe et est disponible
      const trip = await db.get(
        `SELECT t.*, 
                (t.available_seats - COALESCE(SUM(b.seats_booked), 0)) as remaining_seats,
                t.driver_id
         FROM trips t
         LEFT JOIN bookings b ON t.id = b.trip_id AND b.status != 'cancelled'
         WHERE t.id = ? AND t.status = 'active'
         GROUP BY t.id`,
        [tripId]
      );

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trajet non trouvé ou non disponible'
        });
      }

      // Vérifier que l'utilisateur n'est pas le conducteur
      if (trip.driver_id === passengerId) {
        return res.status(400).json({
          success: false,
          message: 'Vous ne pouvez pas réserver votre propre trajet'
        });
      }

      // Vérifier qu'il y a assez de places
      if (trip.remaining_seats < seatsBooked) {
        return res.status(400).json({
          success: false,
          message: `Seulement ${trip.remaining_seats} place(s) disponible(s)`
        });
      }

      // Vérifier qu'une réservation n'existe pas déjà
      const existingBooking = await db.get(
        'SELECT id FROM bookings WHERE trip_id = ? AND passenger_id = ?',
        [tripId, passengerId]
      );

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà une réservation pour ce trajet'
        });
      }

      // Calculer le prix total
      const totalPrice = trip.price_per_seat * seatsBooked;

      // Créer la réservation
      const result = await db.run(
        `INSERT INTO bookings (trip_id, passenger_id, seats_booked, total_price, status)
         VALUES (?, ?, ?, ?, 'confirmed')`,
        [tripId, passengerId, seatsBooked, totalPrice]
      );

      // Récupérer la réservation créée avec les détails
      const booking = await db.get(
        `SELECT b.*, t.departure_location, t.arrival_location, t.departure_datetime,
                u_driver.first_name as driver_first_name, u_driver.last_name as driver_last_name,
                u_passenger.first_name as passenger_first_name, u_passenger.last_name as passenger_last_name
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         JOIN users u_driver ON t.driver_id = u_driver.id
         JOIN users u_passenger ON b.passenger_id = u_passenger.id
         WHERE b.id = ?`,
        [result.id]
      );

      res.status(201).json({
        success: true,
        message: 'Réservation créée avec succès',
        data: booking
      });
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la réservation'
      });
    }
  }

  // Récupérer les réservations de l'utilisateur
  async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      const { status, type } = req.query;

      let query = `
        SELECT b.*, t.departure_location, t.arrival_location, t.departure_datetime,
               u.first_name as driver_first_name, u.last_name as driver_last_name,
               u.phone as driver_phone
        FROM bookings b
        JOIN trips t ON b.trip_id = t.id
        JOIN users u ON t.driver_id = u.id
        WHERE b.passenger_id = ?
      `;

      const params = [userId];

      if (status) {
        query += ` AND b.status = ?`;
        params.push(status);
      }

      if (type === 'upcoming') {
        query += ` AND t.departure_datetime > NOW()`;
      } else if (type === 'past') {
        query += ` AND t.departure_datetime <= NOW()`;
      }

      query += ` ORDER BY t.departure_datetime DESC`;

      const bookings = await db.all(query, params);

      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer une réservation spécifique
  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await db.get(
        `SELECT b.*, t.departure_location, t.arrival_location, t.departure_datetime,
                t.description, t.driver_id,
                u_driver.first_name as driver_first_name, u_driver.last_name as driver_last_name,
                u_driver.phone as driver_phone, u_driver.email as driver_email,
                u_passenger.first_name as passenger_first_name, u_passenger.last_name as passenger_last_name,
                u_passenger.phone as passenger_phone, u_passenger.email as passenger_email
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         JOIN users u_driver ON t.driver_id = u_driver.id
         JOIN users u_passenger ON b.passenger_id = u_passenger.id
         WHERE b.id = ? AND (b.passenger_id = ? OR t.driver_id = ?)`,
        [id, userId, userId]
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Annuler une réservation
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier que la réservation existe et appartient à l'utilisateur
      const booking = await db.get(
        `SELECT b.*, t.departure_datetime, t.driver_id
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         WHERE b.id = ? AND b.passenger_id = ?`,
        [id, userId]
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'La réservation est déjà annulée'
        });
      }

      // Vérifier si l'annulation est encore possible (par exemple, 2h avant le départ)
      const departureTime = new Date(booking.departure_datetime);
      const now = new Date();
      const timeDiff = departureTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff < 2) {
        return res.status(400).json({
          success: false,
          message: 'Impossible d\'annuler moins de 2 heures avant le départ'
        });
      }

      // Annuler la réservation
      await db.run(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', id]
      );

      res.json({
        success: true,
        message: 'Réservation annulée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer les réservations pour les trajets du conducteur
  async getBookingsForMyTrips(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      let query = `
        SELECT b.*, t.departure_location, t.arrival_location, t.departure_datetime,
               u.first_name as passenger_first_name, u.last_name as passenger_last_name,
               u.phone as passenger_phone, u.email as passenger_email
        FROM bookings b
        JOIN trips t ON b.trip_id = t.id
        JOIN users u ON b.passenger_id = u.id
        WHERE t.driver_id = ?
      `;

      const params = [userId];

      if (status) {
        query += ` AND b.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY t.departure_datetime DESC`;

      const bookings = await db.all(query, params);

      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Confirmer ou refuser une réservation (pour le conducteur)
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
      }

      // Vérifier que la réservation existe et que l'utilisateur est le conducteur
      const booking = await db.get(
        `SELECT b.*, t.driver_id
         FROM bookings b
         JOIN trips t ON b.trip_id = t.id
         WHERE b.id = ? AND t.driver_id = ?`,
        [id, userId]
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      // Mettre à jour le statut
      await db.run(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );

      res.json({
        success: true,
        message: `Réservation ${status === 'confirmed' ? 'confirmée' : 'refusée'} avec succès`
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
}

module.exports = new BookingController();