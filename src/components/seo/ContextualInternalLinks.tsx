/**
 * CONTEXTUAL INTERNAL LINKS COMPONENT
 * Dynamically generates and displays internal links based on content context
 * Optimizes for SEO value and user experience
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { InternalLinkingOptimizer, InternalLink } from '@/lib/seo/internal-linking-optimizer';

interface ContextualInternalLinksProps {
  pageUrl: string;
  pageType: 'home' | 'service' | 'city' | 'blog' | 'landing' | 'neighborhood';
  content?: string;
  language?: 'pt' | 'en' | 'es';
  maxLinks?: number;
  className?: string;
  showAsCards?: boolean;
}

export default function ContextualInternalLinks({
  pageUrl,
  pageType,
  content = '',
  language = 'pt',
  maxLinks = 6,
  className = '',
  showAsCards = false
}: ContextualInternalLinksProps) {
  
  // Generate relevant internal links
  const generateRelevantLinks = (): InternalLink[] => {
    let links: InternalLink[] = [];
    
    // Page type specific links
    switch (pageType) {
      case 'home':
        links = InternalLinkingOptimizer.generateHomePageLinks();
        break;
      case 'service':
        const serviceType = pageUrl.includes('voos') || pageUrl.includes('flights') ? 'voos' :
                           pageUrl.includes('hoteis') || pageUrl.includes('hotels') ? 'hoteis' :
                           pageUrl.includes('carros') ? 'carros' : 'voos';
        links = InternalLinkingOptimizer.generateServicePageLinks(serviceType);
        break;
      case 'city':
        links = InternalLinkingOptimizer.generateCityLinks('city', maxLinks);
        break;
      case 'blog':
        links = InternalLinkingOptimizer.generateLinkingRecommendations(pageUrl, content);
        break;
      default:
        links = InternalLinkingOptimizer.generateLinkingRecommendations(pageUrl, content);
    }
    
    // Add related content suggestions
    const relatedLinks = InternalLinkingOptimizer.generateRelatedContent(pageUrl, pageType);
    links = [...links, ...relatedLinks];
    
    // Add international links if applicable
    if (language) {
      const intlLinks = InternalLinkingOptimizer.generateInternationalLinks(language, pageUrl);
      links = [...links, ...intlLinks];
    }
    
    // Remove duplicates and limit
    const uniqueLinks = links.filter((link, index, self) => 
      index === self.findIndex((l) => l.url === link.url)
    );
    
    // Sort by priority and limit
    return uniqueLinks
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, maxLinks);
  };

  const links = generateRelevantLinks();

  if (!links.length) return null;

  // Card style rendering
  const renderAsCards = () => (
    <div className={`contextual-links-cards ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {language === 'en' ? 'Related Content' : 
         language === 'es' ? 'Contenido Relacionado' : 'Conteúdo Relacionado'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, index) => (
          <Link
            key={`${link.url}-${index}`}
            href={link.url}
            className="group block bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {getLinkIcon(link.url)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600 group-hover:text-blue-800 line-clamp-2">
                  {link.anchor}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getLinkDescription(link.url, language)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  // List style rendering
  const renderAsList = () => (
    <div className={`contextual-links-list ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        {language === 'en' ? 'You might also like:' : 
         language === 'es' ? 'También te puede interesar:' : 'Você também pode gostar:'}
      </h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={`${link.url}-${index}`}>
            <Link
              href={link.url}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              <span className="mr-2">{getLinkIcon(link.url)}</span>
              <span className="font-medium">{link.anchor}</span>
              <span className="ml-2 text-gray-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  // Inline style rendering (for content)
  const renderInline = () => (
    <div className={`contextual-links-inline ${className}`}>
      {links.map((link, index) => (
        <span key={`${link.url}-${index}`} className="inline">
          <Link
            href={link.url}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium mx-1"
          >
            {link.anchor}
          </Link>
          {index < links.length - 1 && <span className="text-gray-400"> | </span>}
        </span>
      ))}
    </div>
  );

  return showAsCards ? renderAsCards() : renderAsList();
}

// Helper functions
function getLinkIcon(url: string): string {
  if (url.includes('voos') || url.includes('flights')) return '✈️';
  if (url.includes('hoteis') || url.includes('hotels')) return '🏨';
  if (url.includes('carros') || url.includes('cars')) return '🚗';
  if (url.includes('seguro') || url.includes('insurance')) return '🛡️';
  if (url.includes('passeios') || url.includes('tours')) return '🗺️';
  if (url.includes('cidade') || url.includes('city')) return '🏙️';
  if (url.includes('blog')) return '📝';
  if (url.includes('en/') || url.includes('es/')) return '🌍';
  return '📋';
}

function getLinkDescription(url: string, language: 'pt' | 'en' | 'es'): string {
  const descriptions = {
    pt: {
      flights: 'Encontre os melhores preços em passagens aéreas',
      hotels: 'Reserve hotéis com desconto exclusivo',
      cars: 'Alugue carros com as melhores tarifas',
      insurance: 'Proteja sua viagem com seguro completo',
      tours: 'Descubra experiências únicas',
      city: 'Guia completo da cidade',
      blog: 'Artigo informativo',
      international: 'Conteúdo em outro idioma'
    },
    en: {
      flights: 'Find the best airfare deals',
      hotels: 'Book hotels with exclusive discounts',
      cars: 'Rent cars at the best rates',
      insurance: 'Protect your trip with comprehensive insurance',
      tours: 'Discover unique experiences',
      city: 'Complete city guide',
      blog: 'Informative article',
      international: 'Content in another language'
    },
    es: {
      flights: 'Encuentra las mejores ofertas de vuelos',
      hotels: 'Reserva hoteles con descuentos exclusivos',
      cars: 'Alquila coches a las mejores tarifas',
      insurance: 'Protege tu viaje con seguro completo',
      tours: 'Descubre experiencias únicas',
      city: 'Guía completa de la ciudad',
      blog: 'Artículo informativo',
      international: 'Contenido en otro idioma'
    }
  };

  const langDescriptions = descriptions[language] || descriptions.pt;
  
  if (url.includes('voos') || url.includes('flights')) return langDescriptions.flights;
  if (url.includes('hoteis') || url.includes('hotels')) return langDescriptions.hotels;
  if (url.includes('carros') || url.includes('cars')) return langDescriptions.cars;
  if (url.includes('seguro') || url.includes('insurance')) return langDescriptions.insurance;
  if (url.includes('passeios') || url.includes('tours')) return langDescriptions.tours;
  if (url.includes('cidade') || url.includes('city')) return langDescriptions.city;
  if (url.includes('blog')) return langDescriptions.blog;
  if (url.includes('/en/') || url.includes('/es/')) return langDescriptions.international;
  
  return langDescriptions.blog;
}

// Specialized components for different contexts
export function InlineContextualLinks(props: ContextualInternalLinksProps) {
  return <ContextualInternalLinks {...props} showAsCards={false} className="inline-links" />;
}

export function SidebarContextualLinks(props: ContextualInternalLinksProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <ContextualInternalLinks {...props} showAsCards={false} className="sidebar-links" />
    </div>
  );
}

export function FooterContextualLinks(props: ContextualInternalLinksProps) {
  return (
    <div className="border-t pt-6 mt-8">
      <ContextualInternalLinks {...props} showAsCards={true} className="footer-links" />
    </div>
  );
}