'use client';

/**
 * Test Data Notice Component
 * Informs users when sample data is being used for demonstration
 */

import React from 'react';

interface TestDataNoticeProps {
  flightsCount: number;
  route: string;
}

const TestDataNotice: React.FC<TestDataNoticeProps> = ({ flightsCount,
  route
 }: TestDataNoticeProps) => {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 text-sm">🎭</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white">Sample Data - TEST Environment</h3>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full">
              {flightsCount} flights
            </span>
          </div>
          
          <div className="text-xs text-white/70 mb-3">
            <p className="mb-1">
              <span className="text-white/50">Route:</span>{' '}
              <span className="text-white font-medium">{route}</span>
            </p>
            <p>
              The Amadeus TEST API returned no real flights for your search dates. 
              These are realistic sample flights to demonstrate the flexible dates functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400">💡</span>
            <span className="text-white/70">
              In production, this route would show real American Airlines, JetBlue, and Frontier flights.
            </span>
          </div>
        </div>
        
        <div className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full whitespace-nowrap">
          TEST MODE
        </div>
      </div>
    </div>
  );
};

export default TestDataNotice;