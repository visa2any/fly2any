'use client';

// components/client/QuotePricing.tsx
// Level 6 Ultra-Premium Price Summary
import { motion } from 'framer-motion';
import { Check, Info, CreditCard, Calendar, Percent } from 'lucide-react';

interface QuotePricingProps {
  quote: {
    subtotal: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
  };
}

export default function QuotePricing({ quote }: QuotePricingProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)] border border-gray-100 sticky top-6 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Price Summary</h2>
      </div>

      <div className="p-6">
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
          </div>

          {(quote.taxes > 0 || quote.fees > 0) && (
            <div className="flex items-center justify-between text-gray-700">
              <span>Taxes & Fees</span>
              <span className="font-medium">
                {formatCurrency(quote.taxes + quote.fees)}
              </span>
            </div>
          )}

          {quote.discount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <span>Discount</span>
              </div>
              <span className="font-medium">-{formatCurrency(quote.discount)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Price</span>
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              {formatCurrency(quote.total)}
            </motion.span>
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">What's Included</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    'All flights and accommodations',
                    'Activities and transfers listed',
                    'All taxes and fees',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-indigo-800">
                      <Check className="w-4 h-4 text-indigo-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Terms</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>25% deposit to secure booking</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>Balance due 30 days before departure</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
