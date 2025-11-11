'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Shield
} from 'lucide-react'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  adminRole: string
}

export default function AdminHeader({ user, adminRole }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const roleColors = {
    super_admin: 'bg-purple-600 text-white',
    admin: 'bg-blue-600 text-white',
    moderator: 'bg-green-600 text-white',
    user: 'bg-gray-600 text-white'
  }

  const roleColor = roleColors[adminRole as keyof typeof roleColors] || roleColors.user

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Title - Compact */}
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="flex items-center space-x-2">
              <Shield className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">Fly2Any Admin</h1>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">Management Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Search bar - Compact */}
          <div className="flex-1 max-w-xl mx-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, bookings, analytics..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side actions - Compact */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button className="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <Link
              href="/admin/settings"
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* User menu - Compact */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="h-7 w-7 rounded-full"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900 leading-none">{user.name || 'Admin'}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleColor} leading-none inline-block mt-0.5`}>
                    {adminRole.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <Link
                    href="/account"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>

                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <form action="/api/auth/signout" method="POST">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
