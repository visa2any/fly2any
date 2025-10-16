'use client';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  potentialSavings?: number;
}

export function FlexibleDatesToggle({ enabled, onChange, potentialSavings = 89 }: Props) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-success/10 to-primary-50 rounded-xl border border-success/20">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <div>
          <div className="font-semibold text-gray-900 text-sm">Flexible dates (±3 days)</div>
          <div className="text-xs text-gray-600">
            Save up to <span className="font-bold text-success">${potentialSavings}</span> by adjusting your dates
          </div>
        </div>
      </div>
      <div className="text-2xl">📅</div>
    </div>
  );
}
