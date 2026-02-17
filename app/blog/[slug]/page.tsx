import { Metadata } from 'next';
import ClientPage from './ClientPage';
import { sampleBlogPosts } from '@/lib/data/blog-posts';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

// Required for static export (mobile builds)
export async function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = sampleBlogPosts.find(p => p.slug === slug);

  return {
    title: post?.title || 'Blog Post | Fly2Any',
    description: post?.excerpt || 'Read travel tips and guides on Fly2Any blog.',
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: post?.title,
      description: post?.excerpt,
      type: 'article',
      url: `${SITE_URL}/blog/${slug}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = sampleBlogPosts.find(p => p.slug === slug);

  if (!post) {
    return <ClientPage />;
  }

  // Generate structured data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage?.url ? [post.featuredImage.url] : [],
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt ? post.updatedAt.toISOString() : post.publishedAt.toISOString(),
    author: [{
      '@type': 'Person',
      name: post.author.name,
      url: post.author.social?.twitter ? `https://twitter.com/${post.author.social.twitter.replace('@', '')}` : undefined,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Fly2Any',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  };

  const formattedJsonLd: Record<string, any>[] = [articleSchema];

  // Add FAQ schema if available
  if (post.faq && post.faq.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
    formattedJsonLd.push(faqSchema);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(formattedJsonLd) }}
      />
      <ClientPage />
    </>
  );
}
