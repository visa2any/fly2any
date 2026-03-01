'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { ChevronLeft, Award, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HostHeaderProps {
  exitHref?: string;
  exitLabel?: string;
}

export function HostHeader({ exitHref = '/', exitLabel = 'Back to Fly2Any' }: HostHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSuperhost, setIsSuperhost] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/host/profile', { next: { revalidate: 60 } } as RequestInit)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.superHost) setIsSuperhost(true); })
      .catch(() => {});
  }, [session?.user?.email]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[60px] bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-50 relative shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-6">
        <div 
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" 
          onClick={() => router.push('/')} 
          role="button"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            F
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Fly2Any<span className="text-primary-600">Host</span>
          </span>
        </div>
        
        <div className="h-5 w-px bg-neutral-200 hidden sm:block" />
        
        <button 
          onClick={() => router.push(exitHref)} 
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> 
          <span className="hidden sm:block">{exitLabel}</span>
        </button>
      </div>
      
      {/* User Info & Dropdown */}
      {!session?.user ? (
        <button
          onClick={() => router.push('/auth/signin?callbackUrl=/host/dashboard')}
          className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors"
        >
          Sign In
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-200"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[150px]">
                {session.user.name || 'User'}
              </p>
              {isSuperhost ? (
                <p className="text-[10px] font-bold text-yellow-500 flex items-center justify-end gap-1 uppercase tracking-widest truncate mt-0.5">
                  <Award className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Superhost
                </p>
              ) : (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                  Host Account
                </p>
              )}
            </div>
            {session.user.image ? (
              <Image 
                src={session.user.image} 
                alt="User" 
                width={34} 
                height={34} 
                className="rounded-full shadow-sm border border-neutral-200" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm shadow-sm border border-primary-200">
                {session.user.name?.[0] || 'U'}
              </div>
            )}
            <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showDropdown && "rotate-180")} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                <p className="text-sm font-black text-gray-900 truncate">{session.user.name}</p>
                <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{session.user.email}</p>
              </div>
              <div className="p-2">
                <Link 
                  href="/host/profile" 
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
                <Link 
                  href="/host/profile#settings" 
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Link>
              </div>
              <div className="px-2 pb-2 mt-1">
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

