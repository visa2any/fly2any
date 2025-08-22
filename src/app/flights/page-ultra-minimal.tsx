/**
 * 🔬 ULTRA-MINIMAL TEST - Basic React component to isolate fiber errors
 * ULTRATHINK: Test if the issue is with Next.js setup or specific components
 */

'use client';

import React from 'react';

export default function UltraMinimalFlightsPage() {
  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">
          🔬 Ultra-Minimal Test Page
        </h1>
        <p className="text-xl mb-8">
          Testing React fiber issues...
        </p>
        <div className="bg-white text-black p-8 rounded-xl max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Status</h2>
          <p className="mb-4">If you can see this page without errors, the issue is component-specific.</p>
          <button
            onClick={() => alert('Button works!')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Test Interaction
          </button>
        </div>
      </div>
    </div>
  );
}