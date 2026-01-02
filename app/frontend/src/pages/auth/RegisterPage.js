/**
 * Page d'inscription
 * Formulaire complet avec validation côté client
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  // Données du formulaire d'inscription
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', phone: '', studentId: '', university: 'IUT Amiens'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Efface l'erreur du champ modifié
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  /** Soumission avec validation */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Validation côté client
    const errors = {};
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
        // Gérer les erreurs de validation du backend
        if (data.errors && Array.isArray(data.errors)) {
          const errors = {};
          data.errors.forEach(err => {
            const field = err.path || err.param;
            errors[field] = err.msg;
          });
          setFieldErrors(errors);
          setError('Veuillez corriger les erreurs dans le formulaire');
        } else {
          setError(data.message || 'Erreur lors de l\'inscription');
        }
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
        <Link to="/" className="back-link-modern">
          ← Retour à l'accueil
        </Link>
        <h1 className="auth-title-modern">Inscription</h1>

        <div className="auth-card-modern">
          <form onSubmit={handleSubmit} className="auth-form-modern">
            {error && (
              <div className="error-message-modern">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group-modern" style={{ flex: 1 }}>
                <label className="form-label-modern">Prénom</label>
                <div className="input-wrapper-modern">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`form-input-modern ${fieldErrors.firstName ? 'input-error' : ''}`}
                    placeholder="Votre prénom"
                    required
                    disabled={loading}
                  />
                </div>
                {fieldErrors.firstName && (
                  <span className="field-error-message">{fieldErrors.firstName}</span>
                )}
              </div>

              <div className="form-group-modern" style={{ flex: 1 }}>
                <label className="form-label-modern">Nom</label>
                <div className="input-wrapper-modern">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`form-input-modern ${fieldErrors.lastName ? 'input-error' : ''}`}
                    placeholder="Votre nom"
                    required
                    disabled={loading}
                  />
                </div>
                {fieldErrors.lastName && (
                  <span className="field-error-message">{fieldErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Email</label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input-modern ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="votre.email@domaine.fr"
                  required
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error-message">{fieldErrors.email}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group-modern" style={{ flex: 1 }}>
                <label className="form-label-modern">Mot de passe</label>
                <div className="input-wrapper-modern">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input-modern ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="Au moins 6 caractères"
                    required
                    disabled={loading}
                  />
                </div>
                {fieldErrors.password && (
                  <span className="field-error-message">{fieldErrors.password}</span>
                )}
              </div>

              <div className="form-group-modern" style={{ flex: 1 }}>
                <label className="form-label-modern">Confirmer le mot de passe</label>
                <div className="input-wrapper-modern">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input-modern ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Répétez le mot de passe"
                    required
                    disabled={loading}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="field-error-message">{fieldErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group-modern" style={{ flex: 1 }}>
                <label className="form-label-modern">Téléphone</label>
                <div className="input-wrapper-modern">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input-modern ${fieldErrors.phone ? 'input-error' : ''}`}
                    placeholder="06XXXXXXXX"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.phone && (
                  <span className="field-error-message">{fieldErrors.phone}</span>
                )}
              </div>

              <div className="form-group-modern" style={{ flex: 1 }}>
                <label className="form-label-modern">Numéro étudiant</label>
                <div className="input-wrapper-modern">
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="form-input-modern"
                    placeholder="Votre numéro étudiant"
                    disabled={loading}
                  />
                </div>
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
                  <option value="UPJV - Campus Citadelle">UPJV - Campus Citadelle</option>
                  <option value="UPJV - Campus Teinturerie">UPJV - Campus Teinturerie</option>
                  <option value="UPJV - Campus Cathedrale">UPJV - Campus Cathédrale</option>
                  <option value="UPJV - Campus Saint-Leu">UPJV - Campus Saint-Leu</option>
                  <option value="UPJV - Campus Saint-Charles">UPJV - Campus Saint-Charles</option>
                  <option value="UPJV - Campus Campus-Sud">UPJV - Campus Sud (Pôle Campus / Thil)</option>
                  <option value="UPJV - Campus Bailly">UPJV - Campus Bailly (STAPS)</option>
                  <option value="UPJV - IUT Amiens">UPJV - IUT Amiens</option>
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