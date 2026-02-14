'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Property Wizard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0f]">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 shadow-lg shadow-red-500/10">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Wizard Encountered an Issue</h2>
      
      <p className="text-white/60 mb-8 max-w-md">
        We ran into a problem loading the listing tool. Don't worry, your progress might be saved locally.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Full Reload
        </button>
        
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20"
        >
          Try Again
        </button>
      </div>

      <div className="mt-8 text-xs text-white/20 font-mono p-4 bg-black/40 rounded-lg max-w-lg overflow-hidden text-ellipsis whitespace-nowrap">
        Error: {error.message || 'Unknown error'}
        {error.digest && <span className="block mt-1">ID: {error.digest}</span>}
      </div>
    </div>
  );
}
