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
} from 'lucide-react';
import Link from 'next/link';
import LoyaltyPointsWidget from '@/components/loyalty/LoyaltyPointsWidget';

// Force Node.js runtime (required for Prisma database access)
export const runtime = 'nodejs';

// Note: dynamic = 'force-dynamic' removed for mobile build compatibility
// Mobile apps will handle auth client-side

export default async function AccountPage() {
  // Check if database is configured (Vercel uses POSTGRES_URL, local uses DATABASE_URL)
  const isDatabaseConfigured = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Welcome Section */}
      {session && session.user && (
        <div className="bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-6">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white">
                {session.user.name?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {session.user.name?.split(' ')[0] || 'Traveler'}!
              </h1>
              <p className="text-info-100 text-lg">
                Manage your searches, track prices, and plan your next adventure
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Points Widget - Full Width */}
      <div className="mb-8">
        <LoyaltyPointsWidget showRedeemButton={true} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Link
          href="/account/wishlist"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-pink-400"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-50 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.wishlist}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Wishlist</h3>
          <p className="text-sm text-gray-600">Saved flights & hotels</p>
        </Link>

        <Link
          href="/account/searches"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-400"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-info-50 rounded-lg">
              <BookmarkIcon className="w-6 h-6 text-primary-500" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.savedSearches}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Saved Searches</h3>
          <p className="text-sm text-gray-600">Track your favorite routes</p>
        </Link>

        <Link
          href="/account/alerts"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-orange-400"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.activeAlerts}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Price Alerts</h3>
          <p className="text-sm text-gray-600">
            {stats.triggeredAlerts > 0 && (
              <span className="text-green-600 font-semibold">{stats.triggeredAlerts} triggered!</span>
            )}
            {stats.triggeredAlerts === 0 && 'Get notified of price drops'}
          </p>
        </Link>

        <Link
          href="/account/bookings"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-purple-400"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.bookings}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Bookings</h3>
          <p className="text-sm text-gray-600">View your travel history</p>
        </Link>

        <Link
          href="/account/conversations"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-green-400"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {stats.aiConversations || 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Conversations</h3>
          <p className="text-sm text-gray-600">View chat history</p>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Saved Searches */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Recent Saved Searches
            </h2>
            <Link
              href="/account/searches"
              className="text-sm text-primary-500 hover:text-primary-600 font-semibold"
            >
              View All →
            </Link>
          </div>

          {savedSearches.length === 0 ? (
            <div className="text-center py-8">
              <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No saved searches yet</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start Searching
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search: any) => (
                <Link
                  key={search.id}
                  href={`/flights/results?from=${search.origin}&to=${search.destination}&departure=${search.departDate}&return=${search.returnDate || ''}&adults=${search.adults}&children=${search.children}&infants=${search.infants}&class=${search.cabinClass}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-info-50 transition-colors border border-gray-200 hover:border-info-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      {search.origin} → {search.destination}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(search.lastSearched).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(search.departDate).toLocaleDateString()}
                      {search.returnDate && ` - ${new Date(search.returnDate).toLocaleDateString()}`}
                    </span>
                    <span>{search.adults} adult{search.adults > 1 ? 's' : ''}</span>
                    <span className="capitalize">{search.cabinClass}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Price Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Active Price Alerts
            </h2>
            <Link
              href="/account/alerts"
              className="text-sm text-primary-500 hover:text-primary-600 font-semibold"
            >
              View All →
            </Link>
          </div>

          {priceAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No price alerts set</p>
              <Link
                href="/account/alerts"
                className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Alert
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {priceAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${
                    alert.triggered
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      {alert.origin} → {alert.destination}
                    </div>
                    {alert.triggered && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold">
                        TRIGGERED!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Target: <span className="font-semibold">${alert.targetPrice.toFixed(0)}</span>
                    </span>
                    <span className="text-gray-600">
                      Current: <span className="font-semibold">${alert.currentPrice.toFixed(0)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/account/preferences"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-info-50 transition-colors border border-gray-200 hover:border-info-300"
          >
            <div className="p-3 bg-info-50 rounded-lg">
              <Settings className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Preferences</h3>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-info-50 transition-colors border border-gray-200 hover:border-info-300"
          >
            <div className="p-3 bg-green-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Find Flights</h3>
              <p className="text-sm text-gray-600">Search for your next trip</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
