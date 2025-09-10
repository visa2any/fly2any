/**
 * ULTRATHINK CITY-SPECIFIC LANDING PAGE GENERATOR
 * Generates SEO-optimized pages for Brazilian diaspora communities
 * Trilingual optimization (Portuguese/Spanish/English)
 */

import { brazilianDiaspora, type BrazilianCity } from '../data/brazilian-diaspora';
import type { Metadata } from 'next';

interface CityPageData {
  city: BrazilianCity;
  metadata: Metadata;
  content: {
    hero: {
      title: Record<string, string>;
      subtitle: Record<string, string>;
      cta: Record<string, string>;
    };
    services: {
      title: Record<string, string>;
      description: Record<string, string>;
      features: Record<string, string[]>;
    };
    community: {
      title: Record<string, string>;
      description: Record<string, string>;
      stats: Record<string, string>;
      neighborhoods: Record<string, string>;
    };
    testimonials: {
      title: Record<string, string>;
      reviews: Array<{
        name: string;
        text: Record<string, string>;
        location: string;
      }>;
    };
    faq: {
      title: Record<string, string>;
      questions: Array<{
        question: Record<string, string>;
        answer: Record<string, string>;
      }>;
    };
  };
  structuredData: any;
  hreflang: Record<string, string>;
}

export class CityLandingGenerator {
  
  /**
   * Generate complete page data for a Brazilian city
   */
  static generateCityPage(cityId: string, language: 'pt' | 'en' | 'es' = 'pt'): CityPageData | null {
    const city = brazilianDiaspora.find(c => c.id === cityId);
    if (!city) return null;

    return {
      city,
      metadata: this.generateMetadata(city, language),
      content: this.generateContent(city),
      structuredData: this.generateStructuredData(city),
      hreflang: this.generateHreflang(city)
    };
  }

  /**
   * Generate SEO metadata for city page
   */
  private static generateMetadata(city: BrazilianCity, language: 'pt' | 'en' | 'es'): Metadata {
    const titles = {
      pt: `Voos para Brasil de ${city.name} - Fly2Any | Melhor Preço Garantido`,
      en: `Flights to Brazil from ${city.name} - Fly2Any | Best Price Guaranteed`,
      es: `Vuelos a Brasil desde ${city.name} - Fly2Any | Mejor Precio Garantizado`
    };

    const descriptions = {
      pt: `Especialistas em voos de ${city.name} para Brasil. Comunidade brasileira em ${city.name} - Passagens aéreas, hotéis e seguros com atendimento em português. Cotação grátis em 2h!`,
      en: `Brazil travel specialists serving ${city.name}'s Brazilian community. Flights, hotels, and insurance with Portuguese support. Free quote in 2 hours!`,
      es: `Especialistas en viajes a Brasil para la comunidad brasileña en ${city.name}. Vuelos, hoteles y seguros con atención en portugués. ¡Cotización gratis en 2h!`
    };

    const keywords = {
      pt: `brasileiros ${city.name.toLowerCase()}, voos ${city.name} brasil, comunidade brasileira ${city.name.toLowerCase()}, passagens aereas ${city.name} sao paulo, agencia viagem brasileira ${city.name.toLowerCase()}`,
      en: `brazilian community ${city.name.toLowerCase()}, flights ${city.name} brazil, ${city.name} to sao paulo, brazilian travel agency ${city.name.toLowerCase()}, portuguese speaking travel`,
      es: `comunidad brasileña ${city.name.toLowerCase()}, vuelos ${city.name} brasil, agencia viaje brasileña ${city.name.toLowerCase()}, vuelos brasil desde ${city.name.toLowerCase()}`
    };

    return {
      title: titles[language],
      description: descriptions[language],
      keywords: keywords[language],
      robots: 'index, follow, max-snippet:-1, max-image-preview:large',
      alternates: {
        canonical: `https://fly2any.com/${language}/cidade/${city.id}`,
        languages: {
          'pt-BR': `https://fly2any.com/pt/cidade/${city.id}`,
          'en-US': `https://fly2any.com/en/city/${city.id}`,
          'es-419': `https://fly2any.com/es/ciudad/${city.id}`,
          'x-default': `https://fly2any.com/cidade/${city.id}`
        }
      },
      openGraph: {
        title: titles[language],
        description: descriptions[language],
        type: 'website',
        locale: language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_419' : 'en_US',
        url: `https://fly2any.com/${language}/cidade/${city.id}`,
        siteName: 'Fly2Any - Brazil Travel Specialists',
        images: [
          {
            url: `/images/cities/${city.id}-og.webp`,
            width: 1200,
            height: 630,
            alt: `${city.name} Brazilian Community - Fly2Any Travel Services`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: titles[language],
        description: descriptions[language],
        images: [`/images/cities/${city.id}-og.webp`]
      },
      other: {
        'geo.region': city.country === 'USA' ? `US-${city.state}` : city.country,
        'geo.placename': city.name,
        'geo.position': `${city.coordinates.lat};${city.coordinates.lng}`,
        'ICBM': `${city.coordinates.lat}, ${city.coordinates.lng}`,
        'brazilian-diaspora-city': 'true',
        'target-community': 'brazilian',
        'service-languages': 'pt,en,es',
        'ai-content-focus': `brazilian-community-${city.name.toLowerCase().replace(/\s+/g, '-')}`
      }
    };
  }

  /**
   * Generate trilingual content for city page
   */
  private static generateContent(city: BrazilianCity): CityPageData['content'] {
    return {
      hero: {
        title: {
          pt: `Voos para Brasil de ${city.name}`,
          en: `Flights to Brazil from ${city.name}`,
          es: `Vuelos a Brasil desde ${city.name}`
        },
        subtitle: {
          pt: `Especialistas na comunidade brasileira de ${city.name}. ${city.population.brazilian.toLocaleString()} brasileiros confiam em nós!`,
          en: `Brazilian community specialists in ${city.name}. ${city.population.brazilian.toLocaleString()} Brazilians trust us!`,
          es: `Especialistas en la comunidad brasileña de ${city.name}. ¡${city.population.brazilian.toLocaleString()} brasileños confían en nosotros!`
        },
        cta: {
          pt: 'Cotação Grátis em 2 Horas',
          en: 'Free Quote in 2 Hours',
          es: 'Cotización Gratis en 2 Horas'
        }
      },
      services: {
        title: {
          pt: `Serviços para Brasileiros em ${city.name}`,
          en: `Services for Brazilians in ${city.name}`,
          es: `Servicios para Brasileños en ${city.name}`
        },
        description: {
          pt: `Atendimento especializado em português para a comunidade brasileira de ${city.name}. Conhecemos suas necessidades!`,
          en: `Specialized Portuguese support for ${city.name}'s Brazilian community. We understand your needs!`,
          es: `Atención especializada en portugués para la comunidad brasileña de ${city.name}. ¡Conocemos sus necesidades!`
        },
        features: {
          pt: [
            'Atendimento 100% em Português',
            'Conhecimento da Comunidade Local',
            'Melhores Preços Garantidos',
            'Suporte 24/7',
            'Parcelamento Facilitado',
            'Orientação Sobre Documentos'
          ],
          en: [
            '100% Portuguese Support',
            'Local Community Knowledge',
            'Best Prices Guaranteed',
            '24/7 Support',
            'Easy Payment Plans',
            'Document Guidance'
          ],
          es: [
            'Atención 100% en Portugués',
            'Conocimiento de la Comunidad Local',
            'Mejores Precios Garantizados',
            'Soporte 24/7',
            'Planes de Pago Fáciles',
            'Orientación de Documentos'
          ]
        }
      },
      community: {
        title: {
          pt: `Comunidade Brasileira em ${city.name}`,
          en: `Brazilian Community in ${city.name}`,
          es: `Comunidad Brasileña en ${city.name}`
        },
        description: {
          pt: `${city.name} é lar de ${city.population.brazilian.toLocaleString()} brasileiros, uma das maiores comunidades do ${city.country === 'USA' ? 'país' : 'mundo'}. Nossos especialistas conhecem cada bairro, cada necessidade desta comunidade vibrante.`,
          en: `${city.name} is home to ${city.population.brazilian.toLocaleString()} Brazilians, one of the largest communities in the ${city.country === 'USA' ? 'country' : 'world'}. Our specialists know every neighborhood, every need of this vibrant community.`,
          es: `${city.name} es hogar de ${city.population.brazilian.toLocaleString()} brasileños, una de las comunidades más grandes del ${city.country === 'USA' ? 'país' : 'mundo'}. Nuestros especialistas conocen cada barrio, cada necesidad de esta comunidad vibrante.`
        },
        stats: {
          pt: `${city.population.brazilian.toLocaleString()} brasileiros | ${city.population.percentage.toFixed(1)}% da população | ${city.neighborhoods.length} principais bairros`,
          en: `${city.population.brazilian.toLocaleString()} Brazilians | ${city.population.percentage.toFixed(1)}% of population | ${city.neighborhoods.length} main neighborhoods`,
          es: `${city.population.brazilian.toLocaleString()} brasileños | ${city.population.percentage.toFixed(1)}% de la población | ${city.neighborhoods.length} barrios principales`
        },
        neighborhoods: {
          pt: `Principais bairros brasileiros: ${city.neighborhoods.join(', ')}`,
          en: `Main Brazilian neighborhoods: ${city.neighborhoods.join(', ')}`,
          es: `Principales barrios brasileños: ${city.neighborhoods.join(', ')}`
        }
      },
      testimonials: {
        title: {
          pt: `O Que Dizem os Brasileiros de ${city.name}`,
          en: `What Brazilians in ${city.name} Say`,
          es: `Lo Que Dicen los Brasileños de ${city.name}`
        },
        reviews: [
          {
            name: 'Maria Silva',
            location: city.neighborhoods[0] || city.name,
            text: {
              pt: `Excelente atendimento em português! A Fly2Any entende as necessidades da comunidade brasileira em ${city.name}. Consegui um preço incrível para São Paulo.`,
              en: `Excellent Portuguese service! Fly2Any understands the Brazilian community needs in ${city.name}. Got an amazing price to São Paulo.`,
              es: `¡Excelente servicio en portugués! Fly2Any entiende las necesidades de la comunidad brasileña en ${city.name}. Conseguí un precio increíble para São Paulo.`
            }
          },
          {
            name: 'João Santos',
            location: city.neighborhoods[1] || city.name,
            text: {
              pt: `Já uso há 3 anos. Sempre conseguem os melhores preços e o atendimento é impecável. Recomendo para todos os brasileiros de ${city.name}.`,
              en: `Been using for 3 years. They always get the best prices and service is impeccable. Recommend to all Brazilians in ${city.name}.`,
              es: `Lo uso desde hace 3 años. Siempre consiguen los mejores precios y el servicio es impecable. Recomiendo a todos los brasileños de ${city.name}.`
            }
          }
        ]
      },
      faq: {
        title: {
          pt: `Perguntas Frequentes - Brasileiros em ${city.name}`,
          en: `Frequently Asked Questions - Brazilians in ${city.name}`,
          es: `Preguntas Frecuentes - Brasileños en ${city.name}`
        },
        questions: [
          {
            question: {
              pt: `Vocês atendem especificamente brasileiros em ${city.name}?`,
              en: `Do you specifically serve Brazilians in ${city.name}?`,
              es: `¿Atienden específicamente a brasileños en ${city.name}?`
            },
            answer: {
              pt: `Sim! Temos especialistas que conhecem profundamente a comunidade brasileira de ${city.name}, incluindo os bairros ${city.neighborhoods.slice(0, 2).join(' e ')}.`,
              en: `Yes! We have specialists who deeply know the Brazilian community in ${city.name}, including the ${city.neighborhoods.slice(0, 2).join(' and ')} neighborhoods.`,
              es: `¡Sí! Tenemos especialistas que conocen profundamente la comunidad brasileña de ${city.name}, incluyendo los barrios ${city.neighborhoods.slice(0, 2).join(' y ')}.`
            }
          },
          {
            question: {
              pt: `Qual aeroporto de ${city.name} tem mais voos para o Brasil?`,
              en: `Which ${city.name} airport has more flights to Brazil?`,
              es: `¿Qué aeropuerto de ${city.name} tiene más vuelos a Brasil?`
            },
            answer: {
              pt: `Trabalhamos com todos os aeroportos da região. Os destinos mais populares são ${city.flightRoutes.primaryDestinations.slice(0, 3).join(', ')} com as companhias ${city.flightRoutes.airlines.slice(0, 2).join(' e ')}.`,
              en: `We work with all regional airports. The most popular destinations are ${city.flightRoutes.primaryDestinations.slice(0, 3).join(', ')} with ${city.flightRoutes.airlines.slice(0, 2).join(' and ')} airlines.`,
              es: `Trabajamos con todos los aeropuertos regionales. Los destinos más populares son ${city.flightRoutes.primaryDestinations.slice(0, 3).join(', ')} con las aerolíneas ${city.flightRoutes.airlines.slice(0, 2).join(' y ')}.`
            }
          }
        ]
      }
    };
  }

  /**
   * Generate structured data for city page
   */
  private static generateStructuredData(city: BrazilianCity): any {
    return {
      "@context": "https://schema.org",
      "@type": ["TravelAgency", "LocalBusiness"],
      "name": `Fly2Any - Brazilian Travel Specialists ${city.name}`,
      "description": `Expert travel services for ${city.name}'s Brazilian community of ${city.population.brazilian.toLocaleString()} people`,
      "url": `https://fly2any.com/cidade/${city.id}`,
      "areaServed": {
        "@type": "City",
        "name": city.name,
        "addressCountry": city.country,
        "addressRegion": city.state,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": city.coordinates.lat,
          "longitude": city.coordinates.lng
        }
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Brazilian Community",
        "geographicArea": {
          "@type": "City",
          "name": city.name,
          "addressCountry": city.country
        }
      },
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": city.coordinates.lat,
          "longitude": city.coordinates.lng
        },
        "geoRadius": "50"
      },
      "availableLanguage": ["Portuguese", "English", "Spanish"],
      "knowsLanguage": ["pt-BR", "en-US", "es-419"],
      "specialCommunitiesServed": [{
        "community": "Brazilian",
        "population": city.population.brazilian,
        "neighborhoods": city.neighborhoods,
        "culturalServices": city.infrastructure.brazilianMedia
      }],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `Brazil Travel Services - ${city.name}`,
        "itemListElement": city.flightRoutes.primaryDestinations.map((dest, index) => ({
          "@type": "Offer",
          "name": `Flights ${city.name} to ${dest}`,
          "url": `https://fly2any.com/voos/${city.id}-${dest.toLowerCase()}`,
          "priceCurrency": city.country === 'USA' ? 'USD' : 'EUR',
          "price": city.flightRoutes.avgPrice,
          "availability": "InStock",
          "validThrough": "2025-12-31"
        }))
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Portuguese", "English", "Spanish"],
        "hoursAvailable": "Mo-Su 08:00-22:00",
        "serviceArea": city.name
      }
    };
  }

  /**
   * Generate hreflang tags for multilingual SEO
   */
  private static generateHreflang(city: BrazilianCity): Record<string, string> {
    return {
      'pt-BR': `https://fly2any.com/pt/cidade/${city.id}`,
      'en-US': `https://fly2any.com/en/city/${city.id}`,
      'es-419': `https://fly2any.com/es/ciudad/${city.id}`,
      'x-default': `https://fly2any.com/cidade/${city.id}`
    };
  }

  /**
   * Generate all city pages
   */
  static generateAllCityPages(): CityPageData[] {
    return brazilianDiaspora.map(city => 
      this.generateCityPage(city.id, 'pt')
    ).filter(Boolean) as CityPageData[];
  }

  /**
   * Generate priority city pages only
   */
  static generatePriorityCityPages(priority: 'ultra-high' | 'high' = 'ultra-high'): CityPageData[] {
    return brazilianDiaspora
      .filter(city => city.priority === priority)
      .map(city => this.generateCityPage(city.id, 'pt'))
      .filter(Boolean) as CityPageData[];
  }

  /**
   * Generate URL patterns for all cities and languages
   */
  static generateAllUrls(): Array<{url: string, priority: number, changefreq: string}> {
    const urls: Array<{url: string, priority: number, changefreq: string}> = [];
    
    brazilianDiaspora.forEach(city => {
      const basePriority = city.priority === 'ultra-high' ? 0.9 : 
                          city.priority === 'high' ? 0.8 : 0.7;
      
      // Portuguese (default)
      urls.push({
        url: `https://fly2any.com/cidade/${city.id}`,
        priority: basePriority,
        changefreq: 'weekly'
      });

      // English
      urls.push({
        url: `https://fly2any.com/en/city/${city.id}`,
        priority: basePriority - 0.1,
        changefreq: 'weekly'
      });

      // Spanish
      urls.push({
        url: `https://fly2any.com/es/ciudad/${city.id}`,
        priority: basePriority - 0.1,
        changefreq: 'weekly'
      });
    });

    return urls;
  }
}

export default CityLandingGenerator;