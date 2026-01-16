import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Calendar, Clock, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import { validateName, validatePhone, validateAddress, validateDate } from '../utils/validation'
import LoadingSpinner from '../components/common/LoadingSpinner'
import JuiceCard from '../components/features/JuiceCard'
import { supabase } from '../lib/supabase'
import '../styles/Subscribe.css'

function Subscribe() {
    const { juices, subscriptionPlans, addSubscription } = useApp()
    const { user } = useAuth()
    const { success, error: showError } = useToast()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [selectedJuice, setSelectedJuice] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [deliveryTime, setDeliveryTime] = useState('morning')
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
        startDate: ''
    })
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [showNewAddressForm, setShowNewAddressForm] = useState(true)
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const deliveryTimes = [
        { id: 'morning', label: 'Morning', time: '6:00 AM - 9:00 AM' },
        { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 3:00 PM' },
        { id: 'evening', label: 'Evening', time: '5:00 PM - 8:00 PM' }
    ]

    // Load saved addresses on component mount
    useEffect(() => {
        const loadSavedAddresses = async () => {
            try {
                if (user) {
                    // For authenticated users, fetch from Supabase
                    const { data, error } = await supabase
                        .from('subscriptions')
                        .select('id, customer_name, customer_phone, customer_address, created_at')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })

                    if (!error && data && data.length > 0) {
                        // Extract unique addresses
                        const uniqueAddresses = []
                        const seenAddresses = new Set()

                        data.forEach(sub => {
                            const key = `${sub.customer_name}_${sub.customer_phone}_${sub.customer_address}`
                            if (!seenAddresses.has(key)) {
                                seenAddresses.add(key)
                                uniqueAddresses.push({
                                    id: sub.id,
                                    name: sub.customer_name,
                                    phone: sub.customer_phone,
                                    address: sub.customer_address,
                                    createdAt: sub.created_at
                                })
                            }
                        })

                        setSavedAddresses(uniqueAddresses)
                        if (uniqueAddresses.length > 0) {
                            setSelectedAddressId(uniqueAddresses[0].id)
                            setShowNewAddressForm(false)
                        }
                    }
                } else {
                    // For guest users, load from localStorage
                    const savedAddressesStorage = localStorage.getItem('savedAddresses')
                    if (savedAddressesStorage) {
                        const addresses = JSON.parse(savedAddressesStorage)
                        setSavedAddresses(addresses)
                        if (addresses.length > 0) {
                            setSelectedAddressId(addresses[0].id)
                            setShowNewAddressForm(false)
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading saved addresses:', err.message)
            }
        }

        loadSavedAddresses()
    }, [user])

    // Update form when selected address changes
    useEffect(() => {
        if (selectedAddressId && !showNewAddressForm) {
            const selected = savedAddresses.find(addr => addr.id === selectedAddressId)
            if (selected) {
                setCustomerInfo(prev => ({
                    ...prev,
                    name: selected.name,
                    phone: selected.phone,
                    address: selected.address
                }))
            }
        }
    }, [selectedAddressId, showNewAddressForm, savedAddresses])

    const calculateTotal = () => {
        if (!selectedPlan) return 0
        
        let basePrice
        if (selectedPlan.type === 'variety') {
            const avgPrice = juices.reduce((sum, j) => sum + j.price, 0) / juices.length
            basePrice = avgPrice * quantity
        } else {
            if (!selectedJuice) return 0
            basePrice = selectedJuice.price * quantity
        }
        
        const days = selectedPlan.id.includes('weekly') ? 7 : 30
        const subtotal = basePrice * days
        const discount = (subtotal * selectedPlan.discount) / 100
        return Math.round(subtotal - discount)
    }

    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target
        setCustomerInfo(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const validateStep3 = () => {
        const newErrors = {}

        const nameError = validateName(customerInfo.name)
        if (nameError) newErrors.name = nameError

        const phoneError = validatePhone(customerInfo.phone)
        if (phoneError) newErrors.phone = phoneError

        const addressError = validateAddress(customerInfo.address)
        if (addressError) newErrors.address = addressError

        const dateError = validateDate(customerInfo.startDate, 'Start date')
        if (dateError) newErrors.startDate = dateError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSelectAddress = (addressId) => {
        setSelectedAddressId(addressId)
        setShowNewAddressForm(false)
    }

    const handleAddNewAddress = () => {
        setShowNewAddressForm(true)
        setSelectedAddressId(null)
        setCustomerInfo({
            name: '',
            phone: '',
            address: '',
            startDate: customerInfo.startDate
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateStep3()) {
            showError('Please fix the errors before submitting')
            return
        }

        setIsSubmitting(true)
        try {
            const subscription = {
                juice: selectedPlan.type === 'variety' 
                    ? { id: null, name: 'Variety Pack', image: '🍹', price: Math.round(juices.reduce((sum, j) => sum + j.price, 0) / juices.length) }
                    : selectedJuice,
                plan: selectedPlan,
                quantity,
                deliveryTime,
                customer: customerInfo,
                total: calculateTotal(),
                isVariety: selectedPlan.type === 'variety'
            }
            await addSubscription(subscription)
            
            // Save/update address for guest users
            if (!user) {
                const newAddress = {
                    id: Date.now().toString(),
                    name: customerInfo.name,
                    phone: customerInfo.phone,
                    address: customerInfo.address
                }

                let addresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
                // Check if address already exists
                const exists = addresses.some(
                    addr => addr.address === newAddress.address && addr.phone === newAddress.phone
                )
                if (!exists) {
                    addresses.unshift(newAddress)
                    localStorage.setItem('savedAddresses', JSON.stringify(addresses))
                }
            }
            
            success('Subscription created successfully!')
            navigate('/dashboard')
        } catch (err) {
            showError(err.message || 'Failed to create subscription. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = () => {
        if (step === 1) {
            if (selectedPlan?.type === 'variety') {
                setStep(3)
            } else {
                setStep(2)
            }
        } else {
            setStep(step + 1)
        }
    }
    
    const prevStep = () => {
        if (step === 3 && selectedPlan?.type === 'variety') {
            setStep(1)
        } else {
            setStep(step - 1)
        }
    }

    return (
        <div className="page">
            <div className="container py-8">
                {/* Progress Steps */}
                <div className="steps-container">
                    {['Select Plan', 'Choose Juice', 'Delivery', 'Confirm'].map((label, index) => {
                        const shouldShow = !(selectedPlan?.type === 'variety' && index === 1)
                        const isCompleted = step > index + 1 || (selectedPlan?.type === 'variety' && index === 1 && step >= 3)
                        const isActive = step === index + 1
                        
                        if (!shouldShow && step >= 3) {
                            return null
                        }
                        
                        return (
                            <div key={index} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                <div className="step-number">
                                    {isCompleted ? <Check size={16} /> : index + 1}
                                </div>
                                <span className="step-label">
                                    {selectedPlan?.type === 'variety' && index === 1 ? 'Variety Pack' : label}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Step 1: Select Plan */}
                {step === 1 && (
                    <div className="step-content animate-fade-in">
                        <h2 className="section-title">Choose Your Plan</h2>
                        <p className="text-muted mb-6">Select a subscription plan that works for you</p>
                        <div className="plans-grid">
                            {subscriptionPlans.map(plan => (
                                <div
                                    key={plan.id}
                                    className={`plan-card card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    {plan.isPopular && (
                                        <span className="plan-badge">Most Popular</span>
                                    )}
                                    {plan.isTrial && (
                                        <span className="plan-badge badge-trial">Trial</span>
                                    )}
                                    <h3 className="plan-name">{plan.name}</h3>
                                    <p className="plan-duration">{plan.duration}</p>
                                    <div className="plan-discount">
                                        <span className="discount-value">{plan.discount}%</span>
                                        <span className="discount-label">OFF</span>
                                    </div>
                                    <p className="plan-description">{plan.description}</p>
                                    {plan.type === 'variety' && (
                                        <span className="badge badge-secondary">🍹 Variety Pack</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {selectedPlan && (
                            <div className="quantity-selector">
                                <label>Quantity per day:</label>
                                <div className="quantity-controls">
                                    <button className="btn btn-ghost" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                    <span className="quantity-value">{quantity}</span>
                                    <button className="btn btn-ghost" onClick={() => setQuantity(Math.min(5, quantity + 1))}>+</button>
                                </div>
                            </div>
                        )}
                        <div className="step-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={nextStep}
                                disabled={!selectedPlan}
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Choose Juice */}
                {step === 2 && selectedPlan?.type === 'single' && (
                    <div className="step-content animate-fade-in">
                        <h2 className="section-title">Choose Your Juice</h2>
                        <p className="text-muted mb-6">Select your favorite juice for daily delivery</p>
                        <div className="juices-select-grid">
                            {juices.map(juice => (
                                <JuiceCard
                                    key={juice.id}
                                    juice={juice}
                                    onSelect={setSelectedJuice}
                                    selected={selectedJuice?.id === juice.id}
                                />
                            ))}
                        </div>
                        <div className="quantity-selector">
                            <label>Quantity per day:</label>
                            <div className="quantity-controls">
                                <button className="btn btn-ghost" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span className="quantity-value">{quantity}</span>
                                <button className="btn btn-ghost" onClick={() => setQuantity(Math.min(5, quantity + 1))}>+</button>
                            </div>
                        </div>
                        <div className="step-actions">
                            <button className="btn btn-ghost btn-lg" onClick={prevStep}>Back</button>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={nextStep}
                                disabled={!selectedJuice}
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Delivery Details */}
                {step === 3 && (
                    <div className="step-content animate-fade-in">
                        <h2 className="section-title">Delivery Details</h2>
                        <p className="text-muted mb-6">Tell us where and when to deliver</p>

                        {/* Saved Addresses Section */}
                        {savedAddresses.length > 0 && !showNewAddressForm && (
                            <div className="saved-addresses-section mb-8">
                                <h3 className="subsection-title mb-4">Select Saved Address</h3>
                                <div className="saved-addresses-list">
                                    {savedAddresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                            onClick={() => handleSelectAddress(addr.id)}
                                        >
                                            <div className="address-radio">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => handleSelectAddress(addr.id)}
                                                />
                                            </div>
                                            <div className="address-details">
                                                <p className="address-name"><strong>{addr.name}</strong></p>
                                                <p className="address-phone">{addr.phone}</p>
                                                <p className="address-text">{addr.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary mt-4 w-full"
                                    onClick={handleAddNewAddress}
                                >
                                    <Plus size={18} /> Add New Address
                                </button>
                            </div>
                        )}

                        {/* New Address Form */}
                        {showNewAddressForm && (
                            <>
                                <form className="delivery-form">
                                    <div className="form-group">
                                        <label htmlFor="name" className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                                            value={customerInfo.name}
                                            onChange={handleCustomerInfoChange}
                                            placeholder="Enter your name"
                                        />
                                        {errors.name && (
                                            <span className="form-error">{errors.name}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                                            value={customerInfo.phone}
                                            onChange={handleCustomerInfoChange}
                                            placeholder="10-digit mobile number"
                                        />
                                        {errors.phone && (
                                            <span className="form-error">{errors.phone}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="address" className="form-label">Delivery Address</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            className={`form-input form-textarea ${errors.address ? 'form-input-error' : ''}`}
                                            value={customerInfo.address}
                                            onChange={handleCustomerInfoChange}
                                            placeholder="Enter your full address"
                                        />
                                        {errors.address && (
                                            <span className="form-error">{errors.address}</span>
                                        )}
                                    </div>
                                </form>

                                {savedAddresses.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-ghost w-full mb-6"
                                        onClick={() => {
                                            setShowNewAddressForm(false)
                                            setSelectedAddressId(savedAddresses[0].id)
                                        }}
                                    >
                                        Cancel - Use Saved Address
                                    </button>
                                )}
                            </>
                        )}

                        {/* Date and Time (Always visible) */}
                        <div className="form-group">
                            <label htmlFor="startDate" className="form-label">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className={`form-input ${errors.startDate ? 'form-input-error' : ''}`}
                                value={customerInfo.startDate}
                                onChange={handleCustomerInfoChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.startDate && (
                                <span className="form-error">{errors.startDate}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preferred Delivery Time</label>
                            <div className="time-slots">
                                {deliveryTimes.map(time => (
                                    <div
                                        key={time.id}
                                        className={`time-slot ${deliveryTime === time.id ? 'selected' : ''}`}
                                        onClick={() => setDeliveryTime(time.id)}
                                    >
                                        <Clock size={20} />
                                        <span className="time-label">{time.label}</span>
                                        <span className="time-range">{time.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="step-actions">
                            <button className="btn btn-ghost btn-lg" onClick={prevStep}>Back</button>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={nextStep}
                                disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.startDate}
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm */}
                {step === 4 && (
                    <div className="step-content animate-fade-in">
                        <h2 className="section-title">Confirm Your Order</h2>
                        <p className="text-muted mb-6">Review your subscription details</p>
                        <div className="order-summary card">
                            <div className="summary-section">
                                <h4>{selectedPlan?.type === 'variety' ? 'Variety Pack' : 'Juice'}</h4>
                                {selectedPlan?.type === 'variety' ? (
                                    <div className="summary-item">
                                        <span className="juice-emoji">🍹</span>
                                        <div>
                                            <strong>Variety Pack</strong>
                                            <p className="text-sm text-muted">
                                                All {juices.length} juices included - different flavors daily
                                            </p>
                                            <p className="text-sm text-muted">
                                                {quantity} juice{quantity > 1 ? 's' : ''} per day
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="summary-item">
                                        <span className="juice-emoji">{selectedJuice?.image}</span>
                                        <div>
                                            <strong>{selectedJuice?.name}</strong>
                                            <p className="text-sm text-muted">₹{selectedJuice?.price} × {quantity} per day</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="summary-section">
                                <h4>Plan</h4>
                                <p><strong>{selectedPlan?.name}</strong> ({selectedPlan?.duration})</p>
                                <span className="badge badge-success">{selectedPlan?.discount}% OFF</span>
                            </div>
                            <div className="summary-section">
                                <h4>Delivery</h4>
                                <p>{customerInfo.name}</p>
                                <p className="text-sm text-muted">{customerInfo.phone}</p>
                                <p className="text-sm text-muted">{customerInfo.address}</p>
                                <p className="text-sm">Starting: {new Date(customerInfo.startDate).toLocaleDateString()}</p>
                                <p className="text-sm">Time: {deliveryTimes.find(t => t.id === deliveryTime)?.label}</p>
                            </div>
                            <div className="summary-total">
                                <span>Total Amount</span>
                                <strong className="total-price">₹{calculateTotal().toLocaleString()}</strong>
                            </div>
                        </div>
                        <div className="step-actions">
                            <button className="btn btn-ghost btn-lg" onClick={prevStep} disabled={isSubmitting}>Back</button>
                            <button 
                                className="btn btn-success btn-lg" 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <Check size={20} /> Confirm Subscription
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Subscribe