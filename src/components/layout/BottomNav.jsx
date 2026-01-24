import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Package, User, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import '../../styles/BottomNav.css'

function BottomNav() {
    const location = useLocation()
    const { isAdmin } = useAuth()

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/dashboard', icon: Package, label: 'Subscriptions' },
        { path: '/profile', icon: User, label: 'Profile' },
    ]

    if (isAdmin()) {
        navItems.push({ path: '/admin', icon: Shield, label: 'Admin' })
    }

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={24} />
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}

export default BottomNav
