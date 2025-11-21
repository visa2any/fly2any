'use client';

import { useEffect, useState } from 'react';

interface HeroImage {
  url: string;
  alt: string;
}

const HERO_IMAGES: HeroImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&h=1080&fit=crop&q=85', // Packed stadium
    alt: 'Massive stadium crowd at FIFA World Cup',
  },
  {
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&h=1080&fit=crop&q=85', // Celebrating fans
    alt: 'Fans celebrating World Cup victory',
  },
  {
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&h=1080&fit=crop&q=85', // Trophy shine
    alt: 'FIFA World Cup trophy moment',
  },
  {
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&h=1080&fit=crop&q=85', // Stadium at night
    alt: 'Stadium illuminated at night',
  },
  {
    url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1920&h=1080&fit=crop&q=85', // Massive crowd
    alt: 'Enthusiastic World Cup crowd energy',
  },
  {
    url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&h=1080&fit=crop&q=85', // Team celebration
    alt: 'Team celebrating World Cup goal',
  },
];

export function HeroImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Auto-advance carousel every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Preload next image for smooth transition
    const nextIndex = (currentIndex + 1) % HERO_IMAGES.length;
    const img = new Image();
    img.src = HERO_IMAGES[nextIndex].url;
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Image Layers with Crossfade */}
      {HERO_IMAGES.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          role="img"
          aria-label={image.alt}
          onLoad={() => setIsLoaded(true)}
        />
      ))}

      {/* Ken Burns Zoom Effect on Active Image */}
      <style jsx>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
      `}</style>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
