/**
 * 🌍 Brazilian Diaspora Intelligence System (2025)
 * Advanced geo-location, cultural analysis, and community targeting
 */

import { EmailContact } from '@/lib/email-marketing/types';

interface DiasporaLocation {
  city: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  brazilianPopulation: number;
  communityStrength: number; // 0-100
  averageIncome: number;
  culturalEvents: string[];
}

interface CulturalProfile {
  generation: 'first' | 'second' | 'third';
  regionOfOrigin: string;
  arrivalDecade: string;
  languageDominance: 'portuguese' | 'english' | 'bilingual';
  culturalRetention: number; // 0-100
  communityEngagement: number; // 0-100
  familyConnections: number; // 0-100
  economicStability: 'low' | 'medium' | 'high';
}

interface TravelIntent {
  score: number; // 0-100
  destinations: string[];
  travelStyle: 'budget' | 'comfort' | 'luxury';
  groupSize: number;
  seasonalPreference: string[];
  lastTripToBrazil: Date | null;
  tripFrequency: 'never' | 'rare' | 'occasional' | 'frequent';
  motivations: ('family' | 'tourism' | 'business' | 'nostalgia' | 'cultural')[];
}

export interface DiasporaInsight {
  contactId: string;
  location: DiasporaLocation;
  culturalProfile: CulturalProfile;
  travelIntent: TravelIntent;
  marketingSegment: string;
  lifetimeValue: number;
  nextBestAction: string;
  confidenceScore: number;
}

/**
 * Major Brazilian Diaspora Communities Database
 */
export class DiasporaCommunityDatabase {
  private static readonly MAJOR_COMMUNITIES: Record<string, DiasporaLocation> = {
    'miami-fl': {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      timezone: 'America/New_York',
      brazilianPopulation: 200000,
      communityStrength: 95,
      averageIncome: 75000,
      culturalEvents: ['Brazilian Day', 'Carnaval Miami', 'Festa Junina', 'Brazilian Independence Day']
    },
    'new-york-ny': {
      city: 'New York',
      state: 'NY', 
      country: 'USA',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      timezone: 'America/New_York',
      brazilianPopulation: 150000,
      communityStrength: 88,
      averageIncome: 85000,
      culturalEvents: ['Brazilian Street Festival', 'Carnaval NY', 'Copa America Watch Parties']
    },
    'boston-ma': {
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      coordinates: { lat: 42.3601, lng: -71.0589 },
      timezone: 'America/New_York',
      brazilianPopulation: 80000,
      communityStrength: 75,
      averageIncome: 92000,
      culturalEvents: ['Brazilian Cultural Festival', 'Framingham Brazilian Fest']
    },
    'orlando-fl': {
      city: 'Orlando',
      state: 'FL',
      country: 'USA',
      coordinates: { lat: 28.5383, lng: -81.3792 },
      timezone: 'America/New_York',
      brazilianPopulation: 120000,
      communityStrength: 82,
      averageIncome: 68000,
      culturalEvents: ['Brazilian Heritage Month', 'Orlando Brazilian Festival']
    },
    'atlanta-ga': {
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      coordinates: { lat: 33.7490, lng: -84.3880 },
      timezone: 'America/New_York',
      brazilianPopulation: 45000,
      communityStrength: 65,
      averageIncome: 78000,
      culturalEvents: ['Atlanta Brazilian Festival', 'Brazilian Business Network Events']
    },
    'los-angeles-ca': {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      timezone: 'America/Los_Angeles',
      brazilianPopulation: 95000,
      communityStrength: 72,
      averageIncome: 89000,
      culturalEvents: ['Brazilian Carnaval LA', 'Brazilian Film Festival', 'Festa Junina LA']
    },
    'toronto-on': {
      city: 'Toronto',
      state: 'ON',
      country: 'Canada',
      coordinates: { lat: 43.6532, lng: -79.3832 },
      timezone: 'America/Toronto',
      brazilianPopulation: 70000,
      communityStrength: 78,
      averageIncome: 72000,
      culturalEvents: ['Brazilian Week Toronto', 'Carnaval Toronto', 'Brazilian BBQ Festival']
    },
    'london-uk': {
      city: 'London',
      state: 'England',
      country: 'UK',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      timezone: 'Europe/London',
      brazilianPopulation: 95000,
      communityStrength: 71,
      averageIncome: 68000,
      culturalEvents: ['Brazilian Carnaval London', 'Brazilian Film Festival London']
    },
    'lisbon-pt': {
      city: 'Lisbon',
      state: 'Lisbon',
      country: 'Portugal',
      coordinates: { lat: 38.7223, lng: -9.1393 },
      timezone: 'Europe/Lisbon',
      brazilianPopulation: 180000,
      communityStrength: 92,
      averageIncome: 45000,
      culturalEvents: ['Festival do Brasil', 'Carnaval de Lisboa', 'Festa da Independência']
    },
    'tokyo-jp': {
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'Japan',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      timezone: 'Asia/Tokyo',
      brazilianPopulation: 250000,
      communityStrength: 89,
      averageIncome: 58000,
      culturalEvents: ['Festival do Brasil no Japão', 'Carnaval Tokyo', 'Festival de Cultura Brasileira']
    }
  };

  static findCommunityByCoordinates(lat: number, lng: number): DiasporaLocation | null {
    const threshold = 0.5; // degrees (~50km)
    
    for (const community of Object.values(this.MAJOR_COMMUNITIES)) {
      const distance = Math.sqrt(
        Math.pow(lat - community.coordinates.lat, 2) + 
        Math.pow(lng - community.coordinates.lng, 2)
      );
      
      if (distance <= threshold) {
        return community;
      }
    }
    
    return null;
  }

  static getCommunityByKey(key: string): DiasporaLocation | null {
    return this.MAJOR_COMMUNITIES[key] || null;
  }

  static getAllCommunities(): DiasporaLocation[] {
    return Object.values(this.MAJOR_COMMUNITIES);
  }

  static getCommunitiesByCountry(country: string): DiasporaLocation[] {
    return Object.values(this.MAJOR_COMMUNITIES)
      .filter(community => community.country === country);
  }
}

/**
 * Geo-Location Intelligence Engine
 */
export class GeoLocationIntelligence {
  private static readonly IP_TO_LOCATION_CACHE = new Map<string, DiasporaLocation>();
  
  /**
   * Determine diaspora location from IP address or user agent
   */
  static async identifyDiasporaLocation(
    ipAddress?: string,
    userAgent?: string,
    providedLocation?: string
  ): Promise<DiasporaLocation | null> {
    try {
      // Check cache first
      if (ipAddress && this.IP_TO_LOCATION_CACHE.has(ipAddress)) {
        return this.IP_TO_LOCATION_CACHE.get(ipAddress)!;
      }

      // Try provided location first
      if (providedLocation) {
        const location = this.parseLocationString(providedLocation);
        if (location) return location;
      }

      // Analyze user agent for location hints
      if (userAgent) {
        const locationFromUA = this.extractLocationFromUserAgent(userAgent);
        if (locationFromUA) return locationFromUA;
      }

      // IP-based geolocation (simplified - in production use real IP geolocation service)
      if (ipAddress) {
        const location = await this.geolocateIP(ipAddress);
        if (location) {
          this.IP_TO_LOCATION_CACHE.set(ipAddress, location);
          return location;
        }
      }

      return null;
    } catch (error) {
      console.error('🌍 Geolocation failed:', error);
      return null;
    }
  }

  private static parseLocationString(locationStr: string): DiasporaLocation | null {
    const normalized = locationStr.toLowerCase();
    
    for (const [key, community] of Object.entries(DiasporaCommunityDatabase['MAJOR_COMMUNITIES'])) {
      if (normalized.includes(community.city.toLowerCase()) ||
          normalized.includes(community.state.toLowerCase())) {
        return community;
      }
    }
    
    return null;
  }

  private static extractLocationFromUserAgent(userAgent: string): DiasporaLocation | null {
    // Basic timezone/language detection from User-Agent
    // In production, this would be more sophisticated
    
    if (userAgent.includes('en-US')) {
      return DiasporaCommunityDatabase.getCommunityByKey('miami-fl');
    }
    
    if (userAgent.includes('pt-BR')) {
      // Likely in Brazil or Portuguese community
      return DiasporaCommunityDatabase.getCommunityByKey('lisbon-pt');
    }
    
    return null;
  }

  private static async geolocateIP(ipAddress: string): Promise<DiasporaLocation | null> {
    // Simplified IP geolocation - in production use service like MaxMind or IPinfo
    try {
      // Mock geolocation based on IP patterns
      if (ipAddress.startsWith('192.168') || ipAddress.startsWith('10.')) {
        return null; // Private IP
      }

      // Simple mock logic based on IP ranges (not accurate, for demo)
      const lastOctet = parseInt(ipAddress.split('.').pop() || '0');
      const communityKeys = Object.keys(DiasporaCommunityDatabase['MAJOR_COMMUNITIES']);
      const selectedKey = communityKeys[lastOctet % communityKeys.length];
      
      return DiasporaCommunityDatabase.getCommunityByKey(selectedKey);
      
    } catch (error) {
      console.error('IP geolocation error:', error);
      return null;
    }
  }

  /**
   * Calculate cultural distance between communities
   */
  static calculateCulturalDistance(location1: DiasporaLocation, location2: DiasporaLocation): number {
    // Factor in geographic, economic, and cultural similarities
    const geographic = Math.sqrt(
      Math.pow(location1.coordinates.lat - location2.coordinates.lat, 2) +
      Math.pow(location1.coordinates.lng - location2.coordinates.lng, 2)
    );
    
    const economic = Math.abs(location1.averageIncome - location2.averageIncome) / 100000;
    const communityStrength = Math.abs(location1.communityStrength - location2.communityStrength) / 100;
    
    return (geographic * 0.4) + (economic * 0.3) + (communityStrength * 0.3);
  }
}

/**
 * Cultural Profile Analyzer
 */
export class CulturalProfileAnalyzer {
  private static readonly GENERATION_INDICATORS = {
    first: ['chegou', 'imigrou', 'mudou', 'nascido no Brasil'],
    second: ['filhos de brasileiros', 'pais brasileiros', 'cresceu aqui'],
    third: ['avós brasileiros', 'third generation', 'bisavós']
  };

  private static readonly LANGUAGE_PATTERNS = {
    portuguese: /[àáâãçéêíóôõú]/g,
    bilingual: /(Brasil|Brazil|saudade|família|family)/gi,
    english: /^[a-zA-Z\s.,!?]*$/
  };

  /**
   * Analyze cultural profile from contact data and behavior
   */
  static analyzeCulturalProfile(
    contact: EmailContact,
    location: DiasporaLocation,
    emailHistory: any[]
  ): CulturalProfile {
    const generation = this.determineGeneration(contact, emailHistory);
    const regionOfOrigin = this.inferRegionOfOrigin(contact);
    const arrivalDecade = this.estimateArrivalDecade(contact, generation);
    const languageDominance = this.analyzeLanguageDominance(contact, emailHistory);
    const culturalRetention = this.calculateCulturalRetention(contact, location, emailHistory);
    const communityEngagement = this.assessCommunityEngagement(contact, location);
    const familyConnections = this.evaluateFamilyConnections(contact);
    const economicStability = this.inferEconomicStability(contact, location);

    return {
      generation,
      regionOfOrigin,
      arrivalDecade,
      languageDominance,
      culturalRetention,
      communityEngagement,
      familyConnections,
      economicStability
    };
  }

  private static determineGeneration(contact: EmailContact, history: any[]): 'first' | 'second' | 'third' {
    // Analyze name patterns, email content, and behavioral indicators
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
    
    // Portuguese name patterns suggest first generation
    const portugueseNamePattern = /[àáâãçéêíóôõú]|silva|santos|oliveira|souza|pereira|costa|ferreira|almeida|barbosa|ribeiro/;
    if (portugueseNamePattern.test(fullName)) {
      return 'first';
    }

    // Analyze email engagement with Portuguese content
    const portugueseEngagement = history.filter(h => 
      h.content && this.LANGUAGE_PATTERNS.portuguese.test(h.content)
    ).length;

    if (portugueseEngagement > history.length * 0.7) return 'first';
    if (portugueseEngagement > history.length * 0.3) return 'second';
    return 'third';
  }

  private static inferRegionOfOrigin(contact: EmailContact): string {
    // Analyze surname patterns and geographic indicators
    const lastName = contact.lastName?.toLowerCase() || '';
    
    const regionPatterns = {
      'Southeast': ['silva', 'santos', 'oliveira', 'souza', 'pereira'],
      'Northeast': ['barbosa', 'lima', 'nascimento', 'araújo', 'melo'],
      'South': ['weber', 'schmidt', 'mueller', 'hoffmann', 'schneider'],
      'North': ['cruz', 'monteiro', 'farias', 'mendes', 'pinheiro'],
      'Center-West': ['campos', 'moreira', 'teixeira', 'cardoso', 'dias']
    };

    for (const [region, surnames] of Object.entries(regionPatterns)) {
      if (surnames.some(surname => lastName.includes(surname))) {
        return region;
      }
    }

    return 'Southeast'; // Default to most common
  }

  private static estimateArrivalDecade(contact: EmailContact, generation: string): string {
    if (generation === 'first') {
      // Estimate based on age/registration patterns
      const accountAge = new Date().getFullYear() - new Date(contact.createdAt).getFullYear();
      if (accountAge > 10) return '2000s';
      if (accountAge > 5) return '2010s';
      return '2020s';
    }

    if (generation === 'second') return '1990s';
    return '1980s'; // Third generation
  }

  private static analyzeLanguageDominance(
    contact: EmailContact, 
    history: any[]
  ): 'portuguese' | 'english' | 'bilingual' {
    const sampleText = `${contact.firstName || ''} ${contact.lastName || ''} ${contact.tags?.map(t => t.name).join(' ') || ''}`;
    
    const portugueseMatches = (sampleText.match(this.LANGUAGE_PATTERNS.portuguese) || []).length;
    const bilingualMatches = (sampleText.match(this.LANGUAGE_PATTERNS.bilingual) || []).length;
    
    if (portugueseMatches > 3) return 'portuguese';
    if (bilingualMatches > 1) return 'bilingual';
    return 'english';
  }

  private static calculateCulturalRetention(
    contact: EmailContact,
    location: DiasporaLocation,
    history: any[]
  ): number {
    let score = 50; // Base score

    // Community strength influence
    score += location.communityStrength * 0.3;

    // Email engagement with Brazilian content
    const brazilianContentEngagement = history.filter(h => 
      h.subject && /brasil|brazil|carnaval|saudade/i.test(h.subject)
    ).length;
    
    if (history.length > 0) {
      score += (brazilianContentEngagement / history.length) * 40;
    }

    // Tags indicating cultural interest
    const culturalTags = ['brasil', 'brazil', 'portuguese', 'cultura', 'carnaval'];
    const tagMatches = culturalTags.filter(tag => 
      contact.tags?.some(t => t.name.toLowerCase().includes(tag))
    ).length;
    
    score += tagMatches * 5;

    return Math.min(100, Math.max(0, score));
  }

  private static assessCommunityEngagement(contact: EmailContact, location: DiasporaLocation): number {
    let score = location.communityStrength * 0.5; // Base on community strength

    // Newsletter subscription indicates community engagement
    if (contact.emailStatus === 'verified') score += 20;
    
    // Recent activity indicates engagement
    if (contact.lastActivity) {
      const daysSinceLastActivity = Math.floor(
        (Date.now() - new Date(contact.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastActivity < 7) score += 15;
      else if (daysSinceLastActivity < 30) score += 10;
      else if (daysSinceLastActivity > 90) score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private static evaluateFamilyConnections(contact: EmailContact): number {
    let score = 40; // Base score

    // Family-indicating names or information
    if (contact.tags?.some(t => t.name.includes('family')) || contact.tags?.some(t => t.name.includes('família'))) {
      score += 30;
    }

    // Multiple people from same domain (family sharing email domain)
    // This would require cross-referencing with other contacts
    
    return Math.min(100, Math.max(0, score));
  }

  private static inferEconomicStability(contact: EmailContact, location: DiasporaLocation): 'low' | 'medium' | 'high' {
    // Base assessment on community average income and engagement patterns
    if (location.averageIncome > 80000) return 'high';
    if (location.averageIncome > 50000) return 'medium';
    return 'low';
  }
}

/**
 * Travel Intent Predictor
 */
export class TravelIntentPredictor {
  private static readonly INTENT_SIGNALS = {
    high: ['vacation', 'férias', 'trip', 'viagem', 'family visit', 'nostalgia'],
    medium: ['brazil', 'brasil', 'homeland', 'culture', 'festival'],
    low: ['work', 'business', 'study', 'health']
  };

  private static readonly SEASONAL_PATTERNS = {
    'winter_escape': [12, 1, 2], // Dec-Feb
    'summer_vacation': [6, 7, 8], // Jun-Aug  
    'cultural_events': [2, 6, 12], // Carnaval, Festa Junina, New Year
    'family_time': [11, 12, 1] // Holiday season
  };

  /**
   * Predict travel intent and preferences
   */
  static predictTravelIntent(
    contact: EmailContact,
    culturalProfile: CulturalProfile,
    location: DiasporaLocation,
    emailHistory: any[]
  ): TravelIntent {
    const score = this.calculateTravelIntentScore(contact, culturalProfile, emailHistory);
    const destinations = this.predictDestinations(culturalProfile, score);
    const travelStyle = this.inferTravelStyle(location, culturalProfile);
    const groupSize = this.estimateGroupSize(culturalProfile);
    const seasonalPreference = this.analyzeSeasonalPreferences(contact, emailHistory);
    const lastTripToBrazil = this.estimateLastTrip(contact);
    const tripFrequency = this.calculateTripFrequency(culturalProfile, score);
    const motivations = this.identifyTravelMotivations(culturalProfile, emailHistory);

    return {
      score,
      destinations,
      travelStyle,
      groupSize,
      seasonalPreference,
      lastTripToBrazil,
      tripFrequency,
      motivations
    };
  }

  private static calculateTravelIntentScore(
    contact: EmailContact,
    cultural: CulturalProfile,
    history: any[]
  ): number {
    let score = 20; // Base score

    // Cultural retention strongly correlates with travel intent
    score += cultural.culturalRetention * 0.4;

    // Family connections drive travel
    score += cultural.familyConnections * 0.3;

    // Community engagement indicates active cultural interest
    score += cultural.communityEngagement * 0.2;

    // Generation factor
    const generationMultipliers = { first: 1.2, second: 1.0, third: 0.8 };
    score *= generationMultipliers[cultural.generation];

    // Email engagement with travel content
    const travelEngagement = history.filter(h => 
      h.subject && /viagem|trip|férias|vacation|destino|destination/i.test(h.subject)
    ).length;
    
    if (history.length > 0) {
      score += (travelEngagement / history.length) * 30;
    }

    // Economic stability impact
    if (cultural.economicStability === 'high') score += 15;
    else if (cultural.economicStability === 'low') score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  private static predictDestinations(cultural: CulturalProfile, intentScore: number): string[] {
    const destinations = [];

    // Primary destinations based on region of origin
    const regionDestinations = {
      'Southeast': ['Rio de Janeiro', 'São Paulo'],
      'Northeast': ['Salvador', 'Recife', 'Fortaleza'],
      'South': ['Florianópolis', 'Porto Alegre', 'Gramado'],
      'North': ['Manaus', 'Belém', 'Alter do Chão'],
      'Center-West': ['Brasília', 'Pantanal', 'Chapada dos Guimarães']
    };

    destinations.push(...(regionDestinations[cultural.regionOfOrigin as keyof typeof regionDestinations] || ['Rio de Janeiro']));

    // High intent gets premium destinations
    if (intentScore > 70) {
      destinations.push('Fernando de Noronha', 'Búzios', 'Paraty');
    }

    // Cultural events destinations
    const currentMonth = new Date().getMonth() + 1;
    if ([2, 3].includes(currentMonth)) { // Carnaval season
      destinations.unshift('Rio de Janeiro', 'Salvador');
    }

    return [...new Set(destinations)].slice(0, 5);
  }

  private static inferTravelStyle(location: DiasporaLocation, cultural: CulturalProfile): 'budget' | 'comfort' | 'luxury' {
    if (location.averageIncome > 90000 && cultural.economicStability === 'high') {
      return 'luxury';
    }
    
    if (location.averageIncome > 60000 && cultural.economicStability !== 'low') {
      return 'comfort';
    }
    
    return 'budget';
  }

  private static estimateGroupSize(cultural: CulturalProfile): number {
    // First generation tends to travel with extended family
    if (cultural.generation === 'first' && cultural.familyConnections > 60) {
      return Math.floor(Math.random() * 4) + 4; // 4-7 people
    }
    
    // Second generation - nuclear family
    if (cultural.generation === 'second') {
      return Math.floor(Math.random() * 3) + 2; // 2-4 people
    }
    
    // Third generation - couples/friends
    return Math.floor(Math.random() * 2) + 2; // 2-3 people
  }

  private static analyzeSeasonalPreferences(contact: EmailContact, history: any[]): string[] {
    const preferences: string[] = [];
    
    // Analyze historical email engagement by season
    const engagementByMonth = new Array(12).fill(0);
    
    history.forEach(h => {
      if (h.timestamp) {
        const month = new Date(h.timestamp).getMonth();
        engagementByMonth[month]++;
      }
    });
    
    // Find peak engagement seasons
    const maxEngagement = Math.max(...engagementByMonth);
    engagementByMonth.forEach((engagement, month) => {
      if (engagement > maxEngagement * 0.7) {
        if (this.SEASONAL_PATTERNS.winter_escape.includes(month + 1)) {
          preferences.push('winter_escape');
        }
        if (this.SEASONAL_PATTERNS.summer_vacation.includes(month + 1)) {
          preferences.push('summer_vacation');
        }
        if (this.SEASONAL_PATTERNS.cultural_events.includes(month + 1)) {
          preferences.push('cultural_events');
        }
        if (this.SEASONAL_PATTERNS.family_time.includes(month + 1)) {
          preferences.push('family_time');
        }
      }
    });
    
    return [...new Set(preferences)];
  }

  private static estimateLastTrip(contact: EmailContact): Date | null {
    // This would ideally come from user data or booking history
    // For now, estimate based on engagement patterns and generation
    
    const tags = contact.tags?.map(t => t.name).join(' ').toLowerCase() || '';
    if (tags.includes('recent trip') || tags.includes('viagem recente')) {
      return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    }
    
    // Default estimation based on contact creation
    const accountAge = Date.now() - new Date(contact.createdAt).getTime();
    const yearsAge = accountAge / (365 * 24 * 60 * 60 * 1000);
    
    if (yearsAge > 3) {
      return new Date(Date.now() - (2 + Math.random() * 3) * 365 * 24 * 60 * 60 * 1000);
    }
    
    return null; // Never traveled to Brazil (that we know of)
  }

  private static calculateTripFrequency(cultural: CulturalProfile, intentScore: number): 'never' | 'rare' | 'occasional' | 'frequent' {
    if (cultural.generation === 'first' && cultural.familyConnections > 70) {
      return intentScore > 60 ? 'frequent' : 'occasional';
    }
    
    if (cultural.generation === 'second' && cultural.culturalRetention > 60) {
      return intentScore > 70 ? 'occasional' : 'rare';
    }
    
    if (cultural.generation === 'third') {
      return intentScore > 80 ? 'rare' : 'never';
    }
    
    return 'rare';
  }

  private static identifyTravelMotivations(
    cultural: CulturalProfile, 
    history: any[]
  ): ('family' | 'tourism' | 'business' | 'nostalgia' | 'cultural')[] {
    const motivations: Set<string> = new Set();
    
    // Family connections drive family visits
    if (cultural.familyConnections > 50) {
      motivations.add('family');
    }
    
    // Cultural retention drives cultural/nostalgic travel
    if (cultural.culturalRetention > 60) {
      motivations.add('cultural');
      if (cultural.generation === 'first') {
        motivations.add('nostalgia');
      }
    }
    
    // Economic stability enables tourism
    if (cultural.economicStability !== 'low') {
      motivations.add('tourism');
    }
    
    // Business travel indicators from email content
    const businessKeywords = history.filter(h => 
      h.content && /negócio|business|trabalho|work|empresa|company/i.test(h.content)
    ).length;
    
    if (businessKeywords > 0) {
      motivations.add('business');
    }
    
    return Array.from(motivations) as any[];
  }
}

/**
 * Main Diaspora Intelligence Engine
 */
export class DiasporaIntelligenceEngine {
  private static insights = new Map<string, DiasporaInsight>();

  /**
   * Generate comprehensive diaspora intelligence for a contact
   */
  static async generateDiasporaInsight(
    contact: EmailContact,
    ipAddress?: string,
    userAgent?: string,
    emailHistory: any[] = []
  ): Promise<DiasporaInsight> {
    const startTime = Date.now();

    try {
      // 1. Identify geographic location
      const location = await GeoLocationIntelligence.identifyDiasporaLocation(
        ipAddress, 
        userAgent,
        contact.tags?.map(tag => tag.name).join(' ') || '' // May contain location info
      ) || DiasporaCommunityDatabase.getCommunityByKey('miami-fl')!; // Default fallback

      // 2. Analyze cultural profile
      const culturalProfile = CulturalProfileAnalyzer.analyzeCulturalProfile(
        contact, 
        location, 
        emailHistory
      );

      // 3. Predict travel intent
      const travelIntent = TravelIntentPredictor.predictTravelIntent(
        contact, 
        culturalProfile, 
        location, 
        emailHistory
      );

      // 4. Determine marketing segment
      const marketingSegment = this.determineMarketingSegment(culturalProfile, travelIntent);

      // 5. Calculate lifetime value
      const lifetimeValue = this.calculateLifetimeValue(
        culturalProfile, 
        travelIntent, 
        location
      );

      // 6. Recommend next best action
      const nextBestAction = this.recommendNextAction(
        culturalProfile, 
        travelIntent, 
        marketingSegment
      );

      // 7. Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        contact, 
        emailHistory, 
        location
      );

      const insight: DiasporaInsight = {
        contactId: contact.id,
        location,
        culturalProfile,
        travelIntent,
        marketingSegment,
        lifetimeValue,
        nextBestAction,
        confidenceScore
      };

      // Cache the insight
      this.insights.set(contact.id, insight);

      const processingTime = Date.now() - startTime;
      console.log(`🌍 Diaspora Intelligence generated in ${processingTime}ms - Confidence: ${confidenceScore}%`);

      return insight;

    } catch (error) {
      console.error('❌ Diaspora Intelligence failed:', error);
      
      // Return minimal insight as fallback
      return {
        contactId: contact.id,
        location: DiasporaCommunityDatabase.getCommunityByKey('miami-fl')!,
        culturalProfile: {
          generation: 'second',
          regionOfOrigin: 'Southeast',
          arrivalDecade: '2000s',
          languageDominance: 'bilingual',
          culturalRetention: 50,
          communityEngagement: 50,
          familyConnections: 50,
          economicStability: 'medium'
        },
        travelIntent: {
          score: 30,
          destinations: ['Rio de Janeiro'],
          travelStyle: 'comfort',
          groupSize: 2,
          seasonalPreference: ['summer_vacation'],
          lastTripToBrazil: null,
          tripFrequency: 'rare',
          motivations: ['tourism']
        },
        marketingSegment: 'Cultural Explorer',
        lifetimeValue: 5000,
        nextBestAction: 'Send cultural content to build engagement',
        confidenceScore: 20
      };
    }
  }

  private static determineMarketingSegment(
    cultural: CulturalProfile, 
    travel: TravelIntent
  ): string {
    // High-value frequent travelers
    if (travel.score > 80 && cultural.economicStability === 'high') {
      return 'Premium Traveler';
    }
    
    // Family-focused travelers
    if (cultural.familyConnections > 70 && travel.motivations.includes('family')) {
      return 'Family Reconnector';
    }
    
    // Cultural enthusiasts
    if (cultural.culturalRetention > 70 && travel.motivations.includes('cultural')) {
      return 'Cultural Ambassador';
    }
    
    // Nostalgia-driven first generation
    if (cultural.generation === 'first' && travel.motivations.includes('nostalgia')) {
      return 'Homeland Nostalgic';
    }
    
    // Discovery-oriented later generations
    if (['second', 'third'].includes(cultural.generation) && travel.score > 50) {
      return 'Heritage Explorer';
    }
    
    // Budget-conscious travelers
    if (travel.travelStyle === 'budget' && travel.score > 40) {
      return 'Smart Traveler';
    }
    
    // Business travelers
    if (travel.motivations.includes('business')) {
      return 'Business Connector';
    }
    
    return 'Cultural Explorer'; // Default segment
  }

  private static calculateLifetimeValue(
    cultural: CulturalProfile, 
    travel: TravelIntent, 
    location: DiasporaLocation
  ): number {
    let ltv = 1000; // Base LTV
    
    // Travel intent multiplier
    ltv *= (travel.score / 100) * 3 + 1;
    
    // Economic stability impact
    const stabilityMultipliers = { low: 0.6, medium: 1.0, high: 2.5 };
    ltv *= stabilityMultipliers[cultural.economicStability];
    
    // Location income adjustment
    ltv *= location.averageIncome / 65000; // Normalize to average
    
    // Frequency multiplier
    const frequencyMultipliers = { never: 0.1, rare: 0.5, occasional: 1.5, frequent: 3.0 };
    ltv *= frequencyMultipliers[travel.tripFrequency];
    
    // Group size impact
    ltv *= Math.sqrt(travel.groupSize); // Economies of scale
    
    // Cultural retention loyalty bonus
    ltv += (cultural.culturalRetention * 50);
    
    return Math.round(Math.min(50000, Math.max(500, ltv)));
  }

  private static recommendNextAction(
    cultural: CulturalProfile, 
    travel: TravelIntent, 
    segment: string
  ): string {
    if (travel.score > 80) {
      return `Send premium ${travel.destinations[0]} package with ${travel.travelStyle} options`;
    }
    
    if (travel.score > 60) {
      return `Nurture with cultural content about ${travel.destinations[0]}`;
    }
    
    if (cultural.culturalRetention > 70) {
      return 'Share Brazilian cultural events and festivals';
    }
    
    if (cultural.generation === 'first') {
      return 'Send nostalgia-focused content about homeland connections';
    }
    
    return 'Build engagement with Brazilian cultural content';
  }

  private static calculateConfidenceScore(
    contact: EmailContact, 
    history: any[], 
    location: DiasporaLocation
  ): number {
    let confidence = 40; // Base confidence
    
    // Data quality indicators
    if (contact.firstName && contact.lastName) confidence += 10;
    if (contact.tags && contact.tags.length > 3) confidence += 15;
    if (history.length > 5) confidence += 20;
    if (location.communityStrength > 70) confidence += 10;
    
    // Engagement quality
    if (contact.totalOpened > 10) confidence += 15;
    if (contact.engagementScore > 50) confidence += 10;
    
    // Recent activity
    if (contact.lastActivity) {
      const daysSince = Math.floor(
        (Date.now() - new Date(contact.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 30) confidence += 10;
    }
    
    return Math.min(100, Math.max(20, confidence));
  }

  /**
   * Get cached insight for a contact
   */
  static getCachedInsight(contactId: string): DiasporaInsight | null {
    return this.insights.get(contactId) || null;
  }

  /**
   * Bulk generate insights for multiple contacts
   */
  static async bulkGenerateInsights(
    contacts: EmailContact[], 
    emailHistoryMap: Record<string, any[]> = {}
  ): Promise<DiasporaInsight[]> {
    const insights = [];
    
    for (const contact of contacts) {
      const history = emailHistoryMap[contact.id] || [];
      const insight = await this.generateDiasporaInsight(contact, undefined, undefined, history);
      insights.push(insight);
    }
    
    return insights;
  }

  /**
   * Get community statistics
   */
  static getCommunityStats(): {
    totalCommunities: number;
    totalPopulation: number;
    averageIncome: number;
    strongestCommunities: DiasporaLocation[];
  } {
    const communities = DiasporaCommunityDatabase.getAllCommunities();
    
    return {
      totalCommunities: communities.length,
      totalPopulation: communities.reduce((sum, c) => sum + c.brazilianPopulation, 0),
      averageIncome: communities.reduce((sum, c) => sum + c.averageIncome, 0) / communities.length,
      strongestCommunities: communities
        .sort((a, b) => b.communityStrength - a.communityStrength)
        .slice(0, 5)
    };
  }
}