import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocation as useLocationContext } from '../context/LocationContext'
import '../styles/Cart.css'

function Cart() {
    const navigate = useNavigate()
    const { 
        items, 
        totalItems, 
        totalPrice, 
        incrementItem, 
        decrementItem, 
        removeItem, 
        clearCart 
    } = useCart()
    const { isDeliverable, hasLocation, distance, requestLocation } = useLocationContext()

    const deliveryFee = 30
    const freeDeliveryThreshold = 200
    const isEligibleForFreeDelivery = totalPrice >= freeDeliveryThreshold
    const finalTotal = totalPrice + (isEligibleForFreeDelivery ? 0 : deliveryFee)

    const handleCheckout = () => {
        // TODO: Implement checkout flow
        alert('Checkout feature coming soon!')
    }

    if (items.length === 0) {
        return (
            <div className="page cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <ShoppingBag size={64} />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any juices yet</p>
                        <Link to="/" className="btn btn-primary">
                            Browse Menu
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page cart-page">
            <div className="container">
                {/* Header */}
                <div className="cart-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Your Cart</h1>
                    <span className="item-count">{totalItems} items</span>
                </div>

                {/* Location Warning */}
                {!hasLocation && (
                    <div className="location-banner warning">
                        <MapPin size={18} />
                        <div className="banner-content">
                            <span>Set your delivery location</span>
                            <button className="btn btn-sm btn-outline" onClick={requestLocation}>
                                Enable Location
                            </button>
                        </div>
                    </div>
                )}

                {hasLocation && !isDeliverable && (
                    <div className="location-banner error">
                        <AlertCircle size={18} />
                        <div className="banner-content">
                            <span>You're outside our delivery zone ({distance} km away)</span>
                            <Link to="/coming-soon" className="btn btn-sm btn-outline">
                                Learn More
                            </Link>
                        </div>
                    </div>
                )}

                {/* Cart Items */}
                <div className="cart-items">
                    {items.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="item-image">
                                <span className="item-emoji">{item.image_url || '🧃'}</span>
                            </div>
                            <div className="item-details">
                                <h3 className="item-name">{item.name}</h3>
                                <span className="item-price">₹{item.price}</span>
                            </div>
                            <div className="item-actions">
                                <div className="quantity-controls">
                                    <button 
                                        className="qty-btn"
                                        onClick={() => decrementItem(item.id)}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button 
                                        className="qty-btn"
                                        onClick={() => incrementItem(item.id)}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeItem(item.id)}
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="item-total">
                                ₹{item.price * item.quantity}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Clear Cart */}
                <button className="clear-cart-btn" onClick={clearCart}>
                    <Trash2 size={16} />
                    Clear Cart
                </button>

                {/* Order Summary */}
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{totalPrice}</span>
                    </div>
                    
                    <div className="summary-row">
                        <span>Delivery Fee</span>
                        <span className={isEligibleForFreeDelivery ? 'free' : ''}>
                            {isEligibleForFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                        </span>
                    </div>

                    {!isEligibleForFreeDelivery && (
                        <div className="free-delivery-hint">
                            Add ₹{freeDeliveryThreshold - totalPrice} more for free delivery
                        </div>
                    )}
                    
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{finalTotal}</span>
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="checkout-section">
                    <button 
                        className="btn btn-primary btn-checkout"
                        onClick={handleCheckout}
                        disabled={hasLocation && !isDeliverable}
                    >
                        {hasLocation && !isDeliverable 
                            ? 'Outside Delivery Zone' 
                            : `Proceed to Checkout • ₹${finalTotal}`
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart
