import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, Calendar } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import '../../styles/JuiceCard.css'

const CATEGORY_THEMES = {
    detox:    '90, 60%, 40%',
    energy:   '18, 100%, 60%',
    immunity: '38, 100%, 58%',
    refresh:  '174, 62%, 47%',
    protein:  '268, 60%, 63%',
}

function JuiceCard({ juice, onSelect, selected, showCartControls = true }) {
    const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart()
    const quantity = getItemQuantity(juice.id)
    const themeColor = CATEGORY_THEMES[juice.category] || '18, 100%, 60%'

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

    return (
        <div
            className={`juice-card-wrapper ${selected ? 'selected' : ''} ${onSelect ? 'clickable' : ''}`}
            style={{ '--theme-color': themeColor }}
            onClick={onSelect ? () => onSelect(juice) : undefined}
        >
            <div className="juice-card-inner">
                {/* Background emoji area */}
                <div className={`juice-card-bg ${juice.category}-bg`}>
                    <span className="juice-emoji">{juice.image}</span>
                </div>

                {/* Gradient overlay */}
                <div
                    className="juice-card-gradient"
                    style={{
                        background: `linear-gradient(to top, hsl(${themeColor} / 0.92), hsl(${themeColor} / 0.6) 40%, transparent 70%)`
                    }}
                />

                {/* Subscribe pill */}
                {!onSelect && (
                    <Link to="/subscribe" className="subscribe-pill" onClick={(e) => e.stopPropagation()}>
                        <Calendar size={10} />
                        <span>Subscribe</span>
                    </Link>
                )}

                {/* Category badge */}
                <span className="juice-card-category">{juice.category}</span>

                {/* Content overlay */}
                <div className="juice-card-content">
                    <h3 className="juice-name">{juice.name}</h3>
                    <p className="juice-meta-line">
                        {juice.calories && <span>{juice.calories} cal</span>}
                        {juice.size && <span> · {juice.size}</span>}
                    </p>

                    {/* Action bar */}
                    <div className="juice-action-bar">
                        <span className="juice-price">₹{juice.price}</span>
                        {!onSelect && showCartControls && (
                            <div className="cart-controls">
                                {quantity === 0 ? (
                                    <button
                                        className="btn-add-cart"
                                        onClick={handleAddToCart}
                                        aria-label="Add to cart"
                                    >
                                        <span className="cart-icon-side"><ShoppingCart size={14} /></span>
                                        <span className="cart-label">Add</span>
                                    </button>
                                ) : (
                                    <div className="quantity-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={handleDecrement}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="qty-value">{quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={handleIncrement}
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
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
    showCartControls: PropTypes.bool
}

export default JuiceCard
