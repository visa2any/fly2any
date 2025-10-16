'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBlogEngagement, type BlogPost } from '@/lib/hooks/useBlogEngagement';
import { getRelatedPosts } from '@/lib/utils/blogHelpers';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

interface RecommendedPostsProps {
  currentPostId?: string;
  allPosts: BlogPost[];
  language?: 'en' | 'pt' | 'es';
  limit?: number;
  className?: string;
  variant?: 'grid' | 'list';
}

const RecommendedPosts: React.FC<RecommendedPostsProps> = ({
  currentPostId,
  allPosts,
  language = 'en',
  limit = 3,
  className = '',
  variant = 'grid',
}) => {
  const { savedPosts, recentViews, isLoaded } = useBlogEngagement();

  const translations = {
    en: {
      title: 'Recommended for You',
      basedOn: 'Based on your interests',
      readMore: 'Read more',
      minuteRead: 'min read',
    },
    pt: {
      title: 'Recomendado para Voce',
      basedOn: 'Baseado em seus interesses',
      readMore: 'Leia mais',
      minuteRead: 'min de leitura',
    },
    es: {
      title: 'Recomendado para Ti',
      basedOn: 'Basado en tus intereses',
      readMore: 'Leer mas',
      minuteRead: 'min de lectura',
    },
  };

  const t = translations[language];

  // Smart recommendation algorithm
  const recommendedPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    // Get current post if provided
    const currentPost = currentPostId
      ? allPosts.find((post) => post.id === currentPostId)
      : undefined;

    // Start with empty recommendations
    let recommendations: BlogPost[] = [];

    // Strategy 1: Related to current post (if viewing a post)
    if (currentPost) {
      const related = getRelatedPosts(currentPost, allPosts, limit);
      recommendations.push(...related);
    }

    // Strategy 2: Based on saved posts (user's interests)
    if (savedPosts.length > 0 && recommendations.length < limit) {
      const savedPostObjects = savedPosts
        .map((postId) => allPosts.find((post) => post.id === postId))
        .filter((post): post is BlogPost => post !== undefined);

      savedPostObjects.forEach((savedPost) => {
        const related = getRelatedPosts(savedPost, allPosts, 2);
        related.forEach((relatedPost) => {
          if (
            !recommendations.find((r) => r.id === relatedPost.id) &&
            relatedPost.id !== currentPostId
          ) {
            recommendations.push(relatedPost);
          }
        });
      });
    }

    // Strategy 3: Based on recent views
    if (recentViews.length > 0 && recommendations.length < limit) {
      const recentPostIds = recentViews
        .slice(0, 5)
        .map((view) => view.postId);

      const recentPostObjects = recentPostIds
        .map((postId) => allPosts.find((post) => post.id === postId))
        .filter((post): post is BlogPost => post !== undefined);

      recentPostObjects.forEach((recentPost) => {
        const related = getRelatedPosts(recentPost, allPosts, 2);
        related.forEach((relatedPost) => {
          if (
            !recommendations.find((r) => r.id === relatedPost.id) &&
            relatedPost.id !== currentPostId
          ) {
            recommendations.push(relatedPost);
          }
        });
      });
    }

    // Strategy 4: Popular/Recent posts (fallback)
    if (recommendations.length < limit) {
      const otherPosts = allPosts
        .filter(
          (post) =>
            post.id !== currentPostId &&
            !recommendations.find((r) => r.id === post.id)
        )
        .sort((a, b) => {
          // Sort by date (newest first)
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });

      recommendations.push(...otherPosts);
    }

    // Remove duplicates and limit
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map((post) => [post.id, post])).values()
    );

    return uniqueRecommendations.slice(0, limit);
  }, [allPosts, currentPostId, savedPosts, recentViews, limit]);

  if (!isLoaded || recommendedPosts.length === 0) {
    return null;
  }

  if (variant === 'list') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
            <p className="text-xs text-gray-500">{t.basedOn}</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {recommendedPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Thumbnail */}
              {post.image ? (
                <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 flex-shrink-0 rounded bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1">
                  {post.title}
                </h4>
                {post.excerpt && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {post.category && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {post.category}
                    </span>
                  )}
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} {t.minuteRead}
                    </span>
                  )}
                </div>
              </div>

              {/* Index */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                {index + 1}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{t.title}</h3>
          <p className="text-sm text-gray-500">{t.basedOn}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Image */}
            {post.image ? (
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <TrendingUp className="w-16 h-16 text-purple-600" />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              {post.category && (
                <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded mb-2">
                  {post.category}
                </span>
              )}
              <h4 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">
                {post.title}
              </h4>
              {post.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                {post.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} {t.minuteRead}
                  </span>
                )}
                <span className="text-purple-600 font-medium group-hover:underline">
                  {t.readMore} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedPosts;
