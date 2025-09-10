/**
 * AUTOMATED INTERNAL LINKING SYSTEM
 * Intelligent system for automatic internal link generation and optimization
 * Integrates with content management and SEO strategy
 */

import { InternalLinkingOptimizer, InternalLink } from './internal-linking-optimizer';
import { TopicClusterManager } from './topic-cluster-manager';
import { AnchorTextOptimizer, AnchorTextStrategy } from './anchor-text-optimizer';

export interface LinkingRule {
  id: string;
  name: string;
  condition: {
    pagePattern?: string;
    contentPattern?: string;
    pageType?: string;
    language?: 'pt' | 'en' | 'es';
    excludePages?: string[];
  };
  action: {
    targetUrl: string;
    anchorStrategy: AnchorTextStrategy;
    placement: 'header' | 'footer' | 'sidebar' | 'content' | 'navigation';
    frequency: 'always' | 'once-per-page' | 'max-per-content';
    maxLinks?: number;
  };
  priority: number;
  active: boolean;
}

export interface AutoLinkingConfig {
  maxLinksPerPage: number;
  maxLinksPerParagraph: number;
  avoidSelfLinking: boolean;
  respectNoFollow: boolean;
  anchorTextDiversity: boolean;
  trackLinkPerformance: boolean;
  languages: ('pt' | 'en' | 'es')[];
}

export interface LinkingSuggestion {
  fromUrl: string;
  toUrl: string;
  anchorText: string;
  confidence: number;
  reason: string;
  placement: string;
  priority: 'high' | 'medium' | 'low';
}

export class AutomatedLinkingSystem {
  
  private static config: AutoLinkingConfig = {
    maxLinksPerPage: 15,
    maxLinksPerParagraph: 2,
    avoidSelfLinking: true,
    respectNoFollow: true,
    anchorTextDiversity: true,
    trackLinkPerformance: true,
    languages: ['pt', 'en', 'es']
  };

  /**
   * CORE LINKING RULES
   * Predefined rules for automatic link insertion
   */
  
  private static linkingRules: LinkingRule[] = [
    
    // RULE 1: Homepage to Service Pages
    {
      id: 'homepage-to-services',
      name: 'Homepage to Main Services',
      condition: {
        pagePattern: '^/$',
        pageType: 'home'
      },
      action: {
        targetUrl: '/voos-brasil-eua',
        anchorStrategy: AnchorTextOptimizer.generateAnchorStrategies('voos brasil eua'),
        placement: 'content',
        frequency: 'always',
        maxLinks: 3
      },
      priority: 10,
      active: true
    },

    // RULE 2: Service Pages Cross-linking
    {
      id: 'service-cross-linking',
      name: 'Cross-link Related Services',
      condition: {
        pagePattern: '^/(voos|hoteis|carros|seguro)',
        pageType: 'service'
      },
      action: {
        targetUrl: 'dynamic', // Will be calculated
        anchorStrategy: AnchorTextOptimizer.generateAnchorStrategies('serviços relacionados'),
        placement: 'sidebar',
        frequency: 'always',
        maxLinks: 4
      },
      priority: 8,
      active: true
    },

    // RULE 3: City Pages to Service Pages  
    {
      id: 'city-to-services',
      name: 'City Pages to Relevant Services',
      condition: {
        pagePattern: '^/(cidade|city|ciudad)',
        pageType: 'city'
      },
      action: {
        targetUrl: 'dynamic',
        anchorStrategy: AnchorTextOptimizer.generateAnchorStrategies('voos para a cidade'),
        placement: 'content',
        frequency: 'once-per-page',
        maxLinks: 3
      },
      priority: 7,
      active: true
    },

    // RULE 4: Blog to Service Pages
    {
      id: 'blog-to-services',
      name: 'Blog Content to Services',
      condition: {
        pagePattern: '^/blog/',
        pageType: 'blog',
        contentPattern: '(voo|passagem|hotel|viagem)'
      },
      action: {
        targetUrl: 'dynamic',
        anchorStrategy: AnchorTextOptimizer.generateAnchorStrategies('nossos serviços'),
        placement: 'content',
        frequency: 'max-per-content',
        maxLinks: 2
      },
      priority: 6,
      active: true
    },

    // RULE 5: International Pages Cross-linking
    {
      id: 'international-cross-linking',
      name: 'Cross-link Language Versions',
      condition: {
        pagePattern: '^/(en|es)/',
        language: 'en'
      },
      action: {
        targetUrl: 'dynamic',
        anchorStrategy: AnchorTextOptimizer.generateAnchorStrategies('other languages', 'en'),
        placement: 'navigation',
        frequency: 'always',
        maxLinks: 2
      },
      priority: 5,
      active: true
    }
  ];

  /**
   * AUTOMATIC LINK GENERATION
   */
  
  static generateAutoLinks(
    pageUrl: string,
    pageContent: string,
    pageType: string,
    language: 'pt' | 'en' | 'es' = 'pt'
  ): InternalLink[] {
    
    const suggestions: InternalLink[] = [];
    const usedAnchors: string[] = [];
    
    // Apply matching rules
    const applicableRules = this.getApplicableRules(pageUrl, pageContent, pageType, language);
    
    for (const rule of applicableRules) {
      const links = this.applyRule(rule, pageUrl, pageContent, pageType, language, usedAnchors);
      suggestions.push(...links);
    }
    
    // Add content-based suggestions
    const contentSuggestions = this.generateContentBasedLinks(pageUrl, pageContent, language);
    suggestions.push(...contentSuggestions);
    
    // Add cluster-based suggestions
    const clusterSuggestions = this.generateClusterBasedLinks(pageUrl, pageType);
    suggestions.push(...clusterSuggestions);
    
    // Remove duplicates and apply limits
    return this.optimizeLinkSelection(suggestions);
  }

  private static getApplicableRules(
    pageUrl: string,
    pageContent: string,
    pageType: string,
    language: 'pt' | 'en' | 'es'
  ): LinkingRule[] {
    
    return this.linkingRules.filter(rule => {
      if (!rule.active) return false;
      
      const condition = rule.condition;
      
      // Check page pattern
      if (condition.pagePattern && !new RegExp(condition.pagePattern).test(pageUrl)) {
        return false;
      }
      
      // Check page type
      if (condition.pageType && condition.pageType !== pageType) {
        return false;
      }
      
      // Check language
      if (condition.language && condition.language !== language) {
        return false;
      }
      
      // Check content pattern
      if (condition.contentPattern && !new RegExp(condition.contentPattern, 'i').test(pageContent)) {
        return false;
      }
      
      // Check exclusions
      if (condition.excludePages && condition.excludePages.some(pattern => 
        new RegExp(pattern).test(pageUrl)
      )) {
        return false;
      }
      
      return true;
    }).sort((a, b) => b.priority - a.priority);
  }

  private static applyRule(
    rule: LinkingRule,
    pageUrl: string,
    pageContent: string,
    pageType: string,
    language: 'pt' | 'en' | 'es',
    usedAnchors: string[]
  ): InternalLink[] {
    
    const links: InternalLink[] = [];
    const maxLinks = rule.action.maxLinks || 1;
    
    // Determine target URLs
    const targetUrls = this.resolveTargetUrls(rule, pageUrl, pageType);
    
    for (let i = 0; i < Math.min(targetUrls.length, maxLinks); i++) {
      const targetUrl = targetUrls[i];
      
      // Skip self-linking
      if (this.config.avoidSelfLinking && targetUrl === pageUrl) {
        continue;
      }
      
      // Generate anchor text
      const anchorVariation = AnchorTextOptimizer.selectOptimalAnchor(
        rule.action.anchorStrategy,
        rule.action.placement,
        usedAnchors
      );
      
      if (anchorVariation) {
        links.push({
          url: targetUrl,
          anchor: anchorVariation.text,
          context: rule.action.placement as any,
          priority: this.mapRulePriorityToLinkPriority(rule.priority),
          relationship: 'related'
        });
        
        usedAnchors.push(anchorVariation.text);
      }
    }
    
    return links;
  }

  private static resolveTargetUrls(rule: LinkingRule, pageUrl: string, pageType: string): string[] {
    if (rule.action.targetUrl !== 'dynamic') {
      return [rule.action.targetUrl];
    }
    
    // Dynamic URL resolution based on rule type
    switch (rule.id) {
      case 'service-cross-linking':
        return this.getRelatedServiceUrls(pageUrl);
        
      case 'city-to-services':
        return this.getCityServiceUrls(pageUrl);
        
      case 'blog-to-services':
        return this.getBlogServiceUrls(pageUrl);
        
      case 'international-cross-linking':
        return this.getInternationalUrls(pageUrl);
        
      default:
        return [];
    }
  }

  private static getRelatedServiceUrls(pageUrl: string): string[] {
    const serviceMap = {
      'voos': ['/hoteis-brasil', '/seguro-viagem-brasil', '/aluguel-carros-brasil'],
      'hoteis': ['/voos-brasil-eua', '/aluguel-carros-brasil', '/passeios-brasil'],
      'carros': ['/voos-brasil-eua', '/hoteis-brasil', '/seguro-viagem-brasil'],
      'seguro': ['/voos-brasil-eua', '/hoteis-brasil', '/blog/seguro-viagem']
    };
    
    for (const [service, related] of Object.entries(serviceMap)) {
      if (pageUrl.includes(service)) {
        return related;
      }
    }
    
    return [];
  }

  private static getCityServiceUrls(cityUrl: string): string[] {
    // Extract city from URL and generate relevant service links
    const cityMatch = cityUrl.match(/\/(cidade|city|ciudad)\/([^\/]+)/);
    if (cityMatch) {
      const cityId = cityMatch[2];
      return [
        `/voos-${cityId}`,
        `/hoteis-${cityId}`,
        '/voos-brasil-eua'
      ];
    }
    return ['/voos-brasil-eua', '/hoteis-brasil'];
  }

  private static getBlogServiceUrls(blogUrl: string): string[] {
    // Analyze blog content to suggest relevant services
    if (blogUrl.includes('voo') || blogUrl.includes('passagem')) {
      return ['/voos-brasil-eua', '/cotacao/voos'];
    }
    if (blogUrl.includes('hotel') || blogUrl.includes('hospedagem')) {
      return ['/hoteis-brasil', '/cotacao/hoteis'];
    }
    return ['/voos-brasil-eua'];
  }

  private static getInternationalUrls(currentUrl: string): string[] {
    // Generate alternative language versions
    const urls: string[] = [];
    
    if (currentUrl.startsWith('/en/')) {
      urls.push(currentUrl.replace('/en/', '/'));
      urls.push(currentUrl.replace('/en/', '/es/'));
    } else if (currentUrl.startsWith('/es/')) {
      urls.push(currentUrl.replace('/es/', '/'));
      urls.push(currentUrl.replace('/es/', '/en/'));
    } else {
      urls.push(`/en${currentUrl}`);
      urls.push(`/es${currentUrl}`);
    }
    
    return urls;
  }

  /**
   * CONTENT-BASED LINK GENERATION
   */
  
  private static generateContentBasedLinks(
    pageUrl: string,
    content: string,
    language: 'pt' | 'en' | 'es'
  ): InternalLink[] {
    
    const suggestions: InternalLink[] = [];
    
    // Keyword-based suggestions
    const keywordMap = this.getKeywordToUrlMap(language);
    
    Object.entries(keywordMap).forEach(([keyword, urls]) => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        urls.forEach(url => {
          if (url !== pageUrl) {
            suggestions.push({
              url,
              anchor: this.generateContextualAnchor(keyword, language),
              context: 'inline',
              priority: 'medium',
              relationship: 'related'
            });
          }
        });
      }
    });
    
    return suggestions.slice(0, 5); // Limit suggestions
  }

  private static getKeywordToUrlMap(language: 'pt' | 'en' | 'es'): {[key: string]: string[]} {
    const maps = {
      pt: {
        'passagem': ['/voos-brasil-eua', '/cotacao/voos'],
        'voo': ['/voos-brasil-eua', '/voos-miami-sao-paulo'],
        'hotel': ['/hoteis-brasil', '/cotacao/hoteis'],
        'hospedagem': ['/hoteis-brasil'],
        'seguro viagem': ['/seguro-viagem-brasil'],
        'carro': ['/aluguel-carros-brasil'],
        'Rio de Janeiro': ['/cidade/rio-de-janeiro', '/voos-new-york-rio-janeiro'],
        'São Paulo': ['/cidade/sao-paulo', '/voos-miami-sao-paulo'],
        'Miami': ['/voos-miami-sao-paulo', '/cidade/miami'],
        'Nova York': ['/voos-new-york-rio-janeiro', '/cidade/new-york']
      },
      en: {
        'flight': ['/en/flights-to-brazil', '/flights'],
        'hotel': ['/en/brazil-hotels', '/hotels'],
        'travel insurance': ['/en/travel-insurance-brazil'],
        'car rental': ['/en/car-rental-brazil'],
        'Brazil': ['/en/brazil-travel-guide', '/en/flights-to-brazil']
      },
      es: {
        'vuelo': ['/es/vuelos-brasil', '/vuelos'],
        'hotel': ['/es/hoteles-brasil', '/hoteles'],
        'seguro de viaje': ['/es/seguro-viaje-brasil'],
        'alquiler de coches': ['/es/alquiler-autos-brasil']
      }
    };
    
    return maps[language] || maps.pt;
  }

  private static generateContextualAnchor(keyword: string, language: 'pt' | 'en' | 'es'): string {
    const templates = {
      pt: [
        `Saiba mais sobre ${keyword}`,
        `Encontre os melhores ${keyword}`,
        `${keyword} com desconto`,
        `Guia completo de ${keyword}`
      ],
      en: [
        `Learn more about ${keyword}`,
        `Find the best ${keyword}`,
        `${keyword} deals`,
        `Complete ${keyword} guide`
      ],
      es: [
        `Aprende más sobre ${keyword}`,
        `Encuentra los mejores ${keyword}`,
        `Ofertas de ${keyword}`,
        `Guía completa de ${keyword}`
      ]
    };
    
    const langTemplates = templates[language] || templates.pt;
    return langTemplates[Math.floor(Math.random() * langTemplates.length)];
  }

  /**
   * CLUSTER-BASED LINK GENERATION
   */
  
  private static generateClusterBasedLinks(pageUrl: string, pageType: string): InternalLink[] {
    const suggestions: InternalLink[] = [];
    
    // Find relevant clusters
    const clusters = TopicClusterManager.brazilTravelClusters;
    
    for (const cluster of clusters) {
      // Check if current page is part of this cluster
      if (cluster.pillarPage.url === pageUrl) {
        // Link to cluster content
        cluster.clusterContent.forEach(content => {
          suggestions.push({
            url: content.url,
            anchor: content.title,
            context: 'sidebar',
            priority: 'high',
            relationship: 'child'
          });
        });
      } else if (cluster.clusterContent.some(content => content.url === pageUrl)) {
        // Link back to pillar
        suggestions.push({
          url: cluster.pillarPage.url,
          anchor: cluster.pillarPage.title,
          context: 'contextual',
          priority: 'high',
          relationship: 'parent'
        });
      }
    }
    
    return suggestions;
  }

  /**
   * LINK OPTIMIZATION AND FILTERING
   */
  
  private static optimizeLinkSelection(links: InternalLink[]): InternalLink[] {
    // Remove duplicates
    const uniqueLinks = links.filter((link, index, self) =>
      index === self.findIndex(l => l.url === link.url && l.anchor === link.anchor)
    );
    
    // Sort by priority
    const sortedLinks = uniqueLinks.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    // Apply limits
    return sortedLinks.slice(0, this.config.maxLinksPerPage);
  }

  private static mapRulePriorityToLinkPriority(rulePriority: number): 'high' | 'medium' | 'low' {
    if (rulePriority >= 8) return 'high';
    if (rulePriority >= 5) return 'medium';
    return 'low';
  }

  /**
   * LINK SUGGESTIONS API
   */
  
  static generateLinkingSuggestions(
    pageUrl: string,
    pageContent: string,
    pageType: string,
    language: 'pt' | 'en' | 'es' = 'pt'
  ): LinkingSuggestion[] {
    
    const suggestions: LinkingSuggestion[] = [];
    
    // Generate automatic links
    const autoLinks = this.generateAutoLinks(pageUrl, pageContent, pageType, language);
    
    autoLinks.forEach(link => {
      suggestions.push({
        fromUrl: pageUrl,
        toUrl: link.url,
        anchorText: link.anchor,
        confidence: this.calculateLinkConfidence(link, pageContent),
        reason: this.generateLinkReason(link, pageContent),
        placement: link.context,
        priority: link.priority
      });
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private static calculateLinkConfidence(link: InternalLink, content: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on relationship
    if (link.relationship === 'parent' || link.relationship === 'child') {
      confidence += 0.3;
    } else if (link.relationship === 'sibling') {
      confidence += 0.2;
    }
    
    // Increase confidence if anchor text appears in content
    if (content.toLowerCase().includes(link.anchor.toLowerCase().split(' ')[0])) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  private static generateLinkReason(link: InternalLink, content: string): string {
    const reasons = {
      'parent': 'Links to main topic page',
      'child': 'Links to detailed content',
      'sibling': 'Links to related content',
      'related': 'Contextually relevant'
    };
    
    return reasons[link.relationship] || 'Automatically suggested';
  }

  /**
   * CONFIGURATION METHODS
   */
  
  static updateConfig(newConfig: Partial<AutoLinkingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  static addCustomRule(rule: LinkingRule): void {
    this.linkingRules.push(rule);
  }

  static removeRule(ruleId: string): void {
    this.linkingRules = this.linkingRules.filter(rule => rule.id !== ruleId);
  }

  static getActiveRules(): LinkingRule[] {
    return this.linkingRules.filter(rule => rule.active);
  }
}

export default AutomatedLinkingSystem;