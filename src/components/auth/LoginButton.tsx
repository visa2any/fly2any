'use client';

import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, LogIn, LogOut, Settings, Calendar, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  variant?: 'header' | 'mobile' | 'inline';
  showText?: boolean;
}

export default function LoginButton({ variant = 'header', showText = true }: LoginButtonProps) {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: window.location.href });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className={`animate-pulse ${
        variant === 'header' ? 'w-20 h-8 bg-white/20 rounded-lg' :
        variant === 'mobile' ? 'w-16 h-8 bg-gray-200 rounded' :
        'w-24 h-8 bg-gray-200 rounded'
      }`}></div>
    );
  }

  // User is logged in
  if (session) {
    const userName = session.user?.name || 'Usuário';
    const userEmail = session.user?.email || '';
    const isAdmin = session.user?.role === 'admin';

    if (variant === 'header') {
      return (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold">
              {userName[0]?.toUpperCase()}
            </div>
            {showText && (
              <span className="text-sm font-medium max-w-24 truncate">
                {userName.split(' ')[0]}
              </span>
            )}
            <ChevronDown 
              size={14} 
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                  <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                  {isAdmin && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} />
                    Minha Conta
                  </Link>
                  
                  <Link
                    href="/account#bookings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Calendar size={16} />
                    Minhas Reservas
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      Administração
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t py-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    if (variant === 'mobile') {
      return (
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
          >
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs">
              {userName[0]?.toUpperCase()}
            </div>
            {showText && <span>{userName.split(' ')[0]}</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      );
    }

    // Inline variant
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/account"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <User size={16} />
          {showText && <span>Minha Conta</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          {showText && <span>Sair</span>}
        </button>
      </div>
    );
  }

  // User is not logged in
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/register"
          className="px-3 py-2 text-sm text-white/90 hover:text-white transition-colors"
        >
          Cadastrar
        </Link>
        <button
          onClick={handleSignIn}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          <LogIn size={16} />
          {showText && <span>Entrar</span>}
        </button>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <LogIn size={16} />
        {showText && <span>Entrar</span>}
      </button>
    );
  }

  // Inline variant
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/register"
        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        Cadastrar
      </Link>
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <LogIn size={16} />
        {showText && <span>Entrar</span>}
      </button>
    </div>
  );
}