import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import PhoneAuth from './pages/PhoneAuth'
import OTPVerification from './pages/OTPVerification'
import CompleteProfile from './pages/CompleteProfile'
import Subscribe from './pages/Subscribe'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function App() {
    const { user, loading } = useAuth()

    // Check if user needs to complete profile
    const needsProfile = user && (!user.user_metadata?.name || !user.user_metadata?.address)

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div className="app">
            {user && !needsProfile && <Navbar />}
            <Routes>
                {/* Public routes for phone authentication */}
                <Route path="/phone-auth" element={
                    user ? (needsProfile ? <Navigate to="/complete-profile" replace /> : <Navigate to="/" replace />) : <PhoneAuth />
                } />
                <Route path="/verify-otp" element={
                    !user ? <OTPVerification /> : (needsProfile ? <Navigate to="/complete-profile" replace /> : <Navigate to="/" replace />)
                } />
                <Route path="/complete-profile" element={
                    user ? (needsProfile ? <CompleteProfile /> : <Navigate to="/" replace />) : <Navigate to="/phone-auth" replace />
                } />

                {/* Main app routes */}
                <Route path="/" element={
                    !user ? <Navigate to="/phone-auth" replace /> : (needsProfile ? <Navigate to="/complete-profile" replace /> : <Home />)
                } />
                <Route path="/subscribe" element={
                    <ProtectedRoute>
                        {needsProfile ? <Navigate to="/complete-profile" replace /> : <Subscribe />}
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        {needsProfile ? <Navigate to="/complete-profile" replace /> : <Dashboard />}
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        {needsProfile ? <Navigate to="/complete-profile" replace /> : <Profile />}
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        {needsProfile ? <Navigate to="/complete-profile" replace /> : <Admin />}
                    </ProtectedRoute>
                } />
            </Routes>
            {user && !needsProfile && <BottomNav />}
        </div>
    )
}

export default App
