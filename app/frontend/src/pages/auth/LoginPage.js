import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/auth.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("[v0] Tentative de connexion pour:", formData.email)
      console.log("[v0] URL de l'API:", "http://localhost:5000/api/auth/login")

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("[v0] Status de la réponse:", response.status)
      console.log("[v0] Headers de la réponse:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("[v0] Réponse du serveur:", data)

      if (response.ok && data.success) {
        if (data.data && data.data.token && data.data.user) {
          // Utiliser le contexte d'authentification
          login(data.data.user, data.data.token)

          console.log("[v0] Token stocké:", data.data.token.substring(0, 20) + "...")
          console.log("[v0] Utilisateur stocké:", data.data.user.email)
          console.log("[v0] Connexion réussie, redirection vers /dashboard")

          navigate("/dashboard")
        } else {
          console.error("[v0] Structure de réponse invalide:", data)
          setError("Erreur: Réponse du serveur invalide")
        }
      } else {
        console.log("[v0] Échec de connexion:", data.message)
        setError(data.message || "Email ou mot de passe incorrect")
      }
    } catch (err) {
      console.error("[v0] Erreur réseau complète:", err)
      console.error("[v0] Type d'erreur:", err.name)
      console.error("[v0] Message d'erreur:", err.message)

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "❌ Impossible de se connecter au serveur backend. Vérifiez que le serveur est démarré sur http://localhost:5000",
        )
      } else {
        setError(`Erreur de connexion: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">Fumotion Amiens</span>
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Connexion</h1>
            <p>Accédez à votre compte Fumotion Amiens</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="votre.email@etudiant.univ-amiens.fr"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Votre mot de passe"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{" "}
              <Link to="/register" className="auth-link">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <div className="info-card">
            <span className="info-icon">🚗</span>
            <h3>Trajets étudiants</h3>
            <p>Partagez vos trajets quotidiens dans Amiens avec d'autres étudiants</p>
          </div>
          <div className="info-card">
            <span className="info-icon">💰</span>
            <h3>Économisez</h3>
            <p>Réduisez vos frais de transport jusqu'à 70%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
