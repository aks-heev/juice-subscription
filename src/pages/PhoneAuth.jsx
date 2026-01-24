import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import '../styles/PhoneAuth.css'

function PhoneAuth() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signInWithPhone } = useAuth()
    const navigate = useNavigate()

    const formatPhoneNumber = (value) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '')
        
        // Limit to 10 digits
        if (digits.length > 10) return phone
        
        // Format as user types
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    }

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value)
        setPhone(formatted)
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Remove spaces and validate
        const cleanPhone = phone.replace(/\s/g, '')
        
        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number')
            return
        }

        if (!cleanPhone.match(/^[6-9]\d{9}$/)) {
            setError('Please enter a valid Indian mobile number')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Add +91 country code
            const phoneWithCode = `+91${cleanPhone}`
            await signInWithPhone(phoneWithCode)
            
            // Navigate to OTP verification with phone number
            navigate('/verify-otp', { state: { phone: phoneWithCode } })
        } catch (err) {
            console.error('Error sending OTP:', err)
            setError(err.message || 'Failed to send OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSpinner message="Sending OTP..." />
    }

    return (
        <div className="phone-auth-container">
            <div className="phone-auth-card">
                <div className="phone-auth-header">
                    <div className="juice-logo">🍹</div>
                    <h1>Welcome to Juice</h1>
                    <p>Enter your mobile number to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="phone-auth-form">
                    <div className="form-group">
                        <label htmlFor="phone">Mobile Number</label>
                        <div className="phone-input-wrapper">
                            <span className="country-code">+91</span>
                            <input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="999 999 9999"
                                className="phone-input"
                                autoComplete="tel"
                                autoFocus
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg">
                        Send OTP
                    </button>

                    <div className="phone-auth-footer">
                        <p className="terms-text">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </form>
            </div>

            <div className="auth-benefits">
                <div className="benefit-item">
                    <span className="benefit-icon">🚀</span>
                    <div>
                        <h3>Quick & Easy</h3>
                        <p>Sign in with just your phone number</p>
                    </div>
                </div>
                <div className="benefit-item">
                    <span className="benefit-icon">🔒</span>
                    <div>
                        <h3>Secure</h3>
                        <p>OTP-based authentication for your safety</p>
                    </div>
                </div>
                <div className="benefit-item">
                    <span className="benefit-icon">🎯</span>
                    <div>
                        <h3>Personalized</h3>
                        <p>Get recommendations based on your preferences</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhoneAuth
