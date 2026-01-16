import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Subscribe from './pages/Subscribe'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
    return (
        <div className="app">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/subscribe" element={
                    <ProtectedRoute>
                        <Subscribe />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        <Admin />
                    </ProtectedRoute>
                } />
            </Routes>
        </div>
    )
}

export default App
