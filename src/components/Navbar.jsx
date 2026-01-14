import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon, Citrus } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { theme, toggleTheme, user } = useApp()
    const location = useLocation()

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/subscribe', label: 'Subscribe' },
        { path: '/dashboard', label: 'My Orders' },
        { path: '/admin', label: 'Admin' }
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
                        <button
                            className="btn btn-icon"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
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

            <style>{`
                .navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: var(--bg-glass);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: var(--z-sticky);
                    padding: var(--space-4) 0;
                }

                .navbar-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .brand-icon {
                    color: var(--color-primary);
                }

                .brand-text {
                    font-family: var(--font-display);
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .navbar-menu {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                }

                .nav-link {
                    padding: var(--space-2) var(--space-4);
                    font-weight: var(--font-medium);
                    color: var(--color-gray-600);
                    border-radius: var(--radius-lg);
                    transition: all var(--transition-fast);
                }

                .nav-link:hover {
                    color: var(--color-primary);
                    background: rgba(255, 107, 53, 0.1);
                }

                .nav-link.active {
                    color: var(--color-primary);
                    background: rgba(255, 107, 53, 0.15);
                }

                .navbar-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                @media (max-width: 768px) {
                    .navbar-menu {
                        position: fixed;
                        top: 72px;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        flex-direction: column;
                        background: var(--bg-primary);
                        padding: var(--space-4);
                        transform: translateX(-100%);
                        transition: transform var(--transition-base);
                    }

                    .navbar-menu.open {
                        transform: translateX(0);
                    }

                    .nav-link {
                        width: 100%;
                        padding: var(--space-4);
                        font-size: var(--text-lg);
                    }
                }
            `}</style>
        </nav>
    )
}

export default Navbar
