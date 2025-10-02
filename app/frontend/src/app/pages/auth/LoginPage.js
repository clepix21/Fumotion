import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    try {
      setLoading(true);
      // Appel API (à implémenter côté backend)
      await post('/api/auth/login', { email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Connexion</h1>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
        )}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Pas de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}
