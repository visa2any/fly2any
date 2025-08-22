/**
 * 🛫 ENTERPRISE ROUTE OPTIMIZATION SYSTEM
 * Advanced flight route analysis and optimization for maximum availability
 */

export interface RouteAlternative {
  via: string;
  description: string;
  note: string;
  probability: number; // 0-1 chance of finding flights
  complexity: 'direct' | 'single-connection' | 'multi-connection';
}

export interface RouteAnalysis {
  isComplexRoute: boolean;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  alternatives: RouteAlternative[];
  searchTips: string[];
  estimatedSearchTime: number; // milliseconds
}

/**
 * Major international hub airports by region
 */
const HUB_AIRPORTS = {
  // North American Hubs
  US_EAST: ['JFK', 'LGA', 'EWR', 'BOS', 'DCA', 'IAD', 'BWI', 'PHL', 'CLT', 'ATL', 'MIA'],
  US_CENTRAL: ['ORD', 'MDW', 'MSP', 'DTW', 'STL', 'MCI', 'DFW', 'IAH', 'MSY'],
  US_WEST: ['LAX', 'SFO', 'SJC', 'SEA', 'PDX', 'DEN', 'PHX', 'LAS'],
  
  // European Hubs
  EUROPE: ['LHR', 'LGW', 'STN', 'CDG', 'ORY', 'AMS', 'FRA', 'MUC', 'FCO', 'MAD', 'BCN', 'ZUR'],
  
  // South American Hubs
  SOUTH_AMERICA: ['GRU', 'CGH', 'SDU', 'GIG', 'BSB', 'FOR', 'SSA', 'REC', 'BEL', 'MAO'],
  SOUTH_AMERICA_INTL: ['GRU', 'GIG', 'EZE', 'SCL', 'LIM', 'BOG', 'UIO', 'CCS'],
  
  // Asian Hubs
  ASIA: ['NRT', 'HND', 'ICN', 'PVG', 'PEK', 'HKG', 'SIN', 'BKK', 'KUL', 'DXB'],
  
  // Other Major Hubs
  CANADA: ['YYZ', 'YVR', 'YUL'],
  OCEANIA: ['SYD', 'MEL', 'AKL'],
  AFRICA: ['CAI', 'JNB', 'CPT', 'ADD']
};

/**
 * Route difficulty analysis based on airport pairs
 */
export function analyzeRoute(origin: string, destination: string): RouteAnalysis {
  const isDirectRoute = isHighProbabilityDirectRoute(origin, destination);
  const isSameRegion = isSameRegionalRoute(origin, destination);
  const requiresMultipleConnections = isMultiConnectionRoute(origin, destination);
  
  let difficulty: RouteAnalysis['difficulty'] = 'easy';
  let estimatedSearchTime = 3000; // 3 seconds base
  
  if (requiresMultipleConnections) {
    difficulty = 'extreme';
    estimatedSearchTime = 15000; // 15 seconds
  } else if (!isDirectRoute && !isSameRegion) {
    difficulty = 'hard';
    estimatedSearchTime = 10000; // 10 seconds
  } else if (!isDirectRoute) {
    difficulty = 'moderate';
    estimatedSearchTime = 6000; // 6 seconds
  }
  
  return {
    isComplexRoute: !isDirectRoute || requiresMultipleConnections,
    difficulty,
    alternatives: generateRouteAlternatives(origin, destination),
    searchTips: generateSearchTips(origin, destination, difficulty),
    estimatedSearchTime
  };
}

/**
 * Check if route is likely to have direct flights
 */
function isHighProbabilityDirectRoute(origin: string, destination: string): boolean {
  const directRoutes = [
    // US to Europe (high volume)
    ['JFK', 'LHR'], ['JFK', 'CDG'], ['JFK', 'AMS'], ['JFK', 'FRA'],
    ['EWR', 'LHR'], ['EWR', 'AMS'], ['BOS', 'LHR'], ['BOS', 'CDG'],
    ['ATL', 'AMS'], ['ATL', 'LHR'], ['ATL', 'CDG'], ['ATL', 'FRA'],
    ['LAX', 'LHR'], ['LAX', 'AMS'], ['SFO', 'LHR'], ['SFO', 'AMS'],
    
    // US to Asia
    ['LAX', 'NRT'], ['LAX', 'ICN'], ['LAX', 'PVG'], ['SFO', 'NRT'],
    ['SEA', 'NRT'], ['SEA', 'ICN'], ['ORD', 'NRT'], ['JFK', 'NRT'],
    
    // US to South America
    ['MIA', 'GRU'], ['MIA', 'GIG'], ['MIA', 'EZE'], ['JFK', 'GRU'],
    ['ATL', 'GRU'], ['LAX', 'GRU'], ['DFW', 'GRU'],
    
    // Intra-US (major routes)
    ['JFK', 'LAX'], ['JFK', 'SFO'], ['EWR', 'SFO'], ['BOS', 'LAX'],
    ['ATL', 'LAX'], ['ORD', 'LAX'], ['DFW', 'LAX'], ['IAH', 'LAX']
  ];
  
  return directRoutes.some(([o, d]) => 
    (o === origin && d === destination) || (o === destination && d === origin)
  );
}

/**
 * Check if airports are in the same region
 */
function isSameRegionalRoute(origin: string, destination: string): boolean {
  const regions = Object.values(HUB_AIRPORTS);
  return regions.some(region => 
    region.includes(origin) && region.includes(destination)
  );
}

/**
 * Check if route requires multiple connections
 */
function isMultiConnectionRoute(origin: string, destination: string): boolean {
  // Routes that typically require 2+ connections
  const complexRoutes = [
    // Secondary US cities to secondary South American cities
    { from: ['MCO', 'TPA', 'JAX', 'PBI'], to: ['POA', 'CWB', 'FLN', 'VCP', 'CNF'] },
    // Secondary US cities to secondary European cities  
    { from: ['RDU', 'CLT', 'MEM', 'BHM'], to: ['BRU', 'VIE', 'PRG', 'BUD'] },
    // Cross-region secondary routes
    { from: ['PDX', 'SLC', 'BOI'], to: ['FOR', 'SSA', 'REC', 'BEL'] }
  ];
  
  return complexRoutes.some(route =>
    route.from.includes(origin) && route.to.includes(destination)
  );
}

/**
 * Generate optimized route alternatives
 */
function generateRouteAlternatives(origin: string, destination: string): RouteAlternative[] {
  const alternatives: RouteAlternative[] = [];
  
  // For MCO → POA route (Orlando to Porto Alegre)
  if (origin === 'MCO' && destination === 'POA') {
    alternatives.push(
      {
        via: 'MIA-GRU',
        description: 'Orlando → Miami → São Paulo → Porto Alegre',
        note: 'Most reliable connection via major Brazilian hub',
        probability: 0.85,
        complexity: 'multi-connection'
      },
      {
        via: 'JFK-GRU',
        description: 'Orlando → New York → São Paulo → Porto Alegre',
        note: 'Alternative via NYC with more airline options',
        probability: 0.75,
        complexity: 'multi-connection'
      },
      {
        via: 'ATL-GRU',
        description: 'Orlando → Atlanta → São Paulo → Porto Alegre',
        note: 'Delta hub connection with good scheduling',
        probability: 0.70,
        complexity: 'multi-connection'
      }
    );
  }
  
  // Generic hub-based routing
  else {
    const originRegion = getAirportRegion(origin);
    const destRegion = getAirportRegion(destination);
    
    if (originRegion !== destRegion) {
      // Find optimal hub airports for inter-regional connections
      const hubs = findOptimalHubs(originRegion, destRegion);
      
      hubs.forEach(hub => {
        alternatives.push({
          via: hub.code,
          description: `${origin} → ${hub.name} → ${destination}`,
          note: hub.note,
          probability: hub.probability,
          complexity: 'single-connection'
        });
      });
    }
  }
  
  return alternatives;
}

/**
 * Get airport region classification
 */
function getAirportRegion(airportCode: string): string {
  for (const [region, airports] of Object.entries(HUB_AIRPORTS)) {
    if (airports.includes(airportCode)) {
      return region;
    }
  }
  return 'OTHER';
}

/**
 * Find optimal hub airports for connections
 */
function findOptimalHubs(originRegion: string, destRegion: string): Array<{
  code: string;
  name: string;
  note: string;
  probability: number;
}> {
  const hubMappings = {
    'US_EAST-SOUTH_AMERICA': [
      { code: 'MIA', name: 'Miami', note: 'Primary gateway to South America', probability: 0.9 },
      { code: 'JFK', name: 'New York JFK', note: 'International hub with multiple carriers', probability: 0.8 }
    ],
    'US_CENTRAL-SOUTH_AMERICA': [
      { code: 'IAH', name: 'Houston', note: 'United hub to South America', probability: 0.85 },
      { code: 'DFW', name: 'Dallas', note: 'American Airlines hub', probability: 0.75 }
    ],
    'US_WEST-EUROPE': [
      { code: 'SFO', name: 'San Francisco', note: 'Pacific gateway to Europe', probability: 0.8 },
      { code: 'LAX', name: 'Los Angeles', note: 'Major international hub', probability: 0.85 }
    ]
  };
  
  const key = `${originRegion}-${destRegion}`;
  return hubMappings[key as keyof typeof hubMappings] || [];
}

/**
 * Generate search tips based on route difficulty
 */
function generateSearchTips(origin: string, destination: string, difficulty: RouteAnalysis['difficulty']): string[] {
  const tips: string[] = [];
  
  switch (difficulty) {
    case 'extreme':
      tips.push(
        'Consider flexible dates - availability may be limited',
        'Book well in advance (8-12 weeks) for better options',
        'Multiple connections may be required',
        'Consider nearby airports for origin or destination'
      );
      break;
      
    case 'hard':
      tips.push(
        'Flexible dates recommended for better prices',
        'Book 6-8 weeks in advance',
        'One connection typically required'
      );
      break;
      
    case 'moderate':
      tips.push(
        'Good availability with advance booking',
        'Consider midweek travel for better prices'
      );
      break;
      
    default:
      tips.push(
        'Excellent route with multiple daily options',
        'Book 3-6 weeks ahead for best prices'
      );
  }
  
  return tips;
}

/**
 * Check if route is complex international connection
 */
export function isComplexInternationalRoute(origin: string, destination: string): boolean {
  const analysis = analyzeRoute(origin, destination);
  return analysis.isComplexRoute && analysis.difficulty === 'extreme';
}

/**
 * Get estimated search time for UI loading states
 */
export function getEstimatedSearchTime(origin: string, destination: string): number {
  return analyzeRoute(origin, destination).estimatedSearchTime;
}

/**
 * Get user-friendly route difficulty description
 */
export function getRouteDifficultyDescription(origin: string, destination: string): string {
  const { difficulty } = analyzeRoute(origin, destination);
  
  const descriptions = {
    easy: 'Popular route with excellent availability',
    moderate: 'Good route with regular flight options',
    hard: 'Complex route - connections likely required',
    extreme: 'Challenging route - multiple connections needed'
  };
  
  return descriptions[difficulty];
}