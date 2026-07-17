// Google Places API (New) helper
// IMPORTANT: uses the NEW Places API (places.googleapis.com) because the legacy
// endpoints (maps.googleapis.com/maps/api/place/...) block browser CORS requests.
// Enable "Places API (New)" in Google Cloud Console — not the legacy one.

const KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY

export const hasPlacesKey = () => !!KEY && KEY !== 'placeholder'

const FIELDS_LIST = [
  'places.id', 'places.displayName', 'places.rating', 'places.userRatingCount',
  'places.priceLevel', 'places.photos', 'places.location',
  'places.primaryTypeDisplayName', 'places.currentOpeningHours.openNow',
].join(',')

const FIELDS_DETAIL = [
  'id', 'displayName', 'rating', 'userRatingCount', 'reviews', 'websiteUri',
  'googleMapsUri', 'currentOpeningHours', 'formattedAddress', 'photos', 'location',
  'priceLevel', 'primaryTypeDisplayName', 'internationalPhoneNumber',
].join(',')

async function post(url, body, fieldMask) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Places API ${res.status}`)
  return res.json()
}

// --- Postcode → lat/lng (used when location permission is denied) ---
export async function geocodePostcode(postcode) {
  if (!hasPlacesKey()) return null
  try {
    const data = await post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: `${postcode} NSW Australia`, maxResultCount: 1 },
      'places.location,places.formattedAddress'
    )
    const p = data.places?.[0]
    return p ? { lat: p.location.latitude, lng: p.location.longitude } : null
  } catch { return null }
}

// --- Nearby search (restaurants, parks, cinemas etc.) ---
export async function searchNearby({ lat, lng, types = ['restaurant'], radius = 3000, max = 10 }) {
  if (!hasPlacesKey()) return null
  try {
    const data = await post(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        includedTypes: types,
        maxResultCount: max,
        rankPreference: 'POPULARITY',
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      },
      FIELDS_LIST
    )
    return (data.places ?? []).map(p => normalise(p, lat, lng))
  } catch { return null }
}

// --- Text search (e.g. cuisine keyword like "Japanese restaurant") ---
export async function searchByText({ query, lat, lng, max = 10 }) {
  if (!hasPlacesKey()) return null
  try {
    const data = await post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: query,
        maxResultCount: max,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 5000 } },
      },
      FIELDS_LIST
    )
    return (data.places ?? []).map(p => normalise(p, lat, lng))
  } catch { return null }
}

// --- Full details for one place (reviews, website/menu link, hours) ---
export async function getPlaceDetails(placeId) {
  if (!hasPlacesKey()) return null
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': FIELDS_DETAIL },
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch { return null }
}

// --- Photo URL builder (photoName comes from place.photos[n].name) ---
export function photoUrl(photoName, w = 500) {
  if (!photoName || !hasPlacesKey()) return null
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${w}&key=${KEY}`
}

// --- Public transport deep link (opens Google Maps in transit mode — free, no API cost) ---
export function transitLink(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
}

// --- Helpers ---
function normalise(p, userLat, userLng) {
  return {
    id: p.id,
    name: p.displayName?.text ?? 'Unknown',
    type: p.primaryTypeDisplayName?.text ?? '',
    rating: p.rating,
    ratingCount: p.userRatingCount,
    priceLevel: p.priceLevel,
    openNow: p.currentOpeningHours?.openNow,
    photo: p.photos?.[0]?.name ?? null,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    dist: (userLat && p.location) ? distKm(userLat, userLng, p.location.latitude, p.location.longitude) : null,
  }
}

export function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`
}
const rad = d => d * Math.PI / 180
