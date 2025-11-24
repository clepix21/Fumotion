import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet avec Create React App
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Composant pour centrer la carte sur une position
function MapCenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom())
    }
  }, [map, center, zoom])
  return null
}

// Composant pour gérer les clics sur la carte
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

export default function MapComponent({
  center = [49.8942, 2.2957], // Amiens par défaut
  zoom = 13,
  markers = [],
  onMapClick,
  height = '400px',
  interactive = true,
  showRoute = false,
  routePoints = [],
}) {
  // Créer des icônes personnalisées
  const departureIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const arrivalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const defaultIcon = new L.Icon.Default()

  return (
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
        <MapCenter center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} interactive={interactive} />
        
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
  )
}

