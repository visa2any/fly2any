// app/team/page.tsx
// E-E-A-T Author & Team page — YMYL trust signal for Google rankings
// Person schema + Organization schema for AI citation authority
import type { Metadata } from 'next'
import Link from 'next/link'
import { TEAM } from '@/lib/data/team-members'

export const metadata: Metadata = {
  title: 'Our Travel Experts | Fly2Any Team',
  description: 'Meet the travel experts behind Fly2Any. Our team combines decades of airline industry experience, technology expertise, and global travel knowledge to help you find the best flights.',
  alternates: { canonical: 'https://www.fly2any.com/team' },
  openGraph: {
    title: 'Our Travel Experts | Fly2Any Team',
    description: 'Meet the experienced travel professionals behind Fly2Any — your trusted source for flight search and booking.',
    url: 'https://www.fly2any.com/team',
  },
}

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
      { '@type': 'ListItem', position: 2, name: 'Our Team', item: 'https://www.fly2any.com/team' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fly2Any',
    url: 'https://www.fly2any.com',
    logo: 'https://www.fly2any.com/logo.png',
    description: 'US-based online travel agency specializing in worldwide flight search and booking.',
    foundingDate: '2024',
    areaServed: 'Worldwide',
    serviceType: 'Travel Agency',
    employee: TEAM.map(m => ({
      '@type': 'Person',
      '@id': `https://www.fly2any.com/team/${m.slug}#person`,
      name: m.name,
      jobTitle: m.role,
      url: `https://www.fly2any.com/team/${m.slug}`,
      knowsAbout: m.expertise,
    })),
  },
  ...TEAM.map(m => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `https://www.fly2any.com/team/${m.slug}#person`,
    name: m.name,
    jobTitle: m.role,
    url: `https://www.fly2any.com/team/${m.slug}`,
    worksFor: { '@type': 'Organization', name: 'Fly2Any', url: 'https://www.fly2any.com' },
    description: m.bio,
    knowsAbout: m.expertise,
  })),
]

export default function TeamPage() {
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
              <li className="font-medium text-gray-800">Our Team</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-blue-400 text-sm uppercase tracking-wider mb-3">The Experts Behind Fly2Any</p>
            <h1 className="text-4xl font-black mb-4">Meet Our Travel Specialists</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Fly2Any is built by a team of experienced travel professionals, airline industry veterans, and technology experts — all dedicated to helping you find the best flights at the lowest prices.
            </p>
          </div>
        </section>

        {/* Trust bar */}
        <section className="bg-white border-b border-gray-100 py-6 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '100+', label: 'Years Combined Experience' },
              { value: '67+', label: 'Countries Visited by Team' },
              { value: '400+', label: 'Expert Travel Articles' },
              { value: '24/7', label: 'Customer Support' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-black text-[#E74035]">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team grid */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map(member => (
              <Link
                key={member.slug}
                href={`/team/${member.slug}`}
                className="block"
              >
              <article
                id={member.slug}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                itemScope
                itemType="https://schema.org/Person"
              >
                {/* Avatar placeholder */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black mb-4">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>

                <h2 className="font-bold text-gray-900 text-lg leading-tight" itemProp="name">
                  {member.name}
                </h2>
                <p className="text-[#E74035] text-sm font-medium mb-3" itemProp="jobTitle">
                  {member.role}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">{member.yearsExp}</span> yrs exp
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">{member.articles}</span> articles
                  </span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4" itemProp="description">
                  {member.bio}
                </p>

                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.expertise.map(e => (
                      <span key={e} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg border border-blue-100">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Credentials</p>
                  <ul className="space-y-1">
                    {member.credentials.map(c => (
                      <li key={c} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
              </Link>
            ))}
          </div>
        </div>

        {/* Editorial standards */}
        <section className="bg-white border-t border-gray-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Editorial Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Accuracy First',
                  text: 'All pricing data is sourced directly from airline GDS systems. Fare information is refreshed in real-time. No fabricated deals or misleading discounts.',
                },
                {
                  title: 'Expert Review',
                  text: 'Every destination guide and route analysis is reviewed by a team member with direct, first-hand experience in that region or airline network.',
                },
                {
                  title: 'Conflict-Free',
                  text: 'Fly2Any does not accept payment to alter search rankings. Results are sorted by price and value, never by commission rate.',
                },
              ].map(({ title, text }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#E74035] to-[#D63930] py-12 px-4 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">Ready to Find Your Next Flight?</h2>
            <p className="text-red-100 mb-6">Our experts have pre-configured search for the best worldwide routes. Search now and let us do the hard work.</p>
            <Link href="/flights" className="inline-block bg-white text-[#E74035] font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors">
              Search Flights →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
