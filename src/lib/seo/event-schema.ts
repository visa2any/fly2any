/**
 * Event Schema Generator for Brazilian Cultural Events
 * Generates structured data for festivals, cultural events, and travel-related events
 */

export interface EventData {
  name: string;
  description: string;
  url: string;
  image: string[];
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: {
      streetAddress?: string;
      addressLocality: string;
      addressRegion?: string;
      addressCountry: string;
      postalCode?: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
  };
  organizer: {
    name: string;
    url?: string;
    email?: string;
    phone?: string;
  };
  offers?: {
    price: number;
    currency: string;
    availability: 'InStock' | 'SoldOut' | 'PreOrder';
    url?: string;
    seller?: {
      name: string;
      url: string;
    };
  };
  performer?: Array<{
    name: string;
    type: 'Person' | 'PerformingGroup';
    description?: string;
  }>;
  eventStatus?: 'EventScheduled' | 'EventPostponed' | 'EventCancelled' | 'EventRescheduled';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
  audience?: {
    audienceType: string;
    geographicArea?: string;
  };
  inLanguage?: string[];
  category?: string;
  duration?: string; // ISO 8601 duration format
}

export class EventSchema {
  /**
   * Generate comprehensive Event schema
   */
  static generateEvent(data: EventData): object {
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": data.name,
      "description": data.description,
      "url": data.url,
      "image": data.image,
      "startDate": data.startDate,
      ...(data.endDate && { "endDate": data.endDate }),
      "location": {
        "@type": "Place",
        "name": data.location.name,
        "address": {
          "@type": "PostalAddress",
          ...(data.location.address.streetAddress && { "streetAddress": data.location.address.streetAddress }),
          "addressLocality": data.location.address.addressLocality,
          ...(data.location.address.addressRegion && { "addressRegion": data.location.address.addressRegion }),
          "addressCountry": data.location.address.addressCountry,
          ...(data.location.address.postalCode && { "postalCode": data.location.address.postalCode })
        },
        ...(data.location.geo && {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": data.location.geo.latitude,
            "longitude": data.location.geo.longitude
          }
        })
      },
      "organizer": {
        "@type": "Organization",
        "name": data.organizer.name,
        ...(data.organizer.url && { "url": data.organizer.url }),
        ...(data.organizer.email && { "email": data.organizer.email }),
        ...(data.organizer.phone && { "telephone": data.organizer.phone })
      },
      ...(data.offers && {
        "offers": {
          "@type": "Offer",
          "price": data.offers.price,
          "priceCurrency": data.offers.currency,
          "availability": `https://schema.org/${data.offers.availability}`,
          ...(data.offers.url && { "url": data.offers.url }),
          ...(data.offers.seller && {
            "seller": {
              "@type": "Organization",
              "name": data.offers.seller.name,
              "url": data.offers.seller.url
            }
          })
        }
      }),
      ...(data.performer && {
        "performer": data.performer.map(performer => ({
          "@type": performer.type,
          "name": performer.name,
          ...(performer.description && { "description": performer.description })
        }))
      }),
      "eventStatus": `https://schema.org/${data.eventStatus || 'EventScheduled'}`,
      "eventAttendanceMode": `https://schema.org/${data.eventAttendanceMode || 'OfflineEventAttendanceMode'}`,
      ...(data.audience && {
        "audience": {
          "@type": "Audience",
          "audienceType": data.audience.audienceType,
          ...(data.audience.geographicArea && { "geographicArea": data.audience.geographicArea })
        }
      }),
      ...(data.inLanguage && { "inLanguage": data.inLanguage }),
      ...(data.category && { "category": data.category }),
      ...(data.duration && { "duration": data.duration })
    };
  }

  /**
   * Generate Brazilian cultural events for the calendar year
   */
  static generateBrazilianCulturalEvents(): object[] {
    const events: EventData[] = [
      {
        name: "Rio de Janeiro Carnival 2025",
        description: "The world's most spectacular carnival celebration featuring samba parades, street parties, and cultural performances throughout Rio de Janeiro.",
        url: "https://fly2any.com/events/rio-carnival-2025",
        image: [
          "https://fly2any.com/events/carnival-sambadrome.jpg",
          "https://fly2any.com/events/carnival-street-party.jpg",
          "https://fly2any.com/events/carnival-costumes.jpg"
        ],
        startDate: "2025-02-28T20:00:00-03:00",
        endDate: "2025-03-05T02:00:00-03:00",
        location: {
          name: "Sambadrome Marquês de Sapucaí",
          address: {
            streetAddress: "Rua Marquês de Sapucaí, S/N",
            addressLocality: "Rio de Janeiro",
            addressRegion: "RJ", 
            addressCountry: "BR",
            postalCode: "20220-007"
          },
          geo: {
            latitude: -22.9110,
            longitude: -43.1969
          }
        },
        organizer: {
          name: "League of Samba Schools of Rio de Janeiro (LIESA)",
          url: "https://liesa.globo.com"
        },
        offers: {
          price: 899.99,
          currency: "USD",
          availability: "InStock",
          url: "https://fly2any.com/packages/brazil-carnival-rio",
          seller: {
            name: "Fly2Any",
            url: "https://fly2any.com"
          }
        },
        performer: [
          {
            name: "Samba Schools of Rio de Janeiro",
            type: "PerformingGroup",
            description: "Traditional samba schools competing in elaborate parades"
          }
        ],
        eventStatus: "EventScheduled",
        eventAttendanceMode: "OfflineEventAttendanceMode",
        audience: {
          audienceType: "International tourists and Brazilian culture enthusiasts",
          geographicArea: "Worldwide"
        },
        inLanguage: ["pt-BR", "en", "es"],
        category: "Cultural Festival",
        duration: "P6D"
      },
      {
        name: "Salvador Bahia Carnival 2025",
        description: "Salvador's unique Carnival celebration featuring trio elétricos, Afro-Brazilian music, and the largest street party in the world with over 2 million participants.",
        url: "https://fly2any.com/events/salvador-carnival-2025", 
        image: [
          "https://fly2any.com/events/salvador-trio-eletrico.jpg",
          "https://fly2any.com/events/salvador-axe-music.jpg"
        ],
        startDate: "2025-02-27T18:00:00-03:00",
        endDate: "2025-03-04T23:00:00-03:00",
        location: {
          name: "Pelourinho Historic Center",
          address: {
            addressLocality: "Salvador",
            addressRegion: "BA",
            addressCountry: "BR"
          },
          geo: {
            latitude: -12.9714,
            longitude: -38.5106
          }
        },
        organizer: {
          name: "Salvador City Hall",
          url: "https://www.salvador.ba.gov.br"
        },
        offers: {
          price: 1299.99,
          currency: "USD",
          availability: "InStock",
          seller: {
            name: "Fly2Any",
            url: "https://fly2any.com"
          }
        },
        performer: [
          {
            name: "Ivete Sangalo",
            type: "Person",
            description: "Brazilian pop star and Axé music icon"
          },
          {
            name: "Olodum",
            type: "PerformingGroup", 
            description: "Legendary Afro-Brazilian percussion group"
          }
        ],
        audience: {
          audienceType: "Axé music fans and Brazilian culture lovers"
        },
        inLanguage: ["pt-BR"],
        category: "Street Festival"
      },
      {
        name: "Festa Junina - São Paulo 2025",
        description: "Traditional Brazilian winter festival celebrating rural life with quadrilha dancing, bonfire celebrations, traditional foods, and folk music throughout São Paulo.",
        url: "https://fly2any.com/events/festa-junina-sao-paulo-2025",
        image: [
          "https://fly2any.com/events/festa-junina-dancing.jpg",
          "https://fly2any.com/events/festa-junina-food.jpg"
        ],
        startDate: "2025-06-01T19:00:00-03:00", 
        endDate: "2025-06-30T23:00:00-03:00",
        location: {
          name: "Various locations in São Paulo",
          address: {
            addressLocality: "São Paulo",
            addressRegion: "SP",
            addressCountry: "BR"
          }
        },
        organizer: {
          name: "São Paulo Cultural Department",
          email: "cultura@prefeitura.sp.gov.br"
        },
        performer: [
          {
            name: "Traditional Quadrilha Groups",
            type: "PerformingGroup",
            description: "Folk dance groups performing traditional quadrilha"
          }
        ],
        audience: {
          audienceType: "Families and cultural enthusiasts",
          geographicArea: "São Paulo metropolitan area"
        },
        inLanguage: ["pt-BR"],
        category: "Folk Festival",
        duration: "P30D"
      },
      {
        name: "Parintins Folklore Festival 2025",
        description: "Amazon's most spectacular folklore festival featuring the legendary competition between Caprichoso and Garantido bois-bumbás with elaborate performances and indigenous culture.",
        url: "https://fly2any.com/events/parintins-festival-2025",
        image: [
          "https://fly2any.com/events/parintins-boi-bumba.jpg",
          "https://fly2any.com/events/parintins-arena.jpg"
        ],
        startDate: "2025-06-27T20:00:00-04:00",
        endDate: "2025-06-29T23:30:00-04:00",
        location: {
          name: "Bumbódromo",
          address: {
            addressLocality: "Parintins",
            addressRegion: "AM", 
            addressCountry: "BR"
          },
          geo: {
            latitude: -2.6267,
            longitude: -56.7395
          }
        },
        organizer: {
          name: "Parintins City Hall",
          phone: "+55 92 3533-1355"
        },
        offers: {
          price: 2199.99,
          currency: "USD", 
          availability: "InStock",
          seller: {
            name: "Fly2Any",
            url: "https://fly2any.com"
          }
        },
        performer: [
          {
            name: "Boi Caprichoso",
            type: "PerformingGroup",
            description: "Blue and white boi-bumbá group"
          },
          {
            name: "Boi Garantido", 
            type: "PerformingGroup",
            description: "Red and white boi-bumbá group"
          }
        ],
        audience: {
          audienceType: "Folk culture enthusiasts and Amazon travelers"
        },
        inLanguage: ["pt-BR"],
        category: "Folklore Festival",
        duration: "P3D"
      },
      {
        name: "New Year's Eve at Copacabana 2024",
        description: "The world's largest New Year's Eve beach party with over 2 million people, spectacular fireworks, and live performances on Copacabana Beach.",
        url: "https://fly2any.com/events/copacabana-new-years-2024",
        image: [
          "https://fly2any.com/events/copacabana-fireworks.jpg",
          "https://fly2any.com/events/copacabana-crowd.jpg"
        ],
        startDate: "2024-12-31T20:00:00-03:00",
        endDate: "2025-01-01T02:00:00-03:00",
        location: {
          name: "Copacabana Beach",
          address: {
            addressLocality: "Rio de Janeiro",
            addressRegion: "RJ",
            addressCountry: "BR"
          },
          geo: {
            latitude: -22.9711,
            longitude: -43.1822
          }
        },
        organizer: {
          name: "Rio de Janeiro City Hall",
          url: "https://www.rio.rj.gov.br"
        },
        offers: {
          price: 1799.99,
          currency: "USD",
          availability: "InStock",
          url: "https://fly2any.com/packages/new-years-rio",
          seller: {
            name: "Fly2Any", 
            url: "https://fly2any.com"
          }
        },
        audience: {
          audienceType: "International party-goers and celebration enthusiasts"
        },
        inLanguage: ["pt-BR", "en"],
        category: "New Year Celebration"
      }
    ];

    return events.map(event => this.generateEvent(event));
  }

  /**
   * Generate MusicEvent schema for specific concerts/performances
   */
  static generateMusicEvent(data: EventData & {
    musicGenre?: string[];
    recordingOf?: string[];
  }): object {
    const baseEvent = this.generateEvent(data);
    
    return {
      ...baseEvent,
      "@type": ["Event", "MusicEvent"], 
      ...(data.musicGenre && { "genre": data.musicGenre }),
      ...(data.recordingOf && { "recordedAs": data.recordingOf })
    };
  }

  /**
   * Generate Festival schema for multi-day cultural events
   */
  static generateFestival(data: EventData & {
    subEvent?: EventData[];
    sponsor?: Array<{
      name: string;
      url?: string;
    }>;
  }): object {
    const baseEvent = this.generateEvent(data);
    
    return {
      ...baseEvent,
      "@type": ["Event", "Festival"],
      ...(data.subEvent && {
        "subEvent": data.subEvent.map(subEvent => this.generateEvent(subEvent))
      }),
      ...(data.sponsor && {
        "sponsor": data.sponsor.map(sponsor => ({
          "@type": "Organization",
          "name": sponsor.name,
          ...(sponsor.url && { "url": sponsor.url })
        }))
      })
    };
  }

  /**
   * Generate Event schema script tag for HTML injection
   */
  static generateEventScript(data: EventData): string {
    const schema = this.generateEvent(data);
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate multiple events script for event listing pages
   */
  static generateMultipleEventsScript(events: EventData[]): string {
    const schemas = events.map(event => this.generateEvent(event));
    return `<script type="application/ld+json">${JSON.stringify(schemas, null, 2)}</script>`;
  }
}

/**
 * Brazilian cultural event categories
 */
export const BRAZILIAN_EVENT_CATEGORIES = {
  CARNIVAL: 'Carnival',
  FOLKLORE_FESTIVAL: 'Folklore Festival',
  MUSIC_FESTIVAL: 'Music Festival', 
  RELIGIOUS_CELEBRATION: 'Religious Celebration',
  CULTURAL_FESTIVAL: 'Cultural Festival',
  SPORTS_EVENT: 'Sports Event',
  FOOD_FESTIVAL: 'Food Festival',
  ART_EXHIBITION: 'Art Exhibition'
} as const;

/**
 * Popular Brazilian festival locations with coordinates
 */
export const BRAZILIAN_EVENT_LOCATIONS = {
  RIO_SAMBADROME: {
    name: "Sambadrome Marquês de Sapucaí",
    coordinates: { latitude: -22.9110, longitude: -43.1969 }
  },
  SALVADOR_PELOURINHO: {
    name: "Pelourinho Historic Center", 
    coordinates: { latitude: -12.9714, longitude: -38.5106 }
  },
  COPACABANA_BEACH: {
    name: "Copacabana Beach",
    coordinates: { latitude: -22.9711, longitude: -43.1822 }
  },
  PARINTINS_BUMBODROMO: {
    name: "Bumbódromo",
    coordinates: { latitude: -2.6267, longitude: -56.7395 }
  }
} as const;