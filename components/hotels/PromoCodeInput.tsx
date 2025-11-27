'use client';

import { useState } from 'react';
import { Tag, CheckCircle2, XCircle, Loader2, Percent, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoCodeInputProps {
  onApply: (code: string, discount: PromoDiscount) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedDiscount?: PromoDiscount;
  totalPrice: number;
  currency?: string;
}

export interface PromoDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  description?: string;
}

// Demo promo codes (in production, validate against API/database)
const PROMO_CODES: Record<string, PromoDiscount> = {
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
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(!appliedCode);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  };

  const calculateDiscount = (discount: PromoDiscount, price: number): number => {
    if (discount.minPurchase && price < discount.minPurchase) {
      return 0;
    }

    let discountAmount: number;

    if (discount.type === 'percentage') {
      discountAmount = (price * discount.value) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else {
      discountAmount = discount.value;
    }

    return Math.min(discountAmount, price); // Can't discount more than the price
  };

  const handleApply = async () => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const discount = PROMO_CODES[trimmedCode];

    if (!discount) {
      setError('Invalid promo code');
      setLoading(false);
      return;
    }

    if (discount.minPurchase && totalPrice < discount.minPurchase) {
      setError(`Minimum purchase of ${formatPrice(discount.minPurchase)} required`);
      setLoading(false);
      return;
    }

    onApply(trimmedCode, discount);
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

              {/* Available codes hint */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Try these codes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(PROMO_CODES).slice(0, 3).map(([promoCode, discount]) => (
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PromoCodeInput;
