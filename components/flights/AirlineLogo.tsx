'use client';

/**
 * Airline Logo Component with Multi-Tier Fallback
 *
 * Tries multiple CDN sources for airline logos with graceful fallbacks:
 * 1. Kiwi.com CDN (fast, covers 500+ airlines)
 * 2. AirHex CDN (comprehensive, covers 1000+ airlines)
 * 3. Emoji fallback (always works)
 */

import { useState } from 'react';
import { getAirlineData } from '@/lib/flights/airline-data';

interface AirlineLogoProps {
  code: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const FONT_SIZE_MAP = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-xl',
};

export function AirlineLogo({ code, size = 'md', className = '' }: AirlineLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSource, setCurrentSource] = useState<'kiwi' | 'airhex' | 'emoji'>('kiwi');

  const airlineData = getAirlineData(code);
  const upperCode = code.toUpperCase();

  // CDN URLs
  const kiwiUrl = `https://images.kiwi.com/airlines/64/${upperCode}.png`;
  const airhexUrl = `https://content.airhex.com/content/logos/airlines_${upperCode}_200_200_s.png`;

  const handleImageError = () => {
    if (currentSource === 'kiwi') {
      // Try AirHex as fallback
      setCurrentSource('airhex');
      setImageError(false);
    } else if (currentSource === 'airhex') {
      // Fall back to emoji
      setCurrentSource('emoji');
      setImageError(true);
    }
  };

  // If we've exhausted all image sources, use emoji
  if (imageError && currentSource === 'emoji') {
    return (
      <div
        className={`${SIZE_MAP[size]} flex items-center justify-center rounded ${className}`}
        style={{
          background: `linear-gradient(135deg, ${airlineData.primaryColor}, ${airlineData.secondaryColor})`,
        }}
      >
        <span className={FONT_SIZE_MAP[size]}>
          {airlineData.logo}
        </span>
      </div>
    );
  }

  // Try image sources
  const imageUrl = currentSource === 'kiwi' ? kiwiUrl : airhexUrl;

  return (
    <img
      src={imageUrl}
      alt={`${airlineData.name} logo`}
      className={`${SIZE_MAP[size]} object-contain rounded ${className}`}
      onError={handleImageError}
      loading="lazy"
    />
  );
}

export default AirlineLogo;
