/**
 * Travel Product Schema Generator
 * Generates structured data for travel packages, deals, and products
 */

export interface TravelProductData {
  name: string;
  description: string;
  url: string;
  image?: string[];
  brand?: string;
  category: 'TravelPackage' | 'FlightDeal' | 'HotelPackage' | 'TourPackage';
  price: {
    value: number;
    currency: string;
    validFrom?: string;
    validThrough?: string;
  };
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'OnlineOnly';
  seller: {
    name: string;
    url: string;
  };
  destination?: {
    name: string;
    addressCountry: string;
    addressRegion?: string;
  };
  duration?: {
    value: number;
    unitText: 'DAY' | 'NIGHT' | 'WEEK';
  };
  includesObject?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
      bestRating: number;
    };
  }>;
}

export class TravelProductSchema {
  /**
   * Generate Product schema for travel packages and deals
   */
  static generateTravelProduct(data: TravelProductData): object {
    return {
      "@context": "https://schema.org",
      "@type": ["Product", "TravelPackage"],
      "name": data.name,
      "description": data.description,
      "url": data.url,
      ...(data.image && {
        "image": Array.isArray(data.image) ? data.image : [data.image]
      }),
      ...(data.brand && { "brand": data.brand }),
      "category": data.category,
      "offers": {
        "@type": "Offer",
        "price": data.price.value,
        "priceCurrency": data.price.currency,
        ...(data.price.validFrom && { "validFrom": data.price.validFrom }),
        ...(data.price.validThrough && { "validThrough": data.price.validThrough }),
        "availability": `https://schema.org/${data.availability || 'InStock'}`,
        "seller": {
          "@type": "Organization",
          "name": data.seller.name,
          "url": data.seller.url
        },
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": data.price.value,
          "priceCurrency": data.price.currency,
          "valueAddedTaxIncluded": true
        }
      },
      ...(data.destination && {
        "location": {
          "@type": "Place",
          "name": data.destination.name,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": data.destination.addressCountry,
            ...(data.destination.addressRegion && {
              "addressRegion": data.destination.addressRegion
            })
          }
        }
      }),
      ...(data.duration && {
        "duration": `P${data.duration.value}${data.duration.unitText === 'DAY' ? 'D' : data.duration.unitText === 'NIGHT' ? 'D' : 'W'}`
      }),
      ...(data.includesObject && {
        "includesObject": data.includesObject.map(item => ({
          "@type": "Service",
          "name": item
        }))
      }),
      ...(data.aggregateRating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": data.aggregateRating.ratingValue,
          "reviewCount": data.aggregateRating.reviewCount,
          "bestRating": data.aggregateRating.bestRating,
          "worstRating": data.aggregateRating.worstRating
        }
      }),
      ...(data.review && {
        "review": data.review.map(review => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": review.author
          },
          "datePublished": review.datePublished,
          "reviewBody": review.reviewBody,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.reviewRating.ratingValue,
            "bestRating": review.reviewRating.bestRating
          }
        }))
      })
    };
  }

  /**
   * Generate specific Brazil travel package products
   */
  static generateBrazilTravelPackages(): object[] {
    const packages: TravelProductData[] = [
      {
        name: "Rio de Janeiro + São Paulo Explorer Package",
        description: "7-day adventure through Brazil's most iconic cities including flights, hotels, and guided tours of Christ the Redeemer, Sugarloaf Mountain, and São Paulo's vibrant neighborhoods.",
        url: "https://fly2any.com/packages/rio-sao-paulo-explorer",
        image: [
          "https://fly2any.com/packages/rio-sao-paulo-main.jpg",
          "https://fly2any.com/packages/christ-redeemer.jpg",
          "https://fly2any.com/packages/sao-paulo-skyline.jpg"
        ],
        brand: "Fly2Any",
        category: "TravelPackage",
        price: {
          value: 2499.99,
          currency: "USD",
          validFrom: "2024-01-01",
          validThrough: "2024-12-31"
        },
        availability: "InStock",
        seller: {
          name: "Fly2Any",
          url: "https://fly2any.com"
        },
        destination: {
          name: "Rio de Janeiro + São Paulo, Brazil", 
          addressCountry: "BR",
          addressRegion: "Southeast Brazil"
        },
        duration: {
          value: 7,
          unitText: "DAY"
        },
        includesObject: [
          "Round-trip flights",
          "4-star hotel accommodations",
          "Daily breakfast",
          "Christ the Redeemer tour",
          "Sugarloaf Mountain cable car",
          "São Paulo city tour",
          "Airport transfers",
          "24/7 support"
        ],
        aggregateRating: {
          ratingValue: 4.8,
          reviewCount: 156,
          bestRating: 5,
          worstRating: 1
        },
        review: [
          {
            author: "Maria Santos",
            datePublished: "2024-08-15",
            reviewBody: "Incredible package! The organization was perfect and we saw everything we wanted in Brazil. Highly recommended!",
            reviewRating: {
              ratingValue: 5,
              bestRating: 5
            }
          }
        ]
      },
      {
        name: "Amazon Rainforest + Salvador Cultural Journey",
        description: "10-day immersive experience combining Amazon wildlife adventure with Bahia's rich Afro-Brazilian culture, including eco-lodges, cultural shows, and guided nature expeditions.",
        url: "https://fly2any.com/packages/amazon-salvador-cultural",
        image: [
          "https://fly2any.com/packages/amazon-wildlife.jpg",
          "https://fly2any.com/packages/salvador-culture.jpg"
        ],
        brand: "Fly2Any",
        category: "TravelPackage",
        price: {
          value: 3299.99,
          currency: "USD"
        },
        availability: "InStock",
        seller: {
          name: "Fly2Any",
          url: "https://fly2any.com"
        },
        destination: {
          name: "Amazon + Salvador, Brazil",
          addressCountry: "BR"
        },
        duration: {
          value: 10,
          unitText: "DAY"
        },
        includesObject: [
          "Domestic and international flights",
          "Eco-lodge accommodations", 
          "All meals included",
          "Amazon wildlife tours",
          "Indigenous community visits",
          "Salvador historical tour",
          "Capoeira and percussion workshops",
          "Professional nature guides"
        ],
        aggregateRating: {
          ratingValue: 4.9,
          reviewCount: 89,
          bestRating: 5,
          worstRating: 1
        }
      },
      {
        name: "Brazil Carnival Experience - Rio de Janeiro",
        description: "Ultimate 5-day Carnival package including premium seats at the Sambadrome, exclusive parties, luxury accommodations, and VIP access to the best Carnival celebrations.",
        url: "https://fly2any.com/packages/brazil-carnival-rio",
        image: [
          "https://fly2any.com/packages/carnival-sambadrome.jpg",
          "https://fly2any.com/packages/carnival-street-party.jpg"
        ],
        brand: "Fly2Any",
        category: "TravelPackage",
        price: {
          value: 4999.99,
          currency: "USD",
          validFrom: "2024-12-01",
          validThrough: "2025-03-15"
        },
        availability: "PreOrder",
        seller: {
          name: "Fly2Any",
          url: "https://fly2any.com"
        },
        destination: {
          name: "Rio de Janeiro, Brazil",
          addressCountry: "BR",
          addressRegion: "RJ"
        },
        duration: {
          value: 5,
          unitText: "DAY"
        },
        includesObject: [
          "Round-trip flights",
          "5-star beachfront hotel",
          "Sambadrome premium seats (2 nights)",
          "VIP Carnival party access",
          "Professional costume rental",
          "Private transfers",
          "Concierge service",
          "Travel insurance"
        ]
      }
    ];

    return packages.map(pkg => this.generateTravelProduct(pkg));
  }

  /**
   * Generate flight deal products for specific routes
   */
  static generateFlightDeals(): object[] {
    const deals: TravelProductData[] = [
      {
        name: "Miami to São Paulo Flight Deal",
        description: "Exclusive round-trip flights from Miami to São Paulo with LATAM Airlines. Limited time offer with flexible dates and premium economy upgrade available.",
        url: "https://fly2any.com/deals/miami-sao-paulo",
        image: ["https://fly2any.com/deals/mia-sao-deal.jpg"],
        brand: "Fly2Any",
        category: "FlightDeal",
        price: {
          value: 899.99,
          currency: "USD",
          validFrom: "2024-10-01",
          validThrough: "2024-12-31"
        },
        availability: "InStock",
        seller: {
          name: "Fly2Any",
          url: "https://fly2any.com"
        },
        destination: {
          name: "São Paulo, Brazil",
          addressCountry: "BR",
          addressRegion: "SP"
        },
        includesObject: [
          "Round-trip flights",
          "2 checked bags included",
          "Seat selection",
          "24/7 customer support",
          "Change fee waiver"
        ],
        aggregateRating: {
          ratingValue: 4.7,
          reviewCount: 234,
          bestRating: 5,
          worstRating: 1
        }
      },
      {
        name: "New York to Rio de Janeiro Flight Special", 
        description: "Direct flights from JFK to Rio de Janeiro with American Airlines. Perfect for beach lovers and culture enthusiasts visiting the Marvelous City.",
        url: "https://fly2any.com/deals/new-york-rio",
        image: ["https://fly2any.com/deals/jfk-rio-deal.jpg"],
        brand: "Fly2Any",
        category: "FlightDeal",
        price: {
          value: 1199.99,
          currency: "USD",
          validFrom: "2024-11-01", 
          validThrough: "2025-03-31"
        },
        availability: "InStock",
        seller: {
          name: "Fly2Any",
          url: "https://fly2any.com"
        },
        destination: {
          name: "Rio de Janeiro, Brazil",
          addressCountry: "BR",
          addressRegion: "RJ"
        },
        includesObject: [
          "Direct flights",
          "Premium economy available",
          "Meal service included",
          "Entertainment system",
          "Travel insurance option"
        ]
      }
    ];

    return deals.map(deal => this.generateTravelProduct(deal));
  }

  /**
   * Generate Product schema script tag for HTML injection
   */
  static generateProductScript(data: TravelProductData): string {
    const schema = this.generateTravelProduct(data);
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate multiple products script for package/deals pages
   */
  static generateMultipleProductsScript(products: TravelProductData[]): string {
    const schemas = products.map(product => this.generateTravelProduct(product));
    return `<script type="application/ld+json">${JSON.stringify(schemas, null, 2)}</script>`;
  }
}

/**
 * Pre-configured travel product categories for Fly2Any
 */
export const TRAVEL_PRODUCT_CATEGORIES = {
  BRAZIL_PACKAGES: 'Brazil Travel Packages',
  FLIGHT_DEALS: 'Flight Deals to Brazil', 
  HOTEL_PACKAGES: 'Brazil Hotel Packages',
  TOUR_PACKAGES: 'Guided Brazil Tours',
  CARNIVAL_PACKAGES: 'Brazil Carnival Experiences',
  AMAZON_PACKAGES: 'Amazon Rainforest Adventures'
} as const;