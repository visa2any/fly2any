'use client'

import { useState } from 'react'
import { Trophy, Star, Award, Target, Users, TrendingUp, Medal, Crown, Zap, Gift, Shield, Flame } from 'lucide-react'

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  earnedCount: number
  requirements: string
}

interface LeaderboardUser {
  rank: number
  name: string
  points: number
  level: number
  badges: number
}

const BADGES: Badge[] = [
  { id: '1', name: 'First Steps', icon: '🔍', description: 'Complete your first search', tier: 'bronze', points: 10, earnedCount: 8450, requirements: '1 search' },
  { id: '2', name: 'Ready for Takeoff', icon: '✈️', description: 'Book your first flight', tier: 'silver', points: 100, earnedCount: 2340, requirements: '1 booking' },
  { id: '3', name: 'Deal Hunter', icon: '💰', description: 'Save $500+ on bookings', tier: 'gold', points: 250, earnedCount: 567, requirements: '$500+ saved' },
  { id: '4', name: 'Globe Trotter', icon: '🌍', description: 'Visit 10 countries', tier: 'platinum', points: 500, earnedCount: 89, requirements: '10 countries' },
  { id: '5', name: 'Referral Master', icon: '👥', description: 'Refer 25 friends', tier: 'platinum', points: 500, earnedCount: 34, requirements: '25 referrals' },
  { id: '6', name: 'Price Watcher', icon: '👁️', description: 'Create 10 price alerts', tier: 'bronze', points: 50, earnedCount: 3240, requirements: '10 alerts' },
  { id: '7', name: 'Frequent Flyer', icon: '🎖️', description: 'Book 10 flights', tier: 'gold', points: 300, earnedCount: 156, requirements: '10 bookings' },
  { id: '8', name: 'VIP Status', icon: '👑', description: 'Reach 5,000 points', tier: 'platinum', points: 500, earnedCount: 23, requirements: '5,000 points' }
]

const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'John D.', points: 15420, level: 8, badges: 12 },
  { rank: 2, name: 'Sarah M.', points: 12350, level: 7, badges: 10 },
  { rank: 3, name: 'Mike R.', points: 9870, level: 6, badges: 9 },
  { rank: 4, name: 'Emily K.', points: 7650, level: 6, badges: 8 },
  { rank: 5, name: 'David L.', points: 5430, level: 5, badges: 7 }
]

const tierColors = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-yellow-500',
  platinum: 'from-purple-400 to-purple-600'
}

const tierBg = {
  bronze: 'bg-amber-50 border-amber-200',
  silver: 'bg-gray-50 border-gray-200',
  gold: 'bg-yellow-50 border-yellow-200',
  platinum: 'bg-purple-50 border-purple-200'
}

export default function GamificationAdmin() {
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard' | 'settings'>('badges')

  const totalPoints = 1247890
  const totalBadgesEarned = BADGES.reduce((sum, b) => sum + b.earnedCount, 0)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            Gamification System
          </h1>
          <p className="text-gray-500 mt-1">Points, badges, achievements & rewards</p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Points Earned', value: totalPoints.toLocaleString(), icon: Star },
            { label: 'Badges Awarded', value: totalBadgesEarned.toLocaleString(), icon: Award },
            { label: 'Active Players', value: '8,450', icon: Users },
            { label: 'Avg Level', value: '4.2', icon: TrendingUp }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-6 w-6 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-yellow-100">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['badges', 'leaderboard', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map(badge => (
            <div key={badge.id} className={`rounded-xl border p-5 hover:shadow-lg transition-all ${tierBg[badge.tier]}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{badge.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${tierColors[badge.tier]}`}>
                  {badge.tier.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">{badge.earnedCount.toLocaleString()} earned</span>
                <span className="text-sm font-bold text-orange-600">+{badge.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="font-bold text-gray-900">Top Players</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {LEADERBOARD.map(user => (
              <div key={user.rank} className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  user.rank === 1 ? 'bg-yellow-400 text-white' :
                  user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                  user.rank === 3 ? 'bg-amber-600 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {user.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Level {user.level}</span>
                    <span>•</span>
                    <span>{user.badges} badges</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{user.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" /> Points Configuration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { action: 'Search', points: 1 },
                { action: 'Booking', points: 50 },
                { action: 'Per $1 Spent', points: 1 },
                { action: 'Referral Signup', points: 100 },
                { action: 'Referral Booking', points: 50 },
                { action: 'Price Alert Created', points: 5 },
                { action: 'Daily Login', points: 5 },
                { action: 'Consecutive Day Bonus', points: 10 }
              ].map(({ action, points }) => (
                <div key={action} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{action}</p>
                  <p className="text-xl font-bold text-gray-900">{points} pts</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" /> Redemption Rates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">100 points</span>
                <span className="font-bold text-green-600">= $1.00 travel credit</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">500 points</span>
                <span className="font-bold text-green-600">= $5.00 travel credit</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">1000 points</span>
                <span className="font-bold text-green-600">= $12.00 travel credit (20% bonus)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
