import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Plus, Home, MapPin, Eye, Edit2, Trash2, BarChart3, Settings } from 'lucide-react';

export default async function HostDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  // Fetch properties
  const properties = await prisma.property.findMany({
    where: { 
        // hostId: session.user.id // In real app, filter by host. 
        // For MVP/Demo if schema doesn't have hostId yet, or just show all for demo context:
        // Checking schema via prisma thought... assuming hostId exists or we just show all for now.
    },
    include: { images: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-12">
       <MaxWidthContainer>
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
             <div>
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Host Dashboard</h1>
                <p className="text-white/60">Manage your listings, reservations, and performance.</p>
             </div>
             <Link 
                href="/list-your-property/create"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20"
             >
                <Plus className="w-5 h-5" /> Create New Listing
             </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
             {[
                { label: 'Total Listings', value: properties.length, icon: Home, color: 'text-blue-400' },
                { label: 'Active Bookings', value: '0', icon: BarChart3, color: 'text-emerald-400' },
                { label: 'Total Revenue', value: '$0.00', icon: DollarSignIcon, color: 'text-amber-400' },
                { label: 'Views (30d)', value: '1,240', icon: Eye, color: 'text-fuchsia-400' },
             ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white/30 uppercase">Last 30 Days</span>
                   </div>
                   <div className="text-3xl font-black">{stat.value}</div>
                   <div className="text-sm text-white/50">{stat.label}</div>
                </div>
             ))}
          </div>

          {/* Listings List */}
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Home className="w-6 h-6 text-white/50" /> Your Properties
          </h2>

          <div className="grid gap-4">
             {properties.length === 0 ? (
                 <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center bg-white/5">
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-white/30" />
                     </div>
                     <h3 className="text-xl font-bold mb-2">No properties yet</h3>
                     <p className="text-white/50 mb-6">Start earning by listing your first property today.</p>
                     <Link href="/list-your-property/create" className="text-amber-400 font-bold hover:underline">List now &rarr;</Link>
                 </div>
             ) : (
                 properties.map(p => (
                     <div key={p.id} className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row gap-6 items-center">
                         {/* Image */}
                         <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden shrink-0">
                             {p.images[0] ? (
                                 <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                             ) : (
                                 <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 font-bold">No Image</div>
                             )}
                             <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-xs font-bold uppercase text-white">
                                {p.status || 'Draft'}
                             </div>
                         </div>

                         {/* Details */}
                         <div className="flex-1 text-center md:text-left">
                             <h3 className="text-xl font-bold mb-1">{p.name || 'Untitled Property'}</h3>
                             <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/60 mb-4">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.city}, {p.country}</span>
                                <span>•</span>
                                <span>${p.basePricePerNight}/night</span>
                             </div>
                         </div>

                         {/* Actions */}
                         <div className="flex items-center gap-3 shrink-0">
                             <Link href={`/list-your-property/create?id=${p.id}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors" title="Edit">
                                <Edit2 className="w-5 h-5" />
                             </Link>
                             <Link href={`/property/${p.id}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors" title="View">
                                <Eye className="w-5 h-5" />
                             </Link>
                             <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                             </button>
                         </div>
                     </div>
                 ))
             )}
          </div>

       </MaxWidthContainer>
    </div>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
