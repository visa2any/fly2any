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
import { motion } from 'framer-motion';
import { Clock, User, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { BlogCardStats } from '@/components/blog/BlogCardStats';
import { BlogBookmarkButton } from '@/components/blog/BlogBookmarkButton';

/**
 * Blog Homepage Component
 *
 * Main landing page for the Fly2Any travel blog featuring:
 * - Hero section with featured posts
 * - Flash deals with countdown timers
 * - News ticker for breaking travel updates
 * - Content grid with filtering
 */
export default function BlogClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get data for different sections
  const featuredPosts = useMemo(() => getFeaturedPosts(), []);
  const activeDeals = useMemo(() => getActiveDeals(), []);
  const latestNews = useMemo(() => getLatestNews(3), []);

  // Filter posts based on selected category AND search query
  const filteredPosts = useMemo(() => {
    return sampleBlogPosts.filter((post) => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Posts', icon: '📚' },
    { id: 'analysis', label: 'Intelligence', icon: '📊' },
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
        compact={!!searchQuery}
        language="en"
        flashDeals={activeDeals.map(deal => ({
          destination: deal.title.split(':')[0] || deal.title,
          price: deal.dealMetadata?.discountedPrice || 299,
          originalPrice: deal.dealMetadata?.originalPrice || 999,
          discount: deal.dealMetadata?.discount || 70,
          image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
        }))}
        stats={{
          travelers: 50000,
          destinations: 1000,
          avgSavings: 65,
        }}
        onSearchSubmit={(query) => {
          setSearchQuery(query);
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
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${selectedCategory === category.id
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
        {searchQuery && (
          <div className="mb-8 flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <p className="text-blue-900 font-medium">
              Showing results for: <span className="font-bold">"{searchQuery}"</span>
              <span className="ml-2 text-blue-600 text-sm">({filteredPosts.length} matches found)</span>
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 flex flex-col h-full"
            >
              <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
                {post.featuredImage?.url ? (
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-blue-600 flex items-center justify-center">
                    <span className="text-6xl opacity-30">✈️</span>
                  </div>
                )}
                
                {/* Advanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Dynamic Badges Container */}
                <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                  <div className="flex flex-col gap-2 items-start">
                    {/* Primary Category Badge */}
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                      {post.category === 'analysis' && <TrendingUp className="w-3 h-3 text-blue-400" />}
                      {post.category === 'deal' && <Sparkles className="w-3 h-3 text-yellow-400" />}
                      {post.category === 'analysis' ? 'Intelligence' : post.category}
                    </span>

                    {/* Secondary "NEW" Badge (if published within 48h) */}
                    {(new Date().getTime() - new Date(post.publishedAt).getTime()) < (48 * 60 * 60 * 1000) && (
                      <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter shadow-xl animate-pulse">
                        New Article
                      </span>
                    )}

                    {/* "LIVE" Pulse for Deals */}
                    {post.category === 'deal' && (
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-red-500/30">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Live Deal</span>
                      </div>
                    )}
                  </div>

                  <BlogBookmarkButton postId={post.id} />
                </div>

                {/* Content Overlay - Permanently Visible */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform transition-all duration-500">
                    <h3 className="font-extrabold text-2xl sm:text-3xl text-white mb-4 leading-tight drop-shadow-2xl transition-colors">
                      {post.title}
                    </h3>
                    
                    <div className="transition-all duration-700 ease-in-out">
                      <p className="text-white/90 text-sm mb-6 line-clamp-3 font-medium border-l-2 border-blue-500 pl-4 py-1">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-1.5">
                         <User className="w-3 h-3 text-blue-400" />
                         {post.author.name}
                       </span>
                       <span className="flex items-center gap-1.5">
                         <Clock className="w-3 h-3 text-blue-400" />
                         {post.readTime}m read
                       </span>
                    </div>
                  </div>
                </div>

                {/* Read Progress Visualizer */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>

              {/* Minimal Card Footer for Stats */}
              <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                <BlogCardStats 
                  postId={post.id} 
                  initialViews={post.views || 0} 
                  initialLikes={post.likes || 0} 
                />
                
                <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <span className="text-[10px]">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any articles matching "{searchQuery}". Try a different keyword or check another category.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              Reset All Filters
            </button>
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
