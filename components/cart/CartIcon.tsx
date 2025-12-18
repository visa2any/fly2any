'use client';

/**
 * Cart Icon - Header Component with Badge
 * Level 6 Ultra-Premium Design
 */

import { ShoppingBag } from 'lucide-react';
import { useExperiencesCart } from '@/lib/cart/experiences-cart';

interface CartIconProps {
  className?: string;
}

export default function CartIcon({ className = '' }: CartIconProps) {
  const { itemCount, toggleCart } = useExperiencesCart();

  return (
    <button
      onClick={toggleCart}
      className={`relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />

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
