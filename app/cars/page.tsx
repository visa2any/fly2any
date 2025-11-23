'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Car, Fuel, Shield, MapPin, DollarSign, Clock, Users, Luggage,
  Zap, Baby, Wifi, Navigation, Phone, Settings, Award, TrendingUp,
  Calendar, AlertCircle, ChevronRight, CheckCircle, Building2, Globe,
  CreditCard, FileCheck, Key, Sparkles, Briefcase, UtensilsCrossed, Star
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';

// Base data (language-agnostic)
const baseVehicleTypes = [
  {
    type: 'Economy',
    description: 'Compact, fuel-efficient cars perfect for city driving',
    priceRange: '$25-$45/day',
    icon: Car,
    color: 'from-green-500 to-emerald-600',
    features: ['4-5 Seats', '2 Bags', 'Excellent MPG', 'Easy Parking'],
    examples: 'Toyota Yaris, Honda Fit, Nissan Versa',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80' // Compact car
  },
  {
    type: 'Compact SUV',
    description: 'Versatile crossovers with space and comfort',
    priceRange: '$45-$75/day',
    icon: Car,
    color: 'from-blue-500 to-cyan-600',
    features: ['5 Seats', '3-4 Bags', 'AWD Available', 'Higher Ground Clearance'],
    examples: 'Honda CR-V, Toyota RAV4, Mazda CX-5',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80' // SUV
  },
  {
    type: 'Full-Size SUV',
    description: 'Spacious SUVs for families and groups',
    priceRange: '$75-$120/day',
    icon: Car,
    color: 'from-indigo-500 to-purple-600',
    features: ['7-8 Seats', '5+ Bags', 'Powerful Engine', 'Towing Capable'],
    examples: 'Chevy Tahoe, Ford Expedition, GMC Yukon',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80' // Large SUV
  },
  {
    type: 'Luxury / Premium',
    description: 'High-end vehicles with premium features',
    priceRange: '$80-$200/day',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    features: ['Premium Interior', 'Advanced Tech', 'Superior Comfort', 'Prestige Brands'],
    examples: 'BMW 5 Series, Mercedes E-Class, Audi A6',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80' // Luxury sedan
  },
  {
    type: 'Electric / Hybrid',
    description: 'Eco-friendly cars with excellent efficiency',
    priceRange: '$50-$90/day',
    icon: Zap,
    color: 'from-teal-500 to-green-600',
    features: ['Zero/Low Emissions', 'Quiet Ride', 'Tech-Forward', 'Charging Included'],
    examples: 'Tesla Model 3, Chevy Bolt, Nissan Leaf',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80' // Electric car
  },
  {
    type: 'Minivan / 7-Seater',
    description: 'Perfect for family trips and large groups',
    priceRange: '$60-$100/day',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    features: ['7-8 Seats', 'Sliding Doors', 'Spacious Interior', 'Entertainment Systems'],
    examples: 'Honda Odyssey, Chrysler Pacifica, Toyota Sienna',
    image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80' // Minivan
  },
];

const baseRentalCompanies = [
  {
    name: 'Enterprise',
    logo: '🚗',
    locations: '9,500+',
    rating: 4.5,
    benefits: ['Free pickup', 'Long-term discounts', 'Loyalty rewards'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    name: 'Hertz',
    logo: '⭐',
    locations: '10,200+',
    rating: 4.3,
    benefits: ['Gold Plus Rewards', 'Skip the counter', 'Premium fleet'],
    color: 'from-yellow-500 to-amber-600'
  },
  {
    name: 'Budget',
    logo: '💰',
    locations: '3,350+',
    rating: 4.2,
    benefits: ['Best price guarantee', 'Fastbreak service', 'Young driver friendly'],
    color: 'from-orange-500 to-red-600'
  },
  {
    name: 'Avis',
    logo: '🏆',
    locations: '5,500+',
    rating: 4.4,
    benefits: ['Preferred service', 'Worldwide coverage', 'Business perks'],
    color: 'from-red-500 to-rose-600'
  },
  {
    name: 'National',
    logo: '👑',
    locations: '2,000+',
    rating: 4.6,
    benefits: ['Emerald Club', 'Choose any car', 'Executive service'],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Alamo',
    logo: '🎯',
    locations: '1,250+',
    rating: 4.3,
    benefits: ['Family-friendly', 'Insider pricing', 'Free additional drivers'],
    color: 'from-teal-500 to-cyan-600'
  },
];

const baseInsuranceOptions = [
  {
    type: 'Collision Damage Waiver (CDW)',
    cost: '$15-$30/day',
    icon: Shield,
    coverage: 'Covers damage to the rental car',
    recommended: 'Essential if no credit card coverage',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    type: 'Liability Protection (LIS)',
    cost: '$10-$20/day',
    icon: FileCheck,
    coverage: 'Covers damage to other vehicles/property',
    recommended: 'Check your personal auto insurance first',
    color: 'from-green-500 to-emerald-600'
  },
  {
    type: 'Personal Accident Insurance (PAI)',
    cost: '$5-$10/day',
    icon: AlertCircle,
    coverage: 'Medical costs for you and passengers',
    recommended: 'May be covered by health/travel insurance',
    color: 'from-purple-500 to-pink-600'
  },
  {
    type: 'Personal Effects Coverage (PEC)',
    cost: '$3-$8/day',
    icon: Luggage,
    coverage: 'Protects your belongings in the car',
    recommended: 'Check homeowners/renters insurance',
    color: 'from-amber-500 to-orange-600'
  },
];

const basePopularLocations = [
  {
    location: 'Airport Locations',
    icon: Globe,
    benefit: 'Convenient pickup/drop-off',
    note: 'May include airport fees ($10-30)',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    location: 'Downtown / City Center',
    icon: Building2,
    benefit: 'No airport fees, easy access',
    note: 'Free shuttles often available',
    color: 'from-green-500 to-teal-600'
  },
  {
    location: 'Hotel Pickup',
    icon: MapPin,
    benefit: 'Delivered to your hotel',
    note: 'May incur delivery fee ($20-50)',
    color: 'from-purple-500 to-pink-600'
  },
  {
    location: 'Neighborhood Branches',
    icon: Navigation,
    benefit: 'Local, personalized service',
    note: 'Often better rates than airports',
    color: 'from-orange-500 to-red-600'
  },
];

const baseFuelPolicies = [
  {
    policy: 'Full-to-Full (Best)',
    description: 'Pick up full, return full. Most economical',
    icon: Fuel,
    savings: 'Save $20-50 per rental',
    color: 'from-green-500 to-emerald-600'
  },
  {
    policy: 'Pre-Purchase Fuel',
    description: 'Pay upfront for a full tank, return empty',
    icon: DollarSign,
    savings: 'Usually overpriced, avoid if possible',
    color: 'from-orange-500 to-red-600'
  },
  {
    policy: 'Refueling Service',
    description: 'Return with any fuel level, company refills',
    icon: AlertCircle,
    savings: 'Expensive: $8-12/gallon + service fee',
    color: 'from-red-500 to-rose-600'
  },
];

const baseTips = [
  {
    tip: 'Book early for best rates',
    description: 'Prices increase as pickup date approaches. Book 2-4 weeks ahead for savings of 20-40%',
    icon: Calendar
  },
  {
    tip: 'Inspect before you drive',
    description: 'Document all existing damage with photos/video. Check tires, lights, interior. Get agent to sign off',
    icon: CheckCircle
  },
  {
    tip: 'Decline unnecessary insurance',
    description: 'Credit cards often include CDW. Personal auto insurance may extend to rentals. Can save $20-40/day',
    icon: Shield
  },
  {
    tip: 'Return on time to avoid fees',
    description: 'Late returns can cost $10-50/hour. Some companies charge full extra day after 30 minutes',
    icon: Clock
  },
  {
    tip: 'Join loyalty programs (free)',
    description: 'Skip lines, earn free days, get upgrades. Enterprise, Hertz, National all offer free memberships',
    icon: Award
  },
  {
    tip: 'Fill up before returning',
    description: 'Gas stations near rental returns often overpriced. Fill up 5 miles away to save $10-20',
    icon: Fuel
  },
];

const baseFaqs = [
  { q: 'What do I need to rent a car?', a: 'Valid driver\'s license (held for 1+ years), credit card in driver\'s name, minimum age (usually 21-25). International travelers need passport and may need International Driving Permit (IDP).' },
  { q: 'Can I rent a car under 25 years old?', a: 'Yes, but expect young driver fees of $15-35/day. Some companies (Enterprise, Budget) waive fees for AAA members or corporate bookings. Minimum age is usually 21 (some allow 18).' },
  { q: 'What insurance do I really need?', a: 'Check if your personal auto insurance and credit card already cover rentals. CDW is essential if no other coverage. LIS may duplicate personal insurance. PAI/PEC usually unnecessary.' },
  { q: 'Can I drive the rental car across state lines or borders?', a: 'US/Canada: Usually allowed. Mexico: Requires special insurance ($20-40/day). Europe: Most countries OK, but check restrictions for Eastern Europe. Always notify rental company.' },
  { q: 'What happens if I get in an accident?', a: 'Stop, call police if anyone injured or major damage. Document scene with photos. Call rental company immediately. Don\'t admit fault. File insurance claim within 24-48 hours.' },
  { q: 'Are there hidden fees I should know about?', a: 'Common fees: Airport surcharge ($10-30), additional driver ($10-15/day), GPS ($15/day), under-25 fee ($25/day), one-way fee ($50-500), fuel charges ($8-12/gallon if not full).' },
];


export default function CarsPage() {
  const t = useTranslations('CarsPage');
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Green/Teal Theme */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50 border-b border-teal-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(20, 184, 166) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative overflow-hidden md:overflow-visible" noPadding={true} style={{ padding: '12px 0 8px' }}>
          <div className="px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 animate-fadeIn">
              <h1 key={`title-${animationKey}`} className="hero-title text-lg sm:text-xl md:text-3xl font-extrabold tracking-tight sm:tracking-wide whitespace-nowrap overflow-x-auto scrollbar-hide">
                {mounted ? t('sectionTitle').split('').map((char, index) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t('sectionTitle')}</span>}
              </h1>
              <span className="hidden md:inline-block text-teal-400 text-2xl font-bold mx-1">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-gray-700/90 mb-0 font-medium text-xs sm:text-sm md:text-lg leading-tight sm:leading-normal whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ letterSpacing: '-0.01em' }}>
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
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #14b8a6, #0d9488); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #0d9488, #10b981); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #10b981, #14b8a6); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #0f766e; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(15, 118, 110, 0.15); position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; color: #374151; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* CARS TAB FIRST - Search Bar */}
      <div className="border-b border-gray-100">
        <MobileHomeSearchWrapper lang={lang} defaultService="cars" />
      </div>

      {/* Compact Trust Bar */}
      <CompactTrustBar sticky />

      {/* ============ CAR RENTAL SECTIONS ============ */}

      {/* 1. Vehicle Types & Categories - WITH PHOTOS */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('vehicleTypesTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('vehicleTypesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseVehicleTypes.map((vehicle, idx) => {
              const IconComponent = vehicle.icon;
              return (
                <div key={idx} className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-teal-400 group cursor-pointer h-[300px]">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.type}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vehicle.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1.5 drop-shadow-lg">{vehicle.type}</h3>
                      <p className="text-xs text-white/90 mb-1.5 drop-shadow-md line-clamp-2">{vehicle.description}</p>
                      <div className="text-lg font-bold text-teal-400 mb-1.5 drop-shadow-lg">{vehicle.priceRange}</div>
                      <p className="text-[10px] text-white/80 mb-2 drop-shadow-md italic line-clamp-1">{vehicle.examples}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.features.map((feat, i) => (
                          <span key={i} className="text-[10px] bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-white border border-white/30">{feat}</span>
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

      {/* 2. Top Car Rental Companies */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('companiesTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('companiesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-2 md:px-0">
            {baseRentalCompanies.map((company, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-teal-300 group cursor-pointer text-center">
                <div className="text-5xl mb-3">{company.logo}</div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{company.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{company.locations} locations</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-700">{company.rating}</span>
                </div>
                <div className="space-y-1">
                  {company.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="text-left">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 3. Insurance & Protection Options */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('insuranceTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('insuranceSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseInsuranceOptions.map((ins, idx) => {
              const IconComponent = ins.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-blue-200 hover:border-blue-400 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${ins.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{ins.type}</h3>
                  <div className="text-lg font-bold text-teal-600 mb-3">{ins.cost}</div>
                  <p className="text-sm text-gray-600 mb-2">{ins.coverage}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-3">
                    <p className="text-xs text-blue-800 font-semibold">{ins.recommended}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 4. Rental Locations & Pickup Options */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('locationsTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('locationsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {basePopularLocations.map((loc, idx) => {
              const IconComponent = loc.icon;
              return (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-teal-300 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${loc.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{loc.location}</h3>
                  <p className="text-sm text-green-600 font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {loc.benefit}
                  </p>
                  <p className="text-xs text-gray-500">{loc.note}</p>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 5. Fuel Policies Explained */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('fuelPoliciesTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('fuelPoliciesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseFuelPolicies.map((fuel, idx) => {
              const IconComponent = fuel.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-teal-400 group cursor-pointer">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${fuel.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{fuel.policy}</h3>
                  <p className="text-sm text-gray-600 mb-3">{fuel.description}</p>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-sm font-bold text-teal-800">{fuel.savings}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </div>

      {/* 6. Expert Car Rental Tips */}
      <div className="bg-white py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('tipsTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('tipsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseTips.map((tip, idx) => {
              const IconComponent = tip.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all border border-teal-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-teal-600" />
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

      {/* 7. Car Rental FAQ */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 md:py-12">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="mb-6 sm:mb-8 px-4 md:px-0">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t('faqTitle')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Everything you need to know about renting cars with Fly2Any</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-6 px-2 md:px-0">
            {baseFaqs.map((faq, idx) => (
              <details key={idx} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-teal-300 group">
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span className="flex-1 text-base md:text-lg">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-teal-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
              <Shield className="w-5 h-5" />
              Contact Our Support Team
            </a>
          </div>
        </MaxWidthContainer>
      </div>
    </div>
  );
}
