/**
 * Brazilian Diaspora Voice Search Targeting System
 * Location-specific voice search optimization for Brazilian communities worldwide
 * Integrates with existing diaspora data and voice patterns
 */

import { brazilianDiaspora, BrazilianCity } from '../data/brazilian-diaspora';
import { brazilianVoiceSearchPatterns, VoiceSearchPattern } from './portuguese-voice-patterns';

export interface DiasporaVoiceProfile {
  city: BrazilianCity;
  localVoicePatterns: LocalVoicePattern[];
  communityQueries: CommunityQuery[];
  locationKeywords: string[];
  culturalContext: CulturalContext;
  businessListings: LocalBusiness[];
  eventTargeting: EventTargeting[];
}

export interface LocalVoicePattern extends VoiceSearchPattern {
  localContext: string;
  communitySpecific: boolean;
  businessRelevance: number;
  seasonalImportance: number;
}

export interface CommunityQuery {
  query: string;
  intent: 'local-services' | 'travel-booking' | 'community-info' | 'cultural-events' | 'business-directory';
  urgency: 'high' | 'medium' | 'low';
  frequency: number;
  localVariations: string[];
  responseTemplate: string;
}

export interface CulturalContext {
  predominantRegion: string;
  generationMix: GenerationProfile;
  languagePreference: LanguagePreference;
  culturalEvents: string[];
  localTerminology: Record<string, string>;
}

export interface GenerationProfile {
  firstGeneration: number; // %
  secondGeneration: number; // %
  thirdGeneration: number; // %
}

export interface LanguagePreference {
  primaryPortuguese: number; // %
  bilingual: number; // %
  primaryLocal: number; // %
}

export interface LocalBusiness {
  name: string;
  type: 'restaurant' | 'market' | 'service' | 'cultural' | 'religious';
  address: string;
  voiceSearchQueries: string[];
  relevanceScore: number;
}

export interface EventTargeting {
  eventName: string;
  type: 'cultural' | 'religious' | 'business' | 'community';
  season: string;
  voiceQueries: string[];
  targetAudience: string[];
}

export class DiasporaVoiceTargeting {
  private diasporaProfiles: Map<string, DiasporaVoiceProfile> = new Map();
  
  constructor() {
    this.initializeDiasporaProfiles();
  }

  /**
   * Initialize voice profiles for all diaspora cities
   */
  private initializeDiasporaProfiles(): void {
    brazilianDiaspora.forEach(city => {
      const profile = this.createDiasporaProfile(city);
      this.diasporaProfiles.set(city.id, profile);
    });
  }

  /**
   * Create comprehensive voice profile for a diaspora city
   */
  private createDiasporaProfile(city: BrazilianCity): DiasporaVoiceProfile {
    return {
      city,
      localVoicePatterns: this.generateLocalVoicePatterns(city),
      communityQueries: this.generateCommunityQueries(city),
      locationKeywords: this.generateLocationKeywords(city),
      culturalContext: this.generateCulturalContext(city),
      businessListings: this.generateBusinessListings(city),
      eventTargeting: this.generateEventTargeting(city)
    };
  }

  /**
   * Generate location-specific voice patterns
   */
  private generateLocalVoicePatterns(city: BrazilianCity): LocalVoicePattern[] {
    const patterns: LocalVoicePattern[] = [];

    // Travel patterns specific to this city
    patterns.push({
      ...brazilianVoiceSearchPatterns[0], // Base travel pattern
      query: `Voos de ${city.name} para o Brasil quanto custa?`,
      localContext: `Moradores brasileiros em ${city.name}`,
      communitySpecific: true,
      businessRelevance: 9,
      seasonalImportance: city.priority === 'ultra-high' ? 10 : 7,
      naturalVariations: [
        `Passagem ${city.name} Brasil preço`,
        `Como viajar de ${city.name} pro Brasil barato?`,
        `Melhor voo ${city.name} Brasil`,
        `Agência brasileira ${city.name} passagem`,
        `${city.name} São Paulo voo direto tem?`
      ]
    });

    // Local service patterns
    patterns.push({
      query: `Restaurante brasileiro ${city.name} perto de mim`,
      intent: 'local-info',
      formality: 'informal',
      region: 'general',
      frequency: 'high',
      seasonality: 'year-round',
      demographics: {
        ageGroup: 'all',
        socioeconomic: 'all',
        techSavvy: 'medium'
      },
      relatedKeywords: [`comida brasileira ${city.name}`, `churrascaria ${city.name}`],
      naturalVariations: [
        `Onde comer comida brasileira em ${city.name}?`,
        `Tem churrascaria boa em ${city.name}?`,
        `Restaurante brasileiro ${city.name} recomendação`,
        `Comida caseira brasileira ${city.name}`,
        `Feijoada ${city.name} onde tem?`
      ],
      localContext: `Brasileiros em ${city.name} procurando comida familiar`,
      communitySpecific: true,
      businessRelevance: 10,
      seasonalImportance: 8
    });

    // Community service patterns
    if (city.infrastructure.consulate) {
      patterns.push({
        query: `Consulado brasileiro ${city.name} telefone`,
        intent: 'local-info',
        formality: 'formal',
        region: 'general',
        frequency: 'medium',
        seasonality: 'year-round',
        demographics: {
          ageGroup: 'adult',
          socioeconomic: 'all',
          techSavvy: 'low'
        },
        relatedKeywords: [`consulado ${city.name}`, `documentos brasileiros ${city.name}`],
        naturalVariations: [
          `Como entrar em contato consulado brasileiro ${city.name}?`,
          `Consulado brasileiro ${city.name} endereço`,
          `Renovar passaporte brasileiro ${city.name}`,
          `Serviços consulares ${city.name}`,
          `Consulado ${city.name} horário funcionamento`
        ],
        localContext: `Brasileiros precisando de serviços consulares em ${city.name}`,
        communitySpecific: true,
        businessRelevance: 8,
        seasonalImportance: 9
      });
    }

    // Money transfer patterns
    patterns.push({
      query: `Enviar dinheiro Brasil ${city.name} melhor forma`,
      intent: 'local-info',
      formality: 'informal',
      region: 'general',
      frequency: 'high',
      seasonality: 'year-round',
      demographics: {
        ageGroup: 'adult',
        socioeconomic: 'middle',
        techSavvy: 'medium'
      },
      relatedKeywords: [`remessa ${city.name}`, `transferência internacional ${city.name}`],
      naturalVariations: [
        `Como mandar dinheiro pro Brasil de ${city.name}?`,
        `Remessa online ${city.name} Brasil confiável`,
        `Western Union ${city.name} taxa`,
        `Wise ${city.name} funciona?`,
        `Casa de câmbio brasileira ${city.name}`
      ],
      localContext: `Brasileiros em ${city.name} enviando remessas`,
      communitySpecific: true,
      businessRelevance: 9,
      seasonalImportance: 8
    });

    return patterns;
  }

  /**
   * Generate community-specific queries
   */
  private generateCommunityQueries(city: BrazilianCity): CommunityQuery[] {
    const queries: CommunityQuery[] = [];

    // Local services queries
    queries.push({
      query: `Onde encontrar açaí em ${city.name}?`,
      intent: 'local-services',
      urgency: 'medium',
      frequency: city.population.brazilian > 100000 ? 8 : 5,
      localVariations: [
        `Açaí bom ${city.name}`,
        `Sorveteria açaí ${city.name}`,
        `Açaí na tigela ${city.name}`,
        `Polpa açaí onde comprar ${city.name}`
      ],
      responseTemplate: `Em ${city.name}, você pode encontrar açaí em várias lanchonetes brasileiras e mercados especializados. Recomendamos verificar os bairros com maior concentração de brasileiros como ${city.neighborhoods[0]}.`
    });

    // Community events
    queries.push({
      query: `Eventos brasileiros ${city.name} hoje`,
      intent: 'community-info',
      urgency: 'medium',
      frequency: 6,
      localVariations: [
        `Festa brasileira ${city.name}`,
        `Comunidade brasileira ${city.name} eventos`,
        `Shows brasileiros ${city.name}`,
        `Festa junina ${city.name} quando`
      ],
      responseTemplate: `A comunidade brasileira em ${city.name} organiza diversos eventos culturais. Confira nossa agenda de eventos e siga os grupos brasileiros locais nas redes sociais.`
    });

    // Business directory
    queries.push({
      query: `Dentista brasileiro ${city.name}`,
      intent: 'business-directory',
      urgency: 'high',
      frequency: 7,
      localVariations: [
        `Médico que fala português ${city.name}`,
        `Advogado brasileiro ${city.name}`,
        `Contador brasileiro ${city.name}`,
        `Profissional brasileiro ${city.name}`
      ],
      responseTemplate: `Temos uma rede de profissionais brasileiros e que falam português em ${city.name}. Entre em contato conosco para recomendações específicas.`
    });

    // Travel specific to city
    queries.push({
      query: `Voo direto ${city.name} Brasil existe?`,
      intent: 'travel-booking',
      urgency: 'high',
      frequency: city.flightRoutes.primaryDestinations.length > 2 ? 9 : 6,
      localVariations: [
        `${city.name} São Paulo direto`,
        `${city.name} Rio direto tem?`,
        `Voo sem escala ${city.name} Brasil`,
        `Melhor conexão ${city.name} Brasil`
      ],
      responseTemplate: `De ${city.name}, ${city.flightRoutes.primaryDestinations.length > 0 ? 
        `temos voos diretos para ${city.flightRoutes.primaryDestinations.slice(0, 2).join(' e ')} com ${city.flightRoutes.airlines[0]}` : 
        'não há voos diretos, mas oferecemos excelentes conexões via Miami ou New York'}.`
    });

    return queries;
  }

  /**
   * Generate location-specific keywords
   */
  private generateLocationKeywords(city: BrazilianCity): string[] {
    const keywords = [
      // City variations
      city.name.toLowerCase(),
      city.name.toLowerCase().replace(/\s+/g, ''),
      
      // Neighborhoods
      ...city.neighborhoods.map(n => n.toLowerCase()),
      
      // Airport codes and names
      ...this.getCityAirportCodes(city.name),
      
      // Regional terms
      ...this.getRegionalTerms(city.country),
      
      // Community terms
      `brasileiros ${city.name.toLowerCase()}`,
      `comunidade brasileira ${city.name.toLowerCase()}`,
      `brazilian ${city.name.toLowerCase()}`,
      
      // Business types
      `restaurante brasileiro ${city.name.toLowerCase()}`,
      `igreja brasileira ${city.name.toLowerCase()}`,
      `escola brasileira ${city.name.toLowerCase()}`,
      
      // Services
      `remessa ${city.name.toLowerCase()}`,
      `consulado ${city.name.toLowerCase()}`,
      `visto ${city.name.toLowerCase()}`
    ];

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Get airport codes for a city
   */
  private getCityAirportCodes(cityName: string): string[] {
    const airportCodes: Record<string, string[]> = {
      'New York': ['jfk', 'lga', 'ewr', 'kennedy', 'laguardia', 'newark'],
      'Miami': ['mia', 'miami international'],
      'Los Angeles': ['lax', 'los angeles international'],
      'Boston': ['bos', 'logan'],
      'Orlando': ['mco', 'orlando international'],
      'Atlanta': ['atl', 'hartsfield'],
      'Lisbon': ['lis', 'portela'],
      'London': ['lhr', 'lgw', 'stn', 'heathrow', 'gatwick'],
      'Tokyo': ['nrt', 'hnd', 'narita', 'haneda'],
      'Toronto': ['yyz', 'pearson']
    };

    return airportCodes[cityName] || [];
  }

  /**
   * Get regional terms for a country
   */
  private getRegionalTerms(country: string): string[] {
    const regionalTerms: Record<string, string[]> = {
      'USA': ['estados unidos', 'america', 'eua', 'us', 'united states'],
      'Portugal': ['portugal', 'europa', 'europe'],
      'United Kingdom': ['reino unido', 'uk', 'inglaterra', 'england', 'britain'],
      'Japan': ['japao', 'japan', 'asia'],
      'Canada': ['canada', 'toronto', 'america do norte']
    };

    return regionalTerms[country] || [];
  }

  /**
   * Generate cultural context
   */
  private generateCulturalContext(city: BrazilianCity): CulturalContext {
    // Determine predominant Brazilian region based on city characteristics
    let predominantRegion = 'southeast'; // default
    if (city.name.includes('Miami') || city.name.includes('Orlando')) {
      predominantRegion = 'northeast'; // Many nordestinos in Florida
    } else if (city.name.includes('Boston')) {
      predominantRegion = 'southeast'; // Many mineiros in Boston
    }

    // Generation mix estimation based on community age and establishment
    const generationMix: GenerationProfile = city.population.brazilian > 200000 ? 
      { firstGeneration: 60, secondGeneration: 30, thirdGeneration: 10 } :
      { firstGeneration: 70, secondGeneration: 25, thirdGeneration: 5 };

    // Language preference based on Portuguese level
    const languagePreference: LanguagePreference = city.languages.portugueseLevel === 'high' ?
      { primaryPortuguese: 70, bilingual: 25, primaryLocal: 5 } :
      city.languages.portugueseLevel === 'medium' ?
      { primaryPortuguese: 45, bilingual: 40, primaryLocal: 15 } :
      { primaryPortuguese: 25, bilingual: 45, primaryLocal: 30 };

    return {
      predominantRegion,
      generationMix,
      languagePreference,
      culturalEvents: [
        'festa junina',
        'independencia do brasil',
        'dia das criancas',
        'reveillon brasileiro',
        'carnaval'
      ],
      localTerminology: this.getLocalTerminology(city)
    };
  }

  /**
   * Get local terminology specific to the city
   */
  private getLocalTerminology(city: BrazilianCity): Record<string, string> {
    const baseTerms = {
      'mercado': 'market',
      'acougue': 'butcher',
      'farmacia': 'pharmacy',
      'escola': 'school',
      'igreja': 'church'
    };

    // Add city-specific terms
    if (city.country === 'USA') {
      return {
        ...baseTerms,
        'supermercado': 'grocery store',
        'onibus': 'bus',
        'metro': 'subway',
        'hospital': 'hospital'
      };
    }

    return baseTerms;
  }

  /**
   * Generate business listings
   */
  private generateBusinessListings(city: BrazilianCity): LocalBusiness[] {
    const businesses: LocalBusiness[] = [];

    // Generate based on city infrastructure data
    city.infrastructure.businesses.forEach(businessType => {
      businesses.push({
        name: `${businessType} Brasileiro ${city.name}`,
        type: this.mapBusinessType(businessType),
        address: `${city.neighborhoods[0]}, ${city.name}`,
        voiceSearchQueries: [
          `${businessType} brasileiro ${city.name}`,
          `${businessType} ${city.name} que fala português`,
          `melhor ${businessType} brasileiro ${city.name}`
        ],
        relevanceScore: city.population.brazilian > 100000 ? 9 : 7
      });
    });

    return businesses;
  }

  /**
   * Map business type to category
   */
  private mapBusinessType(businessType: string): 'restaurant' | 'market' | 'service' | 'cultural' | 'religious' {
    if (businessType.includes('restaurant') || businessType.includes('food')) return 'restaurant';
    if (businessType.includes('market') || businessType.includes('store')) return 'market';
    if (businessType.includes('church') || businessType.includes('religious')) return 'religious';
    if (businessType.includes('school') || businessType.includes('cultural')) return 'cultural';
    return 'service';
  }

  /**
   * Generate event targeting
   */
  private generateEventTargeting(city: BrazilianCity): EventTargeting[] {
    const events: EventTargeting[] = [
      {
        eventName: `Festa Junina ${city.name}`,
        type: 'cultural',
        season: 'summer',
        voiceQueries: [
          `festa junina ${city.name} quando`,
          `festa brasileira ${city.name} junho`,
          `evento cultural brasileiro ${city.name}`
        ],
        targetAudience: ['families', 'first-generation', 'cultural-enthusiasts']
      },
      {
        eventName: `Brazilian Independence Day ${city.name}`,
        type: 'cultural',
        season: 'fall',
        voiceQueries: [
          `independencia brasil ${city.name}`,
          `7 de setembro ${city.name} evento`,
          `celebracao brasileira ${city.name}`
        ],
        targetAudience: ['community-leaders', 'patriots', 'families']
      },
      {
        eventName: `Carnaval Brasileiro ${city.name}`,
        type: 'cultural',
        season: 'winter',
        voiceQueries: [
          `carnaval ${city.name} quando`,
          `festa carnaval brasileira ${city.name}`,
          `baile carnaval ${city.name}`
        ],
        targetAudience: ['young-adults', 'music-lovers', 'dancers']
      }
    ];

    return events;
  }

  /**
   * Get diaspora profile for a specific city
   */
  public getDiasporaProfile(cityId: string): DiasporaVoiceProfile | null {
    return this.diasporaProfiles.get(cityId) || null;
  }

  /**
   * Get voice patterns for specific location
   */
  public getLocationVoicePatterns(cityId: string): LocalVoicePattern[] {
    const profile = this.getDiasporaProfile(cityId);
    return profile ? profile.localVoicePatterns : [];
  }

  /**
   * Get community queries for location
   */
  public getCommunityQueries(cityId: string): CommunityQuery[] {
    const profile = this.getDiasporaProfile(cityId);
    return profile ? profile.communityQueries : [];
  }

  /**
   * Generate location-specific voice response
   */
  public generateLocationResponse(query: string, cityId: string): string {
    const profile = this.getDiasporaProfile(cityId);
    if (!profile) return 'Desculpe, não temos informações específicas para essa localização.';

    const matchingQuery = profile.communityQueries.find(cq => 
      query.toLowerCase().includes(cq.query.toLowerCase()) ||
      cq.localVariations.some(variation => query.toLowerCase().includes(variation.toLowerCase()))
    );

    if (matchingQuery) {
      return matchingQuery.responseTemplate;
    }

    // Default location-aware response
    return `Para informações específicas sobre a comunidade brasileira em ${profile.city.name}, 
             recomendamos entrar em contato com nossa equipe local. Temos especialistas que conhecem 
             bem a região e podem ajudar com suas necessidades.`;
  }

  /**
   * Get high-priority cities for voice search optimization
   */
  public getHighPriorityCities(): DiasporaVoiceProfile[] {
    return Array.from(this.diasporaProfiles.values())
      .filter(profile => profile.city.priority === 'ultra-high' || profile.city.priority === 'high')
      .sort((a, b) => b.city.population.brazilian - a.city.population.brazilian);
  }

  /**
   * Get regional voice variations
   */
  public getRegionalVoiceVariations(baseQuery: string, region: string): string[] {
    const variations = [baseQuery];

    // Add regional expressions based on predominant Brazilian region
    switch (region) {
      case 'northeast':
        variations.push(
          baseQuery.replace('como', 'ôxe, como'),
          baseQuery.replace('onde', 'ôxe, onde'),
          baseQuery + ', véi'
        );
        break;
      case 'southeast':
        variations.push(
          baseQuery.replace('como', 'uai, como'),
          baseQuery.replace('onde', 'uai, onde'),
          baseQuery + ', sô'
        );
        break;
      case 'south':
        variations.push(
          baseQuery.replace('como', 'bah, como'),
          baseQuery.replace('onde', 'tchê, onde'),
          baseQuery + ', bah'
        );
        break;
    }

    return [...new Set(variations)];
  }

  /**
   * Generate diaspora-specific structured data
   */
  public generateDiasporaStructuredData(cityId: string): object {
    const profile = this.getDiasporaProfile(cityId);
    if (!profile) return {};

    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: `Brazilian Community ${profile.city.name}`,
      description: `Official information and services for Brazilian community in ${profile.city.name}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.city.name,
        addressCountry: profile.city.country
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Brazilian expatriates, Portuguese speakers',
        geographicArea: {
          '@type': 'Place',
          name: profile.city.name
        }
      },
      serviceArea: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: profile.city.coordinates.lat,
          longitude: profile.city.coordinates.lng
        },
        geoRadius: '50000' // 50km radius
      },
      knowsLanguage: ['pt-BR', profile.city.languages.primary],
      memberOf: {
        '@type': 'Organization',
        name: 'Global Brazilian Diaspora Network'
      }
    };
  }
}

export default DiasporaVoiceTargeting;