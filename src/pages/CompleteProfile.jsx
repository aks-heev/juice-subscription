import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { validateName, validateAddress } from '../utils/validation'
import '../styles/PhoneAuth.css'

function CompleteProfile() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const { updateUserProfile, user } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        const nameError = validateName(formData.name)
        if (nameError) newErrors.name = nameError

        // Email is optional
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        const addressError = validateAddress(formData.address)
        if (addressError) newErrors.address = addressError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            await updateUserProfile({
                name: formData.name,
                email: formData.email || undefined,
                address: formData.address
            })
            navigate('/')
        } catch (err) {
            console.error('Error updating profile:', err)
            setErrors({ submit: err.message || 'Failed to complete setup. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSpinner message="Setting up your profile..." />
    }

    return (
        <div className="phone-auth-container">
            <div className="phone-auth-card complete-profile-card">
                <div className="phone-auth-header">
                    <div className="juice-logo">👋</div>
                    <h1>Complete Your Profile</h1>
                    <p>Just a few details to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="phone-auth-form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label-with-icon">
                            <User size={18} />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            autoComplete="name"
                            autoFocus
                        />
                        {errors.name && <p className="error-message">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label-with-icon">
                            <Mail size={18} />
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            autoComplete="email"
                        />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                        <p className="field-hint">We'll use this for order updates</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address" className="form-label-with-icon">
                            <MapPin size={18} />
                            Delivery Address *
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your complete address with landmark"
                            className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
                            rows="3"
                            autoComplete="street-address"
                        />
                        {errors.address && <p className="error-message">{errors.address}</p>}
                    </div>

                    {errors.submit && (
                        <div className="error-banner">
                            {errors.submit}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Setting up...' : 'Complete Setup'}
                    </button>

                    <div className="profile-benefits">
                        <p className="benefits-title">What's next?</p>
                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <span>🍹</span>
                                <span>Browse juices</span>
                            </div>
                            <div className="benefit-item">
                                <span>📅</span>
                                <span>Subscribe</span>
                            </div>
                            <div className="benefit-item">
                                <span>🚚</span>
                                <span>Get deliveries</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CompleteProfile
