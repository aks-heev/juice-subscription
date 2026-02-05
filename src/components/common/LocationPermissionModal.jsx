import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { useLocation as useLocationContext } from '../../context/LocationContext'
import LoadingSpinner from './LoadingSpinner'
import '../../styles/LocationPermissionModal.css'

function LocationPermissionModal({ onComplete }) {
    const { 
        requestLocation, 
        hasLocation, 
        isDeliverable, 
        loading,
        permissionState,
        error
    } = useLocationContext()
    
    const [showModal, setShowModal] = useState(true)
    const [detecting, setDetecting] = useState(false)

    // Check if we should show the modal
    useEffect(() => {
        // If location already detected, call onComplete
        if (hasLocation) {
            onComplete(isDeliverable)
            setShowModal(false)
        }
    }, [hasLocation, isDeliverable, onComplete])

    const handleEnableLocation = async () => {
        setDetecting(true)
        try {
            await requestLocation()
            // The useEffect above will handle the completion
        } catch (err) {
            console.error('Location error:', err)
        } finally {
            setDetecting(false)
        }
    }

    const handleSkip = () => {
        setShowModal(false)
        onComplete(null) // null means skipped/unknown
    }

    if (!showModal || hasLocation) return null

    return (
        <div className="location-modal-overlay">
            <div className="location-modal">
                <button className="modal-close" onClick={handleSkip} aria-label="Close">
                    <X size={20} />
                </button>

                <div className="location-modal-icon">
                    <div className="icon-circle">
                        <MapPin size={32} />
                    </div>
                    <div className="icon-pulse"></div>
                </div>

                <h2 className="location-modal-title">
                    Where should we deliver?
                </h2>
                
                <p className="location-modal-description">
                    Enable location access to check if we deliver to your area and get fresh juices delivered daily!
                </p>

                {error && (
                    <div className="location-modal-error">
                        {error}
                    </div>
                )}

                <div className="location-modal-actions">
                    <button 
                        className="btn btn-primary btn-lg location-enable-btn"
                        onClick={handleEnableLocation}
                        disabled={detecting || loading}
                    >
                        {detecting || loading ? (
                            <>
                                <LoadingSpinner size="small" />
                                Detecting location...
                            </>
                        ) : (
                            <>
                                <Navigation size={20} />
                                Enable Location
                            </>
                        )}
                    </button>

                    <button 
                        className="btn btn-ghost location-skip-btn"
                        onClick={handleSkip}
                        disabled={detecting || loading}
                    >
                        Skip for now
                    </button>
                </div>

                <p className="location-modal-note">
                    We only use your location to check delivery availability
                </p>
            </div>
        </div>
    )
}

export default LocationPermissionModal
