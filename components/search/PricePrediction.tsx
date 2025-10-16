'use client';

import { useState, useEffect } from 'react';

interface Props {
  route?: string;
  showRecommendation?: boolean;
}

export function PricePrediction({ route, showRecommendation = true }: Props) {
  const [prediction, setPrediction] = useState<'rise' | 'fall' | 'stable'>('rise');
  const [percentage, setPercentage] = useState(18);
  const [confidence, setConfidence] = useState(85);
  const [avgPrice, setAvgPrice] = useState(512);
  const [currentComparison, setCurrentComparison] = useState(15);

  useEffect(() => {
    // Simulate AI prediction (in production, this would call an ML API)
    const predictions: Array<'rise' | 'fall' | 'stable'> = ['rise', 'fall', 'stable'];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    setPrediction(randomPrediction);
    setPercentage(Math.floor(Math.random() * 30) + 10);
    setConfidence(Math.floor(Math.random() * 20) + 75);
    setAvgPrice(Math.floor(Math.random() * 300) + 400);
    setCurrentComparison(Math.floor(Math.random() * 30) - 15);
  }, [route]);

  const getIcon = () => {
    if (prediction === 'rise') return '📈';
    if (prediction === 'fall') return '📉';
    return '━';
  };

  const getColor = () => {
    if (prediction === 'rise') return 'from-error to-warning';
    if (prediction === 'fall') return 'from-success to-primary-500';
    return 'from-gray-400 to-gray-500';
  };

  const getMessage = () => {
    if (prediction === 'rise') {
      return `Prices likely to rise ${percentage}% in next 48 hours`;
    } else if (prediction === 'fall') {
      return `Prices may drop ${percentage}% in next 3-5 days`;
    }
    return `Prices expected to remain stable`;
  };

  const getRecommendation = () => {
    if (prediction === 'rise') {
      return { text: 'Book Now', action: 'book', urgent: true };
    } else if (prediction === 'fall') {
      return { text: 'Wait & Track', action: 'wait', urgent: false };
    }
    return { text: 'Good Time to Book', action: 'book', urgent: false };
  };

  const recommendation = getRecommendation();

  return (
    <div className={`bg-gradient-to-r ${getColor()} p-4 rounded-2xl text-white`}>
      <div className="flex items-start gap-3">
        <div className="text-3xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm">AI Price Prediction</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {confidence}% accurate
            </span>
          </div>
          <div className="text-sm font-semibold mb-2">{getMessage()}</div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="opacity-90">Current price:</span>
              <span className="font-bold">${avgPrice}</span>
            </div>
            <div className={`flex items-center gap-1 ${currentComparison < 0 ? 'text-white' : 'text-white/75'}`}>
              {currentComparison < 0 ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">{Math.abs(currentComparison)}% below avg</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">{currentComparison}% above avg</span>
                </>
              )}
            </div>
          </div>
        </div>

        {showRecommendation && (
          <button
            type="button"
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              recommendation.urgent
                ? 'bg-white text-error animate-pulse hover:scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {recommendation.text}
          </button>
        )}
      </div>
    </div>
  );
}
