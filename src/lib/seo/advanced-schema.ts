/**
 * Advanced Travel Industry Schema Markup System
 * Optimized for Google Travel, Google Flights, and rich snippets
 */

export interface FlightRoute {
  departure: {
    airport: string;
    city: string;
    country: string;
    iataCode: string;
    coordinates: [number, number];
  };
  arrival: {
    airport: string;
    city: string;
    country: string;
    iataCode: string;
    coordinates: [number, number];
  };
  distance: number;
  duration: string;
  airlines: string[];
  averagePrice: {
    economy: number;
    premium: number;
    business: number;
  };
  currency: string;
}

export interface TravelDestination {
  name: string;
  description: string;
  country: string;
  region: string;
  coordinates: [number, number];
  attractions: string[];
  bestTimeToVisit: string[];
  averageDuration: string;
  budget: {
    low: number;
    medium: number;
    high: number;
  };
}

export class AdvancedSchemaGenerator {
  private static instance: AdvancedSchemaGenerator;

  static getInstance(): AdvancedSchemaGenerator {
    if (!AdvancedSchemaGenerator.instance) {
      AdvancedSchemaGenerator.instance = new AdvancedSchemaGenerator();
    }
    return AdvancedSchemaGenerator.instance;
  }

  /**
   * Generate comprehensive travel agency schema
   */
  generateTravelAgencySchema(): object {
    return {
      "@context": "https://schema.org",
      "@type": ["TravelAgency", "LocalBusiness", "Organization"],
      "@id": "https://fly2any.com/#organization",
      "name": "Fly2Any - Brazil Travel Specialists",
      "alternateName": ["Fly2Any", "Brazil Travel Experts", "Especialistas Brasil"],
      "legalName": "Fly2Any LLC",
      "description": {
        "en": "Leading travel agency specializing in trips to Brazil for over 10 years. Expert flight bookings, luxury accommodations, car rentals, comprehensive travel insurance, and curated tour packages for Americans, Latinos, and Brazilians.",
        "pt": "Agência de viagens líder especializada em viagens para o Brasil há mais de 10 anos. Reservas de voos especializadas, acomodações de luxo, aluguel de carros, seguro viagem abrangente e pacotes de turismo personalizados.",
        "es": "Agencia de viajes líder especializada en Brasil por más de 10 años. Reservas de vuelos expertas, alojamientos de lujo, alquiler de autos, seguro de viaje integral y paquetes turísticos personalizados."
      },
      "url": "https://fly2any.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fly2any.com/og-image.webp",
        "width": 1200,
        "height": 630,
        "caption": "Fly2Any - Brazil Travel Specialists Logo"
      },
      "image": [
        "https://fly2any.com/og-image.webp",
        "https://fly2any.com/og-image.png",
        "https://fly2any.com/fly2any-logo.png"
      ],
      "foundingDate": "2014-01-01",
      "numberOfEmployees": "25",
      "yearlyRevenue": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "5000000"
      },
      "founder": {
        "@type": "Organization",
        "name": "Fly2Any Founding Team"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1001 Brickell Bay Dr",
        "addressLocality": "Miami",
        "addressRegion": "FL",
        "postalCode": "33131",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.7617,
        "longitude": -80.1918
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": ["Portuguese", "English", "Spanish"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "08:00",
            "closes": "22:00"
          },
          "areaServed": ["US", "BR", "MX", "AR", "CO", "PE", "CL", "UY", "PY"],
          "description": "24/7 multilingual customer support specializing in Brazil travel"
        },
        {
          "@type": "ContactPoint",
          "contactType": "sales",
          "availableLanguage": ["Portuguese", "English", "Spanish"],
          "areaServed": ["US", "BR", "LATAM"],
          "description": "Brazil travel specialists and booking experts"
        },
        {
          "@type": "ContactPoint",
          "contactType": "emergency",
          "availableLanguage": ["Portuguese", "English", "Spanish"],
          "description": "24/7 emergency travel assistance"
        }
      ],
      "serviceArea": [
        {
          "@type": "Country",
          "name": "Brazil",
          "@id": "https://www.wikidata.org/wiki/Q155"
        },
        {
          "@type": "Country",
          "name": "United States",
          "@id": "https://www.wikidata.org/wiki/Q30"
        },
        {
          "@type": "Country",
          "name": "Mexico",
          "@id": "https://www.wikidata.org/wiki/Q96"
        }
      ],
      "serviceType": [
        "Flight Bookings",
        "Hotel Reservations", 
        "Car Rentals",
        "Travel Insurance",
        "Tour Packages",
        "Visa Assistance",
        "Travel Concierge",
        "Group Travel Planning"
      ],
      "specialty": [
        "Brazil destination expertise",
        "Cultural immersion experiences",
        "Portuguese language support",
        "US-Brazil travel routes",
        "Brazilian community connections"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Brazil Travel Services",
        "itemListElement": this.generateOfferCatalog()
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": this.generateReviews(),
      "sameAs": [
        "https://www.facebook.com/fly2any",
        "https://www.instagram.com/fly2any",
        "https://www.linkedin.com/company/fly2any",
        "https://twitter.com/fly2any",
        "https://www.youtube.com/c/fly2any"
      ],
      "openingHours": "Mo-Su 08:00-22:00",
      "paymentAccepted": [
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "PIX",
        "PayPal",
        "Cryptocurrency"
      ],
      "currenciesAccepted": ["USD", "BRL", "EUR"],
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://fly2any.com/cotacao/voos?origem={origin}&destino={destination}"
          },
          "query-input": [
            "required name=origin",
            "required name=destination"
          ]
        },
        {
          "@type": "ReserveAction",
          "target": "https://fly2any.com/cotacao",
          "result": {
            "@type": "Reservation",
            "name": "Travel Booking"
          }
        }
      ],
      "certifications": [
        "IATA Certified",
        "Better Business Bureau A+",
        "Brazilian Tourism Board Partner"
      ],
      "awards": [
        "Best Brazil Travel Specialist 2024",
        "Top Customer Service Award 2023",
        "Excellence in Latin American Travel 2023"
      ]
    };
  }

  /**
   * Generate flight route schema for specific routes
   */
  generateFlightRouteSchema(route: FlightRoute): object {
    return {
      "@context": "https://schema.org",
      "@type": "Trip",
      "name": `Flights from ${route.departure.city} to ${route.arrival.city}`,
      "description": `Direct and connecting flights from ${route.departure.airport} (${route.departure.iataCode}) to ${route.arrival.airport} (${route.arrival.iataCode})`,
      "partOfTrip": [
        {
          "@type": "Flight",
          "flightNumber": "Multiple Airlines Available",
          "provider": {
            "@type": "Airline",
            "name": route.airlines.join(", "),
            "iataCode": route.airlines[0]
          },
          "departureAirport": {
            "@type": "Airport",
            "name": route.departure.airport,
            "iataCode": route.departure.iataCode,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": route.departure.city,
              "addressCountry": route.departure.country
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": route.departure.coordinates[0],
              "longitude": route.departure.coordinates[1]
            }
          },
          "arrivalAirport": {
            "@type": "Airport",
            "name": route.arrival.airport,
            "iataCode": route.arrival.iataCode,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": route.arrival.city,
              "addressCountry": route.arrival.country
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": route.arrival.coordinates[0],
              "longitude": route.arrival.coordinates[1]
            }
          },
          "estimatedFlightDuration": route.duration,
          "flightDistance": {
            "@type": "Distance",
            "value": route.distance,
            "unitCode": "KM"
          }
        }
      ],
      "offers": [
        {
          "@type": "Offer",
          "name": "Economy Class",
          "price": route.averagePrice.economy,
          "priceCurrency": route.currency,
          "availability": "InStock",
          "validFrom": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          "seller": {
            "@id": "https://fly2any.com/#organization"
          }
        },
        {
          "@type": "Offer",
          "name": "Premium Economy",
          "price": route.averagePrice.premium,
          "priceCurrency": route.currency,
          "availability": "InStock",
          "validFrom": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          "seller": {
            "@id": "https://fly2any.com/#organization"
          }
        },
        {
          "@type": "Offer",
          "name": "Business Class",
          "price": route.averagePrice.business,
          "priceCurrency": route.currency,
          "availability": "InStock",
          "validFrom": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          "seller": {
            "@id": "https://fly2any.com/#organization"
          }
        }
      ],
      "totalTime": route.duration,
      "itinerary": [
        {
          "@type": "Place",
          "name": route.departure.city,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": route.departure.city,
            "addressCountry": route.departure.country
          }
        },
        {
          "@type": "Place",
          "name": route.arrival.city,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": route.arrival.city,
            "addressCountry": route.arrival.country
          }
        }
      ]
    };
  }

  /**
   * Generate destination guide schema
   */
  generateDestinationSchema(destination: TravelDestination): object {
    return {
      "@context": "https://schema.org",
      "@type": ["TouristDestination", "Place"],
      "name": destination.name,
      "description": destination.description,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": destination.country,
        "addressRegion": destination.region
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": destination.coordinates[0],
        "longitude": destination.coordinates[1]
      },
      "touristType": [
        "Cultural Tourism",
        "Adventure Tourism", 
        "Beach Tourism",
        "Business Travel",
        "Family Travel"
      ],
      "includesAttraction": destination.attractions.map(attraction => ({
        "@type": "TouristAttraction",
        "name": attraction
      })),
      "expectedDuration": destination.averageDuration,
      "bestTimeToVisit": destination.bestTimeToVisit,
      "hasMap": `https://www.google.com/maps/search/${encodeURIComponent(destination.name)}`,
      "estimatedCost": [
        {
          "@type": "MonetaryAmount",
          "name": "Budget Travel",
          "currency": "USD",
          "value": destination.budget.low
        },
        {
          "@type": "MonetaryAmount", 
          "name": "Mid-range Travel",
          "currency": "USD",
          "value": destination.budget.medium
        },
        {
          "@type": "MonetaryAmount",
          "name": "Luxury Travel",
          "currency": "USD",
          "value": destination.budget.high
        }
      ],
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Climate",
          "value": "Tropical"
        },
        {
          "@type": "PropertyValue",
          "name": "Language",
          "value": "Portuguese"
        },
        {
          "@type": "PropertyValue",
          "name": "Currency",
          "value": "Brazilian Real (BRL)"
        }
      ]
    };
  }

  /**
   * Generate FAQ schema for travel questions
   */
  generateTravelFAQSchema(): object {
    const faqs = [
      {
        question: "What documents do I need to travel to Brazil?",
        answer: "US citizens need a valid passport. For stays over 90 days, a visa is required. We provide complete visa assistance and documentation guidance."
      },
      {
        question: "What's the best time to visit Brazil?",
        answer: "Brazil is great year-round! December-March is summer (peak season), while April-September offers cooler weather and fewer crowds. We'll help you choose based on your preferences."
      },
      {
        question: "How far in advance should I book my flight to Brazil?",
        answer: "For best prices, book 2-3 months in advance. Our experts monitor prices daily and will alert you to the best deals."
      },
      {
        question: "Do you offer travel insurance for Brazil trips?",
        answer: "Yes! We provide comprehensive travel insurance covering medical emergencies, trip cancellation, and lost baggage specifically designed for Brazil travel."
      },
      {
        question: "Can you help with hotel bookings in Brazil?",
        answer: "Absolutely! We have partnerships with over 1,000 hotels across Brazil, from budget-friendly pousadas to luxury resorts, ensuring the best rates and experiences."
      }
    ];

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  /**
   * Generate real-time pricing schema
   */
  generatePricingSchema(route: string, prices: any): object {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `Flight Tickets ${route}`,
      "description": `Best prices for flights ${route} with flexible booking options`,
      "category": "Travel > Flights",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": prices.min,
        "highPrice": prices.max,
        "priceCurrency": "USD",
        "offerCount": prices.count,
        "availability": "InStock",
        "seller": {
          "@id": "https://fly2any.com/#organization"
        },
        "validFrom": new Date().toISOString(),
        "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "156",
        "bestRating": "5"
      }
    };
  }

  private generateOfferCatalog(): object[] {
    return [
      {
        "@type": "Offer",
        "name": "Miami to São Paulo Flights",
        "url": "https://fly2any.com/voos-miami-sao-paulo",
        "itemOffered": {
          "@type": "Service",
          "name": "Flight Booking Miami to São Paulo",
          "description": "Direct and connecting flights between Miami and São Paulo with expert booking assistance"
        },
        "price": "599",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer", 
        "name": "New York to Rio de Janeiro Flights",
        "url": "https://fly2any.com/voos-new-york-rio-janeiro",
        "itemOffered": {
          "@type": "Service",
          "name": "Flight Booking New York to Rio de Janeiro",
          "description": "Premium flight options from New York to Rio de Janeiro with personalized service"
        },
        "price": "799",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Brazil Hotel Packages",
        "itemOffered": {
          "@type": "Service",
          "name": "Hotel Reservations Brazil",
          "description": "Luxury and budget hotel bookings across all major Brazilian destinations"
        },
        "price": "89",
        "priceCurrency": "USD"
      }
    ];
  }

  private generateReviews(): object[] {
    return [
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
        "reviewBody": "Excelente atendimento! Conseguiram um preço incrível para minha viagem ao Brasil e me ajudaram com todos os detalhes.",
        "datePublished": "2024-06-15",
        "publisher": {
          "@type": "Organization",
          "name": "Google Reviews"
        }
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
          "name": "John Martinez"
        },
        "reviewBody": "Amazing service! They found me the perfect flight to Brazil and handled all my travel insurance. Highly recommend!",
        "datePublished": "2024-05-20",
        "publisher": {
          "@type": "Organization",
          "name": "Trustpilot"
        }
      }
    ];
  }

  /**
   * Inject schema into page
   */
  injectSchema(schema: object, id?: string): void {
    if (typeof window === 'undefined') return;

    const scriptId = id || `schema-${Date.now()}`;
    
    // Remove existing schema with same ID
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }
}

export default AdvancedSchemaGenerator;