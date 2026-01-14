import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Subscribe from './pages/Subscribe'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

function App() {
    return (
        <div className="app">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </div>
    )
}

export default App
