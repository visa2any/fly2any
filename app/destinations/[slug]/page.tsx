// app/destinations/[slug]/page.tsx
// Programmatic destination pages — ISR 7 days — Worldwide coverage
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { seoEngine, TOP_DESTINATIONS, TOP_AIRPORTS } from '@/lib/seo/programmatic-seo'

export const revalidate = 604800 // 7 days

export async function generateStaticParams() {
  return TOP_DESTINATIONS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dest = seoEngine.getDestinationBySlug(params.slug)
  if (!dest) return { title: 'Destination Not Found' }

  const title = `Cheap Flights to ${dest.city}, ${dest.country} from $${dest.avgFlightPrice} | Fly2Any`
  const description = `Book flights to ${dest.city}, ${dest.country}. Compare prices from ${dest.popularOrigins.slice(0, 3).join(', ')} and more. Best time: ${dest.bestTimeToVisit}. Book online 24/7 — no booking fees.`
  const ogUrl = `/api/og?title=${encodeURIComponent(`Flights to ${dest.city}`)}&subtitle=${encodeURIComponent(`${dest.country} · From $${dest.avgFlightPrice}`)}`

  return {
    title,
    description,
    keywords: `flights to ${dest.city}, cheap flights ${dest.city}, ${dest.city} ${dest.country} airfare, travel to ${dest.city}, ${dest.city} vacation`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.fly2any.com/destinations/${params.slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    alternates: { canonical: `https://www.fly2any.com/destinations/${params.slug}` },
  }
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const dest = seoEngine.getDestinationBySlug(params.slug)
  if (!dest) notFound()

  const allRoutes = seoEngine.generateRoutes()
  const routesToDest = allRoutes.filter(r => r.destinationCity.toLowerCase() === dest.city.toLowerCase()).slice(0, 8)
  const destAirport = TOP_AIRPORTS.find(a => a.city.toLowerCase() === dest.city.toLowerCase())

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
        { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://www.fly2any.com/destinations' },
        { '@type': 'ListItem', position: 3, name: `${dest.city}, ${dest.country}`, item: `https://www.fly2any.com/destinations/${params.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: dest.city,
      description: dest.description,
      url: `https://www.fly2any.com/destinations/${params.slug}`,
      ...(destAirport && {
        containedInPlace: { '@type': 'Country', name: dest.country },
        geo: { '@type': 'GeoCoordinates', latitude: destAirport.latitude, longitude: destAirport.longitude },
      }),
      touristType: ['Adventure', 'Cultural', 'Family'],
      includesAttraction: dest.highlights.map(h => ({ '@type': 'TouristAttraction', name: h })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `How much do flights to ${dest.city} cost?`,
          acceptedAnswer: { '@type': 'Answer', text: `Flights to ${dest.city}, ${dest.country} start from around $${dest.avgFlightPrice}. Prices vary by season, origin city, and how far in advance you book. Fly2Any compares 900+ airlines to find the best fares.` },
        },
        {
          '@type': 'Question',
          name: `When is the best time to visit ${dest.city}?`,
          acceptedAnswer: { '@type': 'Answer', text: `The best time to visit ${dest.city} is ${dest.bestTimeToVisit}. During this period you can expect pleasant weather and a great overall experience.` },
        },
        {
          '@type': 'Question',
          name: `Do US citizens need a visa to visit ${dest.city}?`,
          acceptedAnswer: { '@type': 'Answer', text: dest.visaRequired || `Visa requirements for ${dest.city} depend on your nationality. Check with the ${dest.country} embassy or consulate for current requirements.` },
        },
      ],
    },
  ]

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <span className="text-gray-300">/</span>
              <li><Link href="/destinations" className="hover:text-red-600">Destinations</Link></li>
              <span className="text-gray-300">/</span>
              <li className="font-medium text-gray-800">{dest.city}, {dest.country}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-wider mb-2">{dest.continent}</p>
            <h1 className="text-5xl font-black mb-3">{dest.city}</h1>
            <p className="text-xl text-gray-300 mb-6">{dest.country} {dest.currency && `· ${dest.currency}`} {dest.language && `· ${dest.language}`}</p>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-8">{dest.description}</p>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-gray-400 text-sm">Flights from</p>
                <p className="text-4xl font-black">${dest.avgFlightPrice}</p>
              </div>
              <Link href={`/flights?to=${destAirport?.code || dest.city}`} className="bg-[#E74035] hover:bg-[#D63930] text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg">
                Search Flights to {dest.city} →
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Highlights */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Attractions in {dest.city}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dest.highlights.map(h => (
                  <div key={h} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-sm font-medium text-blue-800 border border-blue-100">
                    📍 {h}
                  </div>
                ))}
              </div>
            </section>

            {/* Flights from popular origins */}
            {routesToDest.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Flights to {dest.city}</h2>
                <div className="space-y-3">
                  {routesToDest.map(r => (
                    <Link key={r.slug} href={`/flights/${r.slug}`} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 group">
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-blue-700">{r.originCity} → {r.destinationCity}</p>
                        <p className="text-sm text-gray-500">{r.flightDuration} · {r.directFlights ? 'Direct available' : 'With connection'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">from ${r.lowestPrice}</p>
                        <p className="text-xs text-gray-400">avg ${r.avgPrice}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">FAQ: Flights to {dest.city}</h2>
              <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
                {[
                  { q: `How much do flights to ${dest.city} cost?`, a: `Flights to ${dest.city} start from $${dest.avgFlightPrice}. Average fares vary by season and origin. Use Fly2Any to compare 900+ airlines and find the best deal.` },
                  { q: `When is the best time to visit ${dest.city}?`, a: `Best time to visit: ${dest.bestTimeToVisit}. Plan your trip during this period for ideal weather and experiences.` },
                  { q: `Do US citizens need a visa for ${dest.country}?`, a: dest.visaRequired || `Check current visa requirements for ${dest.country} before traveling.` },
                ].map(({ q, a }) => (
                  <details key={q} className="border border-gray-100 rounded-xl overflow-hidden group" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-50 list-none" itemProp="name">{q} <span className="text-gray-400">▾</span></summary>
                    <div className="px-4 pb-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p className="text-gray-600 text-sm" itemProp="text">{a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#E74035] to-[#D63930] rounded-2xl p-6 text-white">
              <p className="font-bold text-lg mb-1">Fly to {dest.city}</p>
              <p className="text-red-200 text-sm mb-3">{dest.country} · {dest.continent}</p>
              <p className="text-4xl font-black mb-4">from ${dest.avgFlightPrice}</p>
              <Link href={`/flights?to=${destAirport?.code || dest.city}`} className="block text-center bg-white text-[#E74035] font-bold py-3 rounded-xl hover:bg-red-50 transition-colors">
                Find Cheapest Flights →
              </Link>
            </div>

            {dest.timezone && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Travel Info</p>
                <div className="space-y-2 text-sm">
                  {dest.currency && <div className="flex justify-between"><span className="text-gray-500">Currency</span><span className="font-medium">{dest.currency}</span></div>}
                  {dest.language && <div className="flex justify-between"><span className="text-gray-500">Language</span><span className="font-medium">{dest.language}</span></div>}
                  {dest.timezone && <div className="flex justify-between"><span className="text-gray-500">Timezone</span><span className="font-medium text-xs">{dest.timezone}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Best time</span><span className="font-medium text-xs text-right max-w-[60%]">{dest.bestTimeToVisit}</span></div>
                </div>
              </div>
            )}

            {dest.visaRequired && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-xs text-amber-700 uppercase tracking-wider font-bold mb-2">Visa — US Citizens</p>
                <p className="text-sm text-amber-800">{dest.visaRequired}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
