import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { MapPin, X, Navigation, Home, Briefcase, Heart, MoreHorizontal, Check, Loader } from 'lucide-react'
import { reverseGeocode, DELIVERY_CENTER, isWithinDeliveryZone } from '../../lib/location'
import 'leaflet/dist/leaflet.css'
import '../../styles/MapAddressPicker.css'

// Fix Leaflet default marker icon issue
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const deliveryZoneIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const ADDRESS_TYPES = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'work', label: 'Work', icon: Briefcase },
    { id: 'friend', label: "Friend's", icon: Heart },
    { id: 'other', label: 'Other', icon: MoreHorizontal }
]

function LocationMarker({ position, setPosition, onLocationChange }) {
    const map = useMap()

    useMapEvents({
        click(e) {
            const newPos = [e.latlng.lat, e.latlng.lng]
            setPosition(newPos)
            onLocationChange(newPos)
        }
    })

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    return position ? (
        <Marker 
            position={position} 
            icon={deliveryZoneIcon}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target
                    const newPos = [marker.getLatLng().lat, marker.getLatLng().lng]
                    setPosition(newPos)
                    onLocationChange(newPos)
                }
            }}
        />
    ) : null
}

function LocateControl({ onLocate }) {
    return (
        <button className="map-locate-btn" onClick={onLocate} title="Use my current location">
            <Navigation size={20} />
        </button>
    )
}

function MapAddressPicker({ isOpen, onClose, onSaveAddress, initialPosition = null }) {
    const [position, setPosition] = useState(initialPosition || [DELIVERY_CENTER.lat, DELIVERY_CENTER.lng])
    const [addressData, setAddressData] = useState({
        fullAddress: '',
        houseFlat: '',
        landmark: '',
        addressType: 'home',
        customLabel: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isWithinZone, setIsWithinZone] = useState(true)
    const [distance, setDistance] = useState(0)
    const [showBottomSheet, setShowBottomSheet] = useState(false)
    const [geocodedAddress, setGeocodedAddress] = useState(null)

    useEffect(() => {
        if (position) {
            const zoneCheck = isWithinDeliveryZone(position[0], position[1])
            setIsWithinZone(zoneCheck.isDeliverable)
            setDistance(zoneCheck.distance)
        }
    }, [position])

    const handleLocationChange = useCallback(async (newPos) => {
        setIsLoading(true)
        try {
            const geocoded = await reverseGeocode(newPos[0], newPos[1])
            setGeocodedAddress(geocoded)
            setAddressData(prev => ({
                ...prev,
                fullAddress: geocoded?.fullAddress || `${newPos[0].toFixed(6)}, ${newPos[1].toFixed(6)}`
            }))
        } catch (error) {
            setAddressData(prev => ({
                ...prev,
                fullAddress: `${newPos[0].toFixed(6)}, ${newPos[1].toFixed(6)}`
            }))
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            setIsLoading(true)
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = [pos.coords.latitude, pos.coords.longitude]
                    setPosition(newPos)
                    handleLocationChange(newPos)
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    setIsLoading(false)
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }

    useEffect(() => {
        if (isOpen && !initialPosition) {
            handleLocateMe()
        } else if (isOpen && initialPosition) {
            handleLocationChange(initialPosition)
        }
    }, [isOpen])

    const handleSaveAddress = () => {
        const parts = []
        if (addressData.houseFlat) parts.push(addressData.houseFlat)
        if (addressData.landmark) parts.push(`Near ${addressData.landmark}`)
        if (geocodedAddress?.area || geocodedAddress?.shortName) {
            parts.push(geocodedAddress.area || geocodedAddress.shortName)
        }

        const savedAddress = {
            id: Date.now().toString(),
            coordinates: { lat: position[0], lng: position[1] },
            fullAddress: addressData.fullAddress,
            houseFlat: addressData.houseFlat,
            landmark: addressData.landmark,
            addressType: addressData.addressType,
            label: addressData.addressType === 'other' ? addressData.customLabel : ADDRESS_TYPES.find(t => t.id === addressData.addressType)?.label,
            displayAddress: parts.length > 0 ? parts.join(', ') : addressData.fullAddress,
            isWithinDeliveryZone: isWithinZone,
            distance: distance
        }
        
        onSaveAddress(savedAddress)
        onClose()
    }

    const handleInputChange = (field, value) => {
        setAddressData(prev => ({ ...prev, [field]: value }))
    }

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setShowBottomSheet(false)
            setAddressData({
                fullAddress: '',
                houseFlat: '',
                landmark: '',
                addressType: 'home',
                customLabel: ''
            })
            setGeocodedAddress(null)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="map-picker-overlay">
            <div className="map-picker-container">
                <div className="map-picker-header">
                    <button className="map-close-btn" onClick={onClose}><X size={24} /></button>
                    <h2>Set Delivery Location</h2>
                    <div className="header-spacer"></div>
                </div>

                <div className="map-wrapper">
                    <MapContainer center={position} zoom={16} className="leaflet-map" zoomControl={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} onLocationChange={handleLocationChange} />
                    </MapContainer>
                    <LocateControl onLocate={handleLocateMe} />
                    {isLoading && <div className="map-loading-indicator"><Loader size={24} className="spin" /></div>}
                </div>

                <div className="address-preview-card">
                    <div className={`zone-status ${isWithinZone ? 'in-zone' : 'out-zone'}`}>
                        <MapPin size={16} />
                        <span>{isWithinZone ? `We deliver here! (${distance} km away)` : `Outside delivery zone (${distance} km away)`}</span>
                    </div>
                    <div className="preview-address">
                        {isLoading ? (
                            <div className="address-loading"><Loader size={16} className="spin" /><span>Fetching address...</span></div>
                        ) : (
                            <>
                                <p className="address-main">{geocodedAddress?.shortName || 'Selected Location'}</p>
                                <p className="address-sub">{addressData.fullAddress?.substring(0, 80)}{addressData.fullAddress?.length > 80 ? '...' : ''}</p>
                            </>
                        )}
                    </div>
                    <button className={`btn btn-primary btn-confirm-location ${!isWithinZone ? 'btn-warning' : ''}`} onClick={() => setShowBottomSheet(true)} disabled={isLoading}>
                        {isWithinZone ? 'Confirm Location' : 'Continue Anyway'}
                    </button>
                </div>

                {showBottomSheet && (
                    <div className="bottom-sheet-overlay" onClick={() => setShowBottomSheet(false)}>
                        <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                            <div className="bottom-sheet-handle"></div>
                            <h3 className="bottom-sheet-title">Complete Address Details</h3>

                            <div className="selected-location-summary">
                                <MapPin size={18} />
                                <div>
                                    <p className="location-main">{geocodedAddress?.shortName || 'Selected Location'}</p>
                                    <p className="location-sub">{addressData.fullAddress?.substring(0, 60)}...</p>
                                </div>
                                <button className="change-btn" onClick={() => setShowBottomSheet(false)}>Change</button>
                            </div>

                            <div className="address-form">
                                <div className="form-group">
                                    <label className="form-label">House / Flat / Floor No. *</label>
                                    <input type="text" className="form-input" placeholder="e.g., Flat 302, Tower B" value={addressData.houseFlat} onChange={(e) => handleInputChange('houseFlat', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nearby Landmark (Optional)</label>
                                    <input type="text" className="form-input" placeholder="e.g., Near City Mall" value={addressData.landmark} onChange={(e) => handleInputChange('landmark', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Save As</label>
                                    <div className="address-type-grid">
                                        {ADDRESS_TYPES.map(type => {
                                            const Icon = type.icon
                                            return (
                                                <button key={type.id} type="button" className={`address-type-btn ${addressData.addressType === type.id ? 'selected' : ''}`} onClick={() => handleInputChange('addressType', type.id)}>
                                                    <Icon size={18} /><span>{type.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                {addressData.addressType === 'other' && (
                                    <div className="form-group">
                                        <label className="form-label">Custom Label *</label>
                                        <input type="text" className="form-input" placeholder="e.g., Gym, Parent's House" value={addressData.customLabel} onChange={(e) => handleInputChange('customLabel', e.target.value)} />
                                    </div>
                                )}
                            </div>

                            <button className="btn btn-primary btn-save-address" onClick={handleSaveAddress} disabled={!addressData.houseFlat || (addressData.addressType === 'other' && !addressData.customLabel)}>
                                <Check size={18} /> Save Address
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MapAddressPicker
