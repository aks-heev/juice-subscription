// Delivery center coordinates (your apartment)
export const DELIVERY_CENTER = {
    lat: 28.407753,
    lng: 76.964684,
    name: 'Fresh Squeeze HQ'
}

// Delivery radius in kilometers
export const DELIVERY_RADIUS_KM = 5

// LocalStorage keys
const LOCATION_STORAGE_KEY = 'userLocation'

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg) {
    return deg * (Math.PI / 180)
}

/**
 * Check if coordinates are within delivery zone
 */
export function isWithinDeliveryZone(lat, lng) {
    const distance = calculateDistance(
        DELIVERY_CENTER.lat,
        DELIVERY_CENTER.lng,
        lat,
        lng
    )
    return {
        isDeliverable: distance <= DELIVERY_RADIUS_KM,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
    }
}

/**
 * Get current position using browser Geolocation API
 * @returns Promise with coordinates
 */
export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                })
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Location permission denied'))
                        break
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Location information unavailable'))
                        break
                    case error.TIMEOUT:
                        reject(new Error('Location request timed out'))
                        break
                    default:
                        reject(new Error('An unknown error occurred'))
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        )
    })
}

/**
 * Reverse geocode coordinates to address using OpenStreetMap Nominatim
 * @returns Promise with address details
 */
export async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'FreshSqueezeApp/1.0'
                }
            }
        )

        if (!response.ok) {
            throw new Error('Geocoding failed')
        }

        const data = await response.json()
        
        // Extract useful address components
        const address = data.address || {}
        
        // Build a short display name (like Swiggy/Zomato)
        const shortName = address.neighbourhood || 
                         address.suburb || 
                         address.village ||
                         address.town ||
                         address.city_district ||
                         address.city ||
                         'Unknown area'
        
        const city = address.city || 
                    address.town || 
                    address.state_district ||
                    address.state ||
                    ''

        return {
            shortName,
            city,
            fullAddress: data.display_name,
            display_name: data.display_name, // Keep for compatibility
            area: address.neighbourhood || address.suburb || '',
            locality: address.city_district || address.suburb || '',
            pincode: address.postcode || '',
            address: address // Include raw address object for detailed access
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error)
        return {
            shortName: 'Location detected',
            city: '',
            fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            display_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            area: '',
            locality: '',
            pincode: '',
            address: {}
        }
    }
}

/**
 * Save location to localStorage
 */
export function saveLocationToStorage(locationData) {
    try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
            ...locationData,
            timestamp: Date.now()
        }))
    } catch (error) {
        console.error('Error saving location:', error)
    }
}

/**
 * Get location from localStorage
 * Returns null if expired (older than 24 hours) or not found
 */
export function getLocationFromStorage() {
    try {
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
        if (!stored) return null

        const data = JSON.parse(stored)
        const ONE_DAY = 24 * 60 * 60 * 1000

        // Check if location is still valid (less than 24 hours old)
        if (Date.now() - data.timestamp > ONE_DAY) {
            localStorage.removeItem(LOCATION_STORAGE_KEY)
            return null
        }

        return data
    } catch (error) {
        console.error('Error reading location:', error)
        return null
    }
}

/**
 * Clear stored location
 */
export function clearStoredLocation() {
    localStorage.removeItem(LOCATION_STORAGE_KEY)
}

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported() {
    return 'geolocation' in navigator
}

/**
 * Check geolocation permission status
 */
export async function checkLocationPermission() {
    if (!navigator.permissions) {
        return 'prompt' // Assume prompt if permissions API not available
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        return result.state // 'granted', 'denied', or 'prompt'
    } catch {
        return 'prompt'
    }
}
