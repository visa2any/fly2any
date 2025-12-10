import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { WORLD_CUP_TEAMS, WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';
import { getWorldCupAtmosphereUrl, getStadiumHeroUrl } from '@/lib/utils/stadium-images';
import { worldCupMainMetadata, getWorldCupEventSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { UrgencyBanner } from '@/components/world-cup/UrgencyBanner';
import { CombinedUrgencyBanner } from '@/components/world-cup/CombinedUrgencyBanner';
import { TrustSignals } from '@/components/world-cup/TrustSignals';
import { FAQSection } from '@/components/world-cup/FAQSection';
import { WORLD_CUP_MAIN_FAQS } from '@/lib/data/world-cup-faqs';
import { HeroImageCarousel } from '@/components/world-cup/HeroImageCarousel';

// Dynamically import client components
const CountdownTimer = dynamic(() => import('@/components/world-cup/CountdownTimer'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center gap-4 py-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 bg-white/20 rounded-xl animate-pulse" />
          <div className="w-16 h-4 bg-white/20 rounded animate-pulse" />
        </div>
      ))}
    </div>
  ),
});

const TrophyAnimation = dynamic(() => import('@/components/world-cup/TrophyAnimation'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><div className="text-6xl animate-bounce">🏆</div></div>,
});

const TeamCard3D = dynamic(() => import('@/components/world-cup/TeamCard3D'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4" />
      <div className="h-6 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  ),
});

const StadiumCard3D = dynamic(() => import('@/components/world-cup/StadiumCard3D'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 animate-pulse">
      <div className="h-48 bg-gray-700 rounded-lg mb-4" />
      <div className="h-6 bg-gray-700 rounded mb-2" />
      <div className="h-4 bg-gray-700 rounded w-2/3" />
    </div>
  ),
});

// ISR Configuration
export const revalidate = 3600;

// Use advanced metadata generator
export const metadata: Metadata = worldCupMainMetadata();

export default function WorldCup2026Page() {
  const featuredTeams = WORLD_CUP_TEAMS.slice(0, 12);
  const featuredStadiums = WORLD_CUP_STADIUMS.slice(0, 6);

  // Generate structured data for SEO
  const worldCupEventSchema = getWorldCupEventSchema({
    name: 'FIFA World Cup 2026',
    description: 'The 23rd FIFA World Cup hosted by USA, Canada, and Mexico. 48 teams competing across 16 stadiums from June 11 to July 19, 2026.',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    location: 'USA, Canada, Mexico',
    url: 'https://www.fly2any.com/world-cup-2026',
  });

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData schema={worldCupEventSchema} />

      <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" data-page="world-cup-2026">

      {/* ULTRA-COMPACT Single Line Urgency Banner */}
      <CombinedUrgencyBanner />

      {/* WORLD-CLASS HERO SECTION - Electric Atmosphere */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

        {/* Dynamic Background Layers */}
        <div className="absolute inset-0 w-full h-full">
          {/* Beautiful Image Carousel - Auto-rotating stadium photos */}
          <HeroImageCarousel />

          {/* ZERO OVERLAYS - 100% CLEAN PHOTOS */}
        </div>

        {/* Main Content Container - Ultra Compact */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8">

          {/* Optimized Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

            {/* LEFT: Brand & Identity - 7 columns */}
            <div className="lg:col-span-7 space-y-4">

              {/* FULL FIFA 2026 COLOR EXPLOSION - ALL TYPOGRAPHY IN OFFICIAL COLORS */}
              <div className="space-y-6">
                <h1 className="font-black leading-[0.85] tracking-tight">
                  {/* FIFA - RED TO GOLD GRADIENT (Official FIFA Colors) */}
                  <span className="block text-7xl sm:text-8xl md:text-9xl lg:text-9xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #E61D25 0%, #FF6B35 50%, #FFD700 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'gradient-shift 6s ease-in-out infinite',
                      WebkitTextStroke: '3px rgba(255,255,255,0.9)',
                      filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8)) drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                      letterSpacing: '0.02em',
                    }}>
                    FIFA
                  </span>

                  {/* WORLD CUP - VIBRANT RAINBOW GRADIENT (All 4 FIFA Colors) */}
                  <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-8xl font-black"
                    style={{
                      background: 'linear-gradient(90deg, #FF2020 0%, #4040FF 33%, #20FF20 66%, #FFD700 100%)',
                      backgroundSize: '300% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'gradient-shift 8s ease-in-out infinite',
                      WebkitTextStroke: '5px rgba(255,255,255,1)',
                      filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8)) drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                      letterSpacing: '0.02em',
                    }}>
                    WORLD CUP
                  </span>
                </h1>

                {/* 2026 - BLUE TO GOLD GRADIENT (FIFA Official Blues + Gold) */}
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-4xl animate-bounce" style={{ animationDuration: '2s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>⚽</span>
                  <div className="flex items-baseline gap-3">
                    {['2','0','2','6'].map((digit, i) => (
                      <span key={i} className="text-7xl sm:text-8xl md:text-9xl lg:text-9xl font-black"
                        style={{
                          background: `linear-gradient(135deg, #2A398D ${i * 10}%, #4040FF ${30 + i * 10}%, #5566FF ${60 + i * 10}%, #FFD700 ${90 + i * 5}%)`,
                          backgroundSize: '200% 200%',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          animation: 'gradient-shift 7s ease-in-out infinite',
                          WebkitTextStroke: '2px rgba(255,255,255,0.8)',
                          filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8)) drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                          animationDelay: `${i * 0.2}s`,
                        }}>
                        {digit}
                      </span>
                    ))}
                  </div>
                  <span className="text-4xl animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>⚽</span>
                </div>

                {/* Tagline - GOLD GRADIENT (FIFA Championship Gold) */}
                <p className="text-3xl sm:text-4xl md:text-4xl font-black uppercase tracking-wide"
                  style={{
                    background: 'linear-gradient(90deg, #FFD700 0%, #FFF 50%, #FFD700 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 5s ease-in-out infinite',
                    WebkitTextStroke: '1px rgba(255,255,255,0.5)',
                    filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.9)) drop-shadow(0 2px 6px rgba(0,0,0,0.8)) drop-shadow(0 4px 10px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(255,215,0,0.3))',
                  }}>
                  The Greatest Show on Earth
                </p>
              </div>

              {/* Host Countries - TIGHT Shadows */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                {[
                  { flag: '🇺🇸', name: 'USA' },
                  { flag: '🇨🇦', name: 'CANADA' },
                  { flag: '🇲🇽', name: 'MÉXICO' },
                ].map((country, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-3xl" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>{country.flag}</span>
                    <span className="text-xl font-black tracking-wide text-white"
                      style={{
                        textShadow: '0 0 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.25)',
                      }}>
                      {country.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Event Info - TIGHT Shadows */}
              <div className="mt-8">
                <p className="text-xl sm:text-2xl font-black text-white"
                  style={{
                    textShadow: '0 0 2px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3), 0 0 4px rgba(255,215,0,0.15)',
                  }}>
                  June 11 - July 19, 2026 • 48 Teams • 104 Matches • 16 Cities
                </p>
              </div>
            </div>

            {/* RIGHT: Stats & Actions - 5 columns */}
            <div className="lg:col-span-5 space-y-5">

              {/* FIFA 2026 Stats Grid - TIGHT Shadows */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '⚽', number: '48', label: 'TEAMS', color: '#44DD44' },
                  { icon: '🏟️', number: '104', label: 'MATCHES', color: '#5566FF' },
                  { icon: '🌎', number: '16', label: 'CITIES', color: '#FF4444' },
                  { icon: '📅', number: '39', label: 'DAYS', color: '#FFD700' },
                ].map((stat, i) => (
                  <div key={i} className="relative group">
                    {/* Subtle External Glow - Tight Spread */}
                    <div className="absolute -inset-1 opacity-15 group-hover:opacity-25 blur-sm rounded-2xl transition-all"
                      style={{
                        background: stat.color,
                        boxShadow: `0 0 3px ${stat.color}`,
                      }}
                    />
                    {/* Clean Card - Light Background */}
                    <div className="relative border-2 border-white/25 rounded-2xl p-6 hover:border-white/35 hover:scale-105 transition-all duration-300 flex flex-col items-center text-center"
                      style={{
                        background: 'rgba(0,0,0,0.15)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 0 2px rgba(0,0,0,0.15)',
                      }}>
                      <div className="text-4xl mb-3">{stat.icon}</div>
                      <div className="text-5xl md:text-6xl font-black mb-2"
                        style={{
                          color: '#FFFFFF',
                          textShadow: '0 0 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.25)',
                          WebkitTextStroke: '2px rgba(255,255,255,0.15)',
                        }}>
                        {stat.number}
                      </div>
                      <div className="text-sm font-black uppercase tracking-wider"
                        style={{
                          color: '#FFFFFF',
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons - FIFA 2026 Colors, Clean & Energetic */}
              <div className="grid grid-cols-2 gap-4">
                {/* Schedule Button - FIFA RED */}
                <Link
                  href="/world-cup-2026/schedule"
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #E61D25, #C41519)',
                    boxShadow: '0 8px 25px rgba(230,29,37,0.4), 0 3px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative px-4 py-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">📅</span>
                    <span className="text-base font-black text-white tracking-wide">Schedule</span>
                    <span className="text-lg font-black text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>

                {/* Teams Button - FIFA BLUE */}
                <Link
                  href="/world-cup-2026/teams"
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #2A398D, #1E2A66)',
                    boxShadow: '0 8px 25px rgba(42,57,141,0.4), 0 3px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative px-4 py-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">⚽</span>
                    <span className="text-base font-black text-white tracking-wide">Teams</span>
                    <span className="text-lg font-black text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* COUNTDOWN SECTION - Premium Design */}
      <section className="relative w-full py-24 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <CountdownTimer />
        </div>
      </section>

      {/* GROUPS REVEALED SECTION - Draw Results Dec 5, 2025 */}
      <section className="relative w-full py-16 bg-gradient-to-br from-green-900 via-blue-900 to-slate-900">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-black text-sm mb-4 animate-pulse">
              ⚽ DRAW REVEALED - Dec 5, 2025
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
              12 GROUPS ARE SET!
            </h2>
            <p className="text-xl text-blue-200">
              Host Nations & Defending Champions - Your Path to Glory
            </p>
          </div>

          {/* Featured Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Group A - Mexico */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇲🇽</span>
                <h3 className="text-xl font-black text-white">GROUP A</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span>🇲🇽</span> Mexico <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded ml-auto">Host</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇿🇦</span> South Africa
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇰🇷</span> Korea Republic
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <span>🏳️</span> UEFA Playoff D
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-yellow-300 font-bold">
                Opening Match: Mexico vs South Africa
              </div>
            </div>

            {/* Group B - Canada */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-red-400/50 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇨🇦</span>
                <h3 className="text-xl font-black text-white">GROUP B</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇨🇭</span> Switzerland
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span>🇨🇦</span> Canada <span className="text-xs bg-red-500/30 px-2 py-0.5 rounded ml-auto">Host</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇶🇦</span> Qatar
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <span>🏳️</span> Italy/N.Ireland
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-yellow-300 font-bold">
                Could face Italy! 🇮🇹
              </div>
            </div>

            {/* Group D - USA */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all ring-2 ring-blue-400/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇺🇸</span>
                <h3 className="text-xl font-black text-white">GROUP D</h3>
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded ml-auto">Featured</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span>🇺🇸</span> USA <span className="text-xs bg-blue-500/30 px-2 py-0.5 rounded ml-auto">Host</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇵🇾</span> Paraguay
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇦🇺</span> Australia
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <span>🏳️</span> UEFA Playoff C
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-yellow-300 font-bold">
                USA vs Paraguay - June 12 @ SoFi Stadium
              </div>
            </div>

            {/* Group J - Argentina */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇦🇷</span>
                <h3 className="text-xl font-black text-white">GROUP J</h3>
                <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded ml-auto">🏆 Champs</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span>🇦🇷</span> Argentina <span className="text-xs bg-yellow-500/30 px-2 py-0.5 rounded ml-auto">Holders</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇦🇹</span> Austria
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇩🇿</span> Algeria
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>🇯🇴</span> Jordan
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-yellow-300 font-bold">
                Messi's Final World Cup! ⭐⭐⭐
              </div>
            </div>
          </div>

          {/* View All Groups CTA */}
          <div className="text-center mt-12">
            <Link
              href="/world-cup-2026/groups"
              className="inline-block px-10 py-5 bg-gradient-to-r from-green-500 via-blue-500 to-red-500 text-white font-black rounded-full text-xl hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              View All 12 Groups →
            </Link>
          </div>
        </div>
      </section>

      {/* TROPHY ANIMATION SECTION */}
      <section className="relative w-full py-32 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <TrophyAnimation />
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 drop-shadow-2xl mt-12">
            The Journey to Glory Begins
          </h2>
          <p className="text-2xl text-slate-800 mt-6 font-semibold px-4">
            48 dreams. One trophy. Infinite passion.
          </p>
        </div>
      </section>

      {/* TEAMS SECTION */}
      <section className="w-full py-24 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🌟 MEET THE CHAMPIONS 🌟
            </h2>
            <p className="text-2xl text-slate-700 font-semibold px-4">
              Click any team to celebrate their journey!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredTeams.map((team, index) => (
              <TeamCard3D key={team.slug} team={team} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/world-cup-2026/teams"
              className="inline-block px-12 py-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-black rounded-full text-2xl hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              🏆 View All 48 Teams →
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS & TESTIMONIALS */}
      <section className="w-full py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900">
              Trusted by Thousands of Fans
            </h2>
            <p className="text-xl text-gray-600">
              Join 12,847+ travelers who booked their World Cup experience with us
            </p>
          </div>
          <TrustSignals variant="full" />
        </div>
      </section>

      {/* Social Proof Banner */}
      <UrgencyBanner type="social-proof" />

      {/* STADIUMS SECTION */}
      <section className="w-full py-24 bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-amber-300 via-white to-amber-300 bg-clip-text text-transparent">
              🏟️ ICONIC STADIUMS 🏟️
            </h2>
            <p className="text-2xl text-blue-200 font-semibold px-4">
              Discover the breathtaking venues hosting the world's greatest tournament
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredStadiums.map((stadium, index) => (
              <StadiumCard3D key={stadium.slug} stadium={stadium} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/world-cup-2026/stadiums"
              className="inline-block px-12 py-6 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white font-black rounded-full text-2xl hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              🌍 Explore All 16 Stadiums →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <FAQSection
            faqs={WORLD_CUP_MAIN_FAQS}
            title="Everything You Need to Know"
            description="Get answers to the most common questions about FIFA World Cup 2026 travel and booking"
          />
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative w-full py-32 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={getWorldCupAtmosphereUrl(1920, 1080)}
            alt="Join the celebration"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-12 text-center text-white">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r from-amber-300 via-white to-amber-300 bg-clip-text text-transparent drop-shadow-2xl">
            🎉 BE PART OF HISTORY! 🎉
          </h2>
          <p className="text-2xl sm:text-3xl mb-12 font-semibold">
            The FIFA World Cup 2026 promises to be the greatest football celebration ever witnessed.
          </p>
          <Link
            href="/flights"
            className="inline-block px-16 py-8 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black font-black rounded-full text-3xl hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            ✈️ Book Your Journey Now →
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
