'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { AnimatedTitle } from '@/components/home/AnimatedTitle';
import { HotelsSectionEnhanced } from '@/components/home/HotelsSectionEnhanced';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Building2, Star, Home, Briefcase, Coffee, Palmtree, Mountain,
  Wifi, Waves, Dumbbell, UtensilsCrossed, ParkingCircle, Dog,
  Sparkles, TrendingUp, Clock, MapPin, Shield, Award, ChevronRight,
  Gem, Hotel, Castle, Building, Heart, Users, Bed, Calendar
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';

// Base data (language-agnostic)
const baseStarCategories = [
  {
    stars: 5,
    title: '5-Star Luxury',
    description: 'Premium service, exceptional amenities, world-class dining',
    priceRange: '$200-$800/night',
    icon: Gem,
    color: 'from-amber-500 to-yellow-600',
    features: ['Concierge', 'Fine Dining', 'Spa', 'Butler Service'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' // Luxury hotel lobby
  },
  {
    stars: 4,
    title: '4-Star Premium',
    description: 'High-quality service, excellent facilities, great restaurants',
    priceRange: '$100-$300/night',
    icon: Star,
    color: 'from-blue-500 to-indigo-600',
    features: ['Room Service', 'Gym', 'Restaurant', 'Business Center'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' // Modern premium hotel
  },
  {
    stars: 3,
    title: '3-Star Value',
    description: 'Comfortable rooms, good amenities, reliable service',
    priceRange: '$60-$150/night',
    icon: Hotel,
    color: 'from-green-500 to-emerald-600',
    features: ['WiFi', 'Breakfast', 'Front Desk', 'Clean Rooms'],
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' // Comfortable hotel room
  },
  {
    stars: 2,
    title: 'Budget-Friendly',
    description: 'Basic accommodations, essential amenities, great savings',
    priceRange: '$30-$80/night',
    icon: Bed,
    color: 'from-orange-500 to-red-600',
    features: ['WiFi', 'Clean Rooms', 'Basic Amenities', 'Affordable'],
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80' // Budget hotel room
  },
];

const basePropertyTypes = [
  {
    type: 'Luxury Resort',
    icon: Castle,
    description: 'All-inclusive paradise with premium amenities',
    avgPrice: '$300-$1000',
    bestFor: 'Honeymoons, Relaxation',
    color: 'from-purple-500 to-pink-600'
  },
  {
    type: 'Boutique Hotel',
    icon: Sparkles,
    description: 'Unique, stylish, personalized experience',
    avgPrice: '$150-$400',
    bestFor: 'Romantic Getaways',
    color: 'from-pink-500 to-rose-600'
  },
  {
    type: 'Business Hotel',
    icon: Briefcase,
    description: 'Modern amenities, meeting rooms, city center',
    avgPrice: '$100-$250',
    bestFor: 'Business Travelers',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    type: 'Bed & Breakfast',
    icon: Coffee,
    description: 'Cozy, homey, includes breakfast',
    avgPrice: '$80-$180',
    bestFor: 'Couples, Cultural Travel',
    color: 'from-amber-500 to-orange-600'
  },
  {
    type: 'Vacation Rental',
    icon: Home,
    description: 'Entire homes, condos, full kitchens',
    avgPrice: '$100-$500',
    bestFor: 'Families, Long Stays',
    color: 'from-green-500 to-teal-600'
  },
  {
    type: 'Hostel',
    icon: Users,
    description: 'Budget-friendly, social, shared spaces',
    avgPrice: '$15-$50',
    bestFor: 'Backpackers, Solo Travelers',
    color: 'from-yellow-500 to-amber-600'
  },
];

const baseDealCategories = [
  {
    category: 'Beach Resorts',
    discount: '50% OFF',
    description: 'Oceanfront paradise, white sand beaches',
    icon: Waves,
    color: 'from-cyan-500 to-blue-600',
    savings: 'Save up to $500'
  },
  {
    category: 'City Hotels',
    discount: '30% OFF',
    description: 'Downtown locations, near attractions',
    icon: Building2,
    color: 'from-gray-600 to-slate-700',
    savings: 'Save up to $200'
  },
  {
    category: 'Mountain Lodges',
    discount: '40% OFF',
    description: 'Ski resorts, mountain views, cozy fireplaces',
    icon: Mountain,
    color: 'from-indigo-500 to-purple-600',
    savings: 'Save up to $350'
  },
  {
    category: 'Romantic Getaways',
    discount: '35% OFF',
    description: 'Couples packages, spa, champagne',
    icon: Heart,
    color: 'from-pink-500 to-red-600',
    savings: 'Save up to $400'
  },
  {
    category: 'Family-Friendly',
    discount: 'Kids Stay Free',
    description: 'Water parks, activities, family suites',
    icon: Users,
    color: 'from-green-500 to-emerald-600',
    savings: 'Save up to $300'
  },
  {
    category: 'Last-Minute Deals',
    discount: 'Up to 60% OFF',
    description: 'Tonight\'s deals, instant booking',
    icon: Clock,
    color: 'from-orange-500 to-red-600',
    savings: 'Save up to $600'
  },
];

const baseAmenities = [
  { name: 'Swimming Pool', icon: Waves, count: '250K+ hotels' },
  { name: 'Free WiFi', icon: Wifi, count: '400K+ hotels' },
  { name: 'Fitness Center', icon: Dumbbell, count: '180K+ hotels' },
  { name: 'Restaurant & Bar', icon: UtensilsCrossed, count: '220K+ hotels' },
  { name: 'Free Parking', icon: ParkingCircle, count: '300K+ hotels' },
  { name: 'Pet-Friendly', icon: Dog, count: '80K+ hotels' },
  { name: 'Spa & Wellness', icon: Sparkles, count: '60K+ hotels' },
  { name: 'Beach Access', icon: Palmtree, count: '45K+ hotels' },
];

const baseChains = [
  { name: 'Marriott Bonvoy', properties: '8,000+', logo: '🏨', discount: '15% off' },
  { name: 'Hilton Honors', properties: '6,800+', logo: '🏛️', discount: '20% off' },
  { name: 'World of Hyatt', properties: '1,150+', logo: '⭐', discount: '25% off' },
  { name: 'IHG Rewards', properties: '6,000+', logo: '🌟', discount: '18% off' },
  { name: 'Accor Live Limitless', properties: '5,300+', logo: '💎', discount: '22% off' },
  { name: 'Wyndham Rewards', properties: '9,000+', logo: '🏆', discount: '12% off' },
];

const baseTips = [
  {
    tip: 'Book 60-90 days in advance',
    description: 'Sweet spot for best prices, especially for popular destinations',
    icon: Calendar
  },
  {
    tip: 'Join loyalty programs (free!)',
    description: 'Earn points, free WiFi, room upgrades, late checkout',
    icon: Award
  },
  {
    tip: 'Book directly with hotel',
    description: 'Often get better rates, easier cancellations, loyalty points',
    icon: Building2
  },
  {
    tip: 'Ask for upgrades at check-in',
    description: 'Polite requests often work, especially during off-peak',
    icon: TrendingUp
  },
  {
    tip: 'Check for hidden fees',
    description: 'Resort fees, parking, WiFi can add $50-100/night',
    icon: Shield
  },
  {
    tip: 'Use incognito mode',
    description: 'Prices can increase based on search history and cookies',
    icon: Sparkles
  },
];

const baseFaqs = [
  { q: 'What is the standard check-in time?', a: 'Most hotels allow check-in at 3:00 PM or 4:00 PM. Early check-in may be available for a fee ($25-75) or free based on availability.' },
  { q: 'Can I cancel my hotel reservation?', a: 'Most hotels offer free cancellation 24-48 hours before check-in. Non-refundable rates save 10-30% but cannot be cancelled.' },
  { q: 'Are resort fees included in the price?', a: 'Resort fees ($20-50/night) are often NOT included and cover amenities like WiFi, pool, gym. Always check the fine print.' },
  { q: 'How do I get a room upgrade?', a: 'Join the hotel loyalty program, book directly, ask politely at check-in, travel during off-peak, or book higher rate categories.' },
  { q: 'Is breakfast included?', a: 'Depends on the hotel and rate. Look for "breakfast included" labels. Continental breakfast is usually free, full breakfast may cost extra.' },
  { q: 'What about parking fees?', a: 'City hotels charge $20-60/day for parking. Suburban/resort hotels often offer free parking. Always verify before booking.' },
];

export default function HotelsPage() {
  const t = useTranslations('HotelsPage');
  const { language: lang, setLanguage: setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Hero Section - Orange Theme */}
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-50 border-b border-orange-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(249, 115, 22) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative overflow-hidden md:overflow-visible" noPadding={true} style={{ padding: '12px 0 8px' }}>
          <div className="px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 animate-fadeIn" suppressHydrationWarning>
              <h1 className="hero-title text-lg sm:text-xl md:text-3xl font-extrabold tracking-tight sm:tracking-wide whitespace-nowrap overflow-x-auto scrollbar-hide" suppressHydrationWarning>
                <AnimatedTitle
                  text={t('sectionTitle')}
                  animationDelay={0}
                  letterDelay={0.038}
                />
              </h1>
              <span className="hidden md:inline-block text-orange-400 text-2xl font-bold mx-1">•</span>
              <p className="hero-subtitle text-gray-700/90 mb-0 font-medium text-xs sm:text-sm md:text-lg leading-tight sm:leading-normal whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ letterSpacing: '-0.01em' }} suppressHydrationWarning>
                <AnimatedTitle
                  text={t('subtitle')}
                  animationDelay={2.0}
                  letterDelay={0.028}
                />
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #f97316, #fb923c); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #ea580c, #f97316); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #fb923c, #f97316); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #c2410c; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(194, 65, 12, 0.15); position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; color: #374151; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* Hotel Search Bar with Multi-Service Tabs */}
      <div className="py-6 md:py-8 bg-gradient-to-b from-orange-50/30 to-white">
        <MaxWidthContainer>
          <MobileHomeSearchWrapper lang={lang} defaultService="hotels" />
        </MaxWidthContainer>
      </div>

      {/* Compact Trust Bar */}
      <CompactTrustBar sticky />

      {/* ============ ALL NEW HOTEL SECTIONS ============ */}

      {/* 1. Hotels by Star Rating */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('starRatingTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('starRatingSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseStarCategories.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <div key={idx} className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-orange-400 group cursor-pointer h-[320px]">
                  {/* Background Image */}
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Lighter Gradient Overlay - Shows more of the beautiful hotel photos */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"></div>

                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    {/* Top Section - Icon & Stars */}
                    <div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(cat.stars)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-lg" />))}
                      </div>
                    </div>

                    {/* Bottom Section - Hotel Info */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{cat.title}</h3>
                      <p className="text-sm text-white/90 mb-3 drop-shadow-md">{cat.description}</p>
                      <div className="text-xl font-bold text-orange-400 mb-3 drop-shadow-lg">{cat.priceRange}</div>
                      <div className="flex flex-wrap gap-2">
                        {cat.features.map((feat, i) => (
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

      {/* 2. Hotel Property Types */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('propertyTypesTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('propertyTypesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {basePropertyTypes.map((prop, idx) => {
              const IconComponent = prop.icon;
              return (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-orange-300 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${prop.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{prop.type}</h3>
                  <p className="text-sm text-gray-600 mb-3">{prop.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-orange-600">{prop.avgPrice}</span>
                    <span className="text-gray-500">{prop.bestFor}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 3. Hotel Deals */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('dealsTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('dealsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseDealCategories.map((deal, idx) => {
              const IconComponent = deal.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400 group cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">{deal.discount}</div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${deal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.category}</h3>
                  <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                  <div className="text-lg font-bold text-green-600">{deal.savings}</div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 4. Amenities Explorer */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('amenitiesTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('amenitiesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 px-2 md:px-0">
            {baseAmenities.map((amenity, idx) => {
              const IconComponent = amenity.icon;
              return (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 group cursor-pointer text-center">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{amenity.name}</h4>
                  <p className="text-xs text-gray-500">{amenity.count}</p>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 5. Top Hotel Chains */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('chainsTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('chainsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-2 md:px-0">
            {baseChains.map((chain, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-orange-300 group cursor-pointer text-center">
                <div className="text-4xl mb-2">{chain.logo}</div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{chain.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{chain.properties}</p>
                <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">{chain.discount}</span>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </div>

      {/* Featured Hotels */}
      <div className="mt-2 sm:mt-3 md:mt-5">
        <HotelsSectionEnhanced lang={lang} />
      </div>

      {/* 6. Booking Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('tipsTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('tipsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseTips.map((tip, idx) => {
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

      {/* Recently Viewed */}
      <div className="mt-2 sm:mt-3 md:mt-5">
        <RecentlyViewedSection lang={lang} />
      </div>

      {/* 7. REDESIGNED FAQ - Smart 2-Column Layout on Desktop, Single Column on Mobile */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t('faqTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('faqIntro')}</p>
          </div>

          {/* 2-Column Grid on Desktop, Single Column on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseFaqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300 group"
              >
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span className="flex-1 text-base md:text-lg">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* CTA for More Questions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">{t('stillHaveQuestions')}</p>
            <a
              href="mailto:support@fly2any.com"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Shield className="w-5 h-5" />
              {t('contactSupport')}
            </a>
          </div>
        </MaxWidthContainer>
      </div>
    </div>
  );
}
