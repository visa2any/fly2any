'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';

interface RecentBooking {
  name: string;
  destination: string;
  timeAgo: string;
  location?: string;
  avatar?: string;
}

interface HeroSocialProofProps {
  recentBookings: RecentBooking[];
  className?: string;
  autoScroll?: boolean;
  scrollInterval?: number;
}

export function HeroSocialProof({
  recentBookings,
  className = '',
  autoScroll = true,
  scrollInterval = 4000,
}: HeroSocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoScroll || recentBookings.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % recentBookings.length);
        setIsVisible(true);
      }, 300);
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, recentBookings.length, scrollInterval]);

  if (recentBookings.length === 0) return null;

  const currentBooking = recentBookings[currentIndex];

  // Generate a colorful avatar with initials
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-red-400 to-red-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`${className}`}>
      <div
        className={`
          inline-flex items-center gap-3
          bg-white/95 backdrop-blur-sm
          px-5 py-3 rounded-2xl
          shadow-xl border border-gray-100
          transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{
          animation: 'floatIn 0.5s ease-out'
        }}
      >
        {/* Success Icon */}
        <div className="flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-500 animate-bounce-subtle" />
        </div>

        {/* Avatar */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full
            ${getAvatarColor(currentBooking.name)}
            flex items-center justify-center
            text-white font-bold text-sm
            shadow-md
          `}
        >
          {currentBooking.avatar ? (
            <img
              src={currentBooking.avatar}
              alt={currentBooking.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(currentBooking.name)
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">
              {currentBooking.name}
            </span>
            {currentBooking.location && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentBooking.location}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">just booked</span>
            <span className="font-semibold text-blue-600">
              {currentBooking.destination}
            </span>
            <span className="text-gray-400 text-xs">
              • {currentBooking.timeAgo}
            </span>
          </div>
        </div>

        {/* Fire Emoji for Hot Deals */}
        <div className="flex-shrink-0 text-2xl animate-pulse-subtle">
          🔥
        </div>
      </div>

      {/* Progress Dots */}
      {recentBookings.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {recentBookings.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
                }
              `}
              aria-label={`Go to booking ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
