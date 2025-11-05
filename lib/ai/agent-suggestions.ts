/**
 * AI Agent Proactive Suggestion System
 * Makes agents anticipate needs and suggest relevant options
 */

export type SuggestionType =
  | 'deal-alert'           // Limited time offer
  | 'better-option'        // Upgrade or alternative
  | 'cost-saving'          // Save money tip
  | 'time-saving'          // Faster/easier option
  | 'package-deal'         // Bundle offer
  | 'upsell'               // Add-on service
  | 'alternative'          // If primary option unavailable
  | 'insider-tip'          // Expert advice
  | 'urgency'              // Time-sensitive
  | 'personalized';        // Based on preferences

export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  message: string;
  action?: SuggestionAction;
  savingsAmount?: number;
  savingsPercentage?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface SuggestionAction {
  type: 'show-flexible-dates' | 'show-alternatives' | 'add-to-cart' | 'compare-options' | 'show-details' | 'apply-filter' | 'book-now';
  label: string;
  params?: Record<string, any>;
}

export interface SuggestionContext {
  searchParams?: {
    origin?: string;
    destination?: string;
    departureDate?: Date | string;
    returnDate?: Date | string;
    passengers?: number;
    class?: string;
    tripType?: 'one-way' | 'round-trip' | 'multi-city';
  };
  results?: any[];
  userProfile?: {
    previousSearches?: any[];
    bookingHistory?: any[];
    preferences?: {
      budget?: 'economy' | 'premium' | 'luxury';
      prefersDirect?: boolean;
      preferredAirlines?: string[];
      frequentDestinations?: string[];
    };
    loyaltyPrograms?: string[];
  };
  conversationHistory?: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    suggestions?: string[];
  }>;
  currentDate?: Date;
  sessionData?: {
    suggestionsShown?: string[];
    lastSuggestionTime?: Date;
    userEngagement?: 'high' | 'medium' | 'low';
    stage?: 'search' | 'results' | 'details' | 'booking';
  };
}

/**
 * Generate relevant suggestions based on context
 */
export function generateSuggestions(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const currentDate = context.currentDate || new Date();

  // Import detectors
  const dealSuggestions = detectDeals(context);
  const smartSuggestions = detectSmartRecommendations(context);
  const timingSuggestions = detectTimingSuggestions(context, currentDate);
  const personalizedSuggestions = detectPersonalizedSuggestions(context);

  suggestions.push(
    ...dealSuggestions,
    ...smartSuggestions,
    ...timingSuggestions,
    ...personalizedSuggestions
  );

  // Filter out irrelevant suggestions
  const relevantSuggestions = suggestions.filter(s =>
    isSuggestionRelevant(s, context)
  );

  // Remove duplicates
  const uniqueSuggestions = deduplicateSuggestions(relevantSuggestions);

  // Prioritize and limit
  return prioritizeSuggestions(uniqueSuggestions, context);
}

/**
 * Detect deal-related suggestions
 */
function detectDeals(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!context.results || context.results.length === 0) {
    return suggestions;
  }

  // Flash sale detection
  const flashSaleResults = context.results.filter((r: any) =>
    r.isFlashSale || r.discountPercentage > 20
  );

  if (flashSaleResults.length > 0) {
    const bestDeal = flashSaleResults.reduce((best: any, current: any) =>
      (current.discountPercentage || 0) > (best.discountPercentage || 0) ? current : best
    );

    suggestions.push({
      id: 'flash-sale-alert',
      type: 'deal-alert',
      priority: 'high',
      message: `Flash sale alert! Save ${bestDeal.discountPercentage}% on this option - expires in ${getTimeRemaining(bestDeal.expiresAt)}!`,
      savingsPercentage: bestDeal.discountPercentage,
      expiresAt: bestDeal.expiresAt,
      action: {
        type: 'show-details',
        label: 'View Deal',
        params: { id: bestDeal.id }
      }
    });
  }

  // Price drop detection
  if (context.userProfile?.previousSearches) {
    const previousSearch = context.userProfile.previousSearches.find((ps: any) =>
      ps.destination === context.searchParams?.destination &&
      ps.origin === context.searchParams?.origin
    );

    if (previousSearch && context.results[0]) {
      const currentLowest = Math.min(...context.results.map((r: any) => r.price || Infinity));
      const previousLowest = previousSearch.lowestPrice || 0;

      if (previousLowest > 0 && currentLowest < previousLowest * 0.85) {
        const savings = previousLowest - currentLowest;
        const savingsPercent = Math.round(((previousLowest - currentLowest) / previousLowest) * 100);

        suggestions.push({
          id: 'price-drop-alert',
          type: 'deal-alert',
          priority: 'high',
          message: `Great news! Prices dropped ${savingsPercent}% since your last search!`,
          savingsAmount: savings,
          savingsPercentage: savingsPercent,
          action: {
            type: 'show-alternatives',
            label: 'View Updated Prices'
          }
        });
      }
    }
  }

  return suggestions;
}

/**
 * Detect smart recommendations based on search context
 */
function detectSmartRecommendations(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!context.searchParams) {
    return suggestions;
  }

  const { searchParams, results } = context;

  // Expensive date detection
  if (searchParams.departureDate && isExpensivePeriod(searchParams.departureDate)) {
    suggestions.push({
      id: 'flexible-dates-tip',
      type: 'cost-saving',
      priority: 'high',
      message: "I notice you're searching during peak season. Shifting your dates by 2-3 days could save you up to 40%! Would you like me to show flexible date options?",
      action: {
        type: 'show-flexible-dates',
        label: 'See Flexible Dates',
        params: { date: searchParams.departureDate }
      }
    });
  }

  // Direct flight upgrade suggestion
  if (results && results.length > 0) {
    const hasConnecting = results.some((r: any) => r.stops > 0);
    const hasDirect = results.some((r: any) => r.stops === 0);

    if (hasConnecting && hasDirect) {
      const cheapestConnecting = results
        .filter((r: any) => r.stops > 0)
        .reduce((min: any, r: any) => r.price < min.price ? r : min);

      const cheapestDirect = results
        .filter((r: any) => r.stops === 0)
        .reduce((min: any, r: any) => r.price < min.price ? r : min);

      const priceDiff = cheapestDirect.price - cheapestConnecting.price;
      const percentDiff = Math.round((priceDiff / cheapestConnecting.price) * 100);

      if (percentDiff < 25) { // Only suggest if less than 25% more
        suggestions.push({
          id: 'direct-flight-upgrade',
          type: 'better-option',
          priority: 'medium',
          message: `For just $${priceDiff} more (${percentDiff}% increase), you could get a direct flight and save ${calculateTimeSaved(cheapestConnecting, cheapestDirect)} hours of travel time!`,
          action: {
            type: 'show-details',
            label: 'View Direct Flights',
            params: { filter: 'direct' }
          }
        });
      }
    }
  }

  // Package deal suggestion
  if (searchParams.destination && !context.sessionData?.suggestionsShown?.includes('package-deal')) {
    suggestions.push({
      id: 'package-deal-offer',
      type: 'package-deal',
      priority: 'medium',
      message: "💡 Pro tip: Booking hotel + flight together typically saves 15-20%. Would you like me to show package deals?",
      action: {
        type: 'show-alternatives',
        label: 'View Packages',
        params: { type: 'package' }
      }
    });
  }

  // Last-minute booking tip
  if (searchParams.departureDate && isLastMinute(searchParams.departureDate)) {
    suggestions.push({
      id: 'last-minute-tip',
      type: 'insider-tip',
      priority: 'medium',
      message: "You're booking last-minute! Airlines often release unsold seats at discounts 24-48 hours before departure. I'll monitor prices for you.",
      metadata: { bookingWindow: 'last-minute' }
    });
  }

  // Budget class upgrade
  if (searchParams.class === 'economy' && results && results.length > 0) {
    const economyFlights = results.filter((r: any) => r.class === 'economy');
    const premiumFlights = results.filter((r: any) => r.class === 'premium-economy');

    if (economyFlights.length > 0 && premiumFlights.length > 0) {
      const cheapestEconomy = economyFlights.reduce((min: any, r: any) =>
        r.price < min.price ? r : min
      );
      const cheapestPremium = premiumFlights.reduce((min: any, r: any) =>
        r.price < min.price ? r : min
      );

      const priceDiff = cheapestPremium.price - cheapestEconomy.price;
      const percentDiff = Math.round((priceDiff / cheapestEconomy.price) * 100);

      if (percentDiff < 30) {
        suggestions.push({
          id: 'premium-upgrade',
          type: 'better-option',
          priority: 'low',
          message: `Premium economy is only ${percentDiff}% more - you get extra legroom, priority boarding, and better meals!`,
          action: {
            type: 'apply-filter',
            label: 'View Premium Options',
            params: { class: 'premium-economy' }
          }
        });
      }
    }
  }

  return suggestions;
}

/**
 * Detect timing-based suggestions
 */
function detectTimingSuggestions(context: SuggestionContext, currentDate: Date): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!context.searchParams) {
    return suggestions;
  }

  // Best booking time
  const daysUntilDeparture = getDaysUntilDate(context.searchParams.departureDate);

  if (daysUntilDeparture >= 21 && daysUntilDeparture <= 90) {
    suggestions.push({
      id: 'optimal-booking-window',
      type: 'insider-tip',
      priority: 'low',
      message: "Perfect timing! You're booking in the sweet spot (3-12 weeks out) when prices are typically lowest.",
      metadata: { daysUntilDeparture }
    });
  } else if (daysUntilDeparture > 90) {
    suggestions.push({
      id: 'early-booking-tip',
      type: 'insider-tip',
      priority: 'low',
      message: "You're booking early! Prices might drop as we get closer. Want me to set up price alerts?",
      action: {
        type: 'add-to-cart',
        label: 'Set Price Alert'
      }
    });
  }

  // Day of week pricing tip
  const departureDay = new Date(context.searchParams.departureDate || '').getDay();
  if (departureDay === 0 || departureDay === 6) { // Weekend
    suggestions.push({
      id: 'weekday-savings-tip',
      type: 'cost-saving',
      priority: 'medium',
      message: "💰 Insider tip: Tuesday and Wednesday flights are typically 15-20% cheaper than weekends. Want to see weekday options?",
      action: {
        type: 'show-flexible-dates',
        label: 'Show Weekday Flights'
      }
    });
  }

  // Seasonal advice
  if (context.searchParams.destination) {
    const seasonalTip = getSeasonalAdvice(
      context.searchParams.destination,
      context.searchParams.departureDate
    );

    if (seasonalTip) {
      suggestions.push({
        id: 'seasonal-advice',
        type: 'insider-tip',
        priority: 'medium',
        message: seasonalTip,
        metadata: { type: 'seasonal' }
      });
    }
  }

  return suggestions;
}

/**
 * Detect personalized suggestions based on user history
 */
function detectPersonalizedSuggestions(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!context.userProfile) {
    return suggestions;
  }

  const { userProfile, searchParams } = context;

  // Returning customer benefits
  if (userProfile.bookingHistory && userProfile.bookingHistory.length > 2) {
    suggestions.push({
      id: 'loyalty-benefit',
      type: 'personalized',
      priority: 'medium',
      message: "As a valued returning customer, you qualify for priority support and exclusive deals! 🌟",
      metadata: { bookingCount: userProfile.bookingHistory.length }
    });
  }

  // Similar destination suggestion
  if (userProfile.bookingHistory && searchParams?.destination) {
    const similarDestinations = findSimilarDestinations(
      searchParams.destination,
      userProfile.bookingHistory
    );

    if (similarDestinations.length > 0) {
      suggestions.push({
        id: 'similar-destination',
        type: 'personalized',
        priority: 'low',
        message: `Based on your previous trips, you might also love ${similarDestinations.join(', ')}! Want to compare?`,
        action: {
          type: 'show-alternatives',
          label: 'Explore Similar Destinations',
          params: { destinations: similarDestinations }
        }
      });
    }
  }

  // Budget alignment
  if (userProfile.preferences?.budget && context.results) {
    const userBudget = estimateUserBudget(userProfile.bookingHistory || []);
    const resultsInBudget = context.results.filter((r: any) =>
      r.price <= userBudget * 1.1
    );

    if (resultsInBudget.length > 0 && resultsInBudget.length < context.results.length) {
      suggestions.push({
        id: 'budget-filter',
        type: 'personalized',
        priority: 'medium',
        message: `I filtered results to match your usual budget of around $${userBudget}. Found ${resultsInBudget.length} great options!`,
        action: {
          type: 'apply-filter',
          label: 'View Budget-Friendly Options',
          params: { maxPrice: userBudget * 1.1 }
        }
      });
    }
  }

  // Preferred airline
  if (userProfile.preferences?.preferredAirlines && context.results) {
    const preferredResults = context.results.filter((r: any) =>
      userProfile.preferences?.preferredAirlines?.includes(r.airline)
    );

    if (preferredResults.length > 0) {
      suggestions.push({
        id: 'preferred-airline',
        type: 'personalized',
        priority: 'medium',
        message: `Good news! I found ${preferredResults.length} options with your preferred airlines.`,
        action: {
          type: 'apply-filter',
          label: 'View Preferred Airlines',
          params: { airlines: userProfile.preferences.preferredAirlines }
        }
      });
    }
  }

  return suggestions;
}

/**
 * Check if suggestion is relevant to current context
 */
export function isSuggestionRelevant(
  suggestion: Suggestion,
  context: SuggestionContext
): boolean {
  // Don't repeat suggestions already shown
  if (context.sessionData?.suggestionsShown?.includes(suggestion.id)) {
    return false;
  }

  // Don't suggest expired deals
  if (suggestion.expiresAt && suggestion.expiresAt < new Date()) {
    return false;
  }

  // Don't suggest upsells to budget-conscious users
  if (
    suggestion.type === 'upsell' &&
    context.userProfile?.preferences?.budget === 'economy'
  ) {
    return false;
  }

  // Don't suggest packages if user only wants flights
  if (
    suggestion.type === 'package-deal' &&
    context.conversationHistory?.some(msg =>
      msg.content.toLowerCase().includes('only flight') ||
      msg.content.toLowerCase().includes('just flight')
    )
  ) {
    return false;
  }

  // Don't suggest flexible dates if user mentioned fixed dates
  if (
    suggestion.action?.type === 'show-flexible-dates' &&
    context.conversationHistory?.some(msg =>
      msg.content.toLowerCase().includes('must be') ||
      msg.content.toLowerCase().includes('need to travel on')
    )
  ) {
    return false;
  }

  return true;
}

/**
 * Remove duplicate suggestions
 */
function deduplicateSuggestions(suggestions: Suggestion[]): Suggestion[] {
  const seen = new Set<string>();
  return suggestions.filter(s => {
    if (seen.has(s.id)) {
      return false;
    }
    seen.add(s.id);
    return true;
  });
}

/**
 * Prioritize suggestions and limit to reasonable number
 */
function prioritizeSuggestions(
  suggestions: Suggestion[],
  context: SuggestionContext
): Suggestion[] {
  // Sort by priority
  const sorted = suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Within same priority, prefer time-sensitive
    if (a.expiresAt && !b.expiresAt) return -1;
    if (!a.expiresAt && b.expiresAt) return 1;

    // Then prefer cost-saving
    if (a.savingsAmount && !b.savingsAmount) return -1;
    if (!a.savingsAmount && b.savingsAmount) return 1;

    return 0;
  });

  // Limit based on user engagement
  const engagement = context.sessionData?.userEngagement || 'medium';
  const maxSuggestions = {
    high: 3,
    medium: 2,
    low: 1
  }[engagement];

  return sorted.slice(0, maxSuggestions);
}

// Helper functions

function isExpensivePeriod(date: Date | string): boolean {
  const d = new Date(date);
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

function isLastMinute(date: Date | string): boolean {
  const daysUntil = getDaysUntilDate(date);
  return daysUntil < 14;
}

function getDaysUntilDate(date: Date | string | undefined): number {
  if (!date) return Infinity;
  const d = new Date(date);
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getTimeRemaining(expiresAt: Date | undefined): string {
  if (!expiresAt) return 'soon';

  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    return `${Math.floor(hours / 24)} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else {
    return `${minutes} minutes`;
  }
}

function calculateTimeSaved(connecting: any, direct: any): number {
  const connectingTime = connecting.totalDuration || 0;
  const directTime = direct.totalDuration || 0;
  return Math.round((connectingTime - directTime) / 60); // Convert to hours
}

function getSeasonalAdvice(destination: string, date: Date | string | undefined): string | null {
  if (!date) return null;

  const d = new Date(date);
  const month = d.getMonth();

  // Simple seasonal advice (can be expanded with real data)
  const seasonalTips: Record<string, Record<number, string>> = {
    'Bali': {
      0: 'January is rainy season in Bali. Consider visiting in May-September for better weather!',
      11: 'December is rainy season in Bali. Consider visiting in May-September for better weather!'
    },
    'Europe': {
      6: 'July is peak tourist season in Europe - expect crowds and higher prices. Consider June or September!',
      7: 'August is peak tourist season in Europe - expect crowds and higher prices. Consider June or September!'
    }
  };

  // Check for destination-specific tips
  for (const [dest, tips] of Object.entries(seasonalTips)) {
    if (destination.includes(dest) && tips[month]) {
      return tips[month];
    }
  }

  return null;
}

function findSimilarDestinations(
  destination: string,
  bookingHistory: any[]
): string[] {
  // Simple similarity matching (can be enhanced with ML)
  const destinationMap: Record<string, string[]> = {
    'Paris': ['Rome', 'Barcelona', 'Amsterdam'],
    'Tokyo': ['Seoul', 'Singapore', 'Hong Kong'],
    'New York': ['Chicago', 'Boston', 'San Francisco'],
    'Bali': ['Phuket', 'Maldives', 'Fiji'],
  };

  const similar = destinationMap[destination] || [];

  // Filter out places user has already been
  const visited = bookingHistory.map((b: any) => b.destination);
  return similar.filter(s => !visited.includes(s));
}

function estimateUserBudget(bookingHistory: any[]): number {
  if (bookingHistory.length === 0) return 1000;

  const prices = bookingHistory.map((b: any) => b.price || 0);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  return Math.round(avgPrice);
}
