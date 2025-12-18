'use client';

/**
 * Mini Cart - Slide-in Cart Panel
 * Level 6 Ultra-Premium Design
 */

import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, Calendar, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useExperiencesCart, typeIcons, typeColors, ExperienceType } from '@/lib/cart/experiences-cart';

export default function MiniCart() {
  const router = useRouter();
  const { items, total, currency, isOpen, closeCart, removeItem, itemCount } = useExperiencesCart();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout/experiences');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Trip</h2>
              <p className="text-xs text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Your trip is empty</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Browse tours, activities, and transfers to start planning your perfect trip!
              </p>
            </div>
          ) : (
            items.map((item) => {
              const colors = typeColors[item.type as ExperienceType];
              return (
                <div
                  key={item.id}
                  className={`relative bg-white rounded-2xl border ${colors.border} overflow-hidden shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex gap-3 p-3">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${colors.bg} flex items-center justify-center text-2xl`}>
                          {typeIcons[item.type as ExperienceType]}
                        </div>
                      )}
                      {/* Type Badge */}
                      <span className={`absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${colors.bg} ${colors.text}`}>
                        {item.type}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.participants.adults + item.participants.children} pax
                        </span>
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-900 mt-2">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 bg-gradient-to-t from-gray-50 to-white space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>

            {/* Promo Notice */}
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Save more!</span> Add another experience for 5% off
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
              >
                Checkout Trip
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={closeCart}
                className="w-full py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
