import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        // Connecter automatiquement l'utilisateur après l'inscription
        if (data.data && data.data.token && data.data.user) {
          login(data.data.user, data.data.token);
          alert('Inscription réussie ! Bienvenue sur Fumotion.');
          navigate('/dashboard');
        } else {
          alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
          navigate('/login');
        }
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
    <div className="auth-page-modern">
      <div className="auth-wrapper-modern">
        <h1 className="auth-title-modern">Inscription</h1>

        <div className="auth-card-modern">
          <form onSubmit={handleSubmit} className="auth-form-modern">
            {error && (
              <div className="error-message-modern">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group-modern">
              <label className="form-label-modern">Prénom</label>
              <div className="input-wrapper-modern">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="Votre prénom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Nom</label>
              <div className="input-wrapper-modern">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="Votre nom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Email étudiant</label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="votre.email@etudiant.univ-amiens.fr"
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
                  placeholder="Au moins 6 caractères"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Confirmer le mot de passe</label>
              <div className="input-wrapper-modern">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="Répétez le mot de passe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Téléphone</label>
              <div className="input-wrapper-modern">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="06 XX XX XX XX"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Numéro étudiant</label>
              <div className="input-wrapper-modern">
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="IUT2024001 ou UPJV2024002"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Établissement</label>
              <div className="input-wrapper-modern">
                <select
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="form-input-modern"
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
            </div>

            <button type="submit" className="login-btn-modern" disabled={loading}>
              {loading ? "CHARGEMENT..." : "S'INSCRIRE"}
            </button>
          </form>

          <div className="signup-link-modern" style={{ color: "#5B9FED" }}>
            <p>
              Déjà un compte ? <Link to="/login" className="signup-text-modern" style={{ color: "#5B9FED" }}>Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}