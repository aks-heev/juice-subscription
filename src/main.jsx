import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter>
            <AuthProvider>
                <LocationProvider>
                    <ToastProvider>
                        <AppProvider>
                            <App />
                        </AppProvider>
                    </ToastProvider>
                </LocationProvider>
            </AuthProvider>
        </HashRouter>
    </React.StrictMode>,
)
