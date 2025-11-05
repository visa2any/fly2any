/**
 * AI Agent Smart Recommendations System
 * Context-aware recommendations based on search patterns, user history, and travel insights
 */

import type { Suggestion } from './agent-suggestions';

export interface SearchImprovementContext {
  origin?: string;
  destination?: string;
  departureDate?: Date | string;
  returnDate?: Date | string;
  passengers?: number;
  class?: string;
  tripType?: 'one-way' | 'round-trip' | 'multi-city';
  flexibility?: 'fixed' | 'flexible';
}

export interface TravelInsight {
  type: 'seasonal' | 'pricing' | 'weather' | 'events' | 'tips';
  message: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'high' | 'medium' | 'low';
}

/**
 * Suggest improvements to search parameters
 */
export function suggestSearchImprovements(
  searchParams: SearchImprovementContext
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Expensive date suggestions
  if (searchParams.departureDate && isExpensivePeriod(searchParams.departureDate)) {
    suggestions.push({
      id: 'expensive-dates-tip',
      type: 'cost-saving',
      priority: 'high',
      message: "I notice you're searching during peak season when prices are typically 40-60% higher. Shifting your dates by just 2-3 days could save you hundreds of dollars! Would you like me to show flexible date options?",
      action: {
        type: 'show-flexible-dates',
        label: 'See Flexible Dates',
        params: { originalDate: searchParams.departureDate }
      }
    });
  }

  // Weekend vs weekday pricing
  if (searchParams.departureDate && isWeekend(searchParams.departureDate)) {
    suggestions.push({
      id: 'weekday-pricing-tip',
      type: 'insider-tip',
      priority: 'medium',
      message: "💰 Insider tip: Flying on Tuesday or Wednesday is typically 15-25% cheaper than weekend flights. Want to see weekday options?",
      action: {
        type: 'show-flexible-dates',
        label: 'Show Weekday Flights'
      }
    });
  }

  // Multi-city vs separate bookings
  if (searchParams.tripType === 'multi-city') {
    suggestions.push({
      id: 'multi-city-tip',
      type: 'insider-tip',
      priority: 'medium',
      message: "Pro tip: Sometimes booking separate one-way tickets is cheaper than multi-city. I'll show you both options!",
      metadata: { compareBookingTypes: true }
    });
  }

  // Large group suggestions
  if (searchParams.passengers && searchParams.passengers >= 6) {
    suggestions.push({
      id: 'group-booking-tip',
      type: 'insider-tip',
      priority: 'high',
      message: `For ${searchParams.passengers} passengers, consider contacting airlines directly for group rates - you might get 10-15% off plus better flexibility!`,
      metadata: { groupSize: searchParams.passengers }
    });
  }

  // Last-minute booking
  if (searchParams.departureDate && isLastMinute(searchParams.departureDate)) {
    suggestions.push({
      id: 'last-minute-strategy',
      type: 'insider-tip',
      priority: 'high',
      message: "You're booking last-minute! Airlines often release unsold seats at discounts 24-48 hours before departure. I'll monitor prices for you and alert you to any drops!",
      action: {
        type: 'add-to-cart',
        label: 'Set Price Alert'
      }
    });
  }

  // Advance booking
  if (searchParams.departureDate && isTooEarly(searchParams.departureDate)) {
    suggestions.push({
      id: 'early-booking-tip',
      type: 'insider-tip',
      priority: 'medium',
      message: "You're booking quite early! Prices typically drop 8-12 weeks before departure. Want me to set up price monitoring so you can book at the optimal time?",
      action: {
        type: 'add-to-cart',
        label: 'Monitor Prices'
      }
    });
  }

  // Optimal booking window
  if (searchParams.departureDate && isOptimalBookingWindow(searchParams.departureDate)) {
    suggestions.push({
      id: 'optimal-timing',
      type: 'insider-tip',
      priority: 'low',
      message: "Perfect timing! You're booking in the sweet spot (3-12 weeks out) when prices are typically at their lowest. Great planning! 🎯",
      metadata: { isOptimal: true }
    });
  }

  // Return date optimization
  if (searchParams.returnDate && searchParams.departureDate) {
    const tripLength = getTripLength(searchParams.departureDate, searchParams.returnDate);

    if (tripLength === 6) {
      suggestions.push({
        id: 'saturday-stay-tip',
        type: 'cost-saving',
        priority: 'medium',
        message: "💡 Tip: Staying through Saturday night often unlocks lower fares. Your current dates include a Saturday stay - that's perfect for getting better prices!",
        metadata: { tripLength }
      });
    } else if (tripLength < 6 && !includesSaturday(searchParams.departureDate, searchParams.returnDate)) {
      suggestions.push({
        id: 'saturday-stay-suggestion',
        type: 'cost-saving',
        priority: 'medium',
        message: "Extending your trip to include a Saturday night stay could save 20-30% on airfare. Want to see options that include the weekend?",
        action: {
          type: 'show-flexible-dates',
          label: 'Show Weekend Options'
        }
      });
    }
  }

  return suggestions;
}

/**
 * Personalized recommendations based on user history
 */
export function suggestPersonalized(userHistory: {
  previousSearches?: any[];
  bookingHistory?: any[];
  preferences?: any;
}): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!userHistory.bookingHistory || userHistory.bookingHistory.length === 0) {
    return suggestions;
  }

  // Favorite destinations
  const destinations = userHistory.bookingHistory.map((b: any) => b.destination);
  const destinationCounts = destinations.reduce((acc: any, dest: string) => {
    acc[dest] = (acc[dest] || 0) + 1;
    return acc;
  }, {});

  const favoriteDestinations = Object.entries(destinationCounts)
    .filter(([_, count]) => (count as number) > 1)
    .map(([dest]) => dest);

  if (favoriteDestinations.length > 0) {
    suggestions.push({
      id: 'favorite-destinations',
      type: 'personalized',
      priority: 'low',
      message: `I see you love ${favoriteDestinations.join(', ')}! Would you like to explore similar destinations or get alerts for deals to these places?`,
      action: {
        type: 'show-alternatives',
        label: 'Explore Similar Destinations',
        params: { destinations: favoriteDestinations }
      }
    });
  }

  // Travel patterns
  const averageTripLength = calculateAverageTripLength(userHistory.bookingHistory);
  if (averageTripLength > 0) {
    suggestions.push({
      id: 'trip-length-pattern',
      type: 'personalized',
      priority: 'low',
      message: `Based on your history, you typically take ${averageTripLength}-day trips. I'll prioritize options that match your usual travel style!`,
      metadata: { averageTripLength }
    });
  }

  // Budget patterns
  const averageBudget = calculateAverageBudget(userHistory.bookingHistory);
  if (averageBudget > 0) {
    suggestions.push({
      id: 'budget-insight',
      type: 'personalized',
      priority: 'low',
      message: `Your typical budget is around $${averageBudget}. I'll highlight options in your usual range and let you know about premium options worth the upgrade!`,
      metadata: { averageBudget }
    });
  }

  // Seasonal patterns
  const seasonalPattern = detectSeasonalPattern(userHistory.bookingHistory);
  if (seasonalPattern) {
    suggestions.push({
      id: 'seasonal-pattern',
      type: 'personalized',
      priority: 'low',
      message: seasonalPattern,
      metadata: { type: 'seasonal-preference' }
    });
  }

  // Loyalty program suggestions
  const frequentAirlines = getFrequentAirlines(userHistory.bookingHistory);
  if (frequentAirlines.length > 0 && !userHistory.preferences?.loyaltyPrograms) {
    suggestions.push({
      id: 'loyalty-program-tip',
      type: 'personalized',
      priority: 'medium',
      message: `You fly ${frequentAirlines[0]} often! Have you joined their loyalty program? You could be earning points and getting perks!`,
      metadata: { airlines: frequentAirlines }
    });
  }

  return suggestions;
}

/**
 * Seasonal recommendations and travel insights
 */
export function suggestSeasonal(
  destination: string,
  dates: { departure?: Date | string; return?: Date | string }
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!dates.departure) return suggestions;

  const departureDate = new Date(dates.departure);
  const month = departureDate.getMonth();
  const season = getSeason(departureDate);

  // Get destination-specific insights
  const insights = getDestinationInsights(destination, month);

  insights.forEach(insight => {
    let priority: 'high' | 'medium' | 'low' = 'medium';

    if (insight.impact === 'negative' && insight.severity === 'high') {
      priority = 'high';
    } else if (insight.impact === 'positive' && insight.severity === 'high') {
      priority = 'high';
    } else if (insight.severity === 'low') {
      priority = 'low';
    }

    let suggestionType: Suggestion['type'] = 'insider-tip';
    if (insight.type === 'pricing') {
      suggestionType = 'cost-saving';
    } else if (insight.type === 'seasonal') {
      suggestionType = 'alternative';
    }

    suggestions.push({
      id: `seasonal-${insight.type}-${destination}`,
      type: suggestionType,
      priority,
      message: insight.message,
      metadata: {
        destination,
        season,
        insightType: insight.type
      }
    });
  });

  return suggestions;
}

/**
 * Alternative destination suggestions
 */
export function suggestAlternatives(
  destination: string,
  constraints?: {
    budget?: number;
    climate?: 'warm' | 'cold' | 'moderate';
    activities?: string[];
    similarTo?: string[];
  }
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const alternatives = getAlternativeDestinations(destination, constraints);

  if (alternatives.length > 0) {
    suggestions.push({
      id: 'alternative-destinations',
      type: 'alternative',
      priority: 'medium',
      message: `If you're flexible, consider these alternatives to ${destination}: ${alternatives.join(', ')}. Similar vibe but potentially better deals!`,
      action: {
        type: 'show-alternatives',
        label: 'Explore Alternatives',
        params: { destinations: alternatives }
      }
    });
  }

  return suggestions;
}

/**
 * Get destination-specific travel insights
 */
function getDestinationInsights(destination: string, month: number): TravelInsight[] {
  const insights: TravelInsight[] = [];

  // Destination-specific knowledge base (simplified - can be expanded)
  const destinationData: Record<string, any> = {
    'Bali': {
      rainyMonths: [11, 0, 1, 2], // Nov-Feb
      bestMonths: [4, 5, 6, 7, 8], // May-Sep
      events: {
        2: 'Nyepi (Day of Silence) - airports closed',
        6: 'Peak season - book accommodations early'
      }
    },
    'Paris': {
      rainyMonths: [10, 11, 0, 1], // Nov-Feb
      bestMonths: [3, 4, 5, 8, 9], // Apr-Jun, Sep-Oct
      events: {
        6: 'Peak tourist season - expect crowds and higher prices',
        11: 'Christmas markets - magical but expensive'
      }
    },
    'Tokyo': {
      rainyMonths: [5, 6], // June-July
      bestMonths: [2, 3, 9, 10], // Mar-Apr, Oct-Nov
      events: {
        2: 'Cherry blossom season - book early!',
        3: 'Golden Week - avoid late April/early May'
      }
    },
    'Dubai': {
      hotMonths: [5, 6, 7, 8], // June-Sep (40°C+)
      bestMonths: [10, 11, 0, 1, 2], // Nov-Mar
      events: {
        11: 'Dubai Shopping Festival - great deals!'
      }
    },
    'London': {
      rainyMonths: [0, 1, 2, 10, 11], // Most of the year!
      bestMonths: [4, 5, 6, 7, 8], // May-Sep
      events: {
        5: 'Wimbledon - book hotels early',
        11: 'Holiday shopping - crowded but festive'
      }
    }
  };

  // Find matching destination (partial match)
  const destKey = Object.keys(destinationData).find(key =>
    destination.toLowerCase().includes(key.toLowerCase())
  );

  if (destKey) {
    const data = destinationData[destKey];

    // Weather insights
    if (data.rainyMonths?.includes(month)) {
      insights.push({
        type: 'weather',
        message: `${destKey} experiences heavy rain in ${getMonthName(month)}. Consider visiting during ${data.bestMonths.map(getMonthName).slice(0, 3).join(', ')} for better weather!`,
        impact: 'negative',
        severity: 'high'
      });
    }

    if (data.hotMonths?.includes(month)) {
      insights.push({
        type: 'weather',
        message: `⚠️ ${destKey} is extremely hot in ${getMonthName(month)} (40°C+). Consider visiting ${data.bestMonths.map(getMonthName).slice(0, 3).join(', ')} for more comfortable temperatures.`,
        impact: 'negative',
        severity: 'high'
      });
    }

    if (data.bestMonths?.includes(month)) {
      insights.push({
        type: 'seasonal',
        message: `Perfect timing! ${getMonthName(month)} is one of the best months to visit ${destKey} - great weather and reasonable prices!`,
        impact: 'positive',
        severity: 'high'
      });
    }

    // Event insights
    if (data.events?.[month]) {
      const isNegative = data.events[month].toLowerCase().includes('avoid') ||
                        data.events[month].toLowerCase().includes('expensive') ||
                        data.events[month].toLowerCase().includes('crowded');

      insights.push({
        type: 'events',
        message: `📅 Heads up: ${data.events[month]}`,
        impact: isNegative ? 'negative' : 'positive',
        severity: 'medium'
      });
    }
  }

  // General seasonal pricing insights
  if (isExpensivePeriod(month)) {
    insights.push({
      type: 'pricing',
      message: `${getMonthName(month)} is peak travel season - prices are typically 40-60% higher. Consider traveling in shoulder season for better deals!`,
      impact: 'negative',
      severity: 'high'
    });
  }

  return insights;
}

/**
 * Get alternative destinations
 */
function getAlternativeDestinations(
  destination: string,
  constraints?: any
): string[] {
  const alternativesMap: Record<string, string[]> = {
    'Paris': ['Lyon', 'Barcelona', 'Amsterdam', 'Brussels'],
    'London': ['Edinburgh', 'Dublin', 'Amsterdam', 'Copenhagen'],
    'Tokyo': ['Seoul', 'Osaka', 'Taipei', 'Singapore'],
    'Bali': ['Phuket', 'Krabi', 'Langkawi', 'Boracay'],
    'Dubai': ['Abu Dhabi', 'Doha', 'Muscat'],
    'New York': ['Boston', 'Chicago', 'Philadelphia', 'Washington DC'],
    'Barcelona': ['Valencia', 'Lisbon', 'Rome', 'Nice'],
    'Rome': ['Florence', 'Naples', 'Athens', 'Barcelona'],
    'Sydney': ['Melbourne', 'Brisbane', 'Auckland'],
    'Miami': ['Fort Lauderdale', 'Tampa', 'Orlando'],
  };

  const destKey = Object.keys(alternativesMap).find(key =>
    destination.toLowerCase().includes(key.toLowerCase())
  );

  return destKey ? alternativesMap[destKey] : [];
}

// Helper functions

function isExpensivePeriod(date: Date | string | number): boolean {
  const d = typeof date === 'number' ? new Date(2024, date) : new Date(date);
  const month = d.getMonth();
  const day = d.getDate();

  // Summer vacation (June-August)
  if (month >= 5 && month <= 7) return true;

  // Winter holidays (Dec 20 - Jan 5)
  if (month === 11 && day >= 20) return true;
  if (month === 0 && day <= 5) return true;

  // Spring break (mid-March)
  if (month === 2 && day >= 10 && day <= 25) return true;

  return false;
}

function isWeekend(date: Date | string): boolean {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isLastMinute(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 14;
}

function isTooEarly(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 120; // More than 4 months
}

function isOptimalBookingWindow(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 21 && diffDays <= 90; // 3-12 weeks
}

function getTripLength(departure: Date | string, returnDate: Date | string): number {
  const d1 = new Date(departure);
  const d2 = new Date(returnDate);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function includesSaturday(departure: Date | string, returnDate: Date | string): boolean {
  const d1 = new Date(departure);
  const d2 = new Date(returnDate);

  for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 6) return true;
  }

  return false;
}

function calculateAverageTripLength(bookings: any[]): number {
  if (bookings.length === 0) return 0;

  const lengths = bookings
    .filter((b: any) => b.departureDate && b.returnDate)
    .map((b: any) => getTripLength(b.departureDate, b.returnDate));

  if (lengths.length === 0) return 0;

  return Math.round(lengths.reduce((sum: number, len: number) => sum + len, 0) / lengths.length);
}

function calculateAverageBudget(bookings: any[]): number {
  if (bookings.length === 0) return 0;

  const prices = bookings.map((b: any) => b.totalPrice || b.price || 0);
  return Math.round(prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length);
}

function detectSeasonalPattern(bookings: any[]): string | null {
  if (bookings.length < 3) return null;

  const months = bookings
    .map((b: any) => new Date(b.departureDate).getMonth())
    .filter(m => !isNaN(m));

  if (months.length === 0) return null;

  // Check if user prefers summer
  const summerBookings = months.filter(m => m >= 5 && m <= 7).length;
  const winterBookings = months.filter(m => m === 11 || m === 0 || m === 1).length;

  if (summerBookings > bookings.length * 0.6) {
    return "I notice you love summer travel! ☀️ Want me to show you warm destinations for your next trip?";
  } else if (winterBookings > bookings.length * 0.6) {
    return "I see you're a winter traveler! ❄️ Want to explore winter getaway options?";
  }

  return null;
}

function getFrequentAirlines(bookings: any[]): string[] {
  const airlineCounts = bookings.reduce((acc: any, b: any) => {
    if (b.airline) {
      acc[b.airline] = (acc[b.airline] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(airlineCounts)
    .filter(([_, count]) => (count as number) >= 2)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([airline]) => airline);
}

function getSeason(date: Date): string {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}
