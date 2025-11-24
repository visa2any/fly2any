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

  // Compact, streamlined version for flight results page
  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-lg shadow-lg overflow-hidden mb-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 15px 15px, white 1px, transparent 0)',
          backgroundSize: '30px 30px',
        }}></div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors z-10"
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      <div className="relative z-10 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Content - Compact single column */}
          <div className="flex-1 space-y-1.5">
            {/* Badge + Title - Single line on desktop */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                <span className="text-base">🏆</span>
                <span className="font-bold text-xs tracking-wide">{t.badge}</span>
              </div>
              <h3 className="text-base md:text-lg font-bold leading-tight">
                {isRelevant ? t.titleRelevant : t.title}
              </h3>
            </div>

            {/* Description - Compact */}
            <p className="text-xs md:text-sm text-white/90 leading-snug">
              {isRelevant ? t.descriptionRelevant : t.description}
            </p>

            {/* Savings + Dates - Horizontal compact layout */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-green-500/25 px-2 py-0.5 rounded-full">
                <SparklesIcon className="w-3 h-3 text-yellow-300" />
                <span>{t.savings}</span>
              </div>
              <div className="text-xs text-white/80 font-medium">
                {t.cities}
              </div>
            </div>
          </div>

          {/* Right: CTA - Compact button */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <Link
              href="/world-cup-2026/packages"
              onClick={handleCTAClick}
              className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2.5 rounded-lg font-bold text-sm hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <TrophyIcon className="w-4 h-4" />
              {isRelevant ? t.ctaRelevant : t.cta}
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-white/75">
              <span className="text-green-300 font-bold text-sm">✓</span>
              <span>Flights + Hotels + Tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thin Accent Line */}
      {isRelevant && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
      )}
    </div>
  );
}
