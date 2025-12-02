'use client';

import { useState, useCallback } from 'react';
import { Tag, CheckCircle2, XCircle, Loader2, Percent, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoCodeInputProps {
  onApply: (code: string, discount: PromoDiscount) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedDiscount?: PromoDiscount;
  totalPrice: number;
  currency?: string;
  hotelId?: string;
  guestId?: string;
}

export interface PromoDiscount {
  type: 'percentage' | 'fixed' | 'freeNight';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  description?: string;
  voucherId?: string;
  discountAmount?: number;
}

// Fallback demo codes (only used when API fails or in development)
const FALLBACK_PROMO_CODES: Record<string, PromoDiscount> = {
  'WELCOME10': { type: 'percentage', value: 10, description: '10% off your first booking' },
  'SAVE20': { type: 'percentage', value: 20, maxDiscount: 100, description: '20% off (max $100)' },
  'HOTEL50': { type: 'fixed', value: 50, minPurchase: 200, description: '$50 off hotels over $200' },
  'SUMMER25': { type: 'percentage', value: 25, description: '25% summer discount' },
  'FLY2ANY': { type: 'percentage', value: 15, description: '15% loyalty discount' },
};

export function PromoCodeInput({
  onApply,
  onRemove,
  appliedCode,
  appliedDiscount,
  totalPrice,
  currency = 'USD',
  hotelId,
  guestId,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(!appliedCode);
  const [apiAvailable, setApiAvailable] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  };

  const calculateDiscount = (discount: PromoDiscount, price: number): number => {
    // If API already calculated discount, use that
    if (discount.discountAmount !== undefined) {
      return discount.discountAmount;
    }

    if (discount.minPurchase && price < discount.minPurchase) {
      return 0;
    }

    let discountAmount: number;

    if (discount.type === 'percentage') {
      discountAmount = (price * discount.value) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    } else if (discount.type === 'freeNight') {
      // Free night calculation would depend on per-night price
      discountAmount = discount.value;
    } else {
      discountAmount = 0;
    }

    return Math.min(discountAmount, price);
  };

  const validateWithAPI = useCallback(async (promoCode: string): Promise<{
    success: boolean;
    discount?: PromoDiscount;
    error?: string;
  }> => {
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          totalAmount: totalPrice,
          currency,
          hotelId,
          guestId,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.valid) {
        const voucher = data.data.voucher;
        return {
          success: true,
          discount: {
            type: voucher?.type || 'percentage',
            value: voucher?.value || 0,
            maxDiscount: voucher?.maxDiscount,
            minPurchase: voucher?.minSpend,
            description: voucher?.code ? `${voucher.code} applied` : 'Discount applied',
            voucherId: voucher?.id,
            discountAmount: data.data.discountAmount,
          },
        };
      } else {
        return {
          success: false,
          error: data.data?.error || data.data?.reason || 'Invalid promo code',
        };
      }
    } catch (err) {
      console.warn('Voucher API unavailable, falling back to demo codes');
      setApiAvailable(false);
      return { success: false, error: 'API_UNAVAILABLE' };
    }
  }, [totalPrice, currency, hotelId, guestId]);

  const handleApply = async () => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError(null);

    // Try API validation first
    if (apiAvailable) {
      const apiResult = await validateWithAPI(trimmedCode);

      if (apiResult.success && apiResult.discount) {
        onApply(trimmedCode, apiResult.discount);
        setShowInput(false);
        setLoading(false);
        return;
      }

      // If API returned error (not unavailable), show it
      if (apiResult.error && apiResult.error !== 'API_UNAVAILABLE') {
        setError(apiResult.error);
        setLoading(false);
        return;
      }
    }

    // Fallback to demo codes (only in development or when API unavailable)
    const fallbackDiscount = FALLBACK_PROMO_CODES[trimmedCode];

    if (!fallbackDiscount) {
      setError('Invalid promo code');
      setLoading(false);
      return;
    }

    if (fallbackDiscount.minPurchase && totalPrice < fallbackDiscount.minPurchase) {
      setError(`Minimum purchase of ${formatPrice(fallbackDiscount.minPurchase)} required`);
      setLoading(false);
      return;
    }

    onApply(trimmedCode, fallbackDiscount);
    setShowInput(false);
    setLoading(false);
  };

  const handleRemove = () => {
    onRemove();
    setCode('');
    setShowInput(true);
    setError(null);
  };

  const discountAmount = appliedDiscount ? calculateDiscount(appliedDiscount, totalPrice) : 0;

  return (
    <div className="space-y-3">
      {/* Applied Code Display */}
      <AnimatePresence>
        {appliedCode && appliedDiscount && !showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-green-700">{appliedCode}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {appliedDiscount.voucherId && (
                      <span className="text-xs bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-green-600">{appliedDiscount.description}</p>
                  <p className="text-lg font-bold text-green-700 mt-1">
                    -{formatPrice(discountAmount)} saved!
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Code Input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Have a promo code?</span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Enter code"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans
                      ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'}
                    `}
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  />
                  {error && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleApply}
                  disabled={loading || !code.trim()}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Percent className="w-4 h-4" />
                      Apply
                    </>
                  )}
                </button>
              </div>

              {/* Sample codes hint - only show in development or demo mode */}
              {!apiAvailable && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Try these codes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(FALLBACK_PROMO_CODES).slice(0, 3).map(([promoCode]) => (
                      <button
                        key={promoCode}
                        onClick={() => setCode(promoCode)}
                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full hover:border-orange-300 hover:text-orange-600 transition-colors"
                      >
                        {promoCode}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PromoCodeInput;
