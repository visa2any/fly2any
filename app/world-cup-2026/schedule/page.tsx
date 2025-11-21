import { Metadata } from 'next';
import { MATCH_STAGES } from '@/lib/data/world-cup-2026';
import { worldCupScheduleMetadata, getWorldCupEventSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = worldCupScheduleMetadata();

export default function SchedulePage() {
  // Generate structured data for SEO
  const eventSchema = getWorldCupEventSchema({
    name: 'FIFA World Cup 2026',
    description: 'Complete match schedule for FIFA World Cup 2026. 104 matches from June 11 to July 19, 2026 across 16 stadiums in USA, Canada, and Mexico.',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    location: 'USA, Canada, Mexico',
    url: 'https://www.fly2any.com/world-cup-2026/schedule',
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.fly2any.com' },
    { name: 'World Cup 2026', url: 'https://www.fly2any.com/world-cup-2026' },
    { name: 'Schedule', url: 'https://www.fly2any.com/world-cup-2026/schedule' },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData schema={[eventSchema, breadcrumbSchema]} />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
                MATCH SCHEDULE
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              104 Matches • 39 Days • 16 Cities
            </p>

            {/* Tournament Dates */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4">
              <span className="text-3xl">📅</span>
              <div className="text-left">
                <div className="text-sm text-white/70">Tournament Duration</div>
                <div className="text-xl font-bold">June 11 - July 19, 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Stages Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Tournament Format
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(MATCH_STAGES).map(([key, stage]) => (
              <div
                key={key}
                className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ backgroundColor: stage.color + '20', borderTop: `4px solid ${stage.color}` }}
              >
                <div className="text-5xl mb-3">{stage.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{stage.name}</h3>
                <div className="text-2xl font-black" style={{ color: stage.color }}>
                  {stage.totalMatches}
                </div>
                <div className="text-sm text-gray-600">Matches</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Coming Soon */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl">
            <div className="text-8xl md:text-9xl mb-8 animate-bounce">📅</div>

            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Full Match Schedule Coming Soon
            </h2>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              The complete fixture list will be available after the group stage draw in late 2025
            </p>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">What We Know So Far</h3>
              <ul className="text-left space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-2xl">✓</span>
                  <span>Opening Match: June 11, 2026 at Estadio Azteca</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-2xl">✓</span>
                  <span>Final: July 19, 2026 at MetLife Stadium</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-2xl">✓</span>
                  <span>16 Groups with 3 teams each</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-2xl">✓</span>
                  <span>Top 2 from each group advance to knockout stage</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 space-y-4">
              <p className="text-white/80">Want to be notified when the schedule drops?</p>
              <button className="px-8 py-4 bg-white text-purple-900 font-bold rounded-full text-lg hover:scale-105 transition-transform shadow-lg">
                🔔 Get Schedule Updates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Example Match Card (Template for when schedule is live) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Example Match Preview
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
              {/* Match Header */}
              <div className="bg-black/20 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <span className="text-white font-semibold">Group A • Match 1</span>
                </div>
                <div className="text-white/80 text-sm">
                  June 11, 2026 • 8:00 PM ET
                </div>
              </div>

              {/* Teams */}
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-3 gap-8 items-center text-center">
                  {/* Home Team */}
                  <div className="text-white">
                    <div className="text-8xl mb-4">🇲🇽</div>
                    <h3 className="text-3xl font-bold">Mexico</h3>
                  </div>

                  {/* VS */}
                  <div>
                    <div className="text-6xl font-black text-white/40">VS</div>
                  </div>

                  {/* Away Team */}
                  <div className="text-white">
                    <div className="text-8xl mb-4">❓</div>
                    <h3 className="text-3xl font-bold">TBD</h3>
                  </div>
                </div>

                {/* Stadium Info */}
                <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-2xl">🏟️</span>
                    <span className="text-xl font-bold">Estadio Azteca</span>
                  </div>
                  <div className="text-white/80">Mexico City, Mexico</div>
                </div>

                {/* Booking CTAs */}
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <button
                    disabled
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-lg cursor-not-allowed"
                  >
                    🎟️ Tickets
                  </button>
                  <button
                    disabled
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-lg cursor-not-allowed"
                  >
                    ✈️ Flights
                  </button>
                  <button
                    disabled
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-lg cursor-not-allowed"
                  >
                    🏨 Hotels
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-500 mt-8 italic">
              * This is a preview. Full match details coming after group draw in late 2025
            </p>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Don't Miss a Match
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get instant notifications when the match schedule is announced and when tickets go on sale
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-400"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg">
              Notify Me
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Match schedule alerts
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Ticket sale notifications
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Exclusive deals
            </span>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
