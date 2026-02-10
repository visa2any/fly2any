'use client';

/**
 * Airline Logo Component with Multi-Tier Fallback
 *
 * Tries multiple CDN sources for airline logos with graceful fallbacks:
 * 1. Kiwi.com CDN (fast, covers 500+ airlines)
 * 2. AirHex CDN (comprehensive, covers 1000+ airlines)
 * 3. Styled initials fallback (always works)
 *
 * CRITICAL: Uses key-based remounting to prevent stale onError events
 * when switching between CDN sources. Without this, the browser can fire
 * onError for the previous failed src after React updates the src in-place,
 * causing the component to skip directly to the initials fallback.
 */

import { useState, useEffect, useRef } from 'react';
import { getAirlineData } from '@/lib/flights/airline-data';

interface AirlineLogoProps {
  code: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const FONT_SIZE_MAP = {
  xs: 'text-[8px]',
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
};

// CDN URL builders
const getKiwiUrl = (code: string) => `https://images.kiwi.com/airlines/64/${code}.png`;
const getAirhexUrl = (code: string) => `https://content.airhex.com/content/logos/airlines_${code}_200_200_s.png`;

// Ordered list of image sources to try
const IMAGE_SOURCES = ['kiwi', 'airhex'] as const;
type ImageSource = typeof IMAGE_SOURCES[number];

const getImageUrl = (source: ImageSource, code: string): string => {
  switch (source) {
    case 'kiwi': return getKiwiUrl(code);
    case 'airhex': return getAirhexUrl(code);
  }
};

export function AirlineLogo({ code, size = 'md', className = '' }: AirlineLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const prevCodeRef = useRef(code);

  const upperCode = code?.toUpperCase() || 'XX';
  const airlineData = getAirlineData(code || 'XX');

  // Reset state when the airline code changes (handles list re-ordering)
  useEffect(() => {
    if (prevCodeRef.current !== code) {
      prevCodeRef.current = code;
      setSourceIndex(0);
      setShowFallback(false);
    }
  }, [code]);

  const handleImageError = () => {
    const nextIndex = sourceIndex + 1;
    if (nextIndex < IMAGE_SOURCES.length) {
      // Try next CDN source
      setSourceIndex(nextIndex);
    } else {
      // All sources exhausted — show initials
      setShowFallback(true);
    }
  };

  // Styled initials fallback
  if (showFallback) {
    return (
      <div
        className={`${SIZE_MAP[size]} flex items-center justify-center rounded font-bold text-white ${className}`}
        style={{
          background: `linear-gradient(135deg, ${airlineData.primaryColor}, ${airlineData.secondaryColor})`,
        }}
        title={airlineData.name}
      >
        <span className={`${FONT_SIZE_MAP[size]} font-bold leading-none`}>
          {upperCode.slice(0, 2)}
        </span>
      </div>
    );
  }

  const currentSource = IMAGE_SOURCES[sourceIndex];
  const imageUrl = getImageUrl(currentSource, upperCode);

  return (
    <img
      // KEY: Forces React to unmount/remount the <img> when source changes.
      // Without this, React updates src in-place, and the browser may fire
      // onError for the OLD failed src under the NEW source context,
      // causing the component to skip directly to the initials fallback.
      key={`${upperCode}-${currentSource}`}
      src={imageUrl}
      alt={`${airlineData.name} logo`}
      className={`${SIZE_MAP[size]} object-contain rounded ${className}`}
      onError={handleImageError}
      loading="lazy"
    />
  );
}

export default AirlineLogo;
