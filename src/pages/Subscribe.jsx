import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Calendar, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/common/Toast'
import { validateName, validatePhone, validateAddress, validateDate } from '../utils/validation'
import LoadingSpinner from '../components/common/LoadingSpinner'
import JuiceCard from '../components/JuiceCard'
import '../styles/Subscribe.css'

function Subscribe() {
    const { juices, subscriptionPlans, addSubscription } = useApp()
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
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const deliveryTimes = [
        { id: 'morning', label: 'Morning', time: '6:00 AM - 9:00 AM' },
        { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 3:00 PM' },
        { id: 'evening', label: 'Evening', time: '5:00 PM - 8:00 PM' }
    ]

    const calculateTotal = () => {
        if (!selectedJuice || !selectedPlan) return 0
        const basePrice = selectedJuice.price * quantity
        const days = selectedPlan.id === 'weekly' ? 7 : 30
        const subtotal = basePrice * days
        const discount = (subtotal * selectedPlan.discount) / 100
        return subtotal - discount
    }

    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target
        setCustomerInfo(prev => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateStep3()) {
            showError('Please fix the errors before submitting')
            return
        }

        setIsSubmitting(true)
        try {
            const subscription = {
                juice: selectedJuice,
                plan: selectedPlan,
                quantity,
                deliveryTime,
                customer: customerInfo,
                total: calculateTotal()
            }
            await addSubscription(subscription)
            success('Subscription created successfully!')
            navigate('/dashboard')
        } catch (err) {
            showError(err.message || 'Failed to create subscription. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = () => setStep(step + 1)
    const prevStep = () => setStep(step - 1)

    return (
        <div className="page">
            <div className="container py-8">
                {/* Progress Steps */}
                <div className="steps-container">
                    {['Choose Juice', 'Select Plan', 'Delivery', 'Confirm'].map((label, index) => (
                        <div key={index} className={`step ${step > index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}>
                            <div className="step-number">
                                {step > index + 1 ? <Check size={16} /> : index + 1}
                            </div>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Step 1: Choose Juice */}
                {step === 1 && (
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
                        <div className="step-actions">
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

                {/* Step 2: Select Plan */}
                {step === 2 && (
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
                                    {plan.id === 'monthly' && (
                                        <span className="plan-badge">Most Popular</span>
                                    )}
                                    <h3 className="plan-name">{plan.name}</h3>
                                    <p className="plan-duration">{plan.duration}</p>
                                    <div className="plan-discount">
                                        <span className="discount-value">{plan.discount}%</span>
                                        <span className="discount-label">OFF</span>
                                    </div>
                                    <p className="plan-description">{plan.description}</p>
                                </div>
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
                                disabled={!selectedPlan}
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
                        </form>
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
                                <h4>Juice</h4>
                                <div className="summary-item">
                                    <span className="juice-emoji">{selectedJuice?.image}</span>
                                    <div>
                                        <strong>{selectedJuice?.name}</strong>
                                        <p className="text-sm text-muted">₹{selectedJuice?.price} × {quantity} per day</p>
                                    </div>
                                </div>
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
