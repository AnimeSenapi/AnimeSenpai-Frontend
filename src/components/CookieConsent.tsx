'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { X, Cookie, Shield, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean // Always true, can't be disabled
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    savePreferences(allPreferences)
    setIsVisible(false)
  }

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    savePreferences(necessaryOnly)
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
    setIsVisible(false)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    const consentData = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0', // For future consent updates
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    
    // Dispatch event for analytics/tracking initialization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent-updated', { 
        detail: prefs 
      }))
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Main Banner */}
          {!showDetails ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Cookie Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <Cookie className="h-6 w-6 text-cyan-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-2">
                    🍪 We value your privacy
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    We use cookies to enhance your experience, analyze site traffic, and provide personalized content. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Customize
                    </button>
                    {' '}or read our{' '}
                    <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold"
                    >
                      Accept All Cookies
                    </Button>
                    <Button
                      onClick={handleAcceptNecessary}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Necessary Only
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleAcceptNecessary}
                  className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  aria-label="Close and accept necessary cookies only"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Settings */
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Settings className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cookie Preferences</h3>
                    <p className="text-sm text-gray-400">Choose which cookies you want to allow</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Necessary Cookies</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          Essential for the website to function properly. These cannot be disabled as they are required for authentication, security, and basic functionality.
                        </p>
                        <p className="text-xs text-gray-500">
                          Examples: Session tokens, authentication, security preferences
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                        Always Active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <BarChart3 className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Analytics Cookies</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          Help us understand how you use our site so we can improve your experience. We use these to track page views, session duration, and feature usage.
                        </p>
                        <p className="text-xs text-gray-500">
                          Examples: Google Analytics, Vercel Analytics, performance monitoring
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-pink-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preferences Cookies */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Settings className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Preference Cookies</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          Remember your settings and preferences like theme, language, and display options for a personalized experience.
                        </p>
                        <p className="text-xs text-gray-500">
                          Examples: Theme preference, language selection, layout settings
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.preferences}
                          onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-pink-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Cookie className="h-5 w-5 text-pink-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Marketing Cookies</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          Used to deliver relevant advertisements and track campaign effectiveness. We may share this data with advertising partners.
                        </p>
                        <p className="text-xs text-gray-500">
                          Examples: Ad targeting, conversion tracking, social media integration
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-pink-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Details View */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold"
                >
                  Save My Preferences
                </Button>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              </div>

              {/* Legal Links */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-gray-400">
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('cookie-consent')
                    setIsVisible(true)
                    setShowDetails(false)
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Reset Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper hook to check if specific cookie consent is granted
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    const loadConsent = () => {
      const stored = localStorage.getItem('cookie-consent')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          setConsent(data.preferences)
        } catch {
          // Invalid data, ignore
        }
      }
    }

    loadConsent()

    // Listen for consent updates
    const handleConsentUpdate = (e: CustomEvent) => {
      setConsent(e.detail)
    }

    window.addEventListener('cookie-consent-updated', handleConsentUpdate as EventListener)
    
    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate as EventListener)
    }
  }, [])

  return consent
}

// Helper function to check if analytics is allowed (for GA, etc.)
export function canUseAnalytics(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) return false
    
    const data = JSON.parse(stored)
    return data.preferences?.analytics === true
  } catch {
    return false
  }
}

// Helper function to check if marketing is allowed
export function canUseMarketing(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) return false
    
    const data = JSON.parse(stored)
    return data.preferences?.marketing === true
  } catch {
    return false
  }
}

