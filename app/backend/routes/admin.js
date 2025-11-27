const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth")
const { isAdmin } = require("../middleware/admin")
const adminController = require("../controllers/adminController")

// Toutes les routes nécessitent une authentification et des droits admin
router.use(authMiddleware)
router.use(isAdmin)

// Statistiques
router.get("/statistics", adminController.getStatistics)

// Gestion des utilisateurs
router.get("/users", adminController.getAllUsers)
router.put("/users/:id", adminController.updateUser)
router.delete("/users/:id", adminController.deleteUser)

// Gestion des trajets
router.get("/trips", adminController.getAllTrips)
router.put("/trips/:id", adminController.updateTrip)
router.delete("/trips/:id", adminController.deleteTrip)

// Gestion des réservations
router.get("/bookings", adminController.getAllBookings)
router.put("/bookings/:id", adminController.updateBooking)
router.delete("/bookings/:id", adminController.deleteBooking)

module.exports = router
