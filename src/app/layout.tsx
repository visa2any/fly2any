import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fly2any.com'),
  title: "Fly2Any - Voos Brasil-EUA | Passagens Aéreas para Brasileiros",
  description: "Especialistas em passagens aéreas para brasileiros nos EUA. Voos, hotéis, carros, passeios e seguro viagem para o Brasil. Cotação gratuita em 2 horas!",
  keywords: "voos brasil eua, passagens aereas brasileiros, viagem brasil estados unidos, voos baratos brasil, fly2any, passagens promocionais, hotéis brasil, aluguel carro brasil, seguro viagem brasil",
  authors: [{ name: "Fly2Any" }],
  creator: "Fly2Any",
  publisher: "Fly2Any",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://fly2any.com",
    siteName: "Fly2Any",
    title: "Fly2Any - Voos Brasil-EUA | Passagens Aéreas para Brasileiros",
    description: "Especialistas em passagens aéreas para brasileiros nos EUA. Voos, hotéis, carros, passeios e seguro viagem para o Brasil.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Fly2Any - Voos Brasil-EUA",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fly2Any - Voos Brasil-EUA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fly2Any - Voos Brasil-EUA | Passagens Aéreas para Brasileiros",
    description: "Especialistas em passagens aéreas para brasileiros nos EUA. Cotação gratuita em 2 horas!",
    images: ["/og-image.webp"],
  },
  alternates: {
    canonical: "https://fly2any.com",
  },
  other: {
    "google-site-verification": "lT3RftN0whX9Y2qpcg8-1LJisCT2yVrA6-3fVSE5jHM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#1e40af" />
        
        {/* Google Analytics 4 */}
        <script 
          async 
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}', {
                page_location: window.location.href,
                page_title: document.title,
                send_page_view: true
              });
            `,
          }}
        />

        {/* Facebook Pixel */}
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
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'XXXXXXXXXX'}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <Image 
            height={1} 
            width={1} 
            style={{display: 'none'}}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'XXXXXXXXXX'}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID || 'XXXXXXXXXX'}");
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
              "name": "Fly2Any",
              "alternateName": "Fly2Any Travel Agency",
              "description": "Especialistas em passagens aéreas para brasileiros nos EUA há mais de 10 anos. Voos, hotéis, carros, seguro viagem e passeios.",
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
                  "hoursAvailable": "Mo-Fr 09:00-18:00",
                  "areaServed": ["US", "BR"]
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
                "Passagens Aéreas",
                "Reservas de Hotel",
                "Aluguel de Carros",
                "Seguro Viagem",
                "Passeios Turísticos",
                "Assistência de Viagem"
              ],
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
        {children}
      </body>
    </html>
  );
}
