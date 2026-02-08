import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext()

// Initial hardcoded juice data (used as fallback or for seeding)
const initialJuices = [
    {
        name: 'Green Goddess',
        description: 'Spinach, kale, apple, cucumber, lemon, ginger',
        price: 149,
        category: 'detox',
        image: '🥬',
        calories: 120,
        size: '500ml'
    },
    {
        name: 'Sunrise Boost',
        description: 'Orange, carrot, turmeric, ginger, lemon',
        price: 129,
        category: 'energy',
        image: '🍊',
        calories: 150,
        size: '500ml'
    },
    {
        name: 'Berry Shield',
        description: 'Blueberry, strawberry, acai, pomegranate, honey',
        price: 179,
        category: 'immunity',
        image: '🫐',
        calories: 180,
        size: '500ml'
    },
    {
        name: 'Tropical Breeze',
        description: 'Pineapple, mango, coconut water, mint',
        price: 139,
        category: 'refresh',
        image: '🍍',
        calories: 140,
        size: '500ml'
    },
    {
        name: 'Power Punch',
        description: 'Banana, peanut butter, oats, almond milk, honey',
        price: 199,
        category: 'protein',
        image: '💪',
        calories: 320,
        size: '500ml'
    },
    {
        name: 'Citrus Cleanse',
        description: 'Grapefruit, orange, lemon, lime, mint',
        price: 119,
        category: 'detox',
        image: '🍋',
        calories: 95,
        size: '500ml'
    }
]

const subscriptionPlans = [
    {
        id: 'trial-weekly',
        name: 'Trial Weekly',
        duration: '7 days',
        discount: 15,
        description: 'Try our service risk-free',
        type: 'single',
        isTrial: true
    },
    {
        id: 'weekly-single',
        name: 'Weekly Single Juice',
        duration: '7 days',
        discount: 10,
        description: 'Same juice daily for a week',
        type: 'single'
    },
    {
        id: 'weekly-variety',
        name: 'Weekly Variety Pack',
        duration: '7 days',
        discount: 12,
        description: 'Different juices every day',
        type: 'variety'
    },
    {
        id: 'monthly-single',
        name: 'Monthly Single Juice',
        duration: '30 days',
        discount: 20,
        description: 'Your favorite juice for a month',
        type: 'single'
    },
    {
        id: 'monthly-variety',
        name: 'Monthly Variety Pack',
        duration: '30 days',
        discount: 25,
        description: 'Maximum variety and savings',
        type: 'variety',
        isPopular: true
    }
]

export function AppProvider({ children }) {
    const { user, isAdmin } = useAuth()
    const [juices, setJuices] = useState([])
    const [subscriptions, setSubscriptions] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('juice_theme') || 'light'
        document.documentElement.setAttribute('data-theme', saved)
        return saved
    })

    // Fetch juices and subscriptions from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch juices
                const { data: juicesData, error: juicesError } = await supabase
                    .from('juices')
                    .select('*')

                if (juicesError) throw juicesError

                if (juicesData && juicesData.length > 0) {
                    setJuices(juicesData)
                } else {
                    // Fallback to initial data if table empty
                    setJuices(initialJuices.map((j, i) => ({ ...j, id: i + 1 })))
                }

                // Fetch subscriptions based on user role
                if (user) {
                    let subsQuery = supabase
                        .from('subscriptions')
                        .select('*, juices(*)')

                    // If not admin, filter by user_id
                    if (!isAdmin()) {
                        subsQuery = subsQuery.eq('user_id', user.id)
                    }

                    const { data: subsData, error: subsError } = await subsQuery

                    if (subsError) {
                        // If error is due to missing user_id column, fall back to fetching all
                        console.error('Error fetching subscriptions:', subsError)
                        setSubscriptions([])
                    } else {
                        // Map Supabase data to frontend structure
                        const mappedSubs = (subsData || []).map(s => {
                            // Find plan by ID
                            const planData = subscriptionPlans.find(p => p.id === s.plan_id) || {
                                id: s.plan_id,
                                name: s.plan_id
                            }
                            
                            return {
                                ...s,
                                juice: s.juices,
                                deliveryTime: s.delivery_time,
                                customer: {
                                    name: s.customer_name,
                                    phone: s.customer_phone,
                                    address: s.customer_address,
                                    startDate: s.start_date
                                },
                                plan: {
                                    id: planData.id,
                                    name: planData.name
                                }
                            }
                        })
                        setSubscriptions(mappedSubs)
                    }

                    // Fetch orders
                    let ordersQuery = supabase
                        .from('juice_orders')
                        .select('*')
                        .order('created_at', { ascending: false })

                    // If not admin, filter by user_id
                    if (!isAdmin()) {
                        ordersQuery = ordersQuery.eq('user_id', user.id)
                    }

                    const { data: ordersData, error: ordersError } = await ordersQuery

                    if (ordersError) {
                        console.error('Error fetching orders:', ordersError)
                        setOrders([])
                    } else {
                        setOrders(ordersData || [])
                    }
                } else {
                    // Clear subscriptions and orders if no user
                    setSubscriptions([])
                    setOrders([])
                }
            } catch (err) {
                console.error('Supabase fetch error:', err.message)
                // Fallback to sample data for juices only
                setJuices(initialJuices.map((j, i) => ({ ...j, id: i + 1 })))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, isAdmin])

    const addSubscription = async (subscription) => {
        if (!user) {
            throw new Error('You must be logged in to create a subscription')
        }

        try {
            const newSubData = {
                user_id: user.id,
                juice_id: subscription.juice.id,
                plan_id: subscription.plan.id,
                quantity: subscription.quantity,
                delivery_time: subscription.deliveryTime,
                customer_name: subscription.customer.name,
                customer_phone: subscription.customer.phone,
                customer_address: subscription.customer.address,
                start_date: subscription.customer.startDate,
                total: subscription.total,
                status: 'active'
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .insert([newSubData])
                .select('*, juices(*)')
                .single()

            if (error) throw error

            // Map the returned data point for state
            const planData = subscriptionPlans.find(p => p.id === data.plan_id) || subscription.plan
            const mappedNewSub = {
                ...data,
                juice: data.juices || subscription.juice,
                deliveryTime: data.delivery_time,
                customer: {
                    name: data.customer_name,
                    phone: data.customer_phone,
                    address: data.customer_address,
                    startDate: data.start_date
                },
                plan: {
                    id: planData.id,
                    name: planData.name
                }
            }

            setSubscriptions(prev => [...prev, mappedNewSub])
            return mappedNewSub
        } catch (err) {
            console.error('Error adding subscription:', err.message)
            throw err
        }
    }

    const addOrder = async (orderData) => {
        if (!user) {
            throw new Error('You must be logged in to place an order')
        }

        try {
            const newOrderData = {
                user_id: user.id,
                items: orderData.items,
                customer_name: orderData.customer_name,
                customer_phone: orderData.customer_phone,
                customer_address: orderData.customer_address,
                delivery_time: orderData.delivery_time,
                subtotal: orderData.subtotal,
                delivery_fee: orderData.delivery_fee,
                discount: orderData.discount || 0,
                coupon_code: orderData.coupon_code || null,
                total: orderData.total,
                status: 'pending'
            }

            const { data, error } = await supabase
                .from('juice_orders')
                .insert([newOrderData])
                .select()
                .single()

            if (error) throw error

            setOrders(prev => [data, ...prev])
            return data
        } catch (err) {
            console.error('Error placing order:', err.message)
            throw err
        }
    }

    const updateOrder = async (id, updates) => {
        try {
            const { error } = await supabase
                .from('juice_orders')
                .update(updates)
                .eq('id', id)

            if (error) throw error

            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, ...updates } : order
            ))
        } catch (err) {
            console.error('Error updating order:', err.message)
            throw err
        }
    }

    const updateSubscription = async (id, updates) => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .update(updates)
                .eq('id', id)

            if (error) throw error

            setSubscriptions(prev => prev.map(sub =>
                sub.id === id ? { ...sub, ...updates } : sub
            ))
        } catch (err) {
            console.error('Error updating subscription:', err.message)
            throw err
        }
    }

    const cancelSubscription = (id) => {
        return updateSubscription(id, { status: 'cancelled' })
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('juice_theme', newTheme)
    }

    const value = {
        juices,
        subscriptionPlans,
        subscriptions,
        orders,
        addSubscription,
        updateSubscription,
        cancelSubscription,
        addOrder,
        updateOrder,
        theme,
        toggleTheme,
        loading
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
