'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Search, Plus, LayoutDashboard, Menu, X, DollarSign, User, LogIn, Loader2 } from 'lucide-react';
import { zIndex } from '@/lib/design-system';

interface CreditBalance {
  balance: number;
  usdValue: number;
  tier?: string;
}

export default function TripMatchNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tripmatch/browse', label: 'Browse Trips', icon: Search },
    { href: '/tripmatch/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tripmatch/create', label: 'Create Trip', icon: Plus },
  ];

  useEffect(() => {
    checkAuthAndFetchCredits();
  }, []);

  const checkAuthAndFetchCredits = async () => {
    try {
      setLoading(true);

      // Fetch credits (will return 401 if not authenticated)
      const response = await fetch('/api/user/credits');

      if (response.ok) {
        const data = await response.json();
        setCredits(data.data);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setCredits(null);
      } else {
        setIsAuthenticated(false);
        setCredits(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setCredits(null);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Get tier badge color
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'from-slate-400 to-slate-200';
      case 'gold': return 'from-yellow-500 to-yellow-300';
      case 'silver': return 'from-gray-400 to-gray-200';
      default: return 'from-amber-600 to-amber-400';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10 sticky top-0 backdrop-blur-sm" style={{ zIndex: zIndex.FIXED }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/tripmatch" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white">TripMatch</span>
              <div className="text-xs text-purple-400 font-bold">Social Travel</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-purple-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop: Auth-aware UI */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                {/* Credit Balance - Only for authenticated users */}
                <Link href="/tripmatch/dashboard">
                  <div className={`px-4 py-2 bg-gradient-to-r ${getTierColor(credits?.tier)} rounded-lg hover:scale-105 transition-all cursor-pointer shadow-lg`}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-900" />
                      <div>
                        <p className="text-xs text-slate-800 leading-none font-medium">Credits</p>
                        <p className="text-sm font-black text-slate-900 leading-none">
                          {credits?.balance || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* User Account Link */}
                <Link href="/account">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <User className="w-5 h-5" />
                  </div>
                </Link>
              </>
            ) : (
              // Not authenticated - Show sign in button
              <Link href="/auth/signin">
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                    isActive(item.href)
                      ? 'bg-purple-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile: Auth-aware UI */}
            <div className="pt-2 border-t border-white/10">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-white/60 py-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/tripmatch/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${getTierColor(credits?.tier)} rounded-lg mb-2 shadow-lg`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-slate-900" />
                      <span className="font-bold text-slate-900">My Credits</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">{credits?.balance || 0}</span>
                  </Link>

                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg font-bold"
                  >
                    <User className="w-5 h-5" />
                    My Account
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
