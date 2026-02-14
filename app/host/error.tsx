'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Host Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">Dashboard Error</h2>
      
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
        We couldn't load your dashboard data properly. This might be a temporary connection issue.
      </p>

      <div className="flex gap-4">
        <Link 
            href="/"
            className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 font-bold hover:bg-neutral-50 dark:hover:bg-white/5 flex items-center gap-2"
        >
            <Home className="w-4 h-4" /> Home
        </Link>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-600/20 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );
}
