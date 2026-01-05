/**
 * HREFLANG TAGS COMPONENT FOR MULTILINGUAL SEO
 * 
 * Generates hreflang tags for multilingual site versions
 * Supports pt-BR (Portuguese - Brazil) and es-ES (Spanish - Spain)
 * 
 * @version 1.0.0
 */

'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface HreflangTagsProps {
  /**
   * Custom base URL (defaults to process.env.NEXT_PUBLIC_APP_URL)
   */
  baseUrl?: string;
  
  /**
   * Supported languages with their locale codes
   */
  languages?: Array<{
    code: string;
    locale: string;
    urlPrefix: string;
  }>;
  
  /**
   * Whether to include x-default tag
   */
  includeXDefault?: boolean;
}

/**
 * HreflangTags Component
 * 
 * Automatically generates hreflang tags for current page in all supported languages
 * 
 * Usage:
 * <head>
 *   <HreflangTags />
 * </head>
 */
export function HreflangTags({
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com',
  languages = [
    { code: 'en', locale: 'en-US', urlPrefix: '' },
    { code: 'pt', locale: 'pt-BR', urlPrefix: '/pt' },
    { code: 'es', locale: 'es-ES', urlPrefix: '/es' }
  ],
  includeXDefault = true
}: HreflangTagsProps) {
  const pathname = usePathname();
  
  const hreflangTags = useMemo(() => {
    const tags: Array<{ href: string; hreflang: string }> = [];
    
    // Generate hreflang for each language
    languages.forEach(({ locale, urlPrefix }) => {
      // Determine the path for this language
      let localizedPath = pathname;
      
      // Remove existing language prefix if present
      languages.forEach(lang => {
        if (pathname.startsWith(lang.urlPrefix) && lang.urlPrefix) {
          localizedPath = pathname.replace(lang.urlPrefix, '') || '/';
        }
      });
      
      // Add language prefix if needed
      const finalPath = urlPrefix ? `${urlPrefix}${localizedPath}` : localizedPath;
      const url = `${baseUrl}${finalPath}`.replace(/\/$/, '');
      
      tags.push({
        href: url,
        hreflang: locale
      });
    });
    
    // Add x-default (usually the default/English version)
    if (includeXDefault) {
      const defaultLang = languages.find(lang => !lang.urlPrefix) || languages[0];
      let defaultPath = pathname;
      
      // Remove any language prefix for x-default
      languages.forEach(lang => {
        if (pathname.startsWith(lang.urlPrefix) && lang.urlPrefix) {
          defaultPath = pathname.replace(lang.urlPrefix, '') || '/';
        }
      });
      
      const xDefaultUrl = `${baseUrl}${defaultPath}`.replace(/\/$/, '');
      tags.push({
        href: xDefaultUrl,
        hreflang: 'x-default'
      });
    }
    
    return tags;
  }, [pathname, baseUrl, languages, includeXDefault]);
  
  return (
    <>
      {hreflangTags.map(({ href, hreflang }) => (
        <link
          key={hreflang}
          rel="alternate"
          href={href}
          hrefLang={hreflang}
        />
      ))}
    </>
  );
}

/**
 * Server-side Hreflang component (for static generation)
 */
export function StaticHreflangTags({
  currentPath = '/',
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'
}: {
  currentPath?: string;
  baseUrl?: string;
}) {
  const languages = [
    { code: 'en', locale: 'en-US', urlPrefix: '' },
    { code: 'pt', locale: 'pt-BR', urlPrefix: '/pt' },
    { code: 'es', locale: 'es-ES', urlPrefix: '/es' }
  ];
  
  return (
    <>
      {languages.map(({ locale, urlPrefix }) => {
        // Determine the path for this language
        let localizedPath = currentPath;
        
        // Remove existing language prefix if present
        languages.forEach(lang => {
          if (currentPath.startsWith(lang.urlPrefix) && lang.urlPrefix) {
            localizedPath = currentPath.replace(lang.urlPrefix, '') || '/';
          }
        });
        
        // Add language prefix if needed
        const finalPath = urlPrefix ? `${urlPrefix}${localizedPath}` : localizedPath;
        const url = `${baseUrl}${finalPath}`.replace(/\/$/, '');
        
        return (
          <link
            key={locale}
            rel="alternate"
            href={url}
            hrefLang={locale}
          />
        );
      })}
      
      {/* x-default tag */}
      <link
        rel="alternate"
        href={`${baseUrl}${currentPath}`.replace(/\/$/, '')}
        hrefLang="x-default"
      />
    </>
  );
}

export default HreflangTags;
