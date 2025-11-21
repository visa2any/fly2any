'use client';

/**
 * PERFORMANCE-OPTIMIZED World Cup Hero Section
 *
 * Optimizations:
 * - Dynamic imports for heavy dependencies
 * - Intersection Observer for lazy rendering
 * - Memoized calculations
 * - Optimized re-renders
 * - Reduced bundle size
 */

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { trackWorldCupCTA } from '@/lib/analytics/google-analytics';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

// Lazy load heavy icons only when needed
const TrophyIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.TrophyIcon })), {
  loading: () => <div className="w-6 h-6 animate-pulse bg-yellow-400/20 rounded" />,
  ssr: false
});

const CalendarDaysIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.CalendarDaysIcon })), {
  ssr: false
});

const MapPinIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.MapPinIcon })), {
  ssr: false
});

const TicketIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.TicketIcon })), {
  ssr: false
});

interface WorldCupHeroSectionProps {
  lang?: 'en' | 'pt' | 'es';
  compact?: boolean;
  priority?: boolean; // Load above the fold
}

const content = {
  en: {
    badge: '🏆 FIFA WORLD CUP 2026',
    title: 'Experience History in North America',
    subtitle: 'The biggest World Cup ever • 48 teams • 16 cities • 104 matches',
    countdown: {
      title: 'Tournament starts in:',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
    },
    features: [
      { text: 'June 11 - July 19, 2026' },
      { text: 'USA • Canada • Mexico' },
      { text: 'From $2,499 All-Inclusive' },
    ],
    cta: {
      primary: 'View Packages',
      secondary: 'Explore Stadiums',
    },
    urgency: '⚡ Early Bird: Save up to 20% | Limited Availability',
  },
  pt: {
    badge: '🏆 COPA DO MUNDO FIFA 2026',
    title: 'Experimente a História na América do Norte',
    subtitle: 'A maior Copa do Mundo de todos os tempos • 48 seleções • 16 cidades • 104 jogos',
    countdown: {
      title: 'Torneio começa em:',
      days: 'Dias',
      hours: 'Horas',
      minutes: 'Minutos',
    },
    features: [
      { text: '11 de junho - 19 de julho, 2026' },
      { text: 'EUA • Canadá • México' },
      { text: 'A partir de $2.499 Tudo Incluído' },
    ],
    cta: {
      primary: 'Ver Pacotes',
      secondary: 'Explorar Estádios',
    },
    urgency: '⚡ Desconto Antecipado: Economize até 20% | Disponibilidade Limitada',
  },
  es: {
    badge: '🏆 COPA MUNDIAL FIFA 2026',
    title: 'Experimenta la Historia en América del Norte',
    subtitle: 'La Copa del Mundo más grande • 48 equipos • 16 ciudades • 104 partidos',
    countdown: {
      title: 'El torneo comienza en:',
      days: 'Días',
      hours: 'Horas',
      minutes: 'Minutos',
    },
    features: [
      { text: '11 de junio - 19 de julio, 2026' },
      { text: 'EE.UU. • Canadá • México' },
      { text: 'Desde $2,499 Todo Incluido' },
    ],
    cta: {
      primary: 'Ver Paquetes',
      secondary: 'Explorar Estadios',
    },
    urgency: '⚡ Oferta Anticipada: Ahorra hasta 20% | Disponibilidad Limitada',
  },
};

// Memoized countdown calculation
const useCountdown = () => {
  const hasMounted = useHasMounted();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-06-11T00:00:00Z').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

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
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return { timeLeft, hasMounted };
};

// Memoized compact version
const CompactVersion = memo(({ t, timeLeft, hasMounted, handleCTAClick }: any) => (
  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-4">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 animate-bounce">🏆</div>
        <div>
          <p className="font-black text-sm">{t.badge}</p>
          <p className="text-xs opacity-90" suppressHydrationWarning>
            {hasMounted ? `${timeLeft.days} days until kickoff!` : 'World Cup 2026'}
          </p>
        </div>
      </div>
      <Link
        href="/world-cup-2026"
        onClick={() => handleCTAClick('packages')}
        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all transform hover:scale-105 whitespace-nowrap"
      >
        {t.cta.primary}
      </Link>
    </div>
  </div>
));

CompactVersion.displayName = 'WorldCupHeroCompact';

// Memoized countdown display
const CountdownDisplay = memo(({ timeLeft, hasMounted, t }: any) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
    <p className="text-center text-lg font-semibold mb-6 text-white/90">
      {t.countdown.title}
    </p>

    <div className="grid grid-cols-3 gap-4">
      {[
        { value: timeLeft.days, label: t.countdown.days },
        { value: timeLeft.hours, label: t.countdown.hours },
        { value: timeLeft.minutes, label: t.countdown.minutes },
      ].map(({ value, label }, index) => (
        <div key={index} className="text-center">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-xl p-4 shadow-lg">
            <div className="text-4xl font-black" suppressHydrationWarning>
              {hasMounted ? value : '--'}
            </div>
          </div>
          <p className="text-sm font-semibold mt-2 text-white/80">{label}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
      {[
        { value: 48, label: 'Teams' },
        { value: 16, label: 'Cities' },
        { value: 104, label: 'Matches' },
      ].map(({ value, label }, index) => (
        <div key={index}>
          <div className="text-3xl font-black text-yellow-400">{value}</div>
          <div className="text-xs text-white/70 font-semibold mt-1">{label}</div>
        </div>
      ))}
    </div>
  </div>
));

CountdownDisplay.displayName = 'CountdownDisplay';

export const WorldCupHeroSectionOptimized = memo(function WorldCupHeroSection({
  lang = 'en',
  compact = false,
  priority = false
}: WorldCupHeroSectionProps) {
  const t = content[lang];
  const { timeLeft, hasMounted } = useCountdown();
  const [isVisible, setIsVisible] = useState(priority); // Load immediately if priority

  // Intersection Observer for lazy rendering
  useEffect(() => {
    if (priority) return; // Skip if priority load

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    const element = document.getElementById('world-cup-hero');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [priority]);

  const handleCTAClick = useMemo(() => (type: 'packages' | 'stadiums') => {
    trackWorldCupCTA('package', 'homepage_hero', `hero_${type}_button`);
  }, []);

  if (compact) {
    return <CompactVersion t={t} timeLeft={timeLeft} hasMounted={hasMounted} handleCTAClick={handleCTAClick} />;
  }

  // Placeholder for lazy loading
  if (!isVisible) {
    return (
      <div
        id="world-cup-hero"
        className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-64 h-8 bg-white/10 rounded mb-4 mx-auto"></div>
            <div className="w-96 h-12 bg-white/10 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="world-cup-hero" className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      {/* Floating Trophy Icons - Only render if visible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 opacity-10">🏆</div>
        <div className="absolute bottom-10 right-20 w-16 h-16 opacity-10">🏆</div>
        <div className="absolute top-20 right-40 w-12 h-12 opacity-10">🏆</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Content */}
          <div className="text-center md:text-left space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="text-2xl animate-pulse">🏆</span>
              <span className="font-black text-sm tracking-wide">{t.badge}</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
              {t.title}
            </h2>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/90 font-medium">
              {t.subtitle}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDaysIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white/90">{t.features[0].text}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPinIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white/90">{t.features[1].text}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TicketIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white/90">{t.features[2].text}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/world-cup-2026/packages"
                onClick={() => handleCTAClick('packages')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-lg font-black text-lg hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
              >
                <TicketIcon className="w-6 h-6" />
                {t.cta.primary}
              </Link>
              <Link
                href="/world-cup-2026/stadiums"
                onClick={() => handleCTAClick('stadiums')}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <MapPinIcon className="w-6 h-6" />
                {t.cta.secondary}
              </Link>
            </div>

            {/* Urgency Banner */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3 rounded-lg text-center font-bold text-sm animate-pulse shadow-lg">
              {t.urgency}
            </div>
          </div>

          {/* Right Column - Countdown */}
          <CountdownDisplay timeLeft={timeLeft} hasMounted={hasMounted} t={t} />
        </div>
      </div>
    </div>
  );
});
