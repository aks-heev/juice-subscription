import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
    Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, AlertCircle, 
    ChevronDown, ChevronUp, Tag, Check, Home, Briefcase, Clock
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLocation as useLocationContext } from '../context/LocationContext'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/common/Toast'
import MapAddressPicker from '../components/features/MapAddressPicker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { supabase } from '../lib/supabase'
import '../styles/Cart.css'

function Cart() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addOrder } = useApp()
    const { success, error: showError } = useToast()
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

    // Checkout state
    const [step, setStep] = useState('cart') // 'cart' or 'checkout'
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [showAddressDropdown, setShowAddressDropdown] = useState(false)
    const [showMapPicker, setShowMapPicker] = useState(false)
    const [couponCode, setCouponCode] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponLoading, setCouponLoading] = useState(false)
    const [deliveryTime, setDeliveryTime] = useState('morning')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const deliveryFee = 30
    const freeDeliveryThreshold = 200
    const isEligibleForFreeDelivery = totalPrice >= freeDeliveryThreshold
    const actualDeliveryFee = isEligibleForFreeDelivery ? 0 : deliveryFee
    const discountAmount = (totalPrice * couponDiscount) / 100
    const finalTotal = totalPrice + actualDeliveryFee - discountAmount

    const deliveryTimes = [
        { id: 'morning', label: 'Morning', time: '6:00 AM - 9:00 AM' },
        { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 3:00 PM' },
        { id: 'evening', label: 'Evening', time: '5:00 PM - 8:00 PM' }
    ]

    // Load saved addresses
    useEffect(() => {
        const loadSavedAddresses = async () => {
            try {
                const allAddresses = []
                const seenAddresses = new Set()

                // Load from localStorage first (includes map-picked addresses)
                const localAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
                localAddresses.forEach(addr => {
                    if (!seenAddresses.has(addr.address)) {
                        seenAddresses.add(addr.address)
                        allAddresses.push(addr)
                    }
                })

                if (user) {
                    // Add profile address
                    if (user.user_metadata?.address && !seenAddresses.has(user.user_metadata.address)) {
                        let phoneNumber = user.phone || user.user_metadata?.phone || ''
                        if (phoneNumber.startsWith('+91')) {
                            phoneNumber = phoneNumber.slice(3)
                        }
                        
                        allAddresses.push({
                            id: 'profile',
                            name: user.user_metadata?.name || '',
                            phone: phoneNumber,
                            address: user.user_metadata.address,
                            label: 'Profile',
                            isProfile: true
                        })
                        seenAddresses.add(user.user_metadata.address)
                    }

                    // Fetch from past subscriptions
                    const { data } = await supabase
                        .from('subscriptions')
                        .select('id, customer_name, customer_phone, customer_address')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(5)

                    if (data) {
                        data.forEach(sub => {
                            if (!seenAddresses.has(sub.customer_address)) {
                                seenAddresses.add(sub.customer_address)
                                allAddresses.push({
                                    id: `sub-${sub.id}`,
                                    name: sub.customer_name,
                                    phone: sub.customer_phone,
                                    address: sub.customer_address
                                })
                            }
                        })
                    }
                }

                setSavedAddresses(allAddresses)
                
                // Auto-select first address or from localStorage selection
                const selectedId = localStorage.getItem('selectedDeliveryAddress')
                if (selectedId) {
                    try {
                        const selected = JSON.parse(selectedId)
                        if (allAddresses.find(a => a.id === selected.id)) {
                            setSelectedAddressId(selected.id)
                        } else if (allAddresses.length > 0) {
                            setSelectedAddressId(allAddresses[0].id)
                        }
                    } catch {
                        if (allAddresses.length > 0) {
                            setSelectedAddressId(allAddresses[0].id)
                        }
                    }
                } else if (allAddresses.length > 0) {
                    setSelectedAddressId(allAddresses[0].id)
                }
            } catch (err) {
                console.error('Error loading addresses:', err)
            }
        }

        loadSavedAddresses()
    }, [user])

    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)

    const getAddressIcon = (label) => {
        switch(label?.toLowerCase()) {
            case 'home': return <Home size={16} />
            case 'work': return <Briefcase size={16} />
            default: return <MapPin size={16} />
        }
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return
        
        setCouponLoading(true)
        // Simulated coupon validation - in production, validate against database
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const validCoupons = {
            'FIRST10': 10,
            'JUICE20': 20,
            'FRESH15': 15
        }
        
        const discount = validCoupons[couponCode.toUpperCase()]
        if (discount) {
            setCouponDiscount(discount)
            setCouponApplied(true)
            success(`Coupon applied! ${discount}% off`)
        } else {
            showError('Invalid coupon code')
        }
        setCouponLoading(false)
    }

    const handleRemoveCoupon = () => {
        setCouponCode('')
        setCouponDiscount(0)
        setCouponApplied(false)
    }

    const handleMapAddressSave = (mapAddress) => {
        const newAddress = {
            id: mapAddress.id,
            name: user?.user_metadata?.name || '',
            phone: user?.phone || '',
            address: mapAddress.displayAddress,
            label: mapAddress.label,
            coordinates: mapAddress.coordinates,
            isLocal: true
        }

        const localAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
        localAddresses.unshift(newAddress)
        localStorage.setItem('savedAddresses', JSON.stringify(localAddresses))
        
        setSavedAddresses(prev => [newAddress, ...prev])
        setSelectedAddressId(newAddress.id)
        setShowMapPicker(false)
        success('Address saved!')
    }

    const handlePlaceOrder = async () => {
        // Require login at checkout
        if (!user) {
            showError('Please login to place your order')
            navigate('/phone-auth', { state: { returnTo: '/cart' } })
            return
        }

        if (!selectedAddress) {
            showError('Please select a delivery address')
            return
        }

        setIsSubmitting(true)
        try {
            const orderData = {
                items: items.map(item => ({
                    juice_id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity
                })),
                customer_name: selectedAddress.name,
                customer_phone: selectedAddress.phone,
                customer_address: selectedAddress.address,
                delivery_time: deliveryTime,
                subtotal: totalPrice,
                delivery_fee: actualDeliveryFee,
                discount: discountAmount,
                coupon_code: couponApplied ? couponCode : null,
                total: finalTotal
            }

            await addOrder(orderData)
            clearCart()
            success('Order placed successfully!')
            navigate('/dashboard')
        } catch (err) {
            showError(err.message || 'Failed to place order')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleProceedToCheckout = () => {
        if (items.length === 0) return

        // Require login before checkout
        if (!user) {
            showError('Please login to checkout')
            navigate('/phone-auth', { state: { returnTo: '/cart' } })
            return
        }

        setStep('checkout')
    }

    // Empty cart view
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

    // Checkout view
    if (step === 'checkout') {
        return (
            <div className="page cart-page checkout-page">
                <div className="container">
                    {/* Header */}
                    <div className="cart-header">
                        <button className="back-btn" onClick={() => setStep('cart')}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1>Checkout</h1>
                        <span className="item-count">{totalItems} items</span>
                    </div>

                    {/* Delivery Address Section */}
                    <div className="checkout-section-card">
                        <div className="section-header">
                            <h3><MapPin size={18} /> Delivery Address</h3>
                        </div>
                        
                        {savedAddresses.length > 0 ? (
                            <div className="address-selector">
                                <button 
                                    className="selected-address-btn"
                                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                                >
                                    {selectedAddress ? (
                                        <div className="address-preview">
                                            {getAddressIcon(selectedAddress.label)}
                                            <div className="address-info">
                                                <span className="address-label-tag">{selectedAddress.label || 'Address'}</span>
                                                <span className="address-text">{selectedAddress.address}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span>Select delivery address</span>
                                    )}
                                    {showAddressDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {showAddressDropdown && (
                                    <div className="address-dropdown">
                                        {savedAddresses.map(addr => (
                                            <button
                                                key={addr.id}
                                                className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedAddressId(addr.id)
                                                    setShowAddressDropdown(false)
                                                }}
                                            >
                                                {getAddressIcon(addr.label)}
                                                <div className="address-option-info">
                                                    <span className="address-option-label">{addr.label || 'Saved Address'}</span>
                                                    <span className="address-option-name">{addr.name}</span>
                                                    <span className="address-option-text">{addr.address}</span>
                                                </div>
                                                {selectedAddressId === addr.id && <Check size={18} className="check-icon" />}
                                            </button>
                                        ))}
                                        <button 
                                            className="add-new-address-btn"
                                            onClick={() => {
                                                setShowAddressDropdown(false)
                                                setShowMapPicker(true)
                                            }}
                                        >
                                            <Plus size={18} />
                                            Add New Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                className="btn btn-outline w-full"
                                onClick={() => setShowMapPicker(true)}
                            >
                                <MapPin size={18} /> Add Delivery Address
                            </button>
                        )}
                    </div>

                    {/* Delivery Time */}
                    <div className="checkout-section-card">
                        <div className="section-header">
                            <h3><Clock size={18} /> Delivery Time</h3>
                        </div>
                        <div className="delivery-time-options">
                            {deliveryTimes.map(time => (
                                <button
                                    key={time.id}
                                    className={`time-option ${deliveryTime === time.id ? 'selected' : ''}`}
                                    onClick={() => setDeliveryTime(time.id)}
                                >
                                    <span className="time-label">{time.label}</span>
                                    <span className="time-range">{time.time}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="checkout-section-card">
                        <div className="section-header">
                            <h3><ShoppingBag size={18} /> Order Items</h3>
                            <button className="edit-cart-btn" onClick={() => setStep('cart')}>Edit</button>
                        </div>
                        <div className="checkout-items">
                            {items.map(item => (
                                <div key={item.id} className="checkout-item">
                                    <span className="item-emoji">{item.image_url || '🧃'}</span>
                                    <div className="checkout-item-info">
                                        <span className="checkout-item-name">{item.name}</span>
                                        <span className="checkout-item-qty">x{item.quantity}</span>
                                    </div>
                                    <span className="checkout-item-price">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="checkout-section-card">
                        <div className="section-header">
                            <h3><Tag size={18} /> Apply Coupon</h3>
                        </div>
                        {couponApplied ? (
                            <div className="coupon-applied">
                                <div className="coupon-info">
                                    <Tag size={16} />
                                    <span>{couponCode.toUpperCase()} - {couponDiscount}% OFF</span>
                                </div>
                                <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>Remove</button>
                            </div>
                        ) : (
                            <div className="coupon-input-group">
                                <input
                                    type="text"
                                    className="coupon-input"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button 
                                    className="btn btn-primary apply-coupon-btn"
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                >
                                    {couponLoading ? <LoadingSpinner size="small" /> : 'Apply'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="checkout-section-card price-breakdown">
                        <div className="price-row">
                            <span>Subtotal ({totalItems} items)</span>
                            <span>₹{totalPrice}</span>
                        </div>
                        <div className="price-row">
                            <span>Delivery Fee</span>
                            <span className={isEligibleForFreeDelivery ? 'free' : ''}>
                                {isEligibleForFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                            </span>
                        </div>
                        {couponApplied && (
                            <div className="price-row discount">
                                <span>Coupon Discount ({couponDiscount}%)</span>
                                <span>-₹{discountAmount}</span>
                            </div>
                        )}
                        <div className="price-row total">
                            <span>Total</span>
                            <span>₹{Math.round(finalTotal)}</span>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <div className="checkout-actions">
                        <button 
                            className="btn btn-primary btn-lg btn-place-order"
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || !selectedAddress}
                        >
                            {isSubmitting ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                <>Place Order • ₹{Math.round(finalTotal)}</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Map Picker Modal */}
                <MapAddressPicker
                    isOpen={showMapPicker}
                    onClose={() => setShowMapPicker(false)}
                    onSaveAddress={handleMapAddressSave}
                />
            </div>
        )
    }

    // Cart view (default)
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
                        <span>₹{totalPrice + actualDeliveryFee}</span>
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="checkout-section">
                    <button 
                        className="btn btn-primary btn-checkout"
                        onClick={handleProceedToCheckout}
                        disabled={hasLocation && !isDeliverable}
                    >
                        {hasLocation && !isDeliverable 
                            ? 'Outside Delivery Zone' 
                            : `Proceed to Checkout • ₹${totalPrice + actualDeliveryFee}`
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart
