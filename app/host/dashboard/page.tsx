import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { prisma } from '@/lib/prisma';

import { DashboardStats } from './components/DashboardStats';
import { StatsSkeleton } from './components/DashboardSkeleton';
import { HostChecklist } from './components/HostChecklist';
import { ListingHealthScore } from './components/ListingHealthScore';
import { TodayActivity } from './components/TodayActivity';
import { RecentMessages } from './components/RecentMessages';
import { QuickActions } from './components/QuickActions';

export const dynamic = 'force-dynamic';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function HostDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  
  if (!session.user.id) {
    throw new Error("Invalid session: User ID is missing");
  }

  // Stage 1: Fetch host profile first (needed for dependent queries)
  const hostProfile = await prisma.propertyOwner.findFirst({
    where: { userId: session.user.id },
    select: { verificationStatus: true, id: true },
  }).catch(() => null);

  // Stage 2: Run remaining queries in parallel
  const [propertyCount, propertiesForHealth, hasAvailability] = await Promise.all([
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

    // Check if any availability entries exist (for calendar setup tracking)
    hostProfile?.id
      ? prisma.propertyAvailability.findFirst({
          where: { property: { ownerId: hostProfile.id } },
          select: { id: true },
        }).then((r: any) => !!r).catch(() => false)
      : Promise.resolve(false),
  ]);

  const healthProperties = propertiesForHealth.map((p: any) => ({
    id: p.id,
    name: p.name,
    hasPhotos: (p._count?.images || 0) > 0,
    hasPrice: p.basePricePerNight != null && p.basePricePerNight > 0,
    hasDescription: !!p.description && p.description.length > 20,
    isPublished: p.status === 'active',
    photoCount: p._count?.images || 0,
  }));

  const firstName = session.user.name?.split(' ')[0] || 'Host';

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-20">
      <MaxWidthContainer className="pt-8 md:pt-12 px-4 sm:px-6 lg:px-8">
        
        {/* ─── Zone 1: Welcome Header ─── */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1.5 tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-base text-gray-400 font-medium">
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
          hasPayoutMethod={false}
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

      </MaxWidthContainer>
    </div>
  );
}
