/**
 * Travel Intelligence System
 *
 * Provides smart recommendations, insights, and reminders for travelers
 * including:
 * - Best time to book detection
 * - Seasonal pricing insights
 * - Popular destination trends
 * - Hidden gem recommendations
 * - Travel document reminders
 */

import { addDays, differenceInDays, parseISO, isWithinInterval } from 'date-fns';

export interface TravelInsight {
  type: 'timing' | 'pricing' | 'destination' | 'document' | 'seasonal';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionable: boolean;
  action?: string;
  icon?: string;
}

export interface DestinationRecommendation {
  destination: string;
  destinationCode: string;
  country: string;
  reason: string;
  type: 'hidden_gem' | 'trending' | 'seasonal' | 'budget_friendly';
  estimatedPrice?: number;
  currency?: string;
  bestMonths: string[];
  highlights: string[];
}

export interface BookingTimingAnalysis {
  daysUntilDeparture: number;
  isOptimalBookingWindow: boolean;
  priceExpectation: 'low' | 'medium' | 'high' | 'very_high';
  recommendation: string;
  reasoning: string;
}

export interface SeasonalPricingInsight {
  season: 'peak' | 'shoulder' | 'off_peak';
  priceMultiplier: number;
  tips: string[];
  alternativeDates?: string[];
}

/**
 * Analyze optimal booking timing based on departure date
 */
export function analyzeBookingTiming(departureDate: string | Date): BookingTimingAnalysis {
  const departure = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;
  const today = new Date();
  const daysUntilDeparture = differenceInDays(departure, today);

  // Optimal booking windows (based on industry research)
  // Domestic: 1-3 months before
  // International: 2-6 months before
  const isDomesticOptimal = daysUntilDeparture >= 30 && daysUntilDeparture <= 90;
  const isInternationalOptimal = daysUntilDeparture >= 60 && daysUntilDeparture <= 180;

  let priceExpectation: 'low' | 'medium' | 'high' | 'very_high';
  let recommendation: string;
  let reasoning: string;

  if (daysUntilDeparture < 7) {
    priceExpectation = 'very_high';
    recommendation = 'Book immediately if travel is essential. Last-minute prices are typically 50-100% higher.';
    reasoning = 'Last-minute bookings (under 7 days) have the highest prices due to limited availability.';
  } else if (daysUntilDeparture < 14) {
    priceExpectation = 'high';
    recommendation = 'Book soon. Prices increase significantly within 2 weeks of departure.';
    reasoning = 'Two weeks before departure is still expensive, but better than last-minute.';
  } else if (daysUntilDeparture < 30) {
    priceExpectation = 'medium';
    recommendation = 'Good time to book. You can still find reasonable deals.';
    reasoning = 'Booking 2-4 weeks ahead offers moderate prices with decent availability.';
  } else if (daysUntilDeparture >= 30 && daysUntilDeparture <= 90) {
    priceExpectation = 'low';
    recommendation = 'Excellent timing! This is the sweet spot for domestic flights.';
    reasoning = '1-3 months in advance typically offers the best prices for domestic travel.';
  } else if (daysUntilDeparture > 90 && daysUntilDeparture <= 180) {
    priceExpectation = 'low';
    recommendation = 'Perfect for international flights! Book now to lock in great prices.';
    reasoning = '3-6 months ahead is ideal for international flights with lowest prices.';
  } else {
    priceExpectation = 'medium';
    recommendation = 'You\'re booking quite early. Monitor prices as they may fluctuate.';
    reasoning = 'Very early bookings (6+ months) may not always have the lowest prices. Consider setting price alerts.';
  }

  return {
    daysUntilDeparture,
    isOptimalBookingWindow: isDomesticOptimal || isInternationalOptimal,
    priceExpectation,
    recommendation,
    reasoning,
  };
}

/**
 * Determine seasonal pricing for a destination
 */
export function getSeasonalPricing(
  destination: string,
  travelDate: string | Date
): SeasonalPricingInsight {
  const date = typeof travelDate === 'string' ? parseISO(travelDate) : travelDate;
  const month = date.getMonth(); // 0-11

  // Seasonal definitions (Northern Hemisphere bias, can be expanded)
  const peakSeasons = [
    { months: [5, 6, 7], name: 'Summer Peak' }, // Jun, Jul, Aug
    { months: [11, 0], name: 'Winter Holidays' }, // Dec, Jan
  ];

  const shoulderSeasons = [
    { months: [3, 4, 8, 9], name: 'Spring/Fall' }, // Apr, May, Sep, Oct
  ];

  const offPeakSeasons = [
    { months: [1, 2, 10], name: 'Off-Peak' }, // Feb, Mar, Nov
  ];

  let season: 'peak' | 'shoulder' | 'off_peak';
  let priceMultiplier: number;
  let tips: string[];

  if (peakSeasons.some(s => s.months.includes(month))) {
    season = 'peak';
    priceMultiplier = 1.5;
    tips = [
      'Book as early as possible - peak season fills up fast',
      'Consider alternative airports nearby to save money',
      'Look for midweek flights (Tue-Thu) for lower prices',
      'Set price alerts to catch deals',
    ];
  } else if (shoulderSeasons.some(s => s.months.includes(month))) {
    season = 'shoulder';
    priceMultiplier = 1.2;
    tips = [
      'Great balance of good weather and lower prices',
      'Destinations are less crowded',
      'Book 6-8 weeks in advance for best deals',
      'Consider package deals for extra savings',
    ];
  } else {
    season = 'off_peak';
    priceMultiplier = 1.0;
    tips = [
      'Best time for budget travelers - lowest prices',
      'Hotels and attractions offer significant discounts',
      'More authentic experience with fewer tourists',
      'Be aware of weather conditions for your destination',
    ];
  }

  return {
    season,
    priceMultiplier,
    tips,
  };
}

/**
 * Check for important travel document requirements
 */
export function getTravelDocumentReminders(
  origin: string,
  destination: string,
  departureDate: string | Date,
  passengers: { passportNumber?: string; passportExpiry?: string }[]
): TravelInsight[] {
  const insights: TravelInsight[] = [];
  const departure = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;
  const daysUntilDeparture = differenceInDays(departure, new Date());

  // Check if international travel
  const isInternational = origin.substring(0, 2) !== destination.substring(0, 2);

  if (isInternational) {
    // Passport requirement
    const hasPassport = passengers.every(p => p.passportNumber);
    if (!hasPassport) {
      insights.push({
        type: 'document',
        priority: 'critical',
        title: 'Passport Required',
        message: 'International travel requires a valid passport. Apply now as it can take 6-8 weeks.',
        actionable: true,
        action: 'Apply for passport or verify you have it',
        icon: '🛂',
      });
    }

    // Passport expiry check (6-month rule)
    passengers.forEach((passenger, index) => {
      if (passenger.passportExpiry) {
        const expiry = parseISO(passenger.passportExpiry);
        const sixMonthsFromDeparture = addDays(departure, 180);

        if (expiry < sixMonthsFromDeparture) {
          insights.push({
            type: 'document',
            priority: 'critical',
            title: `Passport Expiring Soon (Passenger ${index + 1})`,
            message: `Most countries require passports valid for 6 months beyond travel date. Your passport expires before this requirement.`,
            actionable: true,
            action: 'Renew passport immediately',
            icon: '⚠️',
          });
        }
      }
    });

    // Visa reminder
    insights.push({
      type: 'document',
      priority: 'high',
      title: 'Check Visa Requirements',
      message: `Verify if you need a visa for ${destination}. Some countries offer visa-on-arrival or e-visa options.`,
      actionable: true,
      action: 'Check visa requirements for your destination',
      icon: '📋',
    });

    // Travel insurance recommendation
    if (daysUntilDeparture > 7) {
      insights.push({
        type: 'document',
        priority: 'medium',
        title: 'Consider Travel Insurance',
        message: 'Travel insurance protects against trip cancellations, medical emergencies, and lost baggage.',
        actionable: true,
        action: 'Get a travel insurance quote',
        icon: '🛡️',
      });
    }
  }

  // Early check-in reminder
  if (daysUntilDeparture <= 1 && daysUntilDeparture >= 0) {
    insights.push({
      type: 'document',
      priority: 'high',
      title: 'Check In Online',
      message: 'Online check-in is now available! Check in early to select better seats.',
      actionable: true,
      action: 'Check in for your flight',
      icon: '✅',
    });
  }

  return insights;
}

/**
 * Get destination recommendations based on user preferences
 */
export function getDestinationRecommendations(params: {
  budget?: 'low' | 'medium' | 'high';
  travelStyle?: 'adventure' | 'relaxation' | 'culture' | 'family' | 'romantic';
  month?: number;
  origin?: string;
}): DestinationRecommendation[] {
  const recommendations: DestinationRecommendation[] = [];

  // Hidden Gems
  const hiddenGems: DestinationRecommendation[] = [
    {
      destination: 'Porto',
      destinationCode: 'OPO',
      country: 'Portugal',
      reason: 'Charming coastal city with stunning architecture and wine culture',
      type: 'hidden_gem',
      estimatedPrice: 450,
      currency: 'USD',
      bestMonths: ['May', 'June', 'September', 'October'],
      highlights: ['Port wine tasting', 'Historic Ribeira district', 'Beautiful beaches', 'Affordable prices'],
    },
    {
      destination: 'Ljubljana',
      destinationCode: 'LJU',
      country: 'Slovenia',
      reason: 'Fairy-tale capital with green spaces and castle views',
      type: 'hidden_gem',
      estimatedPrice: 380,
      currency: 'USD',
      bestMonths: ['April', 'May', 'September', 'October'],
      highlights: ['Ljubljana Castle', 'Dragon Bridge', 'Lake Bled nearby', 'Budget-friendly'],
    },
    {
      destination: 'Cartagena',
      destinationCode: 'CTG',
      country: 'Colombia',
      reason: 'Colonial Caribbean city with vibrant culture',
      type: 'hidden_gem',
      estimatedPrice: 420,
      currency: 'USD',
      bestMonths: ['December', 'January', 'February', 'March'],
      highlights: ['Walled Old City', 'Caribbean beaches', 'Colorful architecture', 'Great food scene'],
    },
  ];

  // Trending Destinations
  const trending: DestinationRecommendation[] = [
    {
      destination: 'Dubai',
      destinationCode: 'DXB',
      country: 'UAE',
      reason: 'Futuristic city with luxury and adventure',
      type: 'trending',
      estimatedPrice: 650,
      currency: 'USD',
      bestMonths: ['November', 'December', 'January', 'February', 'March'],
      highlights: ['Burj Khalifa', 'Desert safaris', 'Luxury shopping', 'World-class dining'],
    },
    {
      destination: 'Iceland',
      destinationCode: 'KEF',
      country: 'Iceland',
      reason: 'Natural wonders and northern lights',
      type: 'trending',
      estimatedPrice: 550,
      currency: 'USD',
      bestMonths: ['June', 'July', 'August', 'September'],
      highlights: ['Northern Lights', 'Blue Lagoon', 'Waterfalls', 'Glaciers'],
    },
  ];

  // Budget-Friendly
  const budgetFriendly: DestinationRecommendation[] = [
    {
      destination: 'Bangkok',
      destinationCode: 'BKK',
      country: 'Thailand',
      reason: 'Vibrant culture and incredible value',
      type: 'budget_friendly',
      estimatedPrice: 520,
      currency: 'USD',
      bestMonths: ['November', 'December', 'January', 'February'],
      highlights: ['Street food paradise', 'Ornate temples', 'River cruises', 'Affordable luxury'],
    },
    {
      destination: 'Mexico City',
      destinationCode: 'MEX',
      country: 'Mexico',
      reason: 'Rich culture and amazing cuisine at great prices',
      type: 'budget_friendly',
      estimatedPrice: 280,
      currency: 'USD',
      bestMonths: ['March', 'April', 'October', 'November'],
      highlights: ['Ancient ruins', 'World-class museums', 'Incredible food', 'Vibrant nightlife'],
    },
  ];

  // Filter based on preferences
  if (params.budget === 'low') {
    recommendations.push(...budgetFriendly, ...hiddenGems);
  } else if (params.budget === 'high') {
    recommendations.push(...trending);
  } else {
    // Mix of all
    recommendations.push(...hiddenGems.slice(0, 2), ...trending.slice(0, 1), ...budgetFriendly.slice(0, 1));
  }

  // Filter by travel style
  if (params.travelStyle === 'romantic') {
    recommendations.unshift({
      destination: 'Santorini',
      destinationCode: 'JTR',
      country: 'Greece',
      reason: 'Stunning sunsets and romantic atmosphere',
      type: 'trending',
      estimatedPrice: 580,
      currency: 'USD',
      bestMonths: ['May', 'June', 'September', 'October'],
      highlights: ['White-washed villages', 'Volcanic beaches', 'Wine tasting', 'Sunset views'],
    });
  } else if (params.travelStyle === 'adventure') {
    recommendations.unshift({
      destination: 'Queenstown',
      destinationCode: 'ZQN',
      country: 'New Zealand',
      reason: 'Adventure capital of the world',
      type: 'trending',
      estimatedPrice: 920,
      currency: 'USD',
      bestMonths: ['December', 'January', 'February', 'March'],
      highlights: ['Bungee jumping', 'Skydiving', 'Skiing', 'Hiking'],
    });
  }

  return recommendations.slice(0, 5); // Return top 5
}

/**
 * Generate travel insights for a booking
 */
export function generateTravelInsights(params: {
  origin: string;
  destination: string;
  departureDate: string | Date;
  returnDate?: string | Date;
  passengers: { passportNumber?: string; passportExpiry?: string }[];
  budget?: 'low' | 'medium' | 'high';
}): TravelInsight[] {
  const insights: TravelInsight[] = [];

  // Booking timing analysis
  const timing = analyzeBookingTiming(params.departureDate);
  insights.push({
    type: 'timing',
    priority: timing.isOptimalBookingWindow ? 'low' : 'medium',
    title: 'Booking Timing',
    message: timing.recommendation,
    actionable: false,
    icon: '⏰',
  });

  // Seasonal pricing
  const seasonal = getSeasonalPricing(params.destination, params.departureDate);
  if (seasonal.season === 'peak') {
    insights.push({
      type: 'seasonal',
      priority: 'medium',
      title: 'Peak Season Travel',
      message: `You're traveling during peak season. Prices are typically ${Math.round((seasonal.priceMultiplier - 1) * 100)}% higher.`,
      actionable: true,
      action: 'Consider alternative dates to save money',
      icon: '📈',
    });
  } else if (seasonal.season === 'off_peak') {
    insights.push({
      type: 'seasonal',
      priority: 'low',
      title: 'Off-Peak Savings',
      message: 'Great timing! Off-peak travel means lower prices and fewer crowds.',
      actionable: false,
      icon: '💰',
    });
  }

  // Document reminders
  const documentInsights = getTravelDocumentReminders(
    params.origin,
    params.destination,
    params.departureDate,
    params.passengers
  );
  insights.push(...documentInsights);

  // Price alert suggestion
  const daysUntilDeparture = differenceInDays(
    typeof params.departureDate === 'string' ? parseISO(params.departureDate) : params.departureDate,
    new Date()
  );

  if (daysUntilDeparture > 30) {
    insights.push({
      type: 'pricing',
      priority: 'low',
      title: 'Set Price Alerts',
      message: 'Since you\'re booking early, set up price alerts to catch any drops.',
      actionable: true,
      action: 'Enable price monitoring',
      icon: '🔔',
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights;
}

/**
 * Get smart tips based on travel context
 */
export function getSmartTravelTips(params: {
  isFirstTimeTraveler?: boolean;
  isFamilyTravel?: boolean;
  isBusinessTravel?: boolean;
  destination: string;
}): string[] {
  const tips: string[] = [];

  if (params.isFirstTimeTraveler) {
    tips.push(
      'Arrive at the airport at least 2 hours early for domestic flights (3 hours for international)',
      'Download your airline\'s mobile app for easy check-in and updates',
      'Pack essential items (medications, documents, valuables) in your carry-on',
      'Make copies of important documents (passport, insurance) and store digitally'
    );
  }

  if (params.isFamilyTravel) {
    tips.push(
      'Book seats together when checking in to ensure your family sits together',
      'Bring entertainment for kids: tablets, books, games, and snacks',
      'Request early boarding if traveling with young children',
      'Pack a change of clothes for kids in your carry-on'
    );
  }

  if (params.isBusinessTravel) {
    tips.push(
      'Choose flights with flexible change policies for business uncertainty',
      'Join airline loyalty programs to earn miles and benefits',
      'Book refundable fares if your schedule might change',
      'Pack a portable phone charger and important documents in carry-on'
    );
  }

  // General tips
  tips.push(
    'Check visa and entry requirements well in advance',
    'Consider travel insurance for trip protection',
    'Register with your embassy if traveling to remote areas',
    'Download offline maps and translation apps'
  );

  return tips.slice(0, 5); // Return top 5 most relevant
}

/**
 * Calculate potential savings for flexible dates
 */
export function analyzeFlexibleDateSavings(
  baseDate: string | Date,
  flexDays: number = 3
): { suggestion: string; potentialSavings: number } {
  const base = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;
  const dayOfWeek = base.getDay();

  // Tuesday and Wednesday are typically cheapest
  let suggestion = '';
  let potentialSavings = 0;

  if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
    // Friday, Saturday, Sunday
    suggestion = 'Flying on Tuesday or Wednesday instead could save 15-25%';
    potentialSavings = 20; // Average percentage
  } else if (dayOfWeek === 1 || dayOfWeek === 4) {
    // Monday, Thursday
    suggestion = 'Consider flying mid-week (Tue/Wed) for potential 10-15% savings';
    potentialSavings = 12;
  } else {
    suggestion = 'You\'re already flying on an optimal day (Tue/Wed) for best prices!';
    potentialSavings = 0;
  }

  return { suggestion, potentialSavings };
}
