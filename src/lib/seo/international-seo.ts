/**
 * International SEO System for Multi-Language Optimization
 * Handles hreflang, geo-targeting, and culturally-adapted content
 */

export interface LanguageConfig {
  code: string;
  name: string;
  region: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  rtl: boolean;
  market: string[];
  keywords: {
    primary: string[];
    secondary: string[];
    local: string[];
  };
  competitors: string[];
  searchEngines: string[];
}

export interface GeoTarget {
  country: string;
  region?: string;
  language: string;
  currency: string;
  timezone: string;
  searchBehavior: {
    preferredDevices: string[];
    peakHours: number[];
    seasonality: string[];
  };
  localFeatures: {
    paymentMethods: string[];
    shippingOptions: string[];
    socialPlatforms: string[];
  };
}

export class InternationalSEOManager {
  private static instance: InternationalSEOManager;
  private languages = new Map<string, LanguageConfig>();
  private geoTargets = new Map<string, GeoTarget>();
  private hreflangUrls = new Map<string, Map<string, string>>();

  static getInstance(): InternationalSEOManager {
    if (!InternationalSEOManager.instance) {
      InternationalSEOManager.instance = new InternationalSEOManager();
    }
    return InternationalSEOManager.instance;
  }

  constructor() {
    this.initializeLanguages();
    this.initializeGeoTargets();
    this.setupHreflangMappings();
  }

  /**
   * Initialize supported languages
   */
  private initializeLanguages(): void {
    // Portuguese (Brazil)
    this.languages.set('pt-BR', {
      code: 'pt-BR',
      name: 'Português (Brasil)',
      region: 'BR',
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1.234,56',
      rtl: false,
      market: ['BR', 'US-Brazilian-Community'],
      keywords: {
        primary: [
          'passagens aéreas brasil', 'voos brasil eua', 'viagem brasil',
          'passagem brasil', 'voos baratos brasil', 'agência viagem brasileiros'
        ],
        secondary: [
          'miami são paulo', 'new york rio janeiro', 'orlando brasil',
          'passagem aérea', 'companhia aérea', 'reserva voo'
        ],
        local: [
          'brasileiros nos eua', 'comunidade brasileira', 'voos para o brasil',
          'volta ao brasil', 'visita família brasil', 'feriados brasil'
        ]
      },
      competitors: [
        'decolar.com', 'submarino.com.br', 'latam.com', 'azul.com.br'
      ],
      searchEngines: ['google.com.br', 'bing.com', 'yahoo.com.br']
    });

    // English (US)
    this.languages.set('en-US', {
      code: 'en-US',
      name: 'English (United States)',
      region: 'US',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: '1,234.56',
      rtl: false,
      market: ['US', 'CA', 'AU', 'GB'],
      keywords: {
        primary: [
          'flights to brazil', 'brazil travel', 'brazil vacation',
          'cheap flights brazil', 'brazil travel agency', 'trips to brazil'
        ],
        secondary: [
          'rio de janeiro flights', 'sao paulo flights', 'brazil hotels',
          'brazil tours', 'travel insurance brazil', 'brazil visa'
        ],
        local: [
          'brazil travel from usa', 'american tourists brazil',
          'english speaking travel agent', 'brazil travel guide',
          'best time visit brazil', 'brazil travel packages'
        ]
      },
      competitors: [
        'kayak.com', 'expedia.com', 'priceline.com', 'orbitz.com'
      ],
      searchEngines: ['google.com', 'bing.com', 'duckduckgo.com']
    });

    // Spanish (LATAM)
    this.languages.set('es-419', {
      code: 'es-419',
      name: 'Español (Latinoamérica)',
      region: 'LATAM',
      currency: 'USD',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1.234,56',
      rtl: false,
      market: ['MX', 'CO', 'AR', 'CL', 'PE', 'US-Latino-Community'],
      keywords: {
        primary: [
          'vuelos a brasil', 'viajes brasil', 'vacaciones brasil',
          'vuelos baratos brasil', 'agencia viajes brasil', 'paquetes brasil'
        ],
        secondary: [
          'vuelos rio janeiro', 'vuelos sao paulo', 'hoteles brasil',
          'tours brasil', 'seguro viaje brasil', 'visa brasil'
        ],
        local: [
          'latinos en brasil', 'comunidad hispana', 'viajes desde mexico',
          'turismo brasil latinoamerica', 'vacaciones familiares brasil'
        ]
      },
      competitors: [
        'despegar.com', 'viajesfalabella.com', 'almundo.com'
      ],
      searchEngines: ['google.com', 'google.com.mx', 'google.com.ar']
    });

    // French (Canada)
    this.languages.set('fr-CA', {
      code: 'fr-CA',
      name: 'Français (Canada)',
      region: 'CA',
      currency: 'CAD',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1 234,56',
      rtl: false,
      market: ['CA-QC', 'FR'],
      keywords: {
        primary: [
          'vols vers brésil', 'voyage brésil', 'vacances brésil',
          'billets davion brésil', 'agence voyage brésil'
        ],
        secondary: [
          'rio janeiro vols', 'sao paulo vols', 'hôtels brésil',
          'circuits brésil', 'assurance voyage brésil'
        ],
        local: [
          'voyage brésil depuis canada', 'québécois au brésil',
          'francophone brésil', 'guide voyage brésil français'
        ]
      },
      competitors: [
        'expedia.ca', 'kayak.ca', 'flightcentre.ca'
      ],
      searchEngines: ['google.ca', 'bing.com']
    });
  }

  /**
   * Initialize geo-targeting configurations
   */
  private initializeGeoTargets(): void {
    // United States
    this.geoTargets.set('US', {
      country: 'US',
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York',
      searchBehavior: {
        preferredDevices: ['desktop', 'mobile'],
        peakHours: [9, 12, 15, 19, 21],
        seasonality: ['summer-vacation', 'winter-holidays', 'spring-break']
      },
      localFeatures: {
        paymentMethods: ['credit-card', 'paypal', 'apple-pay', 'google-pay'],
        shippingOptions: ['standard', 'express', 'overnight'],
        socialPlatforms: ['facebook', 'instagram', 'twitter', 'linkedin']
      }
    });

    // Brazil
    this.geoTargets.set('BR', {
      country: 'BR',
      language: 'pt',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      searchBehavior: {
        preferredDevices: ['mobile', 'desktop'],
        peakHours: [10, 14, 18, 20, 22],
        seasonality: ['carnaval', 'festa-junina', 'natal', 'reveillon']
      },
      localFeatures: {
        paymentMethods: ['pix', 'credit-card', 'boleto', 'debit-card'],
        shippingOptions: ['sedex', 'pac', 'express'],
        socialPlatforms: ['whatsapp', 'instagram', 'facebook', 'tiktok']
      }
    });

    // Mexico
    this.geoTargets.set('MX', {
      country: 'MX',
      language: 'es',
      currency: 'MXN',
      timezone: 'America/Mexico_City',
      searchBehavior: {
        preferredDevices: ['mobile', 'desktop'],
        peakHours: [11, 13, 16, 19, 21],
        seasonality: ['dia-muertos', 'navidad', 'semana-santa', 'vacaciones-verano']
      },
      localFeatures: {
        paymentMethods: ['oxxo', 'credit-card', 'paypal', 'spei'],
        shippingOptions: ['standard', 'express', 'same-day'],
        socialPlatforms: ['whatsapp', 'facebook', 'instagram', 'twitter']
      }
    });
  }

  /**
   * Setup hreflang URL mappings
   */
  private setupHreflangMappings(): void {
    const pages = [
      '/',
      '/voos-brasil-eua',
      '/voos-miami-sao-paulo',
      '/voos-new-york-rio-janeiro',
      '/hoteis',
      '/blog',
      '/contato',
      '/sobre'
    ];

    pages.forEach(page => {
      const langMap = new Map<string, string>();
      
      // Portuguese (Default/Primary)
      langMap.set('pt-BR', `https://fly2any.com${page}`);
      langMap.set('pt', `https://fly2any.com${page}`);
      
      // English
      langMap.set('en-US', `https://fly2any.com/en${page}`);
      langMap.set('en', `https://fly2any.com/en${page}`);
      
      // Spanish
      langMap.set('es-419', `https://fly2any.com/es${page}`);
      langMap.set('es', `https://fly2any.com/es${page}`);
      
      // French
      langMap.set('fr-CA', `https://fly2any.com/fr${page}`);
      langMap.set('fr', `https://fly2any.com/fr${page}`);
      
      // Default fallback
      langMap.set('x-default', `https://fly2any.com${page}`);
      
      this.hreflangUrls.set(page, langMap);
    });
  }

  /**
   * Generate hreflang tags for a specific page
   */
  generateHreflangTags(pathname: string): string {
    const cleanPath = this.cleanPathname(pathname);
    const langMap = this.hreflangUrls.get(cleanPath) || this.hreflangUrls.get('/');
    
    if (!langMap) return '';

    const tags: string[] = [];
    
    langMap.forEach((url, hreflang) => {
      tags.push(`<link rel="alternate" hreflang="${hreflang}" href="${url}" />`);
    });

    return tags.join('\n    ');
  }

  /**
   * Generate canonical URL for current page
   */
  generateCanonicalUrl(pathname: string, language: string = 'pt-BR'): string {
    const cleanPath = this.cleanPathname(pathname);
    const langMap = this.hreflangUrls.get(cleanPath);
    
    if (langMap && langMap.has(language)) {
      return langMap.get(language)!;
    }

    // Fallback to default
    return `https://fly2any.com${cleanPath}`;
  }

  /**
   * Get localized keywords for a language/region
   */
  getLocalizedKeywords(langCode: string, type: 'primary' | 'secondary' | 'local' = 'primary'): string[] {
    const config = this.languages.get(langCode);
    return config ? config.keywords[type] : [];
  }

  /**
   * Get currency for a language/region
   */
  getCurrency(langCode: string): string {
    const config = this.languages.get(langCode);
    return config ? config.currency : 'USD';
  }

  /**
   * Get date format for a language/region
   */
  getDateFormat(langCode: string): string {
    const config = this.languages.get(langCode);
    return config ? config.dateFormat : 'MM/DD/YYYY';
  }

  /**
   * Get geo-specific search optimization
   */
  getGeoOptimization(countryCode: string): GeoTarget | null {
    return this.geoTargets.get(countryCode) || null;
  }

  /**
   * Generate localized meta tags
   */
  generateLocalizedMeta(pathname: string, language: string, data: any): object {
    const config = this.languages.get(language);
    if (!config) return {};

    const baseUrl = this.generateCanonicalUrl(pathname, language);
    const cleanPath = this.cleanPathname(pathname);

    return {
      title: this.generateLocalizedTitle(cleanPath, language, data),
      description: this.generateLocalizedDescription(cleanPath, language, data),
      keywords: this.getLocalizedKeywords(language).join(', '),
      'og:title': this.generateLocalizedTitle(cleanPath, language, data),
      'og:description': this.generateLocalizedDescription(cleanPath, language, data),
      'og:url': baseUrl,
      'og:locale': language,
      'og:locale:alternate': this.getAlternateLocales(language),
      canonical: baseUrl,
      hreflang: this.generateHreflangTags(pathname),
      language: language,
      region: config.region,
      currency: config.currency
    };
  }

  private cleanPathname(pathname: string): string {
    // Remove language prefixes
    return pathname
      .replace(/^\/en/, '')
      .replace(/^\/es/, '')
      .replace(/^\/fr/, '')
      .replace(/^\/pt/, '') || '/';
  }

  private generateLocalizedTitle(path: string, language: string, data: any): string {
    const config = this.languages.get(language);
    if (!config) return data.title || 'Fly2Any';

    const templates: { [key: string]: { [lang: string]: string } } = {
      '/': {
        'pt-BR': 'Fly2Any - Especialistas em Viagens para o Brasil | Voos, Hotéis, Seguros',
        'en-US': 'Fly2Any - Brazil Travel Specialists | Flights, Hotels, Insurance', 
        'es-419': 'Fly2Any - Especialistas en Viajes a Brasil | Vuelos, Hoteles, Seguros',
        'fr-CA': 'Fly2Any - Spécialistes Voyages Brésil | Vols, Hôtels, Assurances'
      },
      '/voos-miami-sao-paulo': {
        'pt-BR': 'Voos Miami - São Paulo | Passagens MIA-GRU | Fly2Any',
        'en-US': 'Miami to São Paulo Flights | MIA-GRU Tickets | Fly2Any',
        'es-419': 'Vuelos Miami - São Paulo | Boletos MIA-GRU | Fly2Any',
        'fr-CA': 'Vols Miami - São Paulo | Billets MIA-GRU | Fly2Any'
      }
    };

    const pathTemplates = templates[path];
    if (pathTemplates && pathTemplates[language]) {
      return pathTemplates[language];
    }

    return data.title || `Fly2Any - ${config.name}`;
  }

  private generateLocalizedDescription(path: string, language: string, data: any): string {
    const templates: { [key: string]: { [lang: string]: string } } = {
      '/': {
        'pt-BR': 'Especialistas em viagens para o Brasil há mais de 10 anos. Voos, hotéis, carros, seguro viagem e passeios. Atendimento em português 24/7. Cotação gratuita em 2 horas!',
        'en-US': 'Brazil travel specialists for over 10 years. Flights, hotels, cars, travel insurance, and tours. 24/7 English support. Free quote in 2 hours!',
        'es-419': 'Especialistas en viajes a Brasil por más de 10 años. Vuelos, hoteles, autos, seguro de viaje y tours. Soporte 24/7 en español. ¡Cotización gratis en 2 horas!',
        'fr-CA': 'Spécialistes des voyages au Brésil depuis plus de 10 ans. Vols, hôtels, voitures, assurance voyage et circuits. Support 24/7 en français. Devis gratuit en 2 heures!'
      }
    };

    const pathTemplates = templates[path];
    if (pathTemplates && pathTemplates[language]) {
      return pathTemplates[language];
    }

    return data.description || 'Fly2Any - Brazil Travel Specialists';
  }

  private getAlternateLocales(currentLanguage: string): string[] {
    const allLocales = Array.from(this.languages.keys());
    return allLocales.filter(locale => locale !== currentLanguage);
  }

  /**
   * Generate structured data for international SEO
   */
  generateInternationalStructuredData(language: string, data: any): object {
    const config = this.languages.get(language);
    if (!config) return {};

    return {
      "@context": "https://schema.org",
      "@type": "WebSite", 
      "name": "Fly2Any",
      "url": `https://fly2any.com${language !== 'pt-BR' ? '/' + language.split('-')[0] : ''}`,
      "inLanguage": language,
      "audience": {
        "@type": "Audience",
        "geographicArea": {
          "@type": "AdministrativeArea",
          "name": config.region
        }
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": config.currency,
        "availability": "InStock"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://fly2any.com${language !== 'pt-BR' ? '/' + language.split('-')[0] : ''}/cotacao?q={search_term_string}`,
          "inLanguage": language
        },
        "query-input": "required name=search_term_string"
      }
    };
  }

  /**
   * Get seasonal content optimization for region
   */
  getSeasonalOptimization(countryCode: string, currentDate: Date): any {
    const geoTarget = this.geoTargets.get(countryCode);
    if (!geoTarget) return null;

    const month = currentDate.getMonth();
    const seasonalData = {
      'BR': {
        0: { season: 'verao', keywords: ['carnaval', 'verao brasil', 'alta temporada'] },
        3: { season: 'outono', keywords: ['clima ameno', 'baixa temporada', 'precos baixos'] },
        6: { season: 'inverno', keywords: ['festa junina', 'inverno brasil', 'temporada seca'] },
        9: { season: 'primavera', keywords: ['primavera brasil', 'tempo bom', 'flores'] }
      },
      'US': {
        0: { season: 'winter', keywords: ['winter travel', 'escape cold', 'warm weather'] },
        3: { season: 'spring', keywords: ['spring break', 'easter vacation', 'mild weather'] },
        6: { season: 'summer', keywords: ['summer vacation', 'peak season', 'family travel'] },
        9: { season: 'fall', keywords: ['fall travel', 'shoulder season', 'good weather'] }
      }
    };

    const countrySeasons = seasonalData[countryCode as keyof typeof seasonalData];
    const seasonKey = Math.floor(month / 3) * 3;
    
    return countrySeasons ? countrySeasons[seasonKey as keyof typeof countrySeasons] : null;
  }

  /**
   * Generate robots.txt entries for international versions
   */
  generateInternationalRobotsTxt(): string {
    const entries = [];
    
    // Add sitemaps for each language
    this.languages.forEach((config, langCode) => {
      const langPrefix = langCode === 'pt-BR' ? '' : langCode.split('-')[0];
      const sitemapUrl = `https://fly2any.com${langPrefix ? '/' + langPrefix : ''}/sitemap.xml`;
      entries.push(`Sitemap: ${sitemapUrl}`);
    });

    // Add language-specific allows
    entries.push('# Multi-language support');
    entries.push('Allow: /en/');
    entries.push('Allow: /es/'); 
    entries.push('Allow: /fr/');
    entries.push('Allow: /pt/');

    return entries.join('\n');
  }

  /**
   * Inject international SEO tags into document head
   */
  injectInternationalSEO(pathname: string, currentLanguage: string): void {
    if (typeof document === 'undefined') return;

    // Generate and inject hreflang tags
    const hreflangTags = this.generateHreflangTags(pathname);
    const hreflangContainer = document.getElementById('hreflang-tags');
    
    if (hreflangContainer) {
      hreflangContainer.innerHTML = hreflangTags;
    } else {
      const container = document.createElement('div');
      container.id = 'hreflang-tags';
      container.innerHTML = hreflangTags;
      document.head.appendChild(container);
    }

    // Inject canonical URL
    const canonicalUrl = this.generateCanonicalUrl(pathname, currentLanguage);
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    
    canonicalLink.href = canonicalUrl;

    // Set HTML lang attribute
    document.documentElement.lang = currentLanguage.split('-')[0];

    // Add Open Graph locale tags
    const ogLocale = document.querySelector('meta[property="og:locale"]') as HTMLMetaElement;
    if (ogLocale) {
      ogLocale.content = currentLanguage;
    }
  }

  /**
   * Get supported languages list
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Array.from(this.languages.values());
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(langCode: string): LanguageConfig | undefined {
    return this.languages.get(langCode);
  }

  /**
   * Validate language code
   */
  isValidLanguage(langCode: string): boolean {
    return this.languages.has(langCode);
  }
}

export default InternationalSEOManager;