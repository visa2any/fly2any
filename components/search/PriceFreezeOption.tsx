'use client';

interface Props {
  currentPrice: number;
  freezeFee: number;
  duration: number; // hours
  onFreeze: () => void;
}

export function PriceFreezeOption({ currentPrice, freezeFee, duration, onFreeze }: Props) {
  return (
    <div className="bg-gradient-to-r from-secondary-500 to-primary-600 p-4 rounded-2xl text-white">
      <div className="flex items-start gap-3">
        <div className="text-3xl">🔒</div>
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">Lock This Price</div>
          <div className="text-sm text-white/90 mb-3">
            Hold this ${currentPrice} price for {duration} hours • Only ${freezeFee}
          </div>

          <div className="space-y-2 text-xs mb-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>If price goes up, you pay the frozen rate</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>If price drops, you get the lower price</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Time to compare airlines, read reviews, or ask family</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onFreeze}
            className="w-full bg-white text-primary-600 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Lock for ${freezeFee} →
          </button>
        </div>
      </div>
    </div>
  );
}
