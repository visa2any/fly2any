/**
 * BREADCRUMB NAVIGATION COMPONENT
 * SEO-optimized breadcrumb navigation with schema markup
 * Enhances user experience and search engine understanding
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { InternalLinkingOptimizer } from '@/lib/seo/internal-linking-optimizer';

export interface BreadcrumbItem {
  url: string;
  title: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  pageUrl?: string;
  className?: string;
  language?: 'pt' | 'en' | 'es';
  showHome?: boolean;
  showSchema?: boolean;
  customSeparator?: React.ReactNode;
}

export default function BreadcrumbNavigation({
  items,
  pageUrl,
  className = '',
  language = 'pt',
  showHome = true,
  showSchema = true,
  customSeparator
}: BreadcrumbNavigationProps) {
  
  // Generate breadcrumbs automatically if not provided
  const breadcrumbItems = items || (pageUrl ? InternalLinkingOptimizer.generateBreadcrumbs(pageUrl) : []);
  
  // Add home item if requested and not already present
  const finalItems: BreadcrumbItem[] = [];
  
  if (showHome && breadcrumbItems[0]?.url !== '/') {
    finalItems.push({
      url: '/',
      title: getHomeTitle(language),
      isActive: false
    });
  }
  
  finalItems.push(...breadcrumbItems.map((item, index) => ({
    ...item,
    isActive: index === breadcrumbItems.length - 1
  })));

  // Don't render if only home item or empty
  if (finalItems.length <= 1) {
    return null;
  }

  // Generate structured data for SEO
  const structuredData = showSchema ? generateBreadcrumbSchema(finalItems) : null;

  const separator = customSeparator || <ChevronRightIcon className="w-4 h-4 text-gray-400" />;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <nav 
        className={`breadcrumb-navigation ${className}`}
        aria-label={getBreadcrumbAriaLabel(language)}
        role="navigation"
      >
        <ol className="flex items-center space-x-2 text-sm">
          {finalItems.map((item, index) => (
            <li key={`${item.url}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 flex-shrink-0" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {item.isActive ? (
                <span 
                  className="font-medium text-gray-900 truncate max-w-xs"
                  aria-current="page"
                  title={item.title}
                >
                  {index === 0 && showHome ? (
                    <HomeIcon className="w-4 h-4" aria-label={item.title} />
                  ) : (
                    item.title
                  )}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200 truncate max-w-xs flex items-center"
                  title={item.title}
                >
                  {index === 0 && showHome ? (
                    <HomeIcon className="w-4 h-4" aria-label={item.title} />
                  ) : (
                    item.title
                  )}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Specialized breadcrumb components for different contexts

export function ServiceBreadcrumb({ pageUrl, language = 'pt' }: { pageUrl: string; language?: 'pt' | 'en' | 'es' }) {
  const customItems = generateServiceBreadcrumbs(pageUrl, language);
  
  return (
    <BreadcrumbNavigation 
      items={customItems}
      language={language}
      className="bg-gray-50 px-4 py-2 rounded-lg"
    />
  );
}

export function BlogBreadcrumb({ pageUrl, category, title, language = 'pt' }: { 
  pageUrl: string; 
  category?: string;
  title: string;
  language?: 'pt' | 'en' | 'es'; 
}) {
  const customItems = generateBlogBreadcrumbs(pageUrl, category, title, language);
  
  return (
    <BreadcrumbNavigation 
      items={customItems}
      language={language}
      className="mb-6"
    />
  );
}

export function CityBreadcrumb({ 
  cityId, 
  cityName, 
  country = 'Brasil',
  language = 'pt' 
}: { 
  cityId: string; 
  cityName: string; 
  country?: string;
  language?: 'pt' | 'en' | 'es'; 
}) {
  const customItems = generateCityBreadcrumbs(cityId, cityName, country, language);
  
  return (
    <BreadcrumbNavigation 
      items={customItems}
      language={language}
      className="mb-4"
    />
  );
}

// Helper functions

function getHomeTitle(language: 'pt' | 'en' | 'es'): string {
  const titles = {
    pt: 'Início',
    en: 'Home',
    es: 'Inicio'
  };
  return titles[language];
}

function getBreadcrumbAriaLabel(language: 'pt' | 'en' | 'es'): string {
  const labels = {
    pt: 'Navegação estrutural',
    en: 'Breadcrumb navigation',
    es: 'Navegación estructural'
  };
  return labels[language];
}

function generateServiceBreadcrumbs(pageUrl: string, language: 'pt' | 'en' | 'es'): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  const serviceTranslations = {
    pt: {
      'voos': 'Voos',
      'hoteis': 'Hotéis',
      'carros': 'Carros',
      'seguro': 'Seguro Viagem',
      'passeios': 'Passeios',
      'cotacao': 'Cotações'
    },
    en: {
      'flights': 'Flights',
      'hotels': 'Hotels',
      'cars': 'Car Rental',
      'insurance': 'Travel Insurance',
      'tours': 'Tours',
      'quote': 'Quotes'
    },
    es: {
      'vuelos': 'Vuelos',
      'hoteles': 'Hoteles',
      'coches': 'Coches',
      'seguro': 'Seguro de Viaje',
      'tours': 'Tours',
      'cotizacion': 'Cotizaciones'
    }
  };
  
  const translations = serviceTranslations[language];
  const segments = pageUrl.split('/').filter(Boolean);
  
  segments.forEach((segment, index) => {
    let title = translations[segment as keyof typeof translations] || 
                segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (index < segments.length - 1) {
      items.push({
        url: '/' + segments.slice(0, index + 1).join('/'),
        title
      });
    } else {
      items.push({
        url: '',
        title,
        isActive: true
      });
    }
  });
  
  return items;
}

function generateBlogBreadcrumbs(
  pageUrl: string, 
  category: string | undefined, 
  title: string, 
  language: 'pt' | 'en' | 'es'
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  const blogTitle = {
    pt: 'Blog',
    en: 'Blog',
    es: 'Blog'
  };
  
  // Add blog home
  items.push({
    url: '/blog',
    title: blogTitle[language]
  });
  
  // Add category if provided
  if (category) {
    items.push({
      url: `/blog/categoria/${category}`,
      title: category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    });
  }
  
  // Add current article (no link)
  items.push({
    url: '',
    title: title,
    isActive: true
  });
  
  return items;
}

function generateCityBreadcrumbs(
  cityId: string, 
  cityName: string, 
  country: string,
  language: 'pt' | 'en' | 'es'
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  const cityLabels = {
    pt: 'Cidades',
    en: 'Cities', 
    es: 'Ciudades'
  };
  
  // Add cities index
  items.push({
    url: `/${language === 'pt' ? 'cidades' : language === 'en' ? 'cities' : 'ciudades'}`,
    title: cityLabels[language]
  });
  
  // Add country if not default
  if (country && country !== 'Brasil' && country !== 'Brazil') {
    items.push({
      url: `/${language === 'pt' ? 'cidades' : language === 'en' ? 'cities' : 'ciudades'}/${country.toLowerCase()}`,
      title: country
    });
  }
  
  // Add current city (no link)
  items.push({
    url: '',
    title: cityName,
    isActive: true
  });
  
  return items;
}

function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
      .filter(item => !item.isActive) // Don't include current page in schema
      .map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "item": `https://fly2any.com${item.url}`
      }))
  };
}

// Enhanced breadcrumb with additional SEO features
export function SEOBreadcrumb({
  items,
  pageUrl,
  language = 'pt',
  showRichSnippet = true,
  showLastModified = false,
  lastModified
}: BreadcrumbNavigationProps & {
  showRichSnippet?: boolean;
  showLastModified?: boolean;
  lastModified?: Date;
}) {
  return (
    <div className="seo-breadcrumb-wrapper">
      <BreadcrumbNavigation
        items={items}
        pageUrl={pageUrl}
        language={language}
        showSchema={showRichSnippet}
        className="mb-2"
      />
      
      {showLastModified && lastModified && (
        <div className="text-xs text-gray-500 mt-1">
          {language === 'pt' && `Atualizado em ${lastModified.toLocaleDateString('pt-BR')}`}
          {language === 'en' && `Updated on ${lastModified.toLocaleDateString('en-US')}`}
          {language === 'es' && `Actualizado el ${lastModified.toLocaleDateString('es-ES')}`}
        </div>
      )}
    </div>
  );
}