'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * ================================================================================
 * LEGACY REDIRECT PAGE - DO NOT REMOVE
 * ================================================================================
 *
 * This page exists solely to redirect /flights/booking → /flights/booking-optimized
 *
 * WHY IT EXISTS:
 * - Preserves backward compatibility with old bookmarked URLs
 * - Prevents 404 errors if users have saved direct links
 * - Maintains SEO continuity and external link integrity
 * - Provides smooth migration path without breaking existing integrations
 *
 * IMPORTANT:
 * - All actual booking logic is in /flights/booking-optimized/page.tsx
 * - This file ONLY handles redirection - do not add booking functionality here
 * - Query parameters are preserved during the redirect
 * - If you need to modify the booking flow, edit booking-optimized/page.tsx instead
 *
 * REMOVAL:
 * Only remove this file if you're certain no external systems/users reference
 * /flights/booking URLs. Recommended to keep it for at least 6-12 months after
 * the optimized version was deployed.
 *
 * ================================================================================
 */
function BookingRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve all query parameters when redirecting
    const params = new URLSearchParams(searchParams.toString());
    router.replace(`/flights/booking-optimized?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting to Booking...</h2>
        <p className="text-sm text-gray-600">Taking you to the optimized booking experience</p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <BookingRedirectContent />
    </Suspense>
  );
}
