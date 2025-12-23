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

export default function Page() {
  return <ClientPage />;
}
