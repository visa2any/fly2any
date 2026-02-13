import BlogClient from './BlogClient';

export async function generateMetadata() {
  return {
    title: 'Travel Blog & Guides | Fly2Any',
    description: 'Explore expert travel guides, destination tips, latest airline news, and exclusive flash deals. Plan your next adventure with Fly2Any.',
    alternates: {
      canonical: '/blog',
    },
    openGraph: {
      title: 'Travel Blog & Guides | Fly2Any',
      description: 'Explore expert travel guides, destination tips, latest airline news, and exclusive flash deals. Plan your next adventure with Fly2Any.',
      url: '/blog',
    },
  };
}

export default function BlogPage() {
  return <BlogClient />;
}
