'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import PopularRoutesSection from '@/components/home/PopularRoutesSection';
import { FlashDealsSectionEnhanced } from '@/components/home/FlashDealsSectionEnhanced';
import { DestinationsSectionEnhanced } from '@/components/home/DestinationsSectionEnhanced';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Plane, Star, Wifi, TvMinimalPlay, UtensilsCrossed, Armchair,
  Luggage, CreditCard, Award, Globe, Shield, ChevronRight,
  Sparkles, TrendingUp, Clock, DollarSign, AlertCircle, Calendar
} from 'lucide-react';

type Language = 'en' | 'pt' | 'es';

// Base data (language-agnostic)
const baseCabinClasses = [
  {
    name: 'Economy Class',
    description: 'Affordable comfort for budget-conscious travelers',
    priceRange: '$200-$800',
    icon: Plane,
    color: 'from-blue-500 to-cyan-600',
    features: ['Standard Seat', 'Carry-on Bag', 'Meal Service', 'Entertainment'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80' // Economy cabin
  },
  {
    name: 'Premium Economy',
    description: 'Extra legroom and enhanced amenities',
    priceRange: '$500-$1,500',
    icon: Armchair,
    color: 'from-indigo-500 to-purple-600',
    features: ['Extra Legroom', '2 Checked Bags', 'Priority Boarding', 'Premium Meals'],
    image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80' // Premium cabin
  },
  {
    name: 'Business Class',
    description: 'Lie-flat seats, gourmet dining, luxury lounges',
    priceRange: '$2,000-$8,000',
    icon: Award,
    color: 'from-amber-500 to-orange-600',
    features: ['Lie-Flat Seat', 'Lounge Access', 'Fine Dining', 'Priority Everything'],
    image: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80' // Business class
  },
  {
    name: 'First Class',
    description: 'Ultimate luxury with private suites and concierge',
    priceRange: '$5,000-$20,000',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-600',
    features: ['Private Suite', 'Personal Chef', 'Chauffeur Service', 'Shower Spa'],
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80' // First class luxury cabin interior
  },
];

const baseAlliances = [
  {
    name: 'Star Alliance',
    airlines: '26 airlines',
    network: '1,200+ destinations',
    logo: '⭐',
    color: 'from-yellow-500 to-amber-600',
    benefits: ['Miles pooling', 'Lounge access', 'Priority check-in']
  },
  {
    name: 'oneworld',
    airlines: '13 airlines',
    network: '900+ destinations',
    logo: '🌐',
    color: 'from-red-500 to-rose-600',
    benefits: ['Award travel', 'Fast track', 'Baggage priority']
  },
  {
    name: 'SkyTeam',
    airlines: '19 airlines',
    network: '1,000+ destinations',
    logo: '✈️',
    color: 'from-blue-500 to-indigo-600',
    benefits: ['Elite status', 'Upgrades', 'Global lounges']
  },
  {
    name: 'Low-Cost Carriers',
    airlines: 'Ryanair, Southwest, EasyJet',
    network: 'Regional focus',
    logo: '💰',
    color: 'from-green-500 to-emerald-600',
    benefits: ['Best prices', 'No frills', 'Direct booking']
  },
];

const baseFlightFeatures = [
  { name: 'WiFi', icon: Wifi, availability: '85% of flights' },
  { name: 'Entertainment', icon: TvMinimalPlay, availability: '92% of flights' },
  { name: 'Meals', icon: UtensilsCrossed, availability: '78% of flights' },
  { name: 'Extra Legroom', icon: Armchair, availability: 'Paid upgrade' },
  { name: 'Lounge Access', icon: Award, availability: 'Business/First' },
  { name: 'Checked Bags', icon: Luggage, availability: 'Varies by fare' },
];

const baseBookingTips = [
  {
    tip: 'Book Tuesday-Thursday',
    description: 'Airlines release deals on Monday evenings. Best prices appear Tuesday-Thursday',
    icon: Calendar
  },
  {
    tip: 'Book 6-8 weeks in advance',
    description: 'Domestic flights peak pricing 3 weeks out. International 2-3 months ahead',
    icon: Clock
  },
  {
    tip: 'Use incognito mode',
    description: 'Airlines track cookies and may raise prices on repeat searches',
    icon: Shield
  },
  {
    tip: 'Price tracking tools',
    description: 'Set alerts for price drops. Hopper, Google Flights, Skyscanner',
    icon: TrendingUp
  },
  {
    tip: 'Consider nearby airports',
    description: 'Flying from/to alternative airports can save $100-300',
    icon: Globe
  },
  {
    tip: 'Watch for hidden fees',
    description: 'Seat selection, bags, meals can add $50-200. Factor into total cost',
    icon: DollarSign
  },
];

const baseFaqs = [
  { q: 'When is the best time to book flights?', a: 'For domestic flights, book 1-3 months ahead. International flights: 2-8 months. Tuesday-Thursday mornings often have best prices.' },
  { q: 'Can I change or cancel my flight?', a: 'Depends on fare type. Basic economy is non-changeable. Flexible fares allow changes for $50-300 fee. Premium cabins offer free changes.' },
  { q: 'What are baggage allowances?', a: 'Economy: 1 carry-on (free), checked bags $30-50 each. Premium: 2+ bags free. Weight limits: 50lbs domestic, 70lbs international.' },
  { q: 'How do I get flight upgrades?', a: 'Join airline loyalty programs, fly frequently for status, bid on upgrades, use miles, ask at check-in (low success rate).' },
  { q: 'What if my flight is delayed/cancelled?', a: 'US: Airlines must rebook you free. EU: Compensation €250-600 for delays 3+ hours. Get meal vouchers, hotel if overnight.' },
  { q: 'Are connecting flights risky?', a: 'Leave 60-90 min domestic, 2-3 hours international. Book same ticket for protection. Airlines responsible if connection missed.' },
];

const content = {
  en: {
    pageTitle: 'Find Your Perfect Flight',
    sectionTitle: 'Search, Compare & Book Flights with Confidence',
    subtitle: 'AI-powered search across 500+ airlines for the best deals',
    cabinClassTitle: '✈️ Flight Classes & Cabin Types',
    cabinClassSubtitle: 'Choose the perfect cabin for your journey',
    cabinClasses: baseCabinClasses,
    alliancesTitle: '🌐 Airlines by Alliance',
    alliancesSubtitle: 'Maximize your loyalty benefits and global network',
    alliances: baseAlliances,
    featuresTitle: '💼 Flight Features & Services',
    featuresSubtitle: 'What to expect on modern flights',
    features: baseFlightFeatures,
    tipsTitle: '🎯 Expert Flight Booking Tips',
    tipsSubtitle: 'Save money and get the best experience',
    tips: baseBookingTips,
    faqTitle: '❓ Flight Booking FAQ',
    faqs: baseFaqs,
  },
  pt: {
    pageTitle: 'Encontre Seu Voo Perfeito',
    sectionTitle: 'Busque, Compare e Reserve Voos com Confiança',
    subtitle: 'Busca com IA em 500+ companhias aéreas para as melhores ofertas',
    cabinClassTitle: '✈️ Classes e Tipos de Cabine',
    cabinClassSubtitle: 'Escolha a cabine perfeita para sua viagem',
    cabinClasses: baseCabinClasses,
    alliancesTitle: '🌐 Companhias por Aliança',
    alliancesSubtitle: 'Maximize benefícios de fidelidade e rede global',
    alliances: baseAlliances,
    featuresTitle: '💼 Recursos e Serviços de Voo',
    featuresSubtitle: 'O que esperar em voos modernos',
    features: baseFlightFeatures,
    tipsTitle: '🎯 Dicas de Reserva',
    tipsSubtitle: 'Economize e tenha a melhor experiência',
    tips: baseBookingTips,
    faqTitle: '❓ Perguntas Frequentes',
    faqs: baseFaqs,
  },
  es: {
    pageTitle: 'Encuentra Tu Vuelo Perfecto',
    sectionTitle: 'Busca, Compara y Reserva Vuelos con Confianza',
    subtitle: 'Búsqueda con IA en 500+ aerolíneas para las mejores ofertas',
    cabinClassTitle: '✈️ Clases y Tipos de Cabina',
    cabinClassSubtitle: 'Elige la cabina perfecta para tu viaje',
    cabinClasses: baseCabinClasses,
    alliancesTitle: '🌐 Aerolíneas por Alianza',
    alliancesSubtitle: 'Maximiza beneficios de lealtad y red global',
    alliances: baseAlliances,
    featuresTitle: '💼 Características y Servicios',
    featuresSubtitle: 'Qué esperar en vuelos modernos',
    features: baseFlightFeatures,
    tipsTitle: '🎯 Consejos de Reserva',
    tipsSubtitle: 'Ahorra y ten la mejor experiencia',
    tips: baseBookingTips,
    faqTitle: '❓ Preguntas Frecuentes',
    faqs: baseFaqs,
  },
};

export default function FlightsPage() {
  const [lang, setLang] = useState<Language>('en');
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const t = content[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Blue Theme */}
      <div className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 border-b border-gray-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(59, 130, 246) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative overflow-hidden md:overflow-visible" noPadding={true} style={{ padding: '12px 0 8px' }}>
          <div className="px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 animate-fadeIn">
              <div className="overflow-x-auto md:overflow-visible scrollbar-hide" style={{ width: '100%' }}>
                <h1 key={`title-${animationKey}`} className="hero-title text-lg sm:text-xl md:text-3xl font-extrabold tracking-tight sm:tracking-wide" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                  {mounted ? t.sectionTitle.split('').map((char, index) => (
                    <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )) : <span style={{ opacity: 0 }}>{t.sectionTitle}</span>}
                </h1>
              </div>
              <span className="hidden md:inline-block text-blue-400 text-2xl font-bold mx-1">•</span>
              <div className="overflow-x-auto md:overflow-visible scrollbar-hide" style={{ width: '100%' }}>
                <p key={`subtitle-${animationKey}`} className="hero-subtitle text-gray-700/90 mb-0 font-medium text-xs sm:text-sm md:text-lg leading-tight sm:leading-normal" style={{ display: 'inline-block', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  {mounted ? t.subtitle.split('').map((char, index) => (
                    <span key={index} className="letter-elastic" style={{ animationDelay: `${2.0 + (index * 0.028)}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )) : <span style={{ opacity: 0 }}>{t.subtitle}</span>}
                </p>
              </div>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #3b82f6, #06b6d4); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #0891b2, #1e40af); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #06b6d4, #3b82f6); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
        @media (min-width: 768px) {
          .floating-orb-1 { width: 300px; height: 300px; top: -150px; left: 10%; }
          .floating-orb-2 { width: 250px; height: 250px; top: -100px; right: 15%; }
          .floating-orb-3 { width: 200px; height: 200px; bottom: -100px; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -8px) scale(1.02); }
          50% { transform: translate(-8px, 5px) scale(0.98); }
          75% { transform: translate(6px, -6px) scale(1.01); }
        }
        .hero-title { color: #1e40af; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(30, 64, 175, 0.15); position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; color: #374151; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* Search Bar */}
      <div className="border-b border-gray-100">
        <MobileHomeSearchWrapper lang={lang} />
      </div>

      {/* Compact Trust Bar */}
      <CompactTrustBar sticky />

      {/* ============ EXISTING FLIGHT SECTIONS ============ */}

      {/* Recently Viewed */}
      <div className="mt-2 sm:mt-3 md:mt-5">
        <RecentlyViewedSection lang={lang} />
      </div>

      {/* Flash Deals */}
      <div className="mt-2 sm:mt-3 md:mt-5">
        <FlashDealsSectionEnhanced lang={lang} />
      </div>

      {/* Popular Routes */}
      <div className="mt-2 sm:mt-3 md:mt-5">
        <PopularRoutesSection />
      </div>

      {/* ============ NEW FLIGHT-SPECIFIC SECTIONS ============ */}

      {/* 1. Flight Classes & Cabin Types - WITH PHOTOS */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t.cabinClassTitle}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t.cabinClassSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {t.cabinClasses.map((cabin, idx) => {
              const IconComponent = cabin.icon;
              return (
                <div key={idx} className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-blue-400 group cursor-pointer h-[320px]">
                  <Image
                    src={cabin.image}
                    alt={cabin.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"></div>
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cabin.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{cabin.name}</h3>
                      <p className="text-sm text-white/90 mb-3 drop-shadow-md">{cabin.description}</p>
                      <div className="text-xl font-bold text-blue-400 mb-3 drop-shadow-lg">{cabin.priceRange}</div>
                      <div className="flex flex-wrap gap-2">
                        {cabin.features.map((feat, i) => (
                          <span key={i} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white border border-white/30">{feat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 2. Airlines by Alliance */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t.alliancesTitle}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t.alliancesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {t.alliances.map((alliance, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300 group cursor-pointer">
                <div className="text-5xl mb-3 text-center">{alliance.logo}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{alliance.name}</h3>
                <p className="text-sm text-gray-600 mb-1 text-center">{alliance.airlines}</p>
                <p className="text-sm font-semibold text-blue-600 mb-4 text-center">{alliance.network}</p>
                <div className="space-y-1">
                  {alliance.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 3. Flight Features & Services */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t.featuresTitle}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-2 md:px-0">
            {t.features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 group cursor-pointer text-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{feature.name}</h4>
                  <p className="text-xs text-gray-500">{feature.availability}</p>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 4. Expert Booking Tips */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t.tipsTitle}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t.tipsSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {t.tips.map((tip, idx) => {
              const IconComponent = tip.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 mb-1">{tip.tip}</h4>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* Destinations */}
      <div className="mt-2 sm:mt-3 md:mt-5">
        <DestinationsSectionEnhanced lang={lang} />
      </div>

      {/* 5. Flight Booking FAQ */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t.faqTitle}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Everything you need to know about booking flights with Fly2Any</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {t.faqs.map((faq, idx) => (
              <details key={idx} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300 group">
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span className="flex-1 text-base md:text-lg">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
              <Shield className="w-5 h-5" />
              Contact Our Support Team
            </a>
          </div>
        </MaxWidthContainer>
      </div>
    </div>
  );
}
