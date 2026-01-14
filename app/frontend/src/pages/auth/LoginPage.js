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
  const [showPassword, setShowPassword] = useState(false)
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="******"
                  required
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e)
                    }
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  title="Maintenir pour afficher le mot de passe"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.766 1.766 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                  </svg>
                </button>
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
