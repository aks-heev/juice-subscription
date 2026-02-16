import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, Mail, Edit2, Save, X, LogOut, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import { supabase } from '../lib/supabase'
import { validateName, validatePhone, validateAddress } from '../utils/validation'
import MapAddressPicker from '../components/features/MapAddressPicker'
import '../styles/Profile.css'

function Profile() {
    const { user, updateProfile, signOut } = useAuth()
    const { success, error: showError } = useToast()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [savedAddresses, setSavedAddresses] = useState([])
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: ''
    })
    const [errors, setErrors] = useState({})
    const [showMapPicker, setShowMapPicker] = useState(false)
    const [editingAddressIndex, setEditingAddressIndex] = useState(null)

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.user_metadata?.name || '',
                phone: user.phone || user.user_metadata?.phone || '',
                email: user.email || ''
            })
            loadAddresses()
        }
    }, [user])

    const loadAddresses = async () => {
        try {
            const allAddresses = []
            const seenAddresses = new Set()

            // Load from localStorage first (map-saved addresses)
            const localAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
            localAddresses.forEach((addr, idx) => {
                if (!seenAddresses.has(addr.address)) {
                    seenAddresses.add(addr.address)
                    allAddresses.push({
                        id: addr.id || `local-${idx}`,
                        name: addr.name || user.user_metadata?.name || '',
                        phone: addr.phone || user.phone || '',
                        address: addr.address,
                        label: addr.label,
                        coordinates: addr.coordinates,
                        isLocal: true
                    })
                }
            })

            // First, add the profile address from user_metadata (signup address)
            if (user.user_metadata?.address && !seenAddresses.has(user.user_metadata.address)) {
                allAddresses.push({
                    id: 'profile',
                    name: user.user_metadata?.name || '',
                    phone: user.phone || user.user_metadata?.phone || '',
                    address: user.user_metadata.address,
                    isProfile: true
                })
                seenAddresses.add(user.user_metadata.address)
            }

            // Then fetch addresses from past subscriptions
            const { data, error } = await supabase
                .from('subscriptions')
                .select('id, customer_name, customer_phone, customer_address')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!error && data && data.length > 0) {
                data.forEach(sub => {
                    if (!seenAddresses.has(sub.customer_address)) {
                        seenAddresses.add(sub.customer_address)
                        allAddresses.push({
                            id: sub.id,
                            name: sub.customer_name,
                            phone: sub.customer_phone,
                            address: sub.customer_address
                        })
                    }
                })
            }

            setSavedAddresses(allAddresses)
        } catch (err) {
            console.error('Error loading addresses:', err.message)
        }
    }

    const handleAddAddress = () => {
        setEditingAddressIndex(null)
        setShowMapPicker(true)
    }

    const handleEditAddress = (index) => {
        setEditingAddressIndex(index)
        setShowMapPicker(true)
    }

    const handleDeleteAddress = (index) => {
        const addr = savedAddresses[index]
        if (addr.isLocal) {
            const localAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
            const updated = localAddresses.filter(a => a.id !== addr.id && a.address !== addr.address)
            localStorage.setItem('savedAddresses', JSON.stringify(updated))
        }
        setSavedAddresses(prev => prev.filter((_, i) => i !== index))
        success('Address deleted')
    }

    const handleMapAddressSave = (mapAddress) => {
        const newAddress = {
            id: mapAddress.id,
            name: user.user_metadata?.name || '',
            phone: user.phone || '',
            address: mapAddress.displayAddress,
            label: mapAddress.label,
            coordinates: mapAddress.coordinates,
            isLocal: true
        }

        // Save to localStorage
        const localAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
        
        if (editingAddressIndex !== null) {
            // Update existing
            const oldAddr = savedAddresses[editingAddressIndex]
            if (oldAddr.isLocal) {
                const updatedLocal = localAddresses.map(a => 
                    (a.id === oldAddr.id || a.address === oldAddr.address) ? newAddress : a
                )
                localStorage.setItem('savedAddresses', JSON.stringify(updatedLocal))
            } else {
                localAddresses.unshift(newAddress)
                localStorage.setItem('savedAddresses', JSON.stringify(localAddresses))
            }
            setSavedAddresses(prev => prev.map((a, i) => i === editingAddressIndex ? newAddress : a))
        } else {
            // Add new
            localAddresses.unshift(newAddress)
            localStorage.setItem('savedAddresses', JSON.stringify(localAddresses))
            setSavedAddresses(prev => [newAddress, ...prev])
        }
        
        success(editingAddressIndex !== null ? 'Address updated' : 'Address added')
        setEditingAddressIndex(null)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        const nameError = validateName(profileData.name)
        if (nameError) newErrors.name = nameError

        // Only validate phone if user is not phone-authenticated
        if (!user.phone && profileData.phone) {
            const phoneError = validatePhone(profileData.phone)
            if (phoneError) newErrors.phone = phoneError
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            showError('Please fix the errors')
            return
        }

        try {
            await updateProfile({
                name: profileData.name,
                phone: profileData.phone
            })
            success('Profile updated successfully')
            setIsEditing(false)
        } catch (err) {
            showError(err.message || 'Failed to update profile')
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            success('Logged out successfully')
            navigate('/phone-auth')
        } catch (err) {
            showError('Failed to logout')
        }
    }

    return (
        <div className="page">
            <div className="container py-8 pb-24">
                <div className="page-header">
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your account details</p>
                </div>

                {/* Profile Information */}
                <section className="profile-section">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="section-title">Personal Information</h2>
                            {!isEditing ? (
                                <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} /> Edit
                                </button>
                            ) : (
                                <div className="button-group">
                                    <button className="btn btn-ghost btn-sm" onClick={() => {
                                        setIsEditing(false)
                                        setProfileData({
                                            name: user.user_metadata?.name || '',
                                            phone: user.user_metadata?.phone || '',
                                            email: user.email || ''
                                        })
                                        setErrors({})
                                    }}>
                                        <X size={16} /> Cancel
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={handleSave}>
                                        <Save size={16} /> Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="profile-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                                    value={profileData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                {errors.name && <span className="form-error">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Phone size={16} /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                                    value={profileData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing || !!user.phone}
                                />
                                {user.phone && <span className="text-sm text-muted">Phone number cannot be changed (used for login)</span>}
                                {errors.phone && <span className="form-error">{errors.phone}</span>}
                            </div>

                            {profileData.email && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail size={16} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={profileData.email}
                                        disabled
                                    />
                                    <span className="text-sm text-muted">Email cannot be changed</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Saved Addresses */}
                <section className="profile-section">
                    <div className="section-header">
                        <h2 className="section-title">Saved Addresses</h2>
                        <button className="btn btn-primary btn-sm" onClick={handleAddAddress}>
                            <Plus size={16} /> Add Address
                        </button>
                    </div>
                    {savedAddresses.length === 0 ? (
                        <div className="card">
                            <div className="empty-state-small">
                                <MapPin size={32} />
                                <p>No saved addresses yet</p>
                                <button className="btn btn-primary mt-4" onClick={handleAddAddress}>
                                    <Plus size={16} /> Add Your First Address
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="addresses-list">
                            {savedAddresses.map((addr, index) => (
                                <div key={addr.id || index} className="card address-item">
                                    <MapPin size={20} className="address-icon" />
                                    <div className="address-content">
                                        <div className="address-top-row">
                                            {addr.label && (
                                                <span className="address-label-badge">{addr.label}</span>
                                            )}
                                            <p className="address-name"><strong>{addr.name}</strong></p>
                                        </div>
                                        <p className="address-phone">{addr.phone}</p>
                                        <p className="address-text">{addr.address}</p>
                                    </div>
                                    <div className="address-actions">
                                        <button 
                                            className="btn btn-icon btn-ghost"
                                            onClick={() => handleEditAddress(index)}
                                            title="Edit address"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {!addr.isProfile && (
                                            <button 
                                                className="btn btn-icon btn-ghost btn-danger-ghost"
                                                onClick={() => handleDeleteAddress(index)}
                                                title="Delete address"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Map Address Picker Modal */}
                <MapAddressPicker
                    isOpen={showMapPicker}
                    onClose={() => {
                        setShowMapPicker(false)
                        setEditingAddressIndex(null)
                    }}
                    onSaveAddress={handleMapAddressSave}
                    initialPosition={editingAddressIndex !== null && savedAddresses[editingAddressIndex]?.coordinates 
                        ? [savedAddresses[editingAddressIndex].coordinates.lat, savedAddresses[editingAddressIndex].coordinates.lng]
                        : null
                    }
                />

                {/* Logout Section */}
                <section className="profile-section">
                    <div className="card logout-card">
                        <div className="logout-content">
                            <div>
                                <h3 className="logout-title">Sign Out</h3>
                                <p className="logout-subtitle">You can sign back in anytime with your phone number</p>
                            </div>
                            <button className="btn btn-danger" onClick={handleLogout}>
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Profile
