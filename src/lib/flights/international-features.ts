/**
 * 🌍 International Flight Features & Utilities
 * Enhanced functionality for international travel bookings
 * Focus: Higher commissions, better UX, conversion optimization
 */

export interface InternationalDestination {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  region: 'Asia' | 'Europe' | 'Oceania' | 'Africa' | 'South America';
  flag: string;
  avgPrice: number;
  bestSeason: string;
  timeZone: string;
  visaRequired: boolean;
  commission: number; // 5-15% for international
  popularity: number; // 1-100
}

export interface InternationalDeals {
  destination: InternationalDestination;
  originalPrice: number;
  salePrice: number;
  savings: number;
  savingsPercent: number;
  validUntil: Date;
  reason: string; // "Seasonal", "Error Fare", "Flash Sale", etc.
}

export interface VisaRequirements {
  required: boolean;
  type: 'Visa' | 'eTA' | 'ESTA' | 'Visa on Arrival' | 'No Visa Required';
  processingTime: string;
  cost: number;
  url: string;
}

export interface TimeZoneInfo {
  offset: string;
  jetLagSeverity: 'Low' | 'Moderate' | 'High' | 'Severe';
  recommendedDepartureTime: string[];
  arrivalLocalTime: string;
}

// 🔥 Top International Destinations (High Commission Focus)
export const PREMIUM_INTERNATIONAL_DESTINATIONS: InternationalDestination[] = [
  {
    iataCode: 'NRT',
    name: 'Tokyo Narita International',
    city: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    flag: '🇯🇵',
    avgPrice: 1250,
    bestSeason: 'April-May, September-November',
    timeZone: 'JST (UTC+9)',
    visaRequired: false,
    commission: 12,
    popularity: 95
  },
  {
    iataCode: 'LHR',
    name: 'London Heathrow',
    city: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    avgPrice: 650,
    bestSeason: 'May-September',
    timeZone: 'GMT (UTC+0)',
    visaRequired: true,
    commission: 10,
    popularity: 98
  },
  {
    iataCode: 'CDG',
    name: 'Paris Charles de Gaulle',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    flag: '🇫🇷',
    avgPrice: 680,
    bestSeason: 'April-June, September-October',
    timeZone: 'CET (UTC+1)',
    visaRequired: true,
    commission: 10,
    popularity: 96
  },
  {
    iataCode: 'SIN',
    name: 'Singapore Changi',
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    flag: '🇸🇬',
    avgPrice: 1180,
    bestSeason: 'February-April',
    timeZone: 'SGT (UTC+8)',
    visaRequired: false,
    commission: 14,
    popularity: 88
  },
  {
    iataCode: 'SYD',
    name: 'Sydney Kingsford Smith',
    city: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    flag: '🇦🇺',
    avgPrice: 1450,
    bestSeason: 'September-November, March-May',
    timeZone: 'AEDT (UTC+11)',
    visaRequired: true,
    commission: 15,
    popularity: 85
  },
  {
    iataCode: 'BKK',
    name: 'Bangkok Suvarnabhumi',
    city: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    flag: '🇹🇭',
    avgPrice: 890,
    bestSeason: 'November-February',
    timeZone: 'ICT (UTC+7)',
    visaRequired: false,
    commission: 13,
    popularity: 92
  }
];

// 🎯 International Persuasion Messages
export const INTERNATIONAL_PERSUASION_MESSAGES = {
  urgency: [
    "🔥 International fares rising 18% this week",
    "⚠️ Only 3 seats left at this international rate",
    "📈 Peak season approaching - book now to save $340",
    "⏰ Error fare expires in 2 hours - book fast!"
  ],
  socialProof: [
    "👥 127 travelers booked this route today",
    "⭐ Most popular international destination this month",
    "🏆 #1 rated flight by international travelers",
    "📱 Booked by 2,340 Americans this week"
  ],
  savings: [
    "💰 Save $245 vs average international fare",
    "📊 34% below typical price for this route",
    "🎯 Best international deal in 90 days",
    "💎 Premium route at economy price"
  ],
  seasonal: [
    "🌸 Cherry blossom season - limited availability",
    "🏖️ Perfect weather window - book now",
    "🎭 Festival season - high demand expected",
    "❄️ Ski season rates increase next week"
  ]
};

// 🧠 International Travel Intelligence
export class InternationalTravelIntelligence {
  
  // Calculate commission potential
  static calculateCommissionPotential(price: number, destination: string): number {
    const dest = PREMIUM_INTERNATIONAL_DESTINATIONS.find(d => d.iataCode === destination);
    if (!dest) return price * 0.05; // 5% default
    
    return price * (dest.commission / 100);
  }

  // Get visa requirements
  static getVisaRequirements(destination: string, citizenship: string = 'US'): VisaRequirements {
    // Simplified logic - in production, use real visa API
    const dest = PREMIUM_INTERNATIONAL_DESTINATIONS.find(d => d.iataCode === destination);
    
    if (!dest?.visaRequired) {
      return {
        required: false,
        type: 'No Visa Required',
        processingTime: 'N/A',
        cost: 0,
        url: ''
      };
    }

    // Default visa info (replace with real API)
    return {
      required: true,
      type: 'Visa',
      processingTime: '5-10 business days',
      cost: 160,
      url: `https://travel.state.gov/content/travel/en/us-visas.html`
    };
  }

  // Calculate jet lag impact
  static calculateJetLagImpact(origin: string, destination: string): TimeZoneInfo {
    // Simplified calculation - in production, use proper timezone library
    const timeZones: Record<string, number> = {
      'NYC': -5, 'LAX': -8, 'CHI': -6,
      'NRT': 9, 'LHR': 0, 'CDG': 1, 'SIN': 8, 'SYD': 11, 'BKK': 7
    };

    const originOffset = timeZones[origin] || -5;
    const destOffset = timeZones[destination] || 0;
    const difference = Math.abs(destOffset - originOffset);

    let severity: 'Low' | 'Moderate' | 'High' | 'Severe';
    if (difference <= 3) severity = 'Low';
    else if (difference <= 6) severity = 'Moderate';
    else if (difference <= 9) severity = 'High';
    else severity = 'Severe';

    return {
      offset: `UTC${destOffset >= 0 ? '+' : ''}${destOffset}`,
      jetLagSeverity: severity,
      recommendedDepartureTime: difference > 6 ? ['evening', 'night'] : ['morning', 'afternoon'],
      arrivalLocalTime: 'calculated_based_on_flight_time'
    };
  }

  // Generate international travel tips
  static generateTravelTips(destination: string): string[] {
    const dest = PREMIUM_INTERNATIONAL_DESTINATIONS.find(d => d.iataCode === destination);
    if (!dest) return [];

    const tips = [
      `💡 Best time to visit ${dest.city}: ${dest.bestSeason}`,
      `💰 Average savings booking 6-8 weeks ahead: $${Math.floor(dest.avgPrice * 0.15)}`,
      `🌍 ${dest.city} is ${dest.popularity}% more popular than other ${dest.region} destinations`,
    ];

    // Add region-specific tips
    switch (dest.region) {
      case 'Asia':
        tips.push('🍜 Try local cuisine - amazing food scene!');
        tips.push('🏮 Cultural experiences are unforgettable');
        break;
      case 'Europe':
        tips.push('🚄 Consider train travel between cities');
        tips.push('🏰 Rich history and architecture await');
        break;
      case 'Oceania':
        tips.push('🏖️ Beach and outdoor activities are world-class');
        tips.push('🦘 Unique wildlife experiences');
        break;
    }

    return tips;
  }

  // Get seasonal pricing insights
  static getSeasonalPricing(destination: string, month: number): {
    season: 'Peak' | 'Shoulder' | 'Off-Peak';
    priceMultiplier: number;
    description: string;
  } {
    // Simplified seasonal logic (replace with historical data)
    const dest = PREMIUM_INTERNATIONAL_DESTINATIONS.find(d => d.iataCode === destination);
    if (!dest) return { season: 'Shoulder', priceMultiplier: 1.0, description: 'Standard pricing' };

    // General seasonal patterns
    if ([6, 7, 8].includes(month)) { // Summer
      return {
        season: 'Peak',
        priceMultiplier: 1.4,
        description: 'Summer peak season - highest demand'
      };
    } else if ([4, 5, 9, 10].includes(month)) { // Spring/Fall
      return {
        season: 'Shoulder',
        priceMultiplier: 1.1,
        description: 'Shoulder season - good balance of weather and price'
      };
    } else { // Winter
      return {
        season: 'Off-Peak',
        priceMultiplier: 0.8,
        description: 'Off-peak season - best prices but variable weather'
      };
    }
  }

  // Calculate total international value (price + commission + conversion)
  static calculateInternationalValue(price: number, destination: string): {
    ticketPrice: number;
    commission: number;
    conversionLikelihood: number;
    totalValue: number;
  } {
    const commission = this.calculateCommissionPotential(price, destination);
    const dest = PREMIUM_INTERNATIONAL_DESTINATIONS.find(d => d.iataCode === destination);
    
    // Higher prices = higher conversion for international (quality perception)
    const conversionLikelihood = Math.min(0.95, (price / 2000) * (dest?.popularity || 50) / 100);
    
    return {
      ticketPrice: price,
      commission,
      conversionLikelihood,
      totalValue: commission * conversionLikelihood
    };
  }
}

// 🎯 International Conversion Optimizations
export const INTERNATIONAL_CONVERSION_TACTICS = {
  priceAnchoring: [
    "vs Business Class: Save $2,340",
    "vs Last Minute: Save $567",
    "vs Average Market: Save $234"
  ],
  
  trustSignals: [
    "🛡️ IATA certified travel agency",
    "🔒 Secure international payment processing",
    "📞 24/7 US-based customer support",
    "⭐ 4.8/5 rating from 50k+ international travelers"
  ],

  urgencyTriggers: [
    "🔥 International fare sale ends in 6 hours",
    "⚠️ Peak season approaching - prices increase weekly",
    "📈 This route increased 23% last month",
    "⏰ Only 48h left at this international rate"
  ],

  valuePropositions: [
    "💎 Premium international experience at economy price",
    "🌍 Complete travel package (flights + support + insurance)",
    "🎯 AI-optimized routing saves 4 hours travel time",
    "✈️ Upgrade to business class for just $299 more"
  ]
};

export default InternationalTravelIntelligence;