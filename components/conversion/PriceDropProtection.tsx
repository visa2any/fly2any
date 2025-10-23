'use client';

interface PriceDropProtectionProps {
  className?: string;
  variant?: 'badge' | 'banner';
}

export default function PriceDropProtection({
  className = '',
  variant = 'badge'
}: PriceDropProtectionProps) {
  if (variant === 'banner') {
    return (
      <div className={`px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-green-900">
              Price Drop Protection Included
            </div>
            <div className="text-[10px] text-green-700 mt-0.5">
              Get refunded if price drops within 24 hours
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-medium rounded border border-green-200 ${className}`}>
      🛡️ Price Drop Protection
    </span>
  );
}
