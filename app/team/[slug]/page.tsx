// app/team/[slug]/page.tsx
// Individual author/team member page — E-E-A-T Person entity for SEO
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TEAM, getTeamMemberBySlug } from '@/lib/data/team-members';
import { sampleBlogPosts } from '@/lib/data/blog-posts';

const SITE_URL = 'https://www.fly2any.com';

export async function generateStaticParams() {
  return TEAM.map(m => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  if (!member) return { title: 'Team Member Not Found | Fly2Any' };

  return {
    title: `${member.name} — ${member.role} | Fly2Any`,
    description: member.bio,
    alternates: { canonical: `${SITE_URL}/team/${slug}` },
    openGraph: {
      title: `${member.name} — ${member.role}`,
      description: member.bio,
      url: `${SITE_URL}/team/${slug}`,
      type: 'profile',
    },
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  if (!member) notFound();

  // Find blog posts by this author (fuzzy match on first name + last name)
  const nameParts = member.name.toLowerCase().split(' ');
  const authorArticles = sampleBlogPosts.filter(post => {
    const authorName = post.author.name.toLowerCase();
    return nameParts.every(part => authorName.includes(part));
  });

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/team/${slug}#person`,
    name: member.name,
    jobTitle: member.role,
    url: `${SITE_URL}/team/${slug}`,
    description: member.bio,
    worksFor: {
      '@type': 'Organization',
      name: 'Fly2Any',
      url: SITE_URL,
    },
    knowsAbout: member.expertise,
    sameAs: [`${SITE_URL}/team#${slug}`],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Our Team', item: `${SITE_URL}/team` },
      { '@type': 'ListItem', position: 3, name: member.name, item: `${SITE_URL}/team/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-[#E74035]">Home</Link></li>
              <span className="text-gray-300">/</span>
              <li><Link href="/team" className="hover:text-[#E74035]">Our Team</Link></li>
              <span className="text-gray-300">/</span>
              <li className="font-medium text-gray-800">{member.name}</li>
            </ol>
          </div>
        </nav>

        {/* Profile Header */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-center md:text-left">{member.name}</h1>
              <p className="text-blue-400 font-medium mb-4 text-center md:text-left">{member.role}</p>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{member.bio}</p>
              <div className="flex items-center gap-6 mt-5 justify-center md:justify-start">
                <span className="text-sm text-gray-400">
                  <span className="text-white font-bold text-lg">{member.yearsExp}</span> years experience
                </span>
                <span className="text-sm text-gray-400">
                  <span className="text-white font-bold text-lg">{member.articles}</span> articles published
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: Expertise & Credentials */}
          <div className="md:col-span-1 space-y-8">
            {/* Expertise */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {member.expertise.map(e => (
                  <span key={e} className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-lg border border-blue-100">
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Credentials</h2>
              <ul className="space-y-2.5">
                {member.credentials.map(c => (
                  <li key={c} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: Articles */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                Articles by {member.name.split(' ')[0]}
              </h2>

              {authorArticles.length > 0 ? (
                <div className="space-y-4">
                  {authorArticles.map(article => (
                    <Link
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      className="block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#E74035] transition-colors text-sm leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{article.readTime} min read</span>
                        <span>{article.publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {member.name.split(' ')[0]} has contributed to {member.articles} expert articles and reviews across Fly2Any.
                  Detailed article listings are being added.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back to team */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#E74035] hover:underline"
          >
            &larr; Back to Our Team
          </Link>
        </div>
      </main>
    </>
  );
}
