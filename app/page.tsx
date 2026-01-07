'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { DestinationsSectionEnhanced } from '@/components/home/DestinationsSectionEnhanced';
import { FlashDealsSectionEnhanced } from '@/components/home/FlashDealsSectionEnhanced';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CreditCard, Plane, Hotel, Car, Shield, HeadphonesIcon, Sparkles, ChevronDown } from 'lucide-react';
// import { useLanguage } from '@/lib/i18n/client'; // TODO: Re-enable when multilingual support is activated
import dynamic from 'next/dynamic';

// Dynamic imports for below-the-fold components and non-critical features
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentPopup'), { ssr: false });
const MobileScrollCapture = dynamic(() => import('@/components/conversion/MobileScrollCapture'), { ssr: false });
const FAQ = dynamic(() => import('@/components/conversion/FAQ').then(mod => mod.FAQ), { ssr: false });

const HotelsSectionEnhanced = dynamic(() => import('@/components/home/HotelsSectionEnhanced').then(mod => mod.HotelsSectionEnhanced), { ssr: false });
const CarRentalsSectionEnhanced = dynamic(() => import('@/components/home/CarRentalsSectionEnhanced').then(mod => mod.CarRentalsSectionEnhanced), { ssr: false });
const ToursSectionEnhanced = dynamic(() => import('@/components/home/ToursSectionEnhanced').then(mod => mod.ToursSectionEnhanced), { ssr: false });
const ActivitiesSectionEnhanced = dynamic(() => import('@/components/home/ActivitiesSectionEnhanced').then(mod => mod.ActivitiesSectionEnhanced), { ssr: false });
const TransfersSectionEnhanced = dynamic(() => import('@/components/home/TransfersSectionEnhanced').then(mod => mod.TransfersSectionEnhanced), { ssr: false });
const ExperiencesSection = dynamic(() => import('@/components/home/ExperiencesSection'), { ssr: false });
const WorldCupHeroSectionEnhanced = dynamic(() => import('@/components/world-cup/WorldCupHeroSectionEnhanced').then(mod => mod.WorldCupHeroSectionEnhanced), { ssr: false });
const CompactTrustBar = dynamic(() => import('@/components/conversion/CompactTrustBar'), { ssr: false });
const AirlineLogosMarquee = dynamic(() => import('@/components/home/AirlineLogosMarquee'), { ssr: false });

type Language = 'en';

// Level-6 Ultra-Premium: Tab-Contextual Hero Photos
type ServiceType = 'flights' | 'hotels' | 'cars' | 'tours' | 'activities' | 'transfers' | 'packages' | 'insurance';

const HERO_PHOTOS: Record<ServiceType, { name: string; image: string }[]> = {
  flights: [
    { name: 'Airplane Window Clouds', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1280&q=70&auto=format' },
    { name: 'Maldives Paradise', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1280&q=70&auto=format' },
    { name: 'Santorini Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1280&q=70&auto=format' },
    { name: 'Bora Bora Beach', image: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1280&q=70&auto=format' },
    { name: 'Dubai Skyline', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1280&q=70&auto=format' },
    { name: 'Northern Lights', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1280&q=70&auto=format' },
  ],
  hotels: [
    { name: 'Luxury Suite', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1280&q=70&auto=format' },
    { name: 'Resort Pool', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1280&q=70&auto=format' },
    { name: 'Hotel Lobby', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1280&q=70&auto=format' },
    { name: 'Ocean View Room', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1280&q=70&auto=format' },
  ],
  cars: [
    { name: 'Scenic Drive', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1280&q=70&auto=format' },
    { name: 'Convertible Coast', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1280&q=70&auto=format' },
    { name: 'Mountain Road', image: 'https://images.unsplash.com/photo-1469285994282-454c4c3e3eff?w=1280&q=70&auto=format' },
    { name: 'City Driving', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1280&q=70&auto=format' },
  ],
  tours: [
    { name: 'Eiffel Tower', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1280&q=70&auto=format' },
    { name: 'Machu Picchu', image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1280&q=70&auto=format' },
    { name: 'Colosseum Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1280&q=70&auto=format' },
    { name: 'Great Wall', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1280&q=70&auto=format' },
  ],
  activities: [
    { name: 'Snorkeling', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1280&q=70&auto=format' },
    { name: 'Hot Air Balloon', image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1280&q=70&auto=format' },
    { name: 'Safari Adventure', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1280&q=70&auto=format' },
    { name: 'Hiking Trail', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1280&q=70&auto=format' },
  ],
  transfers: [
    { name: 'Airport Pickup', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1280&q=70&auto=format' },
    { name: 'Luxury Transfer', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1280&q=70&auto=format' },
    { name: 'Private Driver', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1280&q=70&auto=format' },
    { name: 'City Transfer', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1280&q=70&auto=format' },
  ],
  packages: [
    { name: 'Dubai Package', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1280&q=70&auto=format' },
    { name: 'Maldives Package', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1280&q=70&auto=format' },
    { name: 'Paris Getaway', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1280&q=70&auto=format' },
    { name: 'Tokyo Experience', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1280&q=70&auto=format' },
  ],
  insurance: [
    { name: 'Travel Protection', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1280&q=70&auto=format' },
    { name: 'Family Travel', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1280&q=70&auto=format' },
    { name: 'Adventure Coverage', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1280&q=70&auto=format' },
    { name: 'Peace of Mind', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=70&auto=format' },
  ],
};

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
  // TEMPORARY: Platform frozen to English-only
  const lang: Language = 'en';
  const t = content.en;
  const [activeService, setActiveService] = useState<ServiceType>('flights');
  const [mounted, setMounted] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Get current photos based on active service tab
  const currentPhotos = HERO_PHOTOS[activeService];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle service type change from search form - useCallback for stable reference
  const handleServiceChange = useCallback((service: string) => {
    setActiveService((current) => {
      const validService = service as ServiceType;
      if (HERO_PHOTOS[validService] && validService !== current) {
        return validService;
      }
      return current;
    });
  }, []);

  // Handle form expand/collapse state change (mobile only)
  const handleExpandStateChange = (expanded: boolean) => {
    setIsFormExpanded(expanded);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          LEVEL-6 ULTRA-PREMIUM HERO - 100vh Immersive Full Screen
          Negative margin pulls hero BEHIND sticky header for transparency
          Mobile: Collapses when search form is collapsed, expands with form
          ============================================ */}
      <section className={`relative overflow-hidden -mt-14 sm:-mt-16 lg:-mt-[72px] transition-all duration-500 ease-out ${
        isFormExpanded ? 'min-h-[100svh]' : 'min-h-[320px]'
      } md:min-h-screen`}>
        {/* Rotating Background Images - CSS animations for better performance */}
        {currentPhotos.map((photo, index) => (
          <div
            key={`hero-${activeService}-${index}`}
            className="absolute inset-0"
            style={{
              animation: `heroFade${activeService} ${6 * currentPhotos.length}s infinite`,
              animationDelay: `${index * 6}s`,
              opacity: 0
            }}
          >
            <Image
              src={photo.image}
              alt={photo.name}
              fill
              className="object-cover scale-105"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              quality={index === 0 ? 95 : 85}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCJgDgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k="
            />
          </div>
        ))}

        {/* CSS Animation Keyframes */}
        <style jsx>{`
          @keyframes heroFade${activeService} {
            0% { opacity: 1; }
            ${(100 / currentPhotos.length).toFixed(2)}% { opacity: 1; }
            ${(100 / currentPhotos.length + 0.01).toFixed(2)}% { opacity: 0; }
            100% { opacity: 0; }
          }
        `}</style>

        {/* Enhanced Gradient Overlays - Better contrast for accessibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black/95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />

        {/* Content Container - Full height with flex */}
        <div className={`relative z-10 flex flex-col transition-all duration-500 ease-out ${
          isFormExpanded ? 'min-h-[100svh]' : 'min-h-[320px] pb-4'
        } md:min-h-screen md:pb-0`}>
          {/* Title Section - Top */}
          <div className="pt-24 md:pt-28 lg:pt-32 px-2 md:px-6">
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
                  style={{ textShadow: '0 6px 60px rgba(0,0,0,0.9)' }}
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
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {t.titleHighlight}
                  </motion.span>
                </h1>

                <p
                  className="text-base md:text-lg lg:text-xl text-white/95 font-bold mb-6"
                  style={{ textShadow: '0 4px 40px rgba(0,0,0,0.8)' }}
                >
                  {t.subtitle}
                </p>
              </motion.div>
            </MaxWidthContainer>
          </div>

          {/* Search Form Section */}
          <div className="flex-1 pt-2 md:pt-4">
            <MobileHomeSearchWrapper
              lang={lang}
              glassmorphism
              onServiceTypeChange={handleServiceChange}
              onExpandStateChange={handleExpandStateChange}
            />
          </div>

          {/* Airlines Logo Marquee (hidden when collapsed on mobile) */}
          <div className={`${isFormExpanded ? 'block' : 'hidden md:block'}`}>
            <AirlineLogosMarquee />
          </div>

          {/* Trust Signals - At bottom of hero (hidden when collapsed on mobile) */}
          <div className={`pb-4 md:pb-6 ${isFormExpanded ? 'mt-auto' : 'mt-4 hidden md:block'} md:mt-auto bg-black/70 backdrop-blur-md rounded-t-xl pt-4`}>
            {/* Trust Signals - Visible with Colored Icons */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-3">
              {[
                { icon: Shield, text: 'Best Price', color: 'text-emerald-400' },
                { icon: HeadphonesIcon, text: '24/7 Support', color: 'text-sky-400' },
                { icon: CreditCard, text: 'Secure', color: 'text-blue-400' },
                { icon: Sparkles, text: 'Free Cancel 24h', color: 'text-amber-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${item.color}`} strokeWidth={2} />
                  <span className="text-[11px] md:text-xs font-extrabold text-white whitespace-nowrap drop-shadow-lg">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            {/* Scroll Indicator */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-5 h-5 text-white/80" />
            </motion.div>
          </div>
        </div>
      </section>

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
              title="❓ Frequently Asked Questions"
              subtitle="Everything you need to know about booking with Fly2Any"
              categories={faqCategories.en}
              language="en"
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
