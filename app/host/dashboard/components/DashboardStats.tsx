import { getPrismaClient } from '@/lib/prisma';
import { Home, BarChart3, Eye, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

export async function DashboardStats({ userId }: { userId: string }) {
  try {
    const prisma = getPrismaClient();
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms));

    let propertiesCount = 0, activeBookings = 0, totalRevenue = 0, monthRevenue = 0, views = 0;

    await Promise.race([
      (async () => {
        const hostProfile = await prisma.propertyOwner.findFirst({
          where: { userId },
          select: { id: true },
        });
        const ownerId = hostProfile?.id;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [count, bookings, revenueAll, revenue30d, viewsAgg] = await Promise.all([
          prisma.property.count({ where: { owner: { userId } } }),

          ownerId
            ? prisma.propertyBooking.count({
                where: {
                  property: { ownerId },
                  status: { in: ['confirmed', 'pending'] },
                  endDate: { gte: new Date() },
                },
              })
            : Promise.resolve(0),

          ownerId
            ? prisma.propertyBooking.aggregate({
                where: {
                  property: { ownerId },
                  status: { in: ['completed', 'confirmed'] },
                },
                _sum: { totalPrice: true },
              })
            : Promise.resolve({ _sum: { totalPrice: null } }),

          ownerId
            ? prisma.propertyBooking.aggregate({
                where: {
                  property: { ownerId },
                  status: { in: ['completed', 'confirmed'] },
                  createdAt: { gte: thirtyDaysAgo },
                },
                _sum: { totalPrice: true },
              })
            : Promise.resolve({ _sum: { totalPrice: null } }),

          ownerId
            ? prisma.property.aggregate({
                where: { ownerId },
                _sum: { viewCount: true },
              })
            : Promise.resolve({ _sum: { viewCount: null } }),
        ]);

        propertiesCount = count;
        activeBookings = bookings;
        totalRevenue = Number(revenueAll._sum.totalPrice || 0);
        monthRevenue = Number(revenue30d._sum.totalPrice || 0);
        views = viewsAgg._sum.viewCount || 0;
      })(),
      timeout(8000),
    ]);

    const stats = [
      {
        label: 'Total Listings',
        value: propertiesCount,
        period: 'All time',
        icon: Home,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        gradient: 'from-blue-500 to-blue-600',
      },
      {
        label: 'Active Bookings',
        value: activeBookings,
        period: 'Current',
        icon: BarChart3,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        gradient: 'from-emerald-500 to-emerald-600',
      },
      {
        label: 'Revenue (30d)',
        value: `$${monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        period: 'Last 30 days',
        icon: DollarSign,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        gradient: 'from-amber-500 to-amber-600',
        subtext: totalRevenue > 0 ? `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} all time` : undefined,
      },
      {
        label: 'Total Views',
        value: views.toLocaleString(),
        period: 'All time',
        icon: Eye,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        gradient: 'from-purple-500 to-purple-600',
      },
    ];

    // Smart Opportunities — data-driven
    const opportunities: {
      id: string;
      title: string;
      description: string;
      action: string;
      href: string;
      icon: typeof TrendingUp;
      color: string;
      bg: string;
    }[] = [];

    const occupancyRate =
      propertiesCount > 0 && activeBookings > 0
        ? Math.min(Math.round((activeBookings / propertiesCount) * 100), 100)
        : 0;

    if (propertiesCount > 0 && occupancyRate < 45) {
      const diff = 45 - occupancyRate;
      opportunities.push({
        id: 'price-drop',
        title: 'Boost Occupancy',
        description: `Your occupancy is ${diff}% below the market average. Try adjusting your weekday pricing or enabling instant booking.`,
        action: 'Adjust Pricing',
        href: '/host/properties',
        icon: TrendingUp,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      });
    }

    if (propertiesCount > 0 && propertiesCount < 3) {
      opportunities.push({
        id: 'add-property',
        title: 'Expand Your Portfolio',
        description:
          'Hosts with 3+ properties earn 2.5x more revenue on average. Add another listing to diversify.',
        action: 'List Property',
        href: '/list-your-property/create',
        icon: Sparkles,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
      });
    }

    if (views === 0 && propertiesCount > 0) {
      opportunities.push({
        id: 'improve-listing',
        title: 'Improve Visibility',
        description: 'Your listings have no views yet. Add high-quality photos and a detailed description to get discovered.',
        action: 'Edit Listings',
        href: '/host/properties',
        icon: Eye,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      });
    }

    return (
      <div className="space-y-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative overflow-hidden p-5 md:p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className={`absolute top-0 right-0 p-20 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-10 -mt-10 blur-2xl`}
              />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div
                  className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  {stat.period}
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-2xl md:text-3xl font-black text-gray-900 mb-0.5 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                {stat.subtext && (
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">{stat.subtext}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Smart Opportunities — only if some exist */}
        {opportunities.length > 0 && (
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Smart Insights</h3>
                  <p className="text-white/50 text-sm">Data-driven tips to grow</p>
                </div>
              </div>

              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={opp.href}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors cursor-pointer group/item block"
                  >
                    <div className={`p-3 rounded-xl ${opp.bg} ${opp.color} h-fit`}>
                      <opp.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white group-hover/item:text-primary-400 transition-colors">
                          {opp.title}
                        </h4>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg text-white/80">
                          {opp.action}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{opp.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (e) {
    console.error('DashboardStats Error:', e);
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-8">Failed to load stats.</div>
    );
  }
}
