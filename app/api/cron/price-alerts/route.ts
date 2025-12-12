import { NextResponse } from 'next/server'
import {
  shouldTriggerAlert,
  calculateSavings,
  generateBookingUrl,
  formatAlertNotification,
  type PriceAlert,
  type AlertNotification
} from '@/lib/growth/price-alerts'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Mock function to get active alerts - replace with actual DB query
async function getActiveAlerts(): Promise<PriceAlert[]> {
  // In production, fetch from database
  return []
}

// Mock function to get current price - replace with actual price API
async function getCurrentPrice(origin: string, destination: string): Promise<number> {
  // In production, fetch from flight search API
  return Math.floor(Math.random() * 500) + 200
}

// Mock function to send notification
async function sendNotification(notification: AlertNotification): Promise<void> {
  const formatted = formatAlertNotification(notification)
  console.log('Sending notification:', formatted.email.subject)
  // In production, send via email/push service
}

// Mock function to update alert status
async function updateAlertStatus(alertId: string, status: string, triggeredAt?: Date): Promise<void> {
  console.log(`Updating alert ${alertId} to ${status}`)
  // In production, update in database
}

export async function POST() {
  try {
    const alerts = await getActiveAlerts()
    let processed = 0
    let triggered = 0
    const errors: string[] = []

    for (const alert of alerts) {
      try {
        processed++

        const currentPrice = await getCurrentPrice(alert.origin, alert.destination)

        if (shouldTriggerAlert(alert, currentPrice)) {
          const savings = calculateSavings(alert.currentPrice, currentPrice)

          const notification: AlertNotification = {
            alertId: alert.id,
            userId: alert.userId,
            type: 'price_drop',
            currentPrice,
            previousPrice: alert.currentPrice,
            savings: savings.amount,
            savingsPercent: savings.percent,
            bookingUrl: generateBookingUrl(alert)
          }

          await sendNotification(notification)
          await updateAlertStatus(alert.id, 'triggered', new Date())
          triggered++
        }
      } catch (err) {
        errors.push(`Alert ${alert.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      triggered,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Price alerts cron error:', error)
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
