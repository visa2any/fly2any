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
    console.error('Host Dashboard Error:', error);
  }, [error]);
 
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        We couldn't load your dashboard data properly. This might be a temporary connection issue.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Reload Page
        </button>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto max-w-full">
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
        </pre>
      )}
    </div>
  );
}
