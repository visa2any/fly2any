'use client';

import { useState } from 'react';
import Image from 'next/image';
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
 * Generate gradient background based on name
 */
function getGradientColors(name: string): string {
  const gradients = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-green-500 to-green-700',
    'from-yellow-500 to-yellow-700',
    'from-red-500 to-red-700',
    'from-indigo-500 to-indigo-700',
    'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700',
    'from-cyan-500 to-cyan-700',
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

  const config = sizeConfig[size];
  const gradient = getGradientColors(name);
  const initials = getInitials(name);

  // Construct image path
  const imagePath = `/consultants/${consultantId}.jpg`;
  const imagePathAlt = `/consultants/${consultantId}.png`;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
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
      {/* Avatar Container */}
      <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white shadow-md">
        {!imageError ? (
          <>
            {/* Real Photo */}
            <Image
              src={imagePath}
              alt={`${name} - Travel Consultant`}
              width={config.image}
              height={config.image}
              className="object-cover w-full h-full"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              quality={85}
            />
            {/* Loading state */}
            {imageLoading && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <span className={`font-bold text-white ${config.text}`}>
                  {initials}
                </span>
              </div>
            )}
          </>
        ) : (
          /* Fallback: Gradient with Initials */
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <span className={`font-bold text-white ${config.text}`}>
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Online Status Indicator */}
      {showStatus && (
        <div
          className={`absolute ${config.status} bg-green-500 border-white rounded-full`}
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
