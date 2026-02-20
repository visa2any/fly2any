'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ChevronLeft, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HostHeaderProps {
  exitHref?: string;
  exitLabel?: string;
}

export function HostHeader({ exitHref = '/', exitLabel = 'Back to Fly2Any' }: HostHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSuperhost, setIsSuperhost] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/host/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.superHost) setIsSuperhost(true);
        })
        .catch(console.error);
    }
  }, [session?.user]);

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
      
      {/* User Info - Compact */}
      {session?.user && (
        <div className="flex items-center gap-3">
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
        </div>
      )}
    </header>
  );
}
