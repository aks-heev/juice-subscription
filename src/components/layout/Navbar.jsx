import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Citrus, LogOut, User, MapPin, ChevronDown, RefreshCw, ShoppingCart, Plus, Home, Briefcase, Navigation } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useLocation as useLocationContext } from '../../context/LocationContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../common/Toast'
import MapAddressPicker from '../features/MapAddressPicker'
import '../../styles/Navbar.css'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [showLocationDropdown, setShowLocationDropdown] = useState(false)
    const [showMapPicker, setShowMapPicker] = useState(false)
    const [savedAddresses, setSavedAddresses] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('savedAddresses') || '[]')
        } catch {
            return []
        }
    })
    // Track selected saved address
    const [selectedAddress, setSelectedAddress] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('selectedDeliveryAddress') || 'null')
        } catch {
            return null
        }
    })
    const { theme, toggleTheme } = useApp()
    const { user, signOut, isAdmin } = useAuth()
    const { totalItems } = useCart()
    const { 
        displayName, 
        fullDisplayName,
        loading: locationLoading, 
        isDeliverable,
        distance,
        deliveryRadius,
        requestLocation,
        refreshLocation,
        hasLocation,
        permissionState,
        error: locationError
    } = useLocationContext()
    const { success } = useToast()
    const location = useLocation()
    const navigate = useNavigate()

    // Close map picker when route changes
    useEffect(() => {
        setShowMapPicker(false)
        setShowLocationDropdown(false)
    }, [location.pathname])

    // Compute the displayed location name (selected saved address takes priority)
    const currentDisplayName = selectedAddress ? selectedAddress.label : displayName
    const currentFullDisplayName = selectedAddress ? selectedAddress.address : fullDisplayName

    const handleLogout = async () => {
        await signOut()
        success('Logged out successfully')
        navigate('/phone-auth')
    }

    const handleLocationClick = () => {
        if (!hasLocation && !savedAddresses.length && permissionState !== 'denied') {
            requestLocation()
        } else {
            setShowLocationDropdown(!showLocationDropdown)
        }
    }

    const handleAddAddress = () => {
        setShowLocationDropdown(false)
        setShowMapPicker(true)
    }

    const handleMapAddressSave = (mapAddress) => {
        const newAddress = {
            id: mapAddress.id,
            name: user?.user_metadata?.name || '',
            phone: user?.phone || '',
            address: mapAddress.displayAddress,
            label: mapAddress.label,
            coordinates: mapAddress.coordinates,
            isLocal: true
        }

        const localAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
        localAddresses.unshift(newAddress)
        localStorage.setItem('savedAddresses', JSON.stringify(localAddresses))
        setSavedAddresses(localAddresses)
        
        // Auto-select the newly saved address
        setSelectedAddress(newAddress)
        localStorage.setItem('selectedDeliveryAddress', JSON.stringify(newAddress))
        
        setShowMapPicker(false)
        success('Address saved!')
    }

    const handleSelectSavedAddress = (addr) => {
        setSelectedAddress(addr)
        localStorage.setItem('selectedDeliveryAddress', JSON.stringify(addr))
        setShowLocationDropdown(false)
        success(`Delivering to ${addr.label || 'saved address'}`)
    }

    const handleSelectCurrentLocation = () => {
        // Clear selected saved address to show GPS location
        setSelectedAddress(null)
        localStorage.removeItem('selectedDeliveryAddress')
        setShowLocationDropdown(false)
    }

    const getAddressIcon = (label) => {
        switch(label?.toLowerCase()) {
            case 'home': return <Home size={14} />
            case 'work': return <Briefcase size={14} />
            default: return <MapPin size={14} />
        }
    }

    const navLinks = user
        ? [
              { path: '/', label: 'Home' },
              { path: '/subscribe', label: 'Subscribe' },
              { path: '/dashboard', label: 'My Orders' },
              { path: '/profile', label: 'Profile' },
              ...(isAdmin() ? [{ path: '/admin', label: 'Admin' }] : [])
          ]
        : [
              { path: '/', label: 'Home' },
              { path: '/phone-auth', label: 'Login' }
          ]

    const isActive = (path) => location.pathname === path

    return (
        <>
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <div className="navbar-left">
                        <Link to="/" className="navbar-brand">
                            <Citrus size={32} className="brand-icon" />
                            <span className="brand-text">Fresh Squeeze</span>
                        </Link>

                        {/* Location Display */}
                        <div className="location-wrapper">
                            <button 
                                className="location-btn"
                                onClick={handleLocationClick}
                                disabled={locationLoading}
                            >
                                <MapPin size={18} className={`location-icon ${isDeliverable === false && !selectedAddress ? 'out-of-zone' : ''}`} />
                                <div className="location-info">
                                    <span className="location-label">Deliver to</span>
                                    <span className="location-name">
                                        {locationLoading ? 'Detecting...' : (currentDisplayName || 'Select location')}
                                        {(hasLocation || savedAddresses.length > 0) && <ChevronDown size={14} />}
                                    </span>
                                </div>
                            </button>

                            {/* Location Dropdown */}
                            {showLocationDropdown && (hasLocation || savedAddresses.length > 0) && (
                                <div className="location-dropdown">
                                    {/* Current Location Section */}
                                    {hasLocation && (
                                        <>
                                            <div className="location-dropdown-header">
                                                <Navigation size={16} />
                                                <span>Current Location</span>
                                            </div>
                                            
                                            <button 
                                                className={`saved-address-item current-location ${!selectedAddress ? 'active' : ''}`}
                                                onClick={handleSelectCurrentLocation}
                                            >
                                                <MapPin size={14} />
                                                <div className="saved-address-info">
                                                    <span className="saved-address-label">{displayName}</span>
                                                    <span className="saved-address-text">{fullDisplayName?.substring(0, 40)}...</span>
                                                </div>
                                            </button>
                                            
                                            <div className={`delivery-status ${isDeliverable ? 'deliverable' : 'not-deliverable'}`}>
                                                {isDeliverable ? (
                                                    <>
                                                        <span className="status-dot"></span>
                                                        We deliver here! ({distance} km away)
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="status-dot"></span>
                                                        Outside delivery zone ({distance} km away)
                                                        <p className="delivery-note">We deliver within {deliveryRadius} km</p>
                                                    </>
                                                )}
                                            </div>

                                            <button 
                                                className="refresh-location-btn"
                                                onClick={() => {
                                                    refreshLocation()
                                                    setSelectedAddress(null)
                                                    localStorage.removeItem('selectedDeliveryAddress')
                                                    setShowLocationDropdown(false)
                                                }}
                                            >
                                                <RefreshCw size={14} />
                                                Refresh location
                                            </button>
                                        </>
                                    )}

                                    {/* Detect Location if not available */}
                                    {!hasLocation && permissionState !== 'denied' && (
                                        <button 
                                            className="refresh-location-btn mb-3"
                                            onClick={() => {
                                                requestLocation()
                                                setShowLocationDropdown(false)
                                            }}
                                        >
                                            <Navigation size={14} />
                                            Detect my location
                                        </button>
                                    )}

                                    {/* Saved Addresses */}
                                    {savedAddresses.length > 0 && (
                                        <div className="saved-addresses-dropdown">
                                            <p className="dropdown-label">Saved Addresses</p>
                                            {savedAddresses.slice(0, 3).map((addr) => (
                                                <button 
                                                    key={addr.id}
                                                    className={`saved-address-item ${selectedAddress?.id === addr.id ? 'active' : ''}`}
                                                    onClick={() => handleSelectSavedAddress(addr)}
                                                >
                                                    {getAddressIcon(addr.label)}
                                                    <div className="saved-address-info">
                                                        <span className="saved-address-label">{addr.label || 'Address'}</span>
                                                        <span className="saved-address-text">{addr.address?.substring(0, 40)}...</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Address Button */}
                                    <button 
                                        className="add-address-btn"
                                        onClick={handleAddAddress}
                                    >
                                        <Plus size={14} />
                                        Add new address
                                    </button>
                                </div>
                            )}

                            {/* Permission denied message */}
                            {permissionState === 'denied' && !hasLocation && (
                                <div className="location-error">
                                    <span>Location access denied</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => {
                                    setIsOpen(false)
                                    setShowMapPicker(false)
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="navbar-actions">
                        {user && (
                            <Link to="/cart" className="cart-btn">
                                <ShoppingCart size={22} />
                                {totalItems > 0 && (
                                    <span className="cart-badge">{totalItems > 9 ? '9+' : totalItems}</span>
                                )}
                            </Link>
                        )}
                        {user && (
                            <div className="user-info">
                                <User size={18} />
                                <span className="user-name">
                                    {user.user_metadata?.name || user.phone || user.email}
                                </span>
                            </div>
                        )}
                        <button
                            className="btn btn-icon"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {user && (
                            <button
                                className="btn btn-icon"
                                onClick={handleLogout}
                                aria-label="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                        <button
                            className="btn btn-icon hide-desktop"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showLocationDropdown && (
                <div 
                    className="location-overlay" 
                    onClick={() => setShowLocationDropdown(false)}
                />
            )}
        </nav>

        {/* Map Address Picker Modal - rendered outside nav to escape stacking context */}
        <MapAddressPicker
            isOpen={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            onSaveAddress={handleMapAddressSave}
        />
    </>
    )
}

Navbar.propTypes = {}

export default Navbar
