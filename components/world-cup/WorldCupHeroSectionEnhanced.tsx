'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrophyIcon, CalendarDaysIcon, MapPinIcon, TicketIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { trackWorldCupCTA } from '@/lib/analytics/google-analytics';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

interface WorldCupHeroSectionProps {
  lang?: 'en' | 'pt' | 'es';
  compact?: boolean;
}

const content = {
  en: {
    badge: '🏆 FIFA WORLD CUP 2026',
    title: 'Experience History in North America',
    subtitle: 'The biggest World Cup ever',
    countdown: {
      title: 'Tournament Starts In:',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
    },
    stats: {
      teams: '48 Teams',
      cities: '16 Cities',
      matches: '104 Matches',
    },
    cta: {
      primary: 'View Packages',
      secondary: 'Explore Stadiums',
    },
    urgency: '⚡ Early Bird: Save up to 20% | Limited Availability',
  },
  pt: {
    badge: '🏆 COPA DO MUNDO FIFA 2026',
    title: 'Experimente a História na América do Norte',
    subtitle: 'A maior Copa do Mundo de todos os tempos',
    countdown: {
      title: 'Torneio Começa Em:',
      days: 'Dias',
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos',
    },
    stats: {
      teams: '48 Seleções',
      cities: '16 Cidades',
      matches: '104 Jogos',
    },
    cta: {
      primary: 'Ver Pacotes',
      secondary: 'Explorar Estádios',
    },
    urgency: '⚡ Desconto Antecipado: Economize até 20% | Disponibilidade Limitada',
  },
  es: {
    badge: '🏆 COPA MUNDIAL FIFA 2026',
    title: 'Experimenta la Historia en América del Norte',
    subtitle: 'La Copa del Mundo más grande',
    countdown: {
      title: 'El Torneo Comienza En:',
      days: 'Días',
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos',
    },
    stats: {
      teams: '48 Equipos',
      cities: '16 Ciudades',
      matches: '104 Partidos',
    },
    cta: {
      primary: 'Ver Paquetes',
      secondary: 'Explorar Estadios',
    },
    urgency: '⚡ Oferta Anticipada: Ahorra hasta 20% | Disponibilidad Limitada',
  },
};

export function WorldCupHeroSectionEnhanced({ lang = 'en', compact = false }: WorldCupHeroSectionProps) {
  const t = content[lang];
  const hasMounted = useHasMounted();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Update countdown every second
  useEffect(() => {
    const targetDate = new Date('2026-06-11T00:00:00Z');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second!
    return () => clearInterval(interval);
  }, []);

  const handleCTAClick = (type: 'packages' | 'stadiums') => {
    trackWorldCupCTA('package', 'homepage_hero', `hero_${type}_button`);
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-red-600 text-white py-2 px-3 relative overflow-hidden">
        {/* Animated soccer balls background - MORE VISIBLE */}
        <div className="absolute inset-0 opacity-30">
          <div className="animate-float-soccer text-3xl">⚽</div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 animate-bounce" />
            <div>
              <p className="font-black text-xs">{t.badge}</p>
              <p className="text-xs opacity-90" suppressHydrationWarning>
                {hasMounted ? `${timeLeft.days} days until kickoff!` : 'World Cup 2026'}
              </p>
            </div>
          </div>
          <Link
            href="/world-cup-2026"
            onClick={() => handleCTAClick('packages')}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1.5 rounded-lg font-black text-xs hover:from-yellow-300 hover:to-yellow-400 transition-all transform hover:scale-105 whitespace-nowrap shadow-xl"
          >
            {t.cta.primary}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main World Cup Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-blue-900 to-red-900">
      {/* Stadium Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-blue-900/85 to-red-900/90 z-10" />
        {/* Grass field pattern - MORE VISIBLE */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(255, 255, 255, 0.1) 40px,
            rgba(255, 255, 255, 0.1) 80px
          )`,
        }} />
      </div>

      {/* Animated Soccer Balls - MUCH MORE VISIBLE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        <div className="text-7xl sm:text-8xl absolute top-4 left-4 sm:left-10 animate-bounce-slow opacity-50 drop-shadow-2xl">⚽</div>
        <div className="text-5xl sm:text-6xl absolute top-8 right-8 sm:right-20 animate-spin-slow opacity-40 drop-shadow-2xl">⚽</div>
        <div className="text-6xl sm:text-7xl absolute bottom-4 left-1/4 animate-bounce-medium opacity-45 drop-shadow-2xl">⚽</div>
        <div className="text-4xl sm:text-5xl absolute bottom-6 right-1/3 animate-float-slow opacity-50 drop-shadow-2xl">🏆</div>
      </div>

      {/* Flag Colors Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 via-white to-red-500 opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 relative z-30">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-3 sm:space-y-4">
            {/* Animated Badge - SMALLER */}
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-2xl animate-pulse-slow">
              <span className="text-lg sm:text-xl">🏆</span>
              <span className="font-black text-xs sm:text-sm tracking-wide text-gray-900">{t.badge}</span>
            </div>

            {/* Title with Gradient - 40% SMALLER */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent animate-shimmer">
                {t.title}
              </span>
            </h2>

            {/* Subtitle - SMALLER */}
            <p className="text-base sm:text-lg md:text-xl text-white/95 font-bold flex items-center justify-center lg:justify-start gap-1.5">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
              {t.subtitle}
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
            </p>

            {/* Stats Row - SMALLER */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-white/90">
              <span className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg sm:text-xl">48</span> {t.stats.teams}
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg sm:text-xl">16</span> {t.stats.cities}
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg sm:text-xl">104</span> {t.stats.matches}
              </span>
            </div>

            {/* CTAs - SMALLER */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Link
                href="/world-cup-2026/packages"
                onClick={() => handleCTAClick('packages')}
                className="group relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-gray-900 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-black text-sm sm:text-base hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <TicketIcon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t.cta.primary}</span>
              </Link>
              <Link
                href="/world-cup-2026/stadiums"
                onClick={() => handleCTAClick('stadiums')}
                className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/30 hover:border-white/60 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <MapPinIcon className="w-5 h-5" />
                {t.cta.secondary}
              </Link>
            </div>

            {/* Urgency Banner - SMALLER */}
            <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-center font-bold text-xs sm:text-sm animate-pulse shadow-2xl border-2 border-red-400">
              {t.urgency}
            </div>
          </div>

          {/* Right Column - LIVE Countdown Timer - COMPACT */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 lg:p-6 border-2 border-white/30 shadow-2xl">
            <p className="text-center text-sm sm:text-base md:text-lg font-black mb-3 sm:mb-4 text-yellow-400 uppercase tracking-wide flex items-center justify-center gap-1.5">
              <span className="animate-pulse text-base sm:text-lg">🔥</span>
              {t.countdown.title}
              <span className="animate-pulse text-base sm:text-lg">🔥</span>
            </p>

            {/* Countdown Grid with SECONDS - COMPACT */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {/* Days - COMPACT */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? timeLeft.days : '--'}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold mt-1 sm:mt-1.5 text-white">{t.countdown.days}</p>
              </div>

              {/* Hours - COMPACT */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? String(timeLeft.hours).padStart(2, '0') : '--'}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold mt-1 sm:mt-1.5 text-white">{t.countdown.hours}</p>
              </div>

              {/* Minutes - COMPACT */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? String(timeLeft.minutes).padStart(2, '0') : '--'}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold mt-1 sm:mt-1.5 text-white">{t.countdown.minutes}</p>
              </div>

              {/* SECONDS - COMPACT - Shows it's LIVE! */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl animate-pulse-fast transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? String(timeLeft.seconds).padStart(2, '0') : '--'}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold mt-1 sm:mt-1.5 text-white">{t.countdown.seconds}</p>
              </div>
            </div>

            {/* Live Indicator - COMPACT */}
            <div className="text-center pt-2 sm:pt-3 border-t border-white/20">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-ping" />
                <span className="relative">
                  <span className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full left-[-12px] sm:left-[-16px]" />
                  LIVE COUNTDOWN
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      </div> {/* Close Main World Cup Hero */}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }

        @keyframes bounce-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }

        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-bounce-medium {
          animation: bounce-medium 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
