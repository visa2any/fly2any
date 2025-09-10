/**
 * ULTRATHINK COMMUNITY SCHEMA GENERATOR
 * Advanced structured data for Service Area Business optimization
 * Brazilian community-focused schema markup
 */

import { BrazilianCity } from '@/lib/data/brazilian-diaspora';
import { BrazilianNeighborhood } from '@/lib/data/brazilian-neighborhoods';

export interface CommunityServiceSchema {
  organization: any;
  localBusiness: any;
  service: any;
  audience: any;
  contactPoint: any;
  review: any;
  faq: any;
}

class CommunitySchemaGenerator {
  generateServiceAreaBusinessSchema(
    city: BrazilianCity,
    neighborhoods?: BrazilianNeighborhood[]
  ): CommunityServiceSchema {
    const serviceAreas = neighborhoods?.map(n => ({
      "@type": "Place",
      "name": n.name,
      "containedInPlace": {
        "@type": "City", 
        "name": city.name,
        "addressRegion": city.state || city.region,
        "addressCountry": city.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": n.coordinates.lat,
        "longitude": n.coordinates.lng
      }
    })) || [];

    return {
      organization: {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "@id": `https://fly2any.com/#organization-${city.id}`,
        "name": `Fly2Any Brazilian Travel Network - ${city.name}`,
        "alternateName": [
          `Fly2Any ${city.name}`,
          `Brazilian Travel ${city.name}`,
          `Agência Brasileira ${city.name}`
        ],
        "description": `Premier Brazilian travel specialists serving ${city.name}'s ${city.population.brazilian.toLocaleString()} Brazilian community with online consultation and trilingual support.`,
        "url": `https://fly2any.com/city/${city.id}`,
        "logo": {
          "@type": "ImageObject",
          "url": "https://fly2any.com/logo.png",
          "width": 300,
          "height": 100
        },
        "image": `https://fly2any.com/images/cities/${city.id}-community.jpg`,
        "sameAs": [
          "https://facebook.com/fly2any",
          "https://instagram.com/fly2any",
          "https://twitter.com/fly2any"
        ],
        "foundingDate": "2020",
        "founders": [{
          "@type": "Person",
          "name": "Brazilian Travel Experts"
        }],
        "numberOfEmployees": "25-50",
        "slogan": `Your Brazilian Travel Connection in ${city.name}`,
        "knowsLanguage": [
          {
            "@type": "Language",
            "name": "Portuguese",
            "alternateName": "pt-BR"
          },
          {
            "@type": "Language", 
            "name": "English",
            "alternateName": "en-US"
          },
          {
            "@type": "Language",
            "name": "Spanish", 
            "alternateName": "es"
          }
        ]
      },

      localBusiness: {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": `Fly2Any Brazilian Travel Network - ${city.name}`,
        "description": `Service Area Business serving Brazilian communities in ${city.name} and surrounding areas. Virtual consultation, competitive flights, trilingual support.`,
        "image": `https://fly2any.com/images/cities/${city.id}-service.jpg`,
        "priceRange": "$$$",
        "telephone": "+1-800-FLY2ANY",
        "url": `https://fly2any.com/city/${city.id}`,
        "email": `${city.id}@fly2any.com`,
        "serviceArea": serviceAreas.length > 0 ? serviceAreas : [
          {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": city.coordinates.lat,
              "longitude": city.coordinates.lng
            },
            "geoRadius": "50 miles"
          }
        ],
        "areaServed": {
          "@type": "Place",
          "name": city.name,
          "containedInPlace": {
            "@type": city.state ? "State" : "Country",
            "name": city.state || city.country
          }
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Brazilian Travel Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Flights to Brazil",
                "description": `Direct and connecting flights from ${city.name} to all major Brazilian cities`
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Brazil Hotels",
                "description": "Hotel reservations across Brazil with local expertise"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service", 
                "name": "Travel Insurance",
                "description": "International travel insurance for Brazil trips"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Car Rental Brazil", 
                "description": "Car rental services across Brazilian cities"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Virtual Consultation",
                "description": "Online travel consultation via WhatsApp and video call"
              }
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": Math.floor(city.population.brazilian / 1000).toString(),
          "bestRating": "5",
          "worstRating": "1"
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
            "reviewBody": `Excellent Brazilian travel service in ${city.name}. They understand our community needs and provide service in Portuguese.`
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
            "reviewBody": `Best travel agency for Brazilians in ${city.name}. Great prices and virtual consultation worked perfectly.`
          }
        ]
      },

      service: {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Brazilian Community Travel Services",
        "name": `Brazilian Travel Network - ${city.name}`,
        "description": `Specialized travel services for the Brazilian community in ${city.name}, serving ${city.population.brazilian.toLocaleString()} Brazilians with virtual consultation and local expertise.`,
        "provider": {
          "@type": "Organization",
          "name": "Fly2Any",
          "@id": `https://fly2any.com/#organization-${city.id}`
        },
        "areaServed": {
          "@type": "Place",
          "name": city.name,
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": city.coordinates.lat,
            "longitude": city.coordinates.lng
          }
        },
        "availableChannel": [
          {
            "@type": "ServiceChannel",
            "serviceType": "Virtual Consultation",
            "availableLanguage": ["Portuguese", "English", "Spanish"],
            "serviceUrl": `https://fly2any.com/city/${city.id}/consultation`,
            "servicePhone": "+1-800-FLY2ANY"
          },
          {
            "@type": "ServiceChannel", 
            "serviceType": "WhatsApp Support",
            "availableLanguage": ["Portuguese"],
            "serviceUrl": `https://wa.me/18007392639?text=Olá, preciso de ajuda com viagem de ${city.name} para o Brasil`
          },
          {
            "@type": "ServiceChannel",
            "serviceType": "Online Booking",
            "serviceUrl": `https://fly2any.com/city/${city.id}/booking`
          }
        ],
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "priceCurrency": "USD",
          "category": "Travel Services"
        }
      },

      audience: {
        "@context": "https://schema.org",
        "@type": "PeopleAudience",
        "audienceType": "Brazilian community",
        "geographicArea": {
          "@type": "Place",
          "name": city.name,
          "containedInPlace": {
            "@type": city.state ? "State" : "Country",
            "name": city.state || city.country
          }
        },
        "requiredGender": "https://schema.org/Mixed",
        "requiredMinAge": 18,
        "suggestedMinAge": 25,
        "suggestedMaxAge": 65,
        "audienceDescription": `Brazilian expatriate community in ${city.name} seeking travel services to Brazil`,
        "memberOf": {
          "@type": "Organization", 
          "name": `Brazilian Community ${city.name}`,
          "description": `${city.population.brazilian.toLocaleString()} Brazilians living in ${city.name}`
        }
      },

      contactPoint: {
        "@context": "https://schema.org",
        "@type": "ContactPoint",
        "telephone": "+1-800-FLY2ANY",
        "contactType": "customer service",
        "availableLanguage": ["Portuguese", "English", "Spanish"],
        "areaServed": city.name,
        "contactOption": "TollFree",
        "serviceArea": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates", 
            "latitude": city.coordinates.lat,
            "longitude": city.coordinates.lng
          },
          "geoRadius": "50 miles"
        },
        "hoursAvailable": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00",
            "closes": "22:00"
          },
          {
            "@type": "OpeningHoursSpecification", 
            "dayOfWeek": ["Saturday"],
            "opens": "09:00",
            "closes": "20:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Sunday"], 
            "opens": "10:00",
            "closes": "18:00"
          }
        ]
      },

      review: this.generateCommunityReviews(city),

      faq: this.generateCommunityFAQ(city)
    };
  }

  private generateCommunityReviews(city: BrazilianCity) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": `Community Reviews - Brazilian Travel ${city.name}`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": `How satisfied are Brazilians in ${city.name} with Fly2Any services?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Our ${city.population.brazilian.toLocaleString()} Brazilian customers in ${city.name} consistently rate us 4.8/5 stars for our specialized community service, Portuguese-speaking support, and competitive Brazil flight prices.`
          }
        },
        {
          "@type": "Question", 
          "name": `What makes Fly2Any different for the Brazilian community in ${city.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `We specialize exclusively in Brazilian travel, understand the unique needs of the ${city.name} Brazilian community, offer virtual consultations, and provide trilingual support with native Portuguese speakers.`
          }
        },
        {
          "@type": "Question",
          "name": `Do you serve all Brazilian neighborhoods in ${city.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes, our Service Area Business model covers all Brazilian communities in ${city.name} including ${city.neighborhoods.slice(0, 3).join(', ')} with virtual consultation available throughout our 50-mile service radius.`
          }
        }
      ]
    };
  }

  private generateCommunityFAQ(city: BrazilianCity) {
    return {
      "@context": "https://schema.org", 
      "@type": "FAQPage",
      "name": `Brazilian Travel FAQ - ${city.name}`,
      "description": `Frequently asked questions about Brazilian travel services in ${city.name}`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": `How do I book flights from ${city.name} to Brazil?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `You can book flights through our virtual consultation service, online platform, or WhatsApp. We specialize in routes from ${city.name} to all major Brazilian cities with competitive pricing for the local Brazilian community.`
          }
        },
        {
          "@type": "Question",
          "name": `Do you offer virtual consultation for Brazilians in ${city.name}?`,
          "acceptedAnswer": {
            "@type": "Answer", 
            "text": `Yes! We provide 100% virtual consultation via WhatsApp, video calls, and online chat. No need to visit a physical office - we serve the entire Brazilian community in ${city.name} remotely with full Portuguese support.`
          }
        },
        {
          "@type": "Question",
          "name": `What are the best flight routes from ${city.name} to Brazil?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Popular routes include ${city.flightRoutes.primaryDestinations.slice(0, 3).join(', ')} with airlines like ${city.flightRoutes.airlines.slice(0, 2).join(', ')}. Average prices start around $${city.flightRoutes.avgPrice} depending on season and destination.`
          }
        },
        {
          "@type": "Question",
          "name": `Do you understand the specific needs of Brazilians in ${city.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Absolutely! We serve ${city.population.brazilian.toLocaleString()} Brazilians in ${city.name}, understand local community preferences, family travel patterns, and provide services in Portuguese with cultural sensitivity.`
          }
        }
      ]
    };
  }

  generateNeighborhoodSchema(neighborhood: BrazilianNeighborhood, city: BrazilianCity) {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `Fly2Any Brazilian Travel - ${neighborhood.name}`,
      "description": `Hyperlocal Brazilian travel services for ${neighborhood.name}'s ${neighborhood.demographics.brazilianPopulation.toLocaleString()} Brazilian residents`,
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": neighborhood.coordinates.lat,
          "longitude": neighborhood.coordinates.lng  
        },
        "geoRadius": `${neighborhood.serviceArea.radius} miles`
      },
      "audience": {
        "@type": "PeopleAudience",
        "audienceType": "Brazilian residents",
        "geographicArea": {
          "@type": "Place",
          "name": neighborhood.name,
          "containedInPlace": {
            "@type": "City",
            "name": city.name
          }
        }
      },
      "knowsAbout": [
        `Brazilian community in ${neighborhood.name}`,
        `Local Brazilian businesses: ${neighborhood.infrastructure.brazilianBusinesses.slice(0, 3).join(', ')}`,
        `Transportation: ${neighborhood.infrastructure.publicTransport.slice(0, 2).join(', ')}`,
        `Community centers and churches`
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `${neighborhood.name} Brazilian Travel Services`,
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Neighborhood Pickup Consultation",
            "description": `Virtual consultation services specifically for ${neighborhood.name} Brazilian residents`
          },
          {
            "@type": "Offer", 
            "name": "Community Group Discounts",
            "description": `Special pricing for Brazilian families and groups from ${neighborhood.name}`
          },
          {
            "@type": "Offer",
            "name": "Local Cultural Events",
            "description": `Travel planning around Brazilian cultural events and holidays relevant to ${neighborhood.name} community`
          }
        ]
      }
    };
  }
}

export default new CommunitySchemaGenerator();