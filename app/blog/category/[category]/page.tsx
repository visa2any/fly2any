'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory } from '@/lib/data/blog-posts';
import type { BlogPost, CategoryType } from '@/lib/types/blog';

/**
 * Category Page Component
 *
 * Dynamic route for filtering blog posts by category
 * Routes: /blog/category/[category]
 * Categories: blog, news, deal, guide, tip, story
 */
export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Category metadata
  const categoryMetadata = useMemo(() => {
    const metadata: Record<string, { title: string; description: string; icon: string; color: string }> = {
      blog: {
        title: 'Travel Blog',
        description: 'Inspiring travel stories, destination guides, and insider tips from around the world',
        icon: '✈️',
        color: 'from-blue-600 to-blue-800',
      },
      news: {
        title: 'Travel News',
        description: 'Breaking travel news, policy updates, and important alerts for travelers',
        icon: '📰',
        color: 'from-red-600 to-orange-600',
      },
      deal: {
        title: 'Flash Deals',
        description: 'Limited-time offers, exclusive discounts, and unbeatable travel deals',
        icon: '💰',
        color: 'from-green-600 to-emerald-600',
      },
      guide: {
        title: 'Travel Guides',
        description: 'Comprehensive guides to help you plan the perfect trip',
        icon: '🗺️',
        color: 'from-purple-600 to-indigo-600',
      },
      tip: {
        title: 'Travel Tips',
        description: 'Expert advice, hacks, and tips to make your travels easier and more enjoyable',
        icon: '💡',
        color: 'from-yellow-600 to-amber-600',
      },
      story: {
        title: 'Travel Stories',
        description: 'Personal experiences and adventures from fellow travelers',
        icon: '📖',
        color: 'from-pink-600 to-rose-600',
      },
    };

    return metadata[category] || {
      title: 'Unknown Category',
      description: '',
      icon: '📚',
      color: 'from-gray-600 to-gray-800',
    };
  }, [category]);

  useEffect(() => {
    if (category) {
      const categoryPosts = getPostsByCategory(category);
      setPosts(
        categoryPosts.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
      );
      setLoading(false);
    }
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className={`bg-gradient-to-r ${categoryMetadata.color} text-white py-16`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">{categoryMetadata.icon}</div>
            <h1 className="text-5xl font-bold mb-4">{categoryMetadata.title}</h1>
            <p className="text-xl text-white/90">{categoryMetadata.description}</p>
            <div className="mt-8">
              <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold">
                {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-blue-600">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">
              {categoryMetadata.title}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{posts.length}</span>{' '}
                {posts.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white">
                <option>Most Recent</option>
                <option>Most Popular</option>
                <option>Most Liked</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">{categoryMetadata.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Articles in This Category Yet
            </h3>
            <p className="text-gray-600 mb-6">
              We're working on creating amazing content for this category. Check back soon!
            </p>
            <Link
              href="/blog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group flex flex-col"
              >
                {/* Featured Image Placeholder */}
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    {post.isFeatured && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    {post.dealMetadata && (
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full ml-2">
                        {post.dealMetadata.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Deal Info */}
                  {post.dealMetadata && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            ${post.dealMetadata.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-400 line-through ml-2">
                            ${post.dealMetadata.originalPrice}
                          </span>
                        </div>
                        <span className="text-xs text-red-600 font-semibold">
                          Expires:{' '}
                          {Math.ceil(
                            (new Date(post.dealMetadata.validUntil).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )}
                          d
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {post.author.name.charAt(0)}
                      </div>
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                    <span>{post.readTime} min</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <span>👁️</span> {post.views?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>❤️</span> {post.likes?.toLocaleString()}
                    </span>
                    <span className="text-xs">{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className={`bg-gradient-to-r ${categoryMetadata.color} text-white py-16`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore More Content</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Discover more travel inspiration, deals, and tips across all our categories.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/blog"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              All Articles
            </Link>
            <Link
              href="/blog/category/deal"
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors border-2 border-white"
            >
              View Deals
            </Link>
            <Link
              href="/blog/news"
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors border-2 border-white"
            >
              Latest News
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
