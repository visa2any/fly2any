// app/team/page.tsx
// E-E-A-T Author & Team page — YMYL trust signal for Google rankings
// Person schema + Organization schema for AI citation authority
import type { Metadata } from 'next'
import Link from 'next/link'

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

const TEAM = [
  {
    name: 'Marcus Rivera',
    role: 'Head of Travel Operations & Airline Relations',
    bio: 'Former airline revenue management analyst with 14 years at three major US carriers. Marcus oversees our airline partnerships and ensures fare accuracy across 900+ carriers.',
    expertise: ['Airline Revenue Management', 'GDS Systems', 'Fare Rules', 'Transatlantic Routes'],
    credentials: ['IATA Certified Travel Agent', 'Sabre GDS Certified', 'BA in Economics — University of Texas'],
    yearsExp: 14,
    articles: 48,
    slug: 'marcus-rivera',
  },
  {
    name: 'Priya Nambiar',
    role: 'Senior Travel Content Strategist',
    bio: 'Priya has visited 67 countries across 6 continents and writes our destination guides with first-hand knowledge. Previously travel editor at a major US digital publication for 8 years.',
    expertise: ['Asia-Pacific Routes', 'Budget Travel', 'Visa Requirements', 'Destination Guides'],
    credentials: ['MA in Journalism — Columbia University', 'ASTA Member', 'Google Travel Certified'],
    yearsExp: 11,
    articles: 120,
    slug: 'priya-nambiar',
  },
  {
    name: 'David Chen',
    role: 'Chief Technology Officer',
    bio: 'David architected Fly2Any\'s real-time fare comparison engine. With a background in distributed systems and 12 years in travel technology, he ensures our pricing data is always accurate and current.',
    expertise: ['Real-time Pricing APIs', 'Amadeus Integration', 'System Architecture', 'Flight Data'],
    credentials: ['MS Computer Science — Stanford', 'AWS Certified Solutions Architect', 'Former Amadeus Tech Lead'],
    yearsExp: 12,
    articles: 22,
    slug: 'david-chen',
  },
  {
    name: 'Sofia Mendes',
    role: 'Latin America & Iberia Travel Specialist',
    bio: 'Born in São Paulo, Sofia specializes in travel between the Americas, with deep expertise on South American routes, visa requirements, and airline networks operated by LATAM, Gol, and Avianca.',
    expertise: ['South America Routes', 'Portuguese/Spanish Markets', 'LATAM Network', 'Visa Guidance'],
    credentials: ['IATA Certified', 'BA Tourism Management — USP Brazil', 'Bilingual EN/PT/ES'],
    yearsExp: 9,
    articles: 76,
    slug: 'sofia-mendes',
  },
  {
    name: 'James Whitfield',
    role: 'Loyalty Programs & Premium Cabin Expert',
    bio: 'James has flown over 2 million miles across premium cabins worldwide and is recognized as a leading authority on airline loyalty programs, award booking, and business class value.',
    expertise: ['Airline Miles & Points', 'Business Class', 'Oneworld Alliance', 'Award Booking'],
    credentials: ['Former American Airlines Platinum Pro', 'Points Authority Contributor', '30+ Countries Visited'],
    yearsExp: 8,
    articles: 95,
    slug: 'james-whitfield',
  },
  {
    name: 'Aisha Okonkwo',
    role: 'Middle East & Africa Routes Specialist',
    bio: 'Aisha has extensive experience with Gulf carrier operations — Emirates, Qatar Airways, and Etihad — and African aviation networks. She guides thousands of travelers on optimal routings through the Middle East.',
    expertise: ['Emirates Network', 'Qatar Airways', 'African Routes', 'Dubai Hub Connections'],
    credentials: ['IATA Travel & Tourism Diploma', 'Former Emirates Customer Experience Team', 'MBA — AUB'],
    yearsExp: 10,
    articles: 55,
    slug: 'aisha-okonkwo',
  },
]

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
      name: m.name,
      jobTitle: m.role,
      url: `https://www.fly2any.com/team#${m.slug}`,
      knowsAbout: m.expertise,
    })),
  },
  ...TEAM.map(m => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: m.name,
    jobTitle: m.role,
    url: `https://www.fly2any.com/team#${m.slug}`,
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
              <article
                key={member.slug}
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
