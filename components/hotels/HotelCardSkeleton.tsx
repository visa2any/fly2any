'use client';

import { motion } from 'framer-motion';

/**
 * Hotel Card Loading Skeleton
 *
 * Ultra-Premium Apple-Class skeleton with shimmer effect.
 * Features staggered animations for premium feel.
 */

// Shimmer animation keyframes
const shimmerVariants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
};

// Stagger container for children
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.08 }
  }
};

// Fade in animation for each skeleton element
const itemVariants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      repeat: Infinity,
      duration: 1.8,
      ease: 'easeInOut'
    }
  }
};

export function HotelCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-row border border-neutral-200/60 h-[200px] shadow-sm"
    >
      {/* Image Skeleton - LEFT SIDE with Premium Shimmer */}
      <motion.div
        className="relative w-72 h-full flex-shrink-0 overflow-hidden bg-neutral-100"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        style={{
          background: 'linear-gradient(90deg, #f5f5f5 0%, #e8e8e8 20%, #f5f5f5 40%, #f5f5f5 100%)',
          backgroundSize: '200% 100%'
        }}
      >
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

        {/* Photo icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-full bg-neutral-200/50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Skeleton - RIGHT SIDE */}
      <motion.div
        className="flex-1 flex flex-col p-4 space-y-3"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Top: Hotel Name & Rating */}
        <div className="space-y-2">
          {/* Hotel Name - Premium shimmer */}
          <motion.div
            variants={itemVariants}
            className="h-5 rounded-md w-3/4"
            style={{
              background: 'linear-gradient(90deg, #e5e5e5 0%, #d4d4d4 50%, #e5e5e5 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />

          {/* Rating & Location */}
          <div className="flex items-center gap-2">
            <motion.div variants={itemVariants} className="h-4 bg-amber-100/80 rounded-full w-16" />
            <motion.div variants={itemVariants} className="h-3 bg-neutral-100 rounded w-1" />
            <motion.div variants={itemVariants} className="h-3 bg-neutral-100 rounded w-28" />
          </div>
        </div>

        {/* Middle: Room Type & Badges */}
        <div className="flex-1 space-y-2.5">
          {/* Room Type */}
          <motion.div variants={itemVariants} className="h-3 bg-neutral-100 rounded w-44" />

          {/* Feature Badges - Fly2Any themed */}
          <div className="flex items-center gap-2">
            <motion.div variants={itemVariants} className="h-6 bg-emerald-50 rounded-lg w-24 border border-emerald-100" />
            <motion.div variants={itemVariants} className="h-6 bg-amber-50 rounded-lg w-20 border border-amber-100" />
            <motion.div variants={itemVariants} className="h-6 bg-neutral-50 rounded-lg w-16 border border-neutral-100" />
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-3">
            <motion.div variants={itemVariants} className="h-4 bg-neutral-100 rounded w-10" />
            <motion.div variants={itemVariants} className="h-4 bg-neutral-100 rounded w-12" />
            <motion.div variants={itemVariants} className="h-4 bg-neutral-100 rounded w-14" />
            <motion.div variants={itemVariants} className="h-4 bg-neutral-100 rounded w-10" />
          </div>
        </div>

        {/* Bottom: Price & CTA */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Price */}
          <div className="space-y-1">
            <motion.div
              variants={itemVariants}
              className="h-6 rounded-md w-24"
              style={{
                background: 'linear-gradient(90deg, #e5e5e5 0%, #d4d4d4 50%, #e5e5e5 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite'
              }}
            />
            <motion.div variants={itemVariants} className="h-3 bg-neutral-100 rounded w-20" />
          </div>

          {/* CTA Button - Fly2Any primary gradient */}
          <motion.div
            variants={itemVariants}
            className="h-10 rounded-xl w-28"
            style={{
              background: 'linear-gradient(90deg, rgba(231,64,53,0.15) 0%, rgba(231,64,53,0.25) 50%, rgba(231,64,53,0.15) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Mobile-Optimized Skeleton (Vertical Layout)
 */
export function HotelCardSkeletonMobile({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="bg-white rounded-xl overflow-hidden border border-neutral-200/60 shadow-sm"
    >
      {/* Image - Top */}
      <motion.div
        className="relative w-full h-44 bg-neutral-100"
        style={{
          background: 'linear-gradient(90deg, #f5f5f5 0%, #e8e8e8 20%, #f5f5f5 40%, #f5f5f5 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-10 h-10 rounded-full bg-neutral-200/50 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        <div className="h-4 bg-neutral-200 rounded w-4/5" style={{ animation: 'shimmer 1.5s infinite' }} />
        <div className="flex gap-2">
          <div className="h-3 bg-amber-100 rounded-full w-14" />
          <div className="h-3 bg-neutral-100 rounded w-20" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-emerald-50 rounded-md w-20 border border-emerald-100" />
          <div className="h-5 bg-neutral-50 rounded-md w-16 border border-neutral-100" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-neutral-200 rounded w-20" />
          <div className="h-9 bg-primary-100 rounded-lg w-24" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Multiple Hotel Cards Skeleton - Premium staggered animation
 */
export function HotelCardsSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {/* Desktop - Horizontal cards */}
      <div className="hidden md:block space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <HotelCardSkeleton key={index} index={index} />
        ))}
      </div>

      {/* Mobile - Grid layout */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
          <HotelCardSkeletonMobile key={index} index={index} />
        ))}
      </div>
    </div>
  );
}

// CSS for shimmer animation (add to globals.css or inline)
const shimmerCSS = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Inject shimmer CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerCSS;
  if (!document.head.querySelector('style[data-shimmer]')) {
    style.setAttribute('data-shimmer', 'true');
    document.head.appendChild(style);
  }
}
