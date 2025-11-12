'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package, Sparkles, Plane, Hotel, Car, Utensils,
  Users, Clock, Calendar, Star, Shield, MapPin,
  ChevronRight, CheckCircle, Award, Zap, Globe,
  Heart, TrendingDown, Gift, Briefcase, Sun, Mountain
} from 'lucide-react';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    // Compact Hero Section
    sectionTitle: 'All-Inclusive Travel Packages & Vacation Bundles',
    subtitle: 'Save up to 40% with flight + hotel + activities bundled deals',

    // Sections
    packageTypes: 'Package Types & Categories',
    popularDestinations: 'Top Package Destinations',
    packageDurations: 'Package Duration Options',
    whatsIncluded: "What's Included in Packages",
    topProviders: 'Top Package Providers',
    bookingTips: 'Expert Package Booking Tips',
    faq: 'Packages FAQ',

    // Package Types
    packageTypesData: [
      {
        type: 'Beach Vacation Packages',
        description: 'All-inclusive beach resorts with flights, meals, and activities',
        priceRange: '$800-$3,500',
        duration: '5-14 days',
        features: ['Round-trip Flights', 'All-Inclusive Resort', 'Airport Transfers', 'Daily Activities'],
        examples: 'Cancun, Maldives, Phuket, Bali All-Inclusive',
        bestFor: 'Beach lovers, families, honeymooners',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
      },
      {
        type: 'City Break Packages',
        description: 'Urban adventures with flights, hotels, and sightseeing tours',
        priceRange: '$600-$2,500',
        duration: '3-7 days',
        features: ['Flights', 'Central Hotel', 'City Tours', 'Museum Passes'],
        examples: 'Paris, New York, Tokyo, Dubai City Breaks',
        bestFor: 'Culture enthusiasts, solo travelers, couples',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
      },
      {
        type: 'Adventure Packages',
        description: 'Thrilling experiences with extreme sports and nature exploration',
        priceRange: '$1,200-$4,000',
        duration: '7-14 days',
        features: ['Flights', 'Adventure Lodge', 'Equipment Rental', 'Expert Guides'],
        examples: 'New Zealand Adventure, Costa Rica Explorer, Iceland Trek',
        bestFor: 'Adventure seekers, outdoor enthusiasts',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'
      },
      {
        type: 'Cruise Packages',
        description: 'Ocean voyages with flights, cabin, meals, and entertainment',
        priceRange: '$1,500-$6,000',
        duration: '7-21 days',
        features: ['Flights', 'Cruise Cabin', 'All Meals', 'Shore Excursions'],
        examples: 'Mediterranean Cruise, Caribbean Cruise, Alaska Cruise',
        bestFor: 'Couples, families, seniors',
        image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80'
      },
      {
        type: 'Safari Packages',
        description: 'Wildlife adventures with luxury lodges and game drives',
        priceRange: '$2,500-$8,000',
        duration: '7-14 days',
        features: ['Flights', 'Safari Lodge', 'Game Drives', 'Expert Rangers'],
        examples: 'Kenya Safari, Tanzania Serengeti, South Africa Big Five',
        bestFor: 'Wildlife lovers, photographers, luxury travelers',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80'
      },
      {
        type: 'Ski & Snow Packages',
        description: 'Winter sports with flights, ski resorts, and lift passes',
        priceRange: '$1,000-$4,500',
        duration: '5-10 days',
        features: ['Flights', 'Ski Resort', 'Lift Passes', 'Equipment Rental'],
        examples: 'Swiss Alps, Aspen, Whistler, Japan Powder',
        bestFor: 'Ski enthusiasts, winter lovers, families',
        image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80'
      }
    ],

    // Popular Destinations
    destinationsData: [
      {
        destination: 'Cancun, Mexico',
        packages: '500+ packages',
        rating: 4.8,
        topPackages: ['All-Inclusive Beach', 'Mayan Ruins Tour', 'Party Package', 'Family Resort'],
        priceFrom: '$799',
        image: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80'
      },
      {
        destination: 'Maldives',
        packages: '300+ packages',
        rating: 4.9,
        topPackages: ['Overwater Villa', 'Diving Package', 'Honeymoon Special', 'Luxury Resort'],
        priceFrom: '$1,899',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80'
      },
      {
        destination: 'Dubai, UAE',
        packages: '450+ packages',
        rating: 4.7,
        topPackages: ['City + Desert', 'Luxury Hotels', 'Shopping Tour', 'Theme Park Bundle'],
        priceFrom: '$999',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'
      },
      {
        destination: 'Bali, Indonesia',
        packages: '400+ packages',
        rating: 4.8,
        topPackages: ['Beach + Culture', 'Yoga Retreat', 'Adventure Package', 'Villa Stay'],
        priceFrom: '$699',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'
      },
      {
        destination: 'Paris, France',
        packages: '350+ packages',
        rating: 4.6,
        topPackages: ['Romantic Getaway', 'Museums Pass', 'Wine & Dine', 'Disneyland Bundle'],
        priceFrom: '$899',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
      },
      {
        destination: 'New York, USA',
        packages: '380+ packages',
        rating: 4.7,
        topPackages: ['Broadway Shows', 'Sightseeing Pass', 'Shopping Tour', 'Food Crawl'],
        priceFrom: '$799',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80'
      }
    ],

    // Duration Options
    durationsData: [
      {
        duration: 'Weekend Getaway',
        time: '3-4 days',
        description: 'Perfect for quick escapes and short city breaks',
        examples: 'City tours, beach weekends, spa retreats',
        priceRange: '$500-$1,500',
        bestFor: 'Busy professionals'
      },
      {
        duration: 'Week-Long Vacation',
        time: '7-10 days',
        description: 'Ideal balance of relaxation and exploration',
        examples: 'Beach resorts, Europe tours, island hopping',
        priceRange: '$1,200-$4,000',
        bestFor: 'Families, couples'
      },
      {
        duration: 'Extended Holiday',
        time: '14-21 days',
        description: 'Comprehensive trips with multiple destinations',
        examples: 'Multi-country tours, cruises, safari adventures',
        priceRange: '$3,000-$10,000',
        bestFor: 'Retirees, adventurers'
      }
    ],

    // What's Included
    includedData: [
      {
        feature: 'Round-Trip Flights',
        description: 'Economy or premium class flights from your city',
        icon: Plane
      },
      {
        feature: 'Accommodation',
        description: 'Hotels, resorts, or vacation rentals for your stay',
        icon: Hotel
      },
      {
        feature: 'Meals & Drinks',
        description: 'Breakfast, all-inclusive, or meal vouchers included',
        icon: Utensils
      },
      {
        feature: 'Activities & Tours',
        description: 'Guided tours, excursions, and entertainment',
        icon: Sparkles
      }
    ],

    // Top Providers
    providersData: [
      {
        provider: 'Expedia Packages',
        speciality: 'Flight + Hotel bundles',
        rating: 4.7,
        discount: 'Up to 30% off'
      },
      {
        provider: 'Costco Travel',
        speciality: 'Member exclusive deals',
        rating: 4.8,
        discount: 'Extra perks included'
      },
      {
        provider: 'Apple Vacations',
        speciality: 'All-inclusive resorts',
        rating: 4.6,
        discount: 'Resort credits included'
      },
      {
        provider: 'Funjet Vacations',
        speciality: 'Beach packages',
        rating: 4.5,
        discount: 'Kids stay free deals'
      },
      {
        provider: 'Pleasant Holidays',
        speciality: 'Hawaii & Mexico',
        rating: 4.7,
        discount: 'Room upgrades'
      },
      {
        provider: 'Gate 1 Travel',
        speciality: 'Guided tours',
        rating: 4.6,
        discount: 'Early booking savings'
      }
    ],

    // Expert Tips
    tipsData: [
      {
        tip: 'Bundle for Maximum Savings',
        description: 'Book flight + hotel + car together to save 30-40% vs booking separately',
        icon: TrendingDown
      },
      {
        tip: 'Check What\'s Included',
        description: 'Verify meals, transfers, activities to avoid hidden costs and surprises',
        icon: CheckCircle
      },
      {
        tip: 'Book Off-Season',
        description: 'Travel during shoulder season for same quality at 50% less cost',
        icon: Calendar
      },
      {
        tip: 'Read Package Details',
        description: 'Check cancellation policy, room type, flight times before booking',
        icon: Shield
      },
      {
        tip: 'Compare Providers',
        description: 'Same destination can vary $500+ between different package providers',
        icon: Award
      },
      {
        tip: 'Look for Added Value',
        description: 'Free upgrades, resort credits, late checkout add real value to packages',
        icon: Gift
      }
    ],

    // FAQ Data
    faqData: [
      {
        question: 'How much can I save with a vacation package?',
        answer: 'Vacation packages typically save you 25-40% compared to booking flights, hotels, and activities separately. The more components you bundle, the greater the savings. Packages also often include added perks like resort credits, free breakfast, or complimentary transfers.'
      },
      {
        question: 'What\'s typically included in a package?',
        answer: 'Most packages include round-trip flights and accommodation. Depending on the package type, you may also get meals (all-inclusive), airport transfers, activities, tours, and travel insurance. Always check the "What\'s Included" section for specific details.'
      },
      {
        question: 'Can I customize my package?',
        answer: 'Yes! Most providers allow customization. You can usually upgrade your flight class, choose different hotels, add extra nights, include car rentals, or add excursions. Customizations may affect the package price.'
      },
      {
        question: 'When is the best time to book a package?',
        answer: 'Book 3-4 months in advance for international destinations and 6-8 weeks for domestic trips. Watch for flash sales during off-season, Black Friday, Cyber Monday, and Travel Tuesday. Last-minute deals (2-3 weeks out) can also offer significant savings if you\'re flexible.'
      },
      {
        question: 'Are packages refundable?',
        answer: 'Refund policies vary by provider and package type. Standard packages often have cancellation fees, while flexible packages cost more but allow free cancellation. Travel insurance is recommended for protection against unexpected changes. Always read the cancellation policy before booking.'
      },
      {
        question: 'Do I need travel insurance with a package?',
        answer: 'While not mandatory, travel insurance is highly recommended for packages, especially for expensive trips or international travel. It protects against trip cancellations, medical emergencies, lost luggage, and flight delays. Many packages offer insurance as an add-on during booking.'
      }
    ]
  },
  pt: {
    sectionTitle: 'Pacotes de Viagem All-Inclusive e Bundles de Férias',
    subtitle: 'Economize até 40% com ofertas combinadas de voo + hotel + atividades',
    packageTypes: 'Tipos e Categorias de Pacotes',
    popularDestinations: 'Principais Destinos de Pacotes',
    packageDurations: 'Opções de Duração de Pacotes',
    whatsIncluded: 'O Que Está Incluído nos Pacotes',
    topProviders: 'Principais Fornecedores de Pacotes',
    bookingTips: 'Dicas de Reserva de Pacotes',
    faq: 'Perguntas Frequentes sobre Pacotes'
  },
  es: {
    sectionTitle: 'Paquetes de Viaje Todo Incluido y Ofertas de Vacaciones',
    subtitle: 'Ahorra hasta 40% con ofertas combinadas de vuelo + hotel + actividades',
    packageTypes: 'Tipos y Categorías de Paquetes',
    popularDestinations: 'Principales Destinos de Paquetes',
    packageDurations: 'Opciones de Duración de Paquetes',
    whatsIncluded: 'Qué Está Incluido en los Paquetes',
    topProviders: 'Principales Proveedores de Paquetes',
    bookingTips: 'Consejos de Reserva de Paquetes',
    faq: 'Preguntas Frecuentes sobre Paquetes'
  }
};

export default function PackagesPage() {
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
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Green/Emerald Theme */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50/30 to-green-50 border-b border-emerald-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(16, 185, 129) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative overflow-hidden md:overflow-visible" noPadding={true} style={{ padding: '12px 0 8px' }}>
          <div className="px-4 md:px-6">
            <div className="flex items-baseline gap-1 md:gap-3 flex-nowrap animate-fadeIn overflow-x-auto">
              <h1 key={`title-${animationKey}`} className="hero-title text-xl md:text-3xl font-extrabold tracking-wide whitespace-nowrap">
                {mounted ? t.sectionTitle.split('').map((char, index) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t.sectionTitle}</span>}
              </h1>
              <span className="separator-dot text-emerald-400 font-medium text-base md:text-xl flex-shrink-0">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-gray-700/90 mb-0 font-medium text-sm md:text-lg whitespace-nowrap" style={{ letterSpacing: '0.01em' }}>
                {mounted ? t.subtitle.split('').map((char, index) => (
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
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #10b981, #14b8a6); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #14b8a6, #22c55e); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #22c55e, #10b981); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #059669; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(5, 150, 105, 0.15); position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; font-weight: 800; }
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
      <MobileHomeSearchWrapper lang={lang} defaultService="packages" />

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Package Types & Categories */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Package className="w-7 h-7 text-emerald-600" />
              {t.packageTypes}
            </h2>
            <p className="text-gray-600">Save big with bundled travel deals and all-inclusive packages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.packageTypesData?.map((pkg, index) => {
              const colors = [
                'from-emerald-500 to-teal-600',
                'from-teal-500 to-cyan-600',
                'from-green-500 to-emerald-600',
                'from-cyan-500 to-blue-600',
                'from-lime-500 to-green-600',
                'from-teal-600 to-emerald-700'
              ];

              return (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-emerald-400 group cursor-pointer h-[420px]"
                >
                  {/* Background Image */}
                  <Image
                    src={pkg.image}
                    alt={pkg.type}
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
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-4 border-2 border-white/30 ring-2 ring-emerald-400/30">
                      <Package className="w-9 h-9 text-emerald-600" strokeWidth={2.5} />
                    </div>

                    {/* Title - Pure white, maximum impact */}
                    <h3 className="text-2xl font-black text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
                      {pkg.type}
                    </h3>

                    {/* Price - BRIGHT YELLOW for attention */}
                    <div className="text-2xl font-black text-yellow-300 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(253,224,71,0.3)' }}>
                      {pkg.priceRange}
                    </div>

                    {/* Description - 95% opacity */}
                    <p className="text-sm text-white/95 mb-3 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Duration */}
                    <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 w-fit">
                      <Clock className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">{pkg.duration}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-1 mb-3">
                      {pkg.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-sm text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Best For */}
                    <p className="text-xs text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      <span className="font-semibold">Best for:</span> {pkg.bestFor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Package Destinations */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Globe className="w-7 h-7 text-emerald-600" />
              {t.popularDestinations}
            </h2>
            <p className="text-gray-600">Top destinations with the best package deals and bundles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.destinationsData?.map((dest, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.destination}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{dest.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{dest.destination}</h3>
                  <p className="text-sm text-gray-600 mb-3">{dest.packages} available</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700">Popular Packages:</p>
                    {dest.topPackages.slice(0, 3).map((pkg, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{pkg}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Packages from</p>
                      <p className="text-xl font-bold text-emerald-600">{dest.priceFrom}</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold">
                      View Packages
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Duration Options */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Clock className="w-7 h-7 text-emerald-600" />
              {t.packageDurations}
            </h2>
            <p className="text-gray-600">Find packages that fit your schedule and vacation time</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {t.durationsData?.map((duration, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 hover:border-emerald-400 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{duration.duration}</h3>
                <p className="text-lg font-semibold text-emerald-600 mb-3">{duration.time}</p>
                <p className="text-sm text-gray-600 mb-4">{duration.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Examples:</p>
                  <p className="text-sm text-gray-600">{duration.examples}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
                  <div>
                    <p className="text-xs text-gray-500">Price Range</p>
                    <p className="text-lg font-bold text-gray-900">{duration.priceRange}</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {duration.bestFor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
              {t.whatsIncluded}
            </h2>
            <p className="text-gray-600">Essential components bundled in most vacation packages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.includedData?.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-emerald-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
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

      {/* Top Package Providers */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-7 h-7 text-emerald-600" />
              {t.topProviders}
            </h2>
            <p className="text-gray-600">Trusted companies offering the best vacation package deals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.providersData?.map((provider, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-emerald-400 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{provider.provider}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    <span className="text-sm font-bold text-yellow-700">{provider.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{provider.speciality}</p>
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingDown className="w-5 h-5" />
                  <span className="text-sm font-semibold">{provider.discount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Booking Tips */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-emerald-600" />
              {t.bookingTips}
            </h2>
            <p className="text-gray-600">Maximize savings and get the best value from vacation packages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.tipsData?.map((tip, index) => {
              const IconComponent = tip.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-emerald-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
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
            <p className="text-gray-600">Everything you need to know about booking vacation packages</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {t.faqData?.map((faq, index) => (
              <details key={index} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-emerald-300 group">
                <summary className="flex items-start justify-between cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 pr-4 group-hover:text-emerald-600 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-all group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Have more questions about vacation packages?</p>
            <a
              href="mailto:support@fly2any.com"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Shield className="w-5 h-5" />
              Contact Our Package Experts
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
