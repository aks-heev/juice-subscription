import React from 'react'
import { Link } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { Package, Calendar, Clock, MapPin, X, RefreshCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Dashboard() {
    const { subscriptions, cancelSubscription } = useApp()

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const pastSubscriptions = subscriptions.filter(s => s.status !== 'active')

    const getEndDate = (subscription) => {
        const startDate = new Date(subscription.customer.startDate)
        const days = subscription.plan.id.includes('weekly') ? 7 : 30
        return addDays(startDate, days)
    }

    const getDeliveryTimeLabel = (time) => {
        const times = {
            morning: '6:00 AM - 9:00 AM',
            afternoon: '12:00 PM - 3:00 PM',
            evening: '5:00 PM - 8:00 PM'
        }
        return times[time] || time
    }

    if (subscriptions.length === 0) {
        return (
            <div className="page">
                <div className="container py-8">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Package size={40} />
                        </div>
                        <h2 className="empty-state-title">No Subscriptions Yet</h2>
                        <p className="empty-state-description">
                            Start your healthy journey by subscribing to fresh juices delivered daily.
                        </p>
                        <Link to="/subscribe" className="btn btn-primary">
                            Subscribe Now
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="container py-8">
                <div className="page-header">
                    <h1 className="page-title">My Subscriptions</h1>
                    <p className="page-subtitle">Manage your juice subscriptions</p>
                </div>

                {activeSubscriptions.length > 0 && (
                    <section className="mb-8">
                        <h2 className="section-title">Active Subscriptions</h2>
                        <div className="subscriptions-grid">
                            {activeSubscriptions.map(subscription => (
                                <div key={subscription.id} className="subscription-card card">
                                    <div className="subscription-header">
                                        <div className="subscription-juice">
                                            <span className="juice-emoji">{subscription.juice?.image || '🍹'}</span>
                                            <div>
                                                <h3>{subscription.juice?.name || 'Variety Pack'}</h3>
                                                <span className="badge badge-success">Active</span>
                                            </div>
                                        </div>
                                        <span className="subscription-plan">{subscription.plan.name}</span>
                                    </div>
                                    <div className="subscription-details">
                                        <div className="detail-item">
                                            <Calendar size={16} />
                                            <span>
                                                {format(new Date(subscription.customer.startDate), 'MMM d')} - {format(getEndDate(subscription), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <Clock size={16} />
                                            <span>{getDeliveryTimeLabel(subscription.deliveryTime)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <MapPin size={16} />
                                            <span>{subscription.customer.address}</span>
                                        </div>
                                        <div className="detail-item">
                                            <Package size={16} />
                                            <span>{subscription.quantity} juice(s) per day</span>
                                        </div>
                                    </div>
                                    <div className="subscription-footer">
                                        <div className="subscription-total">
                                            <span>Total</span>
                                            <strong>₹{subscription.total.toLocaleString()}</strong>
                                        </div>
                                        <div className="subscription-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => cancelSubscription(subscription.id)}
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pastSubscriptions.length > 0 && (
                    <section>
                        <h2 className="section-title">Past Subscriptions</h2>
                        <div className="subscriptions-grid">
                            {pastSubscriptions.map(subscription => (
                                <div key={subscription.id} className="subscription-card card past">
                                    <div className="subscription-header">
                                        <div className="subscription-juice">
                                            <span className="juice-emoji">{subscription.juice?.image || '🍹'}</span>
                                            <div>
                                                <h3>{subscription.juice?.name || 'Variety Pack'}</h3>
                                                <span className="badge badge-error">Cancelled</span>
                                            </div>
                                        </div>
                                        <span className="subscription-plan">{subscription.plan.name}</span>
                                    </div>
                                    <div className="subscription-footer">
                                        <div className="subscription-total">
                                            <span>Total</span>
                                            <strong>₹{subscription.total.toLocaleString()}</strong>
                                        </div>
                                        <Link to="/subscribe" className="btn btn-primary btn-sm">
                                            <RefreshCcw size={16} /> Resubscribe
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <style>{`
                .subscriptions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-6);
                }

                .subscription-card {
                    padding: var(--space-6);
                }

                .subscription-card.past {
                    opacity: 0.7;
                }

                .subscription-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-4);
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .subscription-juice {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .subscription-juice .juice-emoji {
                    font-size: 40px;
                }

                .subscription-juice h3 {
                    font-size: var(--text-lg);
                    margin-bottom: var(--space-1);
                }

                .subscription-plan {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                    background: var(--color-gray-100);
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--radius-md);
                }

                .subscription-details {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                    margin-bottom: var(--space-4);
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                }

                .subscription-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--color-gray-200);
                }

                .subscription-total span {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                    display: block;
                }

                .subscription-total strong {
                    font-family: var(--font-display);
                    font-size: var(--text-xl);
                    color: var(--color-primary);
                }

                .subscription-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                @media (max-width: 768px) {
                    .subscriptions-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default Dashboard
