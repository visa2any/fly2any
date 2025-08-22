'use client';

/**
 * Flight Results Actions Component
 * Post-search action buttons for Explore More and Price Alerts functionality
 */

import React, { useState } from 'react';
import { 
  BellIcon, 
  MapIcon, 
  ShareIcon,
  HeartIcon
} from '@/components/Icons';
import ExploreMoreModal from './modals/ExploreMoreModal';
import PriceAlertsModal from './modals/PriceAlertsModal';

interface FlightResultsActionsProps {
  searchData: {
    from: string;
    to: string;
    departure: string;
    return?: string | null;
    adults: number;
    class: string;
  };
  onExploreMore?: () => void;
  onPriceAlerts?: () => void;
  onShareResults?: () => void;
  onSaveSearch?: () => void;
}

export default function FlightResultsActions({ 
  searchData, 
  onExploreMore, 
  onPriceAlerts,
  onShareResults,
  onSaveSearch 
}: FlightResultsActionsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showExploreMore, setShowExploreMore] = useState(false);
  const [showPriceAlerts, setShowPriceAlerts] = useState(false);

  const handleExploreMore = () => {
    console.log('🗺️ Explore More clicked:', searchData);
    setShowExploreMore(true);
    onExploreMore?.();
  };

  const handlePriceAlerts = () => {
    console.log('🔔 Price Alerts clicked:', searchData);
    setShowPriceAlerts(true);
    onPriceAlerts?.();
  };

  const handleNewSearch = (newSearchData: any) => {
    console.log('🔄 New search requested:', newSearchData);
    // This would trigger a new search with the selected destination
    // For now, just log it
  };

  const handleShareResults = () => {
    // Share current search results
    console.log('🔗 Share Results clicked:', searchData);
    onShareResults?.();
  };

  const handleSaveSearch = () => {
    // Save search for later viewing
    console.log('💾 Save Search clicked:', searchData);
    onSaveSearch?.();
  };

  const buttonBaseStyle = "relative flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <>
      <div className="flex items-center gap-2">
      
      {/* Explore More Button */}
      <button
        onClick={handleExploreMore}
        onMouseEnter={() => setActiveTooltip('explore')}
        onMouseLeave={() => setActiveTooltip(null)}
        className={`${buttonBaseStyle} bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md`}
      >
        <MapIcon className="w-4 h-4" />
        <span className="hidden md:inline">Explore More</span>
        
        {/* Tooltip */}
        {activeTooltip === 'explore' && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50">
            Similar destinations & routes
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </button>

      {/* Price Alerts Button */}
      <button
        onClick={handlePriceAlerts}
        onMouseEnter={() => setActiveTooltip('alerts')}
        onMouseLeave={() => setActiveTooltip(null)}
        className={`${buttonBaseStyle} bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md`}
      >
        <BellIcon className="w-4 h-4" />
        <span className="hidden md:inline">Price Alerts</span>
        
        {/* Tooltip */}
        {activeTooltip === 'alerts' && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50">
            Monitor price changes
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </button>

      {/* Share Results Button */}
      <button
        onClick={handleShareResults}
        onMouseEnter={() => setActiveTooltip('share')}
        onMouseLeave={() => setActiveTooltip(null)}
        className={`${buttonBaseStyle} bg-white/80 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200`}
      >
        <ShareIcon className="w-4 h-4" />
        <span className="hidden lg:inline">Share</span>
        
        {/* Tooltip */}
        {activeTooltip === 'share' && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50">
            Share search results
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </button>

      {/* Save Search Button */}
      <button
        onClick={handleSaveSearch}
        onMouseEnter={() => setActiveTooltip('save')}
        onMouseLeave={() => setActiveTooltip(null)}
        className={`${buttonBaseStyle} bg-white/80 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200`}
      >
        <HeartIcon className="w-4 h-4" />
        <span className="hidden lg:inline">Save</span>
        
        {/* Tooltip */}
        {activeTooltip === 'save' && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50">
            Save this search
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </button>
      </div>

      {/* Modals */}
      <ExploreMoreModal
        isOpen={showExploreMore}
        onClose={() => setShowExploreMore(false)}
        searchData={searchData}
        onNewSearch={handleNewSearch}
      />

      <PriceAlertsModal
        isOpen={showPriceAlerts}
        onClose={() => setShowPriceAlerts(false)}
        searchData={searchData}
      />
    </>
  );
}