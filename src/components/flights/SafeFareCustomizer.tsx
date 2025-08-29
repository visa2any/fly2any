/**
 * 🛡️ Safe Fare Customizer Wrapper
 * Provides error boundaries and graceful degradation for real data features
 */

import React from 'react';
import type { Component, ErrorInfo, ReactNode } from 'react';
import FareCustomizer from './FareCustomizer';
import { ProcessedFlightOffer } from '@/types/flights';

interface Props {
  offer: ProcessedFlightOffer;
  compact?: boolean;
  onSelectCustomization?: (customization: any) => void;
  onViewAllOptions?: () => void;
  onSelectFlight?: (customizedOffer: any, customization: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary for Fare Customizer
 */
class SafeFareCustomizerErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FareCustomizer Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with basic customization options - matching main design
      const basePrice = parseFloat(this.props.offer.totalPrice.replace(/[^0-9.]/g, ''));
      
      return (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          {/* Header - matching main FareCustomizer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-blue-600">✨</div>
              <div>
                <h3 className="font-semibold text-gray-900">Customize This Flight</h3>
                <div className="text-xs font-medium text-amber-600">
                  ⚠️ Estimated prices - confirm at booking
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ${basePrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Three Column Layout - matching main design */}
          <div className="grid grid-cols-3 gap-4">
            {/* Popular Column */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <div className="w-4 h-4 text-orange-500">✨</div>
                Popular
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
                  <div className="w-4 h-4 text-gray-500">🔄</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">Free Changes</span>
                      <span className="text-xs bg-amber-100 text-amber-600 px-1 rounded">~</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">+$45</div>
                </div>
              </div>
            </div>

            {/* Add-ons Column */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <div className="w-4 h-4 text-green-500">🎒</div>
                Add-ons
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
                  <div className="w-4 h-4 text-gray-500">🎒</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">Extra Bag</span>
                      <span className="text-xs bg-amber-100 text-amber-600 px-1 rounded">~</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">+$35</div>
                </div>
              </div>
            </div>

            {/* Premium Column */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <div className="w-4 h-4 text-purple-500">👑</div>
                Premium
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-purple-600">👑</div>
                    <div className="flex-1">
                      <div className="font-medium text-purple-900">Business Class</div>
                      <div className="text-xs text-purple-700">+$250</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - matching main design */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Retry: ${basePrice.toFixed(2)}
              </button>
              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Compare
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Basic options available
            </div>
          </div>
        </div>
      );
    }

    // Normal render with full functionality
    return <FareCustomizer {...this.props} />;
  }
}

/**
 * Safe Fare Customizer with additional runtime checks
 */
export default function SafeFareCustomizer(props: Props) {
  // Runtime environment checks
  if (typeof window === 'undefined') {
    // Server-side rendering - return minimal placeholder
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 text-blue-600">✨</div>
          <h3 className="font-semibold text-gray-900">Customize This Flight</h3>
        </div>
        <div className="text-sm text-gray-500">Loading customization options...</div>
      </div>
    );
  }

  // Client-side rendering with error boundary
  return (
    <SafeFareCustomizerErrorBoundary {...props}>
      <FareCustomizer {...props} />
    </SafeFareCustomizerErrorBoundary>
  );
}