/**
 * Revenue Management System
 * 
 * Implements REAL LiteAPI revenue management features:
 * - Margin (commission percentage)
 * - AdditionalMarkup (extra commission)
 * - Suggested Selling Price (SSP) compliance
 * - Closed User Groups (CUGs) for discounted rates
 */

export interface RevenueParams {
  margin?: number; // Commission percentage (0 = net rates, 15 = 15% commission)
  additionalMarkup?: number; // Additional markup percentage on top of default
  respectSSP?: boolean; // Whether to respect Suggested Selling Price
  userGroup?: 'public' | 'cug' | 'member'; // User group for rate access
}

export interface RateWithRevenue {
  originalRate: number;
  margin: number;
  additionalMarkup: number;
  finalSellingPrice: number;
  suggestedSellingPrice: number;
  commission: number;
  totalMarkup: number;
  canDisplay: boolean;
  displayRestrictions?: string[];
}

export class RevenueManager {
  private defaultMargin: number;
  private maxMarginAllowed: number;
  private sspViolationThreshold: number;

  constructor(config?: {
    defaultMargin?: number;
    maxMarginAllowed?: number;
    sspViolationThreshold?: number;
  }) {
    this.defaultMargin = config?.defaultMargin || 10; // 10% default
    this.maxMarginAllowed = config?.maxMarginAllowed || 30; // Max 30%
    this.sspViolationThreshold = config?.sspViolationThreshold || 0.95; // 5% below SSP
  }

  /**
   * Calculate rate with revenue management
   */
  calculateRate(
    baseRate: number,
    suggestedSellingPrice: number,
    params: RevenueParams = {}
  ): RateWithRevenue {
    // Use provided margin or default
    const margin = params.margin !== undefined ? params.margin : this.defaultMargin;
    const additionalMarkup = params.additionalMarkup || 0;
    
    // Validate margin limits
    const finalMargin = Math.min(margin, this.maxMarginAllowed);
    
    // Calculate commission amount
    const commission = (baseRate * finalMargin) / 100;
    
    // Calculate additional markup amount
    const additionalMarkupAmount = (baseRate * additionalMarkup) / 100;
    
    // Calculate final selling price
    const totalMarkup = finalMargin + additionalMarkup;
    const finalSellingPrice = baseRate + commission + additionalMarkupAmount;
    
    // Check SSP compliance
    const respectSSP = params.respectSSP !== false; // Default true
    const belowSSPThreshold = finalSellingPrice < (suggestedSellingPrice * this.sspViolationThreshold);
    
    // Determine display restrictions
    const displayRestrictions: string[] = [];
    let canDisplay = true;
    
    if (respectSSP && belowSSPThreshold && params.userGroup === 'public') {
      canDisplay = false;
      displayRestrictions.push('Rate below SSP - requires CUG access');
    }
    
    if (finalMargin > this.maxMarginAllowed) {
      displayRestrictions.push(`Margin exceeds maximum allowed (${this.maxMarginAllowed}%)`);
    }
    
    return {
      originalRate: baseRate,
      margin: finalMargin,
      additionalMarkup,
      finalSellingPrice: Math.round(finalSellingPrice * 100) / 100,
      suggestedSellingPrice,
      commission: Math.round(commission * 100) / 100,
      totalMarkup: Math.round(totalMarkup * 100) / 100,
      canDisplay,
      displayRestrictions: displayRestrictions.length > 0 ? displayRestrictions : undefined
    };
  }

  /**
   * Apply revenue management to hotel rates array
   */
  applyRevenueManagement(
    rates: Array<{
      id: string;
      price: { amount: number; currency: string };
      suggestedSellingPrice?: number;
      [key: string]: any;
    }>,
    params: RevenueParams = {}
  ): Array<any> {
    return rates.map(rate => {
      const baseAmount = rate.price.amount;
      const ssp = rate.suggestedSellingPrice || baseAmount * 1.15; // Default SSP if not provided
      
      const revenueData = this.calculateRate(baseAmount, ssp, params);
      
      return {
        ...rate,
        revenueManagement: revenueData,
        price: {
          ...rate.price,
          amount: revenueData.finalSellingPrice,
          formatted: this.formatPrice(revenueData.finalSellingPrice, rate.price.currency)
        },
        originalPrice: {
          amount: baseAmount,
          currency: rate.price.currency,
          formatted: this.formatPrice(baseAmount, rate.price.currency)
        },
        suggestedSellingPrice: {
          amount: ssp,
          currency: rate.price.currency,
          formatted: this.formatPrice(ssp, rate.price.currency)
        },
        canDisplay: revenueData.canDisplay,
        displayRestrictions: revenueData.displayRestrictions
      };
    });
  }

  /**
   * Check if user can access discounted rates (CUG)
   */
  canAccessDiscountedRates(userTier: string, userGroup: string): boolean {
    // Closed User Groups logic
    if (userGroup === 'cug') return true;
    if (userGroup === 'member' && ['Gold', 'Platinum'].includes(userTier)) return true;
    return false;
  }

  /**
   * Calculate commission payout for booking
   */
  calculateCommissionPayout(bookingAmount: number, margin: number): {
    grossCommission: number;
    platformFee: number;
    netCommission: number;
    payoutDate: Date;
  } {
    const grossCommission = (bookingAmount * margin) / 100;
    const platformFee = grossCommission * 0.05; // 5% platform fee
    const netCommission = grossCommission - platformFee;
    
    // Commission paid weekly (next Monday)
    const payoutDate = new Date();
    const daysUntilMonday = (8 - payoutDate.getDay()) % 7;
    payoutDate.setDate(payoutDate.getDate() + daysUntilMonday);
    
    return {
      grossCommission: Math.round(grossCommission * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      netCommission: Math.round(netCommission * 100) / 100,
      payoutDate
    };
  }

  /**
   * Generate revenue analytics
   */
  generateRevenueAnalytics(bookings: Array<{
    amount: number;
    margin: number;
    date: Date;
  }>): {
    totalRevenue: number;
    totalCommission: number;
    averageMargin: number;
    revenueByMargin: Record<string, { count: number; revenue: number; commission: number }>;
    monthlyTrend: Array<{ month: string; revenue: number; commission: number }>;
  } {
    const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
    const totalCommission = bookings.reduce((sum, b) => sum + (b.amount * b.margin / 100), 0);
    const averageMargin = bookings.reduce((sum, b) => sum + b.margin, 0) / bookings.length;
    
    // Group by margin ranges
    const revenueByMargin: Record<string, { count: number; revenue: number; commission: number }> = {};
    const marginRanges = ['0-5%', '6-10%', '11-15%', '16-20%', '21%+'];
    
    bookings.forEach(booking => {
      let range = '21%+';
      if (booking.margin <= 5) range = '0-5%';
      else if (booking.margin <= 10) range = '6-10%';
      else if (booking.margin <= 15) range = '11-15%';
      else if (booking.margin <= 20) range = '16-20%';
      
      if (!revenueByMargin[range]) {
        revenueByMargin[range] = { count: 0, revenue: 0, commission: 0 };
      }
      
      revenueByMargin[range].count++;
      revenueByMargin[range].revenue += booking.amount;
      revenueByMargin[range].commission += (booking.amount * booking.margin / 100);
    });
    
    // Monthly trend (last 12 months)
    const monthlyTrend: Array<{ month: string; revenue: number; commission: number }> = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthBookings = bookings.filter(b => 
        b.date.getMonth() === monthDate.getMonth() && 
        b.date.getFullYear() === monthDate.getFullYear()
      );
      
      monthlyTrend.push({
        month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenue: monthBookings.reduce((sum, b) => sum + b.amount, 0),
        commission: monthBookings.reduce((sum, b) => sum + (b.amount * b.margin / 100), 0)
      });
    }
    
    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      averageMargin: Math.round(averageMargin * 100) / 100,
      revenueByMargin,
      monthlyTrend
    };
  }

  /**
   * Format price with currency
   */
  private formatPrice(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
}

// Export singleton instance
export const revenueManager = new RevenueManager();

// Types already exported above as interfaces