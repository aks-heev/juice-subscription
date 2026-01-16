import React from 'react'
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading, isAdmin } = useAuth()

    if (loading) {
        return <LoadingSpinner fullPage />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    adminOnly: PropTypes.bool
}

export default ProtectedRoute
