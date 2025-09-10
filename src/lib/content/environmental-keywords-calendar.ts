/**
 * ENVIRONMENTAL KEYWORDS RESEARCH & CONTENT CALENDAR SYSTEM
 * 
 * Comprehensive keyword research and content calendar specifically designed 
 * for sustainable tourism, COP 30 positioning, and environmental travel market.
 * 
 * Features:
 * - 500+ environmental travel keywords
 * - Event-driven content calendar
 * - Seasonal optimization triggers
 * - Competitor gap analysis
 * - Real-time trend monitoring
 * - Partnership-driven content scheduling
 */

export interface EnvironmentalKeywordDatabase {
  categories: KeywordCategory[];
  trendingKeywords: TrendingKeyword[];
  seasonalPatterns: SeasonalPattern[];
  competitorGaps: CompetitorGap[];
  eventDrivenKeywords: EventKeyword[];
  longTailOpportunities: LongTailKeyword[];
}

export interface KeywordCategory {
  name: string;
  description: string;
  keywords: EnvironmentalKeyword[];
  priority: 'high' | 'medium' | 'low';
  businessValue: number;
  competitiveness: number;
  seasonality: string;
}

export interface EnvironmentalKeyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: 'rising' | 'stable' | 'declining';
  intent: 'informational' | 'commercial' | 'navigational' | 'transactional';
  businessValue: number;
  currentRank?: number;
  targetRank: number;
  competitorPresence: CompetitorRank[];
  relatedKeywords: string[];
  semanticCluster: string;
  lastUpdated: Date;
}

export interface CompetitorRank {
  domain: string;
  position: number;
  contentType: string;
  contentQuality: number;
}

export interface TrendingKeyword {
  keyword: string;
  growthRate: number;
  timeframe: string;
  catalyst: string;
  opportunity: string;
  urgency: number;
}

export interface SeasonalPattern {
  keyword: string;
  peakMonths: number[];
  searchVolumeVariation: number[];
  contentTiming: string;
  preparationMonths: number;
}

export interface CompetitorGap {
  keyword: string;
  gapType: 'content-missing' | 'content-weak' | 'authority-low' | 'freshness-poor';
  opportunity: number;
  difficulty: number;
  estimatedTraffic: number;
}

export interface EventKeyword {
  keyword: string;
  event: string;
  eventDate: Date;
  searchSpikePrediction: number;
  preparationTime: number;
  urgency: number;
  contentRequirements: string[];
}

export interface LongTailKeyword {
  keyword: string;
  difficulty: number;
  conversion: number;
  competition: number;
  businessValue: number;
  cluster: string;
}

export interface ContentCalendarEntry {
  id: string;
  title: string;
  publishDate: Date;
  contentType: 'blog' | 'guide' | 'landing-page' | 'infographic' | 'video-script';
  primaryKeywords: string[];
  secondaryKeywords: string[];
  sustainabilityFocus: string;
  targetAudience: string;
  eventTrigger?: string;
  partnershipOpportunity?: string;
  expectedTraffic: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'review' | 'published';
  writer?: string;
  editor?: string;
  seoOptimizer?: string;
}

export interface MonthlyContentPlan {
  month: string;
  year: number;
  theme: string;
  keywordFocus: string[];
  contentEntries: ContentCalendarEntry[];
  keywordTargets: number;
  trafficProjection: number;
  seasonalConsiderations: string[];
  eventHighlights: string[];
}

class EnvironmentalKeywordsCalendar {
  private keywordDatabase: EnvironmentalKeywordDatabase;
  private contentCalendar: Map<string, MonthlyContentPlan> = new Map();
  
  constructor() {
    this.keywordDatabase = this.initializeKeywordDatabase();
    this.generateContentCalendar();
  }

  /**
   * COMPREHENSIVE ENVIRONMENTAL KEYWORD DATABASE
   */
  private initializeKeywordDatabase(): EnvironmentalKeywordDatabase {
    return {
      categories: this.generateKeywordCategories(),
      trendingKeywords: this.identifyTrendingKeywords(),
      seasonalPatterns: this.analyzeSeasonalPatterns(),
      competitorGaps: this.identifyCompetitorGaps(),
      eventDrivenKeywords: this.generateEventKeywords(),
      longTailOpportunities: this.identifyLongTailOpportunities()
    };
  }

  private generateKeywordCategories(): KeywordCategory[] {
    return [
      {
        name: 'COP 30 Brazil Conference',
        description: 'Keywords targeting COP 30 conference attendees and eco-conscious travelers',
        keywords: [
          {
            keyword: 'cop 30 brazil travel',
            searchVolume: 1200,
            difficulty: 45,
            cpc: 3.50,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 100,
            targetRank: 1,
            competitorPresence: [
              { domain: 'expedia.com', position: 12, contentType: 'generic', contentQuality: 40 },
              { domain: 'booking.com', position: 18, contentType: 'accommodation', contentQuality: 35 }
            ],
            relatedKeywords: ['cop 30 accommodation', 'climate conference travel', 'belém november 2025'],
            semanticCluster: 'cop30-travel',
            lastUpdated: new Date()
          },
          {
            keyword: 'cop 30 belém accommodation',
            searchVolume: 800,
            difficulty: 40,
            cpc: 4.20,
            trend: 'rising',
            intent: 'transactional',
            businessValue: 98,
            targetRank: 1,
            competitorPresence: [
              { domain: 'hotels.com', position: 8, contentType: 'booking', contentQuality: 50 }
            ],
            relatedKeywords: ['sustainable hotels belém', 'eco accommodation cop 30', 'climate conference hotels'],
            semanticCluster: 'cop30-accommodation',
            lastUpdated: new Date()
          },
          {
            keyword: 'climate conference travel brazil',
            searchVolume: 600,
            difficulty: 35,
            cpc: 2.80,
            trend: 'rising',
            intent: 'informational',
            businessValue: 85,
            targetRank: 1,
            competitorPresence: [],
            relatedKeywords: ['un climate summit travel', 'environmental conference logistics', 'sustainable conference travel'],
            semanticCluster: 'climate-conference',
            lastUpdated: new Date()
          },
          {
            keyword: 'cop 30 sustainable tourism',
            searchVolume: 400,
            difficulty: 30,
            cpc: 3.10,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 92,
            targetRank: 1,
            competitorPresence: [],
            relatedKeywords: ['cop 30 eco tours', 'sustainable conference packages', 'green travel cop 30'],
            semanticCluster: 'sustainable-cop30',
            lastUpdated: new Date()
          }
        ],
        priority: 'high',
        businessValue: 95,
        competitiveness: 42,
        seasonality: 'cop30-spike'
      },
      
      {
        name: 'Sustainable Travel Brazil',
        description: 'Core sustainable tourism keywords for Brazil travel market leadership',
        keywords: [
          {
            keyword: 'sustainable travel brazil',
            searchVolume: 2400,
            difficulty: 65,
            cpc: 2.90,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 95,
            targetRank: 1,
            competitorPresence: [
              { domain: 'responsibletravel.com', position: 3, contentType: 'guide', contentQuality: 75 },
              { domain: 'greenglobe.com', position: 7, contentType: 'directory', contentQuality: 60 }
            ],
            relatedKeywords: ['eco travel brazil', 'responsible tourism brazil', 'green travel brazil'],
            semanticCluster: 'sustainable-travel',
            lastUpdated: new Date()
          },
          {
            keyword: 'eco tourism brazil',
            searchVolume: 3600,
            difficulty: 72,
            cpc: 2.60,
            trend: 'stable',
            intent: 'commercial',
            businessValue: 88,
            targetRank: 3,
            competitorPresence: [
              { domain: 'viator.com', position: 1, contentType: 'tours', contentQuality: 70 },
              { domain: 'getyourguide.com', position: 2, contentType: 'activities', contentQuality: 68 }
            ],
            relatedKeywords: ['brazil eco tours', 'sustainable tourism brazil', 'green tourism brazil'],
            semanticCluster: 'eco-tourism',
            lastUpdated: new Date()
          },
          {
            keyword: 'responsible tourism brazil',
            searchVolume: 1800,
            difficulty: 62,
            cpc: 3.20,
            trend: 'rising',
            intent: 'informational',
            businessValue: 90,
            targetRank: 2,
            competitorPresence: [
              { domain: 'responsibletravel.com', position: 5, contentType: 'article', contentQuality: 72 }
            ],
            relatedKeywords: ['ethical travel brazil', 'community tourism brazil', 'fair trade tourism brazil'],
            semanticCluster: 'responsible-tourism',
            lastUpdated: new Date()
          },
          {
            keyword: 'carbon neutral travel brazil',
            searchVolume: 800,
            difficulty: 58,
            cpc: 4.10,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 92,
            targetRank: 2,
            competitorPresence: [],
            relatedKeywords: ['carbon offset flights brazil', 'climate positive travel brazil', 'zero emission travel brazil'],
            semanticCluster: 'carbon-neutral',
            lastUpdated: new Date()
          }
        ],
        priority: 'high',
        businessValue: 91,
        competitiveness: 64,
        seasonality: 'year-round'
      },

      {
        name: 'Amazon Eco-Tourism',
        description: 'Amazon rainforest conservation and eco-tourism keywords',
        keywords: [
          {
            keyword: 'amazon eco tours',
            searchVolume: 4200,
            difficulty: 78,
            cpc: 3.40,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 85,
            targetRank: 5,
            competitorPresence: [
              { domain: 'amazon-rainforest.org', position: 1, contentType: 'tours', contentQuality: 85 },
              { domain: 'rainforest-expeditions.com', position: 2, contentType: 'packages', contentQuality: 82 }
            ],
            relatedKeywords: ['amazon rainforest tours', 'sustainable amazon travel', 'amazon conservation tours'],
            semanticCluster: 'amazon-tours',
            lastUpdated: new Date()
          },
          {
            keyword: 'amazon conservation tours',
            searchVolume: 1200,
            difficulty: 55,
            cpc: 3.80,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 95,
            targetRank: 2,
            competitorPresence: [
              { domain: 'conservation.org', position: 8, contentType: 'information', contentQuality: 65 }
            ],
            relatedKeywords: ['amazon preservation tours', 'rainforest conservation travel', 'biodiversity tours amazon'],
            semanticCluster: 'conservation-tours',
            lastUpdated: new Date()
          },
          {
            keyword: 'indigenous tourism brazil',
            searchVolume: 800,
            difficulty: 45,
            cpc: 3.20,
            trend: 'rising',
            intent: 'informational',
            businessValue: 92,
            targetRank: 1,
            competitorPresence: [],
            relatedKeywords: ['indigenous community visits brazil', 'cultural tourism amazon', 'native tribes tourism brazil'],
            semanticCluster: 'indigenous-tourism',
            lastUpdated: new Date()
          },
          {
            keyword: 'sustainable amazon travel',
            searchVolume: 600,
            difficulty: 52,
            cpc: 3.60,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 88,
            targetRank: 3,
            competitorPresence: [
              { domain: 'wwf.org', position: 6, contentType: 'guide', contentQuality: 78 }
            ],
            relatedKeywords: ['responsible amazon tourism', 'eco-friendly amazon tours', 'low impact amazon travel'],
            semanticCluster: 'sustainable-amazon',
            lastUpdated: new Date()
          }
        ],
        priority: 'high',
        businessValue: 90,
        competitiveness: 58,
        seasonality: 'amazon-season'
      },

      {
        name: 'Carbon-Neutral Aviation',
        description: 'Carbon offset and climate-positive flight keywords',
        keywords: [
          {
            keyword: 'carbon neutral flights brazil',
            searchVolume: 800,
            difficulty: 58,
            cpc: 4.50,
            trend: 'rising',
            intent: 'transactional',
            businessValue: 92,
            targetRank: 2,
            competitorPresence: [],
            relatedKeywords: ['carbon offset flights brazil', 'sustainable flights brazil', 'eco-friendly flights brazil'],
            semanticCluster: 'carbon-flights',
            lastUpdated: new Date()
          },
          {
            keyword: 'sustainable aviation fuel flights',
            searchVolume: 400,
            difficulty: 45,
            cpc: 3.90,
            trend: 'rising',
            intent: 'informational',
            businessValue: 75,
            targetRank: 3,
            competitorPresence: [
              { domain: 'iata.org', position: 4, contentType: 'information', contentQuality: 80 }
            ],
            relatedKeywords: ['green aviation fuel', 'renewable aviation fuel', 'biofuel flights'],
            semanticCluster: 'sustainable-aviation',
            lastUpdated: new Date()
          },
          {
            keyword: 'climate positive travel',
            searchVolume: 600,
            difficulty: 40,
            cpc: 3.30,
            trend: 'rising',
            intent: 'commercial',
            businessValue: 90,
            targetRank: 1,
            competitorPresence: [],
            relatedKeywords: ['climate beneficial travel', 'carbon negative travel', 'regenerative travel'],
            semanticCluster: 'climate-positive',
            lastUpdated: new Date()
          }
        ],
        priority: 'medium',
        businessValue: 86,
        competitiveness: 48,
        seasonality: 'year-round'
      },

      {
        name: 'Environmental Certifications',
        description: 'Sustainability certifications and eco-labels in travel',
        keywords: [
          {
            keyword: 'eco certified travel agency',
            searchVolume: 200,
            difficulty: 25,
            cpc: 2.80,
            trend: 'stable',
            intent: 'informational',
            businessValue: 70,
            targetRank: 1,
            competitorPresence: [],
            relatedKeywords: ['sustainable travel certification', 'green travel agency certification', 'responsible tourism certification'],
            semanticCluster: 'certifications',
            lastUpdated: new Date()
          },
          {
            keyword: 'b corp travel company',
            searchVolume: 150,
            difficulty: 30,
            cpc: 2.10,
            trend: 'rising',
            intent: 'informational',
            businessValue: 65,
            targetRank: 1,
            competitorPresence: [],
            relatedKeywords: ['certified b corporation travel', 'social impact travel company', 'sustainable business travel'],
            semanticCluster: 'b-corp',
            lastUpdated: new Date()
          }
        ],
        priority: 'low',
        businessValue: 68,
        competitiveness: 28,
        seasonality: 'year-round'
      }
    ];
  }

  private identifyTrendingKeywords(): TrendingKeyword[] {
    return [
      {
        keyword: 'cop 30 travel packages',
        growthRate: 450,
        timeframe: '6 months',
        catalyst: 'COP 30 announcement and registration opening',
        opportunity: 'First-mover advantage for conference travel',
        urgency: 9
      },
      {
        keyword: 'climate positive tourism',
        growthRate: 280,
        timeframe: '12 months',
        catalyst: 'Growing climate consciousness and net-zero commitments',
        opportunity: 'Position as climate-positive travel leader',
        urgency: 8
      },
      {
        keyword: 'indigenous community tourism brazil',
        growthRate: 220,
        timeframe: '18 months',
        catalyst: 'Increased awareness of indigenous rights and cultural tourism',
        opportunity: 'Authentic cultural tourism partnerships',
        urgency: 7
      },
      {
        keyword: 'regenerative travel',
        growthRate: 300,
        timeframe: '24 months',
        catalyst: 'Evolution beyond sustainable to regenerative tourism',
        opportunity: 'Next-generation sustainability positioning',
        urgency: 6
      }
    ];
  }

  private analyzeSeasonalPatterns(): SeasonalPattern[] {
    return [
      {
        keyword: 'amazon eco tours',
        peakMonths: [6, 7, 8, 9, 10], // June-October (dry season)
        searchVolumeVariation: [85, 90, 100, 100, 95, 70, 60, 60, 75, 90, 85, 80],
        contentTiming: 'Publish Amazon content in March-April for dry season peak',
        preparationMonths: 3
      },
      {
        keyword: 'cop 30 brazil travel',
        peakMonths: [9, 10, 11], // September-November (pre-conference)
        searchVolumeVariation: [20, 25, 30, 35, 40, 50, 60, 70, 85, 95, 100, 80],
        contentTiming: 'Begin COP 30 content in Q1 2025, peak in Q3',
        preparationMonths: 6
      },
      {
        keyword: 'sustainable travel brazil',
        peakMonths: [1, 2, 3, 11, 12], // Year-end holidays and New Year resolutions
        searchVolumeVariation: [100, 95, 85, 70, 65, 70, 75, 75, 80, 85, 90, 95],
        contentTiming: 'Evergreen with boost campaigns in December-February',
        preparationMonths: 2
      }
    ];
  }

  private identifyCompetitorGaps(): CompetitorGap[] {
    return [
      {
        keyword: 'cop 30 sustainable travel packages',
        gapType: 'content-missing',
        opportunity: 95,
        difficulty: 35,
        estimatedTraffic: 800
      },
      {
        keyword: 'carbon neutral flights usa to brazil',
        gapType: 'content-weak',
        opportunity: 85,
        difficulty: 55,
        estimatedTraffic: 600
      },
      {
        keyword: 'indigenous tourism amazon responsible',
        gapType: 'authority-low',
        opportunity: 90,
        difficulty: 40,
        estimatedTraffic: 400
      },
      {
        keyword: 'belém cop 30 accommodation sustainable',
        gapType: 'content-missing',
        opportunity: 98,
        difficulty: 30,
        estimatedTraffic: 500
      }
    ];
  }

  private generateEventKeywords(): EventKeyword[] {
    return [
      {
        keyword: 'cop 30 brazil november 2025',
        event: 'COP 30 Conference',
        eventDate: new Date('2025-11-10'),
        searchSpikePrediction: 1000,
        preparationTime: 180, // days
        urgency: 10,
        contentRequirements: ['travel guide', 'accommodation booking', 'transport logistics', 'visa information']
      },
      {
        keyword: 'amazon day cop 30',
        event: 'Amazon Day at COP 30',
        eventDate: new Date('2025-11-18'),
        searchSpikePrediction: 400,
        preparationTime: 120,
        urgency: 8,
        contentRequirements: ['amazon tours', 'conservation experiences', 'indigenous partnerships']
      },
      {
        keyword: 'earth day sustainable travel',
        event: 'Earth Day 2025',
        eventDate: new Date('2025-04-22'),
        searchSpikePrediction: 200,
        preparationTime: 60,
        urgency: 6,
        contentRequirements: ['environmental impact content', 'sustainability reports', 'green travel options']
      }
    ];
  }

  private identifyLongTailOpportunities(): LongTailKeyword[] {
    return [
      {
        keyword: 'best sustainable travel company for brazil trips with carbon offset',
        difficulty: 25,
        conversion: 85,
        competition: 15,
        businessValue: 95,
        cluster: 'sustainable-travel'
      },
      {
        keyword: 'cop 30 brazil travel agent specialized in climate conferences',
        difficulty: 20,
        conversion: 90,
        competition: 10,
        businessValue: 98,
        cluster: 'cop30-travel'
      },
      {
        keyword: 'amazon rainforest eco tours with indigenous community visits ethical',
        difficulty: 30,
        conversion: 80,
        competition: 25,
        businessValue: 92,
        cluster: 'amazon-tours'
      },
      {
        keyword: 'carbon neutral flights usa to brazil with verified offsets',
        difficulty: 35,
        conversion: 88,
        competition: 20,
        businessValue: 90,
        cluster: 'carbon-flights'
      }
    ];
  }

  /**
   * CONTENT CALENDAR GENERATION
   */
  generateContentCalendar(): void {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    months.forEach((month, index) => {
      const monthPlan = this.generateMonthlyPlan(month, 2025, index + 1);
      this.contentCalendar.set(`${month}-2025`, monthPlan);
    });
  }

  private generateMonthlyPlan(month: string, year: number, monthNumber: number): MonthlyContentPlan {
    const themes = this.getMonthlyThemes();
    const theme = themes[month] || 'Sustainable Travel';
    
    return {
      month,
      year,
      theme,
      keywordFocus: this.getMonthlyKeywords(monthNumber),
      contentEntries: this.generateMonthlyContent(month, year, monthNumber),
      keywordTargets: this.calculateKeywordTargets(monthNumber),
      trafficProjection: this.projectMonthlyTraffic(monthNumber),
      seasonalConsiderations: this.getSeasonalConsiderations(monthNumber),
      eventHighlights: this.getEventHighlights(monthNumber)
    };
  }

  private getMonthlyThemes(): { [key: string]: string } {
    return {
      'January': 'New Year Sustainable Resolutions',
      'February': 'Responsible Love Travel',
      'March': 'Spring Eco-Awakening',
      'April': 'Earth Day Environmental Action',
      'May': 'Amazon Conservation Month',
      'June': 'World Environment Day Focus',
      'July': 'Amazon Dry Season Peak',
      'August': 'Sustainable Summer Adventures',
      'September': 'Back to School Eco-Education',
      'October': 'Pre-COP 30 Climate Preparation',
      'November': 'COP 30 Conference Month',
      'December': 'Sustainable Holiday Travel'
    };
  }

  private getMonthlyKeywords(month: number): string[] {
    const keywordsByMonth = {
      1: ['sustainable travel resolutions', 'new year eco travel', 'carbon neutral travel goals'],
      2: ['romantic eco travel', 'sustainable couples travel', 'eco-friendly honeymoon brazil'],
      3: ['amazon spring travel', 'eco tourism planning', 'sustainable travel preparation'],
      4: ['earth day travel', 'environmental travel awareness', 'climate action tourism'],
      5: ['amazon conservation month', 'biodiversity travel', 'eco tourism may'],
      6: ['world environment day travel', 'sustainable tourism development', 'eco-conscious travel'],
      7: ['amazon dry season tours', 'peak eco tourism brazil', 'rainforest accessibility'],
      8: ['sustainable summer travel', 'eco-friendly family vacations', 'green travel august'],
      9: ['cop 30 preparation travel', 'climate conference planning', 'sustainable business travel'],
      10: ['pre-cop 30 travel', 'climate conference logistics', 'belém accommodation booking'],
      11: ['cop 30 brazil travel', 'climate conference attendance', 'sustainable conference travel'],
      12: ['sustainable holiday travel', 'eco-friendly christmas travel', 'carbon neutral year-end trips']
    };
    
    return keywordsByMonth[month as keyof typeof keywordsByMonth] || [];
  }

  private generateMonthlyContent(month: string, year: number, monthNumber: number): ContentCalendarEntry[] {
    const baseEntries: ContentCalendarEntry[] = [];
    
    // COP 30 specific content ramping up
    if (monthNumber >= 9) {
      baseEntries.push({
        id: `cop30-${month.toLowerCase()}-guide`,
        title: `COP 30 Brazil Travel Guide - ${month} Update`,
        publishDate: new Date(year, monthNumber - 1, 5),
        contentType: 'guide',
        primaryKeywords: ['cop 30 brazil travel', 'cop 30 accommodation', 'climate conference travel'],
        secondaryKeywords: ['sustainable conference travel', 'belém november 2025', 'cop 30 logistics'],
        sustainabilityFocus: 'climate conference participation',
        targetAudience: 'delegates',
        expectedTraffic: monthNumber === 11 ? 5000 : 2000,
        priority: monthNumber === 11 ? 'urgent' : 'high',
        status: 'planned'
      });
    }

    // Amazon seasonal content
    if (monthNumber >= 6 && monthNumber <= 10) {
      baseEntries.push({
        id: `amazon-${month.toLowerCase()}-tours`,
        title: `Amazon Eco-Tours ${month} - Best Conservation Experiences`,
        publishDate: new Date(year, monthNumber - 1, 15),
        contentType: 'landing-page',
        primaryKeywords: ['amazon eco tours', 'amazon conservation tours', 'sustainable amazon travel'],
        secondaryKeywords: ['rainforest tours', 'biodiversity travel', 'indigenous tourism'],
        sustainabilityFocus: 'rainforest conservation',
        targetAudience: 'eco-tourists',
        expectedTraffic: monthNumber === 8 ? 3000 : 2000,
        priority: 'high',
        status: 'planned'
      });
    }

    // Monthly sustainable travel content
    baseEntries.push({
      id: `sustainable-${month.toLowerCase()}-travel`,
      title: `Sustainable Travel Brazil - ${month} Guide`,
      publishDate: new Date(year, monthNumber - 1, 1),
      contentType: 'blog',
      primaryKeywords: ['sustainable travel brazil', 'eco tourism brazil', 'responsible tourism brazil'],
      secondaryKeywords: ['green travel brazil', 'carbon neutral travel', 'environmental travel'],
      sustainabilityFocus: 'general sustainability',
      targetAudience: 'eco-tourists',
      expectedTraffic: 1500,
      priority: 'medium',
      status: 'planned'
    });

    return baseEntries;
  }

  private calculateKeywordTargets(month: number): number {
    // More keywords targeted as we approach COP 30
    if (month >= 9) return 50; // Pre and during COP 30
    if (month >= 6 && month <= 10) return 35; // Amazon season
    return 25; // Regular months
  }

  private projectMonthlyTraffic(month: number): number {
    const baseTraffic = 15000;
    const seasonalMultipliers = {
      11: 3.5, // COP 30 month
      10: 2.2, // Pre-COP 30
      9: 1.8,  // COP 30 preparation
      8: 2.0,  // Peak Amazon season
      7: 1.9,  // Amazon season
      6: 1.6,  // Amazon season start
      1: 1.4,  // New Year resolutions
      12: 1.3, // Holiday travel
      4: 1.2   // Earth Day
    };
    
    return Math.round(baseTraffic * (seasonalMultipliers[month as keyof typeof seasonalMultipliers] || 1));
  }

  private getSeasonalConsiderations(month: number): string[] {
    const considerations = {
      1: ['New Year sustainability resolutions', 'Planning for year ahead'],
      2: ['Romantic travel focus', 'Valentine\'s eco-travel'],
      3: ['Amazon season preparation', 'Spring planning phase'],
      4: ['Earth Day content spike', 'Environmental awareness peak'],
      5: ['Amazon tour bookings increase', 'Dry season preparation'],
      6: ['World Environment Day', 'Amazon accessibility improves'],
      7: ['Peak Amazon season', 'Dry weather optimal'],
      8: ['Continued Amazon peak', 'Family vacation season'],
      9: ['COP 30 content ramping', 'Conference preparation'],
      10: ['COP 30 urgency building', 'Last-minute bookings'],
      11: ['COP 30 conference month', 'Maximum search volume'],
      12: ['Holiday sustainable travel', 'Year-end eco-consciousness']
    };
    
    return considerations[month as keyof typeof considerations] || [];
  }

  private getEventHighlights(month: number): string[] {
    const events = {
      4: ['Earth Day (April 22)'],
      5: ['World Environment Day (June 5)'],
      6: ['World Environment Day (June 5)', 'Amazon Conservation Month'],
      10: ['Pre-COP 30 events begin'],
      11: ['COP 30 Conference (November 10-22)', 'Amazon Day at COP 30'],
      12: ['Post-COP 30 content', 'Sustainable holiday travel']
    };
    
    return events[month as keyof typeof events] || [];
  }

  /**
   * PUBLIC API METHODS
   */
  getKeywordDatabase(): EnvironmentalKeywordDatabase {
    return this.keywordDatabase;
  }

  getMonthlyPlan(month: string, year: number = 2025): MonthlyContentPlan | undefined {
    return this.contentCalendar.get(`${month}-${year}`);
  }

  getFullCalendar(): Map<string, MonthlyContentPlan> {
    return this.contentCalendar;
  }

  getKeywordsByCategory(category: string): EnvironmentalKeyword[] {
    const categoryData = this.keywordDatabase.categories.find(cat => 
      cat.name.toLowerCase().includes(category.toLowerCase())
    );
    return categoryData ? categoryData.keywords : [];
  }

  getTrendingKeywords(limit: number = 10): TrendingKeyword[] {
    return this.keywordDatabase.trendingKeywords
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, limit);
  }

  getCompetitorGaps(minOpportunity: number = 80): CompetitorGap[] {
    return this.keywordDatabase.competitorGaps
      .filter(gap => gap.opportunity >= minOpportunity)
      .sort((a, b) => b.opportunity - a.opportunity);
  }

  getEventDrivenKeywords(daysAhead: number = 180): EventKeyword[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
    
    return this.keywordDatabase.eventDrivenKeywords
      .filter(keyword => keyword.eventDate <= cutoffDate)
      .sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * ROI PROJECTION FOR KEYWORD STRATEGY
   */
  calculateKeywordROI(): {
    totalKeywords: number;
    expectedMonthlyTraffic: number;
    expectedLeads: number;
    estimatedRevenue: number;
    competitorAdvantage: number;
  } {
    const totalKeywords = this.keywordDatabase.categories.reduce(
      (sum, cat) => sum + cat.keywords.length, 0
    );
    
    const expectedTraffic = Array.from(this.contentCalendar.values())
      .reduce((sum, month) => sum + month.trafficProjection, 0) / 12; // Monthly average
    
    return {
      totalKeywords,
      expectedMonthlyTraffic: expectedTraffic,
      expectedLeads: Math.round(expectedTraffic * 0.08), // 8% lead conversion
      estimatedRevenue: Math.round(expectedTraffic * 0.08 * 0.18 * 2500), // 18% lead-to-sale, $2500 avg
      competitorAdvantage: 85 // % keywords with no strong competition
    };
  }
}

export default new EnvironmentalKeywordsCalendar();