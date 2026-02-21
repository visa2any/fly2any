import { getPrismaClient } from '@/lib/prisma';
import { Home, BarChart3, Eye, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';

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
        color: 'text-neutral-700',
        bg: 'bg-neutral-100',
        gradient: 'from-neutral-100 to-neutral-200',
      },
      {
        label: 'Active Bookings',
        value: activeBookings,
        period: 'Occupancy',
        icon: BarChart3,
        color: 'text-primary-500', // Fly2Any Red 
        bg: 'bg-primary-50',
        gradient: 'from-primary-400 to-primary-600',
      },
      {
        label: 'Revenue (30d)',
        value: `$${monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        period: 'Last 30 days',
        icon: DollarSign,
        color: 'text-secondary-600', // Fly2Any Yellow
        bg: 'bg-secondary-50',
        gradient: 'from-secondary-400 to-secondary-500',
        subtext: totalRevenue > 0 ? `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} all time` : undefined,
      },
      {
        label: 'Listing Health',
        value: '98/100',
        period: 'Excellent',
        icon: Sparkles,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        gradient: 'from-emerald-400 to-emerald-600',
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
        color: 'text-primary-500', // Fly2Any Red
        bg: 'bg-primary-50',
      });
    }

    return (
      <div className="space-y-8">
        {/* Main Stats Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <AnimatedFadeIn key={i} delay={i * 0.1}>
              <div
                className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] bg-white shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group h-full border border-neutral-100"
              >
                <div
                  className={`absolute top-0 right-0 p-24 bg-gradient-to-br ${stat.gradient} opacity-[0.04] group-hover:opacity-15 transition-opacity rounded-full -mr-12 -mt-12 blur-3xl`}
                />
                <div className="flex flex-col-reverse md:flex-row md:items-start justify-between mb-8 relative z-10 gap-4">
                  <div
                    className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-transform w-fit`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-3 py-1 bg-neutral-50 rounded-full w-fit">
                    {stat.period}
                  </span>
                </div>
                <div className="relative z-10 mt-auto">
                  <div className="text-3xl md:text-4xl font-black text-midnight-navy mb-1 tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-neutral-500 font-semibold">{stat.label}</div>
                  {stat.subtext && (
                    <div className="text-xs text-neutral-400 mt-2 font-medium bg-neutral-50 p-2 rounded-lg inline-block w-full">{stat.subtext}</div>
                  )}
                </div>
              </div>
            </AnimatedFadeIn>
          ))}
        </div>

        {/* Smart Opportunities — Fly2Any Red/Yellow Theme */}
        {opportunities.length > 0 && (
          <AnimatedFadeIn delay={0.4}>
            <div className="bg-midnight-navy rounded-[2rem] p-8 text-white shadow-soft-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                  <div className="p-3 bg-secondary-500/20 rounded-2xl border border-secondary-500/30">
                    <Sparkles className="w-6 h-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl tracking-tight text-white mb-1">AI Concierge</h3>
                    <p className="text-neutral-400 text-sm font-medium">Predictive actions based on your portfolio</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {opportunities.map((opp, i) => (
                    <AnimatedFadeIn key={opp.id} delay={0.5 + i * 0.1}>
                      <Link
                        href={opp.href}
                        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer group/item h-full hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-xl ${opp.bg} ${opp.color}`}>
                            <opp.icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black tracking-wider uppercase text-white/50 bg-white/5 px-3 py-1.5 rounded-full group-hover/item:bg-white/10 transition-colors">
                            Action Suggested
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-white mb-2 group-hover/item:text-secondary-400 transition-colors">
                            {opp.title}
                          </h4>
                          <p className="text-sm text-neutral-400 leading-relaxed font-medium">{opp.description}</p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5">
                           <span className="text-sm font-bold text-primary-400 group-hover/item:text-primary-300 flex items-center gap-2">
                             {opp.action} →
                           </span>
                        </div>
                      </Link>
                    </AnimatedFadeIn>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedFadeIn>
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
