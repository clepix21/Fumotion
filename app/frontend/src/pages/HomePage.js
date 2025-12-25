import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import voiture from "../assets/icons/voiture.svg"
import bouclier from "../assets/icons/bouclier.svg"
import speed from "../assets/icons/speed.svg"
import placeholder from "../assets/images/placeholder.png"
import "../styles/HomePage.css"
import Footer from "../components/common/Footer"

export default function HomePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchData, setSearchData] = useState({
    departure: "",
    arrival: "",
    date: "",
    passengers: 1,
  })

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleSearch = (e) => {
    e.preventDefault()

    // Construire les paramètres de recherche
    const params = new URLSearchParams()
    if (searchData.departure.trim()) {
      params.append("departure", searchData.departure.trim())
    }
    if (searchData.arrival.trim()) {
      params.append("arrival", searchData.arrival.trim())
    }
    if (searchData.date) {
      params.append("date", searchData.date)
    }
    if (searchData.passengers) {
      params.append("passengers", searchData.passengers)
    }

    // Rediriger vers la page de recherche avec les paramètres
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Fumotion" className="brand-logo" />
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
            <a href="#benefits" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Pourquoi Fumotion ?
            </a>
            <a href="#popular-trips" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Trajets populaires
            </a>

            {isAuthenticated() ? (
              <>
                <div className="navbar-divider"></div>
                <button onClick={() => { navigate("/search"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
                  Rechercher
                </button>
                <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
                  Tableau de bord
                </button>
                <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                  Créer un trajet
                </button>
                <div className="navbar-user-profile">
                  <Avatar user={user} size="medium" />
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user?.first_name || user?.email}</span>
                  </div>
                </div>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="navbar-btn-logout">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="navbar-divider"></div>
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="navbar-btn-secondary">
                  Connexion
                </button>
                <button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                  Inscription
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Vous avez vos plans, on a vos bons plans.
            </h1>

            <div className="search-card">
              <form onSubmit={handleSearch} className="search-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Départ</label>
                    <input
                      type="text"
                      placeholder="Amiens, Gare du Nord"
                      className="form-input"
                      value={searchData.departure}
                      onChange={(e) => setSearchData({ ...searchData, departure: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination</label>
                    <input
                      type="text"
                      placeholder="IUT Amiens"
                      className="form-input"
                      value={searchData.arrival}
                      onChange={(e) => setSearchData({ ...searchData, arrival: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Passagers</label>
                    <select
                      className="form-input"
                      value={searchData.passengers}
                      onChange={(e) => setSearchData({ ...searchData, passengers: e.target.value })}
                    >
                      <option value="1">1 passager</option>
                      <option value="2">2 passagers</option>
                      <option value="3">3 passagers</option>
                      <option value="4">4 passagers</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="search-button">
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="benefits-section">
        <div className="benefits-container">
          <h2 className="section-title">Pourquoi choisir Fumotion ?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src={voiture} alt="voiture logo" style={{ width: '50px', height: 'auto' }} />
              </div>
              <h3 className="benefit-title">Vos trajets préférés à petits prix</h3>
              <p className="benefit-description">Où que vous alliez, en bus ou en covoiturage, trouvez le trajet idéal parmi notre large choix de destinations à petits prix.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <img src={bouclier} alt="bouclier logo" style={{ width: '50px', height: 'auto' }} />
              </div>
              <h3 className="benefit-title">Voyagez en toute confiance</h3>
              <p className="benefit-description">Nous prenons le temps qu'il faut pour connaître nos membres et nos compagnies de bus partenaires. Nous vérifions les avis, les profils et les pièces d'identité. Vous savez donc avec qui vous allez voyager pour réserver en toute confiance sur notre plateforme sécurisée.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <img src={speed} alt="speed logo" style={{ width: '50px', height: 'auto' }} />
              </div>
              <h3 className="benefit-title">Recherchez, cliquez et réservez !</h3>
              <p className="benefit-description">Réserver un trajet devient encore plus simple ! Facile d'utilisation et dotée de technologies avancées, notre appli vous permet de réserver un trajet à proximité en un rien de temps.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="popular-trips" className="popular-trips-section">
        <div className="popular-container">
          <h2 className="section-title">Les trajets les plus populaires</h2>

          <div className="popular-trips-grid">
            <div className="trip-card">
              <div className="trip-image" style={{ background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${placeholder}) center/cover` }}></div>
              <div className="trip-info">
                <h3>Gare du Nord → IUT </h3>
                <p>Dès 15€</p>
              </div>
            </div>

            <div className="trip-card">
              <div className="trip-image" style={{ background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${placeholder}) center/cover` }}></div>
              <div className="trip-info">
                <h3>Paris → Marseille</h3>
                <p>Dès 20€</p>
              </div>
            </div>

            <div className="trip-card">
              <div className="trip-image" style={{ background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${placeholder}) center/cover` }}></div>
              <div className="trip-info">
                <h3>Paris → Bordeaux</h3>
                <p>Dès 18€</p>
              </div>
            </div>

            <div className="trip-card">
              <div className="trip-image" style={{ background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${placeholder}) center/cover` }}></div>
              <div className="trip-info">
                <h3>Lyon → Nice</h3>
                <p>Dès 22€</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="section-title">Comment ça marche ?</h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3 className="step-title">Recherchez votre trajet</h3>
              <p className="step-description">Entrez votre point de départ, destination et date de voyage</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">✅</div>
              <h3 className="step-title">Réservez votre place</h3>
              <p className="step-description">Choisissez parmi les conducteurs vérifiés et réservez en ligne</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🚗</div>
              <h3 className="step-title">Voyagez sereinement</h3>
              <p className="step-description">Rencontrez votre conducteur et profitez de votre trajet</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Icône de chat fixe */}
      <button 
        className="fixed-chat-button"
        onClick={() => isAuthenticated() ? navigate("/chat") : navigate("/login")}
        title="Messagerie"
      >
        <span className="chat-icon">💬</span>
        <span className="chat-tooltip">Chat</span>
      </button>
    </div>
  )
}

