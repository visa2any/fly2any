import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";
import ChatAgent from "@/components/ChatAgent";
import FloatingChat from "@/components/FloatingChat";
import TestChat from "@/components/TestChat";
import SimpleChatAgent from "@/components/SimpleChatAgent";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fly2any.com'),
  title: "Fly2Any - Brazil Travel Specialists | Flights to Brazil",
  description: "Expert travel agency specializing in trips to Brazil. Flights, hotels, cars, tours and travel insurance. Free quote in 2 hours! Serving Americans, Latinos, and Brazilians.",
  keywords: "flights to brazil, brazil travel, brazil vacation, travel to brazil, brazil travel specialists, voos brasil, viajes brasil, passagens aereas",
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
        <meta name="theme-color" content="#FF4444" />
        
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
        <SessionWrapper>
          {children}
        </SessionWrapper>
        <div id="chat-container"></div>
        <script dangerouslySetInnerHTML={{
          __html: `
            let chatWindow = null;
            let chatMessages = [];
            let isTyping = false;

            function openChatWindow() {
              if (chatWindow) {
                chatWindow.style.display = 'flex';
                return;
              }

              chatWindow = document.createElement('div');
              chatWindow.style.cssText = 'position:fixed!important;bottom:90px!important;right:20px!important;width:350px!important;height:500px!important;background:white!important;border-radius:15px!important;box-shadow:0 10px 30px rgba(0,0,0,0.3)!important;z-index:99998!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;';

              // Header
              const header = document.createElement('div');
              header.style.cssText = 'background:linear-gradient(135deg, #667eea 0%, #764ba2 100%)!important;color:white!important;padding:15px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;';
              header.innerHTML = '<div><h3 style="margin:0;font-size:16px;">🤖 Assistente Fly2Any</h3><p style="margin:0;font-size:12px;opacity:0.9;">Especialista em viagens</p></div><button id="closeChatBtn" style="background:none!important;border:none!important;color:white!important;font-size:20px!important;cursor:pointer!important;">×</button>';

              // Messages area
              const messagesArea = document.createElement('div');
              messagesArea.id = 'chatMessages';
              messagesArea.style.cssText = 'flex:1!important;padding:15px!important;overflow-y:auto!important;background:#f8f9fa!important;';

              // Input area
              const inputArea = document.createElement('div');
              inputArea.style.cssText = 'padding:15px!important;border-top:1px solid #eee!important;display:flex!important;gap:10px!important;';
              inputArea.innerHTML = '<input type="text" id="chatInput" placeholder="Digite sua mensagem..." style="flex:1!important;padding:10px!important;border:1px solid #ddd!important;border-radius:20px!important;outline:none!important;"><button id="sendChatBtn" style="background:#667eea!important;color:white!important;border:none!important;border-radius:50%!important;width:40px!important;height:40px!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;">→</button>';

              chatWindow.appendChild(header);
              chatWindow.appendChild(messagesArea);
              chatWindow.appendChild(inputArea);
              document.body.appendChild(chatWindow);

              // Event listeners
              document.getElementById('closeChatBtn').onclick = function() {
                chatWindow.style.display = 'none';
              };

              const input = document.getElementById('chatInput');
              const sendBtn = document.getElementById('sendChatBtn');

              sendBtn.onclick = sendMessage;
              input.onkeypress = function(e) {
                if (e.key === 'Enter') sendMessage();
              };

              // Mensagem de boas-vindas
              addMessage('agent', 'Olá! 👋 Sou o assistente virtual da Fly2Any. Como posso ajudar com sua viagem?');
              showQuickReplies(['Cotação de voos', 'Hotéis no Brasil', 'Seguro viagem', 'Falar com humano']);
            }

            function addMessage(sender, text, isHtml = false) {
              const messagesArea = document.getElementById('chatMessages');
              if (!messagesArea) return;

              const messageDiv = document.createElement('div');
              messageDiv.style.cssText = 'margin-bottom:15px!important;display:flex!important;' + (sender === 'user' ? 'justify-content:flex-end!important;' : 'justify-content:flex-start!important;');

              const bubble = document.createElement('div');
              bubble.style.cssText = 'max-width:80%!important;padding:10px 15px!important;border-radius:15px!important;' + 
                (sender === 'user' ? 
                  'background:#667eea!important;color:white!important;border-bottom-right-radius:5px!important;' : 
                  'background:white!important;color:#333!important;border:1px solid #eee!important;border-bottom-left-radius:5px!important;');

              if (isHtml) {
                bubble.innerHTML = text;
              } else {
                bubble.textContent = text;
              }

              messageDiv.appendChild(bubble);
              messagesArea.appendChild(messageDiv);
              messagesArea.scrollTop = messagesArea.scrollHeight;
            }

            function showQuickReplies(options) {
              const messagesArea = document.getElementById('chatMessages');
              if (!messagesArea) return;

              const quickReplies = document.createElement('div');
              quickReplies.style.cssText = 'margin-bottom:15px!important;display:flex!important;flex-wrap:wrap!important;gap:8px!important;';

              options.forEach(option => {
                const btn = document.createElement('button');
                btn.textContent = option;
                btn.style.cssText = 'background:white!important;border:1px solid #667eea!important;color:#667eea!important;padding:8px 12px!important;border-radius:15px!important;cursor:pointer!important;font-size:12px!important;transition:all 0.2s!important;';
                btn.onmouseover = function() { this.style.background = '#667eea'; this.style.color = 'white'; };
                btn.onmouseout = function() { this.style.background = 'white'; this.style.color = '#667eea'; };
                btn.onclick = function() {
                  document.getElementById('chatInput').value = option;
                  sendMessage();
                  quickReplies.remove();
                };
                quickReplies.appendChild(btn);
              });

              messagesArea.appendChild(quickReplies);
              messagesArea.scrollTop = messagesArea.scrollHeight;
            }

            function showTyping() {
              const messagesArea = document.getElementById('chatMessages');
              if (!messagesArea) return;

              const typingDiv = document.createElement('div');
              typingDiv.id = 'typingIndicator';
              typingDiv.style.cssText = 'margin-bottom:15px!important;display:flex!important;justify-content:flex-start!important;';
              typingDiv.innerHTML = '<div style="background:white!important;border:1px solid #eee!important;padding:10px 15px!important;border-radius:15px!important;border-bottom-left-radius:5px!important;"><span style="color:#999;">Digitando</span> <span style="animation:blink 1s infinite;">...</span></div>';

              messagesArea.appendChild(typingDiv);
              messagesArea.scrollTop = messagesArea.scrollHeight;
            }

            function hideTyping() {
              const typing = document.getElementById('typingIndicator');
              if (typing) typing.remove();
            }

            async function sendMessage() {
              const input = document.getElementById('chatInput');
              if (!input || !input.value.trim()) return;

              const message = input.value.trim();
              input.value = '';

              // Add user message
              addMessage('user', message);

              // Show typing
              showTyping();

              try {
                const response = await fetch('/api/chat/agent', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    message: message,
                    sessionId: 'web-chat-' + Date.now()
                  })
                });

                const data = await response.json();
                hideTyping();

                if (data.success) {
                  addMessage('agent', data.message);
                  
                  // Show relevant quick replies based on response
                  if (message.toLowerCase().includes('voo') || message.toLowerCase().includes('passagem')) {
                    showQuickReplies(['Voos Brasil-EUA', 'Quando viajar?', 'Orçamento disponível']);
                  } else if (message.toLowerCase().includes('hotel')) {
                    showQuickReplies(['Hotéis em SP', 'Hotéis no RJ', 'Resort na Bahia']);
                  } else if (message.toLowerCase().includes('humano') || message.toLowerCase().includes('atendente')) {
                    showQuickReplies(['WhatsApp agora', 'Agendar ligação', 'Email']);
                  }
                } else {
                  addMessage('agent', 'Desculpe, estou com dificuldades técnicas. Use nosso WhatsApp para atendimento imediato! 📱');
                  showQuickReplies(['Abrir WhatsApp', 'Tentar novamente']);
                }
              } catch (error) {
                hideTyping();
                addMessage('agent', 'Ops! Algo deu errado. Vamos te conectar com nosso WhatsApp! 📱');
                showQuickReplies(['Abrir WhatsApp']);
              }
            }

            // CSS para animação
            const style = document.createElement('style');
            style.textContent = '@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }';
            document.head.appendChild(style);

            function createChatButtons() {
              // Remove botões existentes se houver
              const existingButtons = document.querySelectorAll('.fly2any-chat-button');
              existingButtons.forEach(btn => btn.remove());
              
              const container = document.body;
              
              // Chat IA (azul)
              const chatButton = document.createElement('button');
              chatButton.className = 'fly2any-chat-button';
              chatButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.4 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H14l-2 2v-2H4V4h16v12z"/><circle cx="8" cy="10" r="1.5"/><circle cx="12" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>';
              chatButton.style.cssText = 'position:fixed!important;bottom:20px!important;right:16px!important;z-index:99999!important;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%)!important;color:white!important;border:none!important;border-radius:50%!important;width:32px!important;height:32px!important;cursor:pointer!important;box-shadow:0 6px 25px rgba(102, 126, 234, 0.5)!important;transition:all 0.3s ease!important;display:flex!important;align-items:center!important;justify-content:center!important;';
              chatButton.onmouseover = function() { this.style.transform = 'scale(1.1)'; };
              chatButton.onmouseout = function() { this.style.transform = 'scale(1)'; };
              chatButton.onclick = function() {
                openChatWindow();
              };
              container.appendChild(chatButton);
              
              // WhatsApp (verde)
              const whatsappButton = document.createElement('button');
              whatsappButton.className = 'fly2any-chat-button';
              whatsappButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/></svg>';
              whatsappButton.style.cssText = 'position:fixed!important;bottom:20px!important;right:56px!important;z-index:99999!important;background:linear-gradient(135deg, #25d366 0%, #128c7e 100%)!important;color:white!important;border:none!important;border-radius:50%!important;width:32px!important;height:32px!important;cursor:pointer!important;box-shadow:0 6px 25px rgba(37, 211, 102, 0.5)!important;transition:all 0.3s ease!important;display:flex!important;align-items:center!important;justify-content:center!important;';
              whatsappButton.onmouseover = function() { this.style.transform = 'scale(1.1)'; };
              whatsappButton.onmouseout = function() { this.style.transform = 'scale(1)'; };
              whatsappButton.onclick = function() {
                const message = encodeURIComponent('Olá! Gostaria de solicitar uma cotação de viagem.');
                const phone = '551151944717';
                
                // Detectar dispositivo
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                if (isMobile) {
                  // Tentar abrir o app do WhatsApp primeiro
                  const whatsappUrl = 'whatsapp://send?phone=' + phone + '&text=' + message;
                  const webUrl = 'https://wa.me/' + phone + '?text=' + message;
                  
                  // Tentar abrir o app
                  window.location.href = whatsappUrl;
                  
                  // Se não funcionar, abrir no navegador após 2 segundos
                  setTimeout(function() {
                    window.open(webUrl, '_blank');
                  }, 2000);
                } else {
                  // Desktop: abrir WhatsApp Web diretamente
                  window.open('https://wa.me/' + phone + '?text=' + message, '_blank');
                }
              };
              container.appendChild(whatsappButton);
            }
            
            // Criar botões com verificação para evitar duplicação
            function createButtonsIfNeeded() {
              // Só criar se não existir nenhum botão de chat ainda
              if (!document.querySelector('.fly2any-chat-button') && !document.querySelector('[class*="ChatAgent"]')) {
                createChatButtons();
              }
            }
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', createButtonsIfNeeded);
            } else {
              createButtonsIfNeeded();
            }
            
            // Recriar após carregamento completo
            window.addEventListener('load', createButtonsIfNeeded);
            
            // Verificar periodicamente se os botões ainda existem
            setInterval(function() {
              createButtonsIfNeeded();
            }, 3000);
          `
        }} />
      </body>
    </html>
  );
}
