/**
 * INTERNAL LINKING OPTIMIZER
 * Strategic SEO internal linking system for fly2any.com
 * Implements hub-and-spoke architecture with contextual linking
 */

import { brazilianDiaspora } from '@/lib/data/brazilian-diaspora';
import { brazilianNeighborhoods } from '@/lib/data/brazilian-neighborhoods';

export interface InternalLink {
  url: string;
  anchor: string;
  context: 'navigation' | 'contextual' | 'footer' | 'sidebar' | 'inline';
  priority: 'high' | 'medium' | 'low';
  relationship: 'parent' | 'child' | 'sibling' | 'related';
}

export interface LinkingStrategy {
  pageUrl: string;
  pageType: 'home' | 'service' | 'city' | 'blog' | 'landing' | 'neighborhood';
  targetKeywords: string[];
  internalLinks: InternalLink[];
  anchorTextVariations: string[];
}

export class InternalLinkingOptimizer {
  
  /**
   * HUB AND SPOKE ARCHITECTURE
   * Creates central hub pages that distribute link equity
   */
  
  // Primary hubs (highest authority)
  static primaryHubs = [
    { url: '/', type: 'home', priority: 1.0 },
    { url: '/voos-brasil-eua', type: 'service', priority: 0.95 },
    { url: '/flights', type: 'service', priority: 0.95 },
    { url: '/hoteis-brasil', type: 'service', priority: 0.90 },
    { url: '/blog', type: 'content', priority: 0.90 }
  ];

  // Secondary hubs (regional/thematic)
  static secondaryHubs = [
    { url: '/voos-miami-sao-paulo', type: 'route', priority: 0.85 },
    { url: '/voos-new-york-rio-janeiro', type: 'route', priority: 0.85 },
    { url: '/en/flights-to-brazil', type: 'international', priority: 0.80 }
  ];

  /**
   * CONTEXTUAL LINKING STRATEGIES
   */
  
  static generateHomePageLinks(): InternalLink[] {
    return [
      // Service links with strong anchor text
      {
        url: '/voos-brasil-eua',
        anchor: 'Passagens para o Brasil com os melhores preços',
        context: 'inline',
        priority: 'high',
        relationship: 'child'
      },
      {
        url: '/flights',
        anchor: 'Flight deals and cheap airfare',
        context: 'inline',
        priority: 'high',
        relationship: 'child'
      },
      {
        url: '/hoteis-brasil',
        anchor: 'Hotéis no Brasil com desconto exclusivo',
        context: 'inline',
        priority: 'high',
        relationship: 'child'
      },
      // City-specific deep linking
      ...this.generateCityLinks('home', 5), // Top 5 cities
      // Blog content promotion
      {
        url: '/blog/melhores-voos-brasil-eua',
        anchor: 'Guia completo: como encontrar as melhores passagens',
        context: 'contextual',
        priority: 'medium',
        relationship: 'related'
      }
    ];
  }

  static generateServicePageLinks(serviceType: string): InternalLink[] {
    const links: InternalLink[] = [];
    
    // Related services
    const serviceMap = {
      'voos': ['hoteis', 'carros', 'seguro'],
      'hoteis': ['voos', 'carros', 'passeios'],
      'carros': ['voos', 'hoteis', 'seguro']
    };

    const related = serviceMap[serviceType as keyof typeof serviceMap] || [];
    
    related.forEach(service => {
      links.push({
        url: `/${service}-brasil`,
        anchor: `${service.charAt(0).toUpperCase() + service.slice(1)} no Brasil`,
        context: 'contextual',
        priority: 'medium',
        relationship: 'sibling'
      });
    });

    // City-specific service links
    links.push(...this.generateCityLinks(serviceType, 3));
    
    // Blog content links
    links.push({
      url: `/blog/como-economizar-${serviceType}`,
      anchor: `Dicas para economizar em ${serviceType}`,
      context: 'contextual',
      priority: 'medium',
      relationship: 'related'
    });

    return links;
  }

  static generateCityLinks(context: string, limit: number = 10): InternalLink[] {
    return brazilianDiaspora
      .filter(city => city.priority === 'ultra-high' || city.priority === 'high')
      .slice(0, limit)
      .map(city => ({
        url: `/cidade/${city.id}`,
        anchor: `Voos para ${city.name}`,
        context: 'contextual' as const,
        priority: 'medium' as const,
        relationship: 'related' as const
      }));
  }

  /**
   * TOPIC CLUSTERS FOR BRAZIL TRAVEL
   */
  
  static brazilTravelClusters = {
    destinations: {
      pillar: '/blog/destinos-brasil-guia-completo',
      spokes: [
        '/blog/rio-de-janeiro-pontos-turisticos',
        '/blog/sao-paulo-vida-noturna',
        '/blog/salvador-cultura-afro-brasileira',
        '/blog/florianopolis-praias-paradisiacas',
        '/blog/foz-do-iguacu-cataratas'
      ]
    },
    flights: {
      pillar: '/voos-brasil-eua',
      spokes: [
        '/voos-miami-sao-paulo',
        '/voos-new-york-rio-janeiro',
        '/blog/melhores-voos-brasil-eua',
        '/blog/como-economizar-passagens-aereas'
      ]
    },
    planning: {
      pillar: '/blog/planejamento-viagem-brasil',
      spokes: [
        '/blog/documentos-viagem-brasil',
        '/blog/melhor-epoca-visitar-brasil',
        '/blog/seguro-viagem-brasil-obrigatorio',
        '/blog/quanto-custa-viagem-brasil'
      ]
    },
    culture: {
      pillar: '/blog/cultura-brasileira-guia',
      spokes: [
        '/blog/carnaval-brasil-onde-curtir',
        '/blog/culinaria-brasileira-pratos-tipicos',
        '/blog/musica-brasileira-historia',
        '/blog/festas-juninas-tradicoes'
      ]
    }
  };

  /**
   * ANCHOR TEXT OPTIMIZATION
   */
  
  static anchorTextVariations = {
    flights: [
      'passagens aéreas',
      'voos baratos',
      'passagens para o Brasil',
      'voos Brasil EUA',
      'passagens com desconto',
      'flight deals',
      'cheap flights',
      'flights to Brazil',
      'vuelos a Brasil',
      'pasajes aéreos'
    ],
    hotels: [
      'hotéis no Brasil',
      'hospedagem Brasil',
      'hotéis com desconto',
      'acomodações',
      'pousadas Brasil',
      'hotels in Brazil',
      'accommodation',
      'hoteles en Brasil'
    ],
    cities: (cityName: string) => [
      `viagem para ${cityName}`,
      `turismo em ${cityName}`,
      `o que fazer em ${cityName}`,
      `guia de ${cityName}`,
      `${cityName} pontos turísticos`,
      `travel to ${cityName}`,
      `${cityName} tourism guide`,
      `visit ${cityName}`
    ]
  };

  /**
   * AUTOMATED LINKING RECOMMENDATIONS
   */
  
  static generateLinkingRecommendations(pageUrl: string, content: string): InternalLink[] {
    const recommendations: InternalLink[] = [];
    
    // Keyword-based linking
    const keywordMap = {
      'passagens': ['/voos-brasil-eua', '/flights'],
      'hotéis': ['/hoteis-brasil', '/hoteis'],
      'seguro viagem': ['/seguro-viagem-brasil'],
      'aluguel de carros': ['/aluguel-carros-brasil'],
      'Rio de Janeiro': ['/cidade/rio-de-janeiro'],
      'São Paulo': ['/cidade/sao-paulo'],
      'Miami': ['/voos-miami-sao-paulo'],
      'Nova York': ['/voos-new-york-rio-janeiro']
    };

    Object.entries(keywordMap).forEach(([keyword, urls]) => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        urls.forEach(url => {
          if (url !== pageUrl) { // Avoid self-linking
            recommendations.push({
              url,
              anchor: this.getContextualAnchor(keyword, url),
              context: 'inline',
              priority: 'medium',
              relationship: 'related'
            });
          }
        });
      }
    });

    return recommendations;
  }

  /**
   * BREADCRUMB OPTIMIZATION
   */
  
  static generateBreadcrumbs(pageUrl: string): Array<{url: string, title: string}> {
    const segments = pageUrl.split('/').filter(Boolean);
    const breadcrumbs = [{url: '/', title: 'Início'}];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      const titles = {
        'voos': 'Voos',
        'hoteis': 'Hotéis',
        'blog': 'Blog', 
        'cidade': 'Cidades',
        'en': 'English',
        'es': 'Español',
        'flights': 'Flights',
        'brasil-eua': 'Brasil-EUA'
      };
      
      const title = titles[segment as keyof typeof titles] || 
                   segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (index < segments.length - 1) { // Don't link current page
        breadcrumbs.push({url: currentPath, title});
      } else {
        breadcrumbs.push({url: '', title}); // Current page, no link
      }
    });
    
    return breadcrumbs;
  }

  /**
   * PAGINATION LINKING
   */
  
  static generatePaginationLinks(currentPage: number, totalPages: number, baseUrl: string): InternalLink[] {
    const links: InternalLink[] = [];
    
    // Previous page
    if (currentPage > 1) {
      links.push({
        url: `${baseUrl}?page=${currentPage - 1}`,
        anchor: 'Página Anterior',
        context: 'navigation',
        priority: 'medium',
        relationship: 'sibling'
      });
    }
    
    // Next page
    if (currentPage < totalPages) {
      links.push({
        url: `${baseUrl}?page=${currentPage + 1}`,
        anchor: 'Próxima Página',
        context: 'navigation',
        priority: 'medium',
        relationship: 'sibling'
      });
    }
    
    // Page 1 canonical
    if (currentPage > 1) {
      links.push({
        url: baseUrl,
        anchor: 'Primeira Página',
        context: 'navigation',
        priority: 'high',
        relationship: 'parent'
      });
    }
    
    return links;
  }

  /**
   * HELPER METHODS
   */
  
  private static getContextualAnchor(keyword: string, url: string): string {
    const anchorMap = {
      'passagens': 'Encontre as melhores passagens aéreas',
      'hotéis': 'Reserve seu hotel com desconto',
      'Rio de Janeiro': 'Descubra o Rio de Janeiro',
      'São Paulo': 'Explore São Paulo',
      'Miami': 'Voos para Miami com melhor preço'
    };
    
    return anchorMap[keyword as keyof typeof anchorMap] || `Saiba mais sobre ${keyword}`;
  }

  /**
   * LINK EQUITY DISTRIBUTION
   * Calculates optimal linking strategy based on page authority
   */
  
  static calculateLinkEquity(pageUrl: string): number {
    const priorityMap = {
      '/': 1.0,
      '/voos-brasil-eua': 0.95,
      '/flights': 0.95,
      '/hoteis-brasil': 0.90,
      '/blog': 0.90
    };
    
    return priorityMap[pageUrl as keyof typeof priorityMap] || 0.70;
  }

  /**
   * RELATED CONTENT SUGGESTIONS
   */
  
  static generateRelatedContent(pageUrl: string, pageType: string): InternalLink[] {
    const relatedMap = {
      'voos-brasil-eua': [
        '/blog/melhores-voos-brasil-eua',
        '/hoteis-brasil',
        '/seguro-viagem-brasil',
        '/blog/documentos-viagem-brasil'
      ],
      'hoteis-brasil': [
        '/voos-brasil-eua',
        '/aluguel-carros-brasil',
        '/blog/onde-ficar-brasil',
        '/passeios-brasil'
      ]
    };
    
    const related = relatedMap[pageUrl.replace('/', '') as keyof typeof relatedMap] || [];
    
    return related.map(url => ({
      url,
      anchor: this.getContextualAnchor(url.split('/').pop() || '', url),
      context: 'sidebar' as const,
      priority: 'medium' as const,
      relationship: 'related' as const
    }));
  }

  /**
   * INTERNATIONAL LINKING STRATEGY
   */
  
  static generateInternationalLinks(lang: string, pageUrl: string): InternalLink[] {
    const langMap = {
      'en': { prefix: '/en', anchor: 'View in English' },
      'es': { prefix: '/es', anchor: 'Ver en Español' },
      'pt': { prefix: '', anchor: 'Ver em Português' }
    };
    
    const links: InternalLink[] = [];
    
    Object.entries(langMap).forEach(([language, config]) => {
      if (language !== lang) {
        const translatedUrl = language === 'pt' ? 
          pageUrl.replace(/^\/(en|es)/, '') :
          `${config.prefix}${pageUrl.replace(/^\/(en|es)/, '')}`;
          
        links.push({
          url: translatedUrl,
          anchor: config.anchor,
          context: 'navigation',
          priority: 'low',
          relationship: 'sibling'
        });
      }
    });
    
    return links;
  }
}

export default InternalLinkingOptimizer;