import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studentId: '',
    university: 'IUT Amiens'
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

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      console.log('Envoi des données:', formData);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          studentId: formData.studentId,
          university: formData.university
        }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok && data.success) {
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
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
            <h1>Rejoindre Fumotion Amiens</h1>
            <p>Créez votre compte étudiant pour partager vos trajets dans Amiens</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Votre prénom"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Votre nom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email étudiant</label>
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
              <small className="form-hint">
                Utilisez votre email étudiant officiel (.univ-amiens.fr ou .u-picardie.fr)
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Au moins 6 caractères"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirmer</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Répétez le mot de passe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="06 XX XX XX XX"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="studentId" className="form-label">Numéro étudiant</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="IUT2024001 ou UPJV2024002"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="university" className="form-label">Établissement</label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="IUT Amiens">IUT Amiens</option>
                <option value="UPJV Campus Citadelle">UPJV Campus Citadelle</option>
                <option value="UPJV Campus Teinturerie">UPJV Campus Teinturerie</option>
                <option value="UPJV - Autre campus">UPJV - Autre campus</option>
                <option value="Autre établissement Amiens">Autre établissement Amiens</option>
              </select>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <div className="info-card">
            <span className="info-icon">🎓</span>
            <h3>Réservé aux étudiants</h3>
            <p>Fumotion Amiens est exclusivement destiné aux étudiants des établissements amiénois</p>
          </div>
          <div className="info-card">
            <span className="info-icon">🔒</span>
            <h3>Sécurisé</h3>
            <p>Vos données sont protégées et votre identité étudiante est vérifiée</p>
          </div>
        </div>
      </div>
    </div>
  );
}