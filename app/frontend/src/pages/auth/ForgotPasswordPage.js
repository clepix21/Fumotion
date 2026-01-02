/**
 * Page de récupération de mot de passe
 * Vérifie email + n° étudiant avant de permettre le changement
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', studentId: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Soumet la demande de réinitialisation */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          studentId: formData.studentId,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Mot de passe réinitialisé avec succès !');
        navigate('/login');
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation du mot de passe');
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
        <Link to="/login" className="back-link-modern">
          ← Retour à la connexion
        </Link>
        <h1 className="auth-title-modern">Réinitialiser le mot de passe</h1>

        <div className="auth-card-modern">
          <form onSubmit={handleSubmit} className="auth-form-modern">
            <p className="forgot-description-modern">
              Entrez votre email et votre numéro étudiant pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div className="error-message-modern">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group-modern">
              <label className="form-label-modern">Email</label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input-modern"
                  placeholder="Entrez votre email"
                  required
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
                  placeholder="Votre numéro étudiant"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Nouveau mot de passe</label>
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

            <button type="submit" className="login-btn-modern" disabled={loading}>
              {loading ? "CHARGEMENT..." : "RÉINITIALISER LE MOT DE PASSE"}
            </button>
          </form>

          <div className="signup-link-modern" style={{ color: "#5B9FED" }}>
            <p>
              <Link to="/login" className="signup-text-modern" style={{ color: "#5B9FED" }}>
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
