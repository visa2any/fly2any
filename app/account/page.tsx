import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';
import {
  BookmarkIcon,
  Bell,
  History,
  Settings,
  TrendingDown,
  Sparkles,
  Calendar,
  MapPin,
  MessageCircle,
  Heart,
  Star,
  Gift,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';
import LoyaltyPointsWidget from '@/components/loyalty/LoyaltyPointsWidget';
import { SignOutButton } from '@/components/account/SignOutButton';

// Force Node.js runtime (required for Prisma database access)
export const runtime = 'nodejs';

// Note: dynamic = 'force-dynamic' removed for mobile build compatibility
// Mobile apps will handle auth client-side

export default async function AccountPage() {
  // Check if database is configured (Supabase, Neon, or legacy Vercel Postgres)
  const isDatabaseConfigured = !!(process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL);

  let session = null;
  let savedSearches: any[] = [];
  let priceAlerts: any[] = [];
  let preferences = null;
  let aiConversationsCount = 0;
  let wishlistCount = 0;
  let bookingsCount = 0;

  try {
    if (isDatabaseConfigured && prisma) {
      session = await auth();

      if (!session || !session.user) {
        redirect('/auth/signin');
      }

      // Ensure session.user has required properties
      if (!session.user.id) {
        console.error('Session user missing ID:', session.user);
        redirect('/auth/signin');
      }

      // Fetch user data - all at once for performance
      const [
        savedSearchesResult,
        priceAlertsResult,
        preferencesResult,
        aiConversationsResult,
        wishlistResult,
        bookingsResult
      ] = await Promise.all([
        prisma.savedSearch.findMany({
          where: { userId: session.user.id },
          orderBy: { lastSearched: 'desc' },
          take: 5,
        }),
        prisma.priceAlert.findMany({
          where: { userId: session.user.id, active: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.userPreferences.findUnique({
          where: { userId: session.user.id },
        }),
        (prisma as any).aIConversation?.count({
          where: { userId: session.user.id },
        }).catch(() => 0) ?? Promise.resolve(0),
        // Fetch wishlist count from Prisma
        prisma.wishlistItem.count({
          where: { userId: session.user.id },
        }).catch(() => 0),
        // Fetch bookings count from SQL storage (not Prisma)
        bookingStorage.count({ userId: session.user.id }).catch(() => 0),
      ]);

      savedSearches = savedSearchesResult;
      priceAlerts = priceAlertsResult;
      preferences = preferencesResult;
      aiConversationsCount = aiConversationsResult || 0;
      wishlistCount = wishlistResult || 0;
      bookingsCount = bookingsResult || 0;
    }
  } catch (error) {
    console.error('Account page error:', error);
    // Continue with empty data
  }

  const stats = {
    savedSearches: savedSearches.length,
    activeAlerts: priceAlerts.filter((a: any) => a.active).length,
    triggeredAlerts: priceAlerts.filter((a: any) => a.triggered).length,
    aiConversations: aiConversationsCount,
    wishlist: wishlistCount,
    bookings: bookingsCount,
  };

  return (
    <div className="w-full">
      {/* Database Not Configured Notice */}
      {!isDatabaseConfigured && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800">
                Account Features Temporarily Unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">
                  The account system requires database configuration to store your saved searches, price alerts, and preferences.
                </p>
                <p className="font-medium">
                  You can still search for flights and hotels! Account features will be available once the database is set up.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Search Flights & Hotels
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section - Level-6: Edge-to-edge mobile, compact */}
      {session && session.user && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-2xl p-4 md:p-6 lg:p-8 text-white mb-3 md:mb-6 shadow-lg md:shadow-xl">
          <div className="flex items-center gap-3 md:gap-6">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-white/90 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl md:text-3xl font-bold border-2 md:border-4 border-white/90">
                {session.user.name?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-0.5 md:mb-2 truncate">
                Welcome, {session.user.name?.split(' ')[0] || 'Traveler'}!
              </h1>
              <p className="text-white/80 text-xs md:text-sm lg:text-base truncate">
                Manage searches, track prices & plan adventures
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Points Widget */}
      <div className="mb-3 md:mb-6 px-3 md:px-0">
        <LoyaltyPointsWidget showRedeemButton={true} />
      </div>

      {/* Quick Stats - Level-6: Horizontal scroll mobile, grid desktop */}
      <div className="mb-3 md:mb-6">
        <div className="flex md:grid md:grid-cols-5 gap-2 md:gap-4 overflow-x-auto scrollbar-hide px-3 md:px-0 pb-2 md:pb-0">
          <Link
            href="/account/wishlist"
            className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-pink-400 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 bg-pink-50 rounded-lg">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-neutral-800">{stats.wishlist}</span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-neutral-800">Wishlist</h3>
            <p className="text-[10px] md:text-xs text-neutral-500">Saved items</p>
          </Link>

          <Link
            href="/account/searches"
            className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-primary-400 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 bg-primary-50 rounded-lg">
                <BookmarkIcon className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-neutral-800">{stats.savedSearches}</span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-neutral-800">Searches</h3>
            <p className="text-[10px] md:text-xs text-neutral-500">Saved routes</p>
          </Link>

          <Link
            href="/account/alerts"
            className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-secondary-400 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 bg-secondary-50 rounded-lg">
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-secondary-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-neutral-800">{stats.activeAlerts}</span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-neutral-800">Alerts</h3>
            <p className="text-[10px] md:text-xs text-neutral-500">
              {stats.triggeredAlerts > 0 ? (
                <span className="text-green-600 font-semibold">{stats.triggeredAlerts} triggered</span>
              ) : 'Price drops'}
            </p>
          </Link>

          <Link
            href="/account/bookings"
            className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-purple-400 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 bg-purple-50 rounded-lg">
                <History className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-neutral-800">{stats.bookings}</span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-neutral-800">Bookings</h3>
            <p className="text-[10px] md:text-xs text-neutral-500">Travel history</p>
          </Link>

          <Link
            href="/account/conversations"
            className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-green-400 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 bg-green-50 rounded-lg">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-neutral-800">{stats.aiConversations || 0}</span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-neutral-800">AI Chats</h3>
            <p className="text-[10px] md:text-xs text-neutral-500">Chat history</p>
          </Link>
        </div>
      </div>

      {/* Main Content Grid - Level-6: Stack on mobile, side-by-side desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0.5 md:gap-4 lg:gap-6">
        {/* Recent Saved Searches */}
        <div className="bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-sm md:text-lg font-bold text-neutral-800 flex items-center gap-1.5 md:gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
              Recent Searches
            </h2>
            <Link
              href="/account/searches"
              className="text-xs md:text-sm text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              View All →
            </Link>
          </div>

          {savedSearches.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <BookmarkIcon className="w-10 h-10 md:w-12 md:h-12 text-neutral-300 mx-auto mb-2 md:mb-3" />
              <p className="text-neutral-500 text-sm mb-3 md:mb-4">No saved searches yet</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 transition-all duration-150 active:scale-[0.98]"
              >
                Start Searching
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((search: any) => (
                <Link
                  key={search.id}
                  href={`/flights/results?from=${search.origin}&to=${search.destination}&departure=${search.departDate}&return=${search.returnDate || ''}&adults=${search.adults}&children=${search.children}&infants=${search.infants}&class=${search.cabinClass}`}
                  className="block p-3 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-all duration-150 border border-neutral-200 hover:border-primary-300 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      {search.origin} → {search.destination}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(search.lastSearched).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(search.departDate).toLocaleDateString()}
                    </span>
                    <span>{search.adults} pax</span>
                    <span className="capitalize">{search.cabinClass}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Price Alerts */}
        <div className="bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-sm md:text-lg font-bold text-neutral-800 flex items-center gap-1.5 md:gap-2">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              Price Alerts
            </h2>
            <Link
              href="/account/alerts"
              className="text-xs md:text-sm text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              View All →
            </Link>
          </div>

          {priceAlerts.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Bell className="w-10 h-10 md:w-12 md:h-12 text-neutral-300 mx-auto mb-2 md:mb-3" />
              <p className="text-neutral-500 text-sm mb-3 md:mb-4">No price alerts set</p>
              <Link
                href="/account/alerts"
                className="inline-block px-4 py-2 bg-secondary-500 text-white text-sm rounded-xl hover:bg-secondary-600 transition-all duration-150 active:scale-[0.98]"
              >
                Create Alert
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {priceAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.triggered
                      ? 'bg-green-50 border-green-300'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                      <MapPin className="w-3.5 h-3.5 text-secondary-500" />
                      {alert.origin} → {alert.destination}
                    </div>
                    {alert.triggered && (
                      <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        TRIGGERED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Target: <span className="font-semibold text-neutral-700">${alert.targetPrice.toFixed(0)}</span></span>
                    <span>Current: <span className="font-semibold text-neutral-700">${alert.currentPrice.toFixed(0)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Level-6 */}
      <div className="mt-3 md:mt-6 bg-white md:rounded-xl border-y md:border-2 border-neutral-200 p-3 md:p-5 shadow-sm">
        <h2 className="text-sm md:text-lg font-bold text-neutral-800 mb-3 md:mb-4 px-0.5">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Link
            href="/account/profile"
            className="flex items-center gap-2 md:gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-blue-50 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border border-neutral-200 hover:border-blue-300 active:scale-[0.98]"
          >
            <div className="p-2 md:p-2.5 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-800 text-sm">Profile</h3>
              <p className="text-[10px] md:text-xs text-neutral-500 truncate">Edit info</p>
            </div>
          </Link>

          <Link
            href="/account/preferences"
            className="flex items-center gap-2 md:gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-primary-50 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border border-neutral-200 hover:border-primary-300 active:scale-[0.98]"
          >
            <div className="p-2 md:p-2.5 bg-primary-50 rounded-lg">
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-800 text-sm">Preferences</h3>
              <p className="text-[10px] md:text-xs text-neutral-500 truncate">Customize</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 md:gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-green-50 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border border-neutral-200 hover:border-green-300 active:scale-[0.98]"
          >
            <div className="p-2 md:p-2.5 bg-green-50 rounded-lg">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-800 text-sm">Find Flights</h3>
              <p className="text-[10px] md:text-xs text-neutral-500 truncate">Search trips</p>
            </div>
          </Link>

          {/* Sign Out Button - Client Component */}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
