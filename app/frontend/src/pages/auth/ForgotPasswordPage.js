/**
 * Page de demande de réinitialisation de mot de passe
 * Envoie un lien de réinitialisation par email
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Si un compte est associé à cet email, un lien de réinitialisation vous a été envoyé.');
      } else {
        setError(data.message || 'Erreur lors de la demande');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setError('Erreur de connexion au serveur.');
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
        <h1 className="auth-title-modern">Mot de passe oublié</h1>

        <div className="auth-card-modern">
          <form onSubmit={handleSubmit} className="auth-form-modern">
            <p className="forgot-description-modern">
              Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div className="error-message-modern">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {message && (
              <div className="success-message-modern">
                <span className="success-icon">✓</span>
                <p>{message}</p>
              </div>
            )}

            <div className="form-group-modern">
              <label className="form-label-modern">Email</label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input-modern"
                  placeholder="votre.email@exemple.com"
                  required
                  disabled={loading}
                  style={{ height: '24px', padding: 0, margin: 0, lineHeight: '24px' }}
                />
              </div>
            </div>

            <button type="submit" className="login-btn-modern" disabled={loading}>
              {loading ? "ENVOI EN COURS..." : "ENVOYER LE LIEN"}
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
