import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Minus, ShoppingCart, Calendar, Clock } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { getImageUrl } from '../../lib/supabase'
import '../../styles/JuiceCard.css'

const CATEGORY_THEMES = {
    detox:    '90, 60%, 40%',
    energy:   '18, 100%, 60%',
    immunity: '38, 100%, 58%',
    refresh:  '174, 62%, 47%',
    protein:  '268, 60%, 63%',
}

// Calculate "original" price (markup for showing savings)
const getOriginalPrice = (price) => Math.round(price * 1.4)

function JuiceCard({ juice, onSelect, selected, onCardClick, showCartControls = true }) {
    const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart()
    const quantity = getItemQuantity(juice.id)
    const themeColor = CATEGORY_THEMES[juice.category] || '18, 100%, 60%'
    const isClickable = onSelect || onCardClick
    const originalPrice = getOriginalPrice(juice.price)
    const savings = originalPrice - juice.price
    
    // Check if image is emoji or URL
    const imageUrl = getImageUrl(juice.image)
    const isEmoji = juice.image && juice.image.length <= 4

    const handleAddToCart = (e) => {
        e.stopPropagation()
        addItem(juice)
    }

    const handleIncrement = (e) => {
        e.stopPropagation()
        incrementItem(juice.id)
    }

    const handleDecrement = (e) => {
        e.stopPropagation()
        decrementItem(juice.id)
    }

    const handleCardClick = () => {
        if (onSelect) onSelect(juice)
        if (onCardClick) onCardClick(juice)
    }

    // Animation variants
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        hover: { scale: 1.03, transition: { duration: 0.2 } },
    }

    const buttonVariants = {
        tap: { scale: 0.95 },
    }

    const badgeVariants = {
        initial: { scale: 0 },
        animate: { scale: 1, transition: { delay: 0.3, type: "spring", stiffness: 200 } },
    }

    return (
        <motion.div
            className={`juice-card-wrapper ${selected ? 'selected' : ''} ${isClickable ? 'clickable' : ''}`}
            style={{ '--theme-color': themeColor }}
            onClick={isClickable ? handleCardClick : undefined}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            layout
        >
            <div className="juice-card-inner">
                {/* Image/Emoji area with gradient */}
                <div className={`juice-card-bg ${juice.category}-bg`}>
                    {isEmoji ? (
                        <span className="juice-emoji">{juice.image}</span>
                    ) : (
                        <img src={imageUrl} alt={juice.name} className="juice-image" />
                    )}
                    <div className="juice-card-overlay" />
                    
                    {/* Category badge (top right) */}
                    <motion.div 
                        className="category-badge-wrapper"
                        variants={badgeVariants}
                    >
                        <span className={`category-indicator ${juice.category}`}>
                            <span className="category-dot"></span>
                        </span>
                    </motion.div>

                </div>

                {/* Content Section */}
                <div className="juice-card-content">
                    {/* Pricing row */}
                    <div className="juice-pricing">
                        <span className="juice-price">₹{juice.price}</span>
                        <span className="juice-original-price">₹{originalPrice}</span>
                        {savings > 0 && (
                            <span className="juice-savings">SAVE ₹{savings}</span>
                        )}
                    </div>
                    
                    {/* Size & calories */}
                    <p className="juice-quantity">
                        {juice.size}
                        <span className="juice-meta-item">
                            <Clock size={10} />
                            {juice.calories} cal
                        </span>
                    </p>
                    
                    {/* Item name */}
                    <h3 className="juice-name">{juice.name}</h3>
                    
                    {/* Meta info row */}
                    <div className="juice-meta-row">
                        {!onSelect && showCartControls && quantity === 0 && (
                            <motion.button
                                className="meta-add-btn"
                                onClick={handleAddToCart}
                                variants={buttonVariants}
                                whileTap="tap"
                                aria-label={`Add ${juice.name} to cart`}
                            >
                                <Plus size={14} />
                                <span>Add</span>
                            </motion.button>
                        )}
                        {!onSelect && showCartControls && quantity > 0 && (
                            <div className="meta-qty-controls">
                                <motion.button
                                    className="meta-qty-btn"
                                    onClick={handleDecrement}
                                    variants={buttonVariants}
                                    whileTap="tap"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={14} />
                                </motion.button>
                                <span className="meta-qty-value">{quantity}</span>
                                <motion.button
                                    className="meta-qty-btn"
                                    onClick={handleIncrement}
                                    variants={buttonVariants}
                                    whileTap="tap"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={14} />
                                </motion.button>
                            </div>
                        )}
                        <Link 
                            to="/subscribe" 
                            state={{ juice }} 
                            className="subscribe-link" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Calendar size={12} />
                            <span>Subscribe</span>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

JuiceCard.propTypes = {
    juice: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        price: PropTypes.number.isRequired,
        category: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        calories: PropTypes.number,
        size: PropTypes.string
    }).isRequired,
    onSelect: PropTypes.func,
    selected: PropTypes.bool,
    onCardClick: PropTypes.func,
    showCartControls: PropTypes.bool
}

export default JuiceCard
