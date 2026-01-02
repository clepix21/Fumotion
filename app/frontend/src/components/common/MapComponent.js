/**
 * Composants de carte interactive
 * Utilise Leaflet + OpenStreetMap pour l'affichage et OSRM pour les routes
 */
import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix nécessaire pour les icônes Leaflet avec Create React App (Webpack)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

/**
 * Sous-composant : Centre la carte sur une position
 */
function MapCenter({ center, zoom, skipIfBounds }) {
  const map = useMap()
  const lastCenter = useRef(null)
  
  useEffect(() => {
    if (center && !skipIfBounds) {
      const centerStr = JSON.stringify(center)
      if (lastCenter.current !== centerStr) {
        lastCenter.current = centerStr
        map.setView(center, zoom || map.getZoom())
      }
    }
  }, [map, center, zoom, skipIfBounds])
  return null
}

/**
 * Sous-composant : Gère les clics sur la carte
 */
function MapClickHandler({ onMapClick, interactive }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick && interactive) {
        console.log('Clic sur la carte:', e.latlng)
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

/**
 * Sous-composant : Ajuste la vue pour inclure tous les marqueurs
 */
function FitBounds({ bounds }) {
  const map = useMap()
  const lastBounds = useRef(null)
  
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      const boundsStr = JSON.stringify(bounds)
      if (lastBounds.current !== boundsStr) {
        lastBounds.current = boundsStr
        try {
          const leafletBounds = L.latLngBounds(bounds)
          map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 14 })
        } catch (e) {
          console.error('Erreur fitBounds:', e)
        }
      }
    }
  }, [map, bounds])
  return null
}

// Composant de recherche d'adresse
function AddressSearch({ onSelect, placeholder, value, onChange }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeout = useRef(null)
  const containerRef = useRef(null)

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        limit: 5,
      })

      // Utiliser le proxy backend pour éviter les problèmes CORS
      const apiBase = process.env.REACT_APP_API_URL || ''
      const apiUrl = apiBase ? `${apiBase}/api` : '/api'
      const response = await fetch(`${apiUrl}/geocode/search?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.map(item => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          display_name: item.display_name,
          address: item.address,
        })))
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Erreur recherche:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      searchAddress(newValue)
    }, 300)
  }

  const handleSelect = (suggestion) => {
    onSelect(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const formatShortAddress = (suggestion) => {
    const addr = suggestion.address || {}
    const parts = []
    
    if (addr.house_number) parts.push(addr.house_number)
    if (addr.road || addr.pedestrian) parts.push(addr.road || addr.pedestrian)
    
    const city = addr.city || addr.town || addr.village || addr.municipality
    if (city) parts.push(city)
    
    return parts.length > 0 ? parts.join(', ') : suggestion.display_name.split(',').slice(0, 2).join(',')
  }

  return (
    <div ref={containerRef} className="address-search-container">
      <div className="address-search-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="form-input address-search-input"
        />
        {loading && <span className="search-loading">⏳</span>}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="address-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="address-suggestion-item"
            >
              <span className="suggestion-icon">📍</span>
              <div className="suggestion-text">
                <span className="suggestion-main">{formatShortAddress(suggestion)}</span>
                <span className="suggestion-detail">{suggestion.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Fonction pour récupérer la route via OSRM
async function getRoute(start, end) {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    )
    
    if (!response.ok) throw new Error('Erreur OSRM')
    
    const data = await response.json()
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
        distance: route.distance,
        duration: route.duration,
      }
    }
    return null
  } catch (error) {
    console.error('Erreur récupération route:', error)
    return null
  }
}

export { AddressSearch }

export default function MapComponent({
  center = [49.8942, 2.2957],
  zoom = 13,
  markers = [],
  onMapClick,
  height = '400px',
  interactive = true,
  showRoute = true,
  showSearch = false,
  onDepartureSelect,
  onArrivalSelect,
  departureValue = '',
  arrivalValue = '',
  onDepartureChange,
  onArrivalChange,
  onRouteCalculated,
}) {
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [bounds, setBounds] = useState(null)

  // Créer des icônes personnalisées
  const departureIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const arrivalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const defaultIcon = new L.Icon.Default()

  // Calculer la route quand on a les deux points
  useEffect(() => {
    const departureMarker = markers.find(m => m.type === 'departure')
    const arrivalMarker = markers.find(m => m.type === 'arrival')

    if (departureMarker && arrivalMarker && showRoute) {
      const start = { lat: departureMarker.lat, lng: departureMarker.lng }
      const end = { lat: arrivalMarker.lat, lng: arrivalMarker.lng }

      getRoute(start, end).then(route => {
        if (route) {
          const distanceKm = parseFloat((route.distance / 1000).toFixed(1))
          const durationMin = Math.round(route.duration / 60)
          setRouteCoordinates(route.coordinates)
          setRouteInfo({
            distance: distanceKm,
            duration: durationMin,
          })
          setBounds([
            [departureMarker.lat, departureMarker.lng],
            [arrivalMarker.lat, arrivalMarker.lng]
          ])
          // Appeler le callback avec les infos de route
          if (onRouteCalculated) {
            onRouteCalculated({ distance: distanceKm, duration: durationMin })
          }
        } else {
          // Fallback: ligne droite si OSRM échoue
          setRouteCoordinates([
            [departureMarker.lat, departureMarker.lng],
            [arrivalMarker.lat, arrivalMarker.lng]
          ])
          setRouteInfo(null)
          setBounds([
            [departureMarker.lat, departureMarker.lng],
            [arrivalMarker.lat, arrivalMarker.lng]
          ])
        }
      })
    } else {
      setRouteCoordinates([])
      setRouteInfo(null)
      setBounds(null)
      if (onRouteCalculated) {
        onRouteCalculated(null)
      }
    }
  }, [markers, showRoute, onRouteCalculated])

  return (
    <div style={{ width: '100%' }}>
      {/* Champs de recherche d'adresse */}
      {showSearch && (
        <div className="map-search-fields">
          <div className="search-field-row">
            <span className="search-field-icon departure">●</span>
            <AddressSearch
              value={departureValue}
              onChange={onDepartureChange}
              onSelect={onDepartureSelect}
              placeholder="Rechercher le lieu de départ..."
            />
          </div>
          <div className="search-field-row">
            <span className="search-field-icon arrival">●</span>
            <AddressSearch
              value={arrivalValue}
              onChange={onArrivalChange}
              onSelect={onArrivalSelect}
              placeholder="Rechercher le lieu d'arrivée..."
            />
          </div>
        </div>
      )}

      {/* Informations sur la route */}
      {routeInfo && (
        <div className="route-info-bar">
          <span className="route-info-item">
            <span className="route-info-icon">🛣️</span>
            {routeInfo.distance} km
          </span>
          <span className="route-info-item">
            <span className="route-info-icon">⏱️</span>
            {routeInfo.duration} min
          </span>
        </div>
      )}

      {/* Carte */}
      <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={interactive}
          dragging={interactive}
          touchZoom={interactive}
          doubleClickZoom={interactive}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenter center={center} zoom={zoom} skipIfBounds={!!bounds} />
          <MapClickHandler onMapClick={onMapClick} interactive={interactive} />
          {bounds && <FitBounds bounds={bounds} />}
          
          {/* Tracé de la route */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#3b82f6',
                weight: 5,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )}

          {/* Marqueurs */}
          {markers.map((marker, index) => {
            let icon = defaultIcon
            if (marker.type === 'departure') {
              icon = departureIcon
            } else if (marker.type === 'arrival') {
              icon = arrivalIcon
            }

            return (
              <Marker
                key={index}
                position={[marker.lat, marker.lng]}
                icon={icon}
              >
                {marker.popup && (
                  <Popup>
                    <div>
                      <strong>{marker.popup.title || ''}</strong>
                      {marker.popup.description && <p>{marker.popup.description}</p>}
                    </div>
                  </Popup>
                )}
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

