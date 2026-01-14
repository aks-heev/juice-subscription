import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

// Sample juice data
const juices = [
    {
        id: 1,
        name: 'Green Goddess',
        description: 'Spinach, kale, apple, cucumber, lemon, ginger',
        price: 149,
        category: 'detox',
        image: '🥬',
        calories: 120,
        size: '500ml'
    },
    {
        id: 2,
        name: 'Sunrise Boost',
        description: 'Orange, carrot, turmeric, ginger, lemon',
        price: 129,
        category: 'energy',
        image: '🍊',
        calories: 150,
        size: '500ml'
    },
    {
        id: 3,
        name: 'Berry Shield',
        description: 'Blueberry, strawberry, acai, pomegranate, honey',
        price: 179,
        category: 'immunity',
        image: '🫐',
        calories: 180,
        size: '500ml'
    },
    {
        id: 4,
        name: 'Tropical Breeze',
        description: 'Pineapple, mango, coconut water, mint',
        price: 139,
        category: 'refresh',
        image: '🍍',
        calories: 140,
        size: '500ml'
    },
    {
        id: 5,
        name: 'Power Punch',
        description: 'Banana, peanut butter, oats, almond milk, honey',
        price: 199,
        category: 'protein',
        image: '💪',
        calories: 320,
        size: '500ml'
    },
    {
        id: 6,
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
        id: 'weekly',
        name: 'Weekly Plan',
        duration: '7 days',
        discount: 10,
        description: 'Perfect for trying out our service'
    },
    {
        id: 'monthly',
        name: 'Monthly Plan',
        duration: '30 days',
        discount: 20,
        description: 'Our most popular plan'
    }
]

export function AppProvider({ children }) {
    const [user, setUser] = useState(null)
    const [subscriptions, setSubscriptions] = useState([])
    const [cart, setCart] = useState([])
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        // Load saved data from localStorage
        const savedUser = localStorage.getItem('juice_user')
        const savedSubscriptions = localStorage.getItem('juice_subscriptions')
        const savedTheme = localStorage.getItem('juice_theme')

        if (savedUser) setUser(JSON.parse(savedUser))
        if (savedSubscriptions) setSubscriptions(JSON.parse(savedSubscriptions))
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.setAttribute('data-theme', savedTheme)
        }
    }, [])

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('juice_user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('juice_user')
    }

    const addSubscription = (subscription) => {
        const newSubscription = {
            ...subscription,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'active'
        }
        const updated = [...subscriptions, newSubscription]
        setSubscriptions(updated)
        localStorage.setItem('juice_subscriptions', JSON.stringify(updated))
        return newSubscription
    }

    const updateSubscription = (id, updates) => {
        const updated = subscriptions.map(sub =>
            sub.id === id ? { ...sub, ...updates } : sub
        )
        setSubscriptions(updated)
        localStorage.setItem('juice_subscriptions', JSON.stringify(updated))
    }

    const cancelSubscription = (id) => {
        updateSubscription(id, { status: 'cancelled' })
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('juice_theme', newTheme)
    }

    const value = {
        user,
        login,
        logout,
        juices,
        subscriptionPlans,
        subscriptions,
        addSubscription,
        updateSubscription,
        cancelSubscription,
        cart,
        setCart,
        theme,
        toggleTheme
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
