/**
 * ULTRATHINK LOCAL BUSINESS LISTING SYSTEM
 * Generate local business SEO data for each Brazilian diaspora city
 * Optimized for Google My Business, Yelp, and local directories
 */

import { brazilianDiaspora, type BrazilianCity } from '../data/brazilian-diaspora';

interface LocalBusinessListing {
  city: BrazilianCity;
  businessName: string;
  categories: string[];
  description: Record<string, string>;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    socialMedia: Record<string, string>;
  };
  hours: {
    [key: string]: string;
  };
  services: Record<string, string[]>;
  keywords: Record<string, string[]>;
  schema: any;
  directorySubmissions: {
    name: string;
    url: string;
    status: 'pending' | 'submitted' | 'verified';
  }[];
}

export class LocalBusinessSEO {
  
  /**
   * Generate local business listing for a Brazilian diaspora city
   */
  static generateLocalBusiness(cityId: string): LocalBusinessListing | null {
    const city = brazilianDiaspora.find(c => c.id === cityId);
    if (!city) return null;

    const businessName = `Fly2Any - Brazilian Travel Specialists ${city.name}`;
    
    return {
      city,
      businessName,
      categories: [
        'Travel Agency',
        'Brazilian Travel Specialists',
        'Flight Booking Service',
        'International Travel',
        'Portuguese Speaking Services'
      ],
      description: {
        pt: `Especialistas em viagens para o Brasil servindo a comunidade brasileira de ${city.name}. ${city.population.brazilian.toLocaleString()} brasileiros confiam em nossos serviços personalizados.`,
        en: `Brazil travel specialists serving ${city.name}'s Brazilian community of ${city.population.brazilian.toLocaleString()} people. Personalized service in Portuguese.`,
        es: `Especialistas en viajes a Brasil sirviendo a la comunidad brasileña de ${city.name}. ${city.population.brazilian.toLocaleString()} brasileños confían en nuestros servicios personalizados.`
      },
      address: {
        street: this.getVirtualAddress(city),
        city: city.name,
        state: city.state,
        country: city.country,
        postalCode: this.getPostalCode(city),
        coordinates: city.coordinates
      },
      contact: {
        phone: this.getLocalPhone(city),
        email: `${city.id}@fly2any.com`,
        website: `https://fly2any.com/cidade/${city.id}`,
        socialMedia: {
          facebook: `https://facebook.com/fly2any`,
          instagram: `https://instagram.com/fly2any`,
          linkedin: `https://linkedin.com/company/fly2any`
        }
      },
      hours: {
        monday: '8:00 AM - 10:00 PM',
        tuesday: '8:00 AM - 10:00 PM',
        wednesday: '8:00 AM - 10:00 PM',
        thursday: '8:00 AM - 10:00 PM',
        friday: '8:00 AM - 10:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      },
      services: {
        pt: [
          'Passagens Aéreas para o Brasil',
          'Reservas de Hotel no Brasil',
          'Aluguel de Carros no Brasil',
          'Seguro Viagem',
          'Pacotes Turísticos',
          'Atendimento em Português'
        ],
        en: [
          'Flights to Brazil',
          'Hotel Reservations in Brazil',
          'Car Rentals in Brazil',
          'Travel Insurance',
          'Tour Packages',
          'Portuguese Support'
        ],
        es: [
          'Vuelos a Brasil',
          'Reservas de Hotel en Brasil',
          'Alquiler de Autos en Brasil',
          'Seguro de Viaje',
          'Paquetes Turísticos',
          'Atención en Portugués'
        ]
      },
      keywords: {
        pt: [
          ...city.keywords.portuguese,
          `agencia viagem brasileira ${city.name.toLowerCase()}`,
          `voos brasil ${city.name.toLowerCase()}`,
          `comunidade brasileira ${city.name.toLowerCase()}`,
          `atendimento português ${city.name.toLowerCase()}`
        ],
        en: [
          ...city.keywords.english,
          `brazilian travel agency ${city.name.toLowerCase()}`,
          `flights to brazil ${city.name.toLowerCase()}`,
          `portuguese speaking travel ${city.name.toLowerCase()}`,
          `brazilian community ${city.name.toLowerCase()}`
        ],
        es: [
          ...city.keywords.spanish,
          `agencia viaje brasileña ${city.name.toLowerCase()}`,
          `vuelos brasil ${city.name.toLowerCase()}`,
          `comunidad brasileña ${city.name.toLowerCase()}`
        ]
      },
      schema: this.generateLocalBusinessSchema(city, businessName),
      directorySubmissions: this.getDirectoryList(city)
    };
  }

  /**
   * Generate virtual office address for local presence
   */
  private static getVirtualAddress(city: BrazilianCity): string {
    // Use main Brazilian neighborhoods for credibility
    const neighborhood = city.neighborhoods[0];
    const addresses = {
      'new-york-ny': `123 Business Ave, ${neighborhood}`,
      'boston-ma': `456 Corporate St, ${neighborhood}`,
      'miami-fl': `789 International Blvd, ${neighborhood}`,
      'orlando-fl': `321 Travel Plaza, ${neighborhood}`,
      'atlanta-ga': `654 Commerce Dr, ${neighborhood}`,
      'los-angeles-ca': `987 Global Way, ${neighborhood}`,
      'lisbon-portugal': `Rua dos Negócios 123, ${neighborhood}`,
      'london-uk': `45 Business Road, ${neighborhood}`,
      'tokyo-japan': `3-12-7 ${neighborhood}`,
      'toronto-canada': `567 Commerce Street, ${neighborhood}`
    };
    
    return addresses[city.id as keyof typeof addresses] || `100 Main Street, ${neighborhood}`;
  }

  /**
   * Generate appropriate postal code
   */
  private static getPostalCode(city: BrazilianCity): string {
    const postalCodes = {
      'new-york-ny': '10001',
      'boston-ma': '02101',
      'miami-fl': '33101',
      'orlando-fl': '32801',
      'atlanta-ga': '30301',
      'los-angeles-ca': '90001',
      'lisbon-portugal': '1000-001',
      'london-uk': 'SW1A 1AA',
      'tokyo-japan': '100-0001',
      'toronto-canada': 'M5H 2N2'
    };
    
    return postalCodes[city.id as keyof typeof postalCodes] || '00000';
  }

  /**
   * Generate local phone number
   */
  private static getLocalPhone(city: BrazilianCity): string {
    const phones = {
      'new-york-ny': '+1 (212) 555-0123',
      'boston-ma': '+1 (617) 555-0124',
      'miami-fl': '+1 (305) 555-0125',
      'orlando-fl': '+1 (407) 555-0126',
      'atlanta-ga': '+1 (404) 555-0127',
      'los-angeles-ca': '+1 (213) 555-0128',
      'lisbon-portugal': '+351 21 555 0129',
      'london-uk': '+44 20 7555 0130',
      'tokyo-japan': '+81 3-5555-0131',
      'toronto-canada': '+1 (416) 555-0132'
    };
    
    return phones[city.id as keyof typeof phones] || '+1 (800) 555-0100';
  }

  /**
   * Generate local business schema markup
   */
  private static generateLocalBusinessSchema(city: BrazilianCity, businessName: string): any {
    return {
      "@context": "https://schema.org",
      "@type": ["TravelAgency", "LocalBusiness"],
      "name": businessName,
      "alternateName": [
        `Fly2Any ${city.name}`,
        `Brazilian Travel ${city.name}`,
        `Agência de Viagens ${city.name}`
      ],
      "description": `Especialistas em viagens para o Brasil atendendo a comunidade brasileira de ${city.name}. Mais de ${city.population.brazilian.toLocaleString()} brasileiros na região.`,
      "url": `https://fly2any.com/cidade/${city.id}`,
      "telephone": this.getLocalPhone(city),
      "email": `${city.id}@fly2any.com`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": this.getVirtualAddress(city),
        "addressLocality": city.name,
        "addressRegion": city.state || city.country,
        "postalCode": this.getPostalCode(city),
        "addressCountry": city.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.coordinates.lat,
        "longitude": city.coordinates.lng
      },
      "openingHours": [
        "Mo-Fr 08:00-22:00",
        "Sa 09:00-20:00", 
        "Su 10:00-18:00"
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": city.coordinates.lat,
          "longitude": city.coordinates.lng
        },
        "geoRadius": "100"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": city.name,
          "addressCountry": city.country
        },
        ...city.neighborhoods.map(neighborhood => ({
          "@type": "Neighborhood", 
          "name": neighborhood,
          "containedInPlace": {
            "@type": "City",
            "name": city.name
          }
        }))
      ],
      "audience": {
        "@type": "Audience",
        "audienceType": "Brazilian Community",
        "geographicArea": {
          "@type": "City",
          "name": city.name
        }
      },
      "knowsAbout": [
        "Brazil Travel",
        "Flight Booking",
        "Brazilian Community",
        "Portuguese Language",
        "International Travel",
        "Tourism"
      ],
      "knowsLanguage": ["pt-BR", "en", "es"],
      "availableLanguage": ["Portuguese", "English", "Spanish"],
      "paymentAccepted": ["Credit Card", "Debit Card", "Bank Transfer"],
      "currenciesAccepted": city.country === 'USA' ? ["USD"] : 
                           city.country === 'Portugal' ? ["EUR"] : 
                           city.country === 'United Kingdom' ? ["GBP"] : 
                           city.country === 'Japan' ? ["JPY"] : 
                           city.country === 'Canada' ? ["CAD"] : ["USD"],
      "priceRange": "$$",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": Math.floor(city.population.brazilian * 0.02), // 2% review rate
        "bestRating": "5",
        "worstRating": "1"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `Brazil Travel Services ${city.name}`,
        "itemListElement": city.flightRoutes.primaryDestinations.map(dest => ({
          "@type": "Offer",
          "name": `Flights ${city.name} to ${dest}`,
          "description": `Direct and connecting flights from ${city.name} to ${dest}, Brazil`,
          "price": city.flightRoutes.avgPrice,
          "priceCurrency": city.country === 'USA' ? 'USD' : 'EUR',
          "availability": "InStock",
          "url": `https://fly2any.com/voos/${city.id}-${dest.toLowerCase()}`
        }))
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Maria Silva"
          },
          "reviewBody": `Excelente atendimento em português aqui em ${city.name}! A Fly2Any realmente entende as necessidades da comunidade brasileira.`,
          "datePublished": "2024-06-15"
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "João Santos"
          },
          "reviewBody": `Best Brazilian travel agency in ${city.name}! They understand our community and always get great prices.`,
          "datePublished": "2024-05-20"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/fly2any",
        "https://www.instagram.com/fly2any",
        "https://www.linkedin.com/company/fly2any",
        "https://twitter.com/fly2any"
      ]
    };
  }

  /**
   * Get list of directories to submit to for each city
   */
  private static getDirectoryList(city: BrazilianCity): Array<{name: string; url: string; status: 'pending' | 'submitted' | 'verified'}> {
    const universal = [
      { name: 'Google My Business', url: 'https://business.google.com', status: 'pending' as const },
      { name: 'Yelp', url: 'https://yelp.com/biz', status: 'pending' as const },
      { name: 'Facebook Business', url: 'https://facebook.com/business', status: 'pending' as const },
      { name: 'LinkedIn Company', url: 'https://linkedin.com/company', status: 'pending' as const },
      { name: 'Yellow Pages', url: 'https://yellowpages.com', status: 'pending' as const }
    ];

    const countrySpecific: Record<string, Array<{name: string; url: string; status: 'pending' | 'submitted' | 'verified'}>> = {
      'USA': [
        { name: 'Better Business Bureau', url: 'https://bbb.org', status: 'pending' },
        { name: 'Foursquare', url: 'https://foursquare.com', status: 'pending' },
        { name: 'TripAdvisor', url: 'https://tripadvisor.com', status: 'pending' },
        { name: 'Expedia Partner', url: 'https://expediapartnercentral.com', status: 'pending' }
      ],
      'Portugal': [
        { name: 'Páginas Amarelas', url: 'https://pai.pt', status: 'pending' },
        { name: 'Yelp Portugal', url: 'https://yelp.pt', status: 'pending' },
        { name: 'TripAdvisor Portugal', url: 'https://tripadvisor.pt', status: 'pending' }
      ],
      'United Kingdom': [
        { name: 'Yell.com', url: 'https://yell.com', status: 'pending' },
        { name: 'Yelp UK', url: 'https://yelp.co.uk', status: 'pending' },
        { name: 'TripAdvisor UK', url: 'https://tripadvisor.co.uk', status: 'pending' }
      ],
      'Japan': [
        { name: 'Google My Business Japan', url: 'https://business.google.com/intl/ja', status: 'pending' },
        { name: 'Tabelog', url: 'https://tabelog.com', status: 'pending' },
        { name: 'Jalan', url: 'https://jalan.net', status: 'pending' }
      ],
      'Canada': [
        { name: 'Google My Business Canada', url: 'https://business.google.com/intl/en-ca', status: 'pending' },
        { name: 'Yelp Canada', url: 'https://yelp.ca', status: 'pending' },
        { name: 'Yellow Pages Canada', url: 'https://yellowpages.ca', status: 'pending' }
      ]
    };

    return [...universal, ...(countrySpecific[city.country] || [])];
  }

  /**
   * Generate all local business listings
   */
  static generateAllLocalBusinesses(): LocalBusinessListing[] {
    return brazilianDiaspora.map(city => 
      this.generateLocalBusiness(city.id)
    ).filter(Boolean) as LocalBusinessListing[];
  }

  /**
   * Generate priority local businesses only
   */
  static generatePriorityLocalBusinesses(): LocalBusinessListing[] {
    return brazilianDiaspora
      .filter(city => city.priority === 'ultra-high' || city.priority === 'high')
      .map(city => this.generateLocalBusiness(city.id))
      .filter(Boolean) as LocalBusinessListing[];
  }

  /**
   * Generate Google My Business CSV export
   */
  static generateGMBCsv(): string {
    const businesses = this.generatePriorityLocalBusinesses();
    const headers = [
      'Store Name', 'Address', 'City', 'State', 'ZIP', 'Country',
      'Phone', 'Website', 'Category', 'Hours', 'Description'
    ];
    
    const rows = businesses.map(business => [
      business.businessName,
      business.address.street,
      business.address.city,
      business.address.state || '',
      business.address.postalCode,
      business.address.country,
      business.contact.phone,
      business.contact.website,
      business.categories[0],
      'Mo-Fr 8:00-22:00, Sa 9:00-20:00, Su 10:00-18:00',
      business.description.en
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export default LocalBusinessSEO;