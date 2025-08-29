'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  priority = false,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(() => {
    // Check if it's a local image and try WebP first
    if (src.startsWith('/') && !src.includes('.svg')) {
      const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      return webpSrc;
    }
    return src;
  });

  const handleError = () => {
    // If WebP fails, fallback to original
    if (imgSrc.endsWith('.webp')) {
      const fallbackSrc = src.replace(/\.(png|jpg|jpeg)$/i, (match) => match);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      priority={priority}
      quality={quality}
      onError={handleError}
      {...props}
    />
  );
}