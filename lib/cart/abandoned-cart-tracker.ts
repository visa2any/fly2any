/**
 * ABANDONED CART TRACKER
 * =======================
 * Tracks incomplete bookings for recovery campaigns
 * Expected Impact: +$15-25K monthly (10-15% recovery rate)
 */

export interface AbandonedCart {
  id: string;
  userId: string;
  sessionId: string;
  email?: string;
  phone?: string;

  // Flight data
  flightData: {
    id: string;
    route: string;
    airline: string;
    departureDate: string;
    returnDate?: string;
    price: number;
    currency: string;
  };

  // Search context
  searchData: {
    from: string;
    to: string;
    adults: number;
    children: number;
    class: string;
  };

  // Abandonment context
  step: 'results' | 'booking' | 'payment';
  totalPrice: number;
  currency: string;
  selectedAddOns?: string[];
  selectedBundle?: string;

  // Timestamps
  createdAt: Date;
  lastActivity: Date;
  abandonedAt: Date;

  // Recovery status
  recovered: boolean;
  recoveryEmailSent: boolean;
  recoveryEmailSentAt?: Date;
  recoveredAt?: Date;
  recoveryOrderId?: string;
}

export interface RecoveryEmail {
  to: string;
  subject: string;
  flightDetails: string;
  priceInfo: string;
  urgencyMessage: string;
  recoveryLink: string;
  incentive?: string;
}

export class AbandonedCartTracker {
  /**
   * Track cart abandonment
   */
  async trackAbandonment(cart: Omit<AbandonedCart, 'abandonedAt' | 'recovered' | 'recoveryEmailSent'>): Promise<void> {
    const fullCart: AbandonedCart = {
      ...cart,
      abandonedAt: new Date(),
      recovered: false,
      recoveryEmailSent: false,
    };

    try {
      await fetch('/api/cart/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullCart),
      });

      console.log(`🛒 Tracked abandoned cart: ${cart.id} at step "${cart.step}"`);
    } catch (error) {
      console.error('Failed to track abandoned cart:', error);
    }
  }

  /**
   * Update cart activity (user still engaged)
   */
  async updateActivity(cartId: string): Promise<void> {
    try {
      await fetch('/api/cart/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          lastActivity: new Date(),
        }),
      });
    } catch (error) {
      console.error('Failed to update cart activity:', error);
    }
  }

  /**
   * Check if cart should trigger recovery email
   */
  shouldSendRecovery(cart: AbandonedCart): boolean {
    // Must have email
    if (!cart.email) return false;

    // Already recovered
    if (cart.recovered) return false;

    // Already sent recovery email
    if (cart.recoveryEmailSent) return false;

    // Calculate hours since abandonment
    const hoursSinceAbandonment =
      (Date.now() - cart.abandonedAt.getTime()) / (1000 * 60 * 60);

    // Send after 2 hours but before 48 hours
    return hoursSinceAbandonment >= 2 && hoursSinceAbandonment <= 48;
  }

  /**
   * Calculate recovery priority score (0-100)
   */
  calculatePriority(cart: AbandonedCart): number {
    let score = 50; // Base score

    // Higher value = higher priority
    if (cart.totalPrice > 500) score += 20;
    else if (cart.totalPrice > 300) score += 10;

    // Further in funnel = higher priority
    if (cart.step === 'payment') score += 25;
    else if (cart.step === 'booking') score += 15;

    // Recent abandonment = higher priority
    const hoursAgo = (Date.now() - cart.abandonedAt.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 4) score += 10;

    // Has add-ons = higher intent
    if (cart.selectedAddOns && cart.selectedAddOns.length > 0) score += 10;

    return Math.min(100, score);
  }

  /**
   * Generate recovery email content
   */
  generateRecoveryEmail(cart: AbandonedCart): RecoveryEmail {
    const { flightData, totalPrice, currency, step } = cart;

    // Personalized subject based on abandonment stage
    let subject = '';
    if (step === 'payment') {
      subject = `Complete your booking: ${flightData.route} - ${currency} ${totalPrice}`;
    } else if (step === 'booking') {
      subject = `Your flight is waiting: ${flightData.route}`;
    } else {
      subject = `Still looking for flights to ${cart.searchData.to}?`;
    }

    // Flight details
    const flightDetails = `
      Route: ${flightData.route}
      Airline: ${flightData.airline}
      Departure: ${new Date(flightData.departureDate).toLocaleDateString()}
      ${flightData.returnDate ? `Return: ${new Date(flightData.returnDate).toLocaleDateString()}` : ''}
    `.trim();

    // Price info
    const priceInfo = `Total: ${currency} ${totalPrice.toFixed(2)}`;

    // Urgency message
    const urgencyMessage = this.getUrgencyMessage(step);

    // Recovery link (includes cart ID for pre-filling)
    const recoveryLink = `${process.env.NEXT_PUBLIC_APP_URL}/flights/booking?recover=${cart.id}`;

    // Incentive (for high-value carts)
    let incentive;
    if (totalPrice > 500) {
      incentive = 'Complete your booking in the next 24 hours and get priority boarding!';
    }

    return {
      to: cart.email!,
      subject,
      flightDetails,
      priceInfo,
      urgencyMessage,
      recoveryLink,
      incentive,
    };
  }

  /**
   * Get urgency message based on abandonment stage
   */
  private getUrgencyMessage(step: string): string {
    if (step === 'payment') {
      return 'Your seats are reserved for 2 more hours. Complete your booking now to secure your price!';
    } else if (step === 'booking') {
      return 'Prices for this route are rising. Book now to lock in your price!';
    } else {
      return 'We found great deals for your search. Check them out before they\'re gone!';
    }
  }

  /**
   * Mark cart as recovered
   */
  async markRecovered(cartId: string, orderId: string): Promise<void> {
    try {
      await fetch('/api/cart/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          orderId,
          recoveredAt: new Date(),
        }),
      });

      console.log(`✅ Cart ${cartId} recovered with order ${orderId}`);
    } catch (error) {
      console.error('Failed to mark cart as recovered:', error);
    }
  }
}

// Singleton instance
export const abandonedCartTracker = new AbandonedCartTracker();
