// Utilisation de Nominatim (OpenStreetMap) pour le géocodage
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'

// Délai entre les requêtes pour respecter la politique d'utilisation de Nominatim
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 seconde minimum entre les requêtes

export async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return null
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
      format: 'json',
      limit: 1,
      addressdetails: 1,
    })

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'Fumotion/1.0', // Requis par Nominatim
      },
    })

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
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: 1,
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        'User-Agent': 'Fumotion/1.0',
      },
    })

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
  if (!geocodeResult || !geocodeResult.formatted) {
    return geocodeResult?.address || null
  }

  const addr = geocodeResult.formatted
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
  }

  // Créer la première partie (rue)
  const street = parts.join(' ')

  // Ajouter la ville
  const city = addr.city || addr.town || addr.village || addr.municipality

  // Formater le résultat final
  if (street && city) {
    return `${street}, ${city}`
  } else if (city) {
    return city
  } else if (street) {
    return street
  }

  // Fallback sur l'adresse complète
  return geocodeResult.address
}

