import React, { useState } from 'react'
import { format, addDays, isWithinInterval, startOfToday, endOfDay, parseISO } from 'date-fns'
import { Users, Package, DollarSign, TrendingUp, Search, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Admin() {
    const { subscriptions, juices } = useApp()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Calculate stats
    const totalRevenue = subscriptions.reduce((sum, s) => sum + s.total, 0)
    const activeCount = subscriptions.filter(s => s.status === 'active').length
    const totalCustomers = new Set(subscriptions.map(s => s.customer.phone)).size

    const stats = [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'primary' },
        { label: 'Active Subscriptions', value: activeCount, icon: Package, color: 'success' },
        { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'secondary' },
        { label: 'Avg. Order Value', value: `₹${subscriptions.length ? Math.round(totalRevenue / subscriptions.length).toLocaleString() : 0}`, icon: TrendingUp, color: 'warning' }
    ]

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch =
            sub.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.customer.phone.includes(searchTerm) ||
            sub.juice.name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Juice popularity
    const juicePopularity = juices.map(juice => ({
        ...juice,
        count: subscriptions.filter(s => s.juice.id === juice.id).length
    })).sort((a, b) => b.count - a.count)

    // Calculate Upcoming Deliveries (Next 7 days)
    const generateUpcomingDeliveries = () => {
        const upcoming = []
        const today = startOfToday()
        const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

        subscriptions.filter(s => s.status === 'active').forEach(sub => {
            const startDate = parseISO(sub.customer.startDate)
            const durationDays = sub.plan.id.includes('weekly') ? 7 : 30
            const endDate = addDays(startDate, durationDays)

            next7Days.forEach(day => {
                if (isWithinInterval(day, { start: startDate, end: endDate })) {
                    upcoming.push({
                        id: `${sub.id}-${format(day, 'yyyy-MM-dd')}`,
                        date: day,
                        subscription: sub
                    })
                }
            })
        })

        const timeOrder = { morning: 1, afternoon: 2, evening: 3 }

        return upcoming.sort((a, b) => {
            const dateDiff = a.date.getTime() - b.date.getTime()
            if (dateDiff !== 0) return dateDiff
            return timeOrder[a.subscription.deliveryTime] - timeOrder[b.subscription.deliveryTime]
        })
    }

    const upcomingDeliveries = generateUpcomingDeliveries()

    return (
        <div className="page">
            <div className="container py-8">
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Manage subscriptions and view analytics</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className={`stat-card-icon ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="admin-content">
                    {/* Upcoming Deliveries Section */}
                    <section className="admin-section">
                        <div className="section-header">
                            <h2 className="section-title">Upcoming Deliveries (Next 7 Days)</h2>
                            <div className="badge badge-primary">{upcomingDeliveries.length} Deliveries</div>
                        </div>

                        {upcomingDeliveries.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <CalendarIcon size={40} />
                                </div>
                                <h3 className="empty-state-title">No Deliveries Scheduled</h3>
                                <p className="empty-state-description">
                                    There are no active subscriptions with deliveries in the next week.
                                </p>
                            </div>
                        ) : (
                            <div className="upcoming-deliveries-list">
                                {upcomingDeliveries.map(delivery => (
                                    <div key={delivery.id} className="delivery-row card">
                                        <div className="delivery-date-cell">
                                            <span className="date-day">{format(delivery.date, 'eee')}</span>
                                            <span className="date-number">{format(delivery.date, 'd MMM')}</span>
                                        </div>
                                        <div className="delivery-main">
                                            <div className="delivery-info">
                                                <div className="delivery-juice">
                                                    <span className="juice-emoji">{delivery.subscription.juice.image}</span>
                                                    <strong>{delivery.subscription.juice.name}</strong>
                                                </div>
                                                <div className="delivery-customer">
                                                    <Users size={14} />
                                                    <span>{delivery.subscription.customer.name}</span>
                                                </div>
                                            </div>
                                            <div className="delivery-meta">
                                                <div className="delivery-time">
                                                    <Clock size={14} />
                                                    <span className="text-capitalize">{delivery.subscription.deliveryTime}</span>
                                                </div>
                                                <div className="delivery-address">
                                                    <MapPin size={14} />
                                                    <span className="text-truncate">{delivery.subscription.customer.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="delivery-qty">
                                            <Package size={14} />
                                            <span>x{delivery.subscription.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Subscriptions Table */}
                    <section className="admin-section">
                        <div className="section-header">
                            <h2 className="section-title">All Subscriptions</h2>
                            <div className="table-controls">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone, or juice..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <select
                                    className="form-input form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {filteredSubscriptions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <Package size={40} />
                                </div>
                                <h3 className="empty-state-title">No Subscriptions Found</h3>
                                <p className="empty-state-description">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'No subscriptions have been made yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Juice</th>
                                            <th>Plan</th>
                                            <th>Start Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubscriptions.map(subscription => (
                                            <tr key={subscription.id}>
                                                <td>
                                                    <div className="customer-cell">
                                                        <strong>{subscription.customer.name}</strong>
                                                        <span className="text-sm text-muted">{subscription.customer.phone}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="juice-cell">
                                                        <span className="juice-emoji">{subscription.juice.image}</span>
                                                        {subscription.juice.name}
                                                    </div>
                                                </td>
                                                <td>{subscription.plan.name}</td>
                                                <td>{format(new Date(subscription.customer.startDate), 'MMM d, yyyy')}</td>
                                                <td className="font-semibold">₹{subscription.total.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge badge-${subscription.status === 'active' ? 'success' : 'error'}`}>
                                                        {subscription.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Juice Popularity */}
                    <section className="admin-section">
                        <h2 className="section-title">Juice Popularity</h2>
                        <div className="popularity-list">
                            {juicePopularity.map((juice, index) => (
                                <div key={juice.id} className="popularity-item card">
                                    <span className="popularity-rank">#{index + 1}</span>
                                    <span className="juice-emoji">{juice.image}</span>
                                    <div className="popularity-info">
                                        <strong>{juice.name}</strong>
                                        <span className={`badge badge-${juice.category}`}>{juice.category}</span>
                                    </div>
                                    <div className="popularity-count">
                                        <strong>{juice.count}</strong>
                                        <span>orders</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-6);
                    margin-bottom: var(--space-8);
                }

                .admin-content {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-8);
                }

                .upcoming-deliveries-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                    max-height: 500px;
                    overflow-y: auto;
                    padding-right: var(--space-2);
                    margin: 0 -var(--space-2);
                    padding: 0 var(--space-2);
                }

                .delivery-row {
                    display: flex;
                    align-items: center;
                    padding: var(--space-4);
                    gap: var(--space-6);
                }

                .delivery-row:hover {
                    transform: none;
                    background: var(--color-gray-50);
                }

                .delivery-date-cell {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 60px;
                    padding-right: var(--space-4);
                    border-right: 2px solid var(--color-gray-100);
                }

                .date-day {
                    font-size: var(--text-xs);
                    text-transform: uppercase;
                    color: var(--color-gray-500);
                    font-weight: var(--font-bold);
                }

                .date-number {
                    font-size: var(--text-sm);
                    font-weight: var(--font-bold);
                    color: var(--color-primary);
                }

                .delivery-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .delivery-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                }

                .delivery-juice {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .delivery-customer {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                }

                .delivery-meta {
                    display: flex;
                    gap: var(--space-6);
                }

                .delivery-time, .delivery-address, .delivery-qty {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    font-size: var(--text-xs);
                    color: var(--color-gray-500);
                }

                .text-capitalize {
                    text-transform: capitalize;
                }

                .text-truncate {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .admin-section {
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    padding: var(--space-6);
                    box-shadow: var(--shadow-card);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-6);
                    flex-wrap: wrap;
                    gap: var(--space-4);
                }

                .table-controls {
                    display: flex;
                    gap: var(--space-4);
                }

                .search-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-box svg {
                    position: absolute;
                    left: var(--space-3);
                    color: var(--color-gray-400);
                }

                .search-box input {
                    padding-left: var(--space-10);
                    min-width: 280px;
                }

                .customer-cell {
                    display: flex;
                    flex-direction: column;
                }

                .juice-cell {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .juice-cell .juice-emoji {
                    font-size: 24px;
                }

                .popularity-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .popularity-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    padding: var(--space-4);
                }

                .popularity-item:hover {
                    transform: none;
                }

                .popularity-rank {
                    font-family: var(--font-display);
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: var(--color-gray-400);
                    width: 40px;
                }

                .popularity-item .juice-emoji {
                    font-size: 32px;
                }

                .popularity-info {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .popularity-count {
                    text-align: right;
                }

                .popularity-count strong {
                    display: block;
                    font-family: var(--font-display);
                    font-size: var(--text-xl);
                    color: var(--color-primary);
                }

                .popularity-count span {
                    font-size: var(--text-xs);
                    color: var(--color-gray-500);
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .table-controls {
                        flex-direction: column;
                        width: 100%;
                    }
                    .search-box input {
                        min-width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}

export default Admin
