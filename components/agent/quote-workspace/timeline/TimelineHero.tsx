"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Plane } from "lucide-react";
import { useDestinationHero, type DestinationImage } from "../hooks/useDestinationHero";

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE HERO - Dynamic destination background for emotional conversion
// Apple-class premium design with auto-sliding images
// ═══════════════════════════════════════════════════════════════════════════════

interface TimelineHeroProps {
  tripName?: string;
  destination: string | null;
  destinationCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  travelers?: number;
  className?: string;
}

// Preload image utility
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Image slider component
const ImageSlider = memo(function ImageSlider({
  images,
  interval = 7000,
}: {
  images: DestinationImage[];
  interval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [isPaused, setIsPaused] = useState(false);

  // Preload next image
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    if (!loadedImages.has(nextIndex)) {
      preloadImage(images[nextIndex].url).then(() => {
        setLoadedImages((prev) => new Set([...prev, nextIndex]));
      });
    }
  }, [currentIndex, images, loadedImages]);

  // Auto-advance slider
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    // Respect reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isPaused]);

  if (images.length === 0) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Format date for display
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Main TimelineHero component
export default function TimelineHero({
  tripName,
  destination,
  destinationCode,
  startDate,
  endDate,
  travelers = 1,
  className = "",
}: TimelineHeroProps) {
  const { heroData, isLoading, hasImages } = useDestinationHero(destination, destinationCode);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Debug: Log what we're receiving
  useEffect(() => {
    console.log('[TimelineHero] Destination:', destination, 'Code:', destinationCode);
    console.log('[TimelineHero] HeroData:', heroData);
    console.log('[TimelineHero] HasImages:', hasImages);
  }, [destination, destinationCode, heroData, hasImages]);

  // Preload first image
  useEffect(() => {
    if (heroData?.images?.[0]) {
      console.log('[TimelineHero] Preloading image:', heroData.images[0].url);
      preloadImage(heroData.images[0].url)
        .then(() => {
          console.log('[TimelineHero] Image loaded successfully');
          setImageLoaded(true);
        })
        .catch((err) => {
          console.error('[TimelineHero] Image load failed:', err);
          setImageLoaded(false);
        });
    } else {
      console.log('[TimelineHero] No images in heroData');
      setImageLoaded(false);
    }
  }, [heroData]);

  // Calculate trip duration
  const tripDuration = useCallback(() => {
    if (!startDate || !endDate) return null;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} day${days > 1 ? "s" : ""}` : null;
    } catch {
      return null;
    }
  }, [startDate, endDate]);

  const duration = tripDuration();
  const displayCity = heroData?.city || destination || "Your Destination";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative w-full h-[220px] md:h-[260px] rounded-2xl overflow-hidden ${className}`}
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        {/* Image Slider or Gradient Fallback */}
        {hasImages && imageLoaded ? (
          <ImageSlider images={heroData!.images} />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              heroData?.gradient || "from-indigo-600 via-purple-600 to-pink-500"
            }`}
          />
        )}

        {/* Overlay Gradient for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Top Badge */}
        <div className="absolute top-4 left-4 md:top-5 md:left-5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Plane className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
              Your Trip
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          {/* Trip Name */}
          {tripName && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm font-medium text-white/70"
            >
              {tripName}
            </motion.p>
          )}

          {/* Destination */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-white tracking-tight"
          >
            {displayCity}
          </motion.h1>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 text-sm text-white/80"
          >
            {/* Location - Airport Code + City */}
            {destination && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs md:text-sm font-medium">
                  {destinationCode && `${destinationCode} - `}
                  {displayCity}
                </span>
              </div>
            )}

            {/* Dates */}
            {startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs md:text-sm">
                  {formatDate(startDate)}
                  {endDate && endDate !== startDate && ` — ${formatDate(endDate)}`}
                  {duration && ` (${duration})`}
                </span>
              </div>
            )}

            {/* Travelers */}
            {travelers > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs md:text-sm">{travelers} traveler{travelers > 1 ? "s" : ""}</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Subtle Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] pointer-events-none rounded-2xl" />
    </motion.div>
  );
}
