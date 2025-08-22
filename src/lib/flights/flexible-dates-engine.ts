/**
 * Enhanced Flexible Dates Engine - US MARKET OPTIMIZED
 * Provides intelligent search strategies and optimization for flexible date searches
 * Optimized for US travel patterns, holidays, business corridors, and seasonal variations
 */

import { EnhancedFlexibleDates, MultiCityFlexibility, FlexibleSearchMetadata, FlightSearchParams } from '@/types/flights';
import { AMADEUS_CONFIG, isUSPeakTravelSeason, getRouteSearchPriority, isPopularUSRoute } from './amadeus-config';

export interface SearchOptimization {
  strategy: 'exhaustive' | 'optimized' | 'smart';
  maxSearches: number;
  priorityDates: string[];
  searchOrder: { departureDate: string; returnDate?: string; priority: number }[];
}

/**
 * Determines optimal search strategy based on flexibility settings - US MARKET OPTIMIZED
 */
export function determineSearchStrategy(
  flexibility: EnhancedFlexibleDates,
  params: FlightSearchParams
): SearchOptimization {
  const departureDays = flexibility.departure.days;
  const returnDays = flexibility.return?.days || 0;
  const totalCombinations = departureDays * (returnDays || 1) * 4; // Rough estimate including time variations
  
  // 🇺🇸 US ROUTE-SPECIFIC INTELLIGENCE
  const routePriority = getRouteSearchPriority(params.originLocationCode, params.destinationLocationCode);
  const isPopularRoute = isPopularUSRoute(params.originLocationCode, params.destinationLocationCode);
  const isUSPeakSeason = isUSPeakTravelSeason(new Date(params.departureDate));
  
  // Smart strategy selection enhanced for US market
  let strategy: 'exhaustive' | 'optimized' | 'smart';
  let maxSearches: number;
  
  // For high-priority US routes, use more thorough searching
  if (routePriority >= 80 || isPopularRoute) {
    if (totalCombinations <= 25) {
      strategy = 'exhaustive';
      maxSearches = totalCombinations;
    } else if (totalCombinations <= 60) {
      strategy = 'optimized';
      maxSearches = Math.min(35, Math.ceil(totalCombinations * 0.8)); // More searches for popular routes
    } else {
      strategy = 'smart';
      maxSearches = Math.min(25, Math.ceil(totalCombinations * 0.5)); // Increased for popular routes
    }
  } else {
    // Standard logic for other routes
    if (totalCombinations <= 20) {
      strategy = 'exhaustive';
      maxSearches = totalCombinations;
    } else if (totalCombinations <= 50) {
      strategy = 'optimized';
      maxSearches = Math.min(30, Math.ceil(totalCombinations * 0.7));
    } else {
      strategy = 'smart';
      maxSearches = Math.min(20, Math.ceil(totalCombinations * 0.4));
    }
  }
  
  // During US peak travel seasons, reduce search complexity (focus on exact dates)
  if (isUSPeakSeason.isPeak) {
    strategy = strategy === 'exhaustive' ? 'optimized' : 'smart';
    maxSearches = Math.ceil(maxSearches * 0.7); // Reduce by 30% during peak seasons
  }
  
  // Override with user preference
  if (flexibility.searchStrategy) {
    strategy = flexibility.searchStrategy;
  }

  if (flexibility.maxSearches) {
    maxSearches = Math.min(maxSearches, flexibility.maxSearches);
  }

  return {
    strategy,
    maxSearches,
    priorityDates: generateUSOptimizedPriorityDates(params.departureDate, flexibility, params),
    searchOrder: generateOptimalSearchOrder(params, flexibility, maxSearches)
  };
}

/**
 * Generate priority dates optimized for US travel patterns
 */
function generateUSOptimizedPriorityDates(
  originalDate: string,
  flexibility: EnhancedFlexibleDates,
  params: FlightSearchParams
): string[] {
  const priorities = [originalDate]; // Always include original date first
  
  // 🇺🇸 US BUSINESS TRAVEL OPTIMIZATION
  // For business corridors, prioritize Tuesday-Thursday departures
  const isBusinessRoute = AMADEUS_CONFIG.US_DOMESTIC_ROUTES.BUSINESS_ROUTES.includes(
    `${params.originLocationCode}-${params.destinationLocationCode}` as any
  );
  
  if (isBusinessRoute) {
    const businessOptimalDates = generateBusinessOptimalAlternatives(originalDate, flexibility.departure.days);
    priorities.push(...businessOptimalDates);
  }
  
  // Add weekend/weekday preferences
  if (flexibility.departure.dayOfWeek?.avoidWeekends) {
    // Prioritize weekdays
    const weekdayDates = generateWeekdayAlternatives(originalDate, flexibility.departure.days);
    priorities.push(...weekdayDates);
  }
  
  if (flexibility.departure.dayOfWeek?.preferredDays) {
    // Add specific day preferences
    const preferredDayDates = generatePreferredDayAlternatives(
      originalDate, 
      flexibility.departure.days,
      flexibility.departure.dayOfWeek.preferredDays
    );
    priorities.push(...preferredDayDates);
  }
  
  // 🏖️ US LEISURE TRAVEL OPTIMIZATION
  const isLeisureRoute = AMADEUS_CONFIG.US_DOMESTIC_ROUTES.LEISURE_ROUTES.includes(
    `${params.originLocationCode}-${params.destinationLocationCode}` as any
  );
  
  if (isLeisureRoute) {
    const leisureOptimalDates = generateLeisureOptimalAlternatives(originalDate, flexibility.departure.days);
    priorities.push(...leisureOptimalDates);
  }
  
  return [...new Set(priorities)]; // Remove duplicates
}

/**
 * Generate business-optimal alternatives (Tuesday-Thursday departures)
 */
function generateBusinessOptimalAlternatives(originalDate: string, days: number): string[] {
  const dates = generateFlexibleDateRange(originalDate, days);
  return dates.filter(date => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek >= 2 && dayOfWeek <= 4; // Tuesday to Thursday
  }).sort((a, b) => {
    // Prefer Wednesday, then Tuesday, then Thursday
    const dayA = new Date(a).getDay();
    const dayB = new Date(b).getDay();
    const preferenceOrder = { 3: 1, 2: 2, 4: 3 }; // Wed, Tue, Thu
    return (preferenceOrder[dayA as keyof typeof preferenceOrder] || 99) - (preferenceOrder[dayB as keyof typeof preferenceOrder] || 99);
  });
}

/**
 * Generate leisure-optimal alternatives (Friday departures, Sunday returns)
 */
function generateLeisureOptimalAlternatives(originalDate: string, days: number): string[] {
  const dates = generateFlexibleDateRange(originalDate, days);
  return dates.filter(date => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 5 || dayOfWeek === 0; // Friday or Sunday
  }).sort((a, b) => {
    // Prefer Friday, then Sunday
    const dayA = new Date(a).getDay();
    const dayB = new Date(b).getDay();
    const preferenceOrder = { 5: 1, 0: 2 }; // Fri, Sun
    return (preferenceOrder[dayA as keyof typeof preferenceOrder] || 99) - (preferenceOrder[dayB as keyof typeof preferenceOrder] || 99);
  });
}

/**
 * Generates priority dates based on preferences
 */
function generatePriorityDates(
  originalDate: string,
  flexibility: EnhancedFlexibleDates
): string[] {
  const priorities = [originalDate]; // Always include original date first
  
  // Add weekend/weekday preferences
  if (flexibility.departure.dayOfWeek?.avoidWeekends) {
    // Prioritize weekdays
    const weekdayDates = generateWeekdayAlternatives(originalDate, flexibility.departure.days);
    priorities.push(...weekdayDates);
  }
  
  if (flexibility.departure.dayOfWeek?.preferredDays) {
    // Add specific day preferences
    const preferredDayDates = generatePreferredDayAlternatives(
      originalDate, 
      flexibility.departure.days,
      flexibility.departure.dayOfWeek.preferredDays
    );
    priorities.push(...preferredDayDates);
  }
  
  return [...new Set(priorities)]; // Remove duplicates
}

/**
 * Generates optimal search order for minimal API calls with maximum coverage
 */
function generateOptimalSearchOrder(
  params: FlightSearchParams,
  flexibility: EnhancedFlexibleDates,
  maxSearches: number
): { departureDate: string; returnDate?: string; priority: number }[] {
  const departureDates = generateFlexibleDateRange(params.departureDate, flexibility.departure.days);
  const returnDates = params.returnDate ? 
    generateFlexibleDateRange(params.returnDate, flexibility.return?.days || 0) : 
    [undefined];
  
  const searchCombinations: { departureDate: string; returnDate?: string; priority: number }[] = [];
  
  // Generate all combinations with priority scoring
  for (const depDate of departureDates) {
    for (const retDate of returnDates) {
      if (retDate && retDate <= depDate) continue; // Skip invalid combinations
      
      const priority = calculateSearchPriority(
        depDate, 
        retDate, 
        params.departureDate, 
        params.returnDate,
        flexibility
      );
      
      searchCombinations.push({
        departureDate: depDate,
        returnDate: retDate,
        priority
      });
    }
  }
  
  // Sort by priority and limit to maxSearches
  return searchCombinations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxSearches);
}

/**
 * Calculate priority score for a date combination - US MARKET OPTIMIZED
 */
function calculateSearchPriority(
  departureDate: string,
  returnDate: string | undefined,
  originalDeparture: string,
  originalReturn: string | undefined,
  flexibility: EnhancedFlexibleDates
): number {
  let priority = 100; // Base score
  
  // Prioritize original dates
  if (departureDate === originalDeparture) priority += 50;
  if (returnDate === originalReturn) priority += 50;
  
  // 🇺🇸 US HOLIDAY & PEAK SEASON INTELLIGENCE
  const departureSeasonInfo = isUSPeakTravelSeason(new Date(departureDate));
  const returnSeasonInfo = returnDate ? isUSPeakTravelSeason(new Date(returnDate)) : null;
  
  // Adjust priority based on US travel seasons
  if (departureSeasonInfo.isPeak) {
    // During peak seasons, prioritize exact dates more heavily (less flexibility benefit)
    if (departureDate === originalDeparture) {
      priority += 25; // Bonus for exact date during peak season
    } else {
      priority -= 15; // Penalty for flexible dates during peak (higher prices, less availability)
    }
  } else {
    // During off-peak, flexible dates are more beneficial
    priority += 10; // General bonus for off-peak flexibility
  }
  
  // 🎯 US BUSINESS TRAVEL PATTERNS
  const depDayOfWeek = new Date(departureDate).getDay();
  const retDayOfWeek = returnDate ? new Date(returnDate).getDay() : null;
  
  // Tuesday-Thursday departures are optimal for US business travel
  if ([2, 3, 4].includes(depDayOfWeek)) {
    priority += 20; // Tuesday, Wednesday, Thursday departures
  }
  
  // Friday returns are popular for business travelers
  if (retDayOfWeek === 5) {
    priority += 15; // Friday returns
  }
  
  // Monday departures and Sunday returns are less preferred
  if (depDayOfWeek === 1) priority -= 10; // Monday departures
  if (retDayOfWeek === 0) priority -= 10; // Sunday returns
  
  // 📅 US HOLIDAY PROXIMITY ADJUSTMENTS
  priority += calculateUSHolidayProximityScore(departureDate, returnDate);
  
  // Day of week preferences (existing logic enhanced)
  if (flexibility.departure.dayOfWeek?.preferredDays) {
    const preferredDays = flexibility.departure.dayOfWeek.preferredDays.map(day => {
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      return dayMap[day];
    });
    if (preferredDays.includes(depDayOfWeek)) priority += 30;
  }
  
  // Avoid weekends if specified (enhanced for US market)
  if (flexibility.departure.dayOfWeek?.avoidWeekends && (depDayOfWeek === 0 || depDayOfWeek === 6)) {
    priority -= 25; // Increased penalty for US market (business focus)
  }
  
  // Time preferences (enhanced for US market)
  if (flexibility.departure.timeOfDay?.preferMorning) priority += 15; // US business preference
  if (flexibility.departure.timeOfDay?.avoidRedEye) priority += 20; // Strong US preference
  if (flexibility.departure.timeOfDay?.preferEvening) priority += 5; // Mild preference
  
  // Distance from original date (closer dates get higher priority)
  const depDistance = Math.abs(new Date(departureDate).getTime() - new Date(originalDeparture).getTime());
  const dayDistance = depDistance / (1000 * 60 * 60 * 24);
  priority -= dayDistance * 5; // Penalty for distance
  
  // 🎨 US MARKET PRICING PSYCHOLOGY
  // Slightly favor dates that are likely to have better pricing
  if (dayDistance >= 1 && dayDistance <= 3) {
    priority += 8; // Sweet spot for US travelers (1-3 days flexibility)
  }
  
  return Math.max(0, priority);
}

/**
 * Calculate holiday proximity score for US market
 */
function calculateUSHolidayProximityScore(departureDate: string, returnDate?: string): number {
  let score = 0;
  const depDate = new Date(departureDate);
  const retDate = returnDate ? new Date(returnDate) : null;
  
  // US Holiday proximity adjustments
  const usHolidays = [
    { name: 'Thanksgiving', dates: ['2024-11-28', '2024-11-29'], impact: -15 }, // Expensive travel days
    { name: 'Christmas', dates: ['2024-12-23', '2024-12-24', '2024-12-25'], impact: -20 },
    { name: 'New Years', dates: ['2024-12-31', '2025-01-01'], impact: -15 },
    { name: 'Memorial Day', dates: ['2024-05-27'], impact: -10 },
    { name: 'Labor Day', dates: ['2024-09-02'], impact: -10 },
    { name: 'July 4th', dates: ['2024-07-04'], impact: -12 },
    { name: 'Presidents Day', dates: ['2024-02-19'], impact: -5 },
    { name: 'Martin Luther King Day', dates: ['2024-01-15'], impact: -3 }
  ];
  
  for (const holiday of usHolidays) {
    for (const holidayDate of holiday.dates) {
      const holidayDateTime = new Date(holidayDate).getTime();
      const depDateTime = depDate.getTime();
      const daysDifference = Math.abs(holidayDateTime - depDateTime) / (1000 * 60 * 60 * 24);
      
      // Apply penalty for traveling close to major holidays (expensive periods)
      if (daysDifference <= 2) {
        score += holiday.impact; // Negative impact (penalty)
      } else if (daysDifference <= 7) {
        score += holiday.impact * 0.5; // Reduced penalty for week of holiday
      }
      
      // Same logic for return date
      if (retDate) {
        const retDateTime = retDate.getTime();
        const retDaysDifference = Math.abs(holidayDateTime - retDateTime) / (1000 * 60 * 60 * 24);
        
        if (retDaysDifference <= 2) {
          score += holiday.impact;
        } else if (retDaysDifference <= 7) {
          score += holiday.impact * 0.5;
        }
      }
    }
  }
  
  return score;
}

/**
 * Generate flexible date range (±N days)
 */
export function generateFlexibleDateRange(dateString: string, days: number): string[] {
  if (days === 0) return [dateString];
  
  const date = new Date(dateString);
  const dates: string[] = [];
  
  for (let i = -days; i <= days; i++) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + i);
    dates.push(newDate.toLocaleDateString('sv-SE'));
  }
  
  return dates;
}

/**
 * Generate weekday alternatives
 */
function generateWeekdayAlternatives(originalDate: string, days: number): string[] {
  const dates = generateFlexibleDateRange(originalDate, days);
  return dates.filter(date => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  });
}

/**
 * Generate preferred day alternatives
 */
function generatePreferredDayAlternatives(
  originalDate: string, 
  days: number, 
  preferredDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
): string[] {
  const dates = generateFlexibleDateRange(originalDate, days);
  const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const preferredDayNumbers = preferredDays.map(day => dayMap[day]);
  
  return dates.filter(date => {
    const dayOfWeek = new Date(date).getDay();
    return preferredDayNumbers.includes(dayOfWeek);
  });
}

/**
 * Process multi-city flexibility
 */
export function processMultiCityFlexibility(
  segments: any[],
  flexibility: MultiCityFlexibility
): SearchOptimization[] {
  return segments.map((segment, index) => {
    const segmentFlex = flexibility.segments.find(s => s.segmentIndex === index);
    
    if (!segmentFlex?.departure.enabled) {
      return {
        strategy: 'exhaustive',
        maxSearches: 1,
        priorityDates: [segment.departureDate],
        searchOrder: [{ departureDate: segment.departureDate, priority: 100 }]
      };
    }
    
    // Create enhanced flexibility for this segment
    const enhancedFlex: EnhancedFlexibleDates = {
      departure: {
        enabled: true,
        days: segmentFlex.departure.days,
        priorityLevel: segmentFlex.departure.priorityLevel || 'medium'
      },
      searchStrategy: 'optimized'
    };
    
    return determineSearchStrategy(enhancedFlex, { 
      departureDate: segment.departureDate 
    } as FlightSearchParams);
  });
}

/**
 * Create search metadata for results
 */
export function createFlexibleSearchMetadata(
  originalParams: FlightSearchParams,
  searchOptimization: SearchOptimization,
  actualSearches: number,
  searchResults: any[]
): FlexibleSearchMetadata {
  const totalPlanned = searchOptimization.searchOrder.length;
  const optimizationsSaved = Math.max(0, totalPlanned - actualSearches);
  const efficiency = totalPlanned > 0 ? Math.round(((totalPlanned - optimizationsSaved) / totalPlanned) * 100) : 100;
  
  return {
    isFlexibleSearch: true,
    originalDepartureDate: originalParams.departureDate,
    originalReturnDate: originalParams.returnDate,
    flexibleDays: originalParams.flexibleDates?.days || 0,
    searchStrategy: searchOptimization.strategy,
    totalSearchesExecuted: actualSearches,
    totalSearchesPlanned: totalPlanned,
    optimizationsSaved,
    searchEfficiencyScore: efficiency,
    searchedDates: searchOptimization.searchOrder.slice(0, actualSearches).map(s => 
      `${s.departureDate}${s.returnDate ? `-${s.returnDate}` : ''}`
    ),
    performanceMetrics: {
      totalApiCalls: actualSearches,
      averageResponseTime: 0, // This would be calculated during actual search
      rateLimitingEncountered: false
    }
  };
}