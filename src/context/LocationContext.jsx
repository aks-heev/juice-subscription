import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
    getCurrentPosition,
    reverseGeocode,
    isWithinDeliveryZone,
    saveLocationToStorage,
    getLocationFromStorage,
    clearStoredLocation,
    isGeolocationSupported,
    checkLocationPermission,
    DELIVERY_RADIUS_KM
} from '../lib/location'

const LocationContext = createContext()

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(null)
    const [address, setAddress] = useState(null)
    const [isDeliverable, setIsDeliverable] = useState(null)
    const [distance, setDistance] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [permissionState, setPermissionState] = useState('prompt')

    // Load stored location on mount
    useEffect(() => {
        const loadStoredLocation = async () => {
            const stored = getLocationFromStorage()
            if (stored) {
                setLocation({ lat: stored.lat, lng: stored.lng })
                setAddress(stored.address)
                setIsDeliverable(stored.isDeliverable)
                setDistance(stored.distance)
                setLoading(false)
            } else {
                // Check permission state
                const permission = await checkLocationPermission()
                setPermissionState(permission)
                
                // Auto-request if permission was previously granted
                if (permission === 'granted') {
                    requestLocation()
                } else {
                    setLoading(false)
                }
            }
        }

        if (isGeolocationSupported()) {
            loadStoredLocation()
        } else {
            setError('Geolocation not supported')
            setLoading(false)
        }
    }, [])

    const requestLocation = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Get current position
            const position = await getCurrentPosition()
            setLocation({ lat: position.lat, lng: position.lng })

            // Check delivery zone
            const { isDeliverable: deliverable, distance: dist } = isWithinDeliveryZone(
                position.lat,
                position.lng
            )
            setIsDeliverable(deliverable)
            setDistance(dist)

            // Get address via reverse geocoding
            const addressData = await reverseGeocode(position.lat, position.lng)
            setAddress(addressData)

            // Save to localStorage
            saveLocationToStorage({
                lat: position.lat,
                lng: position.lng,
                address: addressData,
                isDeliverable: deliverable,
                distance: dist
            })

            setPermissionState('granted')
        } catch (err) {
            setError(err.message)
            if (err.message === 'Location permission denied') {
                setPermissionState('denied')
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshLocation = useCallback(async () => {
        clearStoredLocation()
        await requestLocation()
    }, [requestLocation])

    const clearLocation = useCallback(() => {
        clearStoredLocation()
        setLocation(null)
        setAddress(null)
        setIsDeliverable(null)
        setDistance(null)
        setError(null)
    }, [])

    const value = {
        // State
        location,
        address,
        isDeliverable,
        distance,
        loading,
        error,
        permissionState,
        deliveryRadius: DELIVERY_RADIUS_KM,

        // Computed
        hasLocation: !!location,
        displayName: address?.shortName || (loading ? 'Detecting...' : 'Set location'),
        fullDisplayName: address ? `${address.shortName}${address.city ? `, ${address.city}` : ''}` : null,

        // Actions
        requestLocation,
        refreshLocation,
        clearLocation
    }

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider')
    }
    return context
}
