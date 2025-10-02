import { useNavigate, Link } from "react-router-dom"
import logo from "../../assets/images/Sakuya.png"
import '../../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">Fumotion</span>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate("/login")} className="nav-link">
              Connexion
            </button>
            <button onClick={() => navigate("/register")} className="nav-button">
              Commencer
            </button>
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>Nouveau</span>
              <span className="badge-text">Découvrez le mouvement</span>
            </div>

            <h1 className="hero-title">
              Mouvement ultra-rapide
              <br />
              <span className="title-highlight">pour tous</span>
            </h1>

            <p className="hero-description">
              Fumotion révolutionne votre expérience de mouvement avec une technologie de pointe et une interface
              intuitive. Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme.
            </p>

            <div className="hero-actions">
              <button onClick={() => navigate("/register")} className="btn-primary">
                Commencer gratuitement
              </button>
              <button onClick={() => navigate("/login")} className="btn-secondary">
                Se connecter
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">20K+</div>
                <div className="stat-label">Utilisateurs actifs</div>
              </div>
              <div className="stat">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Disponibilité</div>
              </div>
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-container">
              <img src={logo || "/placeholder.svg"} alt="Fumotion" className="hero-logo" />
              <div className="visual-circle circle-1"></div>
              <div className="visual-circle circle-2"></div>
              <div className="visual-circle circle-3"></div>
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="features-container">
          <h2 className="features-title">Pourquoi choisir Fumotion?</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Ultra Rapide</h3>
              <p className="feature-description">
                Performance optimale avec une latence minimale pour une expérience fluide
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Sécurisé</h3>
              <p className="feature-description">Vos données sont protégées avec un chiffrement de niveau entreprise</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Intuitif</h3>
              <p className="feature-description">
                Interface simple et élégante conçue pour une utilisation sans effort
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">Fumotion</span>
              <p className="footer-tagline">Vroum Vroum ᗜˬᗜ</p>
            </div>
            <div className="footer-links">
                <Link to="/about" className="footer-link">
                  À propos
                </Link>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
                <Link to="/privacy" className="footer-link">
                  Confidentialité
                </Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Fumotion. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
