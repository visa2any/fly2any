import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { WORLD_CUP_STADIUMS, getStadiumsByCountry } from '@/lib/data/world-cup-2026';
import { getWorldCupAtmosphereUrl } from '@/lib/utils/stadium-images';

const StadiumCard3D = dynamic(() => import('@/components/world-cup/StadiumCard3D'), { ssr: false });
const ClientCelebration = dynamic(() => import('@/components/world-cup/ClientCelebration'), { ssr: false });

export const metadata: Metadata = {
  title: 'All Stadiums - FIFA World Cup 2026 | Venues Guide',
  description: 'Explore all 16 stadiums hosting FIFA World Cup 2026 across USA, Canada and Mexico. View matches, travel info and book your trip.',
};

export default function StadiumsPage() {
  const usaStadiums = getStadiumsByCountry('USA');
  const mexicoStadiums = getStadiumsByCountry('Mexico');
  const canadaStadiums = getStadiumsByCountry('Canada');

  const countries = [
    {
      name: 'United States',
      code: 'USA',
      flag: '🇺🇸',
      stadiums: usaStadiums,
      gradient: 'from-blue-600 via-white to-red-600',
      bgGradient: 'from-blue-50 via-white to-red-50',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    {
      name: 'México',
      code: 'MEX',
      flag: '🇲🇽',
      stadiums: mexicoStadiums,
      gradient: 'from-green-600 via-white to-red-600',
      bgGradient: 'from-green-50 via-white to-red-50',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    {
      name: 'Canada',
      code: 'CAN',
      flag: '🇨🇦',
      stadiums: canadaStadiums,
      gradient: 'from-red-600 via-white to-red-600',
      bgGradient: 'from-red-50 via-white to-red-50',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Celebration effects - Client-side only */}
      <ClientCelebration
        showConfetti={true}
        showFireworks={true}
        confettiCount={50}
        fireworksCount={6}
        colors={['#FFD700', '#FF4F00', '#00C8FF', '#00E676']}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">

        {/* Background image */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src={getWorldCupAtmosphereUrl(1920, 1080)}
            alt="World Cup Stadiums"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                16 ICONIC STADIUMS
              </span>
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text mb-8">
              Across Three Nations • Where Legends Are Made
            </p>
          </div>

          {/* Host Nations Showcase */}
          <div className="flex flex-wrap justify-center gap-12 mb-12">
            {countries.map((country, i) => (
              <div
                key={country.code}
                className="text-center transform hover:scale-110 transition-all duration-300"
              >
                <div
                  className="text-9xl mb-4 animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))',
                  }}
                >
                  {country.flag}
                </div>
                <div className={`text-3xl font-black bg-gradient-to-r ${country.gradient} bg-clip-text text-transparent drop-shadow-lg`}>
                  {country.name}
                </div>
                <div className="text-xl text-white/80 font-semibold mt-2">
                  {country.stadiums.length} Stadium{country.stadiums.length > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '16', label: 'Stadiums', emoji: '🏟️', gradient: 'from-blue-400 to-blue-600', glow: 'rgba(59, 130, 246, 0.5)' },
              { number: '104', label: 'Matches', emoji: '⚽', gradient: 'from-green-400 to-green-600', glow: 'rgba(34, 197, 94, 0.5)' },
              { number: '3', label: 'Countries', emoji: '🌎', gradient: 'from-purple-400 to-purple-600', glow: 'rgba(168, 85, 247, 0.5)' },
              { number: '5M+', label: 'Expected Fans', emoji: '🎉', gradient: 'from-orange-400 to-red-500', glow: 'rgba(249, 115, 22, 0.5)' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-8 bg-gradient-to-br ${stat.gradient} rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-300`}
                style={{
                  boxShadow: `0 20px 60px ${stat.glow}`,
                }}
              >
                <div className="text-5xl mb-3 animate-bounce">{stat.emoji}</div>
                <div className="text-5xl font-black text-white drop-shadow-lg">{stat.number}</div>
                <div className="text-sm font-bold text-white/90 uppercase mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stadiums by Country */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {countries.map((country, countryIndex) => (
          country.stadiums.length > 0 && (
            <section key={country.code} className="mb-24">
              {/* Country Header */}
              <div className={`bg-gradient-to-br ${country.bgGradient} p-12 rounded-3xl mb-12 shadow-2xl`}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                  <div className="text-9xl">{country.flag}</div>
                  <div className="text-center md:text-left">
                    <h2 className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${country.gradient} bg-clip-text text-transparent drop-shadow-lg mb-3`}>
                      {country.name}
                    </h2>
                    <p className="text-2xl text-gray-700 font-semibold">
                      {country.stadiums.length} World-Class Venue{country.stadiums.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Fun fact */}
                <div className="text-center mt-8">
                  <div className={`inline-block px-8 py-4 bg-gradient-to-r ${country.gradient} text-white font-black rounded-full text-lg shadow-xl`}>
                    🌟 Host Nation Pride • {country.stadiums.reduce((sum, s) => sum + s.matchCount, 0)} Matches
                  </div>
                </div>
              </div>

              {/* Stadiums Grid with 3D Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {country.stadiums.map((stadium, index) => (
                  <StadiumCard3D key={stadium.slug} stadium={stadium} index={index} />
                ))}
              </div>
            </section>
          )
        ))}

        {/* Interactive Map Coming Soon - FUN VERSION */}
        <section className="mt-20 bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 rounded-3xl p-16 text-center shadow-2xl border-4 border-yellow-300">
          <div className="text-9xl mb-6 animate-bounce">🗺️</div>
          <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text mb-6">
            Interactive Stadium Map Coming Soon!
          </h2>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-semibold mb-8">
            Explore all 16 stadiums on an interactive 3D map. Plan your epic journey across North America!
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '🗺️', title: '3D Interactive Map', desc: 'Explore venues in 3D' },
              { icon: '✈️', title: 'Route Planner', desc: 'Multi-city trip builder' },
              { icon: '📸', title: 'Virtual Tours', desc: '360° stadium views' },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-2xl shadow-xl transform hover:scale-105 transition-all"
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 font-semibold">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black rounded-full text-xl shadow-lg">
            🚀 Feature In Development - Stay Tuned!
          </div>
        </section>
      </div>
    </div>
  );
}
