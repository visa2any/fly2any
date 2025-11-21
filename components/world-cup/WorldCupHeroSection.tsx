'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrophyIcon, CalendarDaysIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';
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
    subtitle: 'The biggest World Cup ever • 48 teams • 16 cities • 104 matches',
    countdown: {
      title: 'Tournament starts in:',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
    },
    features: [
      { icon: CalendarDaysIcon, text: 'June 11 - July 19, 2026' },
      { icon: MapPinIcon, text: 'USA • Canada • Mexico' },
      { icon: TicketIcon, text: 'From $2,499 All-Inclusive' },
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
      { icon: CalendarDaysIcon, text: '11 de junho - 19 de julho, 2026' },
      { icon: MapPinIcon, text: 'EUA • Canadá • México' },
      { icon: TicketIcon, text: 'A partir de $2.499 Tudo Incluído' },
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
      { icon: CalendarDaysIcon, text: '11 de junio - 19 de julio, 2026' },
      { icon: MapPinIcon, text: 'EE.UU. • Canadá • México' },
      { icon: TicketIcon, text: 'Desde $2,499 Todo Incluido' },
    ],
    cta: {
      primary: 'Ver Paquetes',
      secondary: 'Explorar Estadios',
    },
    urgency: '⚡ Oferta Anticipada: Ahorra hasta 20% | Disponibilidad Limitada',
  },
};

export function WorldCupHeroSection({ lang = 'en', compact = false }: WorldCupHeroSectionProps) {
  const t = content[lang];
  const hasMounted = useHasMounted();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCTAClick = (type: 'packages' | 'stadiums') => {
    trackWorldCupCTA('package', 'homepage_hero', `hero_${type}_button`);
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 animate-bounce" />
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
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      {/* Floating Trophy Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <TrophyIcon className="absolute top-10 left-10 w-20 h-20 opacity-10 animate-float-slow" />
        <TrophyIcon className="absolute bottom-10 right-20 w-16 h-16 opacity-10 animate-float-medium" />
        <TrophyIcon className="absolute top-20 right-40 w-12 h-12 opacity-10 animate-float-fast" />
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
              {t.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-semibold">
                  <feature.icon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-white/90">{feature.text}</span>
                </div>
              ))}
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <p className="text-center text-lg font-semibold mb-6 text-white/90">
              {t.countdown.title}
            </p>

            {/* Countdown Timer */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-xl p-4 shadow-lg">
                  <div className="text-4xl font-black" suppressHydrationWarning>
                    {hasMounted ? timeLeft.days : '--'}
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2 text-white/80">{t.countdown.days}</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-xl p-4 shadow-lg">
                  <div className="text-4xl font-black" suppressHydrationWarning>
                    {hasMounted ? timeLeft.hours : '--'}
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2 text-white/80">{t.countdown.hours}</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-xl p-4 shadow-lg">
                  <div className="text-4xl font-black" suppressHydrationWarning>
                    {hasMounted ? timeLeft.minutes : '--'}
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2 text-white/80">{t.countdown.minutes}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black text-yellow-400">48</div>
                <div className="text-xs text-white/70 font-semibold mt-1">
                  {lang === 'en' ? 'Teams' : lang === 'pt' ? 'Seleções' : 'Equipos'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-yellow-400">16</div>
                <div className="text-xs text-white/70 font-semibold mt-1">
                  {lang === 'en' ? 'Cities' : lang === 'pt' ? 'Cidades' : 'Ciudades'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-yellow-400">104</div>
                <div className="text-xs text-white/70 font-semibold mt-1">
                  {lang === 'en' ? 'Matches' : lang === 'pt' ? 'Jogos' : 'Partidos'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-10deg);
          }
        }

        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
