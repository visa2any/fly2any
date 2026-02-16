import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Plus, Rocket } from 'lucide-react';
import { prisma } from '@/lib/prisma';

import { DashboardStats } from './components/DashboardStats';
import { PropertiesList } from './components/PropertiesList';
import { StatsSkeleton, ListSkeleton } from './components/DashboardSkeleton';
import { HostChecklist } from './components/HostChecklist';
import { ListingHealthScore } from './components/ListingHealthScore';

export const dynamic = 'force-dynamic';

export default async function HostDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  
  // Strict check for user ID to prevent Prisma crashes (Error #419)
  if (!session.user.id) {
    throw new Error("Invalid session: User ID is missing");
  }

  // Fetch data for checklist + health score
  const [propertyCount, hostProfile, propertiesForHealth] = await Promise.all([
    prisma.property.count({ where: { owner: { userId: session.user.id } } }).catch(() => 0),
    prisma.propertyOwner.findFirst({ where: { userId: session.user.id }, select: { verificationStatus: true } }).catch(() => null),
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-20">

       <MaxWidthContainer className="pt-10 md:pt-14 px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-12 animate-fadeIn">
             <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
                    Overview
                </h1>
                <p className="text-lg text-gray-500 font-medium">
                    Welcome back, {session.user.name?.split(' ')[0]}. Here's your performance.
                </p>
             </div>
             
             <Link 
                href="/list-your-property/create"
                className="group relative px-6 py-3.5 rounded-2xl bg-neutral-900 overflow-hidden text-white font-bold shadow-xl shadow-neutral-900/20 hover:shadow-2xl hover:shadow-neutral-900/30 transition-all hover:-translate-y-1"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-black group-hover:from-neutral-700 group-hover:to-neutral-900 transition-all"></div>
                <div className="relative flex items-center gap-2">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
                    <span>Create New Listing</span>
                </div>
             </Link>
          </div>

          {/* Host Setup Checklist */}
          <HostChecklist 
            hasProperties={propertyCount > 0}
            isVerified={hostProfile?.verificationStatus === 'VERIFIED'}
          />

          {/* Stats Grid - Streaming */}
          <Suspense fallback={<StatsSkeleton />}>
              <DashboardStats userId={session.user.id!} />
          </Suspense>

          {/* Health Score + Fast Track Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ListingHealthScore properties={healthProperties} />

            {/* List in 60 Seconds Fast Track */}
            <Link
              href="/list-your-property/create?fast=true"
              className="group relative bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-24 bg-white/10 blur-3xl rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Rocket className="w-5 h-5 text-white group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">List in 60 Seconds</h3>
                    <p className="text-white/60 text-xs">AI-powered fast-track listing</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  Let AI auto-fill your listing from just a few photos and an address. Our system generates descriptions, pricing suggestions, and amenity detection.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  Start Fast Track →
                </span>
              </div>
            </Link>
          </div>

          {/* Listings List - Streaming */}
          <div className="mb-8 mt-16 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Your Properties
                  <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                    Managed
                  </span>
              </h2>
          </div>

          <Suspense fallback={<ListSkeleton />}>
             <PropertiesList userId={session.user.id!} />
          </Suspense>

       </MaxWidthContainer>
    </div>
  );
}
