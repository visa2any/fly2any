'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, User } from 'lucide-react';

/**
 * Blog Preview Section for Homepage
 *
 * Showcases latest travel blog posts to drive engagement and SEO
 */

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  coverImage: string;
  publishedAt: string;
}

// Featured blog posts (from blog data)
const featuredPosts: BlogPost[] = [
  {
    slug: 'best-time-to-book-flights-2025',
    title: 'Best Time to Book Flights in 2025',
    excerpt: 'Discover the optimal booking windows and save up to 40% on your next flight with our data-driven insights.',
    category: 'Tips & Tricks',
    readTime: '8 min',
    author: 'Travel Experts',
    coverImage: '/blog/best-time-booking.jpg',
    publishedAt: '2025-01-15'
  },
  {
    slug: 'hidden-flight-deals-secrets',
    title: 'How to Find Hidden Flight Deals',
    excerpt: 'Uncover insider secrets for finding flight deals that most travelers never discover.',
    category: 'Flight Deals',
    readTime: '6 min',
    author: 'Deal Hunters',
    coverImage: '/blog/hidden-deals.jpg',
    publishedAt: '2025-01-10'
  },
  {
    slug: 'airline-miles-points-ultimate-guide',
    title: 'Ultimate Guide to Airline Miles & Points',
    excerpt: 'Master the art of earning and redeeming airline miles for maximum value on your travels.',
    category: 'Rewards',
    readTime: '12 min',
    author: 'Points Pro',
    coverImage: '/blog/miles-guide.jpg',
    publishedAt: '2025-01-05'
  }
];

export function BlogPreviewSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1600px' }}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Travel Tips & Guides
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert advice, insider tips, and destination guides to help you travel smarter
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {featuredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              {/* Post Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-400 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-700">
                    {post.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                  {post.excerpt}
                </p>

                {/* Post Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} read</span>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Blog Link */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            View All Travel Tips
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
