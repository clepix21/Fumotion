const db = require("../config/database")

// Obtenir les statistiques générales
exports.getStatistics = async (req, res) => {
  try {
    // Compter les utilisateurs
    const usersCount = await db.get("SELECT COUNT(*) as count FROM users")
    const activeUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE is_active = 1")
    const verifiedUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE is_verified = 1")

    // Compter les trajets
    const tripsCount = await db.get("SELECT COUNT(*) as count FROM trips")
    const activeTrips = await db.get("SELECT COUNT(*) as count FROM trips WHERE status = 'active'")
    const completedTrips = await db.get("SELECT COUNT(*) as count FROM trips WHERE status = 'completed'")

    // Compter les réservations
    const bookingsCount = await db.get("SELECT COUNT(*) as count FROM bookings")
    const confirmedBookings = await db.get("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'")
    const pendingBookings = await db.get("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")

    // Calculer le revenu total
    const revenue = await db.get("SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'paid'")

    // Obtenir les derniers utilisateurs
    const recentUsers = await db.all(
      "SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 5"
    )

    // Obtenir les derniers trajets
    const recentTrips = await db.all(
      `SELECT t.*, u.first_name, u.last_name 
       FROM trips t 
       JOIN users u ON t.driver_id = u.id 
       ORDER BY t.created_at DESC LIMIT 5`
    )

    res.json({
      success: true,
      data: {
        users: {
          total: usersCount.count,
          active: activeUsers.count,
          verified: verifiedUsers.count
        },
        trips: {
          total: tripsCount.count,
          active: activeTrips.count,
          completed: completedTrips.count
        },
        bookings: {
          total: bookingsCount.count,
          confirmed: confirmedBookings.count,
          pending: pendingBookings.count
        },
        revenue: {
          total: revenue.total || 0
        },
        recent: {
          users: recentUsers,
          trips: recentTrips
        }
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques"
    })
  }
}

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status = "" } = req.query

    let query = "SELECT id, email, first_name, last_name, phone, student_id, university, is_verified, is_active, is_admin, created_at FROM users WHERE 1=1"
    const params = []

    if (search) {
      query += " AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status === "active") {
      query += " AND is_active = 1"
    } else if (status === "inactive") {
      query += " AND is_active = 0"
    }

    query += " ORDER BY created_at DESC"

    const offset = (page - 1) * limit
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const users = await db.all(query, params)

    const totalQuery = "SELECT COUNT(*) as count FROM users WHERE 1=1" + 
      (search ? " AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)" : "")
    const totalResult = await db.get(totalQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs"
    })
  }
}

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { is_verified, is_active, is_admin } = req.body

    const updates = []
    const params = []

    if (typeof is_verified !== "undefined") {
      updates.push("is_verified = ?")
      params.push(is_verified ? 1 : 0)
    }
    if (typeof is_active !== "undefined") {
      updates.push("is_active = ?")
      params.push(is_active ? 1 : 0)
    }
    if (typeof is_admin !== "undefined") {
      updates.push("is_admin = ?")
      params.push(is_admin ? 1 : 0)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune mise à jour fournie"
      })
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")
    params.push(id)

    await db.run(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    const user = await db.get(
      "SELECT id, email, first_name, last_name, phone, is_verified, is_active, is_admin FROM users WHERE id = ?",
      [id]
    )

    res.json({
      success: true,
      message: "Utilisateur mis à jour",
      data: user
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    })
  }
}

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier que ce n'est pas l'admin principal
    const user = await db.get("SELECT email FROM users WHERE id = ?", [id])
    if (user && user.email === "admin@fumotion.com") {
      return res.status(403).json({
        success: false,
        message: "Impossible de supprimer l'administrateur principal"
      })
    }

    await db.run("DELETE FROM users WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Utilisateur supprimé"
    })
  } catch (error) {
    console.error("Erreur lors de la suppression:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression"
    })
  }
}

// Obtenir tous les trajets
exports.getAllTrips = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "" } = req.query

    let query = `SELECT t.*, u.first_name, u.last_name, u.email 
                 FROM trips t 
                 JOIN users u ON t.driver_id = u.id 
                 WHERE 1=1`
    const params = []

    if (status) {
      query += " AND t.status = ?"
      params.push(status)
    }

    query += " ORDER BY t.created_at DESC"

    const offset = (page - 1) * limit
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const trips = await db.all(query, params)

    const totalQuery = "SELECT COUNT(*) as count FROM trips WHERE 1=1" + 
      (status ? " AND status = ?" : "")
    const totalResult = await db.get(totalQuery, status ? [status] : [])

    res.json({
      success: true,
      data: trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des trajets:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des trajets"
    })
  }
}

// Mettre à jour un trajet
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      })
    }

    await db.run(
      "UPDATE trips SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    )

    const trip = await db.get("SELECT * FROM trips WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Trajet mis à jour",
      data: trip
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    })
  }
}

// Supprimer un trajet
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params

    await db.run("DELETE FROM trips WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Trajet supprimé"
    })
  } catch (error) {
    console.error("Erreur lors de la suppression:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression"
    })
  }
}

// Obtenir toutes les réservations
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "" } = req.query

    let query = `SELECT b.*, 
                 u.first_name as passenger_first_name, u.last_name as passenger_last_name, u.email as passenger_email,
                 t.departure_location, t.arrival_location, t.departure_datetime,
                 d.first_name as driver_first_name, d.last_name as driver_last_name
                 FROM bookings b
                 JOIN users u ON b.passenger_id = u.id
                 JOIN trips t ON b.trip_id = t.id
                 JOIN users d ON t.driver_id = d.id
                 WHERE 1=1`
    const params = []

    if (status) {
      query += " AND b.status = ?"
      params.push(status)
    }

    query += " ORDER BY b.booking_date DESC"

    const offset = (page - 1) * limit
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const bookings = await db.all(query, params)

    const totalQuery = "SELECT COUNT(*) as count FROM bookings WHERE 1=1" + 
      (status ? " AND status = ?" : "")
    const totalResult = await db.get(totalQuery, status ? [status] : [])

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des réservations"
    })
  }
}

// Mettre à jour une réservation
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params
    const { status, payment_status } = req.body

    const updates = []
    const params = []

    if (status) {
      if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Statut invalide"
        })
      }
      updates.push("status = ?")
      params.push(status)
    }

    if (payment_status) {
      if (!["pending", "paid", "refunded"].includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: "Statut de paiement invalide"
        })
      }
      updates.push("payment_status = ?")
      params.push(payment_status)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune mise à jour fournie"
      })
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")
    params.push(id)

    await db.run(
      `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    const booking = await db.get("SELECT * FROM bookings WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Réservation mise à jour",
      data: booking
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    })
  }
}

// Supprimer une réservation
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params

    await db.run("DELETE FROM bookings WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Réservation supprimée"
    })
  } catch (error) {
    console.error("Erreur lors de la suppression:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression"
    })
  }
}
