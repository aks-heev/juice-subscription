import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import { validateEmail, validatePassword, validateConfirmPassword, validateName } from '../utils/validation'
import LoadingSpinner from '../components/common/LoadingSpinner'
import '../styles/Auth.css'

function Register() {
    const navigate = useNavigate()
    const { signUp } = useAuth()
    const { success, error: showError } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        const nameError = validateName(formData.name)
        if (nameError) newErrors.name = nameError

        const emailError = validateEmail(formData.email)
        if (emailError) newErrors.email = emailError

        const passwordError = validatePassword(formData.password)
        if (passwordError) newErrors.password = passwordError

        const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword)
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        const { error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            role: 'customer'
        })
        setLoading(false)

        if (error) {
            showError(error)
        } else {
            success('Account created successfully! Please check your email to verify your account.')
            navigate('/login')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card card">
                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join Fresh Squeeze today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                <User size={16} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                disabled={loading}
                            />
                            {errors.name && (
                                <span className="form-error">{errors.name}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <span className="form-error">{errors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <Lock size={16} />
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 6 characters"
                                disabled={loading}
                            />
                            {errors.password && (
                                <span className="form-error">{errors.password}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                <Lock size={16} />
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <span className="form-error">{errors.confirmPassword}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
