/**
 * ANCHOR TEXT OPTIMIZER
 * Strategic anchor text variation system for natural link building
 * Prevents over-optimization while maintaining SEO value
 */

export interface AnchorTextStrategy {
  targetKeyword: string;
  variations: AnchorVariation[];
  distribution: {
    exact: number;
    partial: number;
    branded: number;
    generic: number;
    lsi: number;
  };
  language: 'pt' | 'en' | 'es';
}

export interface AnchorVariation {
  text: string;
  type: 'exact' | 'partial' | 'branded' | 'generic' | 'lsi';
  weight: number;
  context: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class AnchorTextOptimizer {
  
  /**
   * OPTIMAL ANCHOR TEXT DISTRIBUTION
   * Based on SEO best practices to avoid over-optimization
   */
  static optimalDistribution = {
    exact: 0.05,      // 5% - Exact match keywords
    partial: 0.25,    // 25% - Partial match keywords  
    branded: 0.35,    // 35% - Brand variations
    generic: 0.20,    // 20% - Generic terms
    lsi: 0.15         // 15% - LSI/semantic keywords
  };

  /**
   * ANCHOR TEXT VARIATIONS BY KEYWORD
   */
  
  static generateAnchorStrategies(targetKeyword: string, language: 'pt' | 'en' | 'es' = 'pt'): AnchorTextStrategy {
    const variations: AnchorVariation[] = [];
    
    // Exact match (use sparingly)
    variations.push({
      text: targetKeyword,
      type: 'exact',
      weight: 0.05,
      context: ['high-authority sites', 'topic-relevant pages'],
      riskLevel: 'high'
    });

    // Partial match variations
    const partialVariations = this.generatePartialMatch(targetKeyword, language);
    partialVariations.forEach(variation => {
      variations.push({
        text: variation,
        type: 'partial',
        weight: 0.25 / partialVariations.length,
        context: ['content body', 'related articles'],
        riskLevel: 'medium'
      });
    });

    // Branded variations
    const brandedVariations = this.generateBrandedAnchors(targetKeyword, language);
    brandedVariations.forEach(variation => {
      variations.push({
        text: variation,
        type: 'branded',
        weight: 0.35 / brandedVariations.length,
        context: ['homepage', 'navigation', 'footer'],
        riskLevel: 'low'
      });
    });

    // Generic variations
    const genericVariations = this.generateGenericAnchors(language);
    genericVariations.forEach(variation => {
      variations.push({
        text: variation,
        type: 'generic',
        weight: 0.20 / genericVariations.length,
        context: ['call-to-action', 'content links'],
        riskLevel: 'low'
      });
    });

    // LSI/Semantic variations
    const lsiVariations = this.generateLSIAnchors(targetKeyword, language);
    lsiVariations.forEach(variation => {
      variations.push({
        text: variation,
        type: 'lsi',
        weight: 0.15 / lsiVariations.length,
        context: ['related content', 'topic clusters'],
        riskLevel: 'low'
      });
    });

    return {
      targetKeyword,
      variations,
      distribution: this.optimalDistribution,
      language
    };
  }

  /**
   * KEYWORD-SPECIFIC ANCHOR STRATEGIES
   */

  static flightKeywordStrategies = {
    'voos brasil eua': {
      pt: {
        partial: [
          'voos para o Brasil',
          'passagens Brasil EUA',
          'voos internacionais Brasil',
          'passagens aéreas Brasil',
          'voos baratos Brasil EUA'
        ],
        lsi: [
          'viagem para o Brasil',
          'passagens promocionais',
          'companhias aéreas',
          'voos diretos',
          'milhas aéreas'
        ]
      },
      en: {
        partial: [
          'flights to Brazil',
          'Brazil USA flights',
          'cheap flights Brazil',
          'airfare to Brazil',
          'Brazil flight deals'
        ],
        lsi: [
          'travel to Brazil',
          'Brazilian destinations',
          'international flights',
          'flight booking',
          'airline tickets'
        ]
      },
      es: {
        partial: [
          'vuelos a Brasil',
          'vuelos Brasil USA',
          'vuelos baratos Brasil',
          'boletos a Brasil',
          'ofertas vuelos Brasil'
        ],
        lsi: [
          'viaje a Brasil',
          'destinos brasileños',
          'vuelos internacionales',
          'reserva de vuelos',
          'boletos aéreos'
        ]
      }
    },
    'hoteis brasil': {
      pt: {
        partial: [
          'hotéis no Brasil',
          'hospedagem Brasil',
          'reserva de hotéis',
          'acomodações Brasil',
          'hotéis baratos Brasil'
        ],
        lsi: [
          'onde ficar no Brasil',
          'pousadas Brasil',
          'resorts Brasil',
          'hospedagem barata',
          'turismo Brasil'
        ]
      },
      en: {
        partial: [
          'hotels in Brazil',
          'Brazil accommodation',
          'hotel booking Brazil',
          'Brazil lodging',
          'cheap hotels Brazil'
        ],
        lsi: [
          'where to stay Brazil',
          'Brazil resorts',
          'accommodation deals',
          'travel accommodation',
          'hotel reservations'
        ]
      },
      es: {
        partial: [
          'hoteles en Brasil',
          'alojamiento Brasil',
          'reserva hoteles Brasil',
          'hospedaje Brasil',
          'hoteles baratos Brasil'
        ],
        lsi: [
          'dónde alojarse Brasil',
          'resorts Brasil',
          'ofertas alojamiento',
          'hospedaje viaje',
          'reservas hoteleras'
        ]
      }
    }
  };

  /**
   * ANCHOR GENERATION METHODS
   */

  private static generatePartialMatch(keyword: string, language: 'pt' | 'en' | 'es'): string[] {
    const variations: string[] = [];
    const words = keyword.split(' ');
    
    // Get predefined variations if available
    const keywordLower = keyword.toLowerCase();
    if (this.flightKeywordStrategies[keywordLower as keyof typeof this.flightKeywordStrategies]) {
      const strategy = this.flightKeywordStrategies[keywordLower as keyof typeof this.flightKeywordStrategies];
      if (strategy[language]?.partial) {
        variations.push(...strategy[language].partial);
      }
    }
    
    // Generate dynamic variations
    if (words.length > 1) {
      // Use first and last word
      variations.push(`${words[0]} ${words[words.length - 1]}`);
      
      // Add descriptive words
      const descriptors = this.getDescriptors(language);
      descriptors.forEach(desc => {
        variations.push(`${desc} ${keyword}`);
        variations.push(`${keyword} ${desc}`);
      });
    }
    
    return [...new Set(variations)].slice(0, 8); // Limit to 8 variations
  }

  private static generateBrandedAnchors(keyword: string, language: 'pt' | 'en' | 'es'): string[] {
    const brandVariations = {
      pt: [
        'Fly2Any',
        'Fly2Any - Especialistas em Viagem',
        'Site Fly2Any',
        'Portal Fly2Any',
        `${keyword} na Fly2Any`,
        `${keyword} - Fly2Any`,
        'Clique aqui - Fly2Any',
        'Saiba mais na Fly2Any'
      ],
      en: [
        'Fly2Any',
        'Fly2Any Travel Experts', 
        'Fly2Any Website',
        'Fly2Any Portal',
        `${keyword} at Fly2Any`,
        `${keyword} - Fly2Any`,
        'Click here - Fly2Any',
        'Learn more at Fly2Any'
      ],
      es: [
        'Fly2Any',
        'Fly2Any Expertos en Viajes',
        'Sitio Fly2Any',
        'Portal Fly2Any',
        `${keyword} en Fly2Any`,
        `${keyword} - Fly2Any`,
        'Haz clic aquí - Fly2Any',
        'Aprende más en Fly2Any'
      ]
    };
    
    return brandVariations[language] || brandVariations.pt;
  }

  private static generateGenericAnchors(language: 'pt' | 'en' | 'es'): string[] {
    const genericTerms = {
      pt: [
        'clique aqui',
        'saiba mais',
        'veja mais',
        'acesse agora',
        'confira',
        'descubra',
        'leia mais',
        'veja detalhes',
        'consulte',
        'verifique'
      ],
      en: [
        'click here',
        'learn more',
        'read more',
        'find out',
        'discover',
        'explore',
        'view details',
        'see more',
        'check out',
        'visit'
      ],
      es: [
        'haz clic aquí',
        'aprende más',
        'lee más',
        'descubre',
        'explora',
        've detalles',
        've más',
        'consulta',
        'verifica',
        'visita'
      ]
    };
    
    return genericTerms[language] || genericTerms.pt;
  }

  private static generateLSIAnchors(keyword: string, language: 'pt' | 'en' | 'es'): string[] {
    const keywordLower = keyword.toLowerCase();
    
    // Get predefined LSI terms
    if (this.flightKeywordStrategies[keywordLower as keyof typeof this.flightKeywordStrategies]) {
      const strategy = this.flightKeywordStrategies[keywordLower as keyof typeof this.flightKeywordStrategies];
      if (strategy[language]?.lsi) {
        return strategy[language].lsi;
      }
    }
    
    // Generate semantic variations based on keyword context
    const lsiTerms = this.getLSITerms(keyword, language);
    return lsiTerms;
  }

  private static getDescriptors(language: 'pt' | 'en' | 'es'): string[] {
    const descriptors = {
      pt: ['melhores', 'baratos', 'promocionais', 'exclusivos', 'especiais'],
      en: ['best', 'cheap', 'discounted', 'exclusive', 'special'],
      es: ['mejores', 'baratos', 'promocionales', 'exclusivos', 'especiales']
    };
    
    return descriptors[language] || descriptors.pt;
  }

  private static getLSITerms(keyword: string, language: 'pt' | 'en' | 'es'): string[] {
    // Semantic keyword mapping
    const lsiMap = {
      pt: {
        'voo': ['viagem', 'passagem', 'companhia aérea', 'aeroporto', 'turismo'],
        'hotel': ['hospedagem', 'acomodação', 'pousada', 'resort', 'estadia'],
        'brasil': ['brasileiro', 'turismo', 'destino', 'cultura', 'viagem'],
        'carro': ['veículo', 'aluguel', 'transporte', 'mobilidade', 'locação']
      },
      en: {
        'flight': ['travel', 'airline', 'airport', 'booking', 'ticket'],
        'hotel': ['accommodation', 'lodging', 'stay', 'resort', 'booking'],
        'brazil': ['brazilian', 'destination', 'travel', 'culture', 'tourism'],
        'car': ['vehicle', 'rental', 'transport', 'mobility', 'hire']
      },
      es: {
        'vuelo': ['viaje', 'aerolínea', 'aeropuerto', 'reserva', 'boleto'],
        'hotel': ['alojamiento', 'hospedaje', 'estadía', 'resort', 'reserva'],
        'brasil': ['brasileño', 'destino', 'viaje', 'cultura', 'turismo'],
        'coche': ['vehículo', 'alquiler', 'transporte', 'movilidad', 'renta']
      }
    };
    
    const terms: string[] = [];
    const words = keyword.toLowerCase().split(' ');
    const langMap = lsiMap[language] || lsiMap.pt;
    
    words.forEach(word => {
      Object.keys(langMap).forEach(key => {
        if (word.includes(key)) {
          terms.push(...langMap[key as keyof typeof langMap]);
        }
      });
    });
    
    return [...new Set(terms)].slice(0, 5);
  }

  /**
   * ANCHOR TEXT SELECTION METHODS
   */

  static selectOptimalAnchor(
    strategy: AnchorTextStrategy,
    context: string,
    usedAnchors: string[] = []
  ): AnchorVariation | null {
    
    // Filter variations by context
    const contextualVariations = strategy.variations.filter(variation =>
      variation.context.includes(context) || 
      variation.context.includes('any') ||
      context === 'any'
    );
    
    // Exclude already used anchors to maintain diversity
    const availableVariations = contextualVariations.filter(variation =>
      !usedAnchors.includes(variation.text)
    );
    
    if (availableVariations.length === 0) {
      return contextualVariations[0] || null;
    }
    
    // Select based on weight and risk level
    const lowRiskVariations = availableVariations.filter(v => v.riskLevel === 'low');
    if (lowRiskVariations.length > 0) {
      return this.selectByWeight(lowRiskVariations);
    }
    
    return this.selectByWeight(availableVariations);
  }

  private static selectByWeight(variations: AnchorVariation[]): AnchorVariation {
    const totalWeight = variations.reduce((sum, variation) => sum + variation.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const variation of variations) {
      currentWeight += variation.weight;
      if (random <= currentWeight) {
        return variation;
      }
    }
    
    return variations[0];
  }

  /**
   * ANCHOR TEXT AUDIT METHODS
   */

  static auditAnchorDistribution(anchors: Array<{text: string, type: string}>): {
    current: {[key: string]: number};
    optimal: {[key: string]: number};
    recommendations: string[];
  } {
    const total = anchors.length;
    const current = {
      exact: 0,
      partial: 0,
      branded: 0,
      generic: 0,
      lsi: 0
    };
    
    // Calculate current distribution
    anchors.forEach(anchor => {
      current[anchor.type as keyof typeof current]++;
    });
    
    // Convert to percentages
    Object.keys(current).forEach(key => {
      current[key as keyof typeof current] = current[key as keyof typeof current] / total;
    });
    
    const recommendations: string[] = [];
    
    // Compare with optimal distribution
    Object.keys(this.optimalDistribution).forEach(key => {
      const currentPercent = current[key as keyof typeof current];
      const optimalPercent = this.optimalDistribution[key as keyof typeof this.optimalDistribution];
      
      if (currentPercent > optimalPercent + 0.1) {
        recommendations.push(`Reduce ${key} match anchors (currently ${(currentPercent*100).toFixed(1)}%, optimal: ${(optimalPercent*100).toFixed(1)}%)`);
      } else if (currentPercent < optimalPercent - 0.1) {
        recommendations.push(`Increase ${key} match anchors (currently ${(currentPercent*100).toFixed(1)}%, optimal: ${(optimalPercent*100).toFixed(1)}%)`);
      }
    });
    
    return {
      current,
      optimal: this.optimalDistribution,
      recommendations
    };
  }

  /**
   * UTILITY METHODS
   */

  static generateAnchorTextReport(keyword: string, language: 'pt' | 'en' | 'es' = 'pt'): string {
    const strategy = this.generateAnchorStrategies(keyword, language);
    
    let report = `ANCHOR TEXT STRATEGY REPORT\n`;
    report += `Target Keyword: ${keyword}\n`;
    report += `Language: ${language.toUpperCase()}\n\n`;
    
    report += `RECOMMENDED DISTRIBUTION:\n`;
    Object.entries(strategy.distribution).forEach(([type, percentage]) => {
      report += `- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${(percentage * 100).toFixed(1)}%\n`;
    });
    
    report += `\nANCHOR VARIATIONS:\n`;
    strategy.variations.forEach((variation, index) => {
      report += `${index + 1}. "${variation.text}" (${variation.type}, risk: ${variation.riskLevel})\n`;
    });
    
    return report;
  }
}

export default AnchorTextOptimizer;