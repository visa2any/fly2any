"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Settings, User, HelpCircle, LogOut, ChevronDown,
  Wallet, Clock
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

interface AgentTopBarProps {
  agent: {
    id: string;
    tier: string;
    currentBalance?: number;
    availableBalance?: number;
    pendingBalance?: number;
  };
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AgentTopBar({ agent, user }: AgentTopBarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Balance Stats */}
          <div className="flex-1">
            <div className="hidden lg:flex items-center gap-6">
              {agent.availableBalance !== undefined && agent.availableBalance > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">
                    ${agent.availableBalance.toLocaleString()}
                  </span>
                </div>
              )}
              {agent.pendingBalance !== undefined && agent.pendingBalance > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700 font-medium">
                    ${agent.pendingBalance.toLocaleString()} pending
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Create Quote Button */}
            <Link
              href="/agent/quotes/create"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Quote
            </Link>

            {/* Level 6 Notifications Dropdown */}
            <NotificationsDropdown />

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                  {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name || "Agent"}</p>
                  <p className="text-xs text-gray-500">{agent.tier.replace("_", " ")}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/agent/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Settings
                      </Link>
                      <Link
                        href="/agent/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        Help & Support
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
