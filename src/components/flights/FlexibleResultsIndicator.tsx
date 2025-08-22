'use client';

/**
 * Flexible Results Indicator Component
 * Shows users which results were found through flexible date searches
 * and highlights potential savings and alternatives
 */

import React from 'react';
import { FlexibleSearchMetadata, FlexibilityRecommendation } from '@/types/flights';

interface FlexibleResultsIndicatorProps {
  metadata?: FlexibleSearchMetadata;
  isFlexibleResult?: boolean;
  originalPrice?: number;
  flexiblePrice?: number;
  searchedDepartureDate?: string;
  searchedReturnDate?: string;
  originalDepartureDate?: string;
  originalReturnDate?: string;
  compact?: boolean;
}

const FlexibleResultsIndicator: React.FC<FlexibleResultsIndicatorProps> = ({
  metadata,
  isFlexibleResult,
  originalPrice,
  flexiblePrice,
  searchedDepartureDate,
  searchedReturnDate,
  originalDepartureDate,
  originalReturnDate,
  compact = false
}) => {
  // Don't show indicator if this is not a flexible search result
  if (!metadata?.isFlexibleSearch && !isFlexibleResult) {
    return null;
  }

  const savings = originalPrice && flexiblePrice ? originalPrice - flexiblePrice : 0;
  const savingsPercent = originalPrice && savings > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const isAlternativeDate = searchedDepartureDate !== originalDepartureDate || 
                           (searchedReturnDate && originalReturnDate && searchedReturnDate !== originalReturnDate);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isAlternativeDate && (
          <div className="flex items-center gap-1">
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
              📅 Flexible
            </span>
            {savings > 0 && (
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                💰 ${savings} saved
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 text-sm">📅</span>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Flexible Date Result</h3>
              {savingsPercent > 0 && (
                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                  {savingsPercent}% cheaper
                </span>
              )}
            </div>
            
            <div className="text-xs text-white/70 mt-1">
              {isAlternativeDate ? (
                <>
                  Found alternative dates: {searchedDepartureDate && new Date(searchedDepartureDate).toLocaleDateString()}
                  {searchedReturnDate && ` - ${new Date(searchedReturnDate).toLocaleDateString()}`}
                </>
              ) : (
                'This result was found through your flexible date search'
              )}
            </div>
          </div>
        </div>
        
        {savings > 0 && (
          <div className="text-right">
            <div className="text-green-400 font-semibold text-sm">
              ${savings} saved
            </div>
            <div className="text-xs text-white/60">
              vs original dates
            </div>
          </div>
        )}
      </div>
      
      {metadata && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-white/60">Search Strategy:</span>
              <div className="text-white font-medium capitalize">
                {metadata.searchStrategy}
              </div>
            </div>
            <div>
              <span className="text-white/60">Searches:</span>
              <div className="text-white font-medium">
                {metadata.totalSearchesExecuted}/{metadata.totalSearchesPlanned}
              </div>
            </div>
            <div>
              <span className="text-white/60">Efficiency:</span>
              <div className="text-white font-medium">
                {metadata.searchEfficiencyScore}%
              </div>
            </div>
            <div>
              <span className="text-white/60">Optimizations:</span>
              <div className="text-green-400 font-medium">
                {metadata.optimizationsSaved} saved
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexibleResultsIndicator;

/**
 * FlexibilityRecommendations Component
 * Shows AI-powered recommendations for better flexibility options
 */
export const FlexibilityRecommendations: React.FC<{
  recommendations: FlexibilityRecommendation[];
  onApplyRecommendation?: (recommendation: FlexibilityRecommendation) => void;
}> = ({ recommendations, onApplyRecommendation }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-purple-400 text-lg">🤖</span>
        <h3 className="text-sm font-semibold text-white">Smart Flexibility Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-white">{rec.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.confidence === 'high' ? 'bg-green-500/20 text-green-300' :
                  rec.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {rec.confidence} confidence
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1">{rec.description}</p>
              {rec.potentialSavings > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  Potential savings: ${rec.potentialSavings}
                </p>
              )}
            </div>
            
            {rec.actionable && onApplyRecommendation && (
              <button
                onClick={() => onApplyRecommendation(rec)}
                className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-500/30 transition-colors"
              >
                Apply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};