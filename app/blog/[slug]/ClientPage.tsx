'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getRelatedPosts } from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/types/blog';
import { ArticleHero } from '@/components/blog/article/ArticleHero';
import { ArticleContent } from '@/components/blog/article/ArticleContent';
import { StructuredData } from '@/components/seo/StructuredData';
import { article as nycParisArticle } from '@/lib/data/articles/nyc-paris-flights-2026';
import { ReadingProgress } from '@/components/blog/article/ReadingProgress';
import { ExtendedShareButtons } from '@/components/blog/article/ExtendedShareButtons';
import { CommentSection } from '@/components/blog/article/CommentSection';
import { AuthorBio } from '@/components/blog/article/AuthorBio';
import { NewsletterCTA } from '@/components/blog/article/NewsletterCTA';
import { ScrollToTop } from '@/components/blog/article/ScrollToTop';
import { Breadcrumbs } from '@/components/blog/article/Breadcrumbs';

/**
 * Individual Blog Post Page
 *
 * Dynamic route for displaying individual blog articles
 * Features:
 * - Full article content
 * - Author information
 * - Social sharing
 * - Related posts
 * - Comments section placeholder
 */
export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const foundPost = getPostBySlug(slug);
      if (foundPost) {
        setPost(foundPost);
        const related = getRelatedPosts(foundPost.id, 3);
        setRelatedPosts(related);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if it's the premium NYC-Paris article
  const isPremiumArticle = slug === 'cheap-flights-new-york-paris-2026';
  const premiumData = isPremiumArticle ? nycParisArticle : null;

  if (isPremiumArticle && premiumData) {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: premiumData.title,
        description: premiumData.excerpt,
        author: {
          '@type': 'Person',
          name: premiumData.author.name,
          jobTitle: premiumData.author.role,
        },
        datePublished: premiumData.publishedAt.toISOString(),
        dateModified: premiumData.publishedAt.toISOString(),
        publisher: {
          '@type': 'Organization',
          name: 'Fly2Any',
          logo: { '@type': 'ImageObject', url: 'https://www.fly2any.com/logo.png' },
        },
        image: premiumData.featuredImage.url,
        articleSection: premiumData.category,
        keywords: premiumData.tags.join(', '),
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.fly2any.com/blog/${slug}` },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.fly2any.com/blog' },
          { '@type': 'ListItem', position: 3, name: premiumData.category, item: `https://www.fly2any.com/blog/category/${premiumData.category}` },
          { '@type': 'ListItem', position: 4, name: premiumData.title, item: `https://www.fly2any.com/blog/${slug}` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How long is the flight from New York to Paris?', acceptedAnswer: { '@type': 'Answer', text: 'Direct flights from JFK or Newark to Paris CDG take approximately 7-8 hours eastbound.' } },
          { '@type': 'Question', name: 'What is the cheapest month to fly to Paris?', acceptedAnswer: { '@type': 'Answer', text: 'February and September offer the lowest fares, with prices starting from $445 roundtrip.' } },
        ],
      },
    ];

    return (
      <>
        <StructuredData schema={schemas} />
        <ReadingProgress />
        <ScrollToTop />
        <Breadcrumbs items={[
          { label: 'Blog', href: '/blog' },
          { label: premiumData.category, href: `/blog/category/${premiumData.category.toLowerCase()}` },
          { label: premiumData.title, href: `/blog/${slug}` }
        ]} />
        <div className="min-h-screen bg-white">
          <ArticleHero
            title={premiumData.title}
            excerpt={premiumData.excerpt}
            category={premiumData.category}
            author={premiumData.author}
            publishedAt={premiumData.publishedAt}
            readTime={premiumData.readTime}
            views={premiumData.views}
            likes={premiumData.likes}
            featuredImage={premiumData.featuredImage}
          />

          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 xl:px-24 pt-8 pb-0">
            <div className="flex justify-end">
              <ExtendedShareButtons />
            </div>
          </div>

          <ArticleContent content={premiumData.content} />

          <AuthorBio author={premiumData.author} />
          <NewsletterCTA />
          <CommentSection />

          <section className="bg-gradient-to-r from-gray-900 to-black text-white py-20">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Keep Exploring Travel Guides</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Discover more destination guides, money-saving tips & insider travel secrets
              </p>
              <Link
                href="/blog"
                className="inline-block bg-white text-gray-900 font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:scale-105"
              >
                Browse All Articles →
              </Link>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Legacy blog post rendering
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate">{post.title}</span>
          </div>
        </div>
      </div>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>
            <div className="whitespace-pre-line">{post.content}</div>
          </div>
        </div>
      </article>
    </div>
  );
}
