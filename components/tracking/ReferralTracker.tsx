'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { storeReferralCode } from '@/lib/services/referralTrackingService'

/**
 * ReferralTracker Component
 *
 * Captures ?ref=CODE from URL and stores in cookie
 * Should be included in root layout for site-wide tracking
 */
export function ReferralTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if URL has ?ref= parameter
    const refCode = searchParams.get('ref')

    if (refCode) {
      // Store in cookie (30-day expiration)
      storeReferralCode(refCode)

      // Track click in backend (optional - can also do on server-side)
      trackClick(refCode)
    }
  }, [searchParams])

  return null // This component doesn't render anything
}

/**
 * Track click in backend API
 */
async function trackClick(referralCode: string) {
  try {
    await fetch('/api/affiliates/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referralCode,
        landingPage: window.location.pathname,
        referrerUrl: document.referrer || undefined,
        utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
      }),
    })
  } catch (error) {
    // Silent fail - don't interrupt user experience
    console.error('Failed to track click:', error)
  }
}
