import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Tentative de connexion pour:', formData.email);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok && data.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Connexion réussie, redirection vers /dashboard');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setError('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

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
              <label htmlFor="email" className="form-label">Email</label>
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
              <label htmlFor="password" className="form-label">Mot de passe</label>
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="auth-link">
                S'inscrire
              </Link>
            </p>
          </div>

          <div className="test-accounts">
            <h4>Comptes de test disponibles :</h4>
            <div className="test-account">
              <strong>Email:</strong> pierre.martin@etudiant.univ-amiens.fr<br/>
              <strong>Mot de passe:</strong> password123
            </div>
            <div className="test-account">
              <strong>Email:</strong> marie.dubois@etudiant.u-picardie.fr<br/>
              <strong>Mot de passe:</strong> password123
            </div>
            <div className="test-account">
              <strong>Email:</strong> thomas.leroy@etudiant.univ-amiens.fr<br/>
              <strong>Mot de passe:</strong> password123
            </div>
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
  );
}