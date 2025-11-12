'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Shield, Sparkles, Plane, Heart, Umbrella, FileText,
  Users, Clock, Calendar, Star, CheckCircle, MapPin,
  ChevronRight, Award, Zap, Globe, AlertCircle,
  CreditCard, Phone, Briefcase, Baby, Cross, DollarSign
} from 'lucide-react';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    // Compact Hero Section
    sectionTitle: 'Comprehensive Travel Insurance for Worry-Free Adventures',
    subtitle: 'Protection for trip cancellation, medical emergencies, lost luggage & more',

    // Sections
    coverageTypes: 'Coverage Types & Plans',
    popularPlans: 'Popular Insurance Plans',
    coverageLevels: 'Coverage Level Options',
    whatsIncluded: "What's Covered by Insurance",
    topProviders: 'Top Insurance Providers',
    bookingTips: 'Insurance Buying Tips',
    faq: 'Travel Insurance FAQ',

    // Coverage Types
    coverageTypesData: [
      {
        type: 'Trip Cancellation Coverage',
        description: 'Get refunded if you need to cancel your trip for covered reasons',
        priceRange: '$40-$200',
        coverage: 'Up to $10,000',
        features: ['Illness/Injury', 'Family Emergency', 'Natural Disasters', 'Work Obligations'],
        examples: 'Illness, death in family, job loss, severe weather',
        bestFor: 'Expensive trips, non-refundable bookings',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80'
      },
      {
        type: 'Medical Emergency Coverage',
        description: 'Emergency medical and hospital costs while traveling abroad',
        priceRange: '$50-$300',
        coverage: 'Up to $100,000',
        features: ['Hospital Bills', 'Emergency Surgery', 'Ambulance', 'Medical Evacuation'],
        examples: 'Accidents, sudden illness, emergency procedures',
        bestFor: 'International travelers, adventure trips',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80'
      },
      {
        type: 'Baggage Loss/Delay Coverage',
        description: 'Compensation for lost, stolen, or delayed luggage',
        priceRange: '$20-$100',
        coverage: 'Up to $3,000',
        features: ['Lost Luggage', 'Stolen Items', 'Delayed Bags', 'Essential Purchases'],
        examples: 'Airline lost bags, theft, damage, delay over 12 hours',
        bestFor: 'Checked baggage, valuable items',
        image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80'
      },
      {
        type: 'Travel Delay Coverage',
        description: 'Reimbursement for expenses due to significant travel delays',
        priceRange: '$30-$150',
        coverage: 'Up to $1,500',
        features: ['Meals', 'Accommodation', 'Transportation', 'Essential Items'],
        examples: 'Flight delays over 6 hours, missed connections',
        bestFor: 'Tight connections, weather-prone seasons',
        image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'
      },
      {
        type: 'Emergency Evacuation',
        description: 'Medical transport to nearest adequate facility or home country',
        priceRange: '$60-$250',
        coverage: 'Up to $500,000',
        features: ['Air Ambulance', 'Helicopter Rescue', 'Repatriation', '24/7 Assistance'],
        examples: 'Serious injury in remote area, political unrest evacuation',
        bestFor: 'Adventure travel, remote destinations',
        image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&q=80'
      },
      {
        type: 'Cancel For Any Reason (CFAR)',
        description: 'Cancel your trip for ANY reason and get 50-75% refund',
        priceRange: '$100-$400',
        coverage: '50-75% trip cost',
        features: ['Any Reason', 'Change of Mind', 'Flexible Cancel', 'Partial Refund'],
        examples: 'Simply changed your mind, travel anxiety, work preference',
        bestFor: 'Uncertain plans, expensive trips',
        image: 'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=800&q=80'
      }
    ],

    // Popular Plans
    plansData: [
      {
        plan: 'Basic Coverage',
        price: '$45',
        rating: 4.5,
        features: ['Trip Cancellation', 'Medical Emergency ($50K)', 'Baggage Loss ($1K)', '24/7 Support'],
        bestFor: 'Budget travelers, domestic trips',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'
      },
      {
        plan: 'Standard Coverage',
        price: '$95',
        rating: 4.7,
        features: ['Trip Cancellation', 'Medical ($100K)', 'Baggage ($2.5K)', 'Travel Delay', 'Interruption'],
        bestFor: 'International travel, families',
        image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'
      },
      {
        plan: 'Premium Coverage',
        price: '$175',
        rating: 4.9,
        features: ['Trip Cancellation', 'Medical ($250K)', 'Baggage ($5K)', 'CFAR Option', 'Adventure Sports'],
        bestFor: 'Adventure travel, expensive trips',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'
      },
      {
        plan: 'Annual Multi-Trip',
        price: '$299',
        rating: 4.8,
        features: ['Unlimited Trips', 'Medical ($150K)', 'Worldwide Cover', 'Business Travel', 'Family Included'],
        bestFor: 'Frequent travelers, business trips',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80'
      },
      {
        plan: 'Senior Traveler Plan',
        price: '$125',
        rating: 4.6,
        features: ['Age 65+', 'Pre-existing Conditions', 'Medical ($200K)', 'Trip Cancellation', 'Cruise Cover'],
        bestFor: 'Seniors, cruises, medical needs',
        image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80'
      },
      {
        plan: 'Adventure Sports Plan',
        price: '$145',
        rating: 4.7,
        features: ['Extreme Sports', 'Medical ($175K)', 'Equipment Cover', 'Rescue Services', 'Evacuation'],
        bestFor: 'Skiing, diving, hiking, extreme sports',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
      }
    ],

    // Coverage Levels
    levelsData: [
      {
        level: 'Essential Coverage',
        price: '$40-$80',
        description: 'Basic protection for short trips and domestic travel',
        coverage: 'Trip cancellation, basic medical, baggage loss',
        bestFor: 'Weekend trips, domestic flights'
      },
      {
        level: 'Comprehensive Coverage',
        price: '$90-$180',
        description: 'Full protection for international travel and longer trips',
        coverage: 'All essentials + delays, interruption, higher limits',
        bestFor: 'International trips, families'
      },
      {
        level: 'Premium Coverage',
        price: '$200-$400',
        description: 'Maximum protection including CFAR and adventure sports',
        coverage: 'Everything + CFAR, adventure sports, luxury items',
        bestFor: 'Expensive trips, adventure travel'
      }
    ],

    // What's Covered
    coveredData: [
      {
        feature: 'Trip Cancellation',
        description: 'Full refund if you cancel for covered reasons',
        icon: Calendar
      },
      {
        feature: 'Medical Emergencies',
        description: 'Hospital, surgery, and emergency medical costs',
        icon: Heart
      },
      {
        feature: 'Lost/Stolen Baggage',
        description: 'Reimbursement for lost or stolen luggage and items',
        icon: Briefcase
      },
      {
        feature: '24/7 Assistance',
        description: 'Round-the-clock support and emergency coordination',
        icon: Phone
      }
    ],

    // Top Providers
    providersData: [
      {
        provider: 'World Nomads',
        specialty: 'Adventure & backpacking travel',
        rating: 4.8,
        strength: 'Flexible policies'
      },
      {
        provider: 'Allianz Travel',
        specialty: 'Comprehensive family plans',
        rating: 4.7,
        strength: 'Large coverage limits'
      },
      {
        provider: 'Travel Guard',
        specialty: 'Premium luxury coverage',
        rating: 4.6,
        strength: 'CFAR available'
      },
      {
        provider: 'InsureMyTrip',
        specialty: 'Comparison marketplace',
        rating: 4.7,
        strength: 'Compare 25+ providers'
      },
      {
        provider: 'Travelex Insurance',
        specialty: 'Budget-friendly plans',
        rating: 4.5,
        strength: 'Affordable rates'
      },
      {
        provider: 'IMG Global',
        specialty: 'Long-term & expat coverage',
        rating: 4.6,
        strength: 'Annual multi-trip'
      }
    ],

    // Insurance Tips
    tipsData: [
      {
        tip: 'Buy Within 14 Days of Booking',
        description: 'Purchase insurance within 14 days of initial trip deposit to qualify for pre-existing condition waivers and best coverage',
        icon: Clock
      },
      {
        tip: 'Read the Fine Print',
        description: 'Carefully review what IS and ISN\'T covered. Exclusions vary widely between providers and can surprise you later',
        icon: FileText
      },
      {
        tip: 'Consider Cancel For Any Reason',
        description: 'CFAR adds 40% to cost but gives you flexibility to cancel for literally any reason and get 50-75% refund',
        icon: Shield
      },
      {
        tip: 'Check Credit Card Benefits',
        description: 'Premium credit cards often include travel insurance. Check coverage before buying duplicate protection',
        icon: CreditCard
      },
      {
        tip: 'Get Medical Evacuation Coverage',
        description: 'Medical evacuation can cost $100,000+. Essential for adventure travel, cruises, and remote destinations',
        icon: AlertCircle
      },
      {
        tip: 'Compare Multiple Quotes',
        description: 'Prices vary 200%+ for identical coverage. Use comparison sites to find best rates and coverage',
        icon: DollarSign
      }
    ],

    // FAQ Data
    faqData: [
      {
        question: 'Is travel insurance really necessary?',
        answer: 'For most trips, yes. Medical emergencies abroad can cost $50,000+, and trip cancellations can lose you thousands in non-refundable bookings. Insurance costs 4-10% of trip cost but can save you from financial disaster. It\'s especially critical for expensive trips, international travel, adventure activities, and travelers with pre-existing conditions.'
      },
      {
        question: 'What does travel insurance typically cover?',
        answer: 'Standard policies cover: trip cancellation/interruption, emergency medical expenses, emergency evacuation, baggage loss/delay, travel delays, and 24/7 assistance. Premium plans may add Cancel For Any Reason (CFAR), adventure sports coverage, rental car protection, and higher coverage limits. Always read the policy details as coverage varies significantly.'
      },
      {
        question: 'How much does travel insurance cost?',
        answer: 'Travel insurance typically costs 4-10% of your total trip cost. For a $3,000 trip, expect to pay $120-$300. Factors affecting price: trip cost, duration, destination, age, coverage level, and add-ons like CFAR. Annual multi-trip plans cost $250-$500 and cover unlimited trips for a year.'
      },
      {
        question: 'Can I buy insurance after booking my trip?',
        answer: 'Yes, but act fast! You can buy insurance any time before departure, BUT to get maximum benefits (pre-existing condition waivers, CFAR eligibility), you must purchase within 10-21 days of your initial trip deposit. The sooner you buy, the better your coverage and options.'
      },
      {
        question: 'Does insurance cover COVID-19 related issues?',
        answer: 'Most policies now cover COVID-19 like any other illness for medical treatment and trip cancellation IF you purchase before getting sick. Coverage includes: testing positive before departure, getting sick during travel, quarantine costs, and medical treatment. CFAR policies also let you cancel due to COVID concerns even if not sick.'
      },
      {
        question: 'What is NOT covered by travel insurance?',
        answer: 'Common exclusions: Pre-existing conditions (unless waived), Cancel For Any Reason without CFAR add-on, extreme sports without adventure coverage, traveling against government warnings, alcohol/drug-related incidents, and "foreseeable" events like hurricanes in hurricane season. Each policy has specific exclusions - always read the fine print.'
      }
    ]
  },
  pt: {
    sectionTitle: 'Seguro Viagem Abrangente para Aventuras sem Preocupações',
    subtitle: 'Proteção para cancelamento, emergências médicas, bagagem perdida e mais',
    coverageTypes: 'Tipos e Planos de Cobertura',
    popularPlans: 'Planos de Seguro Populares',
    coverageLevels: 'Opções de Nível de Cobertura',
    whatsIncluded: 'O Que Está Coberto pelo Seguro',
    topProviders: 'Principais Fornecedores de Seguro',
    bookingTips: 'Dicas para Compra de Seguro',
    faq: 'Perguntas Frequentes sobre Seguro Viagem'
  },
  es: {
    sectionTitle: 'Seguro de Viaje Completo para Aventuras sin Preocupaciones',
    subtitle: 'Protección para cancelación, emergencias médicas, equipaje perdido y más',
    coverageTypes: 'Tipos y Planes de Cobertura',
    popularPlans: 'Planes de Seguro Populares',
    coverageLevels: 'Opciones de Nivel de Cobertura',
    whatsIncluded: 'Qué Está Cubierto por el Seguro',
    topProviders: 'Principales Proveedores de Seguros',
    bookingTips: 'Consejos para Compra de Seguros',
    faq: 'Preguntas Frecuentes sobre Seguro de Viaje'
  }
};

export default function TravelInsurancePage() {
  const [lang, setLang] = useState<Language>('en');
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const t = content[lang] as any;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Blue/Indigo Theme */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50/30 to-blue-50 border-b border-blue-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
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
            <div className="flex items-baseline gap-1 md:gap-3 flex-wrap animate-fadeIn">
              <h1 key={`title-${animationKey}`} className="hero-title text-xl md:text-3xl font-extrabold tracking-wide break-words max-w-full">
                {mounted ? t.sectionTitle.split('').map((char: string, index: number) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t.sectionTitle}</span>}
              </h1>
              <span className="separator-dot text-blue-400 font-medium text-base md:text-xl flex-shrink-0">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-gray-700/90 mb-0 font-medium text-sm md:text-lg break-words max-w-full flex-1" style={{ letterSpacing: '0.01em' }}>
                {mounted ? t.subtitle.split('').map((char: string, index: number) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${2.0 + (index * 0.028)}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t.subtitle}</span>}
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #3b82f6, #6366f1); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #6366f1, #8b5cf6); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #2563eb; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(37, 99, 235, 0.15); position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; color: #374151; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* Top Search Bar */}
      <MobileHomeSearchWrapper lang={lang} defaultService="insurance" />

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Coverage Types & Plans */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Shield className="w-7 h-7 text-blue-600" />
              {t.coverageTypes}
            </h2>
            <p className="text-gray-600">Choose the right protection for your travel needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((t as any).coverageTypesData || []).map((coverage: any, index: number) => {
              const colors = [
                'from-blue-500 to-indigo-600',
                'from-indigo-500 to-purple-600',
                'from-cyan-500 to-blue-600',
                'from-blue-600 to-violet-600',
                'from-sky-500 to-blue-600',
                'from-indigo-600 to-blue-700'
              ];

              return (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-blue-400 group cursor-pointer h-[420px]"
                >
                  {/* Background Image */}
                  <Image
                    src={coverage.image}
                    alt={coverage.type}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Primary Gradient - Dark at bottom, transparent at top */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* Subtle color tint - only 20% opacity */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-20 mix-blend-overlay`} />

                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col justify-end">
                    {/* Icon - MAXIMUM visibility */}
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-4 border-2 border-white/30 ring-2 ring-blue-400/30">
                      <Shield className="w-9 h-9 text-blue-600" strokeWidth={2.5} />
                    </div>

                    {/* Title - Pure white, maximum impact */}
                    <h3 className="text-2xl font-black text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
                      {coverage.type}
                    </h3>

                    {/* Coverage - BRIGHT YELLOW for attention */}
                    <div className="text-2xl font-black text-yellow-300 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(253,224,71,0.3)' }}>
                      {coverage.coverage}
                    </div>

                    {/* Description - 95% opacity */}
                    <p className="text-sm text-white/95 mb-3 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                      {coverage.description}
                    </p>

                    {/* Price Range */}
                    <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 w-fit">
                      <DollarSign className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">{coverage.priceRange}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-1 mb-3">
                      {coverage.features.slice(0, 3).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-sm text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Best For */}
                    <p className="text-xs text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      <span className="font-semibold">Best for:</span> {coverage.bestFor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Insurance Plans */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-7 h-7 text-blue-600" />
              {t.popularPlans}
            </h2>
            <p className="text-gray-600">Most popular insurance plans for different travel needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((t as any).plansData || []).map((plan: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={plan.image}
                    alt={plan.plan}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{plan.plan}</h3>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{plan.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-3xl font-bold text-blue-600 mb-4">{plan.price}<span className="text-lg text-gray-500">/trip</span></div>

                  <div className="space-y-2 mb-4">
                    {plan.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3"><span className="font-semibold">Best for:</span> {plan.bestFor}</p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                      Get Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Level Options */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-blue-600" />
              {t.coverageLevels}
            </h2>
            <p className="text-gray-600">Choose coverage based on your trip value and needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {((t as any).levelsData || []).map((level: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{level.level}</h3>
                <p className="text-lg font-semibold text-blue-600 mb-3">{level.price}</p>
                <p className="text-sm text-gray-600 mb-4">{level.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Coverage:</p>
                  <p className="text-sm text-gray-600">{level.coverage}</p>
                </div>

                <div className="pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-500"><span className="font-semibold">Best for:</span> {level.bestFor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-blue-600" />
              {t.whatsIncluded}
            </h2>
            <p className="text-gray-600">Key protections included in travel insurance policies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {((t as any).coveredData || []).map((item: any, index: number) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.feature}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Insurance Providers */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Globe className="w-7 h-7 text-blue-600" />
              {t.topProviders}
            </h2>
            <p className="text-gray-600">Leading travel insurance companies trusted by millions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((t as any).providersData || []).map((provider: any, index: number) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{provider.provider}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    <span className="text-sm font-bold text-yellow-700">{provider.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{provider.specialty}</p>
                <div className="flex items-center gap-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-semibold">{provider.strength}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Buying Tips */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t.bookingTips}
            </h2>
            <p className="text-gray-600">Expert tips for choosing and buying travel insurance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((t as any).tipsData || []).map((tip: any, index: number) => {
              const IconComponent = tip.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-2">{tip.tip}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">❓ {t.faq}</h2>
            <p className="text-gray-600">Common questions about travel insurance answered</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {((t as any).faqData || []).map((faq: any, index: number) => (
              <details key={index} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300 group">
                <summary className="flex items-start justify-between cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need help choosing the right insurance plan?</p>
            <a
              href="mailto:support@fly2any.com"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Shield className="w-5 h-5" />
              Contact Our Insurance Experts
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
