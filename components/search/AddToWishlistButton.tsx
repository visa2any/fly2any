'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface AddToWishlistButtonProps {
  flightData: {
    id: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    price: number;
    currency: string;
    airline?: string;
    duration?: string;
    stops?: number;
    [key: string]: any;
  };
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

export default function AddToWishlistButton({
  flightData,
  size = 'md',
  showLabel = false,
  className = '',
  onToggle,
}: AddToWishlistButtonProps) {
  const { data: session, status } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const sizeClasses = {
    sm: 'h-8 w-8 text-base',
    md: 'h-10 w-10 text-lg',
    lg: 'h-12 w-12 text-xl',
  };

  // Check if flight is in wishlist
  useEffect(() => {
    if (session?.user && flightData.id) {
      checkWishlistStatus();
    }
  }, [session, flightData.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const inWishlist = data.items.some(
          (item: any) => item.flightData.id === flightData.id
        );
        setIsInWishlist(inWishlist);
        setWishlistCount(data.count);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      toast.error('Please sign in to save flights to your wishlist');
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?flightId=${flightData.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsInWishlist(false);
          setWishlistCount(prev => Math.max(0, prev - 1));
          toast.success('Removed from wishlist', {
            icon: '💔',
            duration: 2000,
          });
          onToggle?.(false);
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flightData,
            notifyOnDrop: true,
          }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          setWishlistCount(prev => prev + 1);
          toast.success('Added to wishlist!', {
            icon: '❤️',
            duration: 2000,
          });
          onToggle?.(true);
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleWishlist}
        disabled={isLoading || status === 'loading'}
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${
            isInWishlist
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          transform hover:scale-110
          ${className}
        `}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isLoading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <span className={isInWishlist ? 'animate-pulse-once' : ''}>
            {isInWishlist ? '❤️' : '🤍'}
          </span>
        )}
      </button>
      {showLabel && (
        <span className="text-sm text-gray-600">
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}
      {wishlistCount > 0 && size === 'lg' && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {wishlistCount} saved
        </span>
      )}
    </div>
  );
}
