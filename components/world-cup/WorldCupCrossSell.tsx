'use client';

import Link from 'next/link';
import { TrophyIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { trackWorldCupCTA } from '@/lib/analytics/google-analytics';
import { useState } from 'react';

interface WorldCupCrossSellProps {
  lang?: 'en' | 'pt' | 'es';
  location: string;
  isRelevant?: boolean; // If true, shows more prominent version
  compact?: boolean;
}

const content = {
  en: {
    badge: '⚽ FIFA WORLD CUP 2026',
    title: 'Flying to a World Cup City?',
    titleRelevant: '🏆 This City Hosts World Cup 2026!',
    description: 'Get exclusive packages with flights, hotels & match tickets',
    descriptionRelevant: 'Complete packages available with match tickets included!',
    cta: 'View World Cup Packages',
    ctaRelevant: 'See Tournament Packages',
    savings: 'Save up to 20% on early bookings',
    cities: 'USA • Canada • Mexico | June 11 - July 19, 2026',
  },
  pt: {
    badge: '⚽ COPA DO MUNDO FIFA 2026',
    title: 'Voando para uma Cidade da Copa?',
    titleRelevant: '🏆 Esta Cidade Sedia a Copa 2026!',
    description: 'Pacotes exclusivos com voos, hotéis e ingressos',
    descriptionRelevant: 'Pacotes completos disponíveis com ingressos incluídos!',
    cta: 'Ver Pacotes Copa do Mundo',
    ctaRelevant: 'Ver Pacotes do Torneio',
    savings: 'Economize até 20% em reservas antecipadas',
    cities: 'EUA • Canadá • México | 11 jun - 19 jul, 2026',
  },
  es: {
    badge: '⚽ COPA MUNDIAL FIFA 2026',
    title: '¿Volando a una Ciudad del Mundial?',
    titleRelevant: '🏆 ¡Esta Ciudad Organiza el Mundial 2026!',
    description: 'Paquetes exclusivos con vuelos, hoteles y entradas',
    descriptionRelevant: '¡Paquetes completos disponibles con entradas incluidas!',
    cta: 'Ver Paquetes Mundial',
    ctaRelevant: 'Ver Paquetes del Torneo',
    savings: 'Ahorra hasta 20% en reservas anticipadas',
    cities: 'EE.UU. • Canadá • México | 11 jun - 19 jul, 2026',
  },
};

export function WorldCupCrossSell({
  lang = 'en',
  location,
  isRelevant = false,
  compact = false
}: WorldCupCrossSellProps) {
  const t = content[lang];
  const [isDismissed, setIsDismissed] = useState(false);

  const handleCTAClick = () => {
    trackWorldCupCTA('package', location, 'cross_sell_banner');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  // Compact version (less prominent)
  if (compact && !isRelevant) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md overflow-hidden mb-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors z-10"
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-sm">{t.badge}</p>
              <p className="text-xs opacity-90">{t.description}</p>
            </div>
          </div>

          <Link
            href="/world-cup-2026/packages"
            onClick={handleCTAClick}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all transform hover:scale-105 whitespace-nowrap flex-shrink-0"
          >
            {t.cta}
          </Link>
        </div>
      </div>
    );
  }

  // Ultra-compact World Cup banner - Single horizontal row with fan energy
  return (
    <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-yellow-500 text-white rounded-lg shadow-xl overflow-hidden border-2 border-yellow-400/50">
      {/* Animated Background Pattern - Stadium Lights Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 3s infinite',
        }}></div>
      </div>

      {/* Animated Confetti Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <span className="absolute top-1 left-[10%] text-2xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>⚽</span>
        <span className="absolute top-1 left-[30%] text-xl animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }}>🏆</span>
        <span className="absolute top-1 right-[30%] text-xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.2s' }}>⚽</span>
        <span className="absolute top-1 right-[10%] text-2xl animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '2.8s' }}>🎉</span>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-1 right-1 text-white/70 hover:text-white transition-colors z-20 bg-black/20 rounded-full p-1 hover:bg-black/40"
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>

      {/* Main Content - Single Horizontal Row */}
      <div className="relative z-10 px-3 py-2.5 lg:py-2">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-4">

          {/* Left Section: Badge + Title (Inline) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-3xl animate-bounce" style={{ animationDuration: '1.5s' }}>🏆</span>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
              <span className="font-black text-sm lg:text-base bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
                {t.badge}
              </span>
              <span className="hidden lg:block text-white/50">•</span>
              <span className="font-bold text-xs lg:text-sm leading-tight">
                {isRelevant ? t.titleRelevant : t.title}
              </span>
            </div>
          </div>

          {/* Center Section: Description + Savings + Dates (All Inline) */}
          <div className="flex-1 flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:justify-center">
            <span className="text-white/95 font-medium">
              {isRelevant ? t.descriptionRelevant : t.description}
            </span>
            <span className="hidden lg:inline text-white/40">|</span>
            <div className="inline-flex items-center gap-1 bg-green-500/30 px-2 py-0.5 rounded-full border border-green-400/50">
              <SparklesIcon className="w-3 h-3 text-yellow-300" />
              <span className="font-bold text-xs">{t.savings}</span>
            </div>
            <span className="hidden lg:inline text-white/40">|</span>
            <span className="text-white/90 font-medium text-xs whitespace-nowrap">
              {t.cities}
            </span>
          </div>

          {/* Right Section: CTA Button */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full lg:w-auto">
            <Link
              href="/world-cup-2026/packages"
              onClick={handleCTAClick}
              className="flex-1 lg:flex-initial bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-gray-900 px-4 py-2 rounded-lg font-black text-xs lg:text-sm hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap border-2 border-yellow-300/50"
            >
              <TrophyIcon className="w-4 h-4" />
              {isRelevant ? t.ctaRelevant : t.cta}
            </Link>
            <div className="hidden lg:flex items-center gap-1 text-[10px] text-green-300 font-bold">
              <span className="text-base">✓</span>
              <span className="whitespace-nowrap">Full Package</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent Stripe */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 via-red-500 to-blue-600 animate-pulse" style={{ animationDuration: '3s' }}></div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
