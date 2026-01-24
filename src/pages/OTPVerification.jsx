import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import '../styles/PhoneAuth.css'

function OTPVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendTimer, setResendTimer] = useState(30)
    const { verifyOTP, signInWithPhone } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const inputRefs = useRef([])

    const phone = location.state?.phone

    useEffect(() => {
        if (!phone) {
            navigate('/phone-auth')
            return
        }

        // Start resend timer
        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(timer)
    }, [phone, navigate])

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setError('')

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all digits entered
        if (index === 5 && value) {
            const otpCode = [...newOtp.slice(0, 5), value].join('')
            handleVerify(otpCode)
        }
    }

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        
        if (!/^\d+$/.test(pastedData)) return

        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
        setOtp(newOtp)

        // Focus last filled input or submit
        const lastIndex = pastedData.length - 1
        if (lastIndex < 5) {
            inputRefs.current[lastIndex + 1]?.focus()
        } else {
            handleVerify(pastedData)
        }
    }

    const handleVerify = async (otpCode = otp.join('')) => {
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP')
            return
        }

        setLoading(true)
        setError('')

        try {
            const needsProfile = await verifyOTP(phone, otpCode)
            
            // If user needs to complete profile (new user)
            if (needsProfile) {
                navigate('/complete-profile')
            } else {
                // Returning user - go to home
                navigate('/')
            }
        } catch (err) {
            console.error('Error verifying OTP:', err)
            setError(err.message || 'Invalid OTP. Please try again.')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (resendTimer > 0) return

        setLoading(true)
        setError('')
        
        try {
            await signInWithPhone(phone)
            setResendTimer(30)
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (err) {
            setError('Failed to resend OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleEditPhone = () => {
        navigate('/phone-auth')
    }

    if (loading) {
        return <LoadingSpinner message="Verifying OTP..." />
    }

    return (
        <div className="phone-auth-container">
            <div className="phone-auth-card">
                <div className="phone-auth-header">
                    <div className="juice-logo">📱</div>
                    <h1>Enter OTP</h1>
                    <p>
                        We've sent a 6-digit code to<br />
                        <strong>{phone}</strong>
                        <button 
                            type="button" 
                            className="edit-phone-btn"
                            onClick={handleEditPhone}
                        >
                            Edit
                        </button>
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="otp-form">
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="otp-input"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn btn-primary btn-lg">
                        Verify OTP
                    </button>

                    <div className="resend-section">
                        {resendTimer > 0 ? (
                            <p className="resend-timer">
                                Resend OTP in <strong>{resendTimer}s</strong>
                            </p>
                        ) : (
                            <button
                                type="button"
                                className="resend-btn"
                                onClick={handleResend}
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="auth-info">
                <p className="info-text">
                    💡 <strong>Tip:</strong> Check your SMS inbox. The OTP is valid for 10 minutes.
                </p>
            </div>
        </div>
    )
}

export default OTPVerification
