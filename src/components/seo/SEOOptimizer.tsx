/**
 * SEO Optimizer Component
 * Integrates all SEO systems and provides real-time optimization
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CoreWebVitalsOptimizer from '@/lib/seo/core-web-vitals';
import AdvancedSchemaGenerator from '@/lib/seo/advanced-schema';
import InternationalSEOManager from '@/lib/seo/international-seo';
import SEOAutomationEngine from '@/lib/seo/seo-automation';
import AIContentGenerator from '@/lib/seo/content-generator';

interface SEOOptimizerProps {
  language?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    type?: 'route' | 'destination' | 'blog' | 'landing';
  };
  routeData?: {
    from: string;
    to: string;
    distance: number;
    duration: string;
    airlines: string[];
    averagePrice: number;
  };
  autoOptimize?: boolean;
}

export default function SEOOptimizer({
  language = 'pt-BR',
  metadata,
  routeData,
  autoOptimize = true
}: SEOOptimizerProps) {
  const pathname = usePathname();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (autoOptimize) {
      initializeOptimization();
    }
  }, [pathname, language, autoOptimize]);

  const initializeOptimization = async (): Promise<void> => {
    setIsOptimizing(true);
    
    try {
      // Initialize all SEO systems
      const webVitalsOptimizer = CoreWebVitalsOptimizer.getInstance();
      const schemaGenerator = AdvancedSchemaGenerator.getInstance();
      const internationalSEO = InternationalSEOManager.getInstance();
      const automationEngine = SEOAutomationEngine.getInstance();
      const contentGenerator = AIContentGenerator.getInstance();

      // Start Core Web Vitals monitoring
      webVitalsOptimizer.initializePerformanceMonitoring();
      
      // Generate and inject advanced schema markup
      await injectAdvancedSchemas(schemaGenerator);
      
      // Setup international SEO
      internationalSEO.injectInternationalSEO(pathname, language);
      
      // Initialize automation engine
      if (process.env.NODE_ENV === 'production') {
        await automationEngine.initialize();
      }
      
      // Generate real-time content optimizations
      if (routeData && metadata) {
        await optimizeRouteContent(contentGenerator);
      }
      
      // Calculate optimization score
      const score = await calculateOptimizationScore(webVitalsOptimizer);
      setOptimizationScore(score.score);
      setRecommendations(score.details.recommendations || []);

    } catch (error) {
      console.error('SEO optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const injectAdvancedSchemas = async (schemaGenerator: AdvancedSchemaGenerator) => {
    // Travel Agency Schema (Global)
    const travelAgencySchema = schemaGenerator.generateTravelAgencySchema();
    schemaGenerator.injectSchema(travelAgencySchema, 'travel-agency-schema');

    // Route-specific schemas
    if (routeData) {
      const flightRouteSchema = schemaGenerator.generateFlightRouteSchema({
        departure: {
          airport: `${routeData.from} International Airport`,
          city: routeData.from,
          country: routeData.from.includes('Miami') ? 'US' : 'BR',
          iataCode: routeData.from.includes('Miami') ? 'MIA' : 'GRU',
          coordinates: routeData.from.includes('Miami') ? [25.7617, -80.1918] : [-23.4356, -46.4731]
        },
        arrival: {
          airport: `${routeData.to} International Airport`,
          city: routeData.to,
          country: routeData.to.includes('São Paulo') ? 'BR' : 'US',
          iataCode: routeData.to.includes('São Paulo') ? 'GRU' : 'MIA',
          coordinates: routeData.to.includes('São Paulo') ? [-23.4356, -46.4731] : [25.7617, -80.1918]
        },
        distance: routeData.distance,
        duration: routeData.duration,
        airlines: routeData.airlines,
        averagePrice: {
          economy: routeData.averagePrice,
          premium: routeData.averagePrice * 1.5,
          business: routeData.averagePrice * 2.5
        },
        currency: 'USD'
      });
      schemaGenerator.injectSchema(flightRouteSchema, 'flight-route-schema');
    }

    // FAQ Schema for travel questions
    const faqSchema = schemaGenerator.generateTravelFAQSchema();
    schemaGenerator.injectSchema(faqSchema, 'travel-faq-schema');

    // Real-time pricing schema
    if (routeData) {
      const pricingSchema = schemaGenerator.generatePricingSchema(
        `${routeData.from}-${routeData.to}`,
        {
          min: Math.round(routeData.averagePrice * 0.8),
          max: Math.round(routeData.averagePrice * 1.3),
          count: 25
        }
      );
      schemaGenerator.injectSchema(pricingSchema, 'pricing-schema');
    }

    // Breadcrumb schema
    const breadcrumbSchema = generateBreadcrumbSchema(pathname);
    schemaGenerator.injectSchema(breadcrumbSchema, 'breadcrumb-schema');
  };

  const optimizeRouteContent = async (contentGenerator: AIContentGenerator) => {
    if (!routeData || !metadata) return;

    const template = {
      type: 'route' as const,
      language: language.split('-')[0] as 'en' | 'pt' | 'es',
      keywords: metadata.keywords || [],
      targetLength: 1200,
      tone: 'professional' as const,
      audience: language.includes('pt') ? 'brazilian-expats' as const : 'american-tourists' as const
    };

    try {
      const optimizedContent = await contentGenerator.generateRouteContent(
        {
          from: routeData.from,
          to: routeData.to,
          distance: routeData.distance,
          duration: routeData.duration,
          airlines: routeData.airlines,
          averagePrice: routeData.averagePrice,
          peakSeason: ['December', 'January', 'July'],
          attractions: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Copacabana Beach']
        },
        template
      );

      // Update page content if optimization score is high
      if (optimizedContent.seoScore > 85) {
        await updatePageContent(optimizedContent);
      }

    } catch (error) {
      console.error('Content optimization error:', error);
    }
  };

  const calculateOptimizationScore = async (webVitalsOptimizer: CoreWebVitalsOptimizer) => {
    // Get Core Web Vitals score
    const performanceScore = webVitalsOptimizer.getPerformanceScore();
    
    // Calculate content optimization score
    const contentScore = calculateContentScore();
    
    // Calculate technical SEO score
    const technicalScore = calculateTechnicalScore();
    
    // Calculate international SEO score
    const internationalScore = calculateInternationalScore();

    const overallScore = Math.round(
      (performanceScore.score * 0.3 + 
       contentScore * 0.25 + 
       technicalScore * 0.25 + 
       internationalScore * 0.2)
    );

    return {
      score: overallScore,
      details: {
        performance: performanceScore.score,
        content: contentScore,
        technical: technicalScore,
        international: internationalScore,
        recommendations: [
          ...(performanceScore.details.recommendations || []),
          ...generateContentRecommendations(contentScore),
          ...generateTechnicalRecommendations(technicalScore)
        ]
      }
    };
  };

  const calculateContentScore = (): number => {
    let score = 0;
    
    // Check title optimization
    if (metadata?.title && metadata.title.length >= 30 && metadata.title.length <= 60) {
      score += 20;
    }
    
    // Check meta description
    if (metadata?.description && metadata.description.length >= 120 && metadata.description.length <= 160) {
      score += 20;
    }
    
    // Check keywords
    if (metadata?.keywords && metadata.keywords.length >= 3) {
      score += 20;
    }
    
    // Check structured data presence
    if (document.querySelector('script[type="application/ld+json"]')) {
      score += 20;
    }
    
    // Check hreflang tags
    if (document.querySelector('link[rel="alternate"][hreflang]')) {
      score += 20;
    }
    
    return score;
  };

  const calculateTechnicalScore = (): number => {
    let score = 0;
    
    // Check canonical URL
    if (document.querySelector('link[rel="canonical"]')) {
      score += 25;
    }
    
    // Check meta viewport
    if (document.querySelector('meta[name="viewport"]')) {
      score += 25;
    }
    
    // Check SSL (always true for production)
    if (location.protocol === 'https:') {
      score += 25;
    }
    
    // Check robots meta
    if (!document.querySelector('meta[name="robots"][content*="noindex"]')) {
      score += 25;
    }
    
    return score;
  };

  const calculateInternationalScore = (): number => {
    let score = 0;
    
    // Check hreflang implementation
    const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    if (hreflangLinks.length >= 3) {
      score += 30;
    }
    
    // Check language-specific content
    if (document.documentElement.lang) {
      score += 25;
    }
    
    // Check Open Graph locale
    if (document.querySelector('meta[property="og:locale"]')) {
      score += 25;
    }
    
    // Check multi-currency support
    if (document.querySelector('[data-currency]')) {
      score += 20;
    }
    
    return score;
  };

  const generateBreadcrumbSchema = (pathname: string) => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    
    const itemListElement = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://fly2any.com"
      }
    ];

    pathSegments.forEach((segment, index) => {
      const name = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      const url = `https://fly2any.com/${pathSegments.slice(0, index + 1).join('/')}`;
      
      itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": url
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };
  };

  const updatePageContent = async (optimizedContent: any) => {
    // In a real implementation, this would update the page content
    console.log('🎯 Content optimization suggestions:', {
      seoScore: optimizedContent.seoScore,
      title: optimizedContent.title,
      readingTime: optimizedContent.readingTime
    });
  };

  const generateContentRecommendations = (score: number): string[] => {
    const recommendations = [];
    
    if (score < 80) {
      if (!metadata?.title || metadata.title.length < 30) {
        recommendations.push('Optimize page title (30-60 characters)');
      }
      
      if (!metadata?.description || metadata.description.length < 120) {
        recommendations.push('Improve meta description (120-160 characters)');
      }
      
      if (!metadata?.keywords || metadata.keywords.length < 3) {
        recommendations.push('Add more targeted keywords');
      }
    }
    
    return recommendations;
  };

  const generateTechnicalRecommendations = (score: number): string[] => {
    const recommendations = [];
    
    if (score < 90) {
      if (!document.querySelector('link[rel="canonical"]')) {
        recommendations.push('Add canonical URL');
      }
      
      if (!document.querySelector('meta[name="viewport"]')) {
        recommendations.push('Add responsive viewport meta tag');
      }
    }
    
    return recommendations;
  };

  // Development-only optimization display
  if (process.env.NODE_ENV === 'development' && isOptimizing) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        🔍 Optimizing SEO...
      </div>
    );
  }

  // Production-only performance indicator
  if (process.env.NODE_ENV === 'production' && optimizationScore > 0) {
    return (
      <div style={{ display: 'none' }}>
        {/* Hidden SEO optimization indicator */}
        <span data-seo-score={optimizationScore} data-recommendations={recommendations.length} />
      </div>
    );
  }

  return null;
}