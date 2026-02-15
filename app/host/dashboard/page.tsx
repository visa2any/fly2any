import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Plus } from 'lucide-react';

import { DashboardStats } from './components/DashboardStats';
import { PropertiesList } from './components/PropertiesList';
import { StatsSkeleton, ListSkeleton } from './components/DashboardSkeleton';

export const dynamic = 'force-dynamic';

export default async function HostDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  
  // Strict check for user ID to prevent Prisma crashes (Error #419)
  if (!session.user.id) {
    throw new Error("Invalid session: User ID is missing");
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-20">
       
       {/* Host Header - Premium Light Theme */}
       <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 sticky top-0 z-30 supports-[backdrop-filter]:bg-white/60">
           <MaxWidthContainer>
               <div className="flex items-center justify-between h-18 py-3">
                   {/* Logo */}
                   <Link href="/" className="flex items-center gap-2 group">
                       <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-all duration-300">
                           F
                       </div>
                       <span className="font-bold text-xl tracking-tight text-gray-900">Fly2Any<span className="text-primary-600">Host</span></span>
                   </Link>

                   {/* User Profile */}
                   <div className="flex items-center gap-5">
                       <div className="hidden md:block text-right">
                           <p className="text-sm font-bold text-gray-900 leading-tight">{session.user.name}</p>
                           <div className="flex items-center justify-end gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SUPERHOST</p>
                           </div>
                       </div>
                       <div className="relative group cursor-pointer">
                            <Link href="/account" className="block relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                                {session.user.image && session.user.image.startsWith('http') ? (
                                    <Image 
                                        src={session.user.image} 
                                        alt={session.user.name || 'User'} 
                                        width={42} 
                                        height={42} 
                                        className="relative rounded-full border-2 border-white shadow-sm"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="relative w-10.5 h-10.5 rounded-full bg-neutral-100 flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm">
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                )}
                            </Link>
                       </div>
                   </div>
               </div>
           </MaxWidthContainer>
       </header>

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

          {/* Stats Grid - Streaming */}
          <Suspense fallback={<StatsSkeleton />}>
              <DashboardStats userId={session.user.id!} />
          </Suspense>

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

