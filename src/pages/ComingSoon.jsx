import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Bell, ArrowRight } from 'lucide-react'
import { useLocation as useLocationContext } from '../context/LocationContext'
import '../styles/ComingSoon.css'

function ComingSoon() {
    const navigate = useNavigate()
    const { displayName, distance, deliveryRadius, refreshLocation } = useLocationContext()

    const handleBrowseAnyway = () => {
        navigate('/')
    }

    const handleNotifyMe = () => {
        // TODO: Implement notification signup
        alert('We\'ll notify you when we start delivering to your area!')
    }

    return (
        <div className="coming-soon-page">
            <div className="coming-soon-container">
                <div className="coming-soon-illustration">
                    <div className="map-icon">
                        <MapPin size={48} />
                    </div>
                    <div className="location-ring ring-1"></div>
                    <div className="location-ring ring-2"></div>
                    <div className="location-ring ring-3"></div>
                </div>

                <h1 className="coming-soon-title">
                    Coming to your area soon!
                </h1>

                <p className="coming-soon-location">
                    <MapPin size={16} />
                    {displayName}
                </p>

                <p className="coming-soon-description">
                    You're <strong>{distance} km</strong> away from our delivery zone. 
                    We currently deliver within <strong>{deliveryRadius} km</strong> radius, 
                    but we're expanding fast!
                </p>

                <div className="coming-soon-actions">
                    <button 
                        className="btn btn-primary btn-lg notify-btn"
                        onClick={handleNotifyMe}
                    >
                        <Bell size={20} />
                        Notify me when available
                    </button>

                    <button 
                        className="btn btn-ghost btn-lg browse-btn"
                        onClick={handleBrowseAnyway}
                    >
                        Browse anyway
                        <ArrowRight size={20} />
                    </button>
                </div>

                <button 
                    className="wrong-location-btn"
                    onClick={refreshLocation}
                >
                    Wrong location? Detect again
                </button>
            </div>
        </div>
    )
}

export default ComingSoon
