import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import voiture from "../assets/icons/voiture.svg"
import bouclier from "../assets/icons/bouclier.svg"
import speed from "../assets/icons/speed.svg"
import chatIcon from "../assets/icons/chat.svg"
import searchIcon from "../assets/icons/search.svg"
import checkIcon from "../assets/icons/check.svg"
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

  // Bloquer le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    
    // Cleanup au démontage du composant
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [mobileMenuOpen])

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

          {/* Menu desktop - visible seulement sur grand écran */}
          <div className="navbar-menu navbar-menu-desktop">
            <a href="#benefits" className="navbar-link">
              Pourquoi Fumotion ?
            </a>

            <a href="#how-it-works" className="navbar-link">
              Comment ça marche ?
            </a>

            {isAuthenticated() ? (
              <>
                <div className="navbar-divider"></div>
                <button onClick={() => navigate("/search")} className="navbar-btn-secondary">
                  Rechercher
                </button>
                <button onClick={() => navigate("/dashboard")} className="navbar-btn-secondary">
                  Tableau de bord
                </button>
                <button onClick={() => navigate("/create-trip")} className="navbar-btn-primary">
                  Créer un trajet
                </button>
                <div className="navbar-user-profile">
                  <Avatar user={user} size="medium" />
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user?.first_name || user?.email}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="navbar-btn-logout">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="navbar-divider"></div>
                <button onClick={() => navigate("/login")} className="navbar-btn-secondary">
                  Connexion
                </button>
                <button onClick={() => navigate("/register")} className="navbar-btn-primary">
                  Inscription
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Menu mobile - en dehors de la navbar pour éviter les problèmes de overflow */}
      {mobileMenuOpen && (
        <>
          <div 
            className="navbar-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="navbar-menu-mobile">
            <button 
              className="navbar-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
            
            <a href="#benefits" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Pourquoi Fumotion ?
            </a>

            <a href="#how-it-works" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Comment ça marche ?
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
        </>
      )}

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
                      min={new Date().toISOString().split('T')[0]}
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

      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="section-title">Comment ça marche ?</h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <img src={searchIcon} alt="Rechercher" className="step-icon-img" />
              </div>
              <h3 className="step-title">Recherchez votre trajet</h3>
              <p className="step-description">Entrez votre point de départ, destination et date de voyage</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <img src={checkIcon} alt="Réserver" className="step-icon-img" />
              </div>
              <h3 className="step-title">Réservez votre place</h3>
              <p className="step-description">Choisissez parmi les conducteurs vérifiés et réservez en ligne</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <img src={voiture} alt="Voyager" className="step-icon-img" />
              </div>
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
        <img src={chatIcon} alt="Chat" className="chat-icon-img" />
        <span className="chat-tooltip">Chat</span>
      </button>
    </div>
  )
}

