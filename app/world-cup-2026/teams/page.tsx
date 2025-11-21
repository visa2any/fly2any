import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { WORLD_CUP_TEAMS, getTeamsByConfederation } from '@/lib/data/world-cup-2026';
import { getWorldCupAtmosphereUrl } from '@/lib/utils/stadium-images';

const TeamCard3D = dynamic(() => import('@/components/world-cup/TeamCard3D'), { ssr: false });
const ClientCelebration = dynamic(() => import('@/components/world-cup/ClientCelebration'), { ssr: false });
const CrowdSilhouette = dynamic(() => import('@/components/world-cup/FanWave').then(mod => mod.CrowdSilhouette), {  ssr: false });

export const metadata: Metadata = {
  title: 'All Teams - FIFA World Cup 2026 | Complete Team Guide',
  description: 'Explore all 48 teams competing in FIFA World Cup 2026. View fixtures, squad info, and book travel for your favorite nations.',
};

export default function TeamsPage() {
  // Group teams by confederation
  const conmebol = getTeamsByConfederation('CONMEBOL');
  const uefa = getTeamsByConfederation('UEFA');
  const concacaf = getTeamsByConfederation('CONCACAF');

  const confederations = [
    {
      name: 'UEFA',
      fullName: 'Union of European Football Associations',
      region: 'Europe',
      teams: uefa,
      gradient: 'from-blue-600 via-blue-500 to-blue-400',
      bgGradient: 'from-blue-50 to-blue-100',
      emoji: '🇪🇺',
    },
    {
      name: 'CONMEBOL',
      fullName: 'South American Football Confederation',
      region: 'South America',
      teams: conmebol,
      gradient: 'from-green-600 via-green-500 to-green-400',
      bgGradient: 'from-green-50 to-green-100',
      emoji: '🌎',
    },
    {
      name: 'CONCACAF',
      fullName: 'Confederation of North, Central America and Caribbean',
      region: 'North America',
      teams: concacaf,
      gradient: 'from-red-600 via-red-500 to-orange-500',
      bgGradient: 'from-red-50 to-orange-100',
      emoji: '🌎',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Celebration effects - Client-side only */}
      <ClientCelebration showConfetti={true} confettiCount={60} />

      {/* HERO Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white">
        {/* Background image */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src={getWorldCupAtmosphereUrl(1920, 1080)}
            alt="World Cup Teams"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Rainbow overlay for diversity */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                ALL TEAMS
              </span>
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-300 via-green-300 to-yellow-300 bg-clip-text mb-8">
              48 Nations • One Dream • Infinite Passion
            </p>
          </div>

          {/* Stats Grid with VIBRANT COLORS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '48', label: 'Teams', emoji: '⚽', gradient: 'from-blue-400 to-blue-600', glow: 'rgba(59, 130, 246, 0.5)' },
              { number: '6', label: 'Confederations', emoji: '🌍', gradient: 'from-green-400 to-green-600', glow: 'rgba(34, 197, 94, 0.5)' },
              { number: '16', label: 'Groups', emoji: '📊', gradient: 'from-purple-400 to-purple-600', glow: 'rgba(168, 85, 247, 0.5)' },
              { number: '80', label: 'Group Matches', emoji: '🏟️', gradient: 'from-orange-400 to-red-500', glow: 'rgba(249, 115, 22, 0.5)' },
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

        {/* Crowd at bottom */}
        <CrowdSilhouette />
      </section>

      {/* Teams by Confederation */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {confederations.map((conf, confIndex) => (
          conf.teams.length > 0 && (
            <section key={conf.name} className={`mb-24 rounded-4xl overflow-hidden`}>
              {/* Confederation Header */}
              <div className={`bg-gradient-to-br ${conf.bgGradient} p-12 rounded-3xl mb-12 shadow-xl`}>
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="text-8xl">{conf.emoji}</div>
                  <div>
                    <h2 className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${conf.gradient} bg-clip-text text-transparent drop-shadow-lg`}>
                      {conf.name}
                    </h2>
                    <p className="text-2xl text-gray-700 font-semibold mt-2">
                      {conf.fullName}
                    </p>
                  </div>
                </div>

                {/* Region badge */}
                <div className="text-center">
                  <div className={`inline-block px-8 py-4 bg-gradient-to-r ${conf.gradient} text-white font-black rounded-full text-xl shadow-lg`}>
                    🌟 {conf.region} - {conf.teams.length} Teams Qualified
                  </div>
                </div>
              </div>

              {/* Teams Grid with 3D Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {conf.teams.map((team, index) => (
                  <TeamCard3D key={team.slug} team={team} index={index} />
                ))}
              </div>
            </section>
          )
        ))}

        {/* Coming Soon Section - MORE EXCITING */}
        <section className="mt-20 bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 rounded-3xl p-16 text-center shadow-2xl border-4 border-yellow-300">
          <div className="text-9xl mb-6 animate-bounce">🌍</div>
          <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text mb-6">
            More Continental Champions Coming Soon!
          </h2>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-semibold mb-8">
            As World Cup qualification concludes across the globe, we'll celebrate teams from:
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'AFC (Asia)', emoji: '🌏', teams: '8 teams' },
              { name: 'CAF (Africa)', emoji: '🌍', teams: '9 teams' },
              { name: 'OFC (Oceania)', emoji: '🌏', teams: '1 team' },
            ].map((conf, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-2xl shadow-xl transform hover:scale-105 transition-all"
              >
                <div className="text-6xl mb-4">{conf.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{conf.name}</h3>
                <p className="text-gray-600 font-semibold">{conf.teams}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-full text-xl shadow-lg">
            ⏰ Qualification in Progress - Stay Tuned!
          </div>
        </section>
      </div>
    </div>
  );
}
