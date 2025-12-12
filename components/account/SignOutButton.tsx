'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 md:gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] border border-red-200 hover:border-red-300 active:scale-[0.98] w-full"
    >
      <div className="p-2 md:p-2.5 bg-red-100 rounded-lg">
        <LogOut className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
      </div>
      <div className="min-w-0 text-left">
        <h3 className="font-semibold text-red-700 text-sm">Sign Out</h3>
        <p className="text-[10px] md:text-xs text-red-500 truncate">Log out</p>
      </div>
    </button>
  );
}
