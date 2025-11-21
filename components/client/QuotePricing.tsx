// components/client/QuotePricing.tsx
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
    return `${quote.currency === "USD" ? "$" : quote.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-6">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>

        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
          </div>

          {/* Taxes */}
          {quote.taxes > 0 && (
            <div className="flex items-center justify-between text-gray-700">
              <span>Taxes & Fees</span>
              <span className="font-medium">{formatCurrency(quote.taxes + quote.fees)}</span>
            </div>
          )}

          {/* Discount */}
          {quote.discount > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span>Discount</span>
              <span className="font-medium">-{formatCurrency(quote.discount)}</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Price</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(quote.total)}
            </span>
          </div>
        </div>

        {/* Per Person Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">What's Included</p>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• All flights and accommodations</li>
                  <li>• Activities and transfers listed</li>
                  <li>• Taxes and fees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Terms</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Deposit: 25% to secure booking</p>
            <p>• Balance due 30 days before departure</p>
            <p>• Payment plans available upon request</p>
          </div>
        </div>
      </div>
    </div>
  );
}
