'use client';

interface Props {
  points: number;
  dollarValue: number;
}

export function RewardsPreview({ points, dollarValue }: Props) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
      <div className="text-2xl">🎁</div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">
          Earn <span className="font-bold text-primary-600">{points.toLocaleString()} points</span> = ${dollarValue.toFixed(2)} toward next trip
        </div>
      </div>
    </div>
  );
}
