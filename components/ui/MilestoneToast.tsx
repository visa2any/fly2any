'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Zap, Star, Crown, Gift, Target, TrendingUp, Flame } from 'lucide-react'
import type { MilestoneNotification } from '@/lib/growth/milestone-notifications'
import { AchievementTier } from '@/lib/growth/gamification'

const TIER_STYLES = {
  [AchievementTier.BRONZE]: {
    bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/30'
  },
  [AchievementTier.SILVER]: {
    bg: 'bg-gradient-to-r from-slate-400 to-slate-500',
    border: 'border-slate-300',
    glow: 'shadow-slate-400/30'
  },
  [AchievementTier.GOLD]: {
    bg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    border: 'border-yellow-300',
    glow: 'shadow-yellow-400/30'
  },
  [AchievementTier.PLATINUM]: {
    bg: 'bg-gradient-to-r from-violet-500 to-purple-600',
    border: 'border-purple-400',
    glow: 'shadow-purple-500/30'
  }
}

const TYPE_ICONS = {
  progress: TrendingUp,
  complete: Trophy,
  close: Target,
  streak: Flame
}

interface MilestoneToastProps {
  notification: MilestoneNotification
  onDismiss: (id: string) => void
  duration?: number
}

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'][i % 5]
          }}
          animate={{
            y: [0, 200],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  )
}

function Stars() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: 1
          }}
        >
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </motion.div>
      ))}
    </div>
  )
}

export function MilestoneToast({ notification, onDismiss, duration = 5000 }: MilestoneToastProps) {
  const { milestone, message, celebration } = notification
  const tierStyle = TIER_STYLES[milestone.tier]
  const Icon = TYPE_ICONS[notification.type]

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), duration)
    return () => clearTimeout(timer)
  }, [notification.id, onDismiss, duration])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        relative overflow-hidden rounded-2xl border
        ${tierStyle.border} ${tierStyle.glow}
        bg-white backdrop-blur-xl shadow-2xl
        min-w-[320px] max-w-[400px]
      `}
    >
      {/* Celebration effects */}
      {celebration === 'confetti' && <Confetti />}
      {celebration === 'stars' && <Stars />}

      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 ${tierStyle.bg} opacity-10`}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className={`flex-shrink-0 w-12 h-12 rounded-xl ${tierStyle.bg} flex items-center justify-center shadow-lg`}
            animate={notification.type === 'complete' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: notification.type === 'complete' ? 2 : 0 }}
          >
            {milestone.icon ? (
              <span className="text-2xl">{milestone.icon}</span>
            ) : (
              <Icon className="w-6 h-6 text-white" />
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 text-sm truncate">
                {milestone.name}
              </h4>
              {milestone.reward && (
                <span className="flex-shrink-0 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  +{milestone.reward.points} pts
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{message}</p>

            {/* Progress bar for non-complete */}
            {notification.type !== 'complete' && milestone.progress < 100 && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${tierStyle.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${milestone.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {milestone.currentValue}/{milestone.targetValue}
                </p>
              </div>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Toast container and context
interface ToastContextValue {
  showMilestone: (notification: MilestoneNotification) => void
  dismissToast: (id: string) => void
}

export function MilestoneToastContainer({
  notifications,
  onDismiss
}: {
  notifications: MilestoneNotification[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
      <AnimatePresence mode="sync">
        {notifications.slice(0, 3).map(notification => (
          <MilestoneToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
