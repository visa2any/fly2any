import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { WORLD_CUP_TEAMS, WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';
import { getWorldCupAtmosphereUrl, getStadiumHeroUrl } from '@/lib/utils/stadium-images';
import { worldCupMainMetadata, getWorldCupEventSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { UrgencyBanner } from '@/components/world-cup/UrgencyBanner';
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

      {/* Urgency Banner - Top */}
      <UrgencyBanner type="countdown" />
      <UrgencyBanner type="price-increase" className="mt-0" />

      {/* WORLD-CLASS HERO SECTION - Electric Atmosphere */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

        {/* Dynamic Background Layers */}
        <div className="absolute inset-0 w-full h-full">
          {/* Beautiful Image Carousel - Auto-rotating stadium photos */}
          <HeroImageCarousel />

          {/* Vibrant Animated Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/20 animate-gradient-shift" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-900/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />

          {/* Animated Soccer Ball Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='25' fill='none' stroke='white' stroke-width='2'/%3E%3Cpath d='M30,5 L30,15 M30,45 L30,55 M5,30 L15,30 M45,30 L55,30' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            animation: 'slide 20s linear infinite',
          }} />

          {/* Confetti Dots for Celebration */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-40 animate-float"
                style={{
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: ['#FFD700', '#00C8FF', '#FF4F00', '#00E676', '#FF1744'][i % 5],
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                }}
              />
            ))}
          </div>

          {/* Energy Beams */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-beam" />
            <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-beam" style={{ animationDelay: '2s' }} />
            <div className="absolute top-0 left-2/3 w-1 h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-beam" style={{ animationDelay: '4s' }} />
          </div>
        </div>

        {/* Main Content Container - Ultra Compact */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8">

          {/* Optimized Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

            {/* LEFT: Brand & Identity - 7 columns */}
            <div className="lg:col-span-7 space-y-4">

              {/* Electric Title Treatment */}
              <div className="space-y-3">
                <h1 className="font-black leading-[0.85] tracking-tight">
                  {/* FIFA - Glowing Gold with Pulse */}
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse"
                    style={{
                      WebkitTextStroke: '2px rgba(255,215,0,0.3)',
                      textShadow: '0 0 80px rgba(251,191,36,0.8), 0 0 40px rgba(255,215,0,0.6), 0 0 20px rgba(251,191,36,1)',
                      filter: 'drop-shadow(0 0 30px #FFD700)',
                    }}>
                    ⚽ FIFA ⚽
                  </span>
                  {/* WORLD CUP - Vibrant with Energy */}
                  <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
                    style={{
                      background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6, #60A5FA)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'gradient-shift 3s linear infinite',
                      textShadow: '0 0 40px rgba(147,51,234,0.5)',
                      filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.4))',
                    }}>
                    WORLD CUP
                  </span>
                </h1>

                {/* Year - Compact */}
                <div className="flex items-baseline gap-2 sm:gap-3">
                  {['2','0','2','6'].map((digit, i) => (
                    <div key={i} className="relative">
                      <span className={`block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-br ${
                        i === 0 ? 'from-blue-400 to-cyan-300' :
                        i === 1 ? 'from-amber-400 to-yellow-300' :
                        i === 2 ? 'from-rose-400 to-pink-300' :
                        'from-emerald-400 to-green-300'
                      } bg-clip-text text-transparent drop-shadow-2xl`}>
                        {digit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Countries - Compact Horizontal */}
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { flag: '🇺🇸', name: 'USA', from: 'from-blue-400', to: 'to-red-400' },
                  { flag: '🇨🇦', name: 'CANADA', from: 'from-red-400', to: 'to-white' },
                  { flag: '🇲🇽', name: 'MÉXICO', from: 'from-green-400', to: 'to-red-400' },
                ].map((country, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 transition-all duration-300">
                    <span className="text-3xl">{country.flag}</span>
                    <span className={`text-sm font-bold bg-gradient-to-r ${country.from} ${country.to} bg-clip-text text-transparent`}>
                      {country.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Electric Tagline */}
              <div className="space-y-2">
                <p className="text-3xl sm:text-4xl md:text-5xl font-black animate-pulse"
                  style={{
                    background: 'linear-gradient(90deg, #FF1744, #FF6B6B, #FFD700, #00E676, #00C8FF, #FF1744)',
                    backgroundSize: '300% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 5s linear infinite',
                    textShadow: '0 0 60px rgba(255,23,68,0.6)',
                    filter: 'drop-shadow(0 0 25px rgba(255,107,107,0.5))',
                  }}>
                  🎉 WE ARE 26 🎉
                </p>
                <p className="text-lg sm:text-xl font-black"
                  style={{
                    background: 'linear-gradient(90deg, #FFD700, #FFF, #FFD700)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 2s linear infinite',
                    textShadow: '0 0 30px rgba(255,215,0,0.8)',
                  }}>
                  ⚡ THE GREATEST SHOW ON EARTH ⚡
                </p>
              </div>
            </div>

            {/* RIGHT: Stats & Actions - 5 columns */}
            <div className="lg:col-span-5 space-y-5">

              {/* Premium Stats Grid - Enhanced Readability & Hierarchy */}
              <div className="grid grid-cols-2 gap-4 md:gap-5">
                {[
                  { icon: '⚽', number: '48', label: 'TEAMS', gradient: 'from-emerald-500 to-teal-400', shadow: 'rgba(16,185,129,0.5)' },
                  { icon: '🏟️', number: '104', label: 'MATCHES', gradient: 'from-blue-500 to-cyan-400', shadow: 'rgba(59,130,246,0.5)' },
                  { icon: '🌎', number: '16', label: 'CITIES', gradient: 'from-purple-500 to-fuchsia-400', shadow: 'rgba(168,85,247,0.5)' },
                  { icon: '📅', number: '39', label: 'DAYS', gradient: 'from-pink-500 to-rose-400', shadow: 'rgba(236,72,153,0.5)' },
                ].map((stat, i) => (
                  <div key={i} className="group relative transform hover:scale-105 transition-all duration-300">
                    {/* Animated Glow */}
                    <div
                      className={`absolute -inset-1 bg-gradient-to-br ${stat.gradient} opacity-30 group-hover:opacity-50 blur-xl transition-all duration-300 rounded-2xl animate-pulse`}
                      style={{
                        boxShadow: `0 0 40px ${stat.shadow}, 0 0 80px ${stat.shadow}`,
                      }}
                    />
                    {/* Card Content - Enhanced Spacing & Hierarchy */}
                    <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/30 rounded-2xl p-5 md:p-6 hover:bg-white/20 transition-all duration-300 flex flex-col items-center text-center min-h-[140px] md:min-h-[160px] justify-center"
                      style={{
                        boxShadow: `inset 0 0 20px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.3)`,
                      }}>
                      {/* Icon - Top Level */}
                      <div className="text-4xl md:text-5xl mb-3 animate-bounce" style={{ animationDuration: '2s' }}>{stat.icon}</div>
                      {/* Number - Primary Focus */}
                      <div className={`text-4xl md:text-5xl lg:text-6xl font-black mb-2 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent leading-none`}
                        style={{
                          filter: `drop-shadow(0 0 10px ${stat.shadow})`,
                        }}>
                        {stat.number}
                      </div>
                      {/* Label - Enhanced Readability */}
                      <div className="text-sm md:text-base font-black text-white uppercase tracking-wider leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ELECTRIC CTA Buttons - Enhanced Spacing */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Schedule Button */}
                <Link
                  href="/world-cup-2026/schedule"
                  className="group relative overflow-hidden rounded-xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 30px rgba(251,191,36,0.4), 0 10px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-gradient-shift" />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 animate-pulse" style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                  }} />
                  <div className="relative px-4 py-3 md:py-3.5 flex items-center justify-center gap-2">
                    <span className="text-xl md:text-2xl animate-bounce" style={{ animationDuration: '1.5s' }}>🎟️</span>
                    <span className="text-sm md:text-base font-black text-slate-900 whitespace-nowrap drop-shadow-lg">Schedule</span>
                    <span className="text-lg md:text-xl font-black group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>

                {/* Teams Button */}
                <Link
                  href="/world-cup-2026/teams"
                  className="group relative overflow-hidden rounded-xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 30px rgba(139,92,246,0.4), 0 10px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 animate-gradient-shift" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 animate-pulse" style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  }} />
                  <div className="relative px-4 py-3 md:py-3.5 flex items-center justify-center gap-2">
                    <span className="text-xl md:text-2xl animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}>⚽</span>
                    <span className="text-sm md:text-base font-black text-white whitespace-nowrap drop-shadow-lg">Teams</span>
                    <span className="text-lg md:text-xl font-black text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* COUNTDOWN SECTION - Premium Design */}
      <section className="relative w-full py-24 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <CountdownTimer />
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
            32 dreams. One trophy. Infinite passion.
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
