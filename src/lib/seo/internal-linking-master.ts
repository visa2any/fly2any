/**
 * INTERNAL LINKING MASTER INTEGRATION
 * Central orchestrator for all internal linking optimization systems
 * Provides unified API for implementing comprehensive SEO strategy
 */

import { InternalLinkingOptimizer, InternalLink } from './internal-linking-optimizer';
import { TopicClusterManager, TopicCluster } from './topic-cluster-manager';
import { AnchorTextOptimizer, AnchorTextStrategy } from './anchor-text-optimizer';
import { AutomatedLinkingSystem, LinkingSuggestion } from './automated-linking-system';
import InternalLinkingAnalytics from './internal-linking-analytics';

export interface MasterLinkingConfig {
  enableAutomatedLinking: boolean;
  enableAnalytics: boolean;
  enableTopicClusters: boolean;
  maxLinksPerPage: number;
  languages: ('pt' | 'en' | 'es')[];
  trackingEnabled: boolean;
  debugMode: boolean;
}

export interface PageLinkingStrategy {
  pageUrl: string;
  pageType: string;
  language: 'pt' | 'en' | 'es';
  breadcrumbs: Array<{ url: string; title: string }>;
  contextualLinks: InternalLink[];
  clusterLinks: InternalLink[];
  recommendations: string[];
  analytics: {
    expectedCTR: number;
    seoImpact: 'high' | 'medium' | 'low';
    userEngagement: 'high' | 'medium' | 'low';
  };
}

export class InternalLinkingMaster {
  
  private static config: MasterLinkingConfig = {
    enableAutomatedLinking: true,
    enableAnalytics: true,
    enableTopicClusters: true,
    maxLinksPerPage: 15,
    languages: ['pt', 'en', 'es'],
    trackingEnabled: true,
    debugMode: false
  };

  /**
   * MASTER INITIALIZATION
   * Sets up the complete internal linking system
   */
  
  static initialize(config?: Partial<MasterLinkingConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.debugMode) {
      console.log('🔗 Internal Linking Master: Initialized with config:', this.config);
    }
    
    // Initialize analytics if enabled
    if (this.config.enableAnalytics && typeof window !== 'undefined') {
      this.setupAnalyticsTracking();
    }
  }

  /**
   * PRIMARY API: GENERATE COMPLETE PAGE STRATEGY
   * One-stop solution for any page's internal linking needs
   */
  
  static generatePageStrategy(
    pageUrl: string,
    pageContent: string = '',
    pageType: string = 'page',
    language: 'pt' | 'en' | 'es' = 'pt'
  ): PageLinkingStrategy {
    
    if (this.config.debugMode) {
      console.log(`🔗 Generating strategy for: ${pageUrl} (${pageType}, ${language})`);
    }

    // Generate breadcrumb navigation
    const breadcrumbs = InternalLinkingOptimizer.generateBreadcrumbs(pageUrl);
    
    // Generate contextual links
    let contextualLinks: InternalLink[] = [];
    if (this.config.enableAutomatedLinking) {
      contextualLinks = AutomatedLinkingSystem.generateAutoLinks(
        pageUrl, 
        pageContent, 
        pageType, 
        language
      );
    }
    
    // Generate topic cluster links
    let clusterLinks: InternalLink[] = [];
    if (this.config.enableTopicClusters) {
      clusterLinks = this.generateClusterLinks(pageUrl, pageType);
    }
    
    // Merge and optimize links
    const allLinks = [...contextualLinks, ...clusterLinks];
    const optimizedLinks = this.optimizeLinks(allLinks);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      pageUrl, 
      optimizedLinks, 
      pageContent
    );
    
    // Calculate analytics predictions
    const analytics = this.predictAnalytics(optimizedLinks, pageType);
    
    return {
      pageUrl,
      pageType,
      language,
      breadcrumbs,
      contextualLinks: optimizedLinks.filter(link => 
        contextualLinks.some(cl => cl.url === link.url)
      ),
      clusterLinks: optimizedLinks.filter(link => 
        clusterLinks.some(cl => cl.url === link.url)
      ),
      recommendations,
      analytics
    };
  }

  /**
   * SPECIALIZED GENERATORS
   */
  
  static generateServicePageLinks(serviceType: string, language: 'pt' | 'en' | 'es' = 'pt'): InternalLink[] {
    return InternalLinkingOptimizer.generateServicePageLinks(serviceType);
  }

  static generateCityPageLinks(cityId: string, language: 'pt' | 'en' | 'es' = 'pt'): InternalLink[] {
    return InternalLinkingOptimizer.generateCityLinks('city', 10);
  }

  static generateBlogPostLinks(
    postUrl: string, 
    postContent: string, 
    language: 'pt' | 'en' | 'es' = 'pt'
  ): InternalLink[] {
    return AutomatedLinkingSystem.generateAutoLinks(postUrl, postContent, 'blog', language);
  }

  /**
   * TOPIC CLUSTER INTEGRATION
   */
  
  private static generateClusterLinks(pageUrl: string, pageType: string): InternalLink[] {
    const clusterLinks: InternalLink[] = [];
    
    TopicClusterManager.brazilTravelClusters.forEach(cluster => {
      // Check if current page is the pillar page
      if (cluster.pillarPage.url === pageUrl) {
        cluster.clusterContent.forEach(content => {
          clusterLinks.push({
            url: content.url,
            anchor: content.title,
            context: 'sidebar',
            priority: 'high',
            relationship: 'child'
          });
        });
      }
      
      // Check if current page is cluster content
      const isClusterContent = cluster.clusterContent.some(content => content.url === pageUrl);
      if (isClusterContent) {
        // Link back to pillar
        clusterLinks.push({
          url: cluster.pillarPage.url,
          anchor: cluster.pillarPage.title,
          context: 'contextual',
          priority: 'high',
          relationship: 'parent'
        });
        
        // Link to sibling content (limited)
        const siblings = cluster.clusterContent
          .filter(content => content.url !== pageUrl)
          .slice(0, 3);
          
        siblings.forEach(sibling => {
          clusterLinks.push({
            url: sibling.url,
            anchor: sibling.title,
            context: 'sidebar',
            priority: 'medium',
            relationship: 'sibling'
          });
        });
      }
    });
    
    return clusterLinks;
  }

  /**
   * LINK OPTIMIZATION
   */
  
  private static optimizeLinks(links: InternalLink[]): InternalLink[] {
    // Remove duplicates
    const uniqueLinks = links.filter((link, index, self) =>
      index === self.findIndex(l => l.url === link.url)
    );
    
    // Sort by priority and relationship
    const sortedLinks = uniqueLinks.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const relationshipOrder = { 'parent': 4, 'child': 3, 'sibling': 2, 'related': 1 };
      
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      const aRelationship = relationshipOrder[a.relationship];
      const bRelationship = relationshipOrder[b.relationship];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return bRelationship - aRelationship;
    });
    
    // Limit to max links per page
    return sortedLinks.slice(0, this.config.maxLinksPerPage);
  }

  /**
   * RECOMMENDATIONS ENGINE
   */
  
  private static generateRecommendations(
    pageUrl: string, 
    links: InternalLink[], 
    pageContent: string
  ): string[] {
    const recommendations: string[] = [];
    
    // Check link count
    if (links.length < 3) {
      recommendations.push('Add more internal links to improve SEO and navigation');
    } else if (links.length > 20) {
      recommendations.push('Consider reducing link count to avoid overwhelming users');
    }
    
    // Check link diversity
    const contexts = new Set(links.map(link => link.context));
    if (contexts.size < 2) {
      recommendations.push('Diversify link placement (header, content, sidebar, footer)');
    }
    
    // Check for service links
    const hasServiceLinks = links.some(link => 
      link.url.includes('voos') || 
      link.url.includes('hoteis') || 
      link.url.includes('flights') ||
      link.url.includes('hotels')
    );
    
    if (!hasServiceLinks && !pageUrl.includes('voos') && !pageUrl.includes('hoteis')) {
      recommendations.push('Add links to main service pages to improve conversion potential');
    }
    
    // Check for blog content links
    if (pageUrl.includes('blog')) {
      const hasRelatedPosts = links.some(link => link.url.includes('blog'));
      if (!hasRelatedPosts) {
        recommendations.push('Add links to related blog posts to increase engagement');
      }
    }
    
    // Check anchor text variety
    const anchors = links.map(link => link.anchor.toLowerCase());
    const uniqueAnchors = new Set(anchors);
    if (uniqueAnchors.size < anchors.length * 0.8) {
      recommendations.push('Increase anchor text diversity to avoid over-optimization');
    }
    
    return recommendations;
  }

  /**
   * ANALYTICS PREDICTIONS
   */
  
  private static predictAnalytics(links: InternalLink[], pageType: string): {
    expectedCTR: number;
    seoImpact: 'high' | 'medium' | 'low';
    userEngagement: 'high' | 'medium' | 'low';
  } {
    
    // Predict CTR based on link quality and placement
    const highQualityLinks = links.filter(link => 
      link.priority === 'high' && 
      (link.context === 'inline' || link.context === 'contextual')
    ).length;
    
    const expectedCTR = Math.min(
      0.02 + (highQualityLinks * 0.01) + (links.length * 0.001), 
      0.08
    );
    
    // Predict SEO impact
    const parentChildLinks = links.filter(link => 
      link.relationship === 'parent' || link.relationship === 'child'
    ).length;
    
    let seoImpact: 'high' | 'medium' | 'low' = 'low';
    if (parentChildLinks >= 3 && links.length >= 8) {
      seoImpact = 'high';
    } else if (parentChildLinks >= 1 && links.length >= 5) {
      seoImpact = 'medium';
    }
    
    // Predict user engagement
    const contextualLinks = links.filter(link => 
      link.context === 'contextual' || link.context === 'inline'
    ).length;
    
    let userEngagement: 'high' | 'medium' | 'low' = 'low';
    if (contextualLinks >= 5) {
      userEngagement = 'high';
    } else if (contextualLinks >= 2) {
      userEngagement = 'medium';
    }
    
    return { expectedCTR, seoImpact, userEngagement };
  }

  /**
   * ANALYTICS INTEGRATION
   */
  
  private static setupAnalyticsTracking(): void {
    // Set up automatic click tracking
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a[data-internal-link]');
        
        if (link) {
          const linkData = {
            id: link.getAttribute('data-link-id') || '',
            url: link.getAttribute('href') || '',
            anchor: link.textContent || '',
            fromUrl: window.location.pathname
          };
          
          if (this.config.trackingEnabled) {
            InternalLinkingAnalytics.trackLinkClick(
              linkData.id,
              linkData.fromUrl,
              linkData.url,
              linkData.anchor
            );
          }
        }
      });
    }
  }

  /**
   * UTILITY METHODS
   */
  
  static analyzePagePerformance(pageUrl: string): {
    currentLinks: InternalLink[];
    performance: any;
    suggestions: LinkingSuggestion[];
  } {
    const suggestions = AutomatedLinkingSystem.generateLinkingSuggestions(
      pageUrl, '', 'page', 'pt'
    );
    
    return {
      currentLinks: [], // Would need to extract from page
      performance: InternalLinkingAnalytics.generateDashboardData(),
      suggestions
    };
  }

  static generateSiteWideAudit(): {
    totalPages: number;
    linkedPages: number;
    orphanedPages: number;
    averageLinksPerPage: number;
    topPerformingPages: string[];
    recommendations: string[];
  } {
    return {
      totalPages: 0, // Would calculate from sitemap
      linkedPages: 0,
      orphanedPages: 0,
      averageLinksPerPage: 0,
      topPerformingPages: [],
      recommendations: [
        'Complete site-wide internal linking audit needed',
        'Implement automated linking system',
        'Set up performance tracking'
      ]
    };
  }

  static exportConfiguration(): string {
    return JSON.stringify({
      config: this.config,
      clusters: TopicClusterManager.brazilTravelClusters.map(cluster => ({
        id: cluster.id,
        name: cluster.name,
        pillarUrl: cluster.pillarPage.url,
        contentCount: cluster.clusterContent.length
      })),
      exportDate: new Date()
    }, null, 2);
  }

  /**
   * CONFIGURATION METHODS
   */
  
  static updateConfig(newConfig: Partial<MasterLinkingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.debugMode) {
      console.log('🔗 Internal Linking Master: Config updated:', this.config);
    }
  }

  static getConfig(): MasterLinkingConfig {
    return { ...this.config };
  }

  static resetToDefaults(): void {
    this.config = {
      enableAutomatedLinking: true,
      enableAnalytics: true,
      enableTopicClusters: true,
      maxLinksPerPage: 15,
      languages: ['pt', 'en', 'es'],
      trackingEnabled: true,
      debugMode: false
    };
  }
}

/**
 * CONVENIENCE HOOKS FOR REACT COMPONENTS
 */

export function useInternalLinking(pageUrl: string, pageContent?: string, pageType?: string) {
  const [strategy, setStrategy] = React.useState<PageLinkingStrategy | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const generateStrategy = async () => {
      setLoading(true);
      
      const pageStrategy = InternalLinkingMaster.generatePageStrategy(
        pageUrl,
        pageContent || '',
        pageType || 'page',
        'pt' // Could detect from locale
      );
      
      setStrategy(pageStrategy);
      setLoading(false);
    };
    
    generateStrategy();
  }, [pageUrl, pageContent, pageType]);
  
  return { strategy, loading };
}

export default InternalLinkingMaster;