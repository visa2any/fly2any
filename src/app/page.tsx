/**
 * 🔬 MINIMAL TEST PAGE - Testing webpack factory fix
 * ULTRATHINK: Verify options.factory errors are resolved
 */

'use client';

import React from 'react';

export default function MinimalTestPage() {
  const handleClick = () => {
    console.log('✅ Minimal page working - webpack factory errors resolved!');
    alert('✅ SUCCESS: No webpack factory errors!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
      <div className="text-center text-white p-8">
        <h1 className="text-4xl font-bold mb-6">
          🔬 Webpack Factory Test
        </h1>
        <p className="text-xl mb-8">
          Testing resolution of options.factory errors
        </p>
        <button
          onClick={handleClick}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
        >
          Test Webpack Factory Fix
        </button>
        <div className="mt-8 text-sm">
          <p>✅ No analytics imports</p>
          <p>✅ Minimal dependencies</p>
          <p>✅ Pure React components</p>
        </div>
      </div>
    </div>
  );
}