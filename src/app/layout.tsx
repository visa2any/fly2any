import React from 'react';
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

// ULTRATHINK: Force dynamic rendering globally to prevent DataCloneError
export const dynamic = 'force-dynamic';

import Image from "next/image";
import { Providers } from "@/components/providers";
// ULTRATHINK ENTERPRISE: Advanced hydration safety components
// import HydrationErrorBoundary from "@/components/enterprise/HydrationErrorBoundary";
// import HydrationValidator from "@/components/enterprise/HydrationValidator";
import GlobalMobileStyles from "@/components/GlobalMobileStyles";
// AI 2025 SEO OPTIMIZATION COMPONENTS
import AI2025SearchOptimizer from "@/components/seo/AI2025SearchOptimizer";
// import UltraThinkReactPatch from "@/components/UltraThinkReactPatch";
// import "@/lib/enterprise/HydrationMonitor"; // Auto-initialize monitoring
import "./globals.css";

// Enhanced font loading with network timeout handling for production builds
// Always load fonts but with aggressive fallbacks and timeout handling
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Better for production builds - prevents font request blocking
  variable: "--font-inter",
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: false, // Prevent layout shift on font load failure
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Better for production builds - prevents font request blocking
  variable: "--font-poppins",
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fly2any.com'),
  title: "Fly2Any - Brazil Travel Specialists | Expert Flights, Hotels & Tours to Brazil",
  description: "🇧🇷 Expert travel agency specializing in Brazil trips since 2014. Affordable flights, premium hotels, rental cars, guided tours & travel insurance. 10+ years experience serving Americans, Latinos, and Brazilians. Free quote in 2 hours! ✈️🏨🚗",
  keywords: "flights to brazil, brazil travel experts, brazil vacation packages, travel to brazil from usa, brazil travel specialists, voos brasil baratos, viajes brasil económicos, passagens aereas promocionais, how to travel to brazil, best time to visit brazil, brazil travel guide, são paulo flights, rio de janeiro hotels, brazil travel insurance, fly2any reviews, american travel to brazil, brazilian diaspora travel, miami to brazil flights, new york to brazil",
  authors: [{ name: "Fly2Any" }],
  creator: "Fly2Any",
  publisher: "Fly2Any",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fly2any.com",
    siteName: "Fly2Any - Brazil Travel Specialists",
    title: "Fly2Any - Brazil Travel Specialists | Expert Trips to Brazil",
    description: "Specialized travel agency for trips to Brazil. Expert service for Americans, Latinos, and Brazilians traveling to Brazil.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Fly2Any - Brazil Travel Specialists",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fly2Any - Brazil Travel Specialists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fly2Any - Brazil Travel Specialists | Expert Trips to Brazil",
    description: "Specialized travel agency for trips to Brazil. Free quote in 2 hours!",
    images: ["/og-image.webp"],
  },
  alternates: {
    canonical: "https://fly2any.com",
    languages: {
      'en-US': 'https://fly2any.com/en',
      'pt-BR': 'https://fly2any.com/pt',
      'es-419': 'https://fly2any.com/es',
      'x-default': 'https://fly2any.com',
    },
  },
  other: {
    "google-site-verification": "googlee27e970cfffea3f0",
    // AI 2025 OPTIMIZATION META TAGS
    "chatgpt-content-type": "travel-information",
    "ai-citation-ready": "true",
    "perplexity-optimized": "true",
    "google-sge-enhanced": "true",
    "llm-friendly": "true",
    "voice-search-optimized": "true",
    "ai-content-authority": "travel-expert-brazil",
    "expertise-verification": "10-years-experience",
    "community-validated": "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#FFFFFF" />

        {/* ULTRATHINK: Font Loading Protection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ULTRATHINK: Enhanced font loading protection
              (function() {
                console.log('🔤 [ULTRATHINK] Font loading protection initialized');

                // Immediate font fallback application
                const applyFontFallback = function() {
                  if (document.documentElement) {
                    document.documentElement.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    document.documentElement.classList.add('font-loading-fallback');
                    console.log('🔤 [ULTRATHINK] Font fallback applied');
                  }
                };

                // Apply fallback immediately
                applyFontFallback();

                // Global error interceptor for font issues
                window.addEventListener('error', function(e) {
                  if (e.error && (
                    e.error.message.includes('font') ||
                    e.error.message.includes('FontFace') ||
                    e.error.message.includes('network') ||
                    e.message && e.message.includes('font')
                  )) {
                    console.warn('🔤 [ULTRATHINK] Font loading error intercepted:', e.error ? e.error.message : e.message);
                    applyFontFallback();
                    e.preventDefault();
                    return false;
                  }

                  // Handle webpack errors
                  if (e.error && e.error.message && e.error.message.includes('originalFactory')) {
                    console.warn('🛠️ [ULTRATHINK] originalFactory error intercepted:', e.error.message);
                    e.preventDefault();
                    return false;
                  }
                });

                // Aggressive font loading timeout protection
                setTimeout(function() {
                  console.warn('🔤 [ULTRATHINK] Font loading timeout (1s), applying fallback');
                  applyFontFallback();
                }, 1000); // Reduced to 1 second for development speed

                setTimeout(function() {
                  if (document.fonts && document.fonts.status !== 'loaded') {
                    console.warn('🔤 [ULTRATHINK] Font loading timeout (3s), ensuring fallback');
                    applyFontFallback();
                  }
                }, 3000);

                // Enhanced font loading monitoring
                if (document.fonts) {
                  document.fonts.ready.catch(function() {
                    console.warn('🔤 [ULTRATHINK] Font loading failed, applying fallback');
                    applyFontFallback();
                  });
                }
              })();
            `,
          }}
        />

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && process.env.NEXT_PUBLIC_GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <script 
              async 
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_location: window.location.href,
                    page_title: document.title,
                    send_page_view: true
                  });
                `,
              }}
            />
          </>
        )}

        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && 
         process.env.NEXT_PUBLIC_FB_PIXEL_ID !== 'null' && 
         process.env.NEXT_PUBLIC_FB_PIXEL_ID !== 'XXXXXXXXXX' && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <Image 
                height={1} 
                width={1} 
                style={{display: 'none'}}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && 
         process.env.NEXT_PUBLIC_CLARITY_ID !== 'XXXXXXXXXX' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}

        {/* Google Ads Conversion Tracking */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && 
         process.env.NEXT_PUBLIC_GOOGLE_ADS_ID !== 'AW-XXXXXXXXXX' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.gtag = window.gtag || function(){(window.dataLayer = window.dataLayer || []).push(arguments)};
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}', {
                  allow_enhanced_conversions: true,
                  conversion_linker: true
                });
              `,
            }}
          />
        )}

        {/* Microsoft Advertising (Bing) UET */}
        {process.env.NEXT_PUBLIC_BING_UET_ID && 
         process.env.NEXT_PUBLIC_BING_UET_ID !== 'XXXXXXXXXX' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,t,r,u){
                  var f,n,i;
                  w[u]=w[u]||[],f=function(){
                    var o={ti:"${process.env.NEXT_PUBLIC_BING_UET_ID}"};
                    o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")
                  },n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){
                    var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)
                  },i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)
                })(window,document,"script","//bat.bing.com/bat.js","uetq");
              `,
            }}
          />
        )}

        {/* ULTRATHINK: Desktop scrolling protection - Fixed DOM access */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ULTRATHINK: Desktop height protection shield
              (function() {
                if (typeof window !== 'undefined') {
                  function protectDesktopScrolling() {
                    // Only apply on desktop (width > 768px)
                    if (window.innerWidth > 768) {
                      // Safely check if document elements exist before accessing
                      if (document.documentElement && document.body) {
                        const html = document.documentElement;
                        const body = document.body;
                        
                        // Remove any inline styles that constrain height
                        if (html.style.height === '100vh' || html.style.minHeight === '100vh') {
                          html.style.height = 'auto';
                          html.style.minHeight = 'auto';
                          html.style.maxHeight = 'none';
                        }
                        
                        if (body.style.height === '100vh' || body.style.minHeight === '100vh') {
                          body.style.height = 'auto';
                          body.style.minHeight = 'auto';
                          body.style.maxHeight = 'none';
                        }
                      }
                    }
                  }
                  
                  // Run after DOM loads
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', protectDesktopScrolling);
                  } else {
                    // DOM is already loaded
                    protectDesktopScrolling();
                  }
                  
                  // Run after React hydration with safety checks
                  setTimeout(function() {
                    if (document.documentElement && document.body) {
                      protectDesktopScrolling();
                    }
                  }, 1000);
                  
                  setTimeout(function() {
                    if (document.documentElement && document.body) {
                      protectDesktopScrolling();
                    }
                  }, 3000);
                  
                  setTimeout(function() {
                    if (document.documentElement && document.body) {
                      protectDesktopScrolling();
                    }
                  }, 5000);
                  
                  // Monitor for changes with safety checks
                  if (window.MutationObserver && document.documentElement && document.body) {
                    const observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && 
                            mutation.attributeName === 'style' &&
                            window.innerWidth > 768 &&
                            document.documentElement && 
                            document.body) {
                          protectDesktopScrolling();
                        }
                      });
                    });
                    
                    observer.observe(document.documentElement, { 
                      attributes: true, 
                      attributeFilter: ['style'] 
                    });
                    observer.observe(document.body, { 
                      attributes: true, 
                      attributeFilter: ['style'] 
                    });
                  }
                }
              })();
            `,
          }}
        />
        
        {/* Initialize Tracking Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('DOMContentLoaded', function() {
                if (typeof window !== 'undefined') {
                  try {
                    // Initialize tracking only if we have at least one pixel configured
                    const hasPixels = '${process.env.NEXT_PUBLIC_GA_ID || ''}' || 
                                     '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''}' || 
                                     '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''}';
                    
                    if (hasPixels) {
                      import('/src/lib/tracking.js').then(module => {
                        if (module && module.tracking) {
                          module.tracking.initialize();
                          console.log('🎯 Tracking initialized successfully');
                        }
                      }).catch(error => {
                        console.warn('Tracking initialization failed:', error);
                      });
                    } else {
                      console.debug('📊 No tracking pixels configured - skipping initialization');
                    }
                  } catch (error) {
                    console.warn('Tracking setup error:', error);
                  }
                }
              });
            `,
          }}
        />
        {/* Schema.org Organization Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["TravelAgency", "LocalBusiness", "Organization"],
              "name": "Fly2Any - Brazil Travel Specialists",
              "alternateName": ["Fly2Any", "Brazil Travel Experts", "Especialistas Brasil"],
              "description": {
                "en": "Expert travel agency specializing in trips to Brazil for over 10 years. Flights, hotels, cars, travel insurance and tours.",
                "pt": "Especialistas em viagens para o Brasil há mais de 10 anos. Voos, hotéis, carros, seguro viagem e passeios.",
                "es": "Agencia de viajes especialista en Brasil por más de 10 años. Vuelos, hoteles, autos, seguro de viaje y tours."
              },
              "url": "https://fly2any.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://fly2any.com/og-image.webp",
                "width": 1200,
                "height": 630
              },
              "image": [
                "https://fly2any.com/og-image.webp",
                "https://fly2any.com/og-image.png"
              ],
              "foundingDate": "2014",
              "founder": {
                "@type": "Organization",
                "name": "Fly2Any Team"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US",
                "addressRegion": "FL",
                "addressLocality": "Miami"
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["Portuguese", "English", "Spanish"],
                  "hoursAvailable": "Mo-Su 08:00-22:00",
                  "areaServed": ["US", "BR", "MX", "AR", "CO", "PE", "CL"],
                  "description": {
                    "en": "24/7 customer support in English, Portuguese and Spanish",
                    "pt": "Atendimento 24/7 em português, inglês e espanhol", 
                    "es": "Atención al cliente 24/7 en español, portugués e inglés"
                  }
                },
                {
                  "@type": "ContactPoint",
                  "contactType": "sales",
                  "availableLanguage": ["Portuguese", "English", "Spanish"],
                  "hoursAvailable": "Mo-Su 08:00-22:00",
                  "areaServed": ["US", "BR", "LATAM"],
                  "description": "Brazil travel specialists and booking experts"
                }
              ],
              "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": 25.7617,
                  "longitude": -80.1918
                },
                "geoRadius": "10000"
              },
              "areaServed": [
                {
                  "@type": "Country",
                  "name": "Brazil",
                  "@id": "https://www.wikidata.org/wiki/Q155"
                },
                {
                  "@type": "Country", 
                  "name": "United States",
                  "@id": "https://www.wikidata.org/wiki/Q30"
                }
              ],
              "serviceType": [
                {
                  "en": ["Flight Bookings", "Hotel Reservations", "Car Rentals", "Travel Insurance", "Tour Packages", "Travel Assistance"],
                  "pt": ["Passagens Aéreas", "Reservas de Hotel", "Aluguel de Carros", "Seguro Viagem", "Passeios Turísticos", "Assistência de Viagem"],
                  "es": ["Reservas de Vuelos", "Reservas de Hoteles", "Alquiler de Autos", "Seguro de Viaje", "Paquetes Turísticos", "Asistencia de Viaje"]
                }
              ],
              "specialty": {
                "en": "Brazil destination expertise and cultural knowledge",
                "pt": "Especialização em destinos Brasil e conhecimento cultural", 
                "es": "Especialización en destinos de Brasil y conocimiento cultural"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Serviços de Viagem Fly2Any",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "name": "Voos Miami-São Paulo",
                    "url": "https://fly2any.com/voos-miami-sao-paulo",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Passagens Aéreas Miami-São Paulo",
                      "description": "Voos diretos e com conexão entre Miami e São Paulo"
                    }
                  },
                  {
                    "@type": "Offer",
                    "name": "Voos New York-Rio de Janeiro",
                    "url": "https://fly2any.com/voos-new-york-rio-janeiro",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Passagens Aéreas New York-Rio de Janeiro",
                      "description": "Voos diretos e com conexão entre New York e Rio de Janeiro"
                    }
                  },
                  {
                    "@type": "Offer",
                    "name": "Hotéis no Brasil",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Reservas de Hotéis Brasil",
                      "description": "Reservas de hotéis em todo o território brasileiro"
                    }
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Maria Silva"
                  },
                  "reviewBody": "Excelente atendimento, conseguiram um preço incrível para minha viagem ao Brasil!",
                  "datePublished": "2024-06-15"
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "João Santos"
                  },
                  "reviewBody": "Já uso há anos, sempre conseguem os melhores preços e o atendimento é impecável.",
                  "datePublished": "2024-05-20"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/fly2any",
                "https://www.instagram.com/fly2any",
                "https://www.linkedin.com/company/fly2any",
                "https://twitter.com/fly2any"
              ],
              "openingHours": [
                "Mo-Fr 09:00-18:00"
              ],
              "paymentAccepted": [
                "Credit Card",
                "Debit Card", 
                "Bank Transfer",
                "PIX"
              ],
              "currenciesAccepted": [
                "USD",
                "BRL"
              ],
              "potentialAction": [
                {
                  "@type": "SearchAction",
                  "target": "https://fly2any.com/cotacao/voos?origem={origin}&destino={destination}",
                  "query-input": [
                    "required name=origin",
                    "required name=destination"
                  ]
                }
              ],
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://fly2any.com"
              }
            }),
          }}
        />

        {/* Schema.org WebSite Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Fly2Any",
              "url": "https://fly2any.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://fly2any.com/cotacao/voos?origem={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body className="font-inter antialiased">
        <GlobalMobileStyles />
        {/* AI 2025 SEARCH OPTIMIZATION - Moved from head to body to prevent hydration error */}
        <AI2025SearchOptimizer
          enableChatGPTCitations={true}
          enablePerplexityOptimization={true}
          enableGoogleSGE={true}
          language="pt"
          businessType="travel-agency"
        />
        {/* <UltraThinkReactPatch /> */}
        <Providers>
          {/*
          <HydrationErrorBoundary
            maxRetries={3}
            retryDelay={2000}
            enableLogging={true}
          >
            <HydrationValidator
              mode="graceful"
              enablePerfMonitoring={true}
              enableDevDebugging={process.env.NODE_ENV === 'development'}
            >
              {children}
            </HydrationValidator>
          </HydrationErrorBoundary>
          */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
