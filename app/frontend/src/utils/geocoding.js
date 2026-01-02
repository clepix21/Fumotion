/**
 * Utilitaires de géocodage
 * Utilise l'API Nominatim via proxy backend pour éviter les problèmes CORS
 */

const API_BASE = process.env.REACT_APP_API_URL || ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

// Rate limiting : Nominatim limite à 1 req/seconde
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500

/**
 * Convertit une adresse textuelle en coordonnées GPS
 * @param {string} address - Adresse à géocoder
 * @returns {Object|null} { lat, lng, address, formatted }
 */
export async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return null
  }

  // Détecter si l'entrée est déjà des coordonnées
  const coordMatch = address.match(/(?:Localisation\s?:\s?)?(-?\d+\.\d+),\s?(-?\d+\.\d+)/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng, address, formatted: {} }
    }
  }

  // Respecter le rate limit de Nominatim
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  try {
    const params = new URLSearchParams({
      q: address,
      limit: 1,
    })

    const response = await fetch(`${API_URL}/geocode/search?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Erreur de géocodage')
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
        formatted: result.address,
      }
    }

    return null
  } catch (error) {
    console.error('Erreur de géocodage:', error)
    return null
  }
}

/**
 * Convertit des coordonnées GPS en adresse lisible
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} { display_name, address }
 */
export async function reverseGeocode(lat, lng) {
  // Respecter le rate limit
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
    })

    console.log('Reverse geocode request:', `${API_URL}/geocode/reverse?${params.toString()}`)
    const response = await fetch(`${API_URL}/geocode/reverse?${params.toString()}`)

    if (!response.ok) {
      console.error('Reverse geocode error: response not ok', response.status)
      throw new Error('Erreur de géocodage inverse')
    }

    const data = await response.json()
    console.log('Reverse geocode response:', data)

    if (data && data.display_name) {
      return {
        display_name: data.display_name,
        address: data.address || {}, // Objet détaillé (house_number, road, city...)
      }
    }

    return null
  } catch (error) {
    console.error('Erreur de géocodage inverse:', error)
    return null
  }
}

/**
 * Formate une adresse en version courte (rue, ville)
 * @param {Object} geocodeResult - Résultat de geocode ou reverseGeocode
 * @returns {string|null} Adresse formatée
 */
export function formatAddressShort(geocodeResult) {
  if (!geocodeResult) {
    return null
  }

  console.log('formatAddressShort input:', geocodeResult)

  // Récupérer l'objet address (depuis reverseGeocode ou geocodeAddress)
  const addr = geocodeResult.address || geocodeResult.formatted || {}
  
  // Si addr est une string (display_name), la parser
  if (typeof addr === 'string') {
    const parts = addr.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`
    }
    return parts[0] || null
  }
  
  // Si addr est un objet avec les détails (house_number, road, city, etc.)
  if (typeof addr === 'object' && Object.keys(addr).length > 0) {
    const parts = []

    // Ajouter le numéro de rue
    if (addr.house_number) {
      parts.push(addr.house_number)
    }

    // Ajouter le nom de la rue
    if (addr.road) {
      parts.push(addr.road)
    } else if (addr.pedestrian) {
      parts.push(addr.pedestrian)
    } else if (addr.footway) {
      parts.push(addr.footway)
    } else if (addr.path) {
      parts.push(addr.path)
    } else if (addr.amenity) {
      parts.push(addr.amenity)
    } else if (addr.building) {
      parts.push(addr.building)
    }

    // Créer la première partie (rue)
    const street = parts.join(' ')

    // Ajouter la ville
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county

    // Formater le résultat final
    if (street && city) {
      return `${street}, ${city}`
    } else if (city) {
      return city
    } else if (street) {
      return street
    }
  }

  // Fallback : essayer de parser display_name
  if (geocodeResult.display_name) {
    const parts = geocodeResult.display_name.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`
    }
    return parts[0] || null
  }

  return null
}

