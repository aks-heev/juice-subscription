import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Citrus, LogOut, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from './common/Toast'
import '../styles/Navbar.css'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { theme, toggleTheme } = useApp()
    const { user, signOut, isAdmin } = useAuth()
    const { success } = useToast()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        success('Logged out successfully')
        navigate('/')
    }

    const navLinks = user
        ? [
              { path: '/', label: 'Home' },
              { path: '/subscribe', label: 'Subscribe' },
              { path: '/dashboard', label: 'My Orders' },
              ...(isAdmin() ? [{ path: '/admin', label: 'Admin' }] : [])
          ]
        : [
              { path: '/', label: 'Home' },
              { path: '/login', label: 'Login' },
              { path: '/register', label: 'Sign Up' }
          ]

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <Citrus size={32} className="brand-icon" />
                        <span className="brand-text">Fresh Squeeze</span>
                    </Link>

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
                            <div className="user-info">
                                <User size={18} />
                                <span className="user-name">
                                    {user.user_metadata?.name || user.email}
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
        </nav>
    )
}

Navbar.propTypes = {}

export default Navbar
