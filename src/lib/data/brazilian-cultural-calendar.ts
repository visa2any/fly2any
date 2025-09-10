/**
 * ULTRATHINK BRAZILIAN CULTURAL CALENDAR
 * Strategic timing for community engagement and travel patterns
 * Service Area Business community connection optimization
 */

export interface BrazilianCulturalEvent {
  id: string;
  name: {
    pt: string;
    en: string;
    es: string;
  };
  date: {
    month: number;
    day?: number;
    duration?: number; // days
    type: 'fixed' | 'variable' | 'period';
  };
  category: 'national' | 'religious' | 'cultural' | 'family' | 'business';
  travelImpact: {
    level: 'high' | 'medium' | 'low';
    direction: 'to-brazil' | 'from-brazil' | 'both';
    priceImpact: 'increase' | 'decrease' | 'neutral';
    demandIncrease: number; // percentage
  };
  communityEngagement: {
    diasporaEvents: boolean;
    communityGatherings: boolean;
    mediaAttention: boolean;
  };
  marketingOpportunities: {
    contentThemes: string[];
    promotionalPeriod: {
      start: number; // days before
      end: number; // days after
    };
    targetAudience: string[];
  };
  description: {
    pt: string;
    en: string;
    es: string;
  };
}

export const brazilianCulturalCalendar: BrazilianCulturalEvent[] = [
  // JANUARY
  {
    id: 'new-year-brazil',
    name: {
      pt: 'Ano Novo no Brasil',
      en: 'New Year in Brazil',
      es: 'Año Nuevo en Brasil'
    },
    date: { month: 1, day: 1, type: 'fixed' },
    category: 'national',
    travelImpact: {
      level: 'high',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 85
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: true
    },
    marketingOpportunities: {
      contentThemes: ['Family reunions', 'Copacabana celebration', 'Summer vacation'],
      promotionalPeriod: { start: 45, end: 7 },
      targetAudience: ['Families', 'Young professionals', 'Party travelers']
    },
    description: {
      pt: 'Maior celebração do ano no Brasil. Período de alta demanda para viagens familiares e celebrações na praia.',
      en: 'Biggest celebration of the year in Brazil. High-demand period for family travel and beach celebrations.',
      es: 'Mayor celebración del año en Brasil. Período de alta demanda para viajes familiares y celebraciones en la playa.'
    }
  },

  // FEBRUARY
  {
    id: 'carnaval-brazil',
    name: {
      pt: 'Carnaval',
      en: 'Carnival',
      es: 'Carnaval'
    },
    date: { month: 2, duration: 7, type: 'variable' },
    category: 'cultural',
    travelImpact: {
      level: 'high',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 120
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: true
    },
    marketingOpportunities: {
      contentThemes: ['Rio Carnival', 'Salvador Carnival', 'Cultural experience', 'Samba schools'],
      promotionalPeriod: { start: 60, end: 14 },
      targetAudience: ['Cultural enthusiasts', 'Party travelers', 'First-time Brazil visitors']
    },
    description: {
      pt: 'O maior festival cultural do Brasil. Pico absoluto de demanda turística internacional.',
      en: 'Brazil\'s biggest cultural festival. Absolute peak of international tourism demand.',
      es: 'El mayor festival cultural de Brasil. Pico absoluto de demanda turística internacional.'
    }
  },

  // APRIL
  {
    id: 'easter-brazil',
    name: {
      pt: 'Páscoa',
      en: 'Easter',
      es: 'Pascua'
    },
    date: { month: 4, type: 'variable' },
    category: 'religious',
    travelImpact: {
      level: 'medium',
      direction: 'both',
      priceImpact: 'increase',
      demandIncrease: 45
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Family gatherings', 'Religious tourism', 'Easter traditions', 'Chocolate Easter eggs'],
      promotionalPeriod: { start: 30, end: 7 },
      targetAudience: ['Religious families', 'Multi-generational travelers']
    },
    description: {
      pt: 'Importante feriado religioso com forte tradição familiar. Muitas viagens internas e de retorno.',
      en: 'Important religious holiday with strong family tradition. Many domestic and return trips.',
      es: 'Importante feriado religioso con fuerte tradición familiar. Muchos viajes internos y de regreso.'
    }
  },

  // JUNE
  {
    id: 'festa-junina',
    name: {
      pt: 'Festas Juninas',
      en: 'June Festivals',
      es: 'Fiestas de Junio'
    },
    date: { month: 6, duration: 30, type: 'period' },
    category: 'cultural',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'neutral',
      demandIncrease: 35
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Rural culture', 'Traditional festivals', 'Regional cuisine', 'Folk music'],
      promotionalPeriod: { start: 20, end: 10 },
      targetAudience: ['Cultural travelers', 'Rural tourism enthusiasts']
    },
    description: {
      pt: 'Celebrações rurais tradicionais com forte apelo cultural. Ótimo período para turismo regional.',
      en: 'Traditional rural celebrations with strong cultural appeal. Great period for regional tourism.',
      es: 'Celebraciones rurales tradicionales con fuerte atractivo cultural. Gran período para turismo regional.'
    }
  },

  // JULY
  {
    id: 'winter-vacation-brazil',
    name: {
      pt: 'Férias de Inverno',
      en: 'Winter Vacation',
      es: 'Vacaciones de Invierno'
    },
    date: { month: 7, duration: 30, type: 'period' },
    category: 'family',
    travelImpact: {
      level: 'high',
      direction: 'both',
      priceImpact: 'increase',
      demandIncrease: 75
    },
    communityEngagement: {
      diasporaEvents: false,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Family vacations', 'Winter in Brazil', 'School holidays', 'Multi-generational travel'],
      promotionalPeriod: { start: 45, end: 7 },
      targetAudience: ['Families with children', 'Grandparents visiting', 'School-age families']
    },
    description: {
      pt: 'Férias escolares de inverno. Alto fluxo de familiares visitando e viagens de retorno.',
      en: 'Winter school holidays. High flow of family visits and return trips.',
      es: 'Vacaciones escolares de invierno. Alto flujo de visitas familiares y viajes de regreso.'
    }
  },

  // SEPTEMBER
  {
    id: 'independence-day-brazil',
    name: {
      pt: 'Independência do Brasil',
      en: 'Brazil Independence Day',
      es: 'Día de la Independencia de Brasil'
    },
    date: { month: 9, day: 7, type: 'fixed' },
    category: 'national',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'neutral',
      demandIncrease: 25
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: true
    },
    marketingOpportunities: {
      contentThemes: ['National pride', 'Patriotic celebrations', 'Cultural identity', 'Community events'],
      promotionalPeriod: { start: 15, end: 5 },
      targetAudience: ['Patriotic travelers', 'Community leaders', 'Cultural organizations']
    },
    description: {
      pt: 'Dia da Independência com eventos comunitários na diáspora. Oportunidade de engajamento cultural.',
      en: 'Independence Day with diaspora community events. Cultural engagement opportunity.',
      es: 'Día de la Independencia con eventos comunitarios en la diáspora. Oportunidad de compromiso cultural.'
    }
  },

  // OCTOBER
  {
    id: 'our-lady-aparecida',
    name: {
      pt: 'Nossa Senhora Aparecida',
      en: 'Our Lady of Aparecida',
      es: 'Nuestra Señora Aparecida'
    },
    date: { month: 10, day: 12, type: 'fixed' },
    category: 'religious',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'neutral',
      demandIncrease: 40
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Religious pilgrimage', 'Spiritual tourism', 'Aparecida sanctuary', 'Faith journeys'],
      promotionalPeriod: { start: 21, end: 7 },
      targetAudience: ['Religious travelers', 'Pilgrims', 'Spiritual tourists']
    },
    description: {
      pt: 'Padroeira do Brasil. Importante data religiosa com peregrinações ao Santuário de Aparecida.',
      en: 'Patron saint of Brazil. Important religious date with pilgrimages to Aparecida Sanctuary.',
      es: 'Patrona de Brasil. Fecha religiosa importante con peregrinaciones al Santuario de Aparecida.'
    }
  },

  // DECEMBER
  {
    id: 'christmas-brazil',
    name: {
      pt: 'Natal',
      en: 'Christmas',
      es: 'Navidad'
    },
    date: { month: 12, day: 25, duration: 7, type: 'fixed' },
    category: 'family',
    travelImpact: {
      level: 'high',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 95
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: true
    },
    marketingOpportunities: {
      contentThemes: ['Family reunions', 'Christmas in summer', 'Beach Christmas', 'Traditional celebrations'],
      promotionalPeriod: { start: 60, end: 7 },
      targetAudience: ['Families', 'Homesick diaspora', 'Multi-generational travelers']
    },
    description: {
      pt: 'Natal no verão brasileiro. Maior período de viagens familiares do ano para brasileiros no exterior.',
      en: 'Christmas in Brazilian summer. Biggest family travel period of the year for Brazilians abroad.',
      es: 'Navidad en el verano brasileño. Mayor período de viajes familiares del año para brasileños en el exterior.'
    }
  },

  // BUSINESS/ECONOMIC EVENTS
  {
    id: 'carnival-off-season',
    name: {
      pt: 'Período Pós-Carnaval',
      en: 'Post-Carnival Period',
      es: 'Período Post-Carnaval'
    },
    date: { month: 3, duration: 30, type: 'period' },
    category: 'business',
    travelImpact: {
      level: 'low',
      direction: 'both',
      priceImpact: 'decrease',
      demandIncrease: -30
    },
    communityEngagement: {
      diasporaEvents: false,
      communityGatherings: false,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Budget travel', 'Off-season deals', 'Business travel', 'Quiet tourism'],
      promotionalPeriod: { start: 10, end: 20 },
      targetAudience: ['Budget travelers', 'Business travelers', 'Flexible schedule travelers']
    },
    description: {
      pt: 'Período de baixa temporada com excelentes oportunidades de preços reduzidos.',
      en: 'Low season period with excellent reduced price opportunities.',
      es: 'Período de temporada baja con excelentes oportunidades de precios reducidos.'
    }
  },

  // MOTHER'S DAY BRAZIL
  {
    id: 'mothers-day-brazil',
    name: {
      pt: 'Dia das Mães',
      en: 'Mother\'s Day (Brazil)',
      es: 'Día de las Madres (Brasil)'
    },
    date: { month: 5, day: 12, type: 'fixed' }, // Second Sunday of May
    category: 'family',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 55
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Visit mothers in Brazil', 'Family reunions', 'Surprise visits', 'Emotional connections'],
      promotionalPeriod: { start: 30, end: 5 },
      targetAudience: ['Adult children abroad', 'Family-oriented travelers', 'Emotional travelers']
    },
    description: {
      pt: 'Dia das Mães brasileiro gera forte demanda emocional por viagens familiares.',
      en: 'Brazilian Mother\'s Day generates strong emotional demand for family travel.',
      es: 'El Día de las Madres brasileño genera fuerte demanda emocional por viajes familiares.'
    }
  },

  // ADDITIONAL CULTURAL EVENTS FOR COMPREHENSIVE COVERAGE
  
  // ROCK IN RIO (Major Cultural Event)
  {
    id: 'rock-in-rio',
    name: {
      pt: 'Rock in Rio',
      en: 'Rock in Rio Festival',
      es: 'Festival Rock in Rio'
    },
    date: { month: 9, duration: 7, type: 'variable' }, // Usually September, biennial
    category: 'cultural',
    travelImpact: {
      level: 'high',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 80
    },
    communityEngagement: {
      diasporaEvents: false,
      communityGatherings: true,
      mediaAttention: true
    },
    marketingOpportunities: {
      contentThemes: ['Music festival', 'International artists', 'Rio experience', 'Cultural tourism'],
      promotionalPeriod: { start: 90, end: 14 },
      targetAudience: ['Music lovers', 'Young adults', 'Cultural tourists', 'International visitors']
    },
    description: {
      pt: 'Maior festival de música do Brasil atrai visitantes internacionais e brasileiros da diáspora.',
      en: 'Brazil\'s biggest music festival attracts international visitors and diaspora Brazilians.',
      es: 'El mayor festival de música de Brasil atrae visitantes internacionales y brasileños de la diáspora.'
    }
  },

  // SÃO JOÃO FESTIVALS (Northeast Culture)
  {
    id: 'sao-joao-northeast',
    name: {
      pt: 'São João do Nordeste',
      en: 'Northeast Saint John Festivals',
      es: 'San Juan del Nordeste'
    },
    date: { month: 6, duration: 30, type: 'period' },
    category: 'cultural',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'neutral',
      demandIncrease: 40
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Northeast culture', 'Traditional music', 'Forró', 'Regional cuisine', 'Countryside experience'],
      promotionalPeriod: { start: 45, end: 10 },
      targetAudience: ['Cultural enthusiasts', 'Northeasterners abroad', 'Rural tourism fans']
    },
    description: {
      pt: 'Festivais tradicionais do Nordeste celebram cultura rural com forró, quadrilha e comidas típicas.',
      en: 'Traditional Northeast festivals celebrate rural culture with forró music, folk dances and typical foods.',
      es: 'Festivales tradicionales del Nordeste celebran cultura rural con forró, bailes folclóricos y comidas típicas.'
    }
  },

  // PARINTINS FOLKLORE FESTIVAL (Amazon Culture)
  {
    id: 'parintins-festival',
    name: {
      pt: 'Festival de Parintins',
      en: 'Parintins Folklore Festival',
      es: 'Festival de Parintins'
    },
    date: { month: 6, duration: 3, type: 'fixed' },
    category: 'cultural',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 50
    },
    communityEngagement: {
      diasporaEvents: false,
      communityGatherings: true,
      mediaAttention: true
    },
    marketingOpportunities: {
      contentThemes: ['Amazon culture', 'Indigenous traditions', 'Folklore', 'Unique Brazil experience'],
      promotionalPeriod: { start: 60, end: 14 },
      targetAudience: ['Cultural tourists', 'Adventure travelers', 'Cultural preservationists']
    },
    description: {
      pt: 'Festival folclórico amazônico único que celebra tradições indígenas e cultura regional.',
      en: 'Unique Amazon folklore festival celebrating indigenous traditions and regional culture.',
      es: 'Festival folclórico amazónico único que celebra tradiciones indígenas y cultura regional.'
    }
  },

  // OCTOBER BEER FESTIVAL (Oktoberfest Blumenau)
  {
    id: 'oktoberfest-blumenau',
    name: {
      pt: 'Oktoberfest Blumenau',
      en: 'Blumenau Oktoberfest',
      es: 'Oktoberfest Blumenau'
    },
    date: { month: 10, duration: 18, type: 'period' },
    category: 'cultural',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 35
    },
    communityEngagement: {
      diasporaEvents: false,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['German-Brazilian culture', 'Beer festival', 'Traditional food', 'Cultural fusion'],
      promotionalPeriod: { start: 30, end: 10 },
      targetAudience: ['German descendants', 'Beer enthusiasts', 'Cultural tourists']
    },
    description: {
      pt: 'Segunda maior Oktoberfest do mundo celebra herança alemã no Brasil.',
      en: 'World\'s second largest Oktoberfest celebrates German heritage in Brazil.',
      es: 'Segunda Oktoberfest más grande del mundo celebra herencia alemana en Brasil.'
    }
  },

  // FESTA DE IEMANJÁ (Afro-Brazilian Culture)
  {
    id: 'festa-iemanja',
    name: {
      pt: 'Festa de Iemanjá',
      en: 'Iemanjá Festival',
      es: 'Fiesta de Iemanjá'
    },
    date: { month: 2, day: 2, type: 'fixed' },
    category: 'religious',
    travelImpact: {
      level: 'low',
      direction: 'to-brazil',
      priceImpact: 'neutral',
      demandIncrease: 20
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Afro-Brazilian culture', 'Religious tourism', 'Salvador traditions', 'Cultural diversity'],
      promotionalPeriod: { start: 15, end: 5 },
      targetAudience: ['Afro-descendants', 'Religious tourists', 'Cultural enthusiasts']
    },
    description: {
      pt: 'Celebração afro-brasileira honrando a deusa do mar, especialmente forte em Salvador.',
      en: 'Afro-Brazilian celebration honoring the sea goddess, especially strong in Salvador.',
      es: 'Celebración afro-brasileña honrando a la diosa del mar, especialmente fuerte en Salvador.'
    }
  },

  // FESTA JUNINA DIASPORA EVENTS
  {
    id: 'festa-junina-diaspora',
    name: {
      pt: 'Festa Junina na Diáspora',
      en: 'Diaspora June Festivals',
      es: 'Fiesta Junina en la Diáspora'
    },
    date: { month: 6, duration: 30, type: 'period' },
    category: 'cultural',
    travelImpact: {
      level: 'low',
      direction: 'from-brazil',
      priceImpact: 'neutral',
      demandIncrease: 15
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Cultural preservation abroad', 'Community events', 'Family traditions', 'Cultural identity'],
      promotionalPeriod: { start: 20, end: 10 },
      targetAudience: ['Brazilian communities abroad', 'Second-generation Brazilians', 'Cultural organizations']
    },
    description: {
      pt: 'Comunidades brasileiras no exterior organizam festas juninas para manter tradições culturais.',
      en: 'Brazilian communities abroad organize June festivals to maintain cultural traditions.',
      es: 'Comunidades brasileñas en el exterior organizan fiestas juninas para mantener tradiciones culturales.'
    }
  },

  // FATHER'S DAY BRAZIL (Different from US)
  {
    id: 'fathers-day-brazil',
    name: {
      pt: 'Dia dos Pais',
      en: 'Father\'s Day (Brazil)',
      es: 'Día de los Padres (Brasil)'
    },
    date: { month: 8, day: 11, type: 'fixed' }, // Second Sunday of August
    category: 'family',
    travelImpact: {
      level: 'medium',
      direction: 'to-brazil',
      priceImpact: 'increase',
      demandIncrease: 45
    },
    communityEngagement: {
      diasporaEvents: true,
      communityGatherings: true,
      mediaAttention: false
    },
    marketingOpportunities: {
      contentThemes: ['Visit fathers in Brazil', 'Family bonds', 'Surprise visits', 'Male bonding trips'],
      promotionalPeriod: { start: 25, end: 5 },
      targetAudience: ['Adult children abroad', 'Male-oriented travelers', 'Family visitors']
    },
    description: {
      pt: 'Dia dos Pais brasileiro motiva viagens de família e retorno para visitar pais no Brasil.',
      en: 'Brazilian Father\'s Day motivates family travel and return visits to fathers in Brazil.',
      es: 'Día de los Padres brasileño motiva viajes familiares y visitas de regreso a padres en Brasil.'
    }
  }
];

// Helper functions for cultural calendar
export function getCurrentSeasonEvents(): BrazilianCulturalEvent[] {
  const currentMonth = new Date().getMonth() + 1;
  return brazilianCulturalCalendar.filter(event => 
    event.date.month === currentMonth ||
    (event.date.duration && 
     event.date.month <= currentMonth && 
     currentMonth <= event.date.month + Math.ceil(event.date.duration! / 30))
  );
}

export function getUpcomingEvents(months: number = 3): BrazilianCulturalEvent[] {
  const currentMonth = new Date().getMonth() + 1;
  const futureMonths = Array.from({ length: months }, (_, i) => 
    ((currentMonth + i - 1) % 12) + 1
  );
  
  return brazilianCulturalCalendar.filter(event => 
    futureMonths.includes(event.date.month)
  );
}

export function getHighTravelImpactEvents(): BrazilianCulturalEvent[] {
  return brazilianCulturalCalendar.filter(event => 
    event.travelImpact.level === 'high'
  );
}

export function getEventsByCategory(category: BrazilianCulturalEvent['category']): BrazilianCulturalEvent[] {
  return brazilianCulturalCalendar.filter(event => event.category === category);
}

export function getCommunityEngagementEvents(): BrazilianCulturalEvent[] {
  return brazilianCulturalCalendar.filter(event => 
    event.communityEngagement.diasporaEvents || 
    event.communityEngagement.communityGatherings
  );
}

export function getMarketingOpportunities(currentDate: Date = new Date()): BrazilianCulturalEvent[] {
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  return brazilianCulturalCalendar.filter(event => {
    if (event.date.type === 'fixed' && event.date.day) {
      const eventDate = new Date(currentDate.getFullYear(), event.date.month - 1, event.date.day);
      const diffDays = Math.floor((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return diffDays >= -event.marketingOpportunities.promotionalPeriod.end && 
             diffDays <= event.marketingOpportunities.promotionalPeriod.start;
    }
    
    return event.date.month === currentMonth;
  });
}

export function generateSeasonalContent(eventId: string, lang: 'pt' | 'en' | 'es' = 'pt') {
  const event = brazilianCulturalCalendar.find(e => e.id === eventId);
  if (!event) return null;

  return {
    title: event.name[lang],
    description: event.description[lang],
    marketingThemes: event.marketingOpportunities.contentThemes,
    targetAudience: event.marketingOpportunities.targetAudience,
    travelAdvice: {
      timing: event.marketingOpportunities.promotionalPeriod,
      priceImpact: event.travelImpact.priceImpact,
      demandLevel: event.travelImpact.level
    }
  };
}

export default brazilianCulturalCalendar;