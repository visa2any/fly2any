'use client';

/**
 * Example Usage of ErrorRecoveryManager Component
 *
 * This file demonstrates how to integrate ErrorRecoveryManager
 * into your application with various error scenarios.
 */

import React, { useState } from 'react';
import { Calendar, Plane, MessageCircle, MapPin, Search } from 'lucide-react';
import ErrorRecoveryManager, { commonAlternatives } from './ErrorRecoveryManager';

export default function ErrorRecoveryExample() {
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState<'api-failure' | 'no-results' | 'timeout' | 'invalid-input'>('no-results');

  // Example 1: No Results Error
  const noResultsExample = (
    <ErrorRecoveryManager
      error={{
        type: 'no-results',
        message: 'No flights found',
        originalRequest: 'NYC to Miami Nov 15',
      }}
      onRetry={() => {
        console.log('Retrying search...');
        // Your retry logic here
      }}
      alternatives={[
        {
          label: 'Try nearby dates',
          action: () => console.log('Adjusting dates...'),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          label: 'Include connecting flights',
          action: () => console.log('Adding layovers...'),
          icon: <Plane className="w-4 h-4" />,
        },
        {
          label: 'Contact support',
          action: () => window.open('mailto:support@fly2any.com', '_blank'),
          icon: <MessageCircle className="w-4 h-4" />,
        },
      ]}
      canRetry={true}
      consultant="flight-operations"
    />
  );

  // Example 2: API Failure Error
  const apiFailureExample = (
    <ErrorRecoveryManager
      error={{
        type: 'api-failure',
        message: 'Connection issue',
        originalRequest: 'Search hotels in Paris',
      }}
      onRetry={() => {
        console.log('Retrying connection...');
      }}
      alternatives={[
        {
          label: 'Try different search',
          action: () => console.log('Different search...'),
          icon: <Search className="w-4 h-4" />,
        },
        {
          label: 'Contact support',
          action: () => window.open('mailto:support@fly2any.com', '_blank'),
          icon: <MessageCircle className="w-4 h-4" />,
        },
      ]}
      canRetry={true}
      consultant="hotel-accommodations"
    />
  );

  // Example 3: Timeout Error
  const timeoutExample = (
    <ErrorRecoveryManager
      error={{
        type: 'timeout',
        message: 'Search taking too long',
        originalRequest: 'Multi-city flight search',
      }}
      onRetry={() => {
        console.log('Retrying with timeout...');
      }}
      alternatives={[
        commonAlternatives.simplifySearch(() => console.log('Simplifying...')),
        commonAlternatives.contactSupport(() =>
          window.open('mailto:support@fly2any.com', '_blank')
        ),
      ]}
      canRetry={true}
    />
  );

  // Example 4: Invalid Input Error
  const invalidInputExample = (
    <ErrorRecoveryManager
      error={{
        type: 'invalid-input',
        message: 'Invalid date format',
        originalRequest: 'NY to LA on 45/67/2025',
      }}
      onRetry={() => {
        console.log('Try with correct format...');
      }}
      alternatives={[
        {
          label: 'See date format examples',
          action: () => console.log('Showing examples...'),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          label: 'Start over',
          action: () => console.log('Starting fresh...'),
          icon: <Search className="w-4 h-4" />,
        },
      ]}
      canRetry={true}
    />
  );

  // Example 5: Using commonAlternatives helper
  const withCommonAlternatives = (
    <ErrorRecoveryManager
      error={{
        type: 'no-results',
        message: 'No hotels available',
        originalRequest: 'Hotels in Tokyo for 10 guests',
      }}
      onRetry={() => console.log('Retrying...')}
      alternatives={[
        commonAlternatives.adjustDates(() => console.log('Adjusting dates...')),
        commonAlternatives.nearbyLocations(() => console.log('Nearby areas...')),
        commonAlternatives.contactSupport(() =>
          window.open('mailto:support@fly2any.com', '_blank')
        ),
      ]}
      canRetry={true}
      consultant="hotel-accommodations"
    />
  );

  // Example 6: Programmatic Error Recovery
  const handleSearch = async () => {
    try {
      // Your search logic
      const response = await fetch('/api/search');
      if (!response.ok) throw new Error('API failure');
    } catch (error) {
      // Show error recovery
      setShowError(true);
      setErrorType('api-failure');
    }
  };

  // Render based on selected example
  const getExample = () => {
    switch (errorType) {
      case 'no-results':
        return noResultsExample;
      case 'api-failure':
        return apiFailureExample;
      case 'timeout':
        return timeoutExample;
      case 'invalid-input':
        return invalidInputExample;
      default:
        return noResultsExample;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Recovery Manager</h1>
        <p className="text-gray-600">Interactive Examples</p>
      </div>

      {/* Example Selector */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Select Error Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setErrorType('no-results')}
            className={`p-3 rounded-lg border-2 transition-all ${
              errorType === 'no-results'
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            No Results
          </button>
          <button
            onClick={() => setErrorType('api-failure')}
            className={`p-3 rounded-lg border-2 transition-all ${
              errorType === 'api-failure'
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            API Failure
          </button>
          <button
            onClick={() => setErrorType('timeout')}
            className={`p-3 rounded-lg border-2 transition-all ${
              errorType === 'timeout'
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Timeout
          </button>
          <button
            onClick={() => setErrorType('invalid-input')}
            className={`p-3 rounded-lg border-2 transition-all ${
              errorType === 'invalid-input'
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Invalid Input
          </button>
        </div>
      </div>

      {/* Live Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Live Example</h2>
        {getExample()}
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-white">Code Example</h3>
        <pre className="text-sm">
          <code>{`import ErrorRecoveryManager, { commonAlternatives } from '@/components/error';
import { Calendar, Plane, MessageCircle } from 'lucide-react';

// Basic Usage
<ErrorRecoveryManager
  error={{
    type: 'no-results',
    message: 'No flights found',
    originalRequest: 'NYC to Miami Nov 15'
  }}
  onRetry={() => retrySearch()}
  alternatives={[
    {
      label: 'Try nearby dates',
      action: adjustDates,
      icon: <Calendar className="w-4 h-4" />
    },
    {
      label: 'Include connecting flights',
      action: addLayovers,
      icon: <Plane className="w-4 h-4" />
    },
    {
      label: 'Contact support',
      action: openSupport,
      icon: <MessageCircle className="w-4 h-4" />
    }
  ]}
  canRetry={true}
  consultant="flight-operations"
/>

// Using Common Alternatives
<ErrorRecoveryManager
  error={{ type: 'timeout', message: 'Search timeout' }}
  onRetry={() => retry()}
  alternatives={[
    commonAlternatives.simplifySearch(() => simplify()),
    commonAlternatives.contactSupport(() => contact())
  ]}
  canRetry={true}
/>`}</code>
        </pre>
      </div>

      {/* Integration Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">
          Integration Notes
        </h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              The component automatically integrates with the error handling system in{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded">
                lib/ai/agent-error-handling.ts
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              All error messages are empathetic and never show raw technical errors
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Color-coded alerts: Red (failures), Yellow (warnings), Blue (info)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Retry button automatically handles loading states</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Support escalation appears for critical errors</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
