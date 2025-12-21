// Utilisation du proxy backend pour le géocodage (évite les problèmes CORS)
const API_URL = process.env.REACT_APP_API_URL || '/api'

// Délai entre les requêtes pour respecter la politique d'utilisation de Nominatim
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500 // 0.5 seconde minimum entre les requêtes

export async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return null
  }

  // Vérifier si l'adresse est une coordonnée (format "Localisation : lat, lng" ou "lat, lng")
  const coordMatch = address.match(/(?:Localisation\s?:\s?)?(-?\d+\.\d+),\s?(-?\d+\.\d+)/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        lat,
        lng,
        address: address,
        formatted: {},
      }
    }
  }

  // Respecter le délai entre les requêtes
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

export async function reverseGeocode(lat, lng) {
  // Respecter le délai entre les requêtes
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

    const response = await fetch(`${API_URL}/geocode/reverse?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Erreur de géocodage inverse')
    }

    const data = await response.json()

    if (data && data.display_name) {
      return {
        address: data.display_name,
        formatted: data.address,
      }
    }

    return null
  } catch (error) {
    console.error('Erreur de géocodage inverse:', error)
    return null
  }
}

// Fonction pour formater l'adresse de manière concise
export function formatAddressShort(geocodeResult) {
  if (!geocodeResult) {
    return null
  }

  // Si on a l'objet address détaillé
  const addr = geocodeResult.formatted || {}
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
  }

  // Créer la première partie (rue)
  const street = parts.join(' ')

  // Ajouter la ville
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb

  // Formater le résultat final
  if (street && city) {
    return `${street}, ${city}`
  } else if (city) {
    return city
  } else if (street) {
    return street
  }

  // Fallback : essayer de parser l'adresse complète
  if (geocodeResult.address) {
    const fullAddress = geocodeResult.address
    // Extraire seulement la première partie avant la première virgule et la ville
    const parts = fullAddress.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`
    }
    return parts[0] || fullAddress
  }

  return null
}

