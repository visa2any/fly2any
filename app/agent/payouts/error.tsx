"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PayoutsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (
    error.message === "NEXT_REDIRECT" ||
    error.message === "NEXT_NOT_FOUND" ||
    error.digest?.startsWith("NEXT_REDIRECT") ||
    error.digest?.startsWith("NEXT_NOT_FOUND")
  ) {
    throw error;
  }

  useEffect(() => {
    console.error("[Agent Payouts Error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center py-24 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Payouts Unavailable</h2>
        <p className="text-gray-500 text-sm mb-6">
          There was a problem loading your payout data. No funds have been affected.
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
