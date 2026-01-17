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
      <div className="relative w-full h-[60vh] min-h-[500px] max-h-[700px]">
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
          <div className="w-full max-w-4xl mx-auto px-4 pb-12 md:pb-16">
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
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed"
            >
              {excerpt}
            </motion.p>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 text-white/80 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{author.name}</p>
                  <p className="text-xs text-white/70">{author.role}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-white/30" />

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readTime} min read</span>
              </div>

              {views && (
                <div className="flex items-center gap-2" suppressHydrationWarning>
                  <Eye className="w-4 h-4" />
                  <span>{views.toLocaleString()} views</span>
                </div>
              )}

              {likes && (
                <div className="flex items-center gap-2" suppressHydrationWarning>
                  <Heart className="w-4 h-4" />
                  <span>{likes.toLocaleString()} likes</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
