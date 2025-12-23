import { Metadata } from 'next';
import ClientPage from './ClientPage';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

const categoryTitles: Record<string, string> = {
  deals: 'Travel Deals',
  guides: 'Travel Guides',
  tips: 'Travel Tips',
  news: 'Travel News',
  blog: 'Travel Blog',
};

export async function generateStaticParams() {
  return [{ category: 'placeholder' }];
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const title = categoryTitles[category] || 'Blog';

  return {
    title: `${title} | Fly2Any Blog`,
    description: `Browse ${title.toLowerCase()} articles on Fly2Any. Expert travel advice and inspiration.`,
    alternates: {
      canonical: `${SITE_URL}/blog/category/${category}`,
    },
  };
}

export default function Page() {
  return <ClientPage />;
}
