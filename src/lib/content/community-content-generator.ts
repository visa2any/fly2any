/**
 * ULTRATHINK COMMUNITY CONTENT GENERATOR
 * Programmatic content creation for Brazilian diaspora communities
 * Service Area Business content optimization
 */

import { BrazilianCity } from '@/lib/data/brazilian-diaspora';
import { BrazilianNeighborhood } from '@/lib/data/brazilian-neighborhoods';

export interface CommunityContent {
  heroContent: {
    headlines: { [key: string]: string[] };
    subheadlines: { [key: string]: string[] };
    ctas: { [key: string]: string[] };
  };
  serviceDescriptions: {
    virtual: { [key: string]: string };
    community: { [key: string]: string };
    local: { [key: string]: string };
  };
  testimonials: Array<{
    name: string;
    location: string;
    content: { [key: string]: string };
    service: string;
    rating: number;
  }>;
  localizedKeywords: {
    primary: string[];
    secondary: string[];
    longtail: string[];
  };
  communityStats: {
    population: string;
    growth: string;
    demographics: string;
  };
}

class CommunityContentGenerator {
  
  generateCityContent(city: BrazilianCity, lang: 'pt' | 'en' | 'es' = 'pt'): CommunityContent {
    return {
      heroContent: this.generateHeroContent(city, lang),
      serviceDescriptions: this.generateServiceDescriptions(city, lang),
      testimonials: this.generateTestimonials(city, lang),
      localizedKeywords: this.generateLocalizedKeywords(city, lang),
      communityStats: this.generateCommunityStats(city, lang)
    };
  }

  generateNeighborhoodContent(neighborhood: BrazilianNeighborhood, city: BrazilianCity, lang: 'pt' | 'en' | 'es' = 'pt'): CommunityContent {
    return {
      heroContent: this.generateNeighborhoodHeroContent(neighborhood, city, lang),
      serviceDescriptions: this.generateNeighborhoodServiceDescriptions(neighborhood, city, lang),
      testimonials: this.generateNeighborhoodTestimonials(neighborhood, lang),
      localizedKeywords: this.generateNeighborhoodKeywords(neighborhood, lang),
      communityStats: this.generateNeighborhoodStats(neighborhood, lang)
    };
  }

  private generateHeroContent(city: BrazilianCity, lang: string) {
    const templates = {
      headlines: {
        pt: [
          `Especialistas em Viagens para Brasileiros em ${city.name}`,
          `${city.population.brazilian.toLocaleString()} Brasileiros Confiam na Nossa Expertise`,
          `Sua Conexão com o Brasil a partir de ${city.name}`,
          `Atendimento Virtual Especializado para Brasileiros em ${city.name}`,
          `Melhores Voos Brasil-${city.name} com Suporte em Português`
        ],
        en: [
          `Brazilian Travel Specialists Serving ${city.name}`,
          `${city.population.brazilian.toLocaleString()} Brazilians Trust Our Expertise`,
          `Your Brazil Connection from ${city.name}`,
          `Virtual Brazilian Travel Services in ${city.name}`,
          `Best Brazil-${city.name} Flights with Portuguese Support`
        ],
        es: [
          `Especialistas en Viajes Brasileños en ${city.name}`,
          `${city.population.brazilian.toLocaleString()} Brasileños Confían en Nuestra Experiencia`,
          `Tu Conexión con Brasil desde ${city.name}`,
          `Servicios Virtuales de Viaje Brasileño en ${city.name}`,
          `Mejores Vuelos Brasil-${city.name} con Soporte en Portugués`
        ]
      },
      subheadlines: {
        pt: [
          `Atendemos ${city.population.brazilian.toLocaleString()} brasileiros em ${city.name} com consultoria virtual, preços competitivos e suporte trilíngue 24/7.`,
          `Especialistas locais que entendem as necessidades da comunidade brasileira de ${city.name}. Consultoria gratuita por WhatsApp.`,
          `Voos, hotéis, seguros e carros para o Brasil. Atendimento personalizado para a comunidade de ${city.name}.`,
          `Economize até 40% em passagens para o Brasil com nossa consultoria especializada para ${city.name}.`
        ],
        en: [
          `Serving ${city.population.brazilian.toLocaleString()} Brazilians in ${city.name} with virtual consultation, competitive prices and 24/7 trilingual support.`,
          `Local specialists who understand the needs of ${city.name}'s Brazilian community. Free WhatsApp consultation.`,
          `Flights, hotels, insurance and cars to Brazil. Personalized service for the ${city.name} community.`,
          `Save up to 40% on Brazil flights with our specialized consultation for ${city.name}.`
        ],
        es: [
          `Sirviendo ${city.population.brazilian.toLocaleString()} brasileños en ${city.name} con consultoría virtual, precios competitivos y soporte trilingüe 24/7.`,
          `Especialistas locales que entienden las necesidades de la comunidad brasileña de ${city.name}. Consultoría gratuita por WhatsApp.`,
          `Vuelos, hoteles, seguros y autos a Brasil. Servicio personalizado para la comunidad de ${city.name}.`,
          `Ahorra hasta 40% en vuelos a Brasil con nuestra consultoría especializada para ${city.name}.`
        ]
      },
      ctas: {
        pt: [
          'Consultoria Gratuita Agora',
          'WhatsApp Direto',
          'Cotação em 2 Horas',
          'Falar com Especialista',
          'Começar Agora'
        ],
        en: [
          'Free Consultation Now',
          'Direct WhatsApp',
          'Quote in 2 Hours',
          'Talk to Specialist',
          'Start Now'
        ],
        es: [
          'Consultoría Gratuita Ahora',
          'WhatsApp Directo',
          'Cotización en 2 Horas',
          'Hablar con Especialista',
          'Empezar Ahora'
        ]
      }
    };

    return templates;
  }

  private generateServiceDescriptions(city: BrazilianCity, lang: string) {
    return {
      virtual: {
        pt: `Nossa consultoria virtual atende ${city.population.brazilian.toLocaleString()} brasileiros em ${city.name} via WhatsApp, videochamada e chat online. Sem necessidade de sair de casa para planejar sua viagem ao Brasil. Suporte 24/7 em português com especialistas que conhecem a comunidade local.`,
        en: `Our virtual consultation serves ${city.population.brazilian.toLocaleString()} Brazilians in ${city.name} via WhatsApp, video call and online chat. No need to leave home to plan your trip to Brazil. 24/7 support in Portuguese with specialists who know the local community.`,
        es: `Nuestra consultoría virtual sirve ${city.population.brazilian.toLocaleString()} brasileños en ${city.name} vía WhatsApp, videollamada y chat online. No necesitas salir de casa para planear tu viaje a Brasil. Soporte 24/7 en portugués con especialistas que conocen la comunidad local.`
      },
      community: {
        pt: `Focamos exclusivamente na comunidade brasileira de ${city.name}, entendendo seus padrões de viagem, preferências familiares e necessidades culturais específicas. Atendemos bairros como ${city.neighborhoods.slice(0, 3).join(', ')} com conhecimento local profundo.`,
        en: `We focus exclusively on ${city.name}'s Brazilian community, understanding their travel patterns, family preferences and specific cultural needs. We serve neighborhoods like ${city.neighborhoods.slice(0, 3).join(', ')} with deep local knowledge.`,
        es: `Nos enfocamos exclusivamente en la comunidad brasileña de ${city.name}, entendiendo sus patrones de viaje, preferencias familiares y necesidades culturales específicas. Servimos barrios como ${city.neighborhoods.slice(0, 3).join(', ')} con conocimiento local profundo.`
      },
      local: {
        pt: `Conhecemos profundamente ${city.name}: desde os melhores voos via ${city.flightRoutes.primaryDestinations[0]} até parcerias com ${city.infrastructure.brazilianMedia.join(', ')}. Nossa rede local inclui igrejas, escolas e negócios brasileiros da região.`,
        en: `We know ${city.name} deeply: from the best flights via ${city.flightRoutes.primaryDestinations[0]} to partnerships with ${city.infrastructure.brazilianMedia.join(', ')}. Our local network includes Brazilian churches, schools and businesses in the area.`,
        es: `Conocemos profundamente ${city.name}: desde los mejores vuelos vía ${city.flightRoutes.primaryDestinations[0]} hasta asociaciones con ${city.infrastructure.brazilianMedia.join(', ')}. Nuestra red local incluye iglesias, escuelas y negocios brasileños del área.`
      }
    };
  }

  private generateTestimonials(city: BrazilianCity, lang: string) {
    const testimonialTemplates = [
      {
        name: 'Maria Silva',
        location: city.neighborhoods[0] || city.name,
        content: {
          pt: `Fantástico! Consegui uma passagem ${city.name}-São Paulo por $${city.flightRoutes.avgPrice - 150}. O atendimento virtual foi perfeito, não precisei sair de ${city.neighborhoods[0] || city.name}.`,
          en: `Fantastic! Got a ${city.name}-São Paulo ticket for $${city.flightRoutes.avgPrice - 150}. Virtual service was perfect, didn't need to leave ${city.neighborhoods[0] || city.name}.`,
          es: `¡Fantástico! Conseguí un boleto ${city.name}-São Paulo por $${city.flightRoutes.avgPrice - 150}. El servicio virtual fue perfecto, no necesité salir de ${city.neighborhoods[0] || city.name}.`
        },
        service: 'Flight booking',
        rating: 5
      },
      {
        name: 'João Santos',
        location: city.neighborhoods[1] || city.name,
        content: {
          pt: `A Fly2Any entende nossa comunidade em ${city.name}. Eles sabem que sempre viajamos em família e ofereceram um pacote perfeito para 4 pessoas.`,
          en: `Fly2Any understands our community in ${city.name}. They know we always travel as a family and offered a perfect package for 4 people.`,
          es: `Fly2Any entiende nuestra comunidad en ${city.name}. Saben que siempre viajamos en familia y ofrecieron un paquete perfecto para 4 personas.`
        },
        service: 'Family packages',
        rating: 5
      },
      {
        name: 'Ana Costa',
        location: city.neighborhoods[2] || city.name,
        content: {
          pt: `Melhor agência para brasileiros em ${city.name}! Suporte em português 24/7 e preços que ninguém bate. Já indiquei para toda a igreja.`,
          en: `Best agency for Brazilians in ${city.name}! 24/7 Portuguese support and unbeatable prices. Already referred my entire church.`,
          es: `¡Mejor agencia para brasileños en ${city.name}! Soporte en portugués 24/7 y precios inmejorables. Ya referí a toda la iglesia.`
        },
        service: 'Community service',
        rating: 5
      },
      {
        name: 'Carlos Oliveira',
        location: city.name,
        content: {
          pt: `Consultoria por WhatsApp mudou tudo! Em 2 horas tinha 3 opções de voo para o Rio. Serviço profissional que entende o brasileiro de ${city.name}.`,
          en: `WhatsApp consultation changed everything! In 2 hours I had 3 Rio flight options. Professional service that understands Brazilians in ${city.name}.`,
          es: `¡La consultoría por WhatsApp cambió todo! En 2 horas tenía 3 opciones de vuelo a Río. Servicio profesional que entiende al brasileño de ${city.name}.`
        },
        service: 'Virtual consultation',
        rating: 5
      }
    ];

    return testimonialTemplates;
  }

  private generateLocalizedKeywords(city: BrazilianCity, lang: string) {
    const baseKeywords = {
      primary: [
        `brazilian travel ${city.name.toLowerCase()}`,
        `voos brasil ${city.name.toLowerCase()}`,
        `brasileiros ${city.name.toLowerCase()}`,
        `passagens aereas ${city.name.toLowerCase()}`,
        `virtual consultation ${city.name.toLowerCase()}`
      ],
      secondary: [
        ...city.keywords.portuguese.slice(0, 10),
        ...city.keywords.english.slice(0, 10),
        ...city.keywords.spanish.slice(0, 5),
        `whatsapp travel ${city.name.toLowerCase()}`,
        `brazilian community ${city.name.toLowerCase()}`,
        `service area ${city.name.toLowerCase()}`
      ],
      longtail: [
        `brazilian travel specialists serving ${city.name.toLowerCase()} community`,
        `virtual consultation brazilian travel ${city.name.toLowerCase()}`,
        `melhores voos ${city.name.toLowerCase()} brasil portuguese support`,
        `${city.population.brazilian.toLocaleString()} brasileiros ${city.name.toLowerCase()} travel services`,
        `consultoria virtual viagem brasil ${city.name.toLowerCase()}`,
        `flight deals ${city.name.toLowerCase()} to ${city.flightRoutes.primaryDestinations[0]}`,
        `brazilian family travel packages ${city.name.toLowerCase()}`,
        `portuguese speaking travel agent ${city.name.toLowerCase()}`
      ]
    };

    return baseKeywords;
  }

  private generateCommunityStats(city: BrazilianCity, lang: string) {
    const populationTexts = {
      pt: `${city.population.brazilian.toLocaleString()} brasileiros vivem em ${city.name}, representando ${city.population.percentage.toFixed(1)}% da população local.`,
      en: `${city.population.brazilian.toLocaleString()} Brazilians live in ${city.name}, representing ${city.population.percentage.toFixed(1)}% of the local population.`,
      es: `${city.population.brazilian.toLocaleString()} brasileños viven en ${city.name}, representando ${city.population.percentage.toFixed(1)}% de la población local.`
    };
    
    const growthTexts = {
      pt: `Nossa comunidade cresce ${city.priority === 'ultra-high' ? '15-20%' : '8-12%'} anualmente, fortalecendo a demanda por serviços especializados.`,
      en: `Our community grows ${city.priority === 'ultra-high' ? '15-20%' : '8-12%'} annually, strengthening demand for specialized services.`,
      es: `Nuestra comunidad crece ${city.priority === 'ultra-high' ? '15-20%' : '8-12%'} anualmente, fortaleciendo la demanda por servicios especializados.`
    };
    
    const demographicsTexts = {
      pt: `Comunidade ${city.languages.portugueseLevel === 'high' ? 'altamente lusófona' : 'multilíngue'} com forte conexão cultural com o Brasil.`,
      en: `${city.languages.portugueseLevel === 'high' ? 'Highly Portuguese-speaking' : 'Multilingual'} community with strong cultural connection to Brazil.`,
      es: `Comunidad ${city.languages.portugueseLevel === 'high' ? 'altamente lusófona' : 'multilingüe'} con fuerte conexión cultural con Brasil.`
    };

    return {
      population: populationTexts[lang as keyof typeof populationTexts] || populationTexts.pt,
      growth: growthTexts[lang as keyof typeof growthTexts] || growthTexts.pt,
      demographics: demographicsTexts[lang as keyof typeof demographicsTexts] || demographicsTexts.pt
    };
  }

  // Neighborhood-specific content generation
  private generateNeighborhoodHeroContent(neighborhood: BrazilianNeighborhood, city: BrazilianCity, lang: string) {
    const templates = {
      headlines: {
        pt: [
          `Especialistas em Viagens Brasileiras para ${neighborhood.name}`,
          `${neighborhood.demographics.brazilianPopulation.toLocaleString()} Brasileiros em ${neighborhood.name} Confiam em Nós`,
          `Sua Agência Brasileira Virtual em ${neighborhood.name}`,
          `Consultoria Especializada para Brasileiros de ${neighborhood.name}`
        ],
        en: [
          `Brazilian Travel Specialists for ${neighborhood.name}`,
          `${neighborhood.demographics.brazilianPopulation.toLocaleString()} Brazilians in ${neighborhood.name} Trust Us`,
          `Your Virtual Brazilian Agency in ${neighborhood.name}`,
          `Specialized Consultation for Brazilians from ${neighborhood.name}`
        ],
        es: [
          `Especialistas en Viajes Brasileños para ${neighborhood.name}`,
          `${neighborhood.demographics.brazilianPopulation.toLocaleString()} Brasileños en ${neighborhood.name} Confían en Nosotros`,
          `Tu Agencia Brasileña Virtual en ${neighborhood.name}`,
          `Consultoría Especializada para Brasileños de ${neighborhood.name}`
        ]
      },
      subheadlines: {
        pt: [
          `Atendimento hyperlocal para ${neighborhood.name}: conhecemos seus ${neighborhood.infrastructure.brazilianBusinesses.slice(0, 2).join(', ')} e oferecemos consultoria virtual no seu bairro.`,
          `${neighborhood.demographics.percentage.toFixed(1)}% de brasileiros em ${neighborhood.name}! Somos a agência que entende sua comunidade local.`,
          `Raio de atendimento ${neighborhood.serviceArea.radius} milhas em ${neighborhood.name}. Consultoria gratuita por WhatsApp.`
        ],
        en: [
          `Hyperlocal service for ${neighborhood.name}: we know your ${neighborhood.infrastructure.brazilianBusinesses.slice(0, 2).join(', ')} and offer virtual consultation in your neighborhood.`,
          `${neighborhood.demographics.percentage.toFixed(1)}% Brazilians in ${neighborhood.name}! We're the agency that understands your local community.`,
          `${neighborhood.serviceArea.radius}-mile service radius in ${neighborhood.name}. Free WhatsApp consultation.`
        ],
        es: [
          `Servicio hiperlocal para ${neighborhood.name}: conocemos tus ${neighborhood.infrastructure.brazilianBusinesses.slice(0, 2).join(', ')} y ofrecemos consultoría virtual en tu barrio.`,
          `¡${neighborhood.demographics.percentage.toFixed(1)}% brasileños en ${neighborhood.name}! Somos la agencia que entiende tu comunidad local.`,
          `Radio de servicio ${neighborhood.serviceArea.radius} millas en ${neighborhood.name}. Consultoría gratuita por WhatsApp.`
        ]
      },
      ctas: {
        pt: ['Consulta Gratuita Agora', 'WhatsApp Local', 'Falar com Especialista'],
        en: ['Free Consultation Now', 'Local WhatsApp', 'Talk to Specialist'],
        es: ['Consulta Gratuita Ahora', 'WhatsApp Local', 'Hablar con Especialista']
      }
    };

    return templates;
  }

  private generateNeighborhoodServiceDescriptions(neighborhood: BrazilianNeighborhood, city: BrazilianCity, lang: string) {
    return {
      virtual: {
        pt: `Atendimento virtual especializado para ${neighborhood.name}, cobrindo raio de ${neighborhood.serviceArea.radius} milhas. Conhecemos os ${neighborhood.infrastructure.publicTransport.join(', ')} e oferecemos consultoria sem sair de casa.`,
        en: `Specialized virtual service for ${neighborhood.name}, covering ${neighborhood.serviceArea.radius}-mile radius. We know the ${neighborhood.infrastructure.publicTransport.join(', ')} and offer consultation from home.`,
        es: `Servicio virtual especializado para ${neighborhood.name}, cubriendo radio de ${neighborhood.serviceArea.radius} millas. Conocemos ${neighborhood.infrastructure.publicTransport.join(', ')} y ofrecemos consultoría desde casa.`
      },
      community: {
        pt: `Servimos ${neighborhood.demographics.brazilianPopulation.toLocaleString()} brasileiros em ${neighborhood.name} (${neighborhood.demographics.percentage.toFixed(1)}% da população local). Conhecemos ${neighborhood.infrastructure.churches.slice(0, 2).join(', ')}.`,
        en: `We serve ${neighborhood.demographics.brazilianPopulation.toLocaleString()} Brazilians in ${neighborhood.name} (${neighborhood.demographics.percentage.toFixed(1)}% of local population). We know ${neighborhood.infrastructure.churches.slice(0, 2).join(', ')}.`,
        es: `Servimos ${neighborhood.demographics.brazilianPopulation.toLocaleString()} brasileños en ${neighborhood.name} (${neighborhood.demographics.percentage.toFixed(1)}% de la población local). Conocemos ${neighborhood.infrastructure.churches.slice(0, 2).join(', ')}.`
      },
      local: {
        pt: `Especialistas em ${neighborhood.name}: desde ${neighborhood.infrastructure.brazilianBusinesses[0]} até transporte via ${neighborhood.infrastructure.publicTransport[0]}. Área de cobertura inclui ${neighborhood.serviceArea.adjacentNeighborhoods.join(', ')}.`,
        en: `${neighborhood.name} specialists: from ${neighborhood.infrastructure.brazilianBusinesses[0]} to transport via ${neighborhood.infrastructure.publicTransport[0]}. Coverage area includes ${neighborhood.serviceArea.adjacentNeighborhoods.join(', ')}.`,
        es: `Especialistas en ${neighborhood.name}: desde ${neighborhood.infrastructure.brazilianBusinesses[0]} hasta transporte vía ${neighborhood.infrastructure.publicTransport[0]}. Área de cobertura incluye ${neighborhood.serviceArea.adjacentNeighborhoods.join(', ')}.`
      }
    };
  }

  private generateNeighborhoodTestimonials(neighborhood: BrazilianNeighborhood, lang: string) {
    return [
      {
        name: 'Patricia Lima',
        location: neighborhood.name,
        content: {
          pt: `Moro em ${neighborhood.name} há 5 anos e nunca vi um serviço tão personalizado. Eles conhecem nosso bairro!`,
          en: `I've lived in ${neighborhood.name} for 5 years and never seen such personalized service. They know our neighborhood!`,
          es: `Vivo en ${neighborhood.name} hace 5 años y nunca vi un servicio tan personalizado. ¡Conocen nuestro barrio!`
        },
        service: 'Hyperlocal service',
        rating: 5
      },
      {
        name: 'Roberto Silva',
        location: neighborhood.name,
        content: {
          pt: `Consultoria virtual perfeita para ${neighborhood.name}. Economizei tempo e dinheiro sem sair de casa.`,
          en: `Perfect virtual consultation for ${neighborhood.name}. Saved time and money without leaving home.`,
          es: `Consultoría virtual perfecta para ${neighborhood.name}. Ahorré tiempo y dinero sin salir de casa.`
        },
        service: 'Virtual consultation',
        rating: 5
      }
    ];
  }

  private generateNeighborhoodKeywords(neighborhood: BrazilianNeighborhood, lang: string) {
    return {
      primary: [
        `brazilian travel ${neighborhood.name.toLowerCase()}`,
        `brasileiros ${neighborhood.name.toLowerCase()}`,
        `voos brasil ${neighborhood.name.toLowerCase()}`,
        ...neighborhood.localKeywords.portuguese.slice(0, 5),
        ...neighborhood.localKeywords.english.slice(0, 5)
      ],
      secondary: [
        `virtual consultation ${neighborhood.name.toLowerCase()}`,
        `service area ${neighborhood.name.toLowerCase()}`,
        `hyperlocal brazilian travel`,
        `community travel services`,
        ...neighborhood.localKeywords.spanish.slice(0, 3)
      ],
      longtail: [
        `brazilian travel specialists ${neighborhood.name.toLowerCase()} ${neighborhood.demographics.percentage.toFixed(0)} percent brazilian`,
        `virtual travel consultation ${neighborhood.name.toLowerCase()} ${neighborhood.serviceArea.radius} mile radius`,
        `hyperlocal brazilian community services ${neighborhood.name.toLowerCase()}`,
        `${neighborhood.infrastructure.brazilianBusinesses[0]?.toLowerCase()} area travel services`,
        `portuguese speaking travel agent near ${neighborhood.name.toLowerCase()}`
      ]
    };
  }

  private generateNeighborhoodStats(neighborhood: BrazilianNeighborhood, lang: string) {
    const populationTexts = {
      pt: `${neighborhood.demographics.brazilianPopulation.toLocaleString()} brasileiros em ${neighborhood.name} (${neighborhood.demographics.percentage.toFixed(1)}% da população local).`,
      en: `${neighborhood.demographics.brazilianPopulation.toLocaleString()} Brazilians in ${neighborhood.name} (${neighborhood.demographics.percentage.toFixed(1)}% of local population).`,
      es: `${neighborhood.demographics.brazilianPopulation.toLocaleString()} brasileños en ${neighborhood.name} (${neighborhood.demographics.percentage.toFixed(1)}% de la población local).`
    };
    
    const demographicsTexts = {
      pt: `Renda média: $${neighborhood.demographics.medianIncome.toLocaleString()}. Comunidade ${neighborhood.characteristics.familyOriented ? 'familiar' : 'diversificada'}.`,
      en: `Median income: $${neighborhood.demographics.medianIncome.toLocaleString()}. ${neighborhood.characteristics.familyOriented ? 'Family-oriented' : 'Diverse'} community.`,
      es: `Ingreso promedio: $${neighborhood.demographics.medianIncome.toLocaleString()}. Comunidad ${neighborhood.characteristics.familyOriented ? 'familiar' : 'diversa'}.`
    };

    return {
      population: populationTexts[lang as keyof typeof populationTexts] || populationTexts.pt,
      growth: `Service area radius: ${neighborhood.serviceArea.radius} miles`,
      demographics: demographicsTexts[lang as keyof typeof demographicsTexts] || demographicsTexts.pt
    };
  }

  // Content variation generator for A/B testing
  generateContentVariations(content: CommunityContent, count: number = 3): CommunityContent[] {
    const variations: CommunityContent[] = [];
    
    for (let i = 0; i < count; i++) {
      variations.push({
        ...content,
        heroContent: {
          headlines: this.shuffleObject(content.heroContent.headlines),
          subheadlines: this.shuffleObject(content.heroContent.subheadlines),
          ctas: this.shuffleObject(content.heroContent.ctas)
        },
        testimonials: this.shuffleArray(content.testimonials)
      });
    }
    
    return variations;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private shuffleObject(obj: { [key: string]: string[] }): { [key: string]: string[] } {
    const result: { [key: string]: string[] } = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.shuffleArray(value);
    }
    return result;
  }
}

export default new CommunityContentGenerator();