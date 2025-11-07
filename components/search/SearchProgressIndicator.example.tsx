'use client';

import React, { useState, useEffect } from 'react';
import SearchProgressIndicator from './SearchProgressIndicator';

/**
 * Example usage of SearchProgressIndicator component
 * This demonstrates how to use the component with simulated real-time updates
 */
export default function SearchProgressExample() {
  const [status, setStatus] = useState<'searching' | 'analyzing' | 'presenting' | 'complete'>('searching');
  const [foundCount, setFoundCount] = useState(0);
  const [steps, setSteps] = useState([
    { label: 'Searching Amadeus', complete: false, current: true, progress: 0 },
    { label: 'Searching Duffel', complete: false, current: false },
    { label: 'Searching Skyscanner', complete: false, current: false },
    { label: 'Analyzing results', complete: false, current: false },
    { label: 'Presenting best options', complete: false, current: false }
  ]);

  // Simulate real-time search progress
  useEffect(() => {
    let currentStepIndex = 0;
    let currentProgress = 0;
    let resultsFound = 0;

    const interval = setInterval(() => {
      // Update progress for current step
      currentProgress += 10;

      if (currentProgress > 100) {
        // Move to next step
        currentProgress = 0;
        currentStepIndex++;

        if (currentStepIndex >= steps.length) {
          // Search complete
          setStatus('complete');
          clearInterval(interval);
          return;
        }

        // Update status based on step
        if (currentStepIndex === 3) {
          setStatus('analyzing');
        } else if (currentStepIndex === 4) {
          setStatus('presenting');
        }
      }

      // Update steps
      setSteps(prevSteps => prevSteps.map((step, index) => ({
        ...step,
        complete: index < currentStepIndex,
        current: index === currentStepIndex,
        progress: index === currentStepIndex ? currentProgress : undefined
      })));

      // Simulate finding results during search steps
      if (currentStepIndex < 3 && Math.random() > 0.3) {
        resultsFound += Math.floor(Math.random() * 15) + 1;
        setFoundCount(resultsFound);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Progress Indicator Demo
          </h1>
          <p className="text-gray-600">
            Watch the real-time search progress with live updates
          </p>
        </div>

        {/* Main example */}
        <SearchProgressIndicator
          status={status}
          steps={steps}
          foundCount={foundCount}
          estimatedTime={status === 'complete' ? undefined : 15}
          searchType="flights"
        />

        {/* Static examples */}
        <div className="grid gap-6 mt-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Example: Hotels Search</h2>
            <SearchProgressIndicator
              status="searching"
              steps={[
                { label: 'Searching Booking.com', complete: true },
                { label: 'Searching Expedia', complete: false, current: true, progress: 45 },
                { label: 'Searching Hotels.com', complete: false },
                { label: 'Comparing prices', complete: false }
              ]}
              foundCount={23}
              estimatedTime={12}
              searchType="hotels"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Example: Car Rental Search</h2>
            <SearchProgressIndicator
              status="analyzing"
              steps={[
                { label: 'Searching Hertz', complete: true },
                { label: 'Searching Enterprise', complete: true },
                { label: 'Searching Budget', complete: true },
                { label: 'Analyzing availability', complete: false, current: true, progress: 70 }
              ]}
              foundCount={18}
              estimatedTime={5}
              searchType="cars"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Example: Completed Search</h2>
            <SearchProgressIndicator
              status="complete"
              steps={[
                { label: 'Searching Amadeus', complete: true },
                { label: 'Searching Duffel', complete: true },
                { label: 'Searching Kiwi', complete: true },
                { label: 'Analyzing results', complete: true },
                { label: 'Presenting options', complete: true }
              ]}
              foundCount={127}
              searchType="flights"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * INTEGRATION EXAMPLE
 *
 * In your search results page or component:
 *
 * ```tsx
 * import SearchProgressIndicator from '@/components/search/SearchProgressIndicator';
 *
 * function FlightSearchResults() {
 *   const [searchState, setSearchState] = useState({
 *     status: 'searching',
 *     foundCount: 0,
 *     steps: [
 *       { label: 'Searching Amadeus', complete: false, current: true, progress: 0 },
 *       { label: 'Searching Duffel', complete: false },
 *       { label: 'Analyzing results', complete: false }
 *     ]
 *   });
 *
 *   // Update progress as APIs respond
 *   const updateProgress = (apiName: string, progress: number, resultsCount: number) => {
 *     setSearchState(prev => ({
 *       ...prev,
 *       foundCount: prev.foundCount + resultsCount,
 *       steps: prev.steps.map(step =>
 *         step.label.includes(apiName)
 *           ? { ...step, progress }
 *           : step
 *       )
 *     }));
 *   };
 *
 *   return (
 *     <div>
 *       <SearchProgressIndicator
 *         status={searchState.status}
 *         steps={searchState.steps}
 *         foundCount={searchState.foundCount}
 *         estimatedTime={20}
 *         searchType="flights"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
