import React, { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import '../../styles/InstallPrompt.css'

function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isIOS, setIsIOS] = useState(false)
    const [isAndroid, setIsAndroid] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches 
            || window.navigator.standalone 
            || document.referrer.includes('android-app://')
        
        setIsStandalone(standalone)

        // Don't show if already installed
        if (standalone) return

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
        setIsIOS(iOS)

        // Check if Android
        const android = /Android/.test(navigator.userAgent)
        setIsAndroid(android)

        // Check if mobile
        const isMobile = iOS || android || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

        // Check if user dismissed the prompt before
        const dismissed = localStorage.getItem('installPromptDismissed')
        const dismissedTime = dismissed ? parseInt(dismissed) : 0
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

        // Show prompt again after 7 days
        if (dismissed && daysSinceDismissed < 7) return

        // For Android, listen for beforeinstallprompt first
        let promptShown = false
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            promptShown = true
            setTimeout(() => setShowPrompt(true), 2000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Fallback: if beforeinstallprompt doesn't fire within 3s, show manual instructions
        const fallbackTimer = setTimeout(() => {
            if (!promptShown && isMobile) {
                setShowPrompt(true)
            }
        }, 3000)

        // Listen for successful install
        const handleAppInstalled = () => {
            setShowPrompt(false)
            setDeferredPrompt(null)
            localStorage.removeItem('installPromptDismissed')
        }
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
            clearTimeout(fallbackTimer)
        }
    }, [])

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') setShowPrompt(false)
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('installPromptDismissed', Date.now().toString())
    }

    if (!showPrompt || isStandalone) return null

    // Determine which instructions to show
    const showNativeInstall = deferredPrompt !== null
    const showIOSInstructions = isIOS && !showNativeInstall
    const showAndroidInstructions = isAndroid && !showNativeInstall

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
                    Install Fresh Squeeze for a better experience with quick access.
                </p>

                {showNativeInstall && (
                    <button className="btn btn-primary install-btn" onClick={handleInstall}>
                        <Download size={20} />
                        Install App
                    </button>
                )}

                {showIOSInstructions && (
                    <div className="install-ios-instructions">
                        <p className="ios-step">
                            <span className="ios-step-num">1</span>
                            Tap the <strong>Share</strong> button <span className="ios-share-icon">↑</span>
                        </p>
                        <p className="ios-step">
                            <span className="ios-step-num">2</span>
                            Tap <strong>"Add to Home Screen"</strong>
                        </p>
                        <p className="ios-step">
                            <span className="ios-step-num">3</span>
                            Tap <strong>"Add"</strong>
                        </p>
                    </div>
                )}

                {showAndroidInstructions && (
                    <div className="install-ios-instructions">
                        <p className="ios-step">
                            <span className="ios-step-num">1</span>
                            Tap <strong>⋮ menu</strong> (top right)
                        </p>
                        <p className="ios-step">
                            <span className="ios-step-num">2</span>
                            Tap <strong>"Add to Home screen"</strong>
                        </p>
                        <p className="ios-step">
                            <span className="ios-step-num">3</span>
                            Tap <strong>"Add"</strong>
                        </p>
                    </div>
                )}

                <button className="install-prompt-later" onClick={handleDismiss}>
                    Maybe later
                </button>
            </div>
        </>
    )
}

export default InstallPrompt
