import React, { createContext, useContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import '../../styles/Toast.css'

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}

ToastContainer.propTypes = {
    toasts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            message: PropTypes.string.isRequired,
            type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired
        })
    ).isRequired,
    removeToast: PropTypes.func.isRequired
}

function Toast({ toast, onClose }) {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    }

    const Icon = icons[toast.type]

    return (
        <div className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
                <Icon size={20} />
            </div>
            <p className="toast-message">{toast.message}</p>
            <button className="toast-close" onClick={onClose} aria-label="Close">
                <X size={18} />
            </button>
        </div>
    )
}

Toast.propTypes = {
    toast: PropTypes.shape({
        id: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired
}
