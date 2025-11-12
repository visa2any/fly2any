'use client';

import { usePathname } from 'next/navigation';
import TripMatchNav from '@/components/tripmatch/TripMatchNav';
import OnboardingModal from '@/components/tripmatch/OnboardingModal';

/**
 * TripMatch Layout
 *
 * Contextual Navigation Strategy:
 * - Landing page (/tripmatch): Uses main site Header (marketing/discovery)
 * - App pages (/tripmatch/browse, /dashboard, etc): Uses TripMatchNav (dedicated app experience)
 *
 * Features:
 * - Conditional navigation rendering
 * - Onboarding flow for new users
 */
export default function TripMatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Show TripMatchNav only on app pages, NOT on landing page
  const isLandingPage = pathname === '/tripmatch';

  return (
    <div className="min-h-screen">
      {!isLandingPage && <TripMatchNav />}
      {children}
      <OnboardingModal />
    </div>
  );
}
