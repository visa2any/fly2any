'use client';


import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory } from '@/lib/data/blog-posts';
import type { BlogPost, CategoryType } from '@/lib/types/blog';
import { Clock, User, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { BlogCardStats } from '@/components/blog/BlogCardStats';
import { BlogBookmarkButton } from '@/components/blog/BlogBookmarkButton';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
                      {/* Primary Category & Featured Badge */}
                      <div className="flex gap-2">
                        {post.isFeatured && (
                          <span className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50 text-yellow-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            ⭐ Featured
                          </span>
                        )}
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                          {post.category === 'analysis' && <TrendingUp className="w-3 h-3 text-blue-400" />}
                          {post.category === 'deal' && <Sparkles className="w-3 h-3 text-yellow-400" />}
                          {post.category === 'analysis' ? 'Intelligence' : post.category}
                        </span>
                      </div>

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
