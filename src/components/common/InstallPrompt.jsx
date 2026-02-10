import React, { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import '../../styles/InstallPrompt.css'

function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches 
            || window.navigator.standalone 
            || document.referrer.includes('android-app://')
        
        setIsStandalone(standalone)

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
        setIsIOS(iOS)

        // Check if user dismissed the prompt before
        const dismissed = localStorage.getItem('installPromptDismissed')
        const dismissedTime = dismissed ? parseInt(dismissed) : 0
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

        // Show prompt again after 7 days
        if (dismissed && daysSinceDismissed < 7) {
            return
        }

        // Don't show if already installed
        if (standalone) {
            return
        }

        // For iOS, show custom prompt after a delay
        if (iOS) {
            const timer = setTimeout(() => {
                setShowPrompt(true)
            }, 3000)
            return () => clearTimeout(timer)
        }

        // For other browsers, listen for beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // Show prompt after a short delay
            setTimeout(() => {
                setShowPrompt(true)
            }, 3000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false)
            setDeferredPrompt(null)
            localStorage.removeItem('installPromptDismissed')
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (isIOS) {
            // Can't programmatically install on iOS, just show instructions
            return
        }

        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            
            if (outcome === 'accepted') {
                setShowPrompt(false)
            }
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('installPromptDismissed', Date.now().toString())
    }

    if (!showPrompt || isStandalone) {
        return null
    }

    return (
        <>
            {/* Backdrop */}
            <div className="install-prompt-backdrop" onClick={handleDismiss} />
            
            {/* Prompt */}
            <div className="install-prompt">
                <button className="install-prompt-close" onClick={handleDismiss}>
                    <X size={20} />
                </button>
                
                <div className="install-prompt-icon">
                    <span className="install-app-emoji">🍊</span>
                </div>
                
                <h3 className="install-prompt-title">Get the App!</h3>
                <p className="install-prompt-description">
                    Install Fresh Squeeze for a better experience with quick access and offline support.
                </p>

                {isIOS ? (
                    <div className="install-ios-instructions">
                        <p className="ios-step">
                            <span className="ios-step-num">1</span>
                            Tap the <strong>Share</strong> button <span className="ios-icon">⎙</span>
                        </p>
                        <p className="ios-step">
                            <span className="ios-step-num">2</span>
                            Scroll and tap <strong>"Add to Home Screen"</strong>
                        </p>
                        <p className="ios-step">
                            <span className="ios-step-num">3</span>
                            Tap <strong>"Add"</strong> to install
                        </p>
                    </div>
                ) : (
                    <button className="btn btn-primary install-btn" onClick={handleInstall}>
                        <Download size={20} />
                        Install App
                    </button>
                )}

                <button className="install-prompt-later" onClick={handleDismiss}>
                    Maybe later
                </button>
            </div>
        </>
    )
}

export default InstallPrompt
