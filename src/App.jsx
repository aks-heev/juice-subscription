import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import InstallPrompt from './components/common/InstallPrompt'
import Home from './pages/Home'
import PhoneAuth from './pages/PhoneAuth'
import OTPVerification from './pages/OTPVerification'
import CompleteProfile from './pages/CompleteProfile'
import Subscribe from './pages/Subscribe'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import ComingSoon from './pages/ComingSoon'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import ProtectedRoute from './components/common/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './styles/ErrorBoundary.css'

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

    // Show navbar and bottom nav for guests on public pages, or logged in users with completed profile
    const showNav = !needsProfile

    return (
        <CartProvider>
            <ErrorBoundary>
            <div className="app">
                {showNav && <Navbar />}
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

                    {/* PUBLIC: Home page - anyone can browse and add to cart */}
                    <Route path="/" element={
                        user && needsProfile ? <Navigate to="/complete-profile" replace /> : <Home />
                    } />

                    {/* PUBLIC: Cart page - anyone can view cart, login required at checkout */}
                    <Route path="/cart" element={
                        user && needsProfile ? <Navigate to="/complete-profile" replace /> : <Cart />
                    } />

                    {/* PROTECTED: These require login */}
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
                    <Route path="/coming-soon" element={
                        <ProtectedRoute>
                            {needsProfile ? <Navigate to="/complete-profile" replace /> : <ComingSoon />}
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            {needsProfile ? <Navigate to="/complete-profile" replace /> : <Admin />}
                        </ProtectedRoute>
                    } />

                    {/* PUBLIC: Legal pages */}
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                </Routes>
                {showNav && <BottomNav />}
                <InstallPrompt />
            </div>
            </ErrorBoundary>
        </CartProvider>
    )
}

export default App
