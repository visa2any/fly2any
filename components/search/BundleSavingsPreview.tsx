'use client';

interface BundleOption {
  type: 'hotel' | 'car' | 'package';
  savings: number;
  icon: string;
  label: string;
}

interface Props {
  bundles: BundleOption[];
  onSelect: (type: string) => void;
}

export function BundleSavingsPreview({ bundles, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {bundles.map((bundle) => (
        <button
          key={bundle.type}
          type="button"
          onClick={() => onSelect(bundle.type)}
          className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-transparent hover:border-primary-300 transition-all group text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{bundle.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm">{bundle.label}</div>
              <div className="text-xs text-gray-600">Save more together</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-success">+${bundle.savings} OFF</div>
            <svg className="w-5 h-5 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
