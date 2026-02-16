import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <span className="error-boundary-emoji">🍊</span>
                        <h1 className="error-boundary-title">Something went wrong</h1>
                        <p className="error-boundary-message">
                            We hit an unexpected error. Please try refreshing the page.
                        </p>
                        <button className="btn btn-primary" onClick={this.handleReload}>
                            Reload App
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
