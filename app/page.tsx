'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FAQ } from '@/components/conversion/FAQ';
import ExitIntentPopup from '@/components/conversion/ExitIntentPopup';
import MobileScrollCapture from '@/components/conversion/MobileScrollCapture';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { HotelsSectionEnhanced } from '@/components/home/HotelsSectionEnhanced';
import { CarRentalsSectionEnhanced } from '@/components/home/CarRentalsSectionEnhanced';
import { ToursSectionEnhanced } from '@/components/home/ToursSectionEnhanced';
import { ActivitiesSectionEnhanced } from '@/components/home/ActivitiesSectionEnhanced';
import { TransfersSectionEnhanced } from '@/components/home/TransfersSectionEnhanced';
import ExperiencesSection from '@/components/home/ExperiencesSection';
import { DestinationsSectionEnhanced } from '@/components/home/DestinationsSectionEnhanced';
import { FlashDealsSectionEnhanced } from '@/components/home/FlashDealsSectionEnhanced';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { WorldCupHeroSectionEnhanced } from '@/components/world-cup/WorldCupHeroSectionEnhanced';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { CreditCard, Plane, Hotel, Car, Shield, HeadphonesIcon, Sparkles, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';

// Premium Hero Destinations (removed Santorini & Bali per request)
const HERO_DESTINATIONS = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=85', emoji: '🗼' },
  { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=85', emoji: '✨' },
  { name: 'Maldives', country: 'Paradise', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=85', emoji: '🏝️' },
  { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=85', emoji: '🗽' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=85', emoji: '🗾' },
  { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=85', emoji: '🇬🇧' },
];

const content = {
  en: {
    pageTitle: 'FLY2ANY - Find Cheap Flights, Hotels, Cars & Tours',
    sectionTitle: 'Explore the World with',
    titleHighlight: 'Smart Travel Deals',
    subtitle: 'Best value across all travel services',
  },
  pt: {
    pageTitle: 'FLY2ANY - Encontre Voos, Hotéis, Carros e Passeios Baratos',
    sectionTitle: 'Explore o Mundo com',
    titleHighlight: 'Ofertas Inteligentes',
    subtitle: 'Melhor valor em todos os serviços',
  },
  es: {
    pageTitle: 'FLY2ANY - Encuentra Vuelos, Hoteles, Autos y Tours Baratos',
    sectionTitle: 'Explora el Mundo con',
    titleHighlight: 'Ofertas Inteligentes',
    subtitle: 'Mejor valor en todos los servicios',
  },
};

// FAQ Data (kept compact for token efficiency)
const faqCategories = {
  en: [
    { id: 'booking-payments', icon: CreditCard, title: 'Booking & Payments', items: [
      { question: 'How does the best price guarantee work?', answer: 'If you find a lower price for the same flight, hotel, or package within 24 hours of booking, we\'ll refund the difference plus give you a $50 credit toward your next booking.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay, and Venmo.' },
      { question: 'Is my payment information secure?', answer: 'Absolutely! We use 256-bit SSL encryption and are PCI DSS Level 1 compliant.' },
      { question: 'Are there any hidden fees?', answer: 'No hidden fees ever! The price you see is the final price you pay.' },
    ]},
    { id: 'flights-travel', icon: Plane, title: 'Flights & Travel', items: [
      { question: 'Can I cancel or change my flight booking?', answer: 'Most flight bookings can be changed or cancelled, but fees may apply depending on the airline and fare type.' },
      { question: 'How do I track flight prices?', answer: 'Click the "Track Prices" button on any search result. We\'ll monitor prices 24/7 and send you email alerts when they drop.' },
      { question: 'What are the baggage allowances?', answer: 'Baggage allowances vary by airline. Standard economy typically includes 1 carry-on and 1 personal item.' },
    ]},
    { id: 'hotels-accommodations', icon: Hotel, title: 'Hotels & Accommodations', items: [
      { question: 'What is your hotel cancellation policy?', answer: 'Most hotels offer free cancellation up to 24-48 hours before check-in.' },
      { question: 'Can I request early check-in?', answer: 'Yes! You can request early check-in during booking. Subject to hotel confirmation.' },
    ]},
    { id: 'cars-transfers', icon: Car, title: 'Cars & Transfers', items: [
      { question: 'What insurance do I need for car rentals?', answer: 'Basic insurance is usually included. Optional coverage includes Collision Damage Waiver ($15-$40/day).' },
      { question: 'What are the driver requirements?', answer: 'Minimum age is 21 (25 for some car categories). You need a valid license held for at least 1 year.' },
    ]},
    { id: 'insurance-protection', icon: Shield, title: 'Insurance & Protection', items: [
      { question: 'Should I buy travel insurance?', answer: 'Travel insurance is highly recommended and costs 4-10% of trip cost. It covers trip cancellation, medical emergencies, and lost baggage.' },
    ]},
    { id: 'support-account', icon: HeadphonesIcon, title: 'Support & Account', items: [
      { question: 'How do I contact customer support?', answer: 'We offer 24/7 support via phone (1-332-220-0838), email (support@fly2any.com), and live chat.' },
    ]},
  ],
  pt: [
    { id: 'booking-payments', icon: CreditCard, title: 'Reservas e Pagamentos', items: [
      { question: 'Como funciona a garantia de melhor preço?', answer: 'Se você encontrar um preço mais baixo dentro de 24 horas, reembolsaremos a diferença mais $50 de crédito.' },
      { question: 'Quais métodos de pagamento vocês aceitam?', answer: 'Aceitamos todos os principais cartões, PayPal, Apple Pay, Google Pay e Venmo.' },
    ]},
    { id: 'flights-travel', icon: Plane, title: 'Voos e Viagens', items: [
      { question: 'Posso cancelar ou alterar minha reserva?', answer: 'A maioria das reservas pode ser alterada ou cancelada, mas taxas podem ser aplicadas.' },
    ]},
    { id: 'support-account', icon: HeadphonesIcon, title: 'Suporte e Conta', items: [
      { question: 'Como entro em contato com o suporte?', answer: 'Oferecemos suporte 24/7 via telefone (1-332-220-0838), email e chat ao vivo.' },
    ]},
  ],
  es: [
    { id: 'booking-payments', icon: CreditCard, title: 'Reservas y Pagos', items: [
      { question: '¿Cómo funciona la garantía de mejor precio?', answer: 'Si encuentras un precio más bajo dentro de 24 horas, reembolsaremos la diferencia más $50 de crédito.' },
    ]},
    { id: 'flights-travel', icon: Plane, title: 'Vuelos y Viajes', items: [
      { question: '¿Puedo cancelar o cambiar mi reserva?', answer: 'La mayoría de las reservas pueden cambiarse o cancelarse, pero pueden aplicarse cargos.' },
    ]},
    { id: 'support-account', icon: HeadphonesIcon, title: 'Soporte y Cuenta', items: [
      { question: '¿Cómo contacto al soporte?', answer: 'Ofrecemos soporte 24/7 vía teléfono (1-332-220-0838), email y chat en vivo.' },
    ]},
  ],
};

export default function Home() {
  const { language } = useLanguage();
  const lang = language as Language;
  const t = content[lang];
  const [heroIndex, setHeroIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate hero images every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_DESTINATIONS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          LEVEL-6 ULTRA-PREMIUM HERO - Apple-Class Design
          ============================================ */}
      <section className="relative min-h-[620px] md:min-h-[600px] overflow-hidden">
        {/* Rotating Background Images with Ken Burns Effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_DESTINATIONS[heroIndex].image}
              alt={HERO_DESTINATIONS[heroIndex].name}
              fill
              className="object-cover"
              priority
              quality={85}
            />
          </motion.div>
        </AnimatePresence>

        {/* Ultra-Premium Gradient Overlays - Reduced opacity for better photo visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-orange-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-transparent to-yellow-900/30" />

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          {/* Title Section - Centered */}
          <div className="pt-6 md:pt-10 px-4 md:px-6">
            <MaxWidthContainer noPadding>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                {/* Large Animated Title */}
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3"
                  style={{ textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
                >
                  {t.sectionTitle}{' '}
                  <motion.span
                    className="inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFF 25%, #FFD700 50%, #FF6B6B 75%, #FFD700 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    {t.titleHighlight}
                  </motion.span>
                </h1>

                <p
                  className="text-base md:text-lg lg:text-xl text-white/90 font-medium mb-6"
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
                >
                  {t.subtitle}
                </p>
              </motion.div>
            </MaxWidthContainer>
          </div>

          {/* Search Form Section - Centered Position */}
          <div className="flex-1 flex items-start pt-2 md:pt-4">
            <div className="w-full">
              <MobileHomeSearchWrapper lang={lang} glassmorphism />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pb-4 md:pb-5">
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-5 h-5 text-white/50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          COMPACT TRUST BAR - Sticky Trust Signals
          ============================================ */}
      <CompactTrustBar sticky />

      {/* ============================================
          MAIN CONTENT SECTIONS
          ============================================ */}
      <main>
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mt-4 md:mt-6 lg:mt-8">
            <RecentlyViewedSection lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <DestinationsSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <FlashDealsSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <HotelsSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <ToursSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <ActivitiesSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <TransfersSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <ExperiencesSection />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <WorldCupHeroSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <CarRentalsSectionEnhanced lang={lang} />
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8 mb-4 md:mb-6 lg:mb-8">
            <FAQ
              title={lang === 'en' ? '❓ Frequently Asked Questions' : lang === 'pt' ? '❓ Perguntas Frequentes' : '❓ Preguntas Frecuentes'}
              subtitle={lang === 'en' ? 'Everything you need to know about booking with Fly2Any' : lang === 'pt' ? 'Tudo o que você precisa saber sobre reservas' : 'Todo lo que necesitas saber sobre reservas'}
              categories={faqCategories[lang]}
              language={lang}
            />
          </div>
        </MaxWidthContainer>
      </main>

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        discountCode="COMEBACK5"
        discountPercent={5}
        onEmailSubmit={(email) => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exit_intent_email_captured', {
              event_category: 'lead_capture',
              event_label: 'homepage',
            });
          }
          fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'exit_intent_homepage' }),
          }).catch(() => {});
        }}
      />

      {/* Mobile Scroll Capture */}
      <MobileScrollCapture
        scrollThreshold={50}
        timeOnPageMs={15000}
        variant="newsletter"
        onEmailSubmit={(email) => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'mobile_scroll_email_captured', {
              event_category: 'lead_capture',
              event_label: 'homepage',
            });
          }
          fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'mobile_scroll_homepage' }),
          }).catch(() => {});
        }}
      />
    </div>
  );
}
