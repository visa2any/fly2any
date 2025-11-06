'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export interface ConsultantAvatarProps {
  consultantId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-8 h-8',
    image: 32,
    text: 'text-xs',
    status: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 border',
  },
  md: {
    container: 'w-10 h-10',
    image: 40,
    text: 'text-sm',
    status: 'w-3 h-3 -bottom-0.5 -right-0.5 border-2',
  },
  lg: {
    container: 'w-16 h-16',
    image: 64,
    text: 'text-lg',
    status: 'w-4 h-4 -bottom-1 -right-1 border-2',
  },
  xl: {
    container: 'w-24 h-24',
    image: 96,
    text: 'text-2xl',
    status: 'w-5 h-5 -bottom-1 -right-1 border-2',
  },
};

/**
 * Generate professional gradient background based on name
 */
function getGradientColors(name: string): string {
  const gradients = [
    'from-blue-600 to-blue-800',      // Professional blue
    'from-purple-600 to-purple-800',  // Elegant purple
    'from-pink-600 to-pink-800',      // Warm pink
    'from-emerald-600 to-emerald-800',// Fresh green
    'from-amber-600 to-amber-800',    // Warm amber
    'from-rose-600 to-rose-800',      // Deep rose
    'from-indigo-600 to-indigo-800',  // Rich indigo
    'from-teal-600 to-teal-800',      // Cool teal
    'from-orange-600 to-orange-800',  // Vibrant orange
    'from-cyan-600 to-cyan-800',      // Bright cyan
  ];

  // Simple hash based on name to get consistent color
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Professional Consultant Avatar Component
 *
 * Features:
 * - Displays real photo if available
 * - Fallback to gradient with initials
 * - Online status indicator
 * - Optimized image loading
 * - Accessible alt text
 * - Click handler for profile modal
 */
export function ConsultantAvatar({
  consultantId,
  name,
  size = 'md',
  showStatus = true,
  onClick,
  className = '',
}: ConsultantAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  // Start with simple path - no cache busting initially
  const [currentImagePath, setCurrentImagePath] = useState(`/consultants/${consultantId}.png`);
  const [triedPng, setTriedPng] = useState(false);

  const config = sizeConfig[size];
  const gradient = getGradientColors(name);
  const initials = getInitials(name);

  // Debug logging
  console.log('[ConsultantAvatar] Rendering:', {
    consultantId,
    name,
    currentImagePath,
    imageError,
    imageLoading,
    triedPng
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[ConsultantAvatar] Image failed to load:', {
      consultantId,
      path: currentImagePath,
      error: e,
      naturalWidth: (e.target as HTMLImageElement).naturalWidth,
      naturalHeight: (e.target as HTMLImageElement).naturalHeight
    });

    // Try .jpg if .png failed
    if (!triedPng) {
      console.log('[ConsultantAvatar] Trying .jpg format...');
      setTriedPng(true);
      setCurrentImagePath(`/consultants/${consultantId}.jpg`);
      setImageLoading(true);
    } else {
      // Both formats failed, show fallback
      console.warn(`[ConsultantAvatar] Avatar image not found for ${consultantId} (tried .png and .jpg)`);
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('[ConsultantAvatar] Image loaded successfully!', {
      consultantId,
      path: currentImagePath,
      naturalWidth: (e.target as HTMLImageElement).naturalWidth,
      naturalHeight: (e.target as HTMLImageElement).naturalHeight
    });
    setImageLoading(false);
  };

  return (
    <div
      className={`relative ${config.container} flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View ${name}'s profile` : `${name}'s avatar`}
    >
      {/* Avatar Container - Square with rounded corners */}
      <div className="w-full h-full rounded-lg overflow-hidden ring-2 ring-white shadow-md relative">
        {/* Always show gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <span className={`font-bold text-white ${config.text}`}>
            {initials}
          </span>
        </div>

        {/* Try to load photo on top - using regular img tag */}
        {!imageError && (
          <img
            src={currentImagePath}
            alt={`${name} - Travel Consultant`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        )}
      </div>

      {/* Online Status Indicator - Positioned for square avatar */}
      {showStatus && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
          title="Online"
          aria-label="Online status"
        >
          <span className="sr-only">Online</span>
        </div>
      )}
    </div>
  );
}

/**
 * User Avatar (for the current user in chat)
 */
export function UserAvatar({
  name = 'User',
  size = 'md',
  className = '',
}: {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const config = sizeConfig[size];
  const initials = getInitials(name);

  return (
    <div className={`${config.container} flex-shrink-0 ${className}`}>
      <div className="w-full h-full rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
        <User className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} />
      </div>
    </div>
  );
}
