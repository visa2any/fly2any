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
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { FlightSearchAnswers } from '@/components/seo/DirectAnswerBlock';
import {
  Plane, Star, Wifi, TvMinimalPlay, UtensilsCrossed, Armchair,
  Luggage, CreditCard, Award, Globe, Shield, ChevronRight,
  Sparkles, TrendingUp, Clock, DollarSign, AlertCircle, Calendar
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';

// Base data (language-agnostic)
const baseCabinClasses = [
  {
    name: 'Economy Class',
    description: 'Affordable comfort for budget-conscious travelers',
    priceRange: '$200-$800',
    icon: Plane,
    color: 'from-info-500 to-cyan-600',
    features: ['Standard Seat', 'Carry-on Bag', 'Meal Service', 'Entertainment'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80' // Economy cabin
  },
  {
    name: 'Premium Economy',
    description: 'Extra legroom and enhanced amenities',
    priceRange: '$500-$1,500',
    icon: Armchair,
    color: 'from-primary-500 to-purple-600',
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
    color: 'from-info-500 to-indigo-600',
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

export default function FlightsPage() {
  const t = useTranslations('FlightsPage');
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);

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
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - Level-6 Fly2Any Brand Theme */}
      <div className="relative bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 border-b border-neutral-200/60 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E74035 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative" noPadding={true}>
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 animate-fadeIn">
              <h1 key={`title-${animationKey}`} className="hero-title text-[13px] sm:text-lg md:text-3xl lg:text-[36px] font-extrabold tracking-[0.01em] leading-tight whitespace-nowrap">
                {mounted ? t('sectionTitle').split('').map((char, index) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t('sectionTitle')}</span>}
              </h1>
              <span className="hidden md:inline-block text-primary-400 text-xl lg:text-2xl font-bold mx-2">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-neutral-600 mb-0 font-medium text-[11px] sm:text-sm md:text-base lg:text-lg leading-tight whitespace-nowrap" style={{ letterSpacing: '0.01em' }}>
                {mounted ? t('subtitle').split('').map((char, index) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${2.0 + (index * 0.028)}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t('subtitle')}</span>}
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.12; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #E74035, #F7C928); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #D63B34, #E74035); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #F7C928, #E74035); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #E74035; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(231, 64, 53, 0.12); position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; color: #525252; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* Search Bar */}
      <div className="border-b border-neutral-100">
        <MobileHomeSearchWrapper lang={lang} />
      </div>

      {/* Compact Trust Bar */}
      <CompactTrustBar sticky />

      {/* ============ EXISTING FLIGHT SECTIONS - Level-6 Spacing ============ */}

      {/* Recently Viewed */}
      <div className="mt-2 md:mt-6 lg:mt-8">
        <RecentlyViewedSection lang={lang} />
      </div>

      {/* Flash Deals */}
      <div className="mt-2 md:mt-6 lg:mt-8">
        <FlashDealsSectionEnhanced lang={lang} />
      </div>

      {/* Popular Routes */}
      <div className="mt-2 md:mt-6 lg:mt-8">
        <PopularRoutesSection />
      </div>

      {/* ============ NEW FLIGHT-SPECIFIC SECTIONS ============ */}

      {/* 1. Flight Classes & Cabin Types - Level-6 Ultra-Premium */}
      <div className="bg-gradient-to-br from-neutral-50 to-white py-4 md:py-8 lg:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-4 md:mb-6 lg:mb-8 px-3 md:px-0">
            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-1 md:mb-2">{t('cabinClassTitle')}</h2>
            <p className="text-xs md:text-sm lg:text-base text-neutral-500">{t('cabinClassSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5 md:gap-6 px-0 md:px-0">
            {baseCabinClasses.map((cabin, idx) => {
              const IconComponent = cabin.icon;
              return (
                <div key={idx} className="relative md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-y md:border border-neutral-200 hover:border-primary-400 lg:hover:-translate-y-1 group cursor-pointer h-[300px] md:h-[320px]">
                  <Image
                    src={cabin.image}
                    alt={cabin.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="relative h-full p-4 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${cabin.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-lg`}>
                        <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 drop-shadow-lg">{cabin.name}</h3>
                      <p className="text-xs md:text-sm text-white/90 mb-2 md:mb-3 drop-shadow-md">{cabin.description}</p>
                      <div className="text-lg md:text-xl font-bold text-primary-400 mb-2 md:mb-3 drop-shadow-lg">{cabin.priceRange}</div>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {cabin.features.map((feat, i) => (
                          <span key={i} className="text-[10px] md:text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 md:py-1 rounded-full text-white border border-white/30">{feat}</span>
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

      {/* 2. Airlines by Alliance - Level-6 */}
      <div className="bg-white py-4 md:py-8 lg:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-4 md:mb-6 lg:mb-8 px-3 md:px-0">
            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-1 md:mb-2">{t('alliancesTitle')}</h2>
            <p className="text-xs md:text-sm lg:text-base text-neutral-500">{t('alliancesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5 md:gap-6 px-0 md:px-0">
            {baseAlliances.map((alliance, idx) => (
              <div key={idx} className="bg-white md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-y md:border border-neutral-200 hover:border-primary-300 lg:hover:-translate-y-1 group cursor-pointer">
                <div className="text-4xl md:text-5xl mb-3 text-center">{alliance.logo}</div>
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-2 text-center">{alliance.name}</h3>
                <p className="text-xs md:text-sm text-neutral-600 mb-1 text-center">{alliance.airlines}</p>
                <p className="text-xs md:text-sm font-semibold text-primary-500 mb-3 md:mb-4 text-center">{alliance.network}</p>
                <div className="space-y-1">
                  {alliance.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <span className="text-[11px] md:text-xs text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 3. Flight Features & Services - Level-6 */}
      <div className="bg-gradient-to-br from-primary-50/30 to-secondary-50/20 py-4 md:py-8 lg:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-4 md:mb-6 lg:mb-8 px-3 md:px-0">
            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-1 md:mb-2">{t('featuresTitle')}</h2>
            <p className="text-xs md:text-sm lg:text-base text-neutral-500">{t('featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0.5 md:gap-4 px-0 md:px-0">
            {baseFlightFeatures.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="bg-white md:rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-y md:border border-neutral-200 hover:border-primary-300 lg:hover:-translate-y-0.5 group cursor-pointer text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-primary-100 transition-colors duration-150">
                    <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
                  </div>
                  <h4 className="text-xs md:text-sm font-semibold text-neutral-900 mb-0.5 md:mb-1">{feature.name}</h4>
                  <p className="text-[10px] md:text-xs text-neutral-500">{feature.availability}</p>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 4. Expert Booking Tips - Level-6 */}
      <div className="bg-white py-4 md:py-8 lg:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-4 md:mb-6 lg:mb-8 px-3 md:px-0">
            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-1 md:mb-2">{t('tipsTitle')}</h2>
            <p className="text-xs md:text-sm lg:text-base text-neutral-500">{t('tipsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 md:gap-6 px-0 md:px-0">
            {baseBookingTips.map((tip, idx) => {
              const IconComponent = tip.icon;
              return (
                <div key={idx} className="bg-white md:rounded-xl p-4 md:p-5 shadow-md hover:shadow-xl transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-y md:border border-primary-100 hover:border-primary-300 lg:hover:-translate-y-0.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-bold text-neutral-900 mb-1">{tip.tip}</h4>
                      <p className="text-xs md:text-sm text-neutral-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* Destinations */}
      <div className="mt-2 md:mt-6 lg:mt-8">
        <DestinationsSectionEnhanced lang={lang} />
      </div>

      {/* 5. Flight Booking FAQ - Level-6 */}
      <div className="bg-gradient-to-br from-neutral-50 via-primary-50/10 to-neutral-50 py-4 md:py-8 lg:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-4 md:mb-6 lg:mb-8 px-3 md:px-0">
            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-1 md:mb-2">{t('faqTitle')}</h2>
            <p className="text-xs md:text-sm lg:text-base text-neutral-500">{t('faqIntro')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0.5 md:gap-6 px-0 md:px-0">
            {baseFaqs.map((faq, idx) => (
              <details key={idx} className="bg-white md:rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-y md:border border-neutral-200 hover:border-primary-300 group">
                <summary className="font-bold text-neutral-900 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span className="flex-1 text-sm md:text-base lg:text-lg">{faq.q}</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-primary-500 group-open:rotate-90 transition-transform duration-150 flex-shrink-0" />
                </summary>
                <p className="mt-3 md:mt-4 text-neutral-600 text-xs md:text-sm lg:text-base leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 md:mt-8 text-center px-3 md:px-0">
            <p className="text-neutral-600 text-sm md:text-base mb-3 md:mb-4">{t('stillHaveQuestions')}</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] text-sm md:text-base">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              {t('contactSupport')}
            </a>
          </div>
        </MaxWidthContainer>
      </div>

      {/* AEO Direct Answers */}
      <div className="bg-gradient-to-br from-neutral-50 to-blue-50 py-6 md:py-8">
        <MaxWidthContainer className="px-3 md:px-6">
          <FlightSearchAnswers />
        </MaxWidthContainer>
      </div>

      {/* Helpful Resources */}
      <div className="bg-white py-6 md:py-8">
        <MaxWidthContainer className="px-3 md:px-6">
          <RelatedLinks
            category="flights"
            variant="horizontal"
            title="Helpful Resources"
          />
        </MaxWidthContainer>
      </div>
    </div>
  );
}
