import React from 'react'
import PropTypes from 'prop-types'
import '../../styles/LoadingSpinner.css'

function LoadingSpinner({ size = 'medium', fullPage = false }) {
    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large'
    }

    const spinner = (
        <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner"></div>
        </div>
    )

    if (fullPage) {
        return (
            <div className="loading-spinner-overlay">
                {spinner}
            </div>
        )
    }

    return spinner
}

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    fullPage: PropTypes.bool
}

export default LoadingSpinner
