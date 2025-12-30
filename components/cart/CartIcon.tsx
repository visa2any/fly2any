'use client';

/**
 * Cart Icon - Header Component with Badge
 * Level 6 Ultra-Premium Design
 */

import { ShoppingBag } from 'lucide-react';
import { useExperiencesCart } from '@/lib/cart/experiences-cart';

interface CartIconProps {
  className?: string;
  scrolled?: boolean;
}

export default function CartIcon({ className = '', scrolled = true }: CartIconProps) {
  const { itemCount, toggleCart } = useExperiencesCart();

  return (
    <button
      onClick={toggleCart}
      className={`relative p-2.5 rounded-xl transition-colors group ${className} ${
        scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
      }`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBag
        className={`w-5 h-5 transition-colors ${
          scrolled
            ? 'text-gray-600 group-hover:text-gray-900'
            : 'text-white group-hover:text-white/90'
        }`}
        style={{ filter: scrolled ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
      />

      {/* Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm animate-in zoom-in duration-200">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}

// Compact version for mobile
export function CartIconCompact({ className = '' }: CartIconProps) {
  const { itemCount, toggleCart, total, currency } = useExperiencesCart();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (itemCount === 0) return null;

  return (
    <button
      onClick={toggleCart}
      className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all ${className}`}
    >
      <ShoppingBag className="w-4 h-4" />
      <span className="text-sm font-semibold">{formatPrice(total)}</span>
      <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">
        {itemCount}
      </span>
    </button>
  );
}
