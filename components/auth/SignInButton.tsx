'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, BookmarkIcon, Bell, History } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function SignInButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (session) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-1 pr-4 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="h-8 w-8 rounded-full border-2 border-white"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          )}
          <span className="text-sm font-semibold hidden sm:inline">
            {session.user.name?.split(' ')[0] || 'Account'}
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
            {/* User Info */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-12 w-12 rounded-full border-2 border-white shadow"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/account');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <User className="h-4 w-4 text-blue-600" />
                <span>My Account</span>
              </button>

              <button
                onClick={() => {
                  router.push('/account/searches');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <BookmarkIcon className="h-4 w-4 text-green-600" />
                <span>Saved Searches</span>
              </button>

              <button
                onClick={() => {
                  router.push('/account/alerts');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <Bell className="h-4 w-4 text-orange-600" />
                <span>Price Alerts</span>
              </button>

              <button
                onClick={() => {
                  router.push('/account/bookings');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <History className="h-4 w-4 text-purple-600" />
                <span>Booking History</span>
              </button>

              <button
                onClick={() => {
                  router.push('/account/preferences');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span>Preferences</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t py-2">
              <button
                onClick={() => {
                  signOut({ callbackUrl: '/' });
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/auth/signin')}
      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
    >
      <User className="h-4 w-4" />
      Sign In
    </button>
  );
}
