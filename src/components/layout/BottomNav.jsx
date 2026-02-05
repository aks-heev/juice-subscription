import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Package, User, Shield, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import '../../styles/BottomNav.css'

function BottomNav() {
    const location = useLocation()
    const { isAdmin } = useAuth()
    const { totalItems } = useCart()

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
        { path: '/dashboard', icon: Package, label: 'Orders' },
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
                        <div className="nav-icon-wrapper">
                            <Icon size={24} />
                            {item.badge > 0 && (
                                <span className="nav-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                            )}
                        </div>
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}

export default BottomNav
