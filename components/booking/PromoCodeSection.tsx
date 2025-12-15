'use client';

import { useState } from 'react';
import { Tag, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface PromoDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
  description?: string;
}

interface PromoCodeSectionProps {
  totalPrice: number;
  currency: string;
  productType: 'flight' | 'hotel' | 'all';
  onApply: (code: string, discount: PromoDiscount) => void;
  onRemove: () => void;
  appliedDiscount?: PromoDiscount | null;
  className?: string;
}

export function PromoCodeSection({
  totalPrice,
  currency,
  productType,
  onApply,
  onRemove,
  appliedDiscount,
  className = '',
}: PromoCodeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!!appliedDiscount);
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          totalAmount: totalPrice,
          currency,
          productType,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        onApply(code.trim().toUpperCase(), {
          code: code.trim().toUpperCase(),
          type: data.discountType || 'percentage',
          value: data.discountValue || 0,
          discountAmount: data.discountAmount || 0,
          description: data.description,
        });
        setCode('');
        setError(null);
      } else {
        setError(data.error || 'Invalid promo code');
      }
    } catch (e) {
      setError('Failed to validate code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setCode('');
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">
            {appliedDiscount ? 'Promo Code Applied' : 'Have a promo code?'}
          </span>
          {appliedDiscount && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              -{formatCurrency(appliedDiscount.discountAmount)}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          {appliedDiscount ? (
            /* Applied state */
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">{appliedDiscount.code}</p>
                  <p className="text-xs text-green-600">
                    {appliedDiscount.type === 'percentage'
                      ? `${appliedDiscount.value}% off`
                      : `${formatCurrency(appliedDiscount.value)} off`}
                    {' • '}Saving {formatCurrency(appliedDiscount.discountAmount)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                aria-label="Remove promo code"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Input state */
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                  disabled={isValidating}
                />
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!code.trim() || isValidating}
                  className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking</span>
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {error}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Enter your promo code above to apply a discount.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
