'use client';

import React from 'react';

// Simplified diagnostic dashboard to avoid compilation issues
const DiagnosticDashboard: React.FC = () => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-500 text-white px-3 py-2 rounded-full text-sm shadow-lg">
        🔬 Diagnostics Ready
      </div>
    </div>
  );
};

export default DiagnosticDashboard;