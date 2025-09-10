/**
 * BRAZILIAN CULTURAL TOURISM SEO OPTIMIZATION SYSTEM
 * Advanced SEO strategy targeting cultural tourism and diaspora travel patterns
 * Optimized for seasonal cultural events and authentic cultural content
 */

import { BrazilianCulturalEvent, brazilianCulturalCalendar } from '@/lib/data/brazilian-cultural-calendar';
import { BrazilianCity, brazilianDiaspora } from '@/lib/data/brazilian-diaspora';

export interface CulturalSEOStrategy {
  id: string;
  primaryKeywords: {
    portuguese: string[];
    english: string[];
    spanish: string[];
  };
  secondaryKeywords: {
    portuguese: string[];
    english: string[];
    spanish: string[];
  };
  longtailKeywords: {
    portuguese: string[];
    english: string[];
    spanish: string[];
  };
  contentTopics: {
    coreTopics: string[];
    seasonalTopics: string[];
    culturalTopics: string[];
    diasporaTopics: string[];
  };
  targetAudience: {
    primary: string[];
    secondary: string[];
    diaspora: string[];
  };
  searchIntent: {
    informational: string[];
    transactional: string[];
    navigational: string[];
    commercial: string[];
  };
  seasonality: {
    peakMonths: number[];
    demandMultiplier: number;
    contentSchedule: { month: number; topics: string[] }[];
  };
  competitionAnalysis: {
    level: 'low' | 'medium' | 'high' | 'ultra-high';
    mainCompetitors: string[];
    opportunities: string[];
  };
  contentStrategy: {
    pillarPages: string[];
    clusterPages: string[];
    landingPages: string[];
    blogTopics: string[];
  };
}

class CulturalTourismSEO {

  generateEventSEOStrategy(event: BrazilianCulturalEvent): CulturalSEOStrategy {
    return {
      id: `cultural-seo-${event.id}`,
      primaryKeywords: this.generateEventKeywords(event, 'primary'),
      secondaryKeywords: this.generateEventKeywords(event, 'secondary'),
      longtailKeywords: this.generateEventKeywords(event, 'longtail'),
      contentTopics: this.generateEventContentTopics(event),
      targetAudience: this.generateEventTargetAudience(event),
      searchIntent: this.generateEventSearchIntent(event),
      seasonality: this.generateEventSeasonality(event),
      competitionAnalysis: this.generateEventCompetitionAnalysis(event),
      contentStrategy: this.generateEventContentStrategy(event)
    };
  }

  generateDiasporaSEOStrategy(city: BrazilianCity, event?: BrazilianCulturalEvent): CulturalSEOStrategy {
    return {
      id: `diaspora-cultural-seo-${city.id}${event ? '-' + event.id : ''}`,
      primaryKeywords: this.generateDiasporaKeywords(city, 'primary', event),
      secondaryKeywords: this.generateDiasporaKeywords(city, 'secondary', event),
      longtailKeywords: this.generateDiasporaKeywords(city, 'longtail', event),
      contentTopics: this.generateDiasporaContentTopics(city, event),
      targetAudience: this.generateDiasporaTargetAudience(city, event),
      searchIntent: this.generateDiasporaSearchIntent(city, event),
      seasonality: this.generateDiasporaSeasonality(city, event),
      competitionAnalysis: this.generateDiasporaCompetitionAnalysis(city),
      contentStrategy: this.generateDiasporaContentStrategy(city, event)
    };
  }

  private generateEventKeywords(event: BrazilianCulturalEvent, type: 'primary' | 'secondary' | 'longtail') {
    const eventName = event.name.pt.toLowerCase();
    const eventNameEn = event.name.en.toLowerCase();
    const eventNameEs = event.name.es.toLowerCase();

    const keywordSets = {
      primary: {
        portuguese: [
          `${eventName} brasil`,
          `viagem ${eventName}`,
          `turismo ${eventName}`,
          `quando é ${eventName}`,
          `${eventName} 2025`,
          `festival ${eventName}`,
          `celebração ${eventName}`,
          `tradição brasileira ${eventName}`
        ],
        english: [
          `${eventNameEn} brazil`,
          `${eventNameEn} travel`,
          `${eventNameEn} tourism`,
          `when is ${eventNameEn}`,
          `${eventNameEn} 2025`,
          `brazil ${eventNameEn} festival`,
          `brazilian ${eventNameEn}`,
          `cultural tourism brazil ${eventNameEn}`
        ],
        spanish: [
          `${eventNameEs} brasil`,
          `viaje ${eventNameEs}`,
          `turismo ${eventNameEs}`,
          `cuándo es ${eventNameEs}`,
          `${eventNameEs} 2025`,
          `festival ${eventNameEs} brasil`
        ]
      },
      secondary: {
        portuguese: [
          `passagens ${eventName}`,
          `hotéis ${eventName}`,
          `pacotes ${eventName}`,
          `cultura brasileira ${eventName}`,
          `tradições ${eventName}`,
          `história ${eventName}`,
          `origem ${eventName}`,
          `significado ${eventName}`,
          `como participar ${eventName}`,
          `onde acontece ${eventName}`
        ],
        english: [
          `${eventNameEn} flights`,
          `${eventNameEn} hotels`,
          `${eventNameEn} packages`,
          `brazilian culture ${eventNameEn}`,
          `${eventNameEn} traditions`,
          `${eventNameEn} history`,
          `${eventNameEn} meaning`,
          `how to attend ${eventNameEn}`,
          `where is ${eventNameEn}`
        ],
        spanish: [
          `vuelos ${eventNameEs}`,
          `hoteles ${eventNameEs}`,
          `paquetes ${eventNameEs}`,
          `cultura brasileña ${eventNameEs}`,
          `tradiciones ${eventNameEs}`,
          `historia ${eventNameEs}`,
          `significado ${eventNameEs}`
        ]
      },
      longtail: {
        portuguese: [
          `melhor época para visitar brasil durante ${eventName}`,
          `como brasileiros no exterior celebram ${eventName}`,
          `guia completo ${eventName} para turistas`,
          `diferenças culturais ${eventName} brasil vs exterior`,
          `impacto econômico ${eventName} turismo brasileiro`,
          `tradições familiares ${eventName} comunidades brasileiras`,
          `como planejar viagem brasil ${eventName} com família`,
          `significado cultural ${eventName} para brasileiros emigrantes`
        ],
        english: [
          `best time to visit brazil during ${eventNameEn}`,
          `how brazilians abroad celebrate ${eventNameEn}`,
          `complete guide to ${eventNameEn} for tourists`,
          `cultural differences ${eventNameEn} brazil vs abroad`,
          `economic impact of ${eventNameEn} on brazilian tourism`,
          `family traditions ${eventNameEn} brazilian communities`,
          `how to plan brazil trip during ${eventNameEn} with family`,
          `cultural significance of ${eventNameEn} for brazilian emigrants`
        ],
        spanish: [
          `mejor época para visitar brasil durante ${eventNameEs}`,
          `cómo brasileños en el exterior celebran ${eventNameEs}`,
          `guía completa ${eventNameEs} para turistas`,
          `diferencias culturales ${eventNameEs} brasil vs exterior`,
          `impacto económico ${eventNameEs} turismo brasileño`
        ]
      }
    };

    return keywordSets[type];
  }

  private generateEventContentTopics(event: BrazilianCulturalEvent) {
    return {
      coreTopics: [
        `História e origem do ${event.name.pt}`,
        `Como celebrar ${event.name.pt} no Brasil`,
        `Melhores destinos para ${event.name.pt}`,
        `Tradições regionais do ${event.name.pt}`,
        `Impacto cultural do ${event.name.pt}`
      ],
      seasonalTopics: [
        `${event.name.pt} 2025: Datas e programação`,
        `Preparativos para ${event.name.pt}`,
        `Clima durante ${event.name.pt} no Brasil`,
        `Preços de viagem durante ${event.name.pt}`,
        `Reservas antecipadas para ${event.name.pt}`
      ],
      culturalTopics: [
        `Significado religioso do ${event.name.pt}`,
        `Variações regionais do ${event.name.pt}`,
        `Música e dança do ${event.name.pt}`,
        `Culinária típica do ${event.name.pt}`,
        `Vestimentas tradicionais do ${event.name.pt}`
      ],
      diasporaTopics: [
        `Como brasileiros no exterior mantêm tradições do ${event.name.pt}`,
        `Comunidades brasileiras celebrando ${event.name.pt} mundialmente`,
        `Saudade e conexão cultural durante ${event.name.pt}`,
        `Planejando retorno ao Brasil para ${event.name.pt}`,
        `Ensinando ${event.name.pt} para segunda geração`
      ]
    };
  }

  private generateEventTargetAudience(event: BrazilianCulturalEvent) {
    return {
      primary: event.marketingOpportunities.targetAudience,
      secondary: [
        'Cultural enthusiasts',
        'Brazil travel planners',
        'Cultural researchers',
        'Event photographers',
        'Travel bloggers'
      ],
      diaspora: [
        'First-generation Brazilians abroad',
        'Second-generation Brazilian-Americans',
        'Brazilian cultural organizations',
        'Community leaders',
        'Cultural preservationists'
      ]
    };
  }

  private generateEventSearchIntent(event: BrazilianCulturalEvent) {
    return {
      informational: [
        `what is ${event.name.en}`,
        `${event.name.en} meaning`,
        `${event.name.en} history`,
        `how to celebrate ${event.name.en}`,
        `${event.name.en} traditions`,
        `${event.name.en} cultural significance`
      ],
      transactional: [
        `${event.name.en} flights`,
        `${event.name.en} hotels`,
        `${event.name.en} tour packages`,
        `buy ${event.name.en} tickets`,
        `book ${event.name.en} trip`
      ],
      navigational: [
        `${event.name.en} official website`,
        `${event.name.en} schedule 2025`,
        `${event.name.en} locations`,
        `${event.name.en} events calendar`
      ],
      commercial: [
        `best ${event.name.en} deals`,
        `${event.name.en} travel packages`,
        `cheap ${event.name.en} flights`,
        `${event.name.en} hotel discounts`,
        `compare ${event.name.en} tours`
      ]
    };
  }

  private generateEventSeasonality(event: BrazilianCulturalEvent) {
    const peakMonths = event.date.duration 
      ? Array.from({ length: event.date.duration / 30 }, (_, i) => 
          ((event.date.month - 1 + i) % 12) + 1)
      : [event.date.month];

    const contentSchedule = peakMonths.map(month => ({
      month,
      topics: [
        `${event.name.pt} em ${month === 1 ? 'janeiro' : month === 2 ? 'fevereiro' : month === 3 ? 'março' : month === 4 ? 'abril' : month === 5 ? 'maio' : month === 6 ? 'junho' : month === 7 ? 'julho' : month === 8 ? 'agosto' : month === 9 ? 'setembro' : month === 10 ? 'outubro' : month === 11 ? 'novembro' : 'dezembro'}`,
        `Preparação para ${event.name.pt}`,
        `Guia de viagem ${event.name.pt}`,
        `Ofertas especiais ${event.name.pt}`
      ]
    }));

    return {
      peakMonths,
      demandMultiplier: event.travelImpact.demandIncrease / 100 + 1,
      contentSchedule
    };
  }

  private generateEventCompetitionAnalysis(event: BrazilianCulturalEvent) {
    // Determine competition level based on event popularity and travel impact
    let competitionLevel: 'low' | 'medium' | 'high' | 'ultra-high';
    
    if (event.travelImpact.level === 'high' && event.travelImpact.demandIncrease > 80) {
      competitionLevel = 'ultra-high';
    } else if (event.travelImpact.level === 'high') {
      competitionLevel = 'high';
    } else if (event.travelImpact.level === 'medium') {
      competitionLevel = 'medium';
    } else {
      competitionLevel = 'low';
    }

    return {
      level: competitionLevel,
      mainCompetitors: [
        'Expedia Brasil',
        'Booking.com',
        'LATAM Travel',
        'CVC Viagens',
        'Decolar.com',
        'Brazilian tourism boards',
        'Local event organizers'
      ],
      opportunities: [
        'Hyperlocal cultural content',
        'Multilingual diaspora targeting',
        'Family-focused travel packages',
        'Cultural authenticity positioning',
        'Community engagement content',
        'Traditional vs modern celebrations',
        'Regional variations coverage'
      ]
    };
  }

  private generateEventContentStrategy(event: BrazilianCulturalEvent) {
    const eventName = event.name.pt;
    
    return {
      pillarPages: [
        `Guia Completo: ${eventName}`,
        `${eventName}: Tradição e Modernidade`,
        `Viagem Cultural: ${eventName} no Brasil`,
        `${eventName} para Brasileiros no Exterior`
      ],
      clusterPages: [
        `História do ${eventName}`,
        `Onde celebrar ${eventName}`,
        `Comidas típicas do ${eventName}`,
        `Música e dança do ${eventName}`,
        `Roupas tradicionais do ${eventName}`,
        `${eventName} em diferentes regiões`,
        `Como explicar ${eventName} para crianças`,
        `${eventName}: então e agora`
      ],
      landingPages: [
        `Pacotes de Viagem ${eventName}`,
        `Voos para ${eventName}`,
        `Hotéis durante ${eventName}`,
        `Tours culturais ${eventName}`,
        `Experiências autênticas ${eventName}`
      ],
      blogTopics: [
        `10 curiosidades sobre ${eventName}`,
        `Minha primeira vez no ${eventName}`,
        `${eventName}: o que não fazer`,
        `Orçamento para ${eventName}`,
        `${eventName} com crianças`,
        `Fotografia no ${eventName}`,
        `${eventName} sustentável`,
        `Receitas tradicionais do ${eventName}`
      ]
    };
  }

  private generateDiasporaKeywords(city: BrazilianCity, type: 'primary' | 'secondary' | 'longtail', event?: BrazilianCulturalEvent) {
    const cityName = city.name.toLowerCase();
    const eventName = event ? event.name.pt.toLowerCase() : '';

    const baseKeywords = {
      primary: {
        portuguese: [
          `brasileiros ${cityName}`,
          `comunidade brasileira ${cityName}`,
          `cultura brasileira ${cityName}`,
          `tradições brasileiras ${cityName}`,
          `eventos brasileiros ${cityName}`
        ],
        english: [
          `brazilian community ${cityName}`,
          `brazilian culture ${cityName}`,
          `brazilian traditions ${cityName}`,
          `brazilian events ${cityName}`,
          `brazilians in ${cityName}`
        ],
        spanish: [
          `comunidad brasileña ${cityName}`,
          `cultura brasileña ${cityName}`,
          `brasileños en ${cityName}`
        ]
      }
    };

    if (event) {
      baseKeywords.primary.portuguese.push(
        `${eventName} ${cityName}`,
        `celebrar ${eventName} ${cityName}`,
        `comunidade brasileira ${eventName} ${cityName}`
      );
      baseKeywords.primary.english.push(
        `${event.name.en.toLowerCase()} ${cityName}`,
        `celebrate ${event.name.en.toLowerCase()} ${cityName}`,
        `brazilian ${event.name.en.toLowerCase()} ${cityName}`
      );
    }

    // Generate secondary and longtail based on type
    return this.expandKeywordSet(baseKeywords.primary, type, city, event);
  }

  private expandKeywordSet(baseKeywords: any, type: string, city: BrazilianCity, event?: BrazilianCulturalEvent) {
    if (type === 'primary') return baseKeywords;
    
    const expanded = { ...baseKeywords };
    
    if (type === 'secondary') {
      expanded.portuguese.push(
        `igreja brasileira ${city.name}`,
        `restaurantes brasileiros ${city.name}`,
        `escola brasileira ${city.name}`,
        `negócios brasileiros ${city.name}`
      );
      expanded.english.push(
        `brazilian church ${city.name}`,
        `brazilian restaurants ${city.name}`,
        `brazilian school ${city.name}`,
        `brazilian businesses ${city.name}`
      );
    } else if (type === 'longtail') {
      expanded.portuguese.push(
        `como manter tradições brasileiras em ${city.name}`,
        `onde encontrar produtos brasileiros ${city.name}`,
        `comunidade brasileira ativa ${city.name}`,
        `eventos culturais brasileiros ${city.name} 2025`
      );
      expanded.english.push(
        `how to maintain brazilian traditions in ${city.name}`,
        `where to find brazilian products ${city.name}`,
        `active brazilian community ${city.name}`,
        `brazilian cultural events ${city.name} 2025`
      );
    }

    return expanded;
  }

  private generateDiasporaContentTopics(city: BrazilianCity, event?: BrazilianCulturalEvent) {
    const topics = {
      coreTopics: [
        `Comunidade brasileira em ${city.name}`,
        `História dos brasileiros em ${city.name}`,
        `Infraestrutura brasileira em ${city.name}`,
        `Vida cultural brasileira ${city.name}`,
        `Integração e preservação cultural ${city.name}`
      ],
      seasonalTopics: [
        `Eventos brasileiros sazonais em ${city.name}`,
        `Celebrações anuais da comunidade ${city.name}`,
        `Calendário cultural brasileiro ${city.name}`,
        `Festivais brasileiros ${city.name} 2025`
      ],
      culturalTopics: [
        `Tradições mantidas em ${city.name}`,
        `Culinária brasileira em ${city.name}`,
        `Música brasileira em ${city.name}`,
        `Arte brasileira em ${city.name}`,
        `Literatura brasileira em ${city.name}`
      ],
      diasporaTopics: [
        `Primeira geração brasileira ${city.name}`,
        `Segunda geração brasileira ${city.name}`,
        `Identidade cultural ${city.name}`,
        `Saudade e conexão com Brasil ${city.name}`,
        `Visitas familiares Brasil-${city.name}`
      ]
    };

    if (event) {
      topics.seasonalTopics.push(`${event.name.pt} em ${city.name}`);
      topics.culturalTopics.push(`Como celebrar ${event.name.pt} em ${city.name}`);
      topics.diasporaTopics.push(`Mantendo tradição ${event.name.pt} em ${city.name}`);
    }

    return topics;
  }

  private generateDiasporaTargetAudience(city: BrazilianCity, event?: BrazilianCulturalEvent) {
    return {
      primary: [
        'Brazilian expatriates',
        'Brazilian immigrants',
        'Brazilian-American families',
        'Portuguese speakers',
        'Cultural community members'
      ],
      secondary: [
        'Second-generation Brazilians',
        'Mixed Brazilian families',
        'Cultural researchers',
        'Community organizers',
        'Local event planners'
      ],
      diaspora: [
        `Brazilians in ${city.name}`,
        `${city.name} Brazilian community leaders`,
        `Portuguese-speaking residents ${city.name}`,
        `Cultural organizations ${city.name}`,
        `Brazilian business owners ${city.name}`
      ]
    };
  }

  private generateDiasporaSearchIntent(city: BrazilianCity, event?: BrazilianCulturalEvent) {
    const baseIntent = {
      informational: [
        `brazilian community ${city.name}`,
        `brazilian culture ${city.name}`,
        `brazilian population ${city.name}`,
        `brazilian history ${city.name}`,
        `brazilian traditions ${city.name}`
      ],
      transactional: [
        `brazilian services ${city.name}`,
        `brazilian products ${city.name}`,
        `brazilian classes ${city.name}`,
        `brazilian events tickets ${city.name}`
      ],
      navigational: [
        `brazilian church ${city.name}`,
        `brazilian restaurant ${city.name}`,
        `brazilian school ${city.name}`,
        `brazilian consulate ${city.name}`
      ],
      commercial: [
        `brazilian business directory ${city.name}`,
        `brazilian services ${city.name}`,
        `brazilian community groups ${city.name}`
      ]
    };

    if (event) {
      baseIntent.informational.push(`${event.name.en} ${city.name}`);
      baseIntent.transactional.push(`${event.name.en} celebration ${city.name}`);
      baseIntent.navigational.push(`${event.name.en} events ${city.name}`);
    }

    return baseIntent;
  }

  private generateDiasporaSeasonality(city: BrazilianCity, event?: BrazilianCulturalEvent) {
    const basePeakMonths = [12, 1, 6, 7]; // Christmas/New Year, Winter vacation
    const eventMonths = event ? [event.date.month] : [];
    const peakMonths = [...new Set([...basePeakMonths, ...eventMonths])];

    return {
      peakMonths,
      demandMultiplier: event ? event.travelImpact.demandIncrease / 100 + 1 : 1.2,
      contentSchedule: peakMonths.map(month => ({
        month,
        topics: [
          `Eventos brasileiros ${city.name} mês ${month}`,
          `Comunidade brasileira ${city.name} ativa`,
          `Tradições mantidas em ${city.name}`,
          event ? `${event.name.pt} em ${city.name}` : `Cultura brasileira ${city.name}`
        ]
      }))
    };
  }

  private generateDiasporaCompetitionAnalysis(city: BrazilianCity) {
    return {
      level: city.competition.level,
      mainCompetitors: [
        ...city.competition.mainCompetitors,
        'Local Brazilian businesses',
        'Community organizations',
        'Cultural centers',
        'Brazilian media outlets'
      ],
      opportunities: [
        'Hyperlocal community content',
        'Cultural preservation focus',
        'Second-generation targeting',
        'Community event coverage',
        'Local business partnerships',
        'Cultural authenticity',
        'Family connection stories'
      ]
    };
  }

  private generateDiasporaContentStrategy(city: BrazilianCity, event?: BrazilianCulturalEvent) {
    const baseStrategy = {
      pillarPages: [
        `Guia da Comunidade Brasileira em ${city.name}`,
        `Cultura Brasileira em ${city.name}`,
        `Vida Brasileira em ${city.name}`,
        `Tradições Brasileiras Mantidas em ${city.name}`
      ],
      clusterPages: [
        `História brasileira ${city.name}`,
        `Igrejas brasileiras ${city.name}`,
        `Restaurantes brasileiros ${city.name}`,
        `Escolas brasileiras ${city.name}`,
        `Negócios brasileiros ${city.name}`,
        `Eventos comunitários ${city.name}`,
        `Demografia brasileira ${city.name}`,
        `Serviços para brasileiros ${city.name}`
      ],
      landingPages: [
        `Serviços para brasileiros ${city.name}`,
        `Comunidade brasileira ${city.name}`,
        `Cultura brasileira ${city.name}`,
        `Eventos brasileiros ${city.name}`
      ],
      blogTopics: [
        `Vivendo como brasileiro em ${city.name}`,
        `Mantendo tradições em ${city.name}`,
        `Criando filhos brasileiros em ${city.name}`,
        `Saudade e conexão cultural ${city.name}`,
        `Sucesso da comunidade brasileira ${city.name}`,
        `Integração cultural ${city.name}`,
        `Culinária brasileira autêntica ${city.name}`,
        `Organizações brasileiras ${city.name}`
      ]
    };

    if (event) {
      baseStrategy.pillarPages.push(`${event.name.pt} em ${city.name}`);
      baseStrategy.clusterPages.push(`Celebrações ${event.name.pt} ${city.name}`);
      baseStrategy.blogTopics.push(`Como celebramos ${event.name.pt} em ${city.name}`);
    }

    return baseStrategy;
  }

  // Master SEO strategy generator combining all elements
  generateComprehensiveCulturalSEO(): {
    eventStrategies: CulturalSEOStrategy[];
    diasporaStrategies: CulturalSEOStrategy[];
    combinedStrategies: CulturalSEOStrategy[];
    masterKeywordList: { portuguese: string[]; english: string[]; spanish: string[] };
    contentCalendar: { month: number; events: string[]; diaspora: string[]; content: string[] }[];
    competitionMap: { level: string; keywords: string[]; opportunities: string[] }[];
  } {
    // Generate strategies for all cultural events
    const eventStrategies = brazilianCulturalCalendar.map(event => 
      this.generateEventSEOStrategy(event)
    );

    // Generate strategies for top diaspora cities
    const topDiasporaCities = brazilianDiaspora.filter(city => 
      city.priority === 'ultra-high' || city.priority === 'high'
    );
    
    const diasporaStrategies = topDiasporaCities.map(city => 
      this.generateDiasporaSEOStrategy(city)
    );

    // Generate combined strategies (events + diaspora)
    const combinedStrategies: CulturalSEOStrategy[] = [];
    const highImpactEvents = brazilianCulturalCalendar.filter(event => 
      event.travelImpact.level === 'high' && event.communityEngagement.diasporaEvents
    );

    for (const city of topDiasporaCities) {
      for (const event of highImpactEvents) {
        combinedStrategies.push(this.generateDiasporaSEOStrategy(city, event));
      }
    }

    // Create master keyword list
    const masterKeywordList = this.createMasterKeywordList([
      ...eventStrategies,
      ...diasporaStrategies,
      ...combinedStrategies
    ]);

    // Generate content calendar
    const contentCalendar = this.generateContentCalendar(eventStrategies, diasporaStrategies);

    // Create competition map
    const competitionMap = this.createCompetitionMap([
      ...eventStrategies,
      ...diasporaStrategies,
      ...combinedStrategies
    ]);

    return {
      eventStrategies,
      diasporaStrategies,
      combinedStrategies,
      masterKeywordList,
      contentCalendar,
      competitionMap
    };
  }

  private createMasterKeywordList(strategies: CulturalSEOStrategy[]) {
    const masterList = {
      portuguese: new Set<string>(),
      english: new Set<string>(),
      spanish: new Set<string>()
    };

    for (const strategy of strategies) {
      // Add primary keywords
      strategy.primaryKeywords.portuguese.forEach(kw => masterList.portuguese.add(kw));
      strategy.primaryKeywords.english.forEach(kw => masterList.english.add(kw));
      strategy.primaryKeywords.spanish.forEach(kw => masterList.spanish.add(kw));

      // Add secondary keywords
      strategy.secondaryKeywords.portuguese.forEach(kw => masterList.portuguese.add(kw));
      strategy.secondaryKeywords.english.forEach(kw => masterList.english.add(kw));
      strategy.secondaryKeywords.spanish.forEach(kw => masterList.spanish.add(kw));

      // Add longtail keywords (top 10 per strategy to avoid overwhelming)
      strategy.longtailKeywords.portuguese.slice(0, 10).forEach(kw => masterList.portuguese.add(kw));
      strategy.longtailKeywords.english.slice(0, 10).forEach(kw => masterList.english.add(kw));
      strategy.longtailKeywords.spanish.slice(0, 10).forEach(kw => masterList.spanish.add(kw));
    }

    return {
      portuguese: Array.from(masterList.portuguese),
      english: Array.from(masterList.english),
      spanish: Array.from(masterList.spanish)
    };
  }

  private generateContentCalendar(eventStrategies: CulturalSEOStrategy[], diasporaStrategies: CulturalSEOStrategy[]) {
    const calendar = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      events: [] as string[],
      diaspora: [] as string[],
      content: [] as string[]
    }));

    // Add event-based content
    for (const strategy of eventStrategies) {
      for (const monthData of strategy.seasonality.contentSchedule) {
        const monthIndex = monthData.month - 1;
        calendar[monthIndex].events.push(...monthData.topics);
        calendar[monthIndex].content.push(...strategy.contentStrategy.blogTopics.slice(0, 2));
      }
    }

    // Add diaspora-based content
    for (const strategy of diasporaStrategies) {
      for (const monthData of strategy.seasonality.contentSchedule) {
        const monthIndex = monthData.month - 1;
        calendar[monthIndex].diaspora.push(...monthData.topics);
        calendar[monthIndex].content.push(...strategy.contentStrategy.blogTopics.slice(0, 1));
      }
    }

    return calendar;
  }

  private createCompetitionMap(strategies: CulturalSEOStrategy[]) {
    const competitionLevels = ['low', 'medium', 'high', 'ultra-high'];
    
    return competitionLevels.map(level => {
      const relevantStrategies = strategies.filter(s => s.competitionAnalysis.level === level);
      
      const keywords = new Set<string>();
      const opportunities = new Set<string>();

      for (const strategy of relevantStrategies) {
        // Add primary keywords as high-competition indicators
        strategy.primaryKeywords.portuguese.slice(0, 5).forEach(kw => keywords.add(kw));
        strategy.primaryKeywords.english.slice(0, 5).forEach(kw => keywords.add(kw));
        
        // Add opportunities
        strategy.competitionAnalysis.opportunities.forEach(opp => opportunities.add(opp));
      }

      return {
        level,
        keywords: Array.from(keywords),
        opportunities: Array.from(opportunities)
      };
    });
  }
}

export default new CulturalTourismSEO();