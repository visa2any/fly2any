// app/airports/[slug]/page.tsx
// Programmatic airport pages — ISR 7 days — Worldwide coverage
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { seoEngine, TOP_AIRPORTS } from '@/lib/seo/programmatic-seo'

export const revalidate = 604800

export async function generateStaticParams() {
  return TOP_AIRPORTS.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const airport = seoEngine.getAirportBySlug(params.slug)
  if (!airport) return { title: 'Airport Not Found' }
  const title = `Cheap Flights from ${airport.city} (${airport.code}) | Compare Airlines — Fly2Any`
  const description = `Search cheap flights departing from ${airport.name} (${airport.code}), ${airport.city}, ${airport.country}. Compare 900+ airlines, find deals to popular destinations worldwide. Book online 24/7.`
  return {
    title,
    description,
    keywords: `flights from ${airport.city}, ${airport.code} departures, ${airport.name} flights, cheap flights ${airport.city}`,
    openGraph: { title, description, url: `https://www.fly2any.com/airports/${params.slug}` },
    alternates: { canonical: `https://www.fly2any.com/airports/${params.slug}` },
  }
}

export default function AirportPage({ params }: { params: { slug: string } }) {
  const airport = seoEngine.getAirportBySlug(params.slug)
  if (!airport) notFound()

  const allRoutes = seoEngine.generateRoutes()
  const routesFrom = allRoutes.filter(r => r.origin === airport.code).slice(0, 12)
  const routesTo = allRoutes.filter(r => r.destination === airport.code).slice(0, 6)

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
        { '@type': 'ListItem', position: 2, name: 'Airports', item: 'https://www.fly2any.com/airports' },
        { '@type': 'ListItem', position: 3, name: `${airport.name} (${airport.code})`, item: `https://www.fly2any.com/airports/${params.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Airport',
      name: airport.name,
      iataCode: airport.code,
      description: `${airport.name} is the main international airport serving ${airport.city}, ${airport.country}.`,
      address: { '@type': 'PostalAddress', addressLocality: airport.city, addressCountry: airport.country },
      geo: { '@type': 'GeoCoordinates', latitude: airport.latitude, longitude: airport.longitude },
      url: `https://www.fly2any.com/airports/${params.slug}`,
      ...(airport.terminals && { numberOfRooms: airport.terminals }),
    },
  ]

  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <span>/</span>
              <li><Link href="/airports" className="hover:text-red-600">Airports</Link></li>
              <span>/</span>
              <li className="font-medium text-gray-800">{airport.city} ({airport.code})</li>
            </ol>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-blue-400 text-sm uppercase tracking-wider mb-2">{airport.continent} · {airport.country}</p>
            <div className="flex items-end gap-4 mb-3">
              <h1 className="text-4xl font-black">{airport.city}</h1>
              <span className="text-2xl font-bold text-blue-400 bg-blue-900/40 px-3 py-1 rounded-lg">{airport.code}</span>
            </div>
            <p className="text-gray-400 text-lg mb-6">{airport.name}</p>
            <div className="flex flex-wrap gap-4 mb-8">
              {airport.terminals && <div className="bg-white/10 rounded-xl px-4 py-2 text-sm"><span className="font-bold">{airport.terminals}</span> Terminals</div>}
              {airport.annualPassengers && <div className="bg-white/10 rounded-xl px-4 py-2 text-sm"><span className="font-bold">{(airport.annualPassengers / 1000000).toFixed(0)}M</span> Passengers/yr</div>}
              <div className="bg-white/10 rounded-xl px-4 py-2 text-sm"><span className="font-bold">{routesFrom.length}+</span> Routes</div>
            </div>
            <Link href={`/flights?from=${airport.code}`} className="inline-block bg-[#E74035] hover:bg-[#D63930] text-white font-bold px-8 py-4 rounded-xl transition-colors">
              Search Flights from {airport.code} →
            </Link>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {routesFrom.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Flights from {airport.city}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {routesFrom.map(r => (
                  <Link key={r.slug} href={`/flights/${r.slug}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{r.origin} → {r.destination}</span>
                      <span className="text-xs text-gray-400">{r.flightDuration}</span>
                    </div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-700">{r.originCity} → {r.destinationCity}</p>
                    <p className="text-sm text-gray-500 mt-1">{r.destinationCountry}</p>
                    <p className="text-green-600 font-bold mt-3">from ${r.lowestPrice}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {routesTo.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Flights to {airport.city}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {routesTo.map(r => (
                  <Link key={r.slug} href={`/flights/${r.slug}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <p className="font-bold text-gray-800 group-hover:text-blue-700">{r.originCity} → {r.destinationCity}</p>
                    <p className="text-green-600 font-bold mt-2">from ${r.lowestPrice}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
