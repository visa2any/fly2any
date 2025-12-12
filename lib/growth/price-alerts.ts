/**
 * Price Alert System
 *
 * Users can set price alerts for routes and get notified
 * when prices drop below their target.
 */

export interface PriceAlert {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  targetPrice: number;
  currentPrice: number;
  lowestPrice: number;
  departureDate?: string;
  returnDate?: string;
  isOneWay: boolean;
  status: 'active' | 'triggered' | 'expired' | 'paused';
  notificationChannels: ('email' | 'push' | 'sms')[];
  createdAt: Date;
  triggeredAt?: Date;
  expiresAt: Date;
}

export interface PriceHistory {
  alertId: string;
  price: number;
  checkedAt: Date;
}

export interface AlertNotification {
  alertId: string;
  userId: string;
  type: 'price_drop' | 'price_match' | 'expiring_soon';
  currentPrice: number;
  previousPrice: number;
  savings: number;
  savingsPercent: number;
  bookingUrl: string;
}

const MAX_ALERTS_PER_USER = 10;
const DEFAULT_ALERT_DURATION_DAYS = 30;

/**
 * Create price alert configuration
 */
export function createAlertConfig(params: {
  origin: string;
  destination: string;
  targetPrice: number;
  currentPrice: number;
  departureDate?: string;
  returnDate?: string;
  channels?: ('email' | 'push' | 'sms')[];
}): Omit<PriceAlert, 'id' | 'userId' | 'createdAt'> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEFAULT_ALERT_DURATION_DAYS);

  return {
    origin: params.origin.toUpperCase(),
    destination: params.destination.toUpperCase(),
    targetPrice: params.targetPrice,
    currentPrice: params.currentPrice,
    lowestPrice: params.currentPrice,
    departureDate: params.departureDate,
    returnDate: params.returnDate,
    isOneWay: !params.returnDate,
    status: 'active',
    notificationChannels: params.channels || ['email', 'push'],
    expiresAt,
  };
}

/**
 * Check if price meets alert threshold
 */
export function shouldTriggerAlert(
  alert: PriceAlert,
  currentPrice: number
): boolean {
  return currentPrice <= alert.targetPrice && alert.status === 'active';
}

/**
 * Calculate savings from alert trigger
 */
export function calculateSavings(
  originalPrice: number,
  currentPrice: number
): { amount: number; percent: number } {
  const amount = originalPrice - currentPrice;
  const percent = Math.round((amount / originalPrice) * 100);
  return { amount, percent };
}

/**
 * Generate booking URL for triggered alert
 */
export function generateBookingUrl(alert: PriceAlert): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
  const params = new URLSearchParams({
    from: alert.origin,
    to: alert.destination,
    ...(alert.departureDate && { departure: alert.departureDate }),
    ...(alert.returnDate && { return: alert.returnDate }),
    source: 'price_alert',
    alertId: alert.id,
  });
  return `${baseUrl}/flights/search?${params}`;
}

/**
 * Format alert notification for different channels
 */
export function formatAlertNotification(notification: AlertNotification) {
  const { currentPrice, previousPrice, savings, savingsPercent, bookingUrl } = notification;

  return {
    email: {
      subject: `Price Drop Alert: Save $${savings} on your flight!`,
      preheader: `Prices dropped ${savingsPercent}% - Book now before they go back up!`,
      body: `
        Great news! The flight you're tracking just dropped in price.

        New Price: $${currentPrice}
        Previous Price: $${previousPrice}
        You Save: $${savings} (${savingsPercent}% off)

        Book now before prices go back up!
      `,
      cta: 'Book Now',
      ctaUrl: bookingUrl,
    },

    push: {
      title: `Price Drop: $${currentPrice}`,
      body: `Save $${savings} (${savingsPercent}% off) on your tracked flight!`,
      icon: '/icons/price-alert.png',
      url: bookingUrl,
    },

    sms: `Fly2Any Alert: Your tracked flight dropped to $${currentPrice} (save $${savings}). Book: ${bookingUrl}`,
  };
}

/**
 * Get smart price suggestions based on route
 */
export function getSmartPriceSuggestions(
  currentPrice: number,
  historicalPrices: number[]
): { aggressive: number; moderate: number; conservative: number } {
  const avgPrice = historicalPrices.length
    ? historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length
    : currentPrice;
  const minPrice = historicalPrices.length
    ? Math.min(...historicalPrices)
    : currentPrice * 0.7;

  return {
    aggressive: Math.round(minPrice * 0.95), // 5% below historical min
    moderate: Math.round(avgPrice * 0.85), // 15% below average
    conservative: Math.round(currentPrice * 0.9), // 10% below current
  };
}

/**
 * Viral share content for price alerts
 */
export function getAlertShareContent(alert: PriceAlert) {
  const { origin, destination, targetPrice } = alert;
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/alerts?route=${origin}-${destination}`;

  return {
    twitter: `I'm tracking ${origin} to ${destination} flights for $${targetPrice} on @Fly2Any. Create your own price alert: ${link}`,

    message: `I'm tracking flights from ${origin} to ${destination} for $${targetPrice}. Set up your own alert: ${link}`,
  };
}

// Alert check frequency
export const ALERT_CHECK_INTERVALS = {
  highPriority: 15 * 60 * 1000, // 15 minutes (departing soon)
  normal: 60 * 60 * 1000, // 1 hour
  lowPriority: 4 * 60 * 60 * 1000, // 4 hours (far out dates)
};

export function getCheckInterval(alert: PriceAlert): number {
  if (!alert.departureDate) return ALERT_CHECK_INTERVALS.normal;

  const daysUntilDeparture = Math.floor(
    (new Date(alert.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDeparture <= 7) return ALERT_CHECK_INTERVALS.highPriority;
  if (daysUntilDeparture <= 30) return ALERT_CHECK_INTERVALS.normal;
  return ALERT_CHECK_INTERVALS.lowPriority;
}
