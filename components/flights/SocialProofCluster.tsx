'use client';

import { Users, Check } from 'lucide-react';

interface SocialProofClusterProps {
  viewing?: number;
  booked?: number;
}

/**
 * Consolidated Social Proof Cluster Badge
 * Combines: Viewing Count + Recent Bookings
 *
 * Visual Design:
 * - Tier 3 (INFORMATIONAL): White background with border
 * - Shows both metrics in compact format
 */
export function SocialProofCluster({ viewing, booked }: SocialProofClusterProps) {
  // Don't render if no data
  if (!viewing && !booked) {
    return null;
  }

  // Build compact signal string
  const signals: string[] = [];

  if (viewing && viewing > 0) {
    signals.push(`${viewing} viewing`);
  }

  if (booked && booked > 0) {
    signals.push(`${booked} booked`);
  }

  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border-2 border-gray-300 text-gray-700 rounded-md text-xs font-semibold shadow-sm">
      <Users className="h-3 w-3 flex-shrink-0 text-blue-600" />
      <span className="leading-none">{signals.join(' • ')}</span>
    </div>
  );
}
