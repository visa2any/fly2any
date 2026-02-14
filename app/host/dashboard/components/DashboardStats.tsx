
  import { prisma } from '@/lib/prisma';
  import { Home, BarChart3, Eye, DollarSign } from 'lucide-react';
  
  export async function DashboardStats({ userId }: { userId: string }) {
      // Simulate slow data fetch to verify streaming if needed, but for now just fetch
      // In a real app, these might be separate heavy queries
      
      const propertiesCount = await prisma.property.count({
          where: { 
              // hostId: userId 
          }
      });
      
      // Mock other stats for now as schema might not support them yet
      const activeBookings = 0;
      const totalRevenue = 0;
      const views = 1240;
  
      const stats = [
          { 
              label: 'Total Listings', 
              value: propertiesCount, 
              icon: Home, 
              color: 'text-blue-600', 
              bg: 'bg-blue-50',
              gradient: 'from-blue-500 to-blue-600'
          },
          { 
              label: 'Active Bookings', 
              value: activeBookings, 
              icon: BarChart3, 
              color: 'text-emerald-600', 
              bg: 'bg-emerald-50',
              gradient: 'from-emerald-500 to-emerald-600'
          },
          { 
              label: 'Total Revenue', 
              value: `$${totalRevenue.toFixed(2)}`, 
              icon: DollarSign, 
              color: 'text-amber-600', 
              bg: 'bg-amber-50',
              gradient: 'from-amber-500 to-amber-600'
          },
          { 
              label: 'Views (30d)', 
              value: views.toLocaleString(), 
              icon: Eye, 
              color: 'text-purple-600', 
              bg: 'bg-purple-50',
              gradient: 'from-purple-500 to-purple-600'
          },
      ];
  
      return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
             {stats.map((stat, i) => (
                <div key={i} className="relative overflow-hidden p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                   <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-10 -mt-10 blur-2xl`}></div>
                   
                   <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">LAST 30 DAYS</span>
                   </div>
                   
                   <div className="relative z-10">
                        <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                        <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                   </div>
                </div>
             ))}
          </div>
      );
  }
