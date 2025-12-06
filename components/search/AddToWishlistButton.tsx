'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Heart, Loader2 } from 'lucide-react';
import { FeatureAuthModal, type FeatureType } from '@/components/auth/FeatureAuthModal';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Check if flight is in wishlist
  useEffect(() => {
    if (session?.user && flightData.id) {
      checkWishlistStatus();
    }
  }, [session, flightData.id]);

  // Handle pending action after successful auth
  useEffect(() => {
    if (pendingAction && session?.user) {
      setPendingAction(false);
      handleAddToWishlist();
    }
  }, [session, pendingAction]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const inWishlist = data.items?.some(
          (item: any) => item.flightData?.id === flightData.id
        ) || false;
        setIsInWishlist(inWishlist);
        setWishlistCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToWishlist = async () => {
    setIsLoading(true);

    try {
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
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    setIsLoading(true);

    try {
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
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    // If not authenticated, show auth modal
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    if (isInWishlist) {
      await handleRemoveFromWishlist();
    } else {
      await handleAddToWishlist();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setPendingAction(true); // Will trigger add after session updates
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  return (
    <>
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
                ? 'bg-red-50 text-red-500 hover:bg-red-100 border-2 border-red-200'
                : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 border-2 border-transparent hover:border-red-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-110
            shadow-sm hover:shadow-md
            ${className}
          `}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isLoading ? (
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
          ) : (
            <Heart
              className={`${iconSizes[size]} transition-all ${
                isInWishlist ? 'fill-current scale-110' : ''
              }`}
            />
          )}
        </button>
        {showLabel && (
          <span className="text-sm text-gray-600 font-medium">
            {isInWishlist ? 'Saved' : 'Save'}
          </span>
        )}
        {wishlistCount > 0 && size === 'lg' && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {wishlistCount} saved
          </span>
        )}
      </div>

      {/* Auth Modal */}
      <FeatureAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        feature="wishlist"
        productContext={{
          name: `${flightData.origin} → ${flightData.destination}`,
          price: flightData.price,
          currency: flightData.currency,
        }}
      />
    </>
  );
}
