import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Plus, Home, MapPin, Eye, Edit2, Trash2, BarChart3, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { UserMenu } from '@/components/layout/UserMenu';

export default async function HostDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  // Fetch properties
  const properties = await prisma.property.findMany({
    where: { 
        // hostId: session.user.id // In real app, filter by host. 
    },
    include: { images: true },
    orderBy: { createdAt: 'desc' }
  });

  // Mock translations for UserMenu since this is a server component and we want a quick fix
  const userMenuTranslations = {
    account: 'Account',
    wishlist: 'Wishlist',
    notifications: 'Notifications',
    signin: 'Sign In',
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
       
       {/* Host Header - Light Theme */}
       <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
           <MaxWidthContainer>
               <div className="flex items-center justify-between h-16">
                   {/* Logo */}
                   <Link href="/" className="flex items-center gap-2 group">
                       <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all">
                           F
                       </div>
                       <span className="font-bold text-xl tracking-tight text-gray-900">Fly2Any<span className="text-primary-600">Host</span></span>
                   </Link>

                   {/* User Profile */}
                   <div className="flex items-center gap-4">
                       <div className="hidden md:block text-right">
                           <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
                           <p className="text-xs text-gray-500">Host Account</p>
                       </div>
                       <div className="relative">
                            {/* We can use UserMenu here if compatible, or a simple avatar link */}
                            <Link href="/account" className="block relative">
                                {session.user.image ? (
                                    <Image 
                                        src={session.user.image} 
                                        alt={session.user.name || 'User'} 
                                        width={40} 
                                        height={40} 
                                        className="rounded-full border-2 border-white shadow-sm hover:ring-2 hover:ring-primary-500 transition-all"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm">
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                )}
                            </Link>
                       </div>
                   </div>
               </div>
           </MaxWidthContainer>
       </header>

       <MaxWidthContainer className="py-12">
          
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {session.user.name?.split(' ')[0]}. Here's what's happening with your listings.</p>
             </div>
             <Link 
                href="/list-your-property/create"
                className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-neutral-900/20"
             >
                <Plus className="w-5 h-5" /> Create New Listing
             </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
             {[
                { label: 'Total Listings', value: properties.length, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Bookings', value: '0', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Total Revenue', value: '$0.00', icon: DollarSignIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Views (30d)', value: '1,240', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
             ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Last 30 Days</span>
                   </div>
                   <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                   <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
             ))}
          </div>

          {/* Listings List */}
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="w-6 h-6 text-gray-400" /> Your Properties
              </h2>
          </div>

          <div className="grid gap-4">
             {properties.length === 0 ? (
                 <div className="p-12 rounded-2xl border-2 border-dashed border-neutral-200 text-center bg-white">
                     <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-gray-300" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
                     <p className="text-gray-500 mb-6 max-w-md mx-auto">Start earning by listing your first property today. It only takes a few minutes.</p>
                     <Link href="/list-your-property/create" className="text-primary-600 font-bold hover:underline">List now &rarr;</Link>
                 </div>
             ) : (
                 properties.map(p => (
                     <div key={p.id} className="group p-4 rounded-2xl bg-white border border-neutral-200 hover:border-primary-200 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center">
                         {/* Image */}
                         <div className="relative w-full md:w-64 h-48 md:h-40 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                             {p.images[0] ? (
                                 <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                     <CameraOff className="w-8 h-8 opacity-50" />
                                     <span className="text-xs font-bold uppercase">No Image</span>
                                 </div>
                             )}
                             <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur text-xs font-bold uppercase text-gray-900 shadow-sm">
                                {p.status || 'Draft'}
                             </div>
                         </div>

                         {/* Details */}
                         <div className="flex-1 text-center md:text-left w-full">
                             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                                 <div>
                                     <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{p.name || 'Untitled Property'}</h3>
                                     <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.city || 'No Location'}, {p.country}</span>
                                        <span>•</span>
                                        <span className="text-gray-900 font-semibold">${p.basePricePerNight}/night</span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex items-center justify-center md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100 w-full">
                                 <Link 
                                    href={`/list-your-property/create?id=${p.id}`}
                                    className="px-4 py-2 rounded-lg bg-neutral-50 text-gray-700 font-semibold hover:bg-neutral-100 transition-colors flex items-center gap-2 border border-neutral-200"
                                 >
                                     <Edit2 className="w-4 h-4" /> Edit
                                 </Link>
                                 <button className="px-4 py-2 rounded-lg bg-white text-red-500 font-semibold hover:bg-red-50 transition-colors flex items-center gap-2 border border-neutral-200 hover:border-red-100">
                                     <Trash2 className="w-4 h-4" /> Delete
                                 </button>
                             </div>
                         </div>
                     </div>
                 ))
             )}
          </div>
       </MaxWidthContainer>
    </div>
  );
}

// Icon Helper
function DollarSignIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

function CameraOff(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
        </svg>
    )
}
