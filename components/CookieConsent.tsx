'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('cookie-consent')
    if (!hasConsent) {
      setShowConsent(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowConsent(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-40">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <p className="mb-2">
            We use cookies to enhance your experience. By continuing to browse this site, you agree to our use of cookies.
          </p>
          <p className="text-xs text-gray-400">
            Read our <a href="/privacy-policy" className="underline hover:text-gray-200">Privacy Policy</a> for more information.
          </p>
        </div>
        <div className="flex gap-2 whitespace-nowrap">
          <button
            onClick={handleReject}
            aria-label="Reject cookies"
            className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            aria-label="Accept cookies"
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
