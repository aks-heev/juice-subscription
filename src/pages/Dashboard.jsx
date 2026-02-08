import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { Package, Calendar, Clock, MapPin, X, RefreshCcw, ShoppingBag } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Dashboard() {
    const { subscriptions, cancelSubscription, orders, updateOrder } = useApp()
    const [activeTab, setActiveTab] = useState('orders')

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const pastSubscriptions = subscriptions.filter(s => s.status !== 'active')

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'out_for_delivery')
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled')

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

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Pending', className: 'badge-warning' },
            processing: { label: 'Processing', className: 'badge-info' },
            out_for_delivery: { label: 'Out for Delivery', className: 'badge-info' },
            delivered: { label: 'Delivered', className: 'badge-success' },
            cancelled: { label: 'Cancelled', className: 'badge-error' }
        }
        const { label, className } = statusMap[status] || { label: status, className: 'badge-default' }
        return <span className={`badge ${className}`}>{label}</span>
    }

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            await updateOrder(orderId, { status: 'cancelled' })
        }
    }

    const hasNoData = subscriptions.length === 0 && orders.length === 0

    if (hasNoData) {
        return (
            <div className="page">
                <div className="container py-8">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Package size={40} />
                        </div>
                        <h2 className="empty-state-title">No Orders or Subscriptions Yet</h2>
                        <p className="empty-state-description">
                            Start your healthy journey by ordering fresh juices or subscribing for daily delivery.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/" className="btn btn-primary">
                                Order Now
                            </Link>
                            <Link to="/subscribe" className="btn btn-outline">
                                Subscribe
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="container py-8">
                <div className="page-header">
                    <h1 className="page-title">My Orders</h1>
                    <p className="page-subtitle">Manage your orders and subscriptions</p>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`dashboard-tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingBag size={18} />
                        Orders
                        {orders.length > 0 && <span className="tab-count">{orders.length}</span>}
                    </button>
                    <button
                        className={`dashboard-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subscriptions')}
                    >
                        <Package size={18} />
                        Subscriptions
                        {subscriptions.length > 0 && <span className="tab-count">{subscriptions.length}</span>}
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="tab-content">
                        {orders.length === 0 ? (
                            <div className="empty-state-small">
                                <ShoppingBag size={32} />
                                <p>No orders yet</p>
                                <Link to="/" className="btn btn-primary btn-sm">Order Now</Link>
                            </div>
                        ) : (
                            <>
                                {pendingOrders.length > 0 && (
                                    <section className="mb-8">
                                        <h2 className="section-title">Active Orders</h2>
                                        <div className="orders-list">
                                            {pendingOrders.map(order => (
                                                <div key={order.id} className="order-card card">
                                                    <div className="order-header">
                                                        <div className="order-info">
                                                            <span className="order-id">Order #{order.id}</span>
                                                            <span className="order-date">
                                                                {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                                                            </span>
                                                        </div>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                    <div className="order-items">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="order-item">
                                                                <span className="item-emoji">{item.image || '🍹'}</span>
                                                                <span className="item-name">{item.name}</span>
                                                                <span className="item-qty">x{item.quantity}</span>
                                                                <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="order-details">
                                                        <div className="detail-item">
                                                            <Clock size={16} />
                                                            <span>{getDeliveryTimeLabel(order.delivery_time)}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <MapPin size={16} />
                                                            <span>{order.customer_address}</span>
                                                        </div>
                                                    </div>
                                                    <div className="order-footer">
                                                        <div className="order-total">
                                                            <span>Total</span>
                                                            <strong>₹{Number(order.total).toLocaleString()}</strong>
                                                        </div>
                                                        {order.status === 'pending' && (
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                            >
                                                                <X size={16} /> Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {completedOrders.length > 0 && (
                                    <section>
                                        <h2 className="section-title">Past Orders</h2>
                                        <div className="orders-list">
                                            {completedOrders.map(order => (
                                                <div key={order.id} className="order-card card past">
                                                    <div className="order-header">
                                                        <div className="order-info">
                                                            <span className="order-id">Order #{order.id}</span>
                                                            <span className="order-date">
                                                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                    <div className="order-items compact">
                                                        {order.items.map((item, idx) => (
                                                            <span key={idx} className="compact-item">
                                                                {item.image || '🍹'} {item.name} x{item.quantity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="order-footer">
                                                        <div className="order-total">
                                                            <span>Total</span>
                                                            <strong>₹{Number(order.total).toLocaleString()}</strong>
                                                        </div>
                                                        <Link to="/" className="btn btn-primary btn-sm">
                                                            <RefreshCcw size={16} /> Reorder
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Subscriptions Tab */}
                {activeTab === 'subscriptions' && (
                    <div className="tab-content">
                        {subscriptions.length === 0 ? (
                            <div className="empty-state-small">
                                <Package size={32} />
                                <p>No subscriptions yet</p>
                                <Link to="/subscribe" className="btn btn-primary btn-sm">Subscribe Now</Link>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .dashboard-tabs {
                    display: flex;
                    gap: var(--space-2);
                    margin-bottom: var(--space-6);
                    background: var(--color-gray-100);
                    padding: var(--space-1);
                    border-radius: var(--radius-lg);
                    width: fit-content;
                }

                .dashboard-tab {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-4);
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    color: var(--color-gray-600);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .dashboard-tab:hover {
                    color: var(--color-gray-900);
                }

                .dashboard-tab.active {
                    background: white;
                    color: var(--color-primary);
                    box-shadow: var(--shadow-sm);
                }

                .tab-count {
                    background: var(--color-primary);
                    color: white;
                    font-size: var(--text-xs);
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 20px;
                    text-align: center;
                }

                .dashboard-tab.active .tab-count {
                    background: var(--color-primary-dark);
                }

                .tab-content {
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .empty-state-small {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-8);
                    color: var(--color-gray-500);
                    text-align: center;
                }

                .empty-state-small p {
                    margin: 0;
                }

                /* Orders styles */
                .orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .order-card {
                    padding: var(--space-5);
                }

                .order-card.past {
                    opacity: 0.75;
                }

                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-4);
                }

                .order-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .order-id {
                    font-weight: 600;
                    font-size: var(--text-base);
                }

                .order-date {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                }

                .order-items {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                    padding: var(--space-3);
                    background: var(--color-gray-50);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-4);
                }

                .order-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .item-emoji {
                    font-size: 24px;
                }

                .item-name {
                    flex: 1;
                    font-weight: 500;
                }

                .item-qty {
                    color: var(--color-gray-500);
                    font-size: var(--text-sm);
                }

                .item-price {
                    font-weight: 600;
                    color: var(--color-primary);
                }

                .order-items.compact {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: var(--space-3);
                    padding: var(--space-2) var(--space-3);
                }

                .compact-item {
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                }

                .order-details {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-4);
                    margin-bottom: var(--space-4);
                }

                .order-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--color-gray-200);
                }

                .order-total span {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                    display: block;
                }

                .order-total strong {
                    font-family: var(--font-display);
                    font-size: var(--text-xl);
                    color: var(--color-primary);
                }

                /* Subscriptions styles */
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

                /* Badge variants */
                .badge-warning {
                    background: #fef3c7;
                    color: #92400e;
                }

                .badge-info {
                    background: #dbeafe;
                    color: #1e40af;
                }

                @media (max-width: 768px) {
                    .dashboard-tabs {
                        width: 100%;
                    }

                    .dashboard-tab {
                        flex: 1;
                        justify-content: center;
                        padding: var(--space-3) var(--space-2);
                    }

                    .subscriptions-grid {
                        grid-template-columns: 1fr;
                    }

                    .order-details {
                        flex-direction: column;
                        gap: var(--space-2);
                    }
                }
            `}</style>
        </div>
    )
}

export default Dashboard
