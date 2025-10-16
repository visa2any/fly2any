'use client';

interface PriceDropAlertProps {
  currentPrice: number;
  previousPrice: number;
  dropAmount: number;
  dropPercentage: number;
  timeAgo?: string;
}

export default function PriceDropAlert({
  currentPrice,
  previousPrice,
  dropAmount,
  dropPercentage,
  timeAgo = 'in the last hour'
}: PriceDropAlertProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg animate-slideDown">
        <div className="flex items-center gap-3">
          {/* Animated arrow */}
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 animate-bounce-gentle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl animate-pulse">💰</span>
              <span className="font-bold text-lg">Price Dropped!</span>
            </div>
            <p className="text-sm md:text-base">
              <span className="font-bold text-xl">${dropAmount}</span>
              <span className="mx-1">({dropPercentage}%)</span>
              <span className="opacity-90">{timeAgo}</span>
            </p>
          </div>

          {/* Price comparison */}
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs opacity-75 line-through">
              ${previousPrice}
            </span>
            <span className="text-2xl font-bold">
              ${currentPrice}
            </span>
          </div>
        </div>

        {/* Pulse effect overlay */}
        <div className="absolute inset-0 bg-white opacity-10 animate-pulse pointer-events-none" />
      </div>

      {/* Mobile price comparison */}
      <div className="md:hidden mt-2 flex items-center justify-between text-sm bg-green-50 px-4 py-2 rounded-lg">
        <span className="text-gray-600">
          Was: <span className="line-through">${previousPrice}</span>
        </span>
        <span className="text-green-600 font-bold text-lg">
          Now: ${currentPrice}
        </span>
      </div>
    </div>
  );
}
