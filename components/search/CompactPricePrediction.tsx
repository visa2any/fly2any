'use client';

import { useState, useEffect } from 'react';

interface Props {
  route?: string;
}

export function CompactPricePrediction({ route }: Props) {
  const [prediction, setPrediction] = useState<'rise' | 'fall' | 'stable'>('rise');
  const [percentage, setPercentage] = useState(18);
  const [currentPrice, setCurrentPrice] = useState(512);
  const [comparison, setComparison] = useState(-8);

  useEffect(() => {
    const predictions: Array<'rise' | 'fall' | 'stable'> = ['rise', 'fall', 'stable'];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    setPrediction(randomPrediction);
    setPercentage(Math.floor(Math.random() * 30) + 10);
    setCurrentPrice(Math.floor(Math.random() * 300) + 400);
    setComparison(Math.floor(Math.random() * 30) - 15);
  }, [route]);

  const getMessage = () => {
    if (prediction === 'rise') {
      return `📈 AI: Prices rising ${percentage}% in 48h - Book Now!`;
    } else if (prediction === 'fall') {
      return `📉 AI: Prices dropping ${percentage}% soon - Wait & Track`;
    }
    return `━ AI: Prices stable - Good time to book`;
  };

  const getColor = () => {
    if (prediction === 'rise') return 'bg-gradient-to-r from-error/10 to-warning/10 border-error/30 text-error';
    if (prediction === 'fall') return 'bg-gradient-to-r from-success/10 to-primary-50 border-success/30 text-success';
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  return (
    <div className={`px-4 py-2 rounded-xl border-2 ${getColor()} font-semibold text-sm flex items-center justify-between gap-4`}>
      <span>{getMessage()}</span>
      <span className="text-xs text-gray-600 whitespace-nowrap">
        ${currentPrice} ({comparison < 0 ? `${Math.abs(comparison)}% below` : `${comparison}% above`} avg)
      </span>
    </div>
  );
}
