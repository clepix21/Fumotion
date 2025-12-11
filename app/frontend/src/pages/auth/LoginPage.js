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
    <div className="auth-page-modern">
      <div className="auth-container-modern">
        <h1 className="auth-title-modern">Sign In</h1>

        <form onSubmit={handleSubmit} className="auth-form-modern">
          {error && (
            <div className="error-message-modern">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group-modern">
            <label className="form-label-modern">Email</label>
            <div className="input-wrapper-modern">
              <span className="input-icon-modern">✉️</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input-modern"
                placeholder="Enter your Email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">Password</label>
            <div className="input-wrapper-modern">
              <span className="input-icon-modern">🔑</span>
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
              Forgot Password?
            </Link>
          </div>

          <div className="remember-me-modern">
            <input type="checkbox" id="remember" className="checkbox-modern" />
            <label htmlFor="remember" className="checkbox-label-modern">Remember me</label>
          </div>

          <button type="submit" className="login-btn-modern" disabled={loading}>
            {loading ? "LOADING..." : "LOGIN"}
          </button>

          <div className="divider-modern">
            <span>- OR -</span>
          </div>

          <div className="social-login-modern">
            <p className="social-text-modern">Sign in with</p>
            <div className="social-buttons-modern">
              <button type="button" className="social-btn-modern facebook-btn">
                <span className="social-icon-modern">f</span>
              </button>
              <button type="button" className="social-btn-modern google-btn">
                <span className="social-icon-modern google-icon">G</span>
              </button>
            </div>
          </div>
        </form>

        <div className="signup-link-modern">
          <p>
            Don't have an Account ? <Link to="/register" className="signup-text-modern">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
