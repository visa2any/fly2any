import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeamBySlug, WorldCupTeamData } from '@/lib/data/world-cup-2026';
import { ArrowLeftIcon, TrophyIcon, GlobeAltIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { worldCupTeamMetadata, getSportsTeamSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const team = getTeamBySlug(params.slug);

  if (!team) {
    return {
      title: 'Team Not Found',
    };
  }

  return worldCupTeamMetadata(team.name, team.slug, team.bestFinish);
}

export default function TeamPage({ params }: PageProps) {
  const team = getTeamBySlug(params.slug);

  if (!team) {
    notFound();
  }

  // Generate structured data for SEO
  const teamSchema = getSportsTeamSchema({
    name: team.name,
    country: team.name,
    slug: team.slug,
    confederation: team.confederation,
    worldCupWins: team.worldCupWins,
    fifaRanking: team.fifaRanking,
    description: `${team.name} national football team competing at FIFA World Cup 2026. ${team.bestFinish}.`,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.fly2any.com' },
    { name: 'World Cup 2026', url: 'https://www.fly2any.com/world-cup-2026' },
    { name: 'Teams', url: 'https://www.fly2any.com/world-cup-2026/teams' },
    { name: team.name, url: `https://www.fly2any.com/world-cup-2026/teams/${team.slug}` },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData schema={[teamSchema, breadcrumbSchema]} />

      <div className="min-h-screen">
      {/* Hero Section with Team Colors */}
      <section
        className="relative overflow-hidden text-white py-20"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
        }}
      >
        {/* Animated pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link
            href="/world-cup-2026/teams"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>All Teams</span>
          </Link>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Team Info */}
            <div>
              <div className="text-9xl mb-6 animate-bounce">{team.flagEmoji}</div>

              <h1 className="text-5xl md:text-7xl font-black mb-4 drop-shadow-2xl">
                {team.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold">
                  {team.confederation}
                </span>
                {team.fifaRanking && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold">
                    FIFA Rank #{team.fifaRanking}
                  </span>
                )}
              </div>

              {/* World Cup Trophies */}
              {team.worldCupWins > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrophyIcon className="w-6 h-6 text-yellow-300" />
                    <span className="text-xl font-bold">World Cup Champions</span>
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: team.worldCupWins }).map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        🏆
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xl text-white/90">
                {team.bestFinish}
              </p>
            </div>

            {/* Stats Box */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Tournament Info</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GlobeAltIcon className="w-6 h-6 text-yellow-300 mt-1" />
                  <div>
                    <div className="text-sm text-white/70">Confederation</div>
                    <div className="text-lg font-semibold">{team.confederation}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-6 h-6 text-yellow-300 mt-1" />
                  <div>
                    <div className="text-sm text-white/70">Group</div>
                    <div className="text-lg font-semibold">
                      To Be Determined
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrophyIcon className="w-6 h-6 text-yellow-300 mt-1" />
                  <div>
                    <div className="text-sm text-white/70">Best Finish</div>
                    <div className="text-lg font-semibold">{team.bestFinish}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Schedule Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            {team.name}'s World Cup 2026 Matches
          </h2>

          {/* Placeholder for matches - will be populated when schedule is announced */}
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Match Schedule Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              {team.name}'s group stage opponents will be determined after the draw
            </p>

            {/* Example match cards (placeholder) */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((matchNum) => (
                <div
                  key={matchNum}
                  className="border-2 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  style={{ borderColor: team.primaryColor }}
                >
                  <div className="text-sm text-gray-500 mb-2">Group Stage Match {matchNum}</div>
                  <div className="text-2xl font-bold mb-4">{team.flagEmoji} vs ?</div>
                  <div className="text-sm text-gray-600 mb-4">
                    Date TBD • Stadium TBD
                  </div>
                  <button
                    disabled
                    className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Schedule Pending
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Book Your Trip Section - Integrated with Your Products */}
      <section
        className="py-20 text-white"
        style={{
          background: `linear-gradient(to bottom, ${team.primaryColor}, ${team.secondaryColor})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Follow {team.name} Through the Tournament
            </h2>
            <p className="text-xl text-white/90">
              Book your complete travel package
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Flights */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold mb-3">Flights</h3>
              <p className="text-white/80 mb-6">
                Find flights to all {team.name} match cities
              </p>
              <Link
                href="/flights"
                className="block w-full py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Search Flights →
              </Link>
            </div>

            {/* Hotels */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🏨</div>
              <h3 className="text-2xl font-bold mb-3">Hotels</h3>
              <p className="text-white/80 mb-6">
                Stay near stadiums hosting {team.name}
              </p>
              <Link
                href="/hotels"
                className="block w-full py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Book Hotels →
              </Link>
            </div>

            {/* Match Tickets */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🎟️</div>
              <h3 className="text-2xl font-bold mb-3">Match Tickets</h3>
              <p className="text-white/80 mb-6">
                Secure your seats for {team.name} matches
              </p>
              <Link
                href="/world-cup-2026/schedule"
                className="block w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-center"
              >
                Get Tickets →
              </Link>
            </div>
          </div>

          {/* Package Estimate */}
          <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">Estimated Package Cost</h3>
            <p className="text-white/80 mb-4">
              Follow {team.name} through all 3 group stage matches:
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-white/70">Flights</div>
                <div className="text-2xl font-bold">$800-1,500</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Hotels (6 nights)</div>
                <div className="text-2xl font-bold">$900-1,800</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Match Tickets (3)</div>
                <div className="text-2xl font-bold">$600-2,400</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-sm text-white/70">Total Estimate</div>
                <div className="text-3xl font-bold">$2,300-5,700</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team History & Fun Facts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: team.primaryColor }}>
                World Cup History
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: team.primaryColor }}>
                    🏆
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Championships</div>
                    <div className="text-gray-600">{team.worldCupWins} titles</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: team.secondaryColor }}>
                    📊
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Best Finish</div>
                    <div className="text-gray-600">{team.bestFinish}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: team.primaryColor }}>
                Team Colors
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg shadow-lg"
                    style={{ background: team.primaryColor }}
                  />
                  <div>
                    <div className="font-semibold">Primary Color</div>
                    <div className="text-gray-600 font-mono text-sm">{team.primaryColor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg shadow-lg"
                    style={{ background: team.secondaryColor }}
                  />
                  <div>
                    <div className="font-semibold">Secondary Color</div>
                    <div className="text-gray-600 font-mono text-sm">{team.secondaryColor}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
