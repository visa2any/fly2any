import { prisma } from '@/lib/prisma';
import { LogIn, LogOut, Home, CalendarDays } from 'lucide-react';

export async function TodayActivity({ userId }: { userId: string }) {
  try {
    const hostProfile = await prisma.propertyOwner.findFirst({
      where: { userId },
      select: { id: true },
    });
    const ownerId = hostProfile?.id;
    if (!ownerId) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [checkIns, checkOuts, currentlyHosting] = await Promise.all([
      // Bookings starting today
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
      // Bookings ending today
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
      // Currently hosting (started before today, ends after today)
      prisma.propertyBooking.count({
        where: {
          property: { ownerId },
          status: 'confirmed',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
    ]);

    const hasActivity = checkIns.length > 0 || checkOuts.length > 0 || currentlyHosting > 0;

    return (
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-50">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Today&apos;s Activity</h3>
            <p className="text-xs text-gray-400">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {!hasActivity ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 font-medium">No activity today — enjoy your day! ☀️</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Check-ins */}
            <div className="text-center p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <LogIn className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{checkIns.length}</div>
              <div className="text-xs font-medium text-emerald-600 mt-0.5">Check-ins</div>
            </div>

            {/* Check-outs */}
            <div className="text-center p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <LogOut className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">{checkOuts.length}</div>
              <div className="text-xs font-medium text-amber-600 mt-0.5">Check-outs</div>
            </div>

            {/* Currently hosting */}
            <div className="text-center p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700">{currentlyHosting}</div>
              <div className="text-xs font-medium text-blue-600 mt-0.5">Hosting Now</div>
            </div>
          </div>
        )}

        {/* Guest details for check-ins */}
        {checkIns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Arriving today</p>
            <div className="space-y-1.5">
              {checkIns.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{b.user?.name || 'Guest'}</span>
                  <span className="text-xs text-gray-400">{b.property?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (e) {
    console.error('TodayActivity Error:', e);
    return null;
  }
}
