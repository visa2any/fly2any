import { getPrismaClient } from '@/lib/prisma';
import { LogIn, LogOut, Home, CalendarDays } from 'lucide-react';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';

export async function TodayActivity({ userId }: { userId: string }) {
  try {
    const prisma = getPrismaClient();
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms));

    let checkIns: any[] = [], checkOuts: any[] = [], currentlyHosting = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Promise.race([
      (async () => {
        const hostProfile = await prisma.propertyOwner.findFirst({
          where: { userId },
          select: { id: true },
        });
        const ownerId = hostProfile?.id;
        if (!ownerId) return;

        const [ci, co, hosting] = await Promise.all([
          prisma.propertyBooking.findMany({
            where: {
              property: { ownerId },
              status: { in: ['confirmed'] },
              startDate: { gte: today, lt: tomorrow },
            },
            select: {
              id: true,
              user: { select: { name: true } },
              property: { select: { name: true } },
            },
            take: 5,
          }),
          prisma.propertyBooking.findMany({
            where: {
              property: { ownerId },
              status: { in: ['confirmed', 'completed'] },
              endDate: { gte: today, lt: tomorrow },
            },
            select: {
              id: true,
              user: { select: { name: true } },
              property: { select: { name: true } },
            },
            take: 5,
          }),
          prisma.propertyBooking.count({
            where: {
              property: { ownerId },
              status: 'confirmed',
              startDate: { lte: today },
              endDate: { gte: today },
            },
          }),
        ]);
        checkIns = ci;
        checkOuts = co;
        currentlyHosting = hosting;
      })(),
      timeout(8000),
    ]);

    const hasActivity = checkIns.length > 0 || checkOuts.length > 0 || currentlyHosting > 0;

    return (
      <AnimatedFadeIn delay={0.1}>
        <div className="bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 h-full">
          <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-5">
            <div className="p-3 rounded-2xl bg-info-50">
              <CalendarDays className="w-6 h-6 text-info-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight text-midnight-navy mb-0.5">Today&apos;s Activity</h3>
              <p className="text-sm font-medium text-neutral-400">
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {!hasActivity ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 font-medium">No activity today — enjoy your day! ☀️</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Check-ins */}
            <AnimatedFadeIn delay={0.3}>
              <div className="text-center p-6 rounded-[1.5rem] bg-success-50/60 border border-success-100 h-full flex flex-col items-center justify-center hover:bg-success-50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-3">
                  <LogIn className="w-6 h-6 text-success-600" />
                </div>
                <div className="text-3xl font-black text-success-700 tracking-tight">{checkIns.length}</div>
                <div className="text-sm font-bold text-success-600 mt-1">Check-ins</div>
              </div>
            </AnimatedFadeIn>

            {/* Check-outs */}
            <AnimatedFadeIn delay={0.4}>
              <div className="text-center p-6 rounded-[1.5rem] bg-warning-50/60 border border-warning-100 h-full flex flex-col items-center justify-center hover:bg-warning-50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-3">
                  <LogOut className="w-6 h-6 text-warning-600" />
                </div>
                <div className="text-3xl font-black text-warning-700 tracking-tight">{checkOuts.length}</div>
                <div className="text-sm font-bold text-warning-600 mt-1">Check-outs</div>
              </div>
            </AnimatedFadeIn>

            {/* Currently hosting */}
            <AnimatedFadeIn delay={0.5}>
              <div className="text-center p-6 rounded-[1.5rem] bg-info-50/60 border border-info-100 h-full flex flex-col items-center justify-center hover:bg-info-50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-info-100 flex items-center justify-center mx-auto mb-3">
                  <Home className="w-6 h-6 text-info-600" />
                </div>
                <div className="text-3xl font-black text-info-700 tracking-tight">{currentlyHosting}</div>
                <div className="text-sm font-bold text-info-600 mt-1">Hosting Now</div>
              </div>
            </AnimatedFadeIn>
          </div>
        )}

        {/* Guest details for check-ins */}
        {checkIns.length > 0 && (
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Arriving today</p>
            <div className="space-y-2">
              {checkIns.map((b, i) => (
                <AnimatedFadeIn key={b.id} delay={0.6 + i * 0.1}>
                  <div className="flex items-center justify-between text-base py-1">
                    <span className="font-bold text-midnight-navy">{b.user?.name || 'Guest'}</span>
                    <span className="text-sm font-medium text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full">{b.property?.name}</span>
                  </div>
                </AnimatedFadeIn>
              ))}
            </div>
          </div>
        )}
      </div>
      </AnimatedFadeIn>
    );
  } catch (e) {
    console.error('TodayActivity Error:', e);
    return null;
  }
}
