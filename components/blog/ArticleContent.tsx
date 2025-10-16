'use client';

import Image from 'next/image';
import { BlogPost } from './BlogCard';
import { QuickReactions } from './QuickReactions';

interface ArticleContentProps {
  post: BlogPost & {
    content: string;
    tags?: string[];
  };
  relatedPosts: BlogPost[];
  language?: 'en' | 'pt' | 'es';
}

export function ArticleContent({ post, relatedPosts, language = 'en' }: ArticleContentProps) {
  const translations = {
    en: {
      by: 'By',
      published: 'Published',
      min: 'min read',
      relatedArticles: 'Related Articles',
      tags: 'Tags',
    },
    pt: {
      by: 'Por',
      published: 'Publicado',
      min: 'min de leitura',
      relatedArticles: 'Artigos Relacionados',
      tags: 'Tags',
    },
    es: {
      by: 'Por',
      published: 'Publicado',
      min: 'min de lectura',
      relatedArticles: 'Artículos Relacionados',
      tags: 'Etiquetas',
    },
  };

  const t = translations[language];

  return (
    <div className="w-[90%] lg:w-[70%] mx-auto py-8">
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-[400px] w-full">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Header */}
        <div className="p-6 lg:p-8">
          {/* Category Badge */}
          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium mb-4">
            {post.category}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            {post.author && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{t.by} {post.author}</span>
              </div>
            )}
            <span>•</span>
            <span>{t.published} {new Date(post.publishedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{post.readTime} {t.min}</span>
          </div>

          {/* Quick Reactions - Sticky */}
          <div className="mb-6">
            <QuickReactions postId={post.id} language={language} />
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
              prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
              prose-li:text-gray-700 prose-li:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-img:rounded-lg prose-img:shadow-md
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t.tags}:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Again at Bottom */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <QuickReactions postId={post.id} language={language} showLabels />
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t.relatedArticles}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPosts.slice(0, 3).map((relatedPost) => (
              <div
                key={relatedPost.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-3">
                  <div className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium mb-2">
                    {relatedPost.category}
                  </div>

                  <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {relatedPost.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
