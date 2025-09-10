/**
 * Voice Search Schema Generator for Portuguese Content
 * Generates structured data optimized for voice assistants
 * Supports Google Assistant, Siri, and Alexa in Portuguese
 */

export interface VoiceSchemaConfig {
  language: 'pt-BR' | 'pt-PT' | 'pt';
  region: 'brazil' | 'portugal' | 'general';
  voiceAssistants: ('google' | 'siri' | 'alexa' | 'cortana')[];
  contentType: 'faq' | 'howto' | 'travel' | 'local-business' | 'event';
}

export interface VoiceSearchSchema {
  '@context': string;
  '@type': string;
  name?: string;
  description?: string;
  inLanguage: string;
  speakable?: SpeakableSchema;
  mainEntity?: any[];
  [key: string]: any;
}

export interface SpeakableSchema {
  '@type': 'SpeakableSpecification';
  cssSelector: string[];
  xpath?: string[];
}

export interface FAQSchema {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
    speakable?: SpeakableSchema;
  };
  inLanguage: string;
  dateCreated?: string;
  author?: AuthorSchema;
}

export interface HowToSchema {
  '@type': 'HowTo';
  name: string;
  description: string;
  step: HowToStepSchema[];
  totalTime?: string;
  supply?: string[];
  tool?: string[];
  inLanguage: string;
  speakable?: SpeakableSchema;
}

export interface HowToStepSchema {
  '@type': 'HowToStep';
  position: number;
  name: string;
  text: string;
  url?: string;
  speakable?: SpeakableSchema;
}

export interface AuthorSchema {
  '@type': 'Organization' | 'Person';
  name: string;
  url?: string;
}

export interface TravelSchema {
  '@type': 'TravelAction';
  agent: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  fromLocation: PlaceSchema;
  toLocation: PlaceSchema;
  price?: {
    '@type': 'PriceSpecification';
    priceCurrency: string;
    price: string;
  };
}

export interface PlaceSchema {
  '@type': 'Place';
  name: string;
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality?: string;
  };
}

export class VoiceSearchSchemaGenerator {
  private defaultConfig: VoiceSchemaConfig = {
    language: 'pt-BR',
    region: 'brazil',
    voiceAssistants: ['google', 'siri', 'alexa'],
    contentType: 'faq'
  };

  /**
   * Generate FAQ Schema optimized for Portuguese voice search
   */
  public generateFAQSchema(
    questions: { question: string; answer: string; category?: string }[],
    config: Partial<VoiceSchemaConfig> = {}
  ): VoiceSearchSchema {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    const faqEntities: FAQSchema[] = questions.map(({ question, answer, category }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: this.optimizeAnswerForVoice(answer, finalConfig.language),
        speakable: this.generateSpeakableSchema(['p', '.answer-text'])
      },
      inLanguage: finalConfig.language,
      dateCreated: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Fly2Any - Especialistas em Viagens para o Brasil',
        url: 'https://fly2any.com'
      }
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      name: 'Perguntas Frequentes - Viagens para o Brasil',
      description: 'Respostas completas para suas dúvidas sobre viagens para o Brasil, otimizadas para busca por voz.',
      inLanguage: finalConfig.language,
      mainEntity: faqEntities,
      speakable: this.generateSpeakableSchema(['.faq-container', 'h2', '.faq-answer']),
      publisher: {
        '@type': 'Organization',
        name: 'Fly2Any',
        url: 'https://fly2any.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://fly2any.com/logo.png'
        }
      },
      dateModified: new Date().toISOString(),
      audience: {
        '@type': 'Audience',
        audienceType: 'Brazilian travelers, Portuguese speakers',
        geographicArea: {
          '@type': 'Place',
          name: finalConfig.region === 'brazil' ? 'Brasil' : 'Portuguese-speaking countries'
        }
      }
    };
  }

  /**
   * Generate HowTo Schema for step-by-step guides in Portuguese
   */
  public generateHowToSchema(
    title: string,
    description: string,
    steps: { name: string; description: string; url?: string }[],
    config: Partial<VoiceSchemaConfig> = {}
  ): VoiceSearchSchema {
    const finalConfig = { ...this.defaultConfig, ...config };

    const howToSteps: HowToStepSchema[] = steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: this.optimizeAnswerForVoice(step.description, finalConfig.language),
      url: step.url,
      speakable: this.generateSpeakableSchema([`.step-${index + 1}`, 'h3', 'p'])
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      description: description,
      step: howToSteps,
      inLanguage: finalConfig.language,
      totalTime: this.estimateTotalTime(steps.length),
      supply: this.generateSupplyList(description),
      speakable: this.generateSpeakableSchema(['h1', '.howto-description', '.steps-container']),
      author: {
        '@type': 'Organization',
        name: 'Fly2Any',
        url: 'https://fly2any.com'
      },
      datePublished: new Date().toISOString(),
      audience: {
        '@type': 'Audience',
        audienceType: 'Travel planning, Brazilian travelers'
      }
    };
  }

  /**
   * Generate Travel Schema for flight and travel information
   */
  public generateTravelSchema(
    fromCity: string,
    toCity: string,
    fromCountry: string,
    toCountry: string,
    price?: { min: number; max: number; currency: string },
    config: Partial<VoiceSchemaConfig> = {}
  ): VoiceSearchSchema {
    const finalConfig = { ...this.defaultConfig, ...config };

    return {
      '@context': 'https://schema.org',
      '@type': 'TravelAction',
      agent: {
        '@type': 'TravelAgency',
        name: 'Fly2Any',
        url: 'https://fly2any.com',
        description: 'Agência especializada em voos para o Brasil'
      },
      fromLocation: {
        '@type': 'Place',
        name: fromCity,
        address: {
          '@type': 'PostalAddress',
          addressCountry: fromCountry,
          addressLocality: fromCity
        }
      },
      toLocation: {
        '@type': 'Place',
        name: toCity,
        address: {
          '@type': 'PostalAddress',
          addressCountry: toCountry,
          addressLocality: toCity
        }
      },
      price: price ? {
        '@type': 'PriceSpecification',
        priceCurrency: price.currency,
        minPrice: price.min.toString(),
        maxPrice: price.max.toString(),
        description: `Preços de passagens ${fromCity} para ${toCity}`
      } : undefined,
      inLanguage: finalConfig.language,
      speakable: this.generateSpeakableSchema(['h1', '.route-info', '.price-info']),
      provider: {
        '@type': 'Organization',
        name: 'Fly2Any',
        description: 'Especialistas em viagens para o Brasil'
      },
      result: {
        '@type': 'Trip',
        name: `Viagem ${fromCity} - ${toCity}`,
        description: `Informações completas sobre voos de ${fromCity} para ${toCity}`
      }
    };
  }

  /**
   * Generate Local Business Schema for Brazilian communities
   */
  public generateLocalBusinessSchema(
    businessName: string,
    businessType: string,
    address: string,
    city: string,
    phone?: string,
    website?: string,
    config: Partial<VoiceSchemaConfig> = {}
  ): VoiceSearchSchema {
    const finalConfig = { ...this.defaultConfig, ...config };

    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `https://fly2any.com/businesses/${businessName.toLowerCase().replace(/\s+/g, '-')}`,
      name: businessName,
      description: `${businessType} que atende a comunidade brasileira em ${city}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressLocality: city,
        addressCountry: 'USA'
      },
      telephone: phone,
      url: website,
      inLanguage: finalConfig.language,
      audience: {
        '@type': 'Audience',
        audienceType: 'Brazilian community, Portuguese speakers',
        geographicArea: {
          '@type': 'Place',
          name: city
        }
      },
      speakable: this.generateSpeakableSchema(['h1', '.business-info', '.contact-info']),
      priceRange: '$$',
      servedCuisine: businessType === 'Restaurant' ? 'Brazilian' : undefined,
      acceptsReservations: businessType === 'Restaurant' ? 'True' : undefined
    };
  }

  /**
   * Generate Event Schema for Brazilian cultural events
   */
  public generateEventSchema(
    eventName: string,
    description: string,
    startDate: string,
    location: string,
    organizer: string,
    config: Partial<VoiceSchemaConfig> = {}
  ): VoiceSearchSchema {
    const finalConfig = { ...this.defaultConfig, ...config };

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: eventName,
      description: description,
      startDate: startDate,
      location: {
        '@type': 'Place',
        name: location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location
        }
      },
      organizer: {
        '@type': 'Organization',
        name: organizer
      },
      inLanguage: finalConfig.language,
      audience: {
        '@type': 'Audience',
        audienceType: 'Brazilian community, Cultural enthusiasts'
      },
      speakable: this.generateSpeakableSchema(['h1', '.event-description', '.event-details']),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      isAccessibleForFree: true,
      keywords: 'evento brasileiro, cultura brasileira, comunidade brasileira'
    };
  }

  /**
   * Generate comprehensive voice search schema for a page
   */
  public generateComprehensiveSchema(pageData: {
    title: string;
    description: string;
    content: string;
    faqs?: { question: string; answer: string }[];
    howTo?: { name: string; description: string }[];
    travel?: { from: string; to: string; fromCountry: string; toCountry: string };
    region: string;
  }, config: Partial<VoiceSchemaConfig> = {}): VoiceSearchSchema[] {
    const finalConfig = { ...this.defaultConfig, ...config };
    const schemas: VoiceSearchSchema[] = [];

    // Main WebPage schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageData.title,
      description: pageData.description,
      inLanguage: finalConfig.language,
      speakable: this.generateSpeakableSchema(['h1', 'h2', 'p', '.main-content']),
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://fly2any.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Viagens Brasil',
            item: 'https://fly2any.com/brasil'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pageData.title,
            item: `https://fly2any.com/current-page`
          }
        ]
      },
      about: {
        '@type': 'Thing',
        name: 'Viagens para o Brasil',
        description: 'Informações sobre voos, destinos e dicas para viajar ao Brasil'
      }
    });

    // FAQ schema if FAQs are provided
    if (pageData.faqs && pageData.faqs.length > 0) {
      schemas.push(this.generateFAQSchema(pageData.faqs, finalConfig));
    }

    // HowTo schema if steps are provided
    if (pageData.howTo && pageData.howTo.length > 0) {
      schemas.push(this.generateHowToSchema(
        pageData.title,
        pageData.description,
        pageData.howTo,
        finalConfig
      ));
    }

    // Travel schema if travel info is provided
    if (pageData.travel) {
      schemas.push(this.generateTravelSchema(
        pageData.travel.from,
        pageData.travel.to,
        pageData.travel.fromCountry,
        pageData.travel.toCountry,
        undefined,
        finalConfig
      ));
    }

    return schemas;
  }

  /**
   * Generate speakable schema for voice assistants
   */
  private generateSpeakableSchema(selectors: string[]): SpeakableSchema {
    return {
      '@type': 'SpeakableSpecification',
      cssSelector: selectors,
      xpath: selectors.map(selector => this.cssToXPath(selector))
    };
  }

  /**
   * Convert CSS selector to XPath (basic conversion)
   */
  private cssToXPath(cssSelector: string): string {
    // Basic CSS to XPath conversion
    let xpath = cssSelector;
    
    // Handle class selectors
    xpath = xpath.replace(/\.([a-zA-Z0-9_-]+)/g, '[contains(@class,"$1")]');
    
    // Handle ID selectors
    xpath = xpath.replace(/#([a-zA-Z0-9_-]+)/g, '[@id="$1"]');
    
    // Handle element selectors
    if (!xpath.startsWith('[') && !xpath.startsWith('/')) {
      xpath = `//${xpath}`;
    }
    
    return xpath;
  }

  /**
   * Optimize answer text for voice reading
   */
  private optimizeAnswerForVoice(text: string, language: string): string {
    let optimized = text;
    
    // Add pauses for better voice flow
    optimized = optimized.replace(/\./g, '. ');
    optimized = optimized.replace(/,/g, ', ');
    optimized = optimized.replace(/:/g, ': ');
    
    // Remove excessive markup
    optimized = optimized.replace(/<[^>]*>/g, '');
    
    // Add pronunciation guides for common abbreviations
    const pronunciationGuides: Record<string, string> = {
      'EUA': 'Estados Unidos',
      'RJ': 'Rio de Janeiro',
      'SP': 'São Paulo',
      'BH': 'Belo Horizonte',
      'BR': 'Brasil',
      'NYC': 'Nova York',
      'LA': 'Los Angeles',
      'CEO': 'Diretor Executivo'
    };
    
    Object.entries(pronunciationGuides).forEach(([abbrev, full]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'g');
      optimized = optimized.replace(regex, full);
    });
    
    return optimized.trim();
  }

  /**
   * Estimate total time for HowTo steps
   */
  private estimateTotalTime(stepCount: number): string {
    const minutesPerStep = 5;
    const totalMinutes = stepCount * minutesPerStep;
    
    if (totalMinutes < 60) {
      return `PT${totalMinutes}M`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `PT${hours}H${minutes}M`;
    }
  }

  /**
   * Generate supply list from description
   */
  private generateSupplyList(description: string): string[] {
    const supplies: string[] = [];
    
    // Common travel supplies
    const travelSupplies = [
      'passaporte', 'documento', 'visto', 'cartão de crédito', 
      'dinheiro', 'seguro viagem', 'mala', 'celular'
    ];
    
    travelSupplies.forEach(supply => {
      if (description.toLowerCase().includes(supply)) {
        supplies.push(supply.charAt(0).toUpperCase() + supply.slice(1));
      }
    });
    
    return supplies;
  }

  /**
   * Generate JSON-LD string for embedding in HTML
   */
  public generateJSONLD(schema: VoiceSearchSchema | VoiceSearchSchema[]): string {
    const schemaArray = Array.isArray(schema) ? schema : [schema];
    
    return `<script type="application/ld+json">
${JSON.stringify(schemaArray.length === 1 ? schemaArray[0] : schemaArray, null, 2)}
</script>`;
  }

  /**
   * Validate schema for voice search optimization
   */
  public validateVoiceSchema(schema: VoiceSearchSchema): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check required fields
    if (!schema['@context']) errors.push('Missing @context');
    if (!schema['@type']) errors.push('Missing @type');
    if (!schema.inLanguage) warnings.push('Missing inLanguage property');

    // Check speakable schema
    if (!schema.speakable) {
      warnings.push('Missing speakable schema - recommended for voice search');
    }

    // Check content optimization
    if (schema['@type'] === 'FAQPage') {
      if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
        errors.push('FAQ page must have mainEntity array');
      } else {
        schema.mainEntity.forEach((entity: any, index: number) => {
          if (!entity.acceptedAnswer?.text) {
            errors.push(`FAQ item ${index + 1} missing answer text`);
          } else if (entity.acceptedAnswer.text.length > 300) {
            suggestions.push(`FAQ answer ${index + 1} is long - consider shortening for voice`);
          }
        });
      }
    }

    // Check language optimization
    if (schema.inLanguage === 'pt-BR') {
      suggestions.push('Consider adding regional Portuguese variations');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

export default VoiceSearchSchemaGenerator;