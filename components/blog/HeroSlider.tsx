'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause, Clock, Tag } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface SlideContent {
  id: string;
  destination: string;
  title: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  dealEndsAt: string;
  badge?: string;
  tagline: string;
}

interface HeroSliderProps {
  slides?: SlideContent[];
  language?: 'en' | 'pt' | 'es';
  autoPlayInterval?: number;
  onBookNow?: (slideId: string) => void;
}

// Mock Slide Data
const mockSlides: SlideContent[] = [
  {
    id: '1',
    destination: 'Santorini',
    title: 'Escape to Santorini',
    description: 'Experience the magic of Greek islands with stunning sunsets and white-washed buildings',
    image: '/patterns/santorini.jpg',
    price: 599,
    originalPrice: 1499,
    discount: 60,
    dealEndsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    badge: 'Most Popular',
    tagline: 'Greek Island Paradise',
  },
  {
    id: '2',
    destination: 'Tokyo',
    title: 'Experience Japan',
    description: 'Immerse yourself in the perfect blend of ancient traditions and modern innovation',
    image: '/patterns/tokyo.jpg',
    price: 799,
    originalPrice: 1599,
    discount: 50,
    dealEndsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    badge: 'Limited Time',
    tagline: 'Land of the Rising Sun',
  },
  {
    id: '3',
    destination: 'Bali',
    title: 'Tropical Paradise',
    description: 'Discover pristine beaches, lush rice terraces, and ancient temples in paradise',
    image: '/patterns/bali.jpg',
    price: 499,
    originalPrice: 1299,
    discount: 61,
    dealEndsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    badge: 'Hot Deal',
    tagline: 'Indonesian Treasure',
  },
  {
    id: '4',
    destination: 'Dubai',
    title: 'Luxury Awaits',
    description: 'Experience world-class luxury in the jewel of the Middle East',
    image: '/patterns/dubai.jpg',
    price: 899,
    originalPrice: 1999,
    discount: 55,
    dealEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    badge: 'Premium',
    tagline: 'City of Gold',
  },
  {
    id: '5',
    destination: 'Paris',
    title: 'Romance in Paris',
    description: 'Fall in love with the City of Light and its timeless elegance',
    image: '/patterns/paris.jpg',
    price: 699,
    originalPrice: 1699,
    discount: 59,
    dealEndsAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    badge: 'Best Seller',
    tagline: 'City of Love',
  },
];

export function HeroSlider({
  slides = mockSlides,
  language = 'en',
  autoPlayInterval = 5000,
  onBookNow = (id) => console.log('Book:', id),
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const translations = {
    en: {
      bookNow: 'Book Now',
      learnMore: 'Learn More',
      save: 'Save',
      pauseSlider: 'Pause Slider',
      playSlider: 'Play Slider',
      previousSlide: 'Previous Slide',
      nextSlide: 'Next Slide',
    },
    pt: {
      bookNow: 'Reserve Agora',
      learnMore: 'Saiba Mais',
      save: 'Economize',
      pauseSlider: 'Pausar',
      playSlider: 'Reproduzir',
      previousSlide: 'Anterior',
      nextSlide: 'Próximo',
    },
    es: {
      bookNow: 'Reservar Ahora',
      learnMore: 'Más Info',
      save: 'Ahorra',
      pauseSlider: 'Pausar',
      playSlider: 'Reproducir',
      previousSlide: 'Anterior',
      nextSlide: 'Siguiente',
    },
  };

  const t = translations[language];

  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [slides.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [slides.length, isTransitioning]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / (autoPlayInterval / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isAutoPlaying, isPaused, autoPlayInterval, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') setIsPaused(!isPaused);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isPaused]);

  const currentSlideData = slides[currentSlide];

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isPrev = index === (currentSlide - 1 + slides.length) % slides.length;
          const isNext = index === (currentSlide + 1) % slides.length;

          return (
            <div
              key={slide.id}
              className={`
                absolute inset-0 transition-all duration-1000 ease-out
                ${isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}
              `}
            >
              {/* Background Image with Parallax */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.destination}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
                {/* Multi-layer Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
              </div>

              {/* Content */}
              {isActive && (
                <div className="relative z-20 h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-3xl">
                      {/* Badge */}
                      {slide.badge && (
                        <div
                          className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-slideInLeft"
                          style={{ animationDelay: '0.2s' }}
                        >
                          <Tag className="w-4 h-4" />
                          {slide.badge}
                        </div>
                      )}

                      {/* Tagline */}
                      <div
                        className="text-cyan-400 text-lg md:text-xl font-semibold mb-4 animate-slideInLeft"
                        style={{ animationDelay: '0.3s' }}
                      >
                        {slide.tagline}
                      </div>

                      {/* Title */}
                      <h1
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-slideInLeft"
                        style={{ animationDelay: '0.4s' }}
                      >
                        {slide.title}
                      </h1>

                      {/* Description */}
                      <p
                        className="text-xl md:text-2xl text-white/90 mb-8 animate-slideInLeft"
                        style={{ animationDelay: '0.5s' }}
                      >
                        {slide.description}
                      </p>

                      {/* Price & Deal */}
                      <div
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 mb-8 animate-slideInLeft"
                        style={{ animationDelay: '0.6s' }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                          {/* Price */}
                          <div className="flex items-baseline gap-3">
                            <span className="text-xs md:text-sm text-white/70 uppercase tracking-wider">
                              From
                            </span>
                            <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                              ${slide.price}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-lg md:text-xl text-gray-400 line-through">
                                ${slide.originalPrice}
                              </span>
                              <span className="text-green-400 text-sm font-bold">
                                {t.save} {slide.discount}%
                              </span>
                            </div>
                          </div>

                          {/* Countdown */}
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-400" />
                            <div>
                              <div className="text-xs text-white/70 mb-1">Deal ends in:</div>
                              <CountdownTimer endTime={slide.dealEndsAt} size="lg" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div
                        className="flex flex-wrap gap-4 animate-slideInLeft"
                        style={{ animationDelay: '0.7s' }}
                      >
                        <button
                          onClick={() => onBookNow(slide.id)}
                          className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                        >
                          <span className="relative z-10">{t.bookNow}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>

                        <button className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 text-white text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105">
                          {t.learnMore}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t.previousSlide}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t.nextSlide}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-30">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between gap-4">
            {/* Slide Indicators with Progress */}
            <div className="flex items-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className="group relative"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${index === currentSlide
                        ? 'w-16 bg-white'
                        : 'w-2 bg-white/40 group-hover:bg-white/60'
                      }
                    `}
                  >
                    {index === currentSlide && (
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
              aria-label={isAutoPlaying ? t.pauseSlider : t.playSlider}
            >
              {isAutoPlaying && !isPaused ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out both;
        }
      `}</style>
    </section>
  );
}
