'use client';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  potentialSavings?: number;
  label?: string;
}

export function FlexibleDatesToggleWithLabel({ enabled, onChange, potentialSavings = 89, label = 'Flexible Dates' }: Props) {
  return (
    <div>
      <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
        <span className="text-xl">📅</span> {label}
      </label>
      <div className="flex items-center h-[58px] px-4 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-3"
        />
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm">±3 days</div>
          <div className="text-xs text-gray-600">Save up to ${potentialSavings}</div>
        </div>
      </div>
    </div>
  );
}
