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

  // Ultra-compact World Cup banner - Mobile optimized single row
  return (
    <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-yellow-500 text-white rounded-lg shadow-lg overflow-hidden border border-yellow-400/30">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-1 right-1 text-white/70 hover:text-white transition-colors z-20 bg-black/20 rounded-full p-0.5 hover:bg-black/40"
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      {/* Main Content - Ultra compact for mobile */}
      <div className="relative z-10 px-2.5 py-1.5 lg:px-4 lg:py-2">
        {/* Mobile: Single compact row */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-lg flex-shrink-0">🏆</span>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[10px] text-yellow-300 leading-tight truncate">{t.badge}</p>
            <p className="text-[9px] text-white/90 leading-tight truncate">{isRelevant ? t.titleRelevant : t.description}</p>
          </div>
          <Link
            href="/world-cup-2026/packages"
            onClick={handleCTAClick}
            className="flex-shrink-0 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap"
          >
            {isRelevant ? t.ctaRelevant : t.cta}
          </Link>
        </div>

        {/* Desktop: Full layout */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🏆</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">{t.badge}</span>
              <span className="text-white/50">•</span>
              <span className="font-bold text-xs">{isRelevant ? t.titleRelevant : t.title}</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-3 text-xs">
            <span className="text-white/95">{isRelevant ? t.descriptionRelevant : t.description}</span>
            <div className="inline-flex items-center gap-1 bg-green-500/30 px-2 py-0.5 rounded-full border border-green-400/50">
              <SparklesIcon className="w-3 h-3 text-yellow-300" />
              <span className="font-bold text-xs">{t.savings}</span>
            </div>
            <span className="text-white/90 text-xs">{t.cities}</span>
          </div>
          <Link
            href="/world-cup-2026/packages"
            onClick={handleCTAClick}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-1.5 rounded-lg font-black text-sm hover:from-yellow-300 hover:to-orange-400 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <TrophyIcon className="w-4 h-4" />
            {isRelevant ? t.ctaRelevant : t.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
