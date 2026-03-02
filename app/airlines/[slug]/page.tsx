// app/airlines/[slug]/page.tsx
// Programmatic airline pages — ISR 7 days
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { seoEngine, TOP_AIRLINES } from '@/lib/seo/programmatic-seo'

export const revalidate = 604800

export async function generateStaticParams() {
  return TOP_AIRLINES.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const airline = seoEngine.getAirlineBySlug(params.slug)
  if (!airline) return { title: 'Airline Not Found' }
  const title = `${airline.name} Flights | Compare Prices & Book Online — Fly2Any`
  const description = `Book ${airline.name} (${airline.code}) flights online. Compare fares, check routes, and find the best deals. Rated ${airline.rating}/5 by travelers. Book 24/7 with no fees on Fly2Any.`
  return {
    title,
    description,
    keywords: `${airline.name} flights, ${airline.code} tickets, book ${airline.name}, ${airline.name} deals`,
    openGraph: { title, description, url: `https://www.fly2any.com/airlines/${params.slug}` },
    alternates: { canonical: `https://www.fly2any.com/airlines/${params.slug}` },
  }
}

export default function AirlinePage({ params }: { params: { slug: string } }) {
  const airline = seoEngine.getAirlineBySlug(params.slug)
  if (!airline) notFound()

  const allRoutes = seoEngine.generateRoutes()
  const airlineRoutes = allRoutes
    .filter(r => r.airlines.includes(airline.name))
    .slice(0, 12)

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
        { '@type': 'ListItem', position: 2, name: 'Airlines', item: 'https://www.fly2any.com/airlines' },
        { '@type': 'ListItem', position: 3, name: airline.name, item: `https://www.fly2any.com/airlines/${params.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Airline',
      name: airline.name,
      iataCode: airline.code,
      url: `https://www.fly2any.com/airlines/${params.slug}`,
      ...(airline.alliance && { memberOf: { '@type': 'Organization', name: airline.alliance } }),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: airline.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: 5000,
      },
    },
  ]

  const stars = Math.round(airline.rating)

  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <span>/</span>
              <li><Link href="/airlines" className="hover:text-red-600">Airlines</Link></li>
              <span>/</span>
              <li className="font-medium text-gray-800">{airline.name}</li>
            </ol>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/10 text-white font-bold text-lg px-3 py-1 rounded-lg">{airline.code}</span>
              {airline.alliance && <span className="text-blue-400 text-sm">{airline.alliance}</span>}
            </div>
            <h1 className="text-4xl font-black mb-2">{airline.name}</h1>
            <p className="text-gray-400 mb-4">{airline.country}{airline.founded ? ` · Founded ${airline.founded}` : ''}{airline.fleet ? ` · ${airline.fleet} aircraft` : ''}</p>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-yellow-400 text-lg">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
              <span className="text-white font-bold">{airline.rating}/5</span>
              <span className="text-gray-400 text-sm">(5,000+ reviews)</span>
            </div>
            <Link href={`/flights?airline=${airline.code}`} className="inline-block bg-[#E74035] hover:bg-[#D63930] text-white font-bold px-8 py-4 rounded-xl transition-colors">
              Search {airline.name} Flights →
            </Link>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hub Airports</h2>
            <div className="flex flex-wrap gap-3">
              {airline.hubAirports.map(code => (
                <Link key={code} href={`/airports/${code.toLowerCase()}`} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors border border-blue-100">
                  {code}
                </Link>
              ))}
            </div>
          </div>

          {airlineRoutes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{airline.name} Routes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {airlineRoutes.map(r => (
                  <Link key={r.slug} href={`/flights/${r.slug}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <p className="font-bold text-gray-800 group-hover:text-blue-700">{r.originCity} → {r.destinationCity}</p>
                    <p className="text-sm text-gray-500 mt-1">{r.flightDuration} · {r.distanceKm.toLocaleString()} km</p>
                    <p className="text-green-600 font-bold mt-3">from ${r.lowestPrice}</p>
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
