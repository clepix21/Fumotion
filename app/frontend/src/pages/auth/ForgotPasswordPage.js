import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de l\'email');
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
        <h1 className="auth-title-modern">Mot de passe oublié</h1>

        <div className="auth-card-modern">
          {success ? (
            <div className="success-message-modern">
              <span className="success-icon">✓</span>
              <div>
                <h3>Email envoyé !</h3>
                <p>Un lien de réinitialisation a été envoyé à {email}</p>
                <p>Vérifiez votre boîte de réception.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-modern">
              <p className="forgot-description-modern">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input-modern"
                    placeholder="Entrez votre email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn-modern" disabled={loading}>
                {loading ? "ENVOI EN COURS..." : "ENVOYER LE LIEN"}
              </button>
            </form>
          )}

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
