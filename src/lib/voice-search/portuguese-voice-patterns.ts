/**
 * Portuguese Voice Search Optimization System
 * Comprehensive analysis of Brazilian Portuguese voice search patterns
 * Optimized for Google Assistant, Siri, and Alexa in Portuguese
 */

export interface VoiceSearchPattern {
  query: string;
  intent: 'travel-booking' | 'price-inquiry' | 'destination-info' | 'travel-requirements' | 'comparison' | 'local-info';
  formality: 'formal' | 'informal' | 'colloquial';
  region: 'general' | 'southeast' | 'northeast' | 'south' | 'north' | 'central-west';
  frequency: 'high' | 'medium' | 'low';
  seasonality: 'year-round' | 'summer' | 'winter' | 'holidays' | 'carnival';
  demographics: {
    ageGroup: 'young' | 'adult' | 'senior' | 'all';
    socioeconomic: 'low' | 'middle' | 'high' | 'all';
    techSavvy: 'low' | 'medium' | 'high';
  };
  relatedKeywords: string[];
  naturalVariations: string[];
}

export interface VoiceSearchResponse {
  question: string;
  answer: string;
  followupQuestions: string[];
  relatedContent: string[];
  structuredData: object;
}

// Brazilian Portuguese Voice Search Patterns Database
export const brazilianVoiceSearchPatterns: VoiceSearchPattern[] = [
  // TRAVEL BOOKING QUERIES
  {
    query: "Quanto custa uma passagem para o Brasil?",
    intent: 'price-inquiry',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'all',
      socioeconomic: 'all',
      techSavvy: 'medium'
    },
    relatedKeywords: ['preço passagem', 'custo viagem', 'valor ticket'],
    naturalVariations: [
      "Qual o preço de uma passagem pro Brasil?",
      "Quanto tá custando viajar para o Brasil?",
      "Qual o valor da passagem para o Brasil hoje?",
      "Quanto eu pago numa passagem pro Brasil?",
      "Preço de passagem aérea Brasil"
    ]
  },

  {
    query: "Como comprar passagem barata para São Paulo?",
    intent: 'travel-booking',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'low',
      techSavvy: 'medium'
    },
    relatedKeywords: ['passagem barata', 'promoção voo', 'desconto viagem'],
    naturalVariations: [
      "Onde encontrar passagem barata para São Paulo?",
      "Tem promoção de passagem pra Sampa?",
      "Como achar voo barato São Paulo?",
      "Passagem em conta para São Paulo",
      "Voo promocional São Paulo"
    ]
  },

  {
    query: "Precisa de visto para brasileiro viajar pros Estados Unidos?",
    intent: 'travel-requirements',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'medium'
    },
    relatedKeywords: ['visto americano', 'documentos viagem', 'requisitos entrada'],
    naturalVariations: [
      "Brasileiro precisa de visto para os EUA?",
      "É obrigatório visto americano para brasileiros?",
      "Que documento precisa pra viajar pros Estados Unidos?",
      "Visto americano é necessário?",
      "Documentação para viajar EUA"
    ]
  },

  {
    query: "Qual a melhor época para viajar para o Brasil?",
    intent: 'destination-info',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'medium'
    },
    relatedKeywords: ['melhor época', 'quando viajar', 'temporada brasil'],
    naturalVariations: [
      "Quando é melhor viajar pro Brasil?",
      "Qual o melhor mês para ir ao Brasil?",
      "Época ideal para conhecer o Brasil",
      "Quando viajar Brasil clima bom?",
      "Temporada alta Brasil quando é?"
    ]
  },

  // REGIONAL VARIATIONS - NORTHEAST
  {
    query: "Oxe, quanto custa ir para Salvador?",
    intent: 'price-inquiry',
    formality: 'colloquial',
    region: 'northeast',
    frequency: 'medium',
    seasonality: 'carnival',
    demographics: {
      ageGroup: 'young',
      socioeconomic: 'middle',
      techSavvy: 'high'
    },
    relatedKeywords: ['voo salvador', 'passagem bahia', 'carnaval salvador'],
    naturalVariations: [
      "Ôxe, qual o preço da passagem pra Salvador?",
      "Quanto tá custando viajar pra Bahia?",
      "Preço de passagem para Salvador no carnaval",
      "Vou de avi pra Salvador, quanto custa?",
      "Passagem pra terra da alegria quanto é?"
    ]
  },

  // SOUTHEAST VARIATIONS
  {
    query: "Uai, tem voo direto de Miami para Belo Horizonte?",
    intent: 'travel-booking',
    formality: 'colloquial',
    region: 'southeast',
    frequency: 'medium',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'medium'
    },
    relatedKeywords: ['voo direto', 'miami belo horizonte', 'confins'],
    naturalVariations: [
      "Uai, tem voo Miami BH direto?",
      "Voo direto Miami Confins tem?",
      "Miami para BH sem escala existe?",
      "Voo Miami Belo Horizonte direto",
      "Tem voo sem parar Miami BH?"
    ]
  },

  // SOUTH REGION VARIATIONS
  {
    query: "Bah, qual o valor da passagem Porto Alegre New York?",
    intent: 'price-inquiry',
    formality: 'colloquial',
    region: 'south',
    frequency: 'medium',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'medium'
    },
    relatedKeywords: ['poa nova york', 'salgado filho', 'passagem sul'],
    naturalVariations: [
      "Bah, quanto custa POA New York?",
      "Passagem Porto Alegre NY preço",
      "Salgado Filho Nova York valor",
      "Tchê, quanto tá POA pra NY?",
      "Voo Porto Alegre Estados Unidos preço"
    ]
  },

  // DIASPORA-SPECIFIC QUERIES
  {
    query: "Como mandar dinheiro para família no Brasil?",
    intent: 'local-info',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'all',
      techSavvy: 'medium'
    },
    relatedKeywords: ['remessa internacional', 'envio dinheiro', 'transferência brasil'],
    naturalVariations: [
      "Melhor forma de enviar dinheiro pro Brasil",
      "Como transferir dinheiro para o Brasil?",
      "Remessa para Brasil qual empresa?",
      "Envio de dinheiro Brasil barato",
      "Western Union ou Remitly pro Brasil?"
    ]
  },

  {
    query: "Onde encontrar comida brasileira aqui perto?",
    intent: 'local-info',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'all',
      socioeconomic: 'all',
      techSavvy: 'medium'
    },
    relatedKeywords: ['restaurante brasileiro', 'comida brasil', 'churrascaria'],
    naturalVariations: [
      "Restaurante brasileiro próximo de mim",
      "Comida brasileira na região",
      "Churrascaria perto daqui",
      "Onde comer feijoada aqui?",
      "Restaurante com comida do Brasil"
    ]
  },

  // COMPARISON QUERIES
  {
    query: "Qual é melhor, LATAM ou American para o Brasil?",
    intent: 'comparison',
    formality: 'informal',
    region: 'general',
    frequency: 'medium',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'high'
    },
    relatedKeywords: ['companhia aérea', 'melhor airline', 'comparação voos'],
    naturalVariations: [
      "LATAM ou American qual melhor?",
      "Que companhia aérea é boa pro Brasil?",
      "Melhor airline para voar pro Brasil",
      "LATAM vale a pena ou American?",
      "Comparar LATAM American Brasil"
    ]
  },

  // SEASONAL QUERIES
  {
    query: "Tem desconto de Black Friday para passagens Brasil?",
    intent: 'price-inquiry',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'holidays',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'high'
    },
    relatedKeywords: ['black friday', 'desconto passagem', 'promoção voo'],
    naturalVariations: [
      "Black Friday passagens Brasil tem desconto?",
      "Promoção Black Friday voos Brasil",
      "Desconto Black Friday passagem aérea",
      "Black Friday viagem Brasil oferta",
      "Cyber Monday passagens Brasil barato"
    ]
  },

  // EMERGENCY/URGENT QUERIES
  {
    query: "Preciso viajar urgente para o Brasil, como faço?",
    intent: 'travel-booking',
    formality: 'informal',
    region: 'general',
    frequency: 'medium',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'all',
      techSavvy: 'medium'
    },
    relatedKeywords: ['viagem urgente', 'passagem última hora', 'emergência viagem'],
    naturalVariations: [
      "Passagem de última hora para o Brasil",
      "Viagem emergência Brasil como comprar?",
      "Preciso viajar hoje pro Brasil",
      "Passagem urgente Brasil onde comprar?",
      "Emergency flight to Brazil today"
    ]
  },

  // TECHNICAL QUERIES
  {
    query: "Meu celular vai funcionar no Brasil?",
    intent: 'travel-requirements',
    formality: 'informal',
    region: 'general',
    frequency: 'medium',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'all',
      socioeconomic: 'middle',
      techSavvy: 'low'
    },
    relatedKeywords: ['celular brasil', 'roaming internacional', 'chip brasil'],
    naturalVariations: [
      "Telefone funciona no Brasil?",
      "Precisa chip brasileiro?",
      "Roaming Brasil vale a pena?",
      "Internet no Brasil como funciona?",
      "Celular americano funciona Brasil?"
    ]
  },

  // CULTURAL QUERIES
  {
    query: "O que não pode perder no Rio de Janeiro?",
    intent: 'destination-info',
    formality: 'informal',
    region: 'general',
    frequency: 'high',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'all',
      socioeconomic: 'middle',
      techSavvy: 'medium'
    },
    relatedKeywords: ['pontos turísticos rio', 'o que fazer rio', 'turismo rio'],
    naturalVariations: [
      "Pontos turísticos imperdíveis no Rio",
      "O que visitar no Rio de Janeiro?",
      "Roteiro Rio de Janeiro 3 dias",
      "Lugares famosos Rio de Janeiro",
      "Atrações principais Rio de Janeiro"
    ]
  },

  // HEALTH/SAFETY QUERIES
  {
    query: "Precisa tomar vacina para viajar pro Brasil?",
    intent: 'travel-requirements',
    formality: 'informal',
    region: 'general',
    frequency: 'medium',
    seasonality: 'year-round',
    demographics: {
      ageGroup: 'adult',
      socioeconomic: 'middle',
      techSavvy: 'medium'
    },
    relatedKeywords: ['vacina brasil', 'saúde viagem', 'imunização'],
    naturalVariations: [
      "Que vacinas precisa para o Brasil?",
      "Vacinação obrigatória Brasil turista",
      "Certificado vacinal Brasil necessário?",
      "Precisa vacina febre amarela Brasil?",
      "Imunização para viajar Brasil"
    ]
  }
];

// Voice Search Response Templates in Portuguese
export const voiceSearchResponses: Record<string, VoiceSearchResponse> = {
  "price-inquiry": {
    question: "Quanto custa uma passagem para o Brasil?",
    answer: "Os preços de passagens para o Brasil variam entre R$ 1.800 e R$ 4.500, dependendo da época, origem e antecedência da compra. Recomendamos comprar com 60 dias de antecedência para melhores preços.",
    followupQuestions: [
      "De qual cidade você quer partir?",
      "Para qual cidade do Brasil?",
      "Quando você pretende viajar?",
      "Quer ver as promoções atuais?"
    ],
    relatedContent: [
      "/passagens-baratas-brasil",
      "/promocoes-voos-brasil",
      "/calendario-melhores-precos"
    ],
    structuredData: {
      "@type": "FAQPage",
      "mainEntity": {
        "@type": "Question",
        "name": "Quanto custa uma passagem para o Brasil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Os preços variam entre R$ 1.800 e R$ 4.500, dependendo da época e antecedência."
        }
      }
    }
  },

  "travel-booking": {
    question: "Como comprar passagem barata para São Paulo?",
    answer: "Para encontrar passagens baratas para São Paulo, use nosso comparador de preços, seja flexível com datas, compre com antecedência e considere voos com escala. Temos ofertas especiais toda semana.",
    followupQuestions: [
      "Quer ver as ofertas de hoje?",
      "Prefere voo direto ou com escala?",
      "Qual sua data preferida de viagem?",
      "Quer receber alertas de preço?"
    ],
    relatedContent: [
      "/voos-sao-paulo",
      "/ofertas-especiais",
      "/dicas-economia-viagem"
    ],
    structuredData: {
      "@type": "HowTo",
      "name": "Como comprar passagem barata para São Paulo",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Compare preços",
          "text": "Use nosso comparador para encontrar as melhores ofertas"
        }
      ]
    }
  },

  "travel-requirements": {
    question: "Precisa de visto para brasileiro viajar pros Estados Unidos?",
    answer: "Sim, brasileiros precisam de visto para entrar nos Estados Unidos. É necessário solicitar visto de turista (B1/B2) no consulado americano com antecedência mínima de 30 dias.",
    followupQuestions: [
      "Quer saber como solicitar o visto?",
      "Precisa de ajuda com documentação?",
      "Quer conhecer os requisitos completos?",
      "Tem dúvidas sobre a entrevista?"
    ],
    relatedContent: [
      "/visto-americano-brasileiro",
      "/documentos-necessarios-eua",
      "/guia-completo-visto-turistico"
    ],
    structuredData: {
      "@type": "FAQPage",
      "mainEntity": {
        "@type": "Question",
        "name": "Precisa de visto para brasileiro viajar pros Estados Unidos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, brasileiros precisam de visto de turista (B1/B2) para entrar nos EUA."
        }
      }
    }
  }
};

// Regional Portuguese Variations
export const regionalVoicePatterns = {
  northeast: {
    commonExpressions: ["oxe", "ôxe", "massa", "da hora", "véi"],
    localTerms: {
      "avião": ["avi", "aeronave"],
      "dinheiro": ["dinheirinho", "tutu", "grana"],
      "legal": ["massa", "da hora", "tri legal"],
      "caro": ["salgado", "pesado no bolso"]
    }
  },
  
  southeast: {
    commonExpressions: ["uai", "trem", "sô", "ué"],
    localTerms: {
      "ônibus": ["trem", "coletivo"],
      "sacola": ["sacola", "sacolinha"],
      "legal": ["tri legal", "show", "massa"]
    }
  },
  
  south: {
    commonExpressions: ["bah", "tchê", "tri", "barbaridade"],
    localTerms: {
      "legal": ["tri legal", "bárbaro", "massa"],
      "caro": ["salgado", "tri caro"],
      "dinheiro": ["pila", "grana", "dinheiro"]
    }
  },
  
  north: {
    commonExpressions: ["mano", "véi", "rapaz"],
    localTerms: {
      "legal": ["massa", "show", "da hora"],
      "dinheiro": ["grana", "dinheirinho"]
    }
  }
};

// Mobile Voice Search Optimization
export const mobileVoiceOptimization = {
  shortAnswers: true,
  conversationalTone: true,
  localContext: true,
  immediateActions: true,
  featuredSnippets: true
};

// Helper Functions
export function getVoicePatternsByIntent(intent: string): VoiceSearchPattern[] {
  return brazilianVoiceSearchPatterns.filter(pattern => pattern.intent === intent);
}

export function getVoicePatternsByRegion(region: string): VoiceSearchPattern[] {
  return brazilianVoiceSearchPatterns.filter(pattern => pattern.region === region || pattern.region === 'general');
}

export function getHighFrequencyPatterns(): VoiceSearchPattern[] {
  return brazilianVoiceSearchPatterns.filter(pattern => pattern.frequency === 'high');
}

export function getSeasonalPatterns(season: string): VoiceSearchPattern[] {
  return brazilianVoiceSearchPatterns.filter(pattern => 
    pattern.seasonality === season || pattern.seasonality === 'year-round'
  );
}

export function generateNaturalVariations(baseQuery: string, region: string = 'general'): string[] {
  const regional = regionalVoicePatterns[region as keyof typeof regionalVoicePatterns];
  if (!regional) return [baseQuery];
  
  let variations = [baseQuery];
  
  // Add regional expressions
  regional.commonExpressions.forEach(expr => {
    variations.push(`${expr}, ${baseQuery}`);
    variations.push(`${baseQuery}, ${expr}`);
  });
  
  return variations;
}

export function optimizeForVoiceSearch(content: string): string {
  // Add conversational elements
  const voiceOptimized = content
    .replace(/\./g, '. ')
    .replace(/,/g, ', ')
    .replace(/\?/g, '? ')
    .replace(/!/g, '! ');
    
  return voiceOptimized;
}

export default {
  brazilianVoiceSearchPatterns,
  voiceSearchResponses,
  regionalVoicePatterns,
  mobileVoiceOptimization,
  getVoicePatternsByIntent,
  getVoicePatternsByRegion,
  getHighFrequencyPatterns,
  getSeasonalPatterns,
  generateNaturalVariations,
  optimizeForVoiceSearch
};