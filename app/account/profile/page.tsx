'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Award, Trophy, Target, TrendingUp, Star, Gift, Crown,
  Plane, Search, Bell, Users, MapPin, Calendar, ChevronRight,
  Sparkles, Zap, Shield, Medal, Gem, Edit2, Camera, Share2,
  BarChart3, Clock, Check, Lock
} from 'lucide-react';
import {
  BADGES, BadgeType, AchievementTier, GamificationService,
  POINTS_CONFIG, type UserProgress, type Badge
} from '@/lib/growth/gamification';
import GuestProfileForm from '@/components/guest/GuestProfileForm';
import { Guest } from '@/lib/api/liteapi-types';

// Tier colors and gradients - Ultra Premium Design
const TIER_STYLES = {
  [AchievementTier.BRONZE]: {
    gradient: 'from-amber-600 via-amber-500 to-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-700',
    glow: 'shadow-amber-200/50',
    icon: '🥉'
  },
  [AchievementTier.SILVER]: {
    gradient: 'from-slate-400 via-slate-300 to-slate-200',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-600',
    glow: 'shadow-slate-200/50',
    icon: '🥈'
  },
  [AchievementTier.GOLD]: {
    gradient: 'from-yellow-500 via-yellow-400 to-yellow-300',
    bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    glow: 'shadow-yellow-200/50',
    icon: '🥇'
  },
  [AchievementTier.PLATINUM]: {
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
    bg: 'bg-gradient-to-br from-violet-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-700',
    glow: 'shadow-purple-200/50',
    icon: '💎'
  }
};

const LEVEL_NAMES = [
  '', 'Starter', 'Explorer', 'Adventurer', 'Navigator',
  'Voyager', 'Globetrotter', 'Elite', 'Master', 'Legend', 'Champion'
];

// Badge Card Component
function BadgeCard({ badge, isUnlocked, index }: {
  badge: Badge;
  isUnlocked: boolean;
  index: number;
}) {
  const tierStyle = TIER_STYLES[badge.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`relative group ${isUnlocked ? '' : 'opacity-60'}`}
    >
      <div className={`
        relative overflow-hidden rounded-2xl p-4
        ${isUnlocked ? tierStyle.bg : 'bg-gray-50'}
        ${isUnlocked ? tierStyle.border : 'border-gray-200'}
        border transition-all duration-300
        hover:shadow-lg ${isUnlocked ? tierStyle.glow : ''}
        hover:scale-[1.02]
      `}>
        {/* Shine Effect */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}

        {/* Badge Icon */}
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3
          ${isUnlocked ? `bg-gradient-to-br ${tierStyle.gradient}` : 'bg-gray-200'}
          shadow-lg
        `}>
          {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
        </div>

        {/* Badge Info */}
        <h4 className={`font-semibold text-sm ${isUnlocked ? tierStyle.text : 'text-gray-500'}`}>
          {badge.name}
        </h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</p>

        {/* Points & Status */}
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isUnlocked
              ? `${tierStyle.bg} ${tierStyle.text}`
              : 'bg-gray-100 text-gray-400'
          }`}>
            +{badge.points} pts
          </span>
          {isUnlocked && badge.unlockedAt && (
            <span className="text-xs text-gray-400">
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Stats Card Component
function StatCard({ icon: Icon, label, value, suffix, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}{suffix}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  );
}

// Level Progress Component
function LevelProgress({ points, level }: { points: number; level: number }) {
  const gamification = useMemo(() => new GamificationService(), []);
  const pointsToNext = gamification.pointsToNextLevel(points);
  const currentLevelThreshold = [0, 100, 300, 600, 1000, 2000, 4000, 8000, 15000, 30000][level - 1] || 0;
  const nextLevelThreshold = [100, 300, 600, 1000, 2000, 4000, 8000, 15000, 30000, 50000][level - 1] || 50000;
  const progress = ((points - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Current Level</p>
              <h3 className="text-2xl font-bold">{LEVEL_NAMES[level] || `Level ${level}`}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{level}</p>
            <p className="text-white/60 text-xs">/ 10</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span>{points.toLocaleString()} points</span>
            <span>{pointsToNext > 0 ? `${pointsToNext.toLocaleString()} to next` : 'Max Level!'}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Rewards Unlocked */}
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Sparkles className="w-4 h-4" />
          <span>
            {level >= 5 ? '5% discount unlocked' : `Reach Level 5 for 5% discount`}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Profile Page
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'activity'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock user progress (in production, fetch from API)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: session?.user?.id || 'guest',
    totalPoints: 1250,
    level: 4,
    badges: BADGES.slice(0, 4).map(b => ({ ...b, unlockedAt: new Date() })),
    searchCount: 45,
    bookingCount: 3,
    referralCount: 2,
    alertsCreated: 8,
    countriesVisited: ['US', 'UK', 'FR', 'ES'],
    consecutiveDays: 5
  });

  const gamification = useMemo(() => new GamificationService(), []);

  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      fetchGuest(storedGuestId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchGuest = async (id: string) => {
    try {
      const response = await fetch('/api/guests/' + id);
      const data = await response.json();
      if (data.success) setGuest(data.data);
    } catch (err) {
      console.error('Failed to load guest:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (formData: any) => {
    const guestId = localStorage.getItem('guestId');
    try {
      if (guestId) {
        const response = await fetch('/api/guests/' + guestId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) setGuest(data.data);
      } else {
        const response = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          setGuest(data.data);
          localStorage.setItem('guestId', data.data.id);
        }
      }
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const earnedBadgeTypes = userProgress.badges.map(b => b.type);
  const unlockedCount = userProgress.badges.length;
  const totalBadges = BADGES.length;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {session?.user?.name?.[0] || guest?.firstName?.[0] || 'U'}
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {session?.user?.name || `${guest?.firstName || 'Guest'} ${guest?.lastName || 'User'}`}
            </h1>
            <p className="text-gray-500">{session?.user?.email || 'Member since 2024'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" /> {LEVEL_NAMES[userProgress.level]}
              </span>
              <span className="text-xs text-gray-400">
                {userProgress.consecutiveDays} day streak
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Search} label="Searches" value={userProgress.searchCount} color="bg-blue-500" />
        <StatCard icon={Plane} label="Bookings" value={userProgress.bookingCount} color="bg-green-500" />
        <StatCard icon={Users} label="Referrals" value={userProgress.referralCount} color="bg-purple-500" />
        <StatCard icon={MapPin} label="Countries" value={userProgress.countriesVisited.length} color="bg-orange-500" />
      </div>

      {/* Level Progress Card */}
      <LevelProgress points={userProgress.totalPoints} level={userProgress.level} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'badges', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Search, label: 'Search Flights', href: '/flights', color: 'bg-blue-500' },
                  { icon: Bell, label: 'Price Alerts', href: '/account/alerts', color: 'bg-amber-500' },
                  { icon: Gift, label: 'Refer Friends', href: '/account/referrals', color: 'bg-purple-500' },
                  { icon: Trophy, label: 'View Rewards', href: '/account/loyalty', color: 'bg-pink-500' },
                ].map((action, idx) => (
                  <a
                    key={idx}
                    href={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium text-center">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent Badges */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Badges</h3>
                <button
                  onClick={() => setActiveTab('badges')}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {userProgress.badges.slice(0, 4).map((badge, idx) => (
                  <BadgeCard key={badge.type} badge={badge} isUnlocked={true} index={idx} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">All Badges</h3>
                  <p className="text-sm text-gray-500">{unlockedCount} of {totalBadges} unlocked</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                      style={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {Math.round((unlockedCount / totalBadges) * 100)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {BADGES.map((badge, idx) => (
                  <BadgeCard
                    key={badge.type}
                    badge={earnedBadgeTypes.includes(badge.type)
                      ? userProgress.badges.find(b => b.type === badge.type)!
                      : badge
                    }
                    isUnlocked={earnedBadgeTypes.includes(badge.type)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 p-4"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { icon: Search, text: 'Searched NYC to Miami', points: '+1', time: '2 hours ago', color: 'text-blue-500' },
                { icon: Bell, text: 'Created price alert', points: '+5', time: '1 day ago', color: 'text-amber-500' },
                { icon: Award, text: 'Earned "Explorer" badge', points: '+100', time: '3 days ago', color: 'text-purple-500' },
                { icon: Users, text: 'Referred a friend', points: '+100', time: '1 week ago', color: 'text-green-500' },
                { icon: Plane, text: 'Booked flight to London', points: '+50', time: '2 weeks ago', color: 'text-primary-500' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{activity.points}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            </div>
            <div className="p-6">
              <GuestProfileForm guest={guest || undefined} onSave={handleSaveProfile} />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
