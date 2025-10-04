import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CreateTrip.css';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departureLocation: '',
    arrivalLocation: '',
    departureDateTime: '',
    availableSeats: 1,
    pricePerSeat: '',
    description: ''
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Erreur lors de la création du trajet');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-trip-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-link">
            ← Retour au tableau de bord
          </Link>
          <Link to="/" className="logo">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">Fumotion</span>
          </Link>
        </div>
      </header>

      <div className="create-trip-container">
        <div className="create-trip-card">
          <div className="trip-header">
            <h1>Proposer un trajet</h1>
            <p>Partagez votre trajet et réduisez vos frais de transport</p>
          </div>

          <form onSubmit={handleSubmit} className="trip-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Itinéraire */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📍</span>
                Itinéraire
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departureLocation" className="form-label">
                    Lieu de départ
                  </label>
                  <input
                    type="text"
                    id="departureLocation"
                    name="departureLocation"
                    value={formData.departureLocation}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: Amiens, Gare SNCF"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="arrivalLocation" className="form-label">
                    Lieu d'arrivée
                  </label>
                  <input
                    type="text"
                    id="arrivalLocation"
                    name="arrivalLocation"
                    value={formData.arrivalLocation}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: Paris, Porte de Clignancourt"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📅</span>
                Date et heure de départ
              </h3>
              
              <div className="form-group">
                <label htmlFor="departureDateTime" className="form-label">
                  Date et heure
                </label>
                <input
                  type="datetime-local"
                  id="departureDateTime"
                  name="departureDateTime"
                  value={formData.departureDateTime}
                  onChange={handleChange}
                  className="form-input"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Détails du trajet */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">🚗</span>
                Détails du trajet
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availableSeats" className="form-label">
                    Nombre de places disponibles
                  </label>
                  <select
                    id="availableSeats"
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={loading}
                  >
                    <option value={1}>1 place</option>
                    <option value={2}>2 places</option>
                    <option value={3}>3 places</option>
                    <option value={4}>4 places</option>
                    <option value={5}>5 places</option>
                    <option value={6}>6 places</option>
                    <option value={7}>7 places</option>
                    <option value={8}>8 places</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pricePerSeat" className="form-label">
                    Prix par passager (€)
                  </label>
                  <input
                    type="number"
                    id="pricePerSeat"
                    name="pricePerSeat"
                    value={formData.pricePerSeat}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="15"
                    min="0"
                    step="0.50"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">💭</span>
                Informations complémentaires
              </h3>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Ajoutez des informations sur votre trajet, votre véhicule, les modalités de rencontre..."
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Prix estimé */}
            <div className="price-estimate">
              <h3>Estimation des gains</h3>
              <div className="estimate-details">
                <div className="estimate-item">
                  <span>Prix par passager:</span>
                  <span className="estimate-value">{formData.pricePerSeat || 0}€</span>
                </div>
                <div className="estimate-item">
                  <span>Nombre de passagers:</span>
                  <span className="estimate-value">{formData.availableSeats}</span>
                </div>
                <div className="estimate-item total">
                  <span>Gain total estimé:</span>
                  <span className="estimate-value">
                    {(parseFloat(formData.pricePerSeat || 0) * parseInt(formData.availableSeats)).toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <Link to="/dashboard" className="cancel-btn">
                Annuler
              </Link>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Publication en cours...' : 'Publier le trajet'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips sidebar */}
        <div className="tips-sidebar">
          <div className="tips-card">
            <h3>Conseils pour un bon trajet</h3>
            <ul className="tips-list">
              <li>
                <span className="tip-icon">💡</span>
                Soyez précis sur le lieu de rendez-vous
              </li>
              <li>
                <span className="tip-icon">📱</span>
                Laissez votre numéro de téléphone visible
              </li>
              <li>
                <span className="tip-icon">⏰</span>
                Prévoyez une marge pour les retards
              </li>
              <li>
                <span className="tip-icon">🚗</span>
                Mentionnez les caractéristiques de votre véhicule
              </li>
              <li>
                <span className="tip-icon">💰</span>
                Fixez un prix équitable basé sur les frais réels
              </li>
            </ul>
          </div>

          <div className="security-info">
            <h4>🔒 Sécurité</h4>
            <p>
              Vos informations personnelles ne sont partagées qu'avec les passagers 
              qui réservent votre trajet. Vous pouvez toujours annuler si nécessaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}