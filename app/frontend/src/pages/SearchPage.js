import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '../styles/Search.css';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [searchData, setSearchData] = useState({
    departure: searchParams.get('departure') || '',
    arrival: searchParams.get('arrival') || '',
    date: searchParams.get('date') || '',
    passengers: searchParams.get('passengers') || 1
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams();
      if (searchData.departure) queryParams.append('departure', searchData.departure);
      if (searchData.arrival) queryParams.append('arrival', searchData.arrival);
      if (searchData.date) queryParams.append('date', searchData.date);
      if (searchData.passengers) queryParams.append('passengers', searchData.passengers);

      const response = await fetch(`http://localhost:5000/api/trips/search?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setTrips(data.data.trips || []);
      } else {
        console.error('Erreur lors de la recherche:', data.message);
        setTrips([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [searchData]);

  useEffect(() => {
    // Si des paramètres de recherche sont présents dans l'URL, effectuer la recherche
    if (searchParams.get('departure') && searchParams.get('arrival')) {
      handleSearch();
    }
  }, [searchParams, handleSearch]);

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleBookTrip = async (tripId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/trips/${tripId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          seatsBooked: parseInt(searchData.passengers)
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Réservation effectuée avec succès !');
        // Recharger la recherche pour mettre à jour les places disponibles
        handleSearch();
      } else {
        alert('Erreur lors de la réservation: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  return (
    <div className="search-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">Fumotion</span>
          </Link>
          
          <nav className="header-nav">
            <Link to="/dashboard" className="nav-link">Mon tableau de bord</Link>
            <Link to="/create-trip" className="nav-link">Proposer un trajet</Link>
          </nav>
        </div>
      </header>

      <div className="search-container">
        {/* Formulaire de recherche */}
        <div className="search-form-container">
          <h1>Rechercher un trajet</h1>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📍</span>
                  Départ
                </label>
                <input
                  type="text"
                  name="departure"
                  value={searchData.departure}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ville de départ"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎯</span>
                  Arrivée
                </label>
                <input
                  type="text"
                  name="arrival"
                  value={searchData.arrival}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ville d'arrivée"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📅</span>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👥</span>
                  Passagers
                </label>
                <select
                  name="passengers"
                  value={searchData.passengers}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="1">1 passager</option>
                  <option value="2">2 passagers</option>
                  <option value="3">3 passagers</option>
                  <option value="4">4 passagers</option>
                  <option value="5">5+ passagers</option>
                </select>
              </div>
            </div>

            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Recherche en cours...' : 'Rechercher'}
            </button>
          </form>
        </div>

        {/* Résultats */}
        <div className="search-results">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Recherche de trajets disponibles...</p>
            </div>
          )}

          {!loading && hasSearched && trips.length === 0 && (
            <div className="empty-results">
              <div className="empty-icon">🔍</div>
              <h3>Aucun trajet trouvé</h3>
              <p>Essayez de modifier vos critères de recherche ou proposez votre propre trajet.</p>
              <Link to="/create-trip" className="create-trip-link">
                Proposer un trajet
              </Link>
            </div>
          )}

          {!loading && trips.length > 0 && (
            <div className="trips-list">
              <div className="results-header">
                <h2>{trips.length} trajet{trips.length > 1 ? 's' : ''} trouvé{trips.length > 1 ? 's' : ''}</h2>
                <div className="sort-options">
                  <select className="sort-select">
                    <option value="departure_time">Heure de départ</option>
                    <option value="price">Prix</option>
                    <option value="rating">Note du conducteur</option>
                  </select>
                </div>
              </div>

              <div className="trips-grid">
                {trips.map(trip => (
                  <div key={trip.id} className="trip-card">
                    <div className="trip-header">
                      <div className="trip-route">
                        <div className="route-point departure">
                          <span className="route-icon">📍</span>
                          <span className="route-location">{trip.departure_location}</span>
                        </div>
                        <div className="route-line"></div>
                        <div className="route-point arrival">
                          <span className="route-icon">🎯</span>
                          <span className="route-location">{trip.arrival_location}</span>
                        </div>
                      </div>
                      
                      <div className="trip-time">
                        <span className="departure-time">
                          {formatDate(trip.departure_datetime)}
                        </span>
                      </div>
                    </div>

                    <div className="trip-details">
                      <div className="driver-info">
                        <div className="driver-avatar">
                          {trip.first_name[0]}{trip.last_name[0]}
                        </div>
                        <div className="driver-details">
                          <span className="driver-name">{trip.first_name} {trip.last_name}</span>
                          <div className="driver-rating">
                            <span className="rating-stars">⭐</span>
                            <span className="rating-value">
                              {trip.driver_rating ? Number(trip.driver_rating).toFixed(1) : 'Nouveau'}
                            </span>
                            <span className="rating-count">
                              ({trip.reviews_count || 0} avis)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="trip-info">
                        <div className="info-item">
                          <span className="info-icon">🚗</span>
                          <span>{trip.remaining_seats} place{trip.remaining_seats > 1 ? 's' : ''} disponible{trip.remaining_seats > 1 ? 's' : ''}</span>
                        </div>
                        
                        {trip.description && (
                          <div className="info-item">
                            <span className="info-icon">💭</span>
                            <span className="trip-description">{trip.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="trip-footer">
                      <div className="trip-price">
                        <span className="price-amount">{formatPrice(trip.price_per_seat)}€</span>
                        <span className="price-label">par personne</span>
                      </div>

                      <div className="trip-actions">
                        <button 
                          className="book-button"
                          onClick={() => handleBookTrip(trip.id)}
                          disabled={trip.remaining_seats < searchData.passengers}
                        >
                          {trip.remaining_seats < searchData.passengers 
                            ? 'Places insuffisantes' 
                            : 'Réserver'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasSearched && (
            <div className="search-placeholder">
              <div className="placeholder-icon">🔍</div>
              <h3>Prêt à voyager ?</h3>
              <p>Utilisez le formulaire ci-dessus pour trouver des trajets entre étudiants.</p>
              
              <div className="popular-routes">
                <h4>Trajets populaires</h4>
                <div className="routes-grid">
                  <button 
                    className="route-suggestion"
                    onClick={() => {
                      setSearchData({
                        ...searchData,
                        departure: 'Amiens',
                        arrival: 'Paris'
                      });
                    }}
                  >
                    Amiens → Paris
                  </button>
                  <button 
                    className="route-suggestion"
                    onClick={() => {
                      setSearchData({
                        ...searchData,
                        departure: 'Amiens',
                        arrival: 'Lille'
                      });
                    }}
                  >
                    Amiens → Lille
                  </button>
                  <button 
                    className="route-suggestion"
                    onClick={() => {
                      setSearchData({
                        ...searchData,
                        departure: 'Amiens',
                        arrival: 'Reims'
                      });
                    }}
                  >
                    Amiens → Reims
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}