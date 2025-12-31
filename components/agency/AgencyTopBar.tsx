'use client';

// components/agency/AgencyTopBar.tsx
// Level 6 Ultra-Premium Agency Top Bar
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AgencyTopBarProps {
  agent: {
    id: string;
    agencyName?: string | null;
    businessName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AgencyTopBar({ agent, user }: AgencyTopBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = agent.firstName
    ? `${agent.firstName} ${agent.lastName || ''}`.trim()
    : user.name || 'Agency Owner';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team, clients, quotes..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {displayName.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">Agency Owner</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <Link
                        href="/agency/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Agency Settings
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
