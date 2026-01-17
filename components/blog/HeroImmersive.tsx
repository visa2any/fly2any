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
      headline: 'Your Next Adventure',
      subheadline: 'Starts Here',
      description: 'Expert travel guides, insider tips & inspiration for 1000+ destinations',
      exploreDeals: 'Explore Deals',
      topDestinations: 'Top Destinations',
      travelGuides: 'Travel Guides',
      flashDeals: 'Flash Deals',
      save: 'Save',
    },
    pt: {
      headline: 'Sua Próxima Aventura',
      subheadline: 'Começa Aqui',
      description: 'Guias especializados, dicas privilegiadas e inspiração para mais de 1000 destinos',
      exploreDeals: 'Explorar Ofertas',
      topDestinations: 'Principais Destinos',
      travelGuides: 'Guias de Viagem',
      flashDeals: 'Ofertas Relâmpago',
      save: 'Economize',
    },
    es: {
      headline: 'Tu Próxima Aventura',
      subheadline: 'Comienza Aquí',
      description: 'Guías expertas, consejos exclusivos e inspiración para más de 1000 destinos',
      exploreDeals: 'Explorar Ofertas',
      topDestinations: 'Destinos Principales',
      travelGuides: 'Guías de Viaje',
      flashDeals: 'Ofertas Flash',
      save: 'Ahorra',
    },
  };

  const t = translations[language];

  const heroStats = [
    { value: stats.travelers, label: 'Happy Travelers', suffix: '+' },
    { value: stats.destinations, label: 'Destinations', suffix: '+' },
    { value: stats.avgSavings, label: 'Average Savings', suffix: '%' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Parallax Background Layers */}
      <div className="absolute inset-0">
        {/* Base Layer - Main Hero Image */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <Image
            src="/patterns/hero-travel.jpg"
            alt="Travel destination"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Gradient Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto text-center space-y-8">
          {/* Animated Badge */}
          <div
            className={`
              transform transition-all duration-1000
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
            `}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="font-semibold">Premium Travel Deals Since 2024</span>
            </div>
          </div>

          {/* Hero Headline */}
          <div
            className={`
              space-y-4 transform transition-all duration-1000 delay-200
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight">
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-gradient">
                {t.headline}
              </span>
              <span className="block mt-2">{t.subheadline}</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium max-w-3xl mx-auto">
              {t.description}
            </p>
          </div>

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

          {/* CTAs */}
          <div
            className={`
              flex flex-wrap items-center justify-center gap-4 md:gap-6 transform transition-all duration-1000 delay-500
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
          >
            <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t.exploreDeals}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t.topDestinations}
            </button>

            <button className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105">
              {t.travelGuides}
            </button>
          </div>

          {/* Statistics */}
          <div
            className={`
              transform transition-all duration-1000 delay-600
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
          >
            <HeroStats stats={heroStats} className="mt-12" />
          </div>

          {/* Social Proof */}
          <div
            className={`
              transform transition-all duration-1000 delay-700
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
          >
            <HeroSocialProof
              recentBookings={mockRecentBookings}
              className="flex justify-center mt-8"
            />
          </div>
        </div>

        {/* Floating Deal Cards */}
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-white/80">
            <span className="text-sm font-medium">Scroll to explore</span>
            <ChevronDown className="w-8 h-8" />
          </div>
        </div>
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
