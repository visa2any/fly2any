'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { getPostsByCategory } from '@/lib/data/blog-posts';
import { UrgencyLevel } from '@/lib/types/blog';

/**
 * News Feed Page
 *
 * Dedicated page for travel news, alerts, and breaking updates
 * Features:
 * - Breaking news section
 * - Urgency indicators
 * - Chronological feed
 * - Quick filters
 */
export default function NewsPage() {
  const newsPosts = useMemo(() => {
    return getPostsByCategory('news').sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, []);

  const getUrgencyColor = (urgency?: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.CRITICAL:
        return 'bg-red-600 text-white';
      case UrgencyLevel.HIGH:
        return 'bg-orange-600 text-white';
      case UrgencyLevel.MEDIUM:
        return 'bg-yellow-600 text-white';
      case UrgencyLevel.LOW:
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getUrgencyLabel = (urgency?: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.CRITICAL:
        return 'CRITICAL';
      case UrgencyLevel.HIGH:
        return 'URGENT';
      case UrgencyLevel.MEDIUM:
        return 'IMPORTANT';
      case UrgencyLevel.LOW:
        return 'UPDATE';
      default:
        return 'NEWS';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = Date.now();
    const published = new Date(date).getTime();
    const diffHours = Math.floor((now - published) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white text-red-600 text-sm font-bold px-4 py-2 rounded-full mb-4 animate-pulse">
              🔴 LIVE NEWS FEED
            </div>
            <h1 className="text-5xl font-bold mb-4">Travel News & Alerts</h1>
            <p className="text-xl text-red-100">
              Stay updated with the latest travel news, policy changes, and important alerts
            </p>
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
            <span className="text-gray-900 font-semibold">News</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{newsPosts.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Updates</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600">
              {
                newsPosts.filter(
                  (post) => post.newsMetadata?.urgency === UrgencyLevel.CRITICAL
                ).length
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">Critical Alerts</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {
                newsPosts.filter(
                  (post) => post.newsMetadata?.urgency === UrgencyLevel.HIGH
                ).length
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">Urgent News</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {newsPosts.filter((post) => {
                const daysSince =
                  (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
                return daysSince <= 1;
              }).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Last 24 Hours</div>
          </div>
        </div>
      </section>

      {/* News Feed */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {newsPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No News Updates Yet</h3>
              <p className="text-gray-600">Check back soon for the latest travel news and alerts.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Urgency Indicator */}
                      <div className="flex-shrink-0">
                        <span
                          className={`${getUrgencyColor(
                            post.newsMetadata?.urgency
                          )} text-xs font-bold px-3 py-2 rounded-full`}
                        >
                          {getUrgencyLabel(post.newsMetadata?.urgency)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <span>🕒 {getTimeAgo(post.publishedAt)}</span>
                          {post.newsMetadata?.source && (
                            <>
                              <span>•</span>
                              <span>📰 {post.newsMetadata.source}</span>
                            </>
                          )}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h2>

                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                        {/* Destinations */}
                        {post.newsMetadata?.relatedDestinations &&
                          post.newsMetadata.relatedDestinations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-sm text-gray-600">Affects:</span>
                              {post.newsMetadata.relatedDestinations.map((dest) => (
                                <span
                                  key={dest}
                                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
                                >
                                  {dest}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <span>👁️</span> {post.views?.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>❤️</span> {post.likes?.toLocaleString()}
                            </span>
                            <span>{post.readTime} min read</span>
                          </div>

                          <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                            Read Full Article →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Travel Update</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to receive breaking travel news and important alerts directly in your inbox.
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
          <p className="text-sm text-blue-200 mt-4">
            Get instant alerts for critical travel updates
          </p>
        </div>
      </section>
    </div>
  );
}
