
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { post } from "../../services/api"
import "../../../styles/auth.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    try {
      setLoading(true)
  await post("/api/auth/login", { email, password })
  navigate("/home")
    } catch (err) {
      setError(err.message || "Identifiants invalides")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Pas encore de compte ?{" "}
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
