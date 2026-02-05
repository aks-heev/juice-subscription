import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Citrus, LogOut, User, MapPin, ChevronDown, RefreshCw, ShoppingCart } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useLocation as useLocationContext } from '../../context/LocationContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../common/Toast'
import '../../styles/Navbar.css'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [showLocationDropdown, setShowLocationDropdown] = useState(false)
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

    const handleLogout = async () => {
        await signOut()
        success('Logged out successfully')
        navigate('/phone-auth')
    }

    const handleLocationClick = () => {
        if (!hasLocation && permissionState !== 'denied') {
            requestLocation()
        } else {
            setShowLocationDropdown(!showLocationDropdown)
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
                                <MapPin size={18} className={`location-icon ${isDeliverable === false ? 'out-of-zone' : ''}`} />
                                <div className="location-info">
                                    <span className="location-label">Deliver to</span>
                                    <span className="location-name">
                                        {locationLoading ? 'Detecting...' : displayName}
                                        {hasLocation && <ChevronDown size={14} />}
                                    </span>
                                </div>
                            </button>

                            {/* Location Dropdown */}
                            {showLocationDropdown && hasLocation && (
                                <div className="location-dropdown">
                                    <div className="location-dropdown-header">
                                        <MapPin size={16} />
                                        <span>{fullDisplayName}</span>
                                    </div>
                                    
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
                                            setShowLocationDropdown(false)
                                        }}
                                    >
                                        <RefreshCw size={14} />
                                        Refresh location
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
                                onClick={() => setIsOpen(false)}
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
    )
}

Navbar.propTypes = {}

export default Navbar
