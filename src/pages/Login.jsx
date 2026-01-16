import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import { validateEmail, validatePassword } from '../utils/validation'
import LoadingSpinner from '../components/common/LoadingSpinner'
import '../styles/Auth.css'

function Login() {
    const navigate = useNavigate()
    const { signIn } = useAuth()
    const { success, error: showError } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        
        const emailError = validateEmail(formData.email)
        if (emailError) newErrors.email = emailError

        const passwordError = validatePassword(formData.password)
        if (passwordError) newErrors.password = passwordError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        const { error } = await signIn(formData.email, formData.password)
        setLoading(false)

        if (error) {
            showError(error)
        } else {
            success('Welcome back!')
            navigate('/dashboard')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card card">
                    <div className="auth-header">
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
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
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                            {errors.password && (
                                <span className="form-error">{errors.password}</span>
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
                                    <LogIn size={20} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
