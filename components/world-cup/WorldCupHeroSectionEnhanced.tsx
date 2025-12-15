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
    sectionTitle: '⚽ FIFA World Cup 2026',
    sectionSubtitle: 'Book your travel packages for the biggest sporting event in history',
    viewAll: 'View All Packages',
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
    sectionTitle: '⚽ Copa do Mundo FIFA 2026',
    sectionSubtitle: 'Reserve seus pacotes de viagem para o maior evento esportivo da história',
    viewAll: 'Ver Todos os Pacotes',
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
    sectionTitle: '⚽ Copa Mundial FIFA 2026',
    sectionSubtitle: 'Reserva tus paquetes de viaje para el evento deportivo más grande de la historia',
    viewAll: 'Ver Todos los Paquetes',
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
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-red-600 text-white py-3 px-4 relative overflow-hidden">
        {/* Animated soccer balls background */}
        <div className="absolute inset-0 opacity-30">
          <div className="animate-float-soccer text-3xl">⚽</div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-6 h-6 animate-bounce" />
            <div>
              {/* Level-6: 12px minimum for compact text */}
              <p className="font-black text-xs">{t.badge}</p>
              <p className="text-xs opacity-90" suppressHydrationWarning>
                {hasMounted ? `${timeLeft.days} days until kickoff!` : 'World Cup 2026'}
              </p>
            </div>
          </div>
          {/* Level-6: 36px minimum touch target */}
          <Link
            href="/world-cup-2026"
            onClick={() => handleCTAClick('packages')}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-xl font-black text-xs hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 transform hover:scale-105 whitespace-nowrap shadow-xl min-h-[36px] flex items-center"
          >
            {t.cta.primary}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-2 md:py-6 lg:py-10" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Section Header - Level-6: Mobile compact, Desktop cinematic */}
      <div className="flex items-center justify-between mb-2 md:mb-4 lg:mb-6 px-3 md:px-0">
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          {/* Trophy Icon - Level-6: Larger on desktop */}
          <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-secondary-400 via-secondary-500 to-orange-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg lg:shadow-xl">
            <TrophyIcon className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <div>
            {/* Level-6: 13px mobile minimum, proper scaling */}
            <h2 className="text-[13px] md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] whitespace-nowrap">{t.sectionTitle}</h2>
            <p className="text-[11px] md:text-sm lg:text-base text-neutral-500 mt-0.5">{t.sectionSubtitle}</p>
          </div>
        </div>
        {/* Level-6: 12px mobile minimum for links */}
        <Link
          href="/world-cup-2026"
          className="text-xs md:text-sm lg:text-base font-semibold text-primary-600 hover:text-primary-700 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] whitespace-nowrap hover:-translate-y-0.5"
        >
          {t.viewAll} →
        </Link>
      </div>

      {/* Divider - Level-6: Clean separator */}
      <div className="hidden md:block h-px bg-neutral-200 mb-2 md:mb-4 lg:mb-6"></div>

      {/* Main World Cup Hero - Level-6: Edge-to-edge mobile, premium rounded desktop */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-blue-900 to-red-900 md:rounded-xl lg:rounded-2xl md:mx-0">
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

      {/* Animated Soccer Balls - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 hidden md:block">
        <div className="text-8xl absolute top-4 left-10 animate-bounce-slow opacity-50 drop-shadow-2xl">⚽</div>
        <div className="text-6xl absolute top-8 right-20 animate-spin-slow opacity-40 drop-shadow-2xl">⚽</div>
        <div className="text-7xl absolute bottom-4 left-1/4 animate-bounce-medium opacity-45 drop-shadow-2xl">⚽</div>
        <div className="text-5xl absolute bottom-6 right-1/3 animate-float-slow opacity-50 drop-shadow-2xl">🏆</div>
      </div>

      {/* Flag Colors Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-info-500 via-white to-red-500 opacity-60" />

      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-10 py-3 md:py-10 lg:py-14 relative z-30">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-10 xl:gap-14 items-center">
          {/* Left Column - 8pt grid */}
          <div className="text-center lg:text-left space-y-2 md:space-y-4">
            {/* Level-6: Badge 8pt grid */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg animate-pulse-slow">
              <span className="text-sm md:text-xl">🏆</span>
              <span className="font-black text-xs md:text-sm tracking-wide text-gray-900">{t.badge}</span>
            </div>

            {/* Level-6: Title with proper mobile scaling */}
            <h2 className="text-xl md:text-4xl lg:text-5xl font-black leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent animate-shimmer">
                {t.title}
              </span>
            </h2>

            {/* Level-6: Subtitle 8pt grid */}
            <p className="text-[13px] md:text-xl text-white/95 font-bold flex items-center justify-center lg:justify-start gap-2">
              <SparklesIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-400 animate-pulse" />
              {t.subtitle}
              <SparklesIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-400 animate-pulse" />
            </p>

            {/* Level-6: Stats Row with 11px mobile minimum */}
            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-4 text-[11px] md:text-sm font-bold text-white/90">
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-400 text-sm md:text-xl">48</span> {t.stats.teams}
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-400 text-sm md:text-xl">16</span> {t.stats.cities}
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-400 text-sm md:text-xl">104</span> {t.stats.matches}
              </span>
            </div>

            {/* Level-6: CTAs 8pt grid, 36px+ touch targets */}
            <div className="flex gap-3 pt-2 md:pt-4">
              <Link
                href="/world-cup-2026/packages"
                onClick={() => handleCTAClick('packages')}
                className="group relative flex-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-gray-900 px-3 py-2 md:px-6 md:py-3 rounded-xl font-black text-xs md:text-base hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden min-h-[36px] md:min-h-[48px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <TicketIcon className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
                <span className="relative z-10">{t.cta.primary}</span>
              </Link>
              <Link
                href="/world-cup-2026/stadiums"
                onClick={() => handleCTAClick('stadiums')}
                className="flex-1 bg-white/20 backdrop-blur-md border border-white/40 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold text-xs md:text-base hover:bg-white/30 hover:border-white/60 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 min-h-[36px] md:min-h-[48px]"
              >
                <MapPinIcon className="w-4 h-4 md:w-5 md:h-5" />
                {t.cta.secondary}
              </Link>
            </div>

            {/* Urgency Banner - 8pt grid */}
            <div className="hidden md:block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 px-4 py-3 rounded-xl text-center font-bold text-sm animate-pulse shadow-2xl border-2 border-red-400">
              {t.urgency}
            </div>
          </div>

          {/* Level-6: Countdown 8pt grid */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/30 shadow-xl">
            <p className="text-center text-xs md:text-lg font-black mb-2 md:mb-4 text-yellow-400 uppercase tracking-wide flex items-center justify-center gap-2">
              <span className="animate-pulse text-sm md:text-lg">🔥</span>
              {t.countdown.title}
              <span className="animate-pulse text-sm md:text-lg">🔥</span>
            </p>

            {/* Level-6: Countdown Grid 8pt */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-2 md:mb-4">
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg">
                  <div className="text-lg md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? timeLeft.days : '--'}
                  </div>
                </div>
                <p className="text-[10px] md:text-sm font-bold mt-1 md:mt-2 text-white">{t.countdown.days}</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-info-500 to-blue-700 text-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg">
                  <div className="text-lg md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? String(timeLeft.hours).padStart(2, '0') : '--'}
                  </div>
                </div>
                <p className="text-[10px] md:text-sm font-bold mt-1 md:mt-2 text-white">{t.countdown.hours}</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg">
                  <div className="text-lg md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? String(timeLeft.minutes).padStart(2, '0') : '--'}
                  </div>
                </div>
                <p className="text-[10px] md:text-sm font-bold mt-1 md:mt-2 text-white">{t.countdown.minutes}</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg animate-pulse-fast">
                  <div className="text-lg md:text-4xl font-black tabular-nums" suppressHydrationWarning>
                    {hasMounted ? String(timeLeft.seconds).padStart(2, '0') : '--'}
                  </div>
                </div>
                <p className="text-[10px] md:text-sm font-bold mt-1 md:mt-2 text-white">{t.countdown.seconds}</p>
              </div>
            </div>

            {/* Live Indicator 8pt */}
            <div className="text-center pt-2 sm:pt-3 border-t border-white/20">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/90">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <span className="relative">
                  <span className="absolute w-2 h-2 bg-green-500 rounded-full left-[-16px]" />
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
    </section>
  );
}
