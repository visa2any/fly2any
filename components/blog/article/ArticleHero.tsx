'use client';

import Image from 'next/image';
import { Clock, Eye, Heart, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleHeroProps {
  title: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    role: string;
  };
  publishedAt: Date;
  readTime: number;
  views?: number;
  likes?: number;
  featuredImage: {
    url: string;
    alt: string;
    credit?: string;
  };
}

export function ArticleHero({
  title,
  excerpt,
  category,
  author,
  publishedAt,
  readTime,
  views,
  likes,
  featuredImage,
}: ArticleHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full"
    >
      {/* Full-Width Hero Image */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] min-h-[400px] sm:min-h-[500px] max-h-[700px]">
        <Image
          src={featuredImage.url}
          alt={featuredImage.alt}
          fill
          className="object-cover"
          priority
          quality={90}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Image Credit */}
        {featuredImage.credit && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
            {featuredImage.credit}
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 pb-8 sm:pb-12 md:pb-16">
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
                {category.toUpperCase()}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 md:mb-8 leading-tight tracking-tight"
            >
              {title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/95 mb-6 sm:mb-8 md:mb-10 max-w-[1600px] leading-relaxed font-medium"
            >
              {excerpt}
            </motion.p>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/80 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">{author.name}</p>
                  <p className="text-xs text-white/70">{author.role}</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-white/30" />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="sm:hidden">{new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{readTime} min</span>
              </div>

              {views && (
                <div className="flex items-center gap-1.5 sm:gap-2" suppressHydrationWarning>
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{views.toLocaleString()} views</span>
                  <span className="sm:hidden">{(views / 1000).toFixed(1)}k</span>
                </div>
              )}

              {likes && (
                <div className="flex items-center gap-1.5 sm:gap-2" suppressHydrationWarning>
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{likes.toLocaleString()} likes</span>
                  <span className="sm:hidden">{(likes / 1000).toFixed(1)}k</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
