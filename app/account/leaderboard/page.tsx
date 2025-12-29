'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Crown, Medal, Star, TrendingUp, Users,
  Award, Flame, Target, ChevronRight, ChevronUp, ChevronDown
} from 'lucide-react';
import { GamificationService, BADGES, AchievementTier } from '@/lib/growth/gamification';

// Leaderboard entry type
interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  badges: number;
  streak: number;
  change?: 'up' | 'down' | 'same';
  changeAmount?: number;
}

// Top 3 Podium Component
function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const styles = {
    1: {
      height: 'h-32',
      bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600',
      crown: true,
      icon: Crown,
      medal: '🥇',
      ring: 'ring-4 ring-yellow-300/50',
    },
    2: {
      height: 'h-24',
      bg: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
      crown: false,
      icon: Medal,
      medal: '🥈',
      ring: 'ring-4 ring-slate-300/50',
    },
    3: {
      height: 'h-20',
      bg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700',
      crown: false,
      icon: Award,
      medal: '🥉',
      ring: 'ring-4 ring-amber-300/50',
    },
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1, duration: 0.4 }}
      className={`flex flex-col items-center ${position === 1 ? 'order-2' : position === 2 ? 'order-1' : 'order-3'}`}
    >
      {/* Avatar */}
      <div className="relative mb-2">
        {styles.crown && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <Crown className="w-6 h-6 text-yellow-500" />
          </motion.div>
        )}
        <div className={`w-16 h-16 rounded-2xl ${styles.bg} ${styles.ring} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
          {entry.avatar || entry.name.charAt(0)}
        </div>
        <span className="absolute -bottom-2 -right-2 text-2xl">{styles.medal}</span>
      </div>

      {/* Info */}
      <h4 className="font-semibold text-gray-900 text-center mt-2">{entry.name}</h4>
      <p className="text-sm text-gray-500">Level {entry.level}</p>

      {/* Podium */}
      <div className={`${styles.height} w-24 ${styles.bg} rounded-t-xl mt-3 flex flex-col items-center justify-center text-white`}>
        <p className="text-2xl font-bold">{entry.points.toLocaleString()}</p>
        <p className="text-xs opacity-80">points</p>
      </div>
    </motion.div>
  );
}

// Leaderboard Row Component
function LeaderboardRow({ entry, index, isCurrentUser }: {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-gray-50 ${
        isCurrentUser ? 'bg-primary-50 border border-primary-200' : ''
      }`}
    >
      {/* Rank */}
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600">
        {entry.rank}
      </div>

      {/* Change Indicator */}
      <div className="w-6">
        {entry.change === 'up' && (
          <span className="flex items-center text-green-500 text-xs">
            <ChevronUp className="w-4 h-4" />
            {entry.changeAmount}
          </span>
        )}
        {entry.change === 'down' && (
          <span className="flex items-center text-red-500 text-xs">
            <ChevronDown className="w-4 h-4" />
            {entry.changeAmount}
          </span>
        )}
        {entry.change === 'same' && (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
        {entry.avatar || entry.name.charAt(0)}
      </div>

      {/* Name & Level */}
      <div className="flex-1">
        <p className="font-semibold text-gray-900 flex items-center gap-2">
          {entry.name}
          {isCurrentUser && (
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">You</span>
          )}
        </p>
        <p className="text-sm text-gray-500">Level {entry.level}</p>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Award className="w-4 h-4" />
          <span>{entry.badges}</span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-500">
          <Flame className="w-4 h-4" />
          <span>{entry.streak}d</span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <p className="font-bold text-gray-900">{entry.points.toLocaleString()}</p>
        <p className="text-xs text-gray-500">points</p>
      </div>
    </motion.div>
  );
}

// Filter Tabs
type TimeFilter = 'all' | 'month' | 'week';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [loading, setLoading] = useState(true);
  const currentUserId = 'current-user'; // In production, get from session

  // Mock leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, userId: '1', name: 'John D.', points: 15420, level: 8, badges: 8, streak: 45, change: 'same' },
    { rank: 2, userId: '2', name: 'Sarah M.', points: 12350, level: 7, badges: 7, streak: 32, change: 'up', changeAmount: 2 },
    { rank: 3, userId: '3', name: 'Mike R.', points: 9870, level: 6, badges: 6, streak: 28, change: 'down', changeAmount: 1 },
    { rank: 4, userId: '4', name: 'Emily K.', points: 7650, level: 6, badges: 5, streak: 15, change: 'up', changeAmount: 3 },
    { rank: 5, userId: '5', name: 'David L.', points: 5430, level: 5, badges: 4, streak: 12, change: 'same' },
    { rank: 6, userId: 'current-user', name: 'You', points: 1250, level: 4, badges: 4, streak: 5, change: 'up', changeAmount: 5 },
    { rank: 7, userId: '7', name: 'Alex P.', points: 1100, level: 3, badges: 3, streak: 8, change: 'down', changeAmount: 2 },
    { rank: 8, userId: '8', name: 'Lisa W.', points: 980, level: 3, badges: 3, streak: 6, change: 'same' },
    { rank: 9, userId: '9', name: 'Tom H.', points: 850, level: 3, badges: 2, streak: 4, change: 'up', changeAmount: 1 },
    { rank: 10, userId: '10', name: 'Amy C.', points: 720, level: 2, badges: 2, streak: 3, change: 'same' },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const currentUserEntry = leaderboard.find(e => e.userId === currentUserId);
  const currentUserRank = currentUserEntry?.rank || 0;

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
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" />
          Global Leaderboard
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Travelers</h1>
        <p className="text-gray-500">Compete with fellow travelers and earn rewards</p>
      </motion.div>

      {/* Your Rank Card */}
      {currentUserEntry && currentUserRank > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                #{currentUserRank}
              </div>
              <div>
                <p className="text-white/80 text-sm">Your Current Rank</p>
                <p className="text-xl font-bold">{currentUserEntry.points.toLocaleString()} points</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">
                {(leaderboard[currentUserRank - 2]?.points || 0) - currentUserEntry.points} pts to #{currentUserRank - 1}
              </p>
              <div className="flex items-center gap-1 text-green-300 text-sm mt-1">
                <TrendingUp className="w-4 h-4" />
                <span>+5 ranks this week</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Time Filter */}
      <div className="flex justify-center gap-2">
        {(['all', 'month', 'week'] as TimeFilter[]).map(filter => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              timeFilter === filter
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'This Week'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-end justify-center gap-4 mb-6">
          {top3[1] && <PodiumCard entry={top3[1]} position={2} />}
          {top3[0] && <PodiumCard entry={top3[0]} position={1} />}
          {top3[2] && <PodiumCard entry={top3[2]} position={3} />}
        </div>
      </div>

      {/* Rest of Leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Rankings</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {rest.map((entry, idx) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              index={idx}
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      </div>

      {/* Rewards Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-purple-100 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Monthly Rewards</h3>
            <p className="text-sm text-gray-600 mb-3">
              Top 10 travelers at the end of each month win exclusive rewards!
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { place: '1st', reward: '$100 Credit', icon: '🥇' },
                { place: '2nd-3rd', reward: '$50 Credit', icon: '🥈' },
                { place: '4th-10th', reward: '500 Bonus Points', icon: '🎁' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 text-center">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-xs text-gray-500 mt-1">{item.place}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.reward}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
