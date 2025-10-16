'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Clock, TrendingUp, ArrowRight, Flame, Zap, Users, MapPin } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface FlashDeal {
  id: string;
  destination: string;
  country: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  dealEndsAt: string;
  viewingCount: number;
  justBooked?: {
    name: string;
    timeAgo: string;
  };
}

interface HeroSplitScreenProps {
  flashDeals?: FlashDeal[];
  language?: 'en' | 'pt' | 'es';
  onDealClick?: (dealId: string) => void;
  videoSrc?: string;
}

// Mock Flash Deals Data
const mockFlashDeals: FlashDeal[] = [
  {
    id: '1',
    destination: 'Paris',
    country: 'France',
    price: 299,
    originalPrice: 999,
    discount: 70,
    image: '/patterns/paris.jpg',
    dealEndsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    viewingCount: 234,
    justBooked: { name: 'Sarah M.', timeAgo: '2 min ago' },
  },
  {
    id: '2',
    destination: 'Tokyo',
    country: 'Japan',
    price: 799,
    originalPrice: 1599,
    discount: 50,
    image: '/patterns/tokyo.jpg',
    dealEndsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    viewingCount: 187,
    justBooked: { name: 'John D.', timeAgo: '5 min ago' },
  },
  {
    id: '3',
    destination: 'Bali',
    country: 'Indonesia',
    price: 499,
    originalPrice: 1299,
    discount: 61,
    image: '/patterns/bali.jpg',
    dealEndsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    viewingCount: 312,
    justBooked: { name: 'Emma L.', timeAgo: '1 min ago' },
  },
  {
    id: '4',
    destination: 'Dubai',
    country: 'UAE',
    price: 899,
    originalPrice: 1999,
    discount: 55,
    image: '/patterns/dubai.jpg',
    dealEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    viewingCount: 156,
  },
  {
    id: '5',
    destination: 'Maldives',
    country: 'Indian Ocean',
    price: 1299,
    originalPrice: 2999,
    discount: 57,
    image: '/patterns/maldives.jpg',
    dealEndsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    viewingCount: 278,
    justBooked: { name: 'Alex K.', timeAgo: '8 min ago' },
  },
  {
    id: '6',
    destination: 'Santorini',
    country: 'Greece',
    price: 599,
    originalPrice: 1499,
    discount: 60,
    image: '/patterns/santorini.jpg',
    dealEndsAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    viewingCount: 203,
  },
];

export function HeroSplitScreen({
  flashDeals = mockFlashDeals,
  language = 'en',
  onDealClick = (id) => console.log('Deal clicked:', id),
  videoSrc,
}: HeroSplitScreenProps) {
  const [currentDeals, setCurrentDeals] = useState(flashDeals);
  const [refreshKey, setRefreshKey] = useState(0);

  const translations = {
    en: {
      headline: 'Find Your Next',
      headlineAccent: 'Adventure',
      subheadline: 'Exclusive deals updated every minute',
      exploreDeals: 'Explore All Deals',
      flashDeals: 'Flash Deals',
      liveNow: 'Live Now',
      bookNow: 'Book Now',
      save: 'Save',
      viewing: 'viewing',
      justBooked: 'Just booked',
    },
    pt: {
      headline: 'Encontre Sua',
      headlineAccent: 'Aventura',
      subheadline: 'Ofertas exclusivas atualizadas a cada minuto',
      exploreDeals: 'Ver Todas Ofertas',
      flashDeals: 'Ofertas Relâmpago',
      liveNow: 'Ao Vivo',
      bookNow: 'Reserve Agora',
      save: 'Economize',
      viewing: 'visualizando',
      justBooked: 'Acabou de reservar',
    },
    es: {
      headline: 'Encuentra Tu',
      headlineAccent: 'Aventura',
      subheadline: 'Ofertas exclusivas actualizadas cada minuto',
      exploreDeals: 'Ver Todas Ofertas',
      flashDeals: 'Ofertas Flash',
      liveNow: 'En Vivo',
      bookNow: 'Reservar',
      save: 'Ahorra',
      viewing: 'viendo',
      justBooked: 'Reservado recientemente',
    },
  };

  const t = translations[language];

  // Simulate live updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDeals(prev =>
        prev.map(deal => ({
          ...deal,
          viewingCount: Math.max(50, Math.min(500, deal.viewingCount + Math.floor(Math.random() * 20) - 10)),
        }))
      );
      setRefreshKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden">
      <div className="grid lg:grid-cols-5 min-h-screen">
        {/* Left Side - Visual Content (60%) */}
        <div className="lg:col-span-3 relative">
          {/* Background Image/Video */}
          <div className="absolute inset-0">
            {videoSrc ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            ) : (
              <Image
                src="/patterns/hero-travel.jpg"
                alt="Travel destination"
                fill
                className="object-cover animate-ken-burns"
                priority
                quality={90}
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Left Side Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 py-20">
            <div className="max-w-xl">
              {/* Live Indicator */}
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 animate-pulse-glow">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                {t.liveNow}
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
                {t.headline}
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
                  {t.headlineAccent}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {t.subheadline}
              </p>

              {/* CTA */}
              <button
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
              >
                {t.exploreDeals}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </button>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-white mb-1">50K+</div>
                  <div className="text-sm text-white/70">Travelers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-white mb-1">1000+</div>
                  <div className="text-sm text-white/70">Destinations</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-white mb-1">65%</div>
                  <div className="text-sm text-white/70">Avg Savings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Divider */}
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-50 animate-pulse hidden lg:block" />
        </div>

        {/* Right Side - Live Deal Feed (40%) */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 md:p-8 space-y-6">
              {/* Header */}
              <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md pb-4 -mx-6 px-6 pt-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                    <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                    {t.flashDeals}
                  </h2>
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span>Updated {refreshKey} sec ago</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm">Limited time offers - grab them before they're gone!</p>
              </div>

              {/* Deal Cards */}
              <div className="space-y-4">
                {currentDeals.map((deal, index) => (
                  <div
                    key={deal.id}
                    className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => onDealClick(deal.id)}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Image */}
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                        <Image
                          src={deal.image}
                          alt={deal.destination}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                          -{deal.discount}%
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Destination */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {deal.destination}
                            </h3>
                            <p className="text-sm text-white/60 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {deal.country}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-3xl font-extrabold text-white">
                            ${deal.price}
                          </span>
                          <span className="text-base text-gray-400 line-through">
                            ${deal.originalPrice}
                          </span>
                          <span className="text-green-400 text-sm font-bold">
                            {t.save} ${deal.originalPrice - deal.price}
                          </span>
                        </div>

                        {/* Countdown */}
                        <div className="bg-black/30 rounded-lg p-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                            <Clock className="w-3 h-3" />
                            <span>Ends in:</span>
                          </div>
                          <CountdownTimer endTime={deal.dealEndsAt} size="sm" />
                        </div>

                        {/* Activity Indicators */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* Viewing Count */}
                          <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />
                            <span className="font-semibold">{deal.viewingCount}</span>
                            <span>{t.viewing}</span>
                          </div>

                          {/* Just Booked */}
                          {deal.justBooked && (
                            <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full animate-pulse">
                              <CheckIcon className="w-3 h-3" />
                              <span>{deal.justBooked.name} - {deal.justBooked.timeAgo}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <button className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 group-hover:scale-105 text-sm">
                          {t.bookNow}
                        </button>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* View More */}
              <button className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                View All {flashDeals.length}+ Deals
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes ken-burns {
          0% { transform: scale(1) translateX(0) translateY(0); }
          50% { transform: scale(1.1) translateX(-2%) translateY(-2%); }
          100% { transform: scale(1) translateX(0) translateY(0); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.8); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
        .animate-slide-in {
          animation: slide-in 0.6s ease-out both;
        }
        .animate-ken-burns {
          animation: ken-burns 30s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
