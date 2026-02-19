'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Sparkles, Globe, TrendingUp } from 'lucide-react';
import { HeroStats } from './HeroStats';
import { HeroSearchBar } from './HeroSearchBar';
import { HeroSocialProof } from './HeroSocialProof';
import type { BlogPost } from '@/lib/types/blog';

interface Deal {
  destination: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
}

interface HeroImmersiveProps {
  featuredPosts?: BlogPost[];
  flashDeals?: Deal[];
  language?: 'en' | 'pt' | 'es';
  onSearchSubmit?: (query: string) => void;
  stats?: {
    travelers: number;
    destinations: number;
    avgSavings: number;
  };
  compact?: boolean;
}

// Mock Data
const mockDeals: Deal[] = [
  {
    destination: 'Paris',
    price: 299,
    originalPrice: 999,
    discount: 70,
    image: '/patterns/paris.jpg'
  },
  {
    destination: 'Tokyo',
    price: 799,
    originalPrice: 1599,
    discount: 50,
    image: '/patterns/tokyo.jpg'
  },
  {
    destination: 'Bali',
    price: 499,
    originalPrice: 1299,
    discount: 61,
    image: '/patterns/bali.jpg'
  },
];

const mockRecentBookings = [
  { name: 'Sarah M.', destination: 'Paris', timeAgo: '2 min ago', location: 'NYC' },
  { name: 'John D.', destination: 'Tokyo', timeAgo: '5 min ago', location: 'LA' },
  { name: 'Maria S.', destination: 'Rome', timeAgo: '8 min ago', location: 'Miami' },
  { name: 'Alex K.', destination: 'Bali', timeAgo: '12 min ago', location: 'London' },
  { name: 'Emma L.', destination: 'Dubai', timeAgo: '15 min ago', location: 'Sydney' },
];

export function HeroImmersive({
  flashDeals = mockDeals,
  language = 'en',
  onSearchSubmit = (query) => console.log('Search:', query),
  stats = {
    travelers: 50000,
    destinations: 1000,
    avgSavings: 65
  },
  compact = false,
}: HeroImmersiveProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translations = {
    en: {
      tagline: 'The Official Fly2Any Travel Hub',
      headline: 'Explore Without',
      subheadline: 'Limits',
      description: 'From exclusive flash deals to expert deep-dives — navigating everything that matters to the modern traveler.',
      exploreDeals: 'Explore Deals',
      topDestinations: 'Top Destinations',
      travelGuides: 'Travel Guides',
      flashDeals: 'Flash Deals',
      save: 'Save',
    },
    pt: {
      tagline: 'O Hub de Viagens Oficial Fly2Any',
      headline: 'Explore Sem',
      subheadline: 'Limites',
      description: 'De ofertas flash exclusivas a análises de especialistas — navegando em tudo o que importa para o viajante moderno.',
      exploreDeals: 'Explorar Ofertas',
      topDestinations: 'Principais Destinos',
      travelGuides: 'Guias de Viagem',
      flashDeals: 'Ofertas Relâmpago',
      save: 'Economize',
    },
    es: {
      tagline: 'El Hub de Viajes Oficial Fly2Any',
      headline: 'Explora Sin',
      subheadline: 'Límites',
      description: 'Desde ofertas flash exclusivas hasta análisis de expertos — navegando por todo lo que le importa al viajero moderno.',
      exploreDeals: 'Explorar Ofertas',
      topDestinations: 'Destinos Principales',
      travelGuides: 'Guías de Viaje',
      flashDeals: 'Ofertas Flash',
      save: 'Ahorra',
    },
  };

  const t = translations[language];

  const heroStats = [
    { value: stats.travelers, label: 'Community Members', suffix: '+' },
    { value: stats.destinations, label: 'Global Coverage', suffix: '' },
    { value: 15, label: 'Years of Insight', suffix: '+' },
  ];

  return (
    <section className={`relative overflow-hidden bg-black transition-all duration-700 ${compact ? 'min-h-[35vh] sm:min-h-[300px]' : 'min-h-[75vh]'}`}>
      {/* ... Parallax Background Layers ... */}
      <div className="absolute inset-0">
        {/* Base Layer - Main Hero Image */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90"
            alt="Travel destination"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Gradient Overlays for Depth - Softened for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Content Container */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-4 transition-all duration-700 ${compact ? 'py-8 min-h-[35vh] sm:min-h-[300px]' : 'py-12 min-h-[75vh]'}`}>
        {/* Main Content */}
        <div className="w-full max-w-none mx-auto text-center space-y-6">
          {/* Animated Badge */}
          {!compact && (
            <div
              className={`
                transform transition-all duration-1000
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
              `}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="font-semibold">{t.tagline}</span>
              </div>
            </div>
          )}

          {/* Hero Headline */}
          {!compact && (
            <div
              className={`
                space-y-4 transform transition-all duration-1000 delay-200
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-gradient mr-3">
                  {t.headline}
                </span>
                <span>{t.subheadline}</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-medium whitespace-nowrap tracking-wide">
                {t.description}
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div
            className={`
              transform transition-all duration-1000 delay-400
              ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
          >
            <HeroSearchBar
              onSearch={onSearchSubmit}
              size="xl"
              showTrending={true}
            />
          </div>


          {/* Statistics */}
          {!compact && (
            <div
              className={`
                transform transition-all duration-1000 delay-600
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <HeroStats stats={heroStats} className="mt-8" />
            </div>
          )}

          {/* Social Proof */}
          {!compact && (
            <div
              className={`
                transform transition-all duration-1000 delay-700
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <HeroSocialProof
                recentBookings={mockRecentBookings}
                className="flex justify-center mt-6"
                communityLabel="Join 50,000+ travelers getting weekly insights"
              />
            </div>
          )}
        </div>

        {/* Floating Deal Cards */}
        {!compact && (
          <div className="absolute right-4 md:right-10 top-1/4 hidden xl:block">
            <div
              className="space-y-4 animate-float"
              style={{ animationDelay: '0s' }}
            >
              {flashDeals.slice(0, 2).map((deal, index) => (
                <div
                  key={index}
                  className="w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative h-32">
                    <Image
                      src={deal.image}
                      alt={deal.destination}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {t.save} {deal.discount}%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{deal.destination}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-orange-600">
                        ${deal.price}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ${deal.originalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
