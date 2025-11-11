import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Clock,
  Shield,
  Trash2,
  Download,
  Camera,
  Edit,
  CheckCircle2,
  XCircle,
  Monitor,
  History as HistoryIcon,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import EditProfileButton from '@/components/account/EditProfileButton';
import AvatarUploadButton from '@/components/account/AvatarUploadButton';
import ChangePasswordButton from '@/components/account/ChangePasswordButton';
import DeleteAccountButton from '@/components/account/DeleteAccountButton';
import ActiveSessions from '@/components/account/ActiveSessions';
import LoginHistory from '@/components/account/LoginHistory';

// Force Node.js runtime (required for Prisma database access)
export const runtime = 'nodejs';

// Force dynamic rendering (uses auth() which requires headers)
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  // Check if database is configured
  const isDatabaseConfigured = !!process.env.DATABASE_URL;

  let session = null;
  let user = null;
  let preferences = null;
  let connectedAccounts: any[] = [];
  let profileCompletion = 0;

  try {
    if (isDatabaseConfigured && prisma) {
      session = await auth();

      if (!session || !session.user) {
        redirect('/auth/signin');
      }

      // Ensure session.user has required properties
      if (!session.user.id) {
        console.error('Session user missing ID:', session.user);
        redirect('/auth/signin');
      }

      // Fetch user data with all profile fields
      [user, preferences, connectedAccounts] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            country: true,
            timezone: true,
            bio: true,
            profileCompleted: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.userPreferences.findUnique({
          where: { userId: session.user.id },
        }),
        prisma.account.findMany({
          where: { userId: session.user.id },
          select: {
            provider: true,
            providerAccountId: true,
          },
        }),
      ]);

      // Calculate profile completion percentage
      if (user) {
        const fields = [
          user.firstName,
          user.lastName,
          user.phone,
          user.dateOfBirth,
          user.gender,
          user.country,
          user.timezone,
          user.bio,
          user.avatarUrl || user.image,
        ];
        const completedFields = fields.filter(Boolean).length;
        profileCompletion = Math.round((completedFields / fields.length) * 100);
      }
    }
  } catch (error) {
    console.error('Profile page error:', error);
    // Continue with empty data
  }

  // If no database, show placeholder
  if (!isDatabaseConfigured || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800">
                Profile Features Temporarily Unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The profile system requires database configuration.</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/account"
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                >
                  Back to Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.email?.split('@')[0] || 'User';
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      {/* Profile Header Section */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {user.avatarUrl || user.image ? (
              <img
                src={user.avatarUrl || user.image || ''}
                alt={displayName}
                className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <AvatarUploadButton userId={user.id} currentAvatar={user.avatarUrl || user.image} />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  <XCircle className="w-3 h-3" />
                  Not Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Member since {memberSince}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                Free Account
              </span>
            </div>

            {/* Profile Completion */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-gray-900">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </h3>
          <EditProfileButton user={user} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
            <div className="text-gray-900">{user.firstName || 'Not provided'}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
            <div className="text-gray-900">{user.lastName || 'Not provided'}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <div className="text-gray-900">{user.phone || 'Not provided'}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Date of Birth
            </label>
            <div className="text-gray-900">
              {user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : 'Not provided'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <div className="text-gray-900">{user.gender || 'Not provided'}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Country/Region
            </label>
            <div className="text-gray-900">{user.country || 'Not provided'}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Timezone
            </label>
            <div className="text-gray-900">{user.timezone || 'Not provided'}</div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
            <div className="text-gray-900">{user.bio || 'Not provided'}</div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          Security
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Password</h4>
              <p className="text-sm text-gray-600">Change your account password</p>
            </div>
            <ChangePasswordButton />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security (Coming soon)</p>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <ActiveSessions userId={user.id} />

      {/* Login History */}
      <LoginHistory userId={user.id} />

      {/* Connected Accounts */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          Connected Accounts
        </h3>

        <div className="space-y-4">
          {connectedAccounts.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No connected accounts</p>
          ) : (
            connectedAccounts.map((account) => (
              <div
                key={account.provider}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    {account.provider === 'google' && (
                      <Globe className="w-6 h-6 text-blue-600" />
                    )}
                    {account.provider === 'github' && (
                      <Globe className="w-6 h-6 text-gray-800" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">{account.provider}</h4>
                    <p className="text-sm text-gray-600">Connected</p>
                  </div>
                </div>
                <button className="text-sm text-red-600 hover:text-red-700 font-semibold">
                  Disconnect
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-900 flex items-center gap-2 mb-6">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Export Your Data</h4>
              <p className="text-sm text-gray-600">
                Download all your saved searches, alerts, and bookings
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-300">
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <DeleteAccountButton userId={user.id} userEmail={user.email} />
          </div>
        </div>
      </div>
    </div>
  );
}
