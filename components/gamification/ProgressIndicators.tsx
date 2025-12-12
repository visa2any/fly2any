'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target, Trophy, Zap, ChevronRight, Sparkles, TrendingUp, Flame } from 'lucide-react'
import type { Milestone } from '@/lib/growth/milestone-notifications'
import { AchievementTier } from '@/lib/growth/gamification'

const TIER_COLORS = {
  [AchievementTier.BRONZE]: {
    bg: 'bg-amber-50',
    progress: 'from-amber-400 to-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  [AchievementTier.SILVER]: {
    bg: 'bg-slate-50',
    progress: 'from-slate-300 to-slate-400',
    text: 'text-slate-600',
    border: 'border-slate-200'
  },
  [AchievementTier.GOLD]: {
    bg: 'bg-yellow-50',
    progress: 'from-yellow-400 to-amber-500',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  [AchievementTier.PLATINUM]: {
    bg: 'bg-purple-50',
    progress: 'from-violet-500 to-purple-600',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
}

interface MilestoneCardProps {
  milestone: Milestone
  compact?: boolean
}

export function MilestoneProgressCard({ milestone, compact = false }: MilestoneCardProps) {
  const colors = TIER_COLORS[milestone.tier]
  const remaining = milestone.targetValue - milestone.currentValue
  const isClose = milestone.progress >= 75

  if (compact) {
    return (
      <div className={`
        flex items-center gap-3 p-3 rounded-xl
        ${colors.bg} ${colors.border} border
        hover:shadow-md transition-shadow cursor-pointer
      `}>
        <span className="text-xl">{milestone.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900 truncate">{milestone.name}</span>
            <span className={`text-xs font-semibold ${colors.text}`}>
              {Math.round(milestone.progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${colors.progress} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${milestone.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        relative overflow-hidden rounded-2xl p-4
        ${colors.bg} ${colors.border} border
        hover:shadow-lg transition-all
      `}
    >
      {/* Glow for close milestones */}
      {isClose && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 0%, var(--tw-gradient-from), transparent 70%)`
          }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-xl bg-gradient-to-br ${colors.progress}
              flex items-center justify-center text-2xl shadow-lg
            `}>
              {milestone.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">{milestone.description}</p>
            </div>
          </div>
          {isClose && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex-shrink-0"
            >
              <Sparkles className={`w-5 h-5 ${colors.text}`} />
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{milestone.currentValue.toLocaleString()}</span>
            <span className={`font-semibold ${colors.text}`}>
              {milestone.targetValue.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${colors.progress} rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${milestone.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {remaining > 0 ? `${remaining.toLocaleString()} to go` : 'Complete!'}
          </span>
          {milestone.reward && (
            <span className={`text-xs font-semibold ${colors.text} bg-white/60 px-2 py-1 rounded-full`}>
              +{milestone.reward.points} pts
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface ProgressDashboardProps {
  milestones: Milestone[]
  showCount?: number
}

export function ProgressDashboard({ milestones, showCount = 4 }: ProgressDashboardProps) {
  const sortedMilestones = useMemo(() =>
    [...milestones]
      .filter(m => !m.isComplete)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, showCount),
    [milestones, showCount]
  )

  const closeMilestones = sortedMilestones.filter(m => m.progress >= 75)

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>All milestones completed! You're amazing!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Close to completion alert */}
      {closeMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {closeMilestones.length === 1
                  ? `"${closeMilestones[0].name}" is almost complete!`
                  : `${closeMilestones.length} milestones almost complete!`
                }
              </p>
              <p className="text-xs text-amber-600">Keep going to unlock rewards</p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </div>
        </motion.div>
      )}

      {/* Milestones grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedMilestones.map((milestone, idx) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <MilestoneProgressCard milestone={milestone} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Compact inline progress for headers/sidebars
export function InlineProgress({ milestones }: { milestones: Milestone[] }) {
  const nextMilestone = milestones.find(m => !m.isComplete)

  if (!nextMilestone) return null

  const colors = TIER_COLORS[nextMilestone.tier]

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{nextMilestone.icon}</span>
      <div className="flex-1 max-w-[100px]">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.progress} rounded-full`}
            style={{ width: `${nextMilestone.progress}%` }}
          />
        </div>
      </div>
      <span className={`text-xs font-medium ${colors.text}`}>
        {Math.round(nextMilestone.progress)}%
      </span>
    </div>
  )
}
