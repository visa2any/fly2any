'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { User, Heart, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  translations: {
    account: string;
    wishlist: string;
    notifications: string;
    signin: string;
  };
}

/**
 * User Menu Dropdown Component
 *
 * Displays authenticated user avatar and dropdown menu with:
 * - My Account link
 * - Wishlist link
 * - Notifications link
 * - Settings
 * - Sign Out
 */
export function UserMenu({ user, translations }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User avatar'}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials()}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-dropdown shadow-xl border border-gray-200 animate-slideDown"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          }}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation('/account')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 transition-colors duration-150 text-sm"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">{translations.account}</span>
            </button>

            <button
              onClick={() => handleNavigation('/account/wishlist')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 transition-colors duration-150 text-sm"
            >
              <Heart className="w-4 h-4" />
              <span className="font-medium">{translations.wishlist}</span>
            </button>

            <button
              onClick={() => handleNavigation('/account/notifications')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 transition-colors duration-150 text-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="font-medium">{translations.notifications}</span>
            </button>

            <button
              onClick={() => handleNavigation('/account/preferences')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 transition-colors duration-150 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">Settings</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-150 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
