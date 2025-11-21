/**
 * Affiliate Data Mappers
 *
 * Transform database records into clean API responses
 */

export interface AffiliateProfile {
  id: string;
  userId: string;
  businessName?: string;
  website?: string;
  tier: string;
  status: string;
  referralCode: string;
  trackingUrl: string;
  metrics: {
    totalClicks: number;
    completedTrips: number;
    monthlyTrips: number;
  };
  balance: {
    current: number;
    pending: number;
    minThreshold: number;
  };
  createdAt: Date;
}

export interface Commission {
  id: string;
  bookingId: string;
  revenueModel: 'commission' | 'markup';
  customerPaid: number;
  yourProfit: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  bookingDate: Date;
  travelDate: Date;
  holdUntil?: Date;
}

export interface Payout {
  id: string;
  amount: number;
  netAmount: number;
  commissionCount: number;
  method: string;
  status: string;
  invoiceNumber?: string;
  createdAt: Date;
  paidAt?: Date;
}

/**
 * Map database affiliate record to API response
 */
export function mapAffiliateToProfile(affiliate: any): AffiliateProfile {
  return {
    id: affiliate.id,
    userId: affiliate.user_id,
    businessName: affiliate.business_name,
    website: affiliate.website,
    tier: affiliate.tier,
    status: affiliate.status,
    referralCode: affiliate.referral_code,
    trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${affiliate.referral_code}`,
    metrics: {
      totalClicks: affiliate.total_clicks,
      completedTrips: affiliate.completed_trips,
      monthlyTrips: affiliate.monthly_completed_trips,
    },
    balance: {
      current: parseFloat(affiliate.current_balance || 0),
      pending: parseFloat(affiliate.pending_balance || 0),
      minThreshold: parseFloat(affiliate.min_payout_threshold || 50),
    },
    createdAt: new Date(affiliate.created_at),
  };
}

/**
 * Map database commission record to API response
 */
export function mapCommissionToResponse(commission: any): Commission {
  return {
    id: commission.id,
    bookingId: commission.booking_id,
    revenueModel: commission.revenue_model,
    customerPaid: parseFloat(commission.customer_total_paid),
    yourProfit: parseFloat(commission.your_gross_profit),
    commissionRate: parseFloat(commission.commission_rate),
    commissionAmount: parseFloat(commission.commission_amount),
    status: commission.status,
    bookingDate: new Date(commission.booking_date),
    travelDate: new Date(commission.travel_date),
    holdUntil: commission.hold_until ? new Date(commission.hold_until) : undefined,
  };
}

/**
 * Map database payout record to API response
 */
export function mapPayoutToResponse(payout: any): Payout {
  return {
    id: payout.id,
    amount: parseFloat(payout.amount),
    netAmount: parseFloat(payout.net_amount),
    commissionCount: payout.commission_count,
    method: payout.method,
    status: payout.status,
    invoiceNumber: payout.invoice_number,
    createdAt: new Date(payout.created_at),
    paidAt: payout.paid_at ? new Date(payout.paid_at) : undefined,
  };
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: string) {
  const tiers: Record<string, any> = {
    starter: {
      name: 'Starter',
      commissionRate: 0.15,
      color: '#94a3b8',
      badge: '🌱',
    },
    bronze: {
      name: 'Bronze',
      commissionRate: 0.20,
      color: '#cd7f32',
      badge: '🥉',
    },
    silver: {
      name: 'Silver',
      commissionRate: 0.25,
      color: '#c0c0c0',
      badge: '🥈',
    },
    gold: {
      name: 'Gold',
      commissionRate: 0.30,
      color: '#ffd700',
      badge: '🥇',
    },
    platinum: {
      name: 'Platinum',
      commissionRate: 0.35,
      color: '#e5e4e2',
      badge: '💎',
    },
  };

  return tiers[tier] || tiers.starter;
}

/**
 * Format commission status for display
 */
export function formatCommissionStatus(status: string): {
  label: string;
  color: string;
  description: string;
} {
  const statuses: Record<string, any> = {
    pending: {
      label: 'Pending',
      color: '#94a3b8',
      description: 'Booking created, awaiting confirmation',
    },
    booked: {
      label: 'Booked',
      color: '#3b82f6',
      description: 'Payment confirmed, awaiting travel',
    },
    completed: {
      label: 'Completed',
      color: '#8b5cf6',
      description: 'Trip completed, in hold period',
    },
    approved: {
      label: 'Approved',
      color: '#10b981',
      description: 'Ready for payout',
    },
    paid: {
      label: 'Paid',
      color: '#059669',
      description: 'Commission paid out',
    },
    cancelled: {
      label: 'Cancelled',
      color: '#ef4444',
      description: 'Booking cancelled',
    },
  };

  return statuses[status] || statuses.pending;
}

/**
 * Calculate days until commission approval
 */
export function getDaysUntilApproval(holdUntil: Date): number {
  const now = new Date();
  const diff = holdUntil.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
