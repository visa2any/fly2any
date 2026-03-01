"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function QuotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Re-throw Next.js internal signals (redirect, notFound)
  if (
    error.message === "NEXT_REDIRECT" ||
    error.message === "NEXT_NOT_FOUND" ||
    error.digest?.startsWith("NEXT_REDIRECT") ||
    error.digest?.startsWith("NEXT_NOT_FOUND")
  ) {
    throw error;
  }

  useEffect(() => {
    console.error("[Agent Quotes Error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center py-24 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Quotes Unavailable</h2>
        <p className="text-gray-500 text-sm mb-6">
          There was a problem loading your quotes. Your data is safe.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            Try Again
          </button>
          <Link
            href="/agent"
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
