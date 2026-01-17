'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  sampleBlogPosts,
  getFeaturedPosts,
  getActiveDeals,
  getLatestNews,
} from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/types/blog';
import { HeroImmersive } from '@/components/blog/HeroImmersive';

/**
 * Blog Homepage Component
 *
 * Main landing page for the Fly2Any travel blog featuring:
 * - Hero section with featured posts
 * - Flash deals with countdown timers
 * - News ticker for breaking travel updates
 * - Content grid with filtering
 */
export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get data for different sections
  const featuredPosts = useMemo(() => getFeaturedPosts(), []);
  const activeDeals = useMemo(() => getActiveDeals(), []);
  const latestNews = useMemo(() => getLatestNews(3), []);

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return sampleBlogPosts;
    }
    return sampleBlogPosts.filter((post) => post.category === selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Posts', icon: '📚' },
    { id: 'blog', label: 'Travel Blog', icon: '✈️' },
    { id: 'deal', label: 'Deals', icon: '💰' },
    { id: 'guide', label: 'Guides', icon: '🗺️' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'tip', label: 'Tips', icon: '💡' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NEW: Stunning Immersive Hero Section */}
      <HeroImmersive
        language="en"
        flashDeals={activeDeals.map(deal => ({
          destination: deal.title.split(':')[0] || deal.title,
          price: deal.dealMetadata?.discountedPrice || 299,
          originalPrice: deal.dealMetadata?.originalPrice || 999,
          discount: deal.dealMetadata?.discount || 70,
          image: '/patterns/hero-travel.jpg',
        }))}
        stats={{
          travelers: 50000,
          destinations: 1000,
          avgSavings: 65,
        }}
        onSearchSubmit={(query) => {
          console.log('Search:', query);
          // You can add search logic here later
        }}
      />

      {/* Flash Deals Section */}
      {activeDeals.length > 0 && (
        <section className="bg-amber-50 border-y border-amber-200 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🔥</span> Flash Deals
              </h2>
              <Link
                href="/blog/category/deal"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View All Deals →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {activeDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/blog/${deal.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border-2 border-amber-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {deal.dealMetadata?.discount}% OFF
                    </span>
                    {deal.dealMetadata?.validUntil && (
                      <span className="text-xs text-gray-500" suppressHydrationWarning>
                        Expires:{' '}
                        {new Date(deal.dealMetadata.validUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{deal.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.excerpt}</p>

                  {deal.dealMetadata && (
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        ${deal.dealMetadata.discountedPrice}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ${deal.dealMetadata.originalPrice}
                      </span>
                    </div>
                  )}

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
                    View Deal
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Ticker Section */}
      {latestNews.length > 0 && (
        <section className="bg-blue-900 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                BREAKING NEWS
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-8 animate-scroll">
                  {latestNews.map((news) => (
                    <Link
                      key={news.id}
                      href={`/blog/${news.slug}`}
                      className="whitespace-nowrap hover:text-blue-300 transition-colors"
                    >
                      {news.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
            >
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {post.category.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>{post.author.name}</span>
                  </div>
                  <span>{post.readTime} min read</span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-gray-400" suppressHydrationWarning>👁️ {post.views?.toLocaleString()}</span>
                  <span className="text-gray-400" suppressHydrationWarning>❤️ {post.likes?.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No posts found in this category.</p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Deal</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive deals, travel tips, and destination
            guides delivered to your inbox.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
