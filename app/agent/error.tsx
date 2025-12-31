"use client";

import { useEffect } from "react";

export default function AgentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log detailed error for debugging
    console.error("[Agent Portal Error]", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      name: error.name,
      cause: error.cause,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agent Portal Error</h1>
            <p className="text-sm text-gray-500">Something went wrong loading the page</p>
          </div>
        </div>

        {/* Error Details for Debugging */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-auto max-h-64">
          <p className="text-red-400 font-mono text-sm mb-2">{error.name}: {error.message}</p>
          {error.digest && (
            <p className="text-gray-400 font-mono text-xs mb-2">Digest: {error.digest}</p>
          )}
          {error.stack && (
            <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap">{error.stack}</pre>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <a
            href="/"
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
