'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Search, Plus, LayoutDashboard, Menu, X, DollarSign } from 'lucide-react';

export default function TripMatchNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tripmatch/browse', label: 'Browse Trips', icon: Search },
    { href: '/tripmatch/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tripmatch/create', label: 'Create Trip', icon: Plus },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
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

          {/* Credit Balance (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/tripmatch/dashboard">
              <div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-white" />
                  <div>
                    <p className="text-xs text-white/80 leading-none">Credits</p>
                    <p className="text-sm font-bold text-white leading-none">0</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* User Avatar Placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform">
              U
            </div>
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

            <div className="pt-2 border-t border-white/10">
              <Link
                href="/tripmatch/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">My Credits</span>
                </div>
                <span className="text-xl font-black text-white">0</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
