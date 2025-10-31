'use client';

import { useState } from 'react';
import { TrustIndicators } from '@/components/home/TrustIndicators';
import { Testimonials } from '@/components/home/Testimonials';
import { AppDownload } from '@/components/conversion/AppDownload';
import { FAQ } from '@/components/conversion/FAQ';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import { HotelsSectionEnhanced } from '@/components/home/HotelsSectionEnhanced';
import { CarRentalsSectionEnhanced } from '@/components/home/CarRentalsSectionEnhanced';
import { ToursSection } from '@/components/home/ToursSection';
import { DestinationsSectionEnhanced } from '@/components/home/DestinationsSectionEnhanced';
import { FlashDealsSectionEnhanced } from '@/components/home/FlashDealsSectionEnhanced';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    pageTitle: 'FLY2ANY - Find Cheap Flights, Hotels, Cars & Tours',
    sectionTitle: 'Explore the World with Smart Travel Deals',
    subtitle: 'AI-powered recommendations for the best value across all travel services',
  },
  pt: {
    pageTitle: 'FLY2ANY - Encontre Voos, Hotéis, Carros e Passeios Baratos',
    sectionTitle: 'Explore o Mundo com Ofertas Inteligentes de Viagem',
    subtitle: 'Recomendações IA para o melhor valor em todos os serviços de viagem',
  },
  es: {
    pageTitle: 'FLY2ANY - Encuentra Vuelos, Hoteles, Autos y Tours Baratos',
    sectionTitle: 'Explora el Mundo con Ofertas Inteligentes de Viaje',
    subtitle: 'Recomendaciones IA para el mejor valor en todos los servicios de viaje',
  },
};

// Testimonials data
const testimonials = [
  { name: 'Sarah Johnson', location: 'New York, USA', rating: 5, text: 'Best travel booking experience ever! Found amazing deals and the customer service was outstanding.', image: '👩' },
  { name: 'Carlos Rodriguez', location: 'Madrid, Spain', rating: 5, text: 'Fly2Any made my dream vacation possible. Easy to use and great prices!', image: '👨' },
  { name: 'Emily Chen', location: 'Singapore', rating: 5, text: 'I always book through Fly2Any now. The price guarantee saved me hundreds!', image: '👩' },
];

// App download data (trilingual)
const appDownloadData = {
  en: {
    title: 'Book Faster on Our Mobile App',
    subtitle: 'Get exclusive mobile-only deals and save even more on the go!',
    benefits: [
      'Mobile-exclusive deals up to 10% OFF',
      'Instant booking confirmations',
      'Real-time flight updates & alerts',
      'Offline access to your bookings',
    ],
    downloadText: 'Download Now',
  },
  pt: {
    title: 'Reserve Mais Rápido em Nosso App',
    subtitle: 'Obtenha ofertas exclusivas para celular e economize ainda mais!',
    benefits: [
      'Ofertas exclusivas de até 10% OFF',
      'Confirmações instantâneas de reserva',
      'Atualizações de voo em tempo real',
      'Acesso offline às suas reservas',
    ],
    downloadText: 'Baixar Agora',
  },
  es: {
    title: 'Reserva Más Rápido en Nuestra App',
    subtitle: '¡Obtén ofertas exclusivas para móvil y ahorra aún más!',
    benefits: [
      'Ofertas exclusivas de hasta 10% OFF',
      'Confirmaciones instantáneas de reserva',
      'Actualizaciones de vuelo en tiempo real',
      'Acceso sin conexión a tus reservas',
    ],
    downloadText: 'Descargar Ahora',
  },
};

// FAQ data (trilingual)
const faqData = {
  en: [
    { question: 'How does the best price guarantee work?', answer: 'If you find a lower price for the same flight, hotel, or package within 24 hours of booking, we\'ll refund the difference plus give you a $50 credit toward your next booking.' },
    { question: 'Can I cancel or change my booking?', answer: 'Most bookings offer free cancellation within 24 hours. After that, cancellation policies vary by airline, hotel, or service provider. We always display the cancellation terms before you book.' },
    { question: 'How do I track my flight prices?', answer: 'Click the "Track Prices" button on any search result. We\'ll monitor prices and send you email alerts when they drop, helping you book at the perfect time.' },
    { question: 'Is my payment information secure?', answer: 'Absolutely! We use 256-bit SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed through secure payment gateways.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay, and selected cryptocurrencies for bookings.' },
  ],
  pt: [
    { question: 'Como funciona a garantia de melhor preço?', answer: 'Se você encontrar um preço mais baixo para o mesmo voo, hotel ou pacote dentro de 24 horas após a reserva, reembolsaremos a diferença e daremos um crédito de $50 para sua próxima reserva.' },
    { question: 'Posso cancelar ou alterar minha reserva?', answer: 'A maioria das reservas oferece cancelamento gratuito em até 24 horas. Depois disso, as políticas de cancelamento variam de acordo com a companhia aérea, hotel ou fornecedor de serviços.' },
    { question: 'Como rastreio os preços dos voos?', answer: 'Clique no botão "Rastrear Preços" em qualquer resultado de busca. Monitoraremos os preços e enviaremos alertas por e-mail quando eles caírem.' },
    { question: 'Minhas informações de pagamento estão seguras?', answer: 'Com certeza! Usamos criptografia SSL de 256 bits e somos compatíveis com PCI DSS. Suas informações de pagamento nunca são armazenadas em nossos servidores.' },
    { question: 'Quais métodos de pagamento vocês aceitam?', answer: 'Aceitamos todos os principais cartões de crédito (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay e criptomoedas selecionadas.' },
  ],
  es: [
    { question: '¿Cómo funciona la garantía de mejor precio?', answer: 'Si encuentras un precio más bajo para el mismo vuelo, hotel o paquete dentro de las 24 horas posteriores a la reserva, reembolsaremos la diferencia y te daremos un crédito de $50 para tu próxima reserva.' },
    { question: '¿Puedo cancelar o cambiar mi reserva?', answer: 'La mayoría de las reservas ofrecen cancelación gratuita dentro de las 24 horas. Después, las políticas de cancelación varían según la aerolínea, hotel o proveedor de servicios.' },
    { question: '¿Cómo rastree los precios de vuelos?', answer: 'Haz clic en el botón "Rastrear Precios" en cualquier resultado de búsqueda. Monitorearemos los precios y te enviaremos alertas por correo cuando bajen.' },
    { question: '¿Mi información de pago está segura?', answer: '¡Absolutamente! Usamos encriptación SSL de 256 bits y cumplimos con PCI DSS. Tu información de pago nunca se almacena en nuestros servidores.' },
    { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay y criptomonedas seleccionadas.' },
  ],
};

export default function NewHomePage() {
  const [lang, setLang] = useState<Language>('en');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          PAGE TITLE - Between Header and Search Bar
          ENHANCED: Premium Typography & Animations
          ============================================ */}
      <div className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 border-b border-gray-200/60 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(59, 130, 246) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px 24px 10px', position: 'relative' }}>
          <div className="flex items-baseline gap-3 flex-wrap animate-fadeIn">
            {/* Main Title - Gradient Effect */}
            <h1
              className="text-2xl font-extrabold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 10px rgba(30, 64, 175, 0.1)',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                animation: 'fadeInUp 0.6s ease-out'
              }}
            >
              {t.sectionTitle}
            </h1>

            {/* Separator */}
            <span
              className="text-cyan-300 font-medium text-xl"
              style={{ animation: 'fadeIn 0.8s ease-out' }}
            >
              •
            </span>

            {/* Subtitle */}
            <p
              className="text-lg text-gray-700/90 mb-0 font-medium"
              style={{
                animation: 'fadeInUp 0.6s ease-out 0.15s backwards',
                letterSpacing: '0.01em'
              }}
            >
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      {/* ============================================
          ENHANCED SEARCH BAR - 100% Complete from Results Page
          ============================================ */}
      <EnhancedSearchBar lang={lang} />

      {/* ============================================
          MAIN CONTENT - Max Width 1600px
          Sticky trust bar removed for cleaner, more compact design
          Trust badges integrated into Trust Indicators section below
          ============================================ */}
      <main>
        {/* ============================================
            RECENTLY VIEWED - Personalized Recommendations
            ============================================ */}
        <div style={{ marginTop: '20px' }}>
          <RecentlyViewedSection lang={lang} />
        </div>

        {/* ============================================
            DESTINATIONS SECTION - Explore by Continent
            ENHANCED with Real Duffel Flight Data, ML/AI, Marketing
            ============================================ */}
        <div style={{ marginTop: '20px' }}>
          <DestinationsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            FLASH DEALS SECTION - Time-Limited Offers
            ENHANCED with Real Duffel Flash Deals, ML/AI, Marketing
            ============================================ */}
        <div style={{ marginTop: '20px' }}>
          <FlashDealsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            HOTELS SECTION - ML/AI Powered with Duffel Photos
            ============================================ */}
        <div style={{ marginTop: '20px' }}>
          <HotelsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            CAR RENTALS SECTION - ML/AI Powered
            ENHANCED with Real Amadeus Car Data, Photos, Marketing
            ============================================ */}
        <div style={{ marginTop: '20px' }}>
          <CarRentalsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            TOURS & ACTIVITIES SECTION - ML/AI Powered
            ============================================ */}
        <div style={{ marginTop: '20px' }}>
          <ToursSection lang={lang} />
        </div>

        {/* ============================================
            TRUST INDICATORS / WHY CHOOSE US
            Major section break - slightly increased spacing
            ============================================ */}
        <div style={{ marginTop: '28px' }}>
          <TrustIndicators
            title="Why Choose Fly2Any?"
            subtitle="Join millions of satisfied travelers"
            items={[
              { icon: '💰', title: 'Best Price Guarantee', description: 'Find a lower price? We\'ll match it' },
              { icon: '🛡️', title: 'Secure Booking', description: 'Your data is protected with 256-bit SSL' },
              { icon: '📞', title: '24/7 Support', description: 'Our team is always here to help' },
              { icon: '✨', title: '10M+ Travelers', description: 'Trusted worldwide since 2020' },
              { icon: '🔒', title: 'Free Cancellation', description: 'On most bookings - flexibility you need' },
              { icon: '🎁', title: 'Rewards Program', description: 'Earn points on every booking' },
            ]}
          />
        </div>

        {/* ============================================
            CUSTOMER TESTIMONIALS
            ============================================ */}
        <div style={{ marginTop: '28px' }}>
          <Testimonials
            title="What Our Travelers Say"
            subtitle="Real reviews from real people"
            testimonials={testimonials}
          />
        </div>

        {/* ============================================
            APP DOWNLOAD - Mobile CTA
            ============================================ */}
        <div style={{ marginTop: '28px' }}>
          <AppDownload
            title={appDownloadData[lang].title}
            subtitle={appDownloadData[lang].subtitle}
            benefits={appDownloadData[lang].benefits}
            downloadText={appDownloadData[lang].downloadText}
          />
        </div>

        {/* ============================================
            FAQ - Answer Common Questions
            Final section - extra spacing before
            ============================================ */}
        <div style={{ marginTop: '32px', marginBottom: '32px' }}>
          <FAQ
            title={lang === 'en' ? '❓ Frequently Asked Questions' : lang === 'pt' ? '❓ Perguntas Frequentes' : '❓ Preguntas Frecuentes'}
            subtitle={lang === 'en' ? 'Everything you need to know about booking with Fly2Any' : lang === 'pt' ? 'Tudo o que você precisa saber sobre reservas com Fly2Any' : 'Todo lo que necesitas saber sobre reservas con Fly2Any'}
            items={faqData[lang]}
          />
        </div>
      </main>
    </div>
  );
}
