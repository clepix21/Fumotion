/**
 * Page de réinitialisation de mot de passe (via token email)
 * Utilisée après clic sur le lien envoyé par email
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import '../../styles/auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Token de réinitialisation depuis l'URL

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Soumet le nouveau mot de passe */
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
    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.resetPassword({ token, password: formData.password });

      if (data.success) {
        alert('Mot de passe réinitialisé avec succès !');
        navigate('/login');
      }
    } catch (err) {
      console.error('Erreur reset mdp:', err);
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe');
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
        <h1 className="auth-title-modern">Nouveau mot de passe</h1>

        <div className="auth-card-modern">
          <form onSubmit={handleSubmit} className="auth-form-modern">
            <p className="forgot-description-modern">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>

            {error && (
              <div className="error-message-modern">
                {error}
              </div>
            )}

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
