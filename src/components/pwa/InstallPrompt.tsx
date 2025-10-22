'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [_platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios')
    } else if (/android/.test(userAgent)) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay to avoid being too aggressive
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal in localStorage to avoid showing too frequently
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or dismissed recently
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  // Check if user dismissed recently (within 7 days)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed')
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl border border-white/20 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Install AnimeSenpai</h3>
                <p className="text-white/80 text-xs">Get the full app experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <Smartphone className="w-3 h-3" />
              <span>Track your anime progress</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <Monitor className="w-3 h-3" />
              <span>Sync across all devices</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-white/90 transition-colors"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// iOS-specific install instructions
export function IOSInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    if (isIOS && !isStandalone) {
      setShowInstructions(true)
    }
  }, [])

  if (!showInstructions) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl border border-white/20 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Install AnimeSenpai</h3>
                <p className="text-white/80 text-xs">Add to your home screen</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <span>1. Tap the share button</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <span>2. Scroll down and tap "Add to Home Screen"</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <span>3. Tap "Add" to install</span>
            </div>
          </div>

          <button
            onClick={() => setShowInstructions(false)}
            className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-white/90 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
