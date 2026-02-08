import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { X, Plus, Minus, ShoppingCart, Calendar, Heart, Zap, Shield, Droplets, Leaf } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import '../../styles/JuiceDetailSheet.css'

const CATEGORY_THEMES = {
    detox:    '90, 60%, 40%',
    energy:   '18, 100%, 60%',
    immunity: '38, 100%, 58%',
    refresh:  '174, 62%, 47%',
    protein:  '268, 60%, 63%',
}

const HEALTH_BENEFITS = {
    detox: [
        { icon: Leaf, text: 'Flushes toxins from body' },
        { icon: Heart, text: 'Supports liver function' },
        { icon: Zap, text: 'Boosts metabolism' },
    ],
    energy: [
        { icon: Zap, text: 'Natural energy boost' },
        { icon: Heart, text: 'Improves blood circulation' },
        { icon: Shield, text: 'Rich in Vitamin C' },
    ],
    immunity: [
        { icon: Shield, text: 'Strengthens immune system' },
        { icon: Heart, text: 'High in antioxidants' },
        { icon: Leaf, text: 'Anti-inflammatory properties' },
    ],
    refresh: [
        { icon: Droplets, text: 'Excellent hydration' },
        { icon: Zap, text: 'Electrolyte replenishment' },
        { icon: Heart, text: 'Aids digestion' },
    ],
    protein: [
        { icon: Zap, text: 'Muscle recovery support' },
        { icon: Heart, text: 'Sustained energy release' },
        { icon: Shield, text: 'High in protein & fiber' },
    ],
}

function JuiceDetailSheet({ juice, isOpen, onClose }) {
    const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart()
    const quantity = juice ? getItemQuantity(juice.id) : 0
    const themeColor = juice ? (CATEGORY_THEMES[juice.category] || '18, 100%, 60%') : '18, 100%, 60%'
    const benefits = juice ? (HEALTH_BENEFITS[juice.category] || HEALTH_BENEFITS.energy) : []

    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEsc)
        }
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    if (!juice) return null

    const handleAddToCart = () => {
        addItem(juice)
    }

    const handleIncrement = () => {
        incrementItem(juice.id)
    }

    const handleDecrement = () => {
        decrementItem(juice.id)
    }

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`sheet-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div 
                className={`juice-detail-sheet ${isOpen ? 'open' : ''}`}
                style={{ '--theme-color': themeColor }}
            >
                {/* Drag handle */}
                <div className="sheet-handle" onClick={onClose}>
                    <span className="handle-bar"></span>
                </div>

                {/* Close button */}
                <button className="sheet-close" onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>

                {/* Hero section with emoji */}
                <div className={`sheet-hero ${juice.category}-bg`}>
                    <span className="sheet-emoji">{juice.image}</span>
                    <div 
                        className="sheet-hero-gradient"
                        style={{
                            background: `linear-gradient(to top, hsl(${themeColor} / 0.95), hsl(${themeColor} / 0.7) 50%, transparent 100%)`
                        }}
                    />
                    <div className="sheet-hero-content">
                        <span className="sheet-category">{juice.category}</span>
                        <h2 className="sheet-title">{juice.name}</h2>
                        <p className="sheet-meta">{juice.calories} cal · {juice.size}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="sheet-content">
                    {/* Description */}
                    <div className="sheet-section">
                        <h3 className="sheet-section-title">Ingredients</h3>
                        <p className="sheet-description">{juice.description}</p>
                    </div>

                    {/* Health Benefits */}
                    <div className="sheet-section">
                        <h3 className="sheet-section-title">Health Benefits</h3>
                        <div className="benefits-list">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="benefit-item" style={{ '--theme-color': themeColor }}>
                                    <span className="benefit-icon">
                                        <benefit.icon size={16} />
                                    </span>
                                    <span className="benefit-text">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sheet-actions">
                        <div className="sheet-price-row">
                            <span className="sheet-price">₹{juice.price}</span>
                            <span className="sheet-price-note">per bottle</span>
                        </div>

                        <div className="sheet-buttons">
                            {/* Subscribe button */}
                            <Link 
                                to="/subscribe" 
                                className="sheet-subscribe-btn"
                                onClick={onClose}
                            >
                                <Calendar size={18} />
                                <span>Subscribe</span>
                            </Link>

                            {/* Add to cart / Quantity controls */}
                            <div className="sheet-cart-controls">
                                {quantity === 0 ? (
                                    <button
                                        className="sheet-add-btn"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart size={18} />
                                        <span>Add to Cart</span>
                                    </button>
                                ) : (
                                    <div className="sheet-quantity-controls">
                                        <button
                                            className="sheet-qty-btn"
                                            onClick={handleDecrement}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="sheet-qty-value">{quantity}</span>
                                        <button
                                            className="sheet-qty-btn"
                                            onClick={handleIncrement}
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

JuiceDetailSheet.propTypes = {
    juice: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        price: PropTypes.number.isRequired,
        category: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        calories: PropTypes.number,
        size: PropTypes.string
    }),
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
}

export default JuiceDetailSheet
