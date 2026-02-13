import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

// Dev bypass user - for testing without Supabase auth
const DEV_BYPASS_PIN = '9999'
const DEV_USER = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'dev@juicebar.local',
    phone: '+919876543210',
    user_metadata: {
        name: 'Dev User',
        phone: '9876543210',
        address: '123 Dev Street, Test City, 123456',
        role: 'admin'
    },
    app_metadata: {
        role: 'admin'
    }
}

// Map raw API/Twilio errors to user-friendly messages
const getFriendlyErrorMessage = (rawMessage) => {
    const msg = (rawMessage || '').toLowerCase()

    if (msg.includes('twilio') || msg.includes('sms') || msg.includes('messaging service'))
        return 'SMS service is temporarily unavailable. Please try again later.'
    if (msg.includes('rate limit') || msg.includes('too many'))
        return 'Too many attempts. Please wait a few minutes and try again.'
    if (msg.includes('invalid') && msg.includes('phone'))
        return 'Please enter a valid phone number.'
    if (msg.includes('otp') || msg.includes('token') || msg.includes('expired'))
        return 'Invalid or expired OTP. Please try again.'
    if (msg.includes('not authorized') || msg.includes('not allowed'))
        return 'This phone number is not authorized. Please contact support.'
    if (msg.includes('network') || msg.includes('fetch'))
        return 'Network error. Please check your connection and try again.'
    if (msg.includes('verification') || msg.includes('verify'))
        return 'Verification failed. Please try again later.'
    if (msg.includes('user') && msg.includes('not found'))
        return 'Account not found. Please check your phone number.'
    
    return 'Something went wrong. Please try again later.'
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Check for dev bypass first
        if (localStorage.getItem('dev_bypass_active')) {
            setUser(DEV_USER)
            setLoading(false)
            return
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, metadata = {}) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            })
            if (error) throw error
            return { data, error: null }
        } catch (err) {
            setError(err.message)
            return { data: null, error: err.message }
        }
    }

    const signIn = async (email, password) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            return { data, error: null }
        } catch (err) {
            setError(err.message)
            return { data: null, error: err.message }
        }
    }

    const signOut = async () => {
        // Check if dev bypass is active
        if (localStorage.getItem('dev_bypass_active')) {
            localStorage.removeItem('dev_bypass_active')
            setUser(null)
            return { error: null }
        }

        try {
            setError(null)
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { error: null }
        } catch (err) {
            setError(err.message)
            return { error: err.message }
        }
    }

    const devLogin = (pin) => {
        if (pin === DEV_BYPASS_PIN) {
            setUser(DEV_USER)
            localStorage.setItem('dev_bypass_active', 'true')
            return true
        }
        return false
    }

    const resetPassword = async (email) => {
        try {
            setError(null)
            const { error } = await supabase.auth.resetPasswordForEmail(email)
            if (error) throw error
            return { error: null }
        } catch (err) {
            setError(err.message)
            return { error: err.message }
        }
    }

    const updateProfile = async (updates) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.updateUser({
                data: updates
            })
            if (error) throw error
            return { data, error: null }
        } catch (err) {
            setError(err.message)
            return { data: null, error: err.message }
        }
    }

    const signInWithPhone = async (phone) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.signInWithOtp({
                phone,
            })
            if (error) throw error
            return { data, error: null }
        } catch (err) {
            console.error('Phone auth error:', err.message)
            const friendlyMsg = getFriendlyErrorMessage(err.message)
            setError(friendlyMsg)
            throw new Error(friendlyMsg)
        }
    }

    const verifyOTP = async (phone, token) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            })
            if (error) throw error
            
            // Check if user needs to complete profile (new user without name or address)
            const hasName = data.user?.user_metadata?.name
            const hasAddress = data.user?.user_metadata?.address
            const needsProfile = !hasName || !hasAddress
            
            return needsProfile
        } catch (err) {
            console.error('OTP verify error:', err.message)
            const friendlyMsg = getFriendlyErrorMessage(err.message)
            setError(friendlyMsg)
            throw new Error(friendlyMsg)
        }
    }

    const updateUserProfile = async (updates) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.updateUser({
                data: updates
            })
            if (error) throw error
            return { data, error: null }
        } catch (err) {
            setError(err.message)
            throw new Error(err.message)
        }
    }

    const isAdmin = () => {
    const role = user?.user_metadata?.role || user?.app_metadata?.role
    return role === 'admin'
    }

    const value = {
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        signInWithPhone,
        verifyOTP,
        updateUserProfile,
        isAdmin,
        devLogin,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
