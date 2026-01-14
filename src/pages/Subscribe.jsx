import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Calendar, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import JuiceCard from '../components/JuiceCard'

function Subscribe() {
    const { juices, subscriptionPlans, addSubscription } = useApp()
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

    const handleSubmit = (e) => {
        e.preventDefault()
        const subscription = {
            juice: selectedJuice,
            plan: selectedPlan,
            quantity,
            deliveryTime,
            customer: customerInfo,
            total: calculateTotal()
        }
        addSubscription(subscription)
        navigate('/dashboard')
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
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Delivery Address</label>
                                <textarea
                                    className="form-input form-textarea"
                                    value={customerInfo.address}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                    placeholder="Enter your full address"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={customerInfo.startDate}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, startDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
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
                            <button className="btn btn-ghost btn-lg" onClick={prevStep}>Back</button>
                            <button className="btn btn-success btn-lg" onClick={handleSubmit}>
                                <Check size={20} /> Confirm Subscription
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .steps-container {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-8);
                    margin-bottom: var(--space-12);
                }

                .step {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    opacity: 0.5;
                }

                .step.active, .step.completed {
                    opacity: 1;
                }

                .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-full);
                    background: var(--color-gray-200);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: var(--font-semibold);
                    font-size: var(--text-sm);
                }

                .step.active .step-number {
                    background: var(--color-primary);
                    color: white;
                }

                .step.completed .step-number {
                    background: var(--color-success);
                    color: white;
                }

                .step-label {
                    font-weight: var(--font-medium);
                    font-size: var(--text-sm);
                }

                .step-content {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .juices-select-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-4);
                    margin-bottom: var(--space-8);
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-6);
                    margin-bottom: var(--space-6);
                }

                .plan-card {
                    padding: var(--space-6);
                    text-align: center;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid transparent;
                }

                .plan-card.selected {
                    border-color: var(--color-primary);
                }

                .plan-badge {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--color-primary);
                    color: white;
                    padding: var(--space-1) var(--space-3);
                    border-radius: var(--radius-full);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                }

                .plan-name {
                    font-size: var(--text-xl);
                    margin-bottom: var(--space-1);
                }

                .plan-duration {
                    color: var(--color-gray-500);
                    font-size: var(--text-sm);
                }

                .plan-discount {
                    margin: var(--space-4) 0;
                }

                .discount-value {
                    font-family: var(--font-display);
                    font-size: var(--text-4xl);
                    font-weight: var(--font-bold);
                    color: var(--color-primary);
                }

                .discount-label {
                    font-size: var(--text-lg);
                    color: var(--color-primary);
                    margin-left: var(--space-1);
                }

                .quantity-selector {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-4);
                    margin-bottom: var(--space-8);
                }

                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: var(--color-gray-100);
                    padding: var(--space-1);
                    border-radius: var(--radius-lg);
                }

                .quantity-value {
                    width: 40px;
                    text-align: center;
                    font-weight: var(--font-bold);
                }

                .time-slots {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-4);
                }

                .time-slot {
                    padding: var(--space-4);
                    border: 2px solid var(--color-gray-200);
                    border-radius: var(--radius-lg);
                    text-align: center;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .time-slot:hover {
                    border-color: var(--color-primary);
                }

                .time-slot.selected {
                    border-color: var(--color-primary);
                    background: rgba(255, 107, 53, 0.05);
                }

                .time-label {
                    display: block;
                    font-weight: var(--font-semibold);
                    margin: var(--space-2) 0;
                }

                .time-range {
                    font-size: var(--text-xs);
                    color: var(--color-gray-500);
                }

                .delivery-form {
                    max-width: 500px;
                    margin: 0 auto var(--space-8);
                }

                .order-summary {
                    padding: var(--space-6);
                    max-width: 500px;
                    margin: 0 auto var(--space-8);
                }

                .summary-section {
                    padding: var(--space-4) 0;
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .summary-section h4 {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: var(--space-2);
                }

                .summary-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .summary-item .juice-emoji {
                    font-size: 32px;
                }

                .summary-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: var(--space-4);
                    font-size: var(--text-lg);
                }

                .total-price {
                    font-family: var(--font-display);
                    font-size: var(--text-2xl);
                    color: var(--color-primary);
                }

                .step-actions {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-4);
                }

                @media (max-width: 768px) {
                    .steps-container {
                        gap: var(--space-2);
                    }
                    .step-label {
                        display: none;
                    }
                    .juices-select-grid {
                        grid-template-columns: 1fr;
                    }
                    .plans-grid {
                        grid-template-columns: 1fr;
                    }
                    .time-slots {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default Subscribe
