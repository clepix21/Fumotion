"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/CreateTrip.css"
import "../styles/HomePage.css"

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    departure_location: "",
    arrival_location: "",
    departure_datetime: "",
    available_seats: 1,
    price_per_seat: "",
    description: "",
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }
  }, [navigate, isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Trajet créé avec succès!")
        navigate("/dashboard")
      } else {
        alert(data.message || "Erreur lors de la création du trajet")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la création du trajet")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="create-trip-page">
      {/* Navbar - Moderne et Professionnelle */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <span className="brand-logo">🚗</span>
            <span className="brand-name">Fumotion</span>
          </div>

          <button 
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="/search" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Rechercher
            </a>
            <div className="navbar-divider"></div>
            <span className="navbar-user">
              {user?.first_name || user?.email}
            </span>
            <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
              Tableau de bord
            </button>
            <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
              Créer un trajet
            </button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="create-trip-main">
        <div className="create-trip-container">
          <div className="form-header">
            <h1>Proposer un trajet</h1>
            <p>Partagez votre trajet et vos frais avec d'autres étudiants</p>
          </div>

          <form onSubmit={handleSubmit} className="trip-form">
            <div className="form-section">
              <h2>Itinéraire</h2>

              <div className="form-group">
                <label htmlFor="departure_location">
                  <span className="label-icon">📍</span>
                  Lieu de départ
                </label>
                <input
                  type="text"
                  id="departure_location"
                  name="departure_location"
                  value={formData.departure_location}
                  onChange={handleChange}
                  placeholder="Ex: Amiens, Gare SNCF"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="arrival_location">
                  <span className="label-icon">🎯</span>
                  Lieu d'arrivée
                </label>
                <input
                  type="text"
                  id="arrival_location"
                  name="arrival_location"
                  value={formData.arrival_location}
                  onChange={handleChange}
                  placeholder="Ex: IUT Amiens"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="departure_datetime">
                  <span className="label-icon">📅</span>
                  Date et heure de départ
                </label>
                <input
                  type="datetime-local"
                  id="departure_datetime"
                  name="departure_datetime"
                  value={formData.departure_datetime}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Détails du trajet</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="available_seats">
                    <span className="label-icon">👥</span>
                    Places disponibles
                  </label>
                  <select
                    id="available_seats"
                    name="available_seats"
                    value={formData.available_seats}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="1">1 place</option>
                    <option value="2">2 places</option>
                    <option value="3">3 places</option>
                    <option value="4">4 places</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="price_per_seat">
                    <span className="label-icon">💰</span>
                    Prix par place (€)
                  </label>
                  <input
                    type="number"
                    id="price_per_seat"
                    name="price_per_seat"
                    value={formData.price_per_seat}
                    onChange={handleChange}
                    placeholder="5.00"
                    step="0.50"
                    min="0"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <span className="label-icon">📝</span>
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ajoutez des informations supplémentaires sur votre trajet..."
                  rows="4"
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Création..." : "Publier le trajet"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
