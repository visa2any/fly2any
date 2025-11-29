'use client';

import { useState } from 'react';
import { VoucherValidationResult } from '@/lib/api/liteapi-types';

interface PromoCodeInputProps {
  totalAmount: number;
  currency: string;
  hotelId?: string;
  guestId?: string;
  onValidCode: (result: VoucherValidationResult) => void;
  onInvalidCode?: (result: VoucherValidationResult) => void;
}

export default function PromoCodeInput(props: PromoCodeInputProps) {
  const { totalAmount, currency, hotelId, guestId, onValidCode, onInvalidCode } = props;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoucherValidationResult | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          totalAmount,
          currency,
          hotelId,
          guestId,
        }),
      });

      const data = await response.json();
      const validationResult = data.data;
      
      setResult(validationResult);

      if (validationResult.valid) {
        onValidCode(validationResult);
      } else {
        if (onInvalidCode) onInvalidCode(validationResult);
      }
    } catch (err: any) {
      const errorResult: VoucherValidationResult = {
        valid: false,
        error: err.message || 'Failed to validate promo code',
      };
      setResult(errorResult);
      if (onInvalidCode) onInvalidCode(errorResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
          placeholder="Enter promo code"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          disabled={loading}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Validating...' : 'Apply'}
        </button>
      </div>

      {result && (
        <div className={result.valid ? 'bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg' : 'bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'}>
          {result.valid ? (
            <div>
              <p className="font-semibold flex items-center gap-2">✓ Promo code applied!</p>
              <p className="text-sm mt-1">You save {currency} {result.discountAmount ? result.discountAmount.toFixed(2) : '0.00'}</p>
              <p className="text-sm font-medium mt-2">New total: {currency} {result.finalAmount ? result.finalAmount.toFixed(2) : '0.00'}</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">✗ Invalid promo code</p>
              <p className="text-sm mt-1">{result.reason || result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
