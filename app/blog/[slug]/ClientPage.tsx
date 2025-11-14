'use client';


import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getRelatedPosts } from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/types/blog';

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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link href={`/blog/category/${post.category}`} className="hover:text-blue-600">
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Category Badge */}
          <div className="px-8 pt-8">
            <span className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full">
              {post.category.toUpperCase()}
            </span>
          </div>

          {/* Title & Meta */}
          <div className="px-8 pt-6 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>

            <div className="flex items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{post.author.name}</p>
                  <p className="text-sm">{post.author.role}</p>
                </div>
              </div>

              <div className="border-l border-gray-300 pl-6">
                <p className="text-sm">{formatDate(post.publishedAt)}</p>
                <p className="text-sm">{post.readTime} min read</p>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 text-gray-500 border-t border-b border-gray-200 py-4">
              <span className="flex items-center gap-2">
                <span>👁️</span> {post.views?.toLocaleString()} views
              </span>
              <span className="flex items-center gap-2">
                <span>❤️</span> {post.likes?.toLocaleString()} likes
              </span>
              <span className="flex items-center gap-2">
                <span>💬</span> 0 comments
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video bg-gray-200 relative">
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded">
              {post.featuredImage.credit}
            </div>
          </div>

          {/* Deal Metadata (if applicable) */}
          {post.dealMetadata && (
            <div className="bg-amber-50 border-y border-amber-200 p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-blue-600">
                      ${post.dealMetadata.discountedPrice}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      ${post.dealMetadata.originalPrice}
                    </span>
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {post.dealMetadata.discount}% OFF
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Expires in</p>
                  <p className="text-2xl font-bold text-red-600">
                    {Math.ceil(
                      (new Date(post.dealMetadata.validUntil).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors text-lg">
                Book This Deal Now
              </button>
              {post.dealMetadata.restrictions && post.dealMetadata.restrictions.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Restrictions:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {post.dealMetadata.restrictions.map((restriction, idx) => (
                      <li key={idx}>• {restriction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="px-8 py-12 prose prose-lg max-w-none">
            <div className="text-xl text-gray-700 leading-relaxed mb-8">{post.excerpt}</div>

            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* Tags */}
          <div className="px-8 pb-8">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">Share this article:</p>
              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Pinterest
                </button>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-blue-50 px-8 py-8 border-t border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About the Author</h3>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{post.author.name}</h4>
                <p className="text-sm text-blue-600 mb-2">{post.author.role}</p>
                <p className="text-gray-700 text-sm">{post.author.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-bold text-lg mt-2 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <span>{relatedPost.author.name}</span>
                      <span>{relatedPost.readTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section Placeholder */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Comments</h2>
          <p className="text-gray-600 mb-8">
            Be the first to comment on this article. Share your thoughts and experiences!
          </p>
          <textarea
            placeholder="Write your comment here..."
            className="w-full border border-gray-300 rounded-lg p-4 mb-4 h-32 resize-none"
          ></textarea>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Post Comment
          </button>
        </div>
      </article>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Next Adventure?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Find the best deals on flights, hotels, and packages with Fly2Any.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/flights"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Search Flights
            </Link>
            <Link
              href="/blog"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors border-2 border-white"
            >
              More Articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
