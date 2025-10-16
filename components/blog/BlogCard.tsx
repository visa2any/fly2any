'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CountdownTimer } from './CountdownTimer';

export type BlogVariant = 'featured' | 'deal' | 'news' | 'guide' | 'tip' | 'story';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: number;
  author?: string;
  publishedAt: string;
  likes?: number;
  saved?: boolean;
  variant: BlogVariant;

  // Deal-specific
  price?: number;
  originalPrice?: number;
  discount?: number;
  dealEndsAt?: string;

  // News-specific
  urgency?: 'critical' | 'important' | 'info';
}

interface BlogCardProps {
  post: BlogPost;
  variant?: BlogVariant;
  size?: '1x1' | '2x1' | '1x2' | '2x2';
  onSave?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onShare?: (postId: string) => void;
  language?: 'en' | 'pt' | 'es';
}

export function BlogCard({
  post,
  variant = post.variant,
  size = '1x1',
  onSave,
  onLike,
  onShare,
  language = 'en',
}: BlogCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(post.saved || false);

  const translations = {
    en: { min: 'min read', save: 'Save', like: 'Like', share: 'Share', endsIn: 'Ends in' },
    pt: { min: 'min de leitura', save: 'Salvar', like: 'Curtir', share: 'Compartilhar', endsIn: 'Termina em' },
    es: { min: 'min de lectura', save: 'Guardar', like: 'Me gusta', share: 'Compartir', endsIn: 'Termina en' },
  };

  const t = translations[language];

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(post.id);
  };

  const urgencyColors = {
    critical: 'bg-red-500 text-white',
    important: 'bg-orange-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const urgencyIcons = {
    critical: '🚨',
    important: '⚠️',
    info: 'ℹ️',
  };

  const categoryColors: { [key: string]: string } = {
    deals: 'bg-orange-100 text-orange-700',
    guides: 'bg-blue-100 text-blue-700',
    news: 'bg-red-100 text-red-700',
    tips: 'bg-green-100 text-green-700',
    stories: 'bg-purple-100 text-purple-700',
  };

  const getImageHeight = () => {
    if (size === '1x2' || size === '2x2') return 'h-64';
    return 'h-40';
  };

  // Deal variant
  if (variant === 'deal') {
    return (
      <div className="group relative h-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Discount Badge */}
        {post.discount && (
          <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            -{post.discount}%
          </div>
        )}

        {/* Image */}
        <div className={`relative ${getImageHeight()} overflow-hidden`}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-3">
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${categoryColors[post.category.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
            {post.category}
          </div>

          <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Price */}
          {post.price && (
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-orange-600">
                ${post.price}
              </span>
              {post.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${post.originalPrice}
                </span>
              )}
            </div>
          )}

          {/* Countdown */}
          {post.dealEndsAt && (
            <div className="bg-gray-50 rounded p-2 mb-2">
              <div className="text-xs text-gray-600 mb-1">{t.endsIn}:</div>
              <CountdownTimer endTime={post.dealEndsAt} size="sm" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{post.readTime} {t.min}</span>
            <div className="flex gap-2">
              <button onClick={handleLike} className={`p-1 rounded hover:bg-gray-100 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
                ❤️
              </button>
              <button onClick={handleSave} className={`p-1 rounded hover:bg-gray-100 ${isSaved ? 'text-blue-500' : 'text-gray-400'}`}>
                🔖
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // News variant (compact list style)
  if (variant === 'news') {
    return (
      <div className="group relative h-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Urgency Badge */}
        {post.urgency && (
          <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs font-bold ${urgencyColors[post.urgency]}`}>
            {urgencyIcons[post.urgency]} {post.urgency.toUpperCase()}
          </div>
        )}

        <div className="flex h-full">
          {/* Image */}
          <div className="relative w-32 flex-shrink-0">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{post.excerpt}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{post.readTime} {t.min}</span>
              <span className="text-xs text-gray-400">{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant (featured, guide, tip, story)
  return (
    <div className="group relative h-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className={`relative ${getImageHeight()} overflow-hidden`}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {variant === 'featured' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        )}

        {/* Category Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${categoryColors[post.category.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
          {post.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className={`font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors ${size === '2x1' || size === '2x2' ? 'text-lg' : 'text-base'} line-clamp-2`}>
          {post.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{post.readTime} {t.min}</span>
          <div className="flex gap-2">
            <button onClick={handleLike} className={`p-1 rounded hover:bg-gray-100 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
              ❤️
            </button>
            <button onClick={handleSave} className={`p-1 rounded hover:bg-gray-100 transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-400'}`}>
              🔖
            </button>
            <button onClick={handleShare} className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400">
              🔗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
