import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

import { PriorityMessage } from './components/PriorityMessage';
import { SmartPricingBento } from './components/SmartPricingBento';
import { MaintenanceAlert } from './components/MaintenanceAlert';
import { ListingHealthScore } from './components/ListingHealthScore';
import { AIAssistantPill } from './components/AIAssistantPill';
import { DashboardStats } from './components/DashboardStats';
import { StatsSkeleton } from './components/DashboardSkeleton';

export const dynamic = 'force-dynamic';

export default async function HostDashboard() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/host/dashboard');
  }

  const firstName = session.user.name?.split(' ')[0] || 'Sarah';

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-midnight-navy pb-32">
      <MaxWidthContainer className="pt-12 px-8 max-w-[1400px]">
        
        {/* ─── Header Area ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-black text-midnight-navy mb-2 tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="text-neutral-400 font-bold text-sm uppercase tracking-widest">
              Here are your top priorities for today.
            </p>
          </div>
          
          {/* System Status Pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </div>
        </div>

        {/* ─── Zone A: Priority Bento Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1 h-full">
                <PriorityMessage />
            </div>
            <div className="lg:col-span-1 h-full">
                <SmartPricingBento />
            </div>
            <div className="lg:col-span-1 h-full">
                <MaintenanceAlert />
            </div>
        </div>

        {/* ─── Zone B: Stats Row ─── */}
        <div className="mb-12">
            <Suspense fallback={<StatsSkeleton />}>
                <DashboardStats userId={session.user.id!} />
            </Suspense>
        </div>

        {/* ─── Zone C: Insights & Health ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-full">
                <ListingHealthScore />
            </div>
            <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-soft border border-neutral-100 min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-extrabold text-xl tracking-tight text-midnight-navy">Market Activity</h3>
                    <div className="flex gap-2">
                        {['7 D', '1 M', '3 M'].map(t => (
                            <button key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${t === '1 M' ? 'bg-[#0B1221] text-white shadow-md' : 'text-neutral-300 hover:text-midnight-navy'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Empty State / Placeholder for Market Activity */}
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                        <div className="w-8 h-8 rounded-lg border-2 border-neutral-100" />
                    </div>
                    <p className="text-sm font-bold text-neutral-400">Loading market performance data...</p>
                </div>
            </div>
        </div>

        {/* Floating AI Pill */}
        <AIAssistantPill />

      </MaxWidthContainer>
    </div>
  );
}
