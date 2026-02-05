import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Plus, Minus, Calendar } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import '../../styles/JuiceCard.css'

function JuiceCard({ juice, onSelect, selected, showCartControls = true }) {
    const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart()
    const quantity = getItemQuantity(juice.id)

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
            className={`juice-card card ${selected ? 'selected' : ''} ${onSelect ? 'clickable' : ''}`}
            onClick={onSelect ? () => onSelect(juice) : undefined}
        >
            <div className={`juice-card-image ${juice.category}-bg`}>
                <span className="juice-emoji">{juice.image}</span>
                {/* Subscribe pill on image */}
                {!onSelect && (
                    <Link to="/subscribe" className="subscribe-pill" onClick={(e) => e.stopPropagation()}>
                        <Calendar size={12} />
                        <span>Subscribe</span>
                    </Link>
                )}
            </div>
            <div className="juice-card-body">
                <span className={`badge badge-${juice.category}`}>{juice.category}</span>
                <h3 className="juice-name">{juice.name}</h3>
                <p className="juice-description">{juice.description}</p>
                <div className="juice-meta">
                    <span className="juice-calories">{juice.calories} cal</span>
                    <span className="juice-size">{juice.size}</span>
                </div>
                <div className="juice-footer">
                    <span className="juice-price">₹{juice.price}</span>
                    {!onSelect && showCartControls && (
                        <div className="cart-controls">
                            {quantity === 0 ? (
                                <button 
                                    className="btn btn-primary btn-add-cart"
                                    onClick={handleAddToCart}
                                    aria-label="Add to cart"
                                >
                                    <Plus size={20} />
                                </button>
                            ) : (
                                <div className="quantity-controls">
                                    <button 
                                        className="qty-btn qty-minus"
                                        onClick={handleDecrement}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="qty-value">{quantity}</span>
                                    <button 
                                        className="qty-btn qty-plus"
                                        onClick={handleIncrement}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
