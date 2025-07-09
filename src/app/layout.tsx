import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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
        url: "/og-image-placeholder.svg",
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
    images: ["/og-image-placeholder.svg"],
  },
  alternates: {
    canonical: "https://fly2any.com",
  },
  other: {
    "google-site-verification": "fly2any-google-verification-code-placeholder",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          <img 
            height="1" 
            width="1" 
            style={{display: 'none'}}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'XXXXXXXXXX'}&ev=PageView&noscript=1`}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["TravelAgency", "LocalBusiness"],
              "name": "Fly2Any",
              "description": "Especialistas em passagens aéreas para brasileiros nos EUA",
              "url": "https://fly2any.com",
              "telephone": "+1-555-123-4567",
              "email": "contato@fly2any.com",
              "logo": "https://fly2any.com/logo.png",
              "image": "https://fly2any.com/og-image.jpg",
              "foundingDate": "2014",
              "founder": {
                "@type": "Person",
                "name": "Fly2Any Team"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US",
                "addressLocality": "Miami",
                "addressRegion": "FL",
                "postalCode": "33101"
              },
              "areaServed": [
                {
                  "@type": "Country",
                  "name": "Brazil"
                },
                {
                  "@type": "Country", 
                  "name": "United States"
                }
              ],
              "serviceType": [
                "Passagens Aéreas",
                "Reservas de Hotel",
                "Aluguel de Carros",
                "Seguro Viagem",
                "Passeios Turísticos"
              ],
              "priceRange": "$$",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Serviços de Viagem",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Passagens Aéreas Brasil-EUA",
                      "description": "Voos diretos e com conexão entre Brasil e Estados Unidos"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Hotéis no Brasil",
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
                  "reviewBody": "Excelente atendimento, conseguiram um preço incrível para minha viagem ao Brasil!"
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
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://fly2any.com/search?q={search_term_string}",
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
