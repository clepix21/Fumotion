/**
 * Page d'accueil de Fumotion
 * Barre de recherche rapide, présentation des fonctionnalités, témoignages
 */
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Avatar from "../components/common/Avatar"
import logo from "../assets/images/logo.png"
import voiture from "../assets/icons/voiture.svg"
import bouclier from "../assets/icons/bouclier.svg"
import speed from "../assets/icons/speed.svg"
import searchIcon from "../assets/icons/search.svg"
import checkIcon from "../assets/icons/check.svg"
import "../styles/HomePage.css"
import Footer from "../components/common/Footer"
import FixedChatButton from "../components/Chat/FixedChatButton"

export default function HomePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Données du formulaire de recherche rapide
  const [searchData, setSearchData] = useState({
    departure: "",
    arrival: "",
    date: "",
    passengers: 1,
  })

  // Triple clic navbar-brand
  const [brandClicks, setBrandClicks] = useState([])
  useEffect(() => {
    if (brandClicks.length >= 3) {
      const now = Date.now()
      if (now - brandClicks[0] < 700) {
        const audio = new window.Audio('/chocobo.wav')
        audio.play()
      }
      setBrandClicks([])
    }
  }, [brandClicks])

  // Bloque le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => document.body.classList.remove('menu-open')
  }, [mobileMenuOpen])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // Redirige vers la page de recherche avec les paramètres
  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchData.departure.trim()) params.append("departure", searchData.departure.trim())
    if (searchData.arrival.trim()) params.append("arrival", searchData.arrival.trim())
    if (searchData.date) params.append("date", searchData.date)
    if (searchData.passengers) params.append("passengers", searchData.passengers)
    // Rediriger vers la page de recherche avec les paramètres
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-container">
          <div
            className="navbar-brand"
            onClick={() => {
              setBrandClicks((prev) => [...prev.slice(-2), Date.now()])
              navigate("/")
            }}
          >
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
                <button onClick={() => navigate("/create-trip")} className="navbar-btn-primary">
                  Créer un trajet
                </button>
                <div className="navbar-user-profile" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
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
                <button onClick={() => { navigate("/create-trip"); setMobileMenuOpen(false); }} className="navbar-btn-primary">
                  Créer un trajet
                </button>
                <div className="navbar-user-profile" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
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
              <h3 className="benefit-title">Économisez sur vos trajets étudiants</h3>
              <p className="benefit-description">Partagez les frais de trajet entre votre domicile et votre lieu d'études. Le covoiturage entre étudiants, c'est malin et économique !</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <img src={bouclier} alt="bouclier logo" style={{ width: '50px', height: 'auto' }} />
              </div>
              <h3 className="benefit-title">Une communauté étudiante vérifiée</h3>
              <p className="benefit-description">Voyagez uniquement avec d'autres étudiants. Nous vérifions les profils et les avis pour vous garantir des trajets en toute confiance avec des personnes de votre campus.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <img src={speed} alt="speed logo" style={{ width: '50px', height: 'auto' }} />
              </div>
              <h3 className="benefit-title">Simple et rapide</h3>
              <p className="benefit-description">Trouvez un covoiturage vers votre fac, IUT ou école en quelques clics. Proposez vos trajets réguliers et remplissez votre voiture facilement.</p>
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

      <FixedChatButton />
    </div>
  )
}

