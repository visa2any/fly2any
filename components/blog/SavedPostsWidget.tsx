'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBlogEngagement, type BlogPost } from '@/lib/hooks/useBlogEngagement';
import { BookmarkX, BookmarkCheck, ExternalLink } from 'lucide-react';

interface SavedPostsWidgetProps {
  allPosts: BlogPost[];
  language?: 'en' | 'pt' | 'es';
  maxDisplay?: number;
  className?: string;
}

const SavedPostsWidget: React.FC<SavedPostsWidgetProps> = ({
  allPosts,
  language = 'en',
  maxDisplay = 5,
  className = '',
}) => {
  const { savedPosts, unsavePost, isLoaded } = useBlogEngagement();

  const translations = {
    en: {
      title: 'My Travel Plans',
      noSaved: 'No saved posts yet',
      noSavedDesc: 'Save posts to read later and plan your trips',
      viewAll: 'View all',
      remove: 'Remove',
    },
    pt: {
      title: 'Meus Planos de Viagem',
      noSaved: 'Nenhum post salvo ainda',
      noSavedDesc: 'Salve posts para ler depois e planejar suas viagens',
      viewAll: 'Ver todos',
      remove: 'Remover',
    },
    es: {
      title: 'Mis Planes de Viaje',
      noSaved: 'Ningun post guardado aun',
      noSavedDesc: 'Guarda posts para leer despues y planificar tus viajes',
      viewAll: 'Ver todo',
      remove: 'Eliminar',
    },
  };

  const t = translations[language];

  // Get saved post objects
  const savedPostObjects = useMemo(() => {
    if (!allPosts || savedPosts.length === 0) return [];

    return savedPosts
      .map((postId) => allPosts.find((post) => post.id === postId))
      .filter((post): post is BlogPost => post !== undefined)
      .slice(0, maxDisplay);
  }, [savedPosts, allPosts, maxDisplay]);

  const handleRemove = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    unsavePost(postId);
  };

  if (!isLoaded) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookmarkCheck className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
        {savedPosts.length > maxDisplay && (
          <span className="ml-auto text-sm text-gray-500">
            +{savedPosts.length - maxDisplay}
          </span>
        )}
      </div>

      {/* Empty State */}
      {savedPostObjects.length === 0 && (
        <div className="text-center py-8">
          <BookmarkX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">{t.noSaved}</p>
          <p className="text-sm text-gray-500">{t.noSavedDesc}</p>
        </div>
      )}

      {/* Saved Posts List */}
      {savedPostObjects.length > 0 && (
        <div className="space-y-3">
          {savedPostObjects.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Thumbnail */}
              {post.image ? (
                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 rounded bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-blue-600" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h4>
                {post.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    {post.category}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => handleRemove(e, post.id)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={t.remove}
                title={t.remove}
              >
                <BookmarkX className="w-4 h-4 text-gray-600" />
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* View All Link */}
      {savedPosts.length > maxDisplay && (
        <Link
          href="/blog/saved"
          className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {t.viewAll} ({savedPosts.length})
        </Link>
      )}
    </div>
  );
};

export default SavedPostsWidget;
