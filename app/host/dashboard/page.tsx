import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma';

import { DashboardStats } from './components/DashboardStats';
import { StatsSkeleton } from './components/DashboardSkeleton';
import { HostChecklist } from './components/HostChecklist';
import { ListingHealthScore } from './components/ListingHealthScore';
import { TodayActivity } from './components/TodayActivity';
import { RecentMessages } from './components/RecentMessages';
import { QuickActions } from './components/QuickActions';
import { CompetitorBenchmark } from './components/CompetitorBenchmark';

export const dynamic = 'force-dynamic';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function HostDashboard() {
  // Auth check - handled first to avoid catching the subsequent redirect error
  const session = await auth().catch(error => {
    console.error('Auth check failed:', error);
    return null;
  });

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/host/dashboard');
  }

  // Data fetching with full error safety
  let hostProfile: any = null;
  let propertyCount = 0;
  let healthProperties: any[] = [];
  let hasAvailability = false;

  if (isPrismaAvailable()) {
    const prisma = getPrismaClient();
    // Timeout wrapper — if DB queries take >8s, render with defaults
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms));
    try {
      await Promise.race([
        (async () => {
          // Stage 1: Fetch host profile first (needed for dependent queries)
          hostProfile = await prisma.propertyOwner.findFirst({
            where: { userId: session.user.id },
            select: { verificationStatus: true, id: true, payoutMethod: true },
          }).catch(() => null);

          // Stage 2: Run remaining queries in parallel
          const [count, propertiesForHealth, availability] = await Promise.all([
            prisma.property.count({ where: { owner: { userId: session.user.id } } }).catch(() => 0),

            prisma.property.findMany({
              where: { owner: { userId: session.user.id } },
              select: {
                id: true,
                name: true,
                description: true,
                basePricePerNight: true,
                status: true,
                _count: { select: { images: true } },
              },
              take: 20,
            }).catch(() => []),

            hostProfile?.id
              ? prisma.propertyAvailability.findFirst({
                  where: { property: { ownerId: hostProfile.id } },
                  select: { id: true },
                }).then((r: any) => !!r).catch(() => false)
              : Promise.resolve(false),
          ]);

          propertyCount = count;
          hasAvailability = availability;
          healthProperties = propertiesForHealth.map((p: any) => ({
            id: p.id,
            name: p.name,
            hasPhotos: (p._count?.images || 0) > 0,
            hasPrice: p.basePricePerNight != null && p.basePricePerNight > 0,
            hasDescription: !!p.description && p.description.length > 20,
            isPublished: p.status === 'active',
            photoCount: p._count?.images || 0,
          }));
        })(),
        timeout(8000),
      ]);
    } catch (error: any) {
      if (error?.message === 'DB_TIMEOUT') {
        console.warn('Dashboard DB queries timed out after 8s, rendering with defaults');
      } else {
        console.error('Dashboard data fetch error:', error);
      }
      // Continue with defaults — page renders with empty/zero data
    }
  }

  const firstName = session.user.name?.split(' ')[0] || 'Host';

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-midnight-navy pb-20">
      <MaxWidthContainer className="pt-8 md:pt-12 px-4 sm:px-6 lg:px-8">
        
        {/* ─── Zone 1: Welcome Header ─── */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-black text-midnight-navy mb-1.5 tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-base text-neutral-400 font-medium">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>

        {/* ─── Zone 2: Quick Actions ─── */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* ─── Zone 3: Host Setup Checklist (only if incomplete) ─── */}
        <HostChecklist 
          hasProperties={propertyCount > 0}
          isVerified={hostProfile?.verificationStatus === 'VERIFIED'}
          hasCalendarSetup={hasAvailability}
          hasPayoutMethod={!!hostProfile?.payoutMethod}
        />

        {/* ─── Zone 4: Stats Grid (Streaming) ─── */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats userId={session.user.id!} />
        </Suspense>

        {/* ─── Zone 5: Today's Activity ─── */}
        <div className="mt-8">
          <Suspense fallback={
            <div className="h-40 bg-neutral-100 rounded-3xl animate-pulse" />
          }>
            <TodayActivity userId={session.user.id!} />
          </Suspense>
        </div>

        {/* ─── Zone 6: Health Score + Recent Messages (Two-column) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <ListingHealthScore properties={healthProperties} />

          <Suspense fallback={
            <div className="h-64 bg-neutral-100 rounded-3xl animate-pulse" />
          }>
            <RecentMessages userId={session.user.id!} />
          </Suspense>
        </div>

        {/* ─── Zone 7: AI Market Insights (Competitor Benchmarking) ─── */}
        <div className="mt-8 mb-8">
            <CompetitorBenchmark />
        </div>

      </MaxWidthContainer>
    </div>
  );
}
