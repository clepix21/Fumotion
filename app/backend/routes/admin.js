/**
 * Routes d'administration
 * /api/admin/... - Toutes protégées par auth + admin
 */
const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth")
const { isAdmin } = require("../middleware/admin")
const adminController = require("../controllers/adminController")

// Authentification + droits admin requis
router.use(authMiddleware)
router.use(isAdmin)

// Statistiques globales
router.get("/statistics", adminController.getStatistics)

// CRUD Utilisateurs
router.get("/users", adminController.getAllUsers)
router.put("/users/:id", adminController.updateUser)
router.delete("/users/:id", adminController.deleteUser)

// CRUD Trajets
router.get("/trips", adminController.getAllTrips)
router.put("/trips/:id", adminController.updateTrip)
router.delete("/trips/:id", adminController.deleteTrip)

// CRUD Réservations
router.get("/bookings", adminController.getAllBookings)
router.put("/bookings/:id", adminController.updateBooking)
router.delete("/bookings/:id", adminController.deleteBooking)

module.exports = router
