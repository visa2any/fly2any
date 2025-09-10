/**
 * ULTRATHINK GLOBAL SEO CONFIGURATION
 * Optimized for worldwide visibility with USA base
 */

export const globalSEOConfig = {
  // Primary Markets (High Priority)
  primaryMarkets: {
    US: {
      name: 'United States',
      language: 'en-US',
      currency: 'USD',
      searchEngines: ['google.com', 'bing.com', 'duckduckgo.com'],
      keywords: [
        'flights to Brazil from USA',
        'Brazil travel agency USA',
        'cheap flights USA to Brazil',
        'Brazilian travel specialists',
        'Miami to Brazil flights',
        'New York to São Paulo flights',
        'Los Angeles to Rio flights'
      ],
      cities: ['Miami', 'New York', 'Los Angeles', 'Houston', 'Atlanta', 'Chicago', 'Boston', 'Orlando']
    },
    BR: {
      name: 'Brazil',
      language: 'pt-BR',
      currency: 'BRL',
      searchEngines: ['google.com.br', 'bing.com.br'],
      keywords: [
        'passagens aéreas para Brasil',
        'voos EUA Brasil',
        'agência de viagens brasileira',
        'passagens baratas Brasil',
        'voos Miami São Paulo',
        'voos internacionais Brasil'
      ],
      cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba']
    }
  },

  // Secondary Markets (Medium Priority)
  secondaryMarkets: {
    EU: {
      countries: ['UK', 'France', 'Germany', 'Spain', 'Italy', 'Portugal'],
      languages: ['en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT'],
      keywords: [
        'flights to Brazil from Europe',
        'Brazil vacation packages',
        'European travel to Brazil'
      ]
    },
    LATAM: {
      countries: ['Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru'],
      languages: ['es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE'],
      keywords: [
        'vuelos a Brasil',
        'paquetes turísticos Brasil',
        'agencia de viajes Brasil'
      ]
    },
    CANADA: {
      languages: ['en-CA', 'fr-CA'],
      keywords: [
        'flights to Brazil from Canada',
        'Toronto to Brazil flights',
        'Montreal to São Paulo'
      ]
    }
  },

  // Emerging Markets (Growth Opportunity)
  emergingMarkets: {
    ASIA: {
      countries: ['Japan', 'China', 'South Korea', 'India'],
      focus: 'Business travel and tourism'
    },
    MIDDLE_EAST: {
      countries: ['UAE', 'Saudi Arabia', 'Qatar'],
      focus: 'Luxury travel and connections'
    },
    AFRICA: {
      countries: ['South Africa', 'Nigeria', 'Egypt'],
      focus: 'Diaspora connections'
    }
  },

  // Search Engine Specific Optimizations
  searchEngines: {
    google: {
      markets: ['worldwide'],
      features: ['rich snippets', 'knowledge graph', 'local pack', 'featured snippets'],
      priority: 'highest'
    },
    bing: {
      markets: ['US', 'UK', 'Canada'],
      features: ['place actions', 'rich captions'],
      priority: 'high'
    },
    yandex: {
      markets: ['Russia', 'Eastern Europe'],
      features: ['turbo pages', 'metrika'],
      priority: 'medium'
    },
    baidu: {
      markets: ['China'],
      features: ['baike', 'zhidao'],
      priority: 'low'
    },
    naver: {
      markets: ['South Korea'],
      features: ['knowledge panel', 'blog search'],
      priority: 'low'
    }
  },

  // AI Search Optimization
  aiSearchOptimization: {
    platforms: {
      claude: {
        enabled: true,
        tags: ['travel-agency', 'brazil-specialist', 'flight-booking'],
        priority: 'high'
      },
      chatgpt: {
        enabled: true,
        tags: ['travel-services', 'brazil-flights', 'vacation-planning'],
        priority: 'high'
      },
      bard: {
        enabled: true,
        tags: ['travel-booking', 'brazil-tourism', 'flight-deals'],
        priority: 'high'
      },
      perplexity: {
        enabled: true,
        tags: ['travel-search', 'brazil-travel', 'airline-tickets'],
        priority: 'medium'
      }
    }
  },

  // Language Configurations
  languages: {
    'en-US': {
      name: 'English (US)',
      default: true,
      markets: ['US', 'Global'],
      dateFormat: 'MM/DD/YYYY',
      currencyFormat: 'USD'
    },
    'pt-BR': {
      name: 'Português (Brasil)',
      markets: ['BR', 'PT'],
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'BRL'
    },
    'es-419': {
      name: 'Español (Latinoamérica)',
      markets: ['MX', 'AR', 'CO', 'CL', 'PE'],
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'Local'
    },
    'fr-FR': {
      name: 'Français',
      markets: ['FR', 'CA', 'BE', 'CH'],
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'EUR'
    }
  },

  // Global Keywords Strategy
  globalKeywords: {
    brand: ['Fly2Any', 'Fly 2 Any', 'Fly to Any'],
    services: [
      'international flights',
      'hotel bookings',
      'car rentals',
      'travel insurance',
      'vacation packages',
      'business travel',
      'group travel',
      'last minute deals'
    ],
    destinations: [
      'Brazil',
      'São Paulo',
      'Rio de Janeiro',
      'Miami',
      'New York',
      'Los Angeles',
      'South America',
      'Latin America'
    ],
    longTail: [
      'best time to visit Brazil',
      'Brazil visa requirements USA',
      'cheapest flights to Brazil',
      'Brazil travel tips',
      'Brazil vacation cost',
      'direct flights USA to Brazil',
      'Brazil travel packages all inclusive',
      'Brazil carnival packages'
    ]
  },

  // Schema.org Enhancements
  structuredData: {
    types: [
      'TravelAgency',
      'LocalBusiness',
      'Organization',
      'FlightReservation',
      'LodgingReservation',
      'TouristTrip'
    ],
    features: [
      'aggregateRating',
      'review',
      'priceRange',
      'openingHours',
      'areaServed',
      'hasOfferCatalog'
    ]
  },

  // Performance Targets
  performanceTargets: {
    coreWebVitals: {
      LCP: 2.5, // Largest Contentful Paint (seconds)
      FID: 100, // First Input Delay (milliseconds)
      CLS: 0.1  // Cumulative Layout Shift
    },
    pageSpeed: {
      mobile: 90,
      desktop: 95
    },
    crawlability: {
      maxDepth: 4,
      maxUrls: 50000,
      crawlDelay: 1
    }
  },

  // Social Media Integration
  socialMedia: {
    platforms: {
      facebook: {
        url: 'https://facebook.com/fly2any',
        engagement: 'high',
        languages: ['en', 'pt', 'es']
      },
      instagram: {
        url: 'https://instagram.com/fly2any',
        engagement: 'high',
        hashtags: ['#Fly2Any', '#BrazilTravel', '#ViagensBrasil']
      },
      twitter: {
        url: 'https://twitter.com/fly2any',
        engagement: 'medium'
      },
      linkedin: {
        url: 'https://linkedin.com/company/fly2any',
        engagement: 'medium',
        b2b: true
      },
      youtube: {
        url: 'https://youtube.com/fly2any',
        engagement: 'growing',
        content: 'travel guides'
      }
    }
  },

  // Content Strategy
  contentStrategy: {
    blog: {
      frequency: 'weekly',
      topics: [
        'Brazil travel guides',
        'Flight deals and tips',
        'Destination highlights',
        'Travel news',
        'Customer stories'
      ],
      languages: ['en', 'pt', 'es']
    },
    landingPages: {
      cityPairs: true, // e.g., /flights/miami-to-sao-paulo
      seasonal: true,  // e.g., /brazil-carnival-packages
      deals: true      // e.g., /last-minute-flights-brazil
    }
  },

  // Monitoring and Analytics
  monitoring: {
    tools: [
      'Google Search Console',
      'Bing Webmaster Tools',
      'Google Analytics 4',
      'Microsoft Clarity',
      'Facebook Pixel'
    ],
    kpis: [
      'organic traffic',
      'conversion rate',
      'bounce rate',
      'average session duration',
      'pages per session',
      'search visibility',
      'keyword rankings'
    ]
  }
};

// Helper function to get market-specific configuration
export function getMarketConfig(marketCode: string) {
  return (globalSEOConfig.primaryMarkets as any)[marketCode] || 
         (globalSEOConfig.secondaryMarkets as any)[marketCode] ||
         null;
}

// Helper function to get language-specific keywords
export function getKeywordsByLanguage(language: string) {
  const market = Object.values(globalSEOConfig.primaryMarkets)
    .find(m => m.language === language);
  return market?.keywords || globalSEOConfig.globalKeywords.services;
}

// Helper function to check if AI crawler
export function isAICrawler(userAgent: string): boolean {
  const aiCrawlers = ['Claude-Web', 'GPTBot', 'ChatGPT', 'CCBot', 'Bard', 'Perplexity'];
  return aiCrawlers.some(bot => userAgent.includes(bot));
}

export default globalSEOConfig;