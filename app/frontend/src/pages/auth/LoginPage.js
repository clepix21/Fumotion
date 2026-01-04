/**
 * Page de connexion
 * Formulaire email/password avec validation
 */
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authAPI } from "../../services/api"
import "../../styles/auth.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /** Soumission du formulaire de connexion */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Tentative de connexion pour:", formData.email)

      const data = await authAPI.login(formData)
      console.log("Réponse du serveur:", data)

      if (data.success) {
        if (data.data && data.data.token && data.data.user) {
          // Stocke le token et redirige vers le dashboard
          login(data.data.user, data.data.token)

          console.log("Token stocké:", data.data.token.substring(0, 20) + "...")
          console.log("Utilisateur stocké:", data.data.user.email)
          console.log("Connexion réussie, redirection vers /dashboard")

          navigate("/dashboard")
        } else {
          console.error("Structure de réponse invalide:", data)
          setError("Erreur: Réponse du serveur invalide")
        }
      } else {
        console.log("Échec de connexion:", data.message)
        setError(data.message || "Email ou mot de passe incorrect")
      }
    } catch (err) {
      console.error("Erreur réseau complète:", err)
      console.error("Type d'erreur:", err.name)
      console.error("Message d'erreur:", err.message)

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Impossible de se connecter au serveur backend. Vérifiez votre connexion.",
        )
      } else {
        setError(`Erreur de connexion: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-modern">
      <div className="auth-wrapper-modern">
        <Link to="/" className="back-link-modern">
          ← Retour à l'accueil
        </Link>
        <h1 className="auth-title-modern">Connexion</h1>

        <div className="auth-card-modern">
          <form onSubmit={handleSubmit} className="auth-form-modern">
            {error && (
              <div className="error-message-modern">
                {error}
              </div>
            )}

            <div className="form-group-modern">
              <label className="form-label-modern">Email</label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="Entrez votre email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Mot de passe</label>
              <div className="input-wrapper-modern">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="******"
                  required
                  disabled={loading}
                />
              </div>
              <Link to="/forgot-password" className="forgot-link-modern">
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="remember-me-modern">
              <input type="checkbox" id="remember" className="checkbox-modern" />
              <label htmlFor="remember" className="checkbox-label-modern">Se souvenir de moi</label>
            </div>

            <button type="submit" className="login-btn-modern" disabled={loading}>
              {loading ? "CHARGEMENT..." : "CONNEXION"}
            </button>
          </form>

          <div className="signup-link-modern" style={{ color: "#5B9FED" }}>
            <p>
              Vous n'avez pas de compte ? <Link to="/register" className="signup-text-modern" style={{ color: "#5B9FED" }}>Inscrivez-vous</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
