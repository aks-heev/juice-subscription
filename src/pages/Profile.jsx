import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, Mail, Edit2, Save, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import { supabase } from '../lib/supabase'
import { validateName, validatePhone, validateAddress } from '../utils/validation'

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

            // First, add the profile address from user_metadata (signup address)
            if (user.user_metadata?.address) {
                allAddresses.push({
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
                .select('customer_name, customer_phone, customer_address')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!error && data && data.length > 0) {
                data.forEach(sub => {
                    if (!seenAddresses.has(sub.customer_address)) {
                        seenAddresses.add(sub.customer_address)
                        allAddresses.push({
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
                                        setIsEditing(falphone || user.se)
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
                    <h2 className="section-title">Saved Addresses</h2>
                    {savedAddresses.length === 0 ? (
                        <div className="card">
                            <div className="empty-state-small">
                                <MapPin size={32} />
                                <p>No saved addresses yet</p>
                            </div>
                        </div>
                    ) : (
                        <div className="addresses-list">
                            {savedAddresses.map((addr, index) => (
                                <div key={index} className="card address-item">
                                    <MapPin size={20} className="address-icon" />
                                    <div className="address-content">
                                        <p className="address-name"><strong>{addr.name}</strong></p>
                                        <p className="address-phone">{addr.phone}</p>
                                        <p className="address-text">{addr.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

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

            <style>{`
                .profile-section {
                    margin-bottom: var(--space-8);
                }

                @media (min-width: 768px) {
                    .profile-section {
                        margin-bottom: var(--space-12);
                    }
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-8);
                }

                @media (min-width: 768px) {
                    .card-header {
                        margin-bottom: var(--space-10);
                    }
                }

                .button-group {
                    display: flex;
                    gap: var(--space-2);
                }

                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                @media (min-width: 768px) {
                    .profile-form {
                        gap: var(--space-8);
                    }
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-weight: var(--font-medium);
                    margin-bottom: var(--space-3);
                }

                .addresses-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-5);
                }

                @media (min-width: 768px) {
                    .addresses-list {
                        gap: var(--space-6);
                    }
                }

                .address-item {
                    display: flex;
                    gap: var(--space-4);
                    align-items: flex-start;
                    padding: var(--space-5);
                }

                @media (min-width: 768px) {
                    .address-item {
                        padding: var(--space-6);
                        gap: var(--space-5);
                    }
                }

                .address-icon {
                    flex-shrink: 0;
                    color: var(--color-primary);
                    margin-top: var(--space-1);
                }

                .address-content {
                    flex: 1;
                }

                .address-name {
                    margin-bottom: var(--space-2);
                    font-size: var(--text-base);
                }

                .address-phone {
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-2);
                }

                .address-text {
                    font-size: var(--text-sm);
                    color: var(--color-gray-700);
                    line-height: 1.6;
                }

                .empty-state-small {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-12);
                    color: var(--color-gray-500);
                    text-align: center;
                }

                @media (min-width: 768px) {
                    .empty-state-small {
                        padding: var(--space-16);
                    }
                }

                .empty-state-small svg {
                    margin-bottom: var(--space-4);
                }

                .card {
                    padding: var(--space-5);
                }

                @media (min-width: 768px) {
                    .card {
                        padding: var(--space-8);
                    }
                }

                .logout-card {
                    border: 1px solid var(--color-gray-200);
                }

                .logout-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: var(--space-4);
                }

                .logout-title {
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                    margin-bottom: var(--space-1);
                }

                .logout-subtitle {
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                }

                .btn-danger {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: var(--space-3) var(--space-4);
                    border-radius: var(--radius-lg);
                    font-weight: var(--font-medium);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    white-space: nowrap;
                }

                .btn-danger:hover {
                    background: #b91c1c;
                }

                @media (max-width: 767px) {
                    .logout-content {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .btn-danger {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    )
}

export default Profile
