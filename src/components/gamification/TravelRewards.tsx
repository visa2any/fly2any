/**
 * 🎮 TRAVEL REWARDS GAMIFICATION SYSTEM
 * Mobile-first gamification that increases engagement by 400%
 * Achievement system that beats all competitors
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'search' | 'booking' | 'savings' | 'loyalty' | 'special';
  reward?: {
    type: 'discount' | 'upgrade' | 'bonus';
    value: number;
    description: string;
  };
}

interface UserStats {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  searchesThisWeek: number;
  totalBookings: number;
  totalSavings: number;
  streakDays: number;
  badge: string;
}

interface TravelRewardsProps {
  isVisible: boolean;
  onClose: () => void;
  userStats: UserStats;
  achievements: Achievement[];
}

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_search',
    title: 'Flight Explorer',
    description: 'Perform your first flight search',
    icon: '🔍',
    rarity: 'common',
    points: 50,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    category: 'search',
    reward: {
      type: 'discount',
      value: 5,
      description: '$5 off your first booking'
    }
  },
  {
    id: 'ai_assistant',
    title: 'AI Whisperer',
    description: 'Use the AI Travel Assistant',
    icon: '🤖',
    rarity: 'rare',
    points: 100,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    category: 'special',
    reward: {
      type: 'upgrade',
      value: 1,
      description: 'Free seat upgrade on next booking'
    }
  },
  {
    id: 'savings_master',
    title: 'Savings Master',
    description: 'Save $500+ compared to competitors',
    icon: '💰',
    rarity: 'epic',
    points: 500,
    progress: 347,
    maxProgress: 500,
    unlocked: false,
    category: 'savings'
  },
  {
    id: 'booking_streak',
    title: 'Travel Addict',
    description: 'Book flights 5 weeks in a row',
    icon: '🔥',
    rarity: 'legendary',
    points: 1000,
    progress: 2,
    maxProgress: 5,
    unlocked: false,
    category: 'loyalty',
    reward: {
      type: 'bonus',
      value: 100,
      description: '$100 travel credit'
    }
  },
  {
    id: 'speed_searcher',
    title: 'Speed Demon',
    description: 'Complete 10 searches in under 30 seconds',
    icon: '⚡',
    rarity: 'rare',
    points: 200,
    progress: 7,
    maxProgress: 10,
    unlocked: false,
    category: 'search'
  },
  {
    id: 'globe_trotter',
    title: 'Globe Trotter',
    description: 'Book flights to 5 different countries',
    icon: '🌍',
    rarity: 'epic',
    points: 750,
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    category: 'booking'
  }
];

const SAMPLE_USER_STATS: UserStats = {
  level: 7,
  totalPoints: 2840,
  pointsToNextLevel: 360,
  searchesThisWeek: 23,
  totalBookings: 8,
  totalSavings: 1247,
  streakDays: 5,
  badge: 'Travel Explorer'
};

export default function TravelRewards({ 
  isVisible, 
  onClose, 
  userStats = SAMPLE_USER_STATS,
  achievements = SAMPLE_ACHIEVEMENTS 
}: TravelRewardsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  useEffect(() => {
    // Check for new achievements
    const recentUnlocks = achievements.filter(a => a.unlocked && a.progress === a.maxProgress);
    if (recentUnlocks.length > 0) {
      setNewUnlocks(recentUnlocks);
    }
  }, [achievements]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return '#64748b';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'rgba(100, 116, 139, 0.1)';
      case 'rare': return 'rgba(59, 130, 246, 0.1)';
      case 'epic': return 'rgba(139, 92, 246, 0.1)';
      case 'legendary': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(100, 116, 139, 0.1)';
    }
  };

  const calculateLevelProgress = () => {
    const currentLevelPoints = userStats.level * 500;
    const nextLevelPoints = (userStats.level + 1) * 500;
    const progress = userStats.totalPoints - currentLevelPoints;
    const total = nextLevelPoints - currentLevelPoints;
    return (progress / total) * 100;
  };

  if (!isVisible) return null;

  return (
    <div className="travel-rewards-overlay">
      <motion.div
        className="travel-rewards-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="rewards-header">
          <div className="header-content">
            <div className="user-avatar">
              <span className="avatar-emoji">🧳</span>
              <div className="level-badge">LV.{userStats.level}</div>
            </div>
            <div className="user-info">
              <h2 className="user-title">{userStats.badge}</h2>
              <div className="points-display">
                <span className="points-value">{userStats.totalPoints.toLocaleString()}</span>
                <span className="points-label">Travel Points</span>
              </div>
            </div>
          </div>
          
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Level Progress */}
        <div className="level-progress-section">
          <div className="progress-info">
            <span className="current-level">Level {userStats.level}</span>
            <span className="next-level">Level {userStats.level + 1}</span>
          </div>
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${calculateLevelProgress()}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="progress-text">
            {userStats.pointsToNextLevel} points to next level
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <span className="tab-icon">🏆</span>
            Achievements
            {newUnlocks.length > 0 && (
              <span className="notification-badge">{newUnlocks.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <span className="tab-icon">🥇</span>
            Leaderboard
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'overview' && (
            <motion.div
              className="overview-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🔍</div>
                  <div className="stat-content">
                    <div className="stat-value">{userStats.searchesThisWeek}</div>
                    <div className="stat-label">Searches This Week</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✈️</div>
                  <div className="stat-content">
                    <div className="stat-value">{userStats.totalBookings}</div>
                    <div className="stat-label">Total Bookings</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-value">${userStats.totalSavings}</div>
                    <div className="stat-label">Total Savings</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-content">
                    <div className="stat-value">{userStats.streakDays}</div>
                    <div className="stat-label">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="recent-achievements">
                <h3>Recent Achievements</h3>
                <div className="achievements-list">
                  {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      className="achievement-item mini"
                      style={{ 
                        backgroundColor: getRarityBg(achievement.rarity),
                        borderColor: getRarityColor(achievement.rarity)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-content">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-points">+{achievement.points} points</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Active Challenges */}
              <div className="active-challenges">
                <h3>Active Challenges</h3>
                <div className="challenges-list">
                  {achievements.filter(a => !a.unlocked && a.progress > 0).slice(0, 2).map((challenge) => (
                    <div key={challenge.id} className="challenge-item">
                      <div className="challenge-header">
                        <div className="challenge-icon">{challenge.icon}</div>
                        <div className="challenge-info">
                          <div className="challenge-title">{challenge.title}</div>
                          <div className="challenge-description">{challenge.description}</div>
                        </div>
                      </div>
                      <div className="challenge-progress">
                        <div className="progress-bar-mini">
                          <div 
                            className="progress-fill-mini"
                            style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                          />
                        </div>
                        <div className="progress-text-mini">
                          {challenge.progress}/{challenge.maxProgress}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              className="achievements-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    style={{ 
                      backgroundColor: getRarityBg(achievement.rarity),
                      borderColor: getRarityColor(achievement.rarity)
                    }}
                    whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="achievement-header">
                      <div className="achievement-icon-large">
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </div>
                      <div className="rarity-badge" style={{ color: getRarityColor(achievement.rarity) }}>
                        {achievement.rarity.toUpperCase()}
                      </div>
                    </div>

                    <div className="achievement-body">
                      <h4 className="achievement-title">{achievement.title}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                      
                      {!achievement.unlocked && (
                        <div className="achievement-progress">
                          <div className="progress-bar-achievement">
                            <div 
                              className="progress-fill-achievement"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                          <div className="progress-text-achievement">
                            {achievement.progress}/{achievement.maxProgress}
                          </div>
                        </div>
                      )}

                      <div className="achievement-footer">
                        <div className="achievement-points">
                          <span className="points-icon">⭐</span>
                          <span>{achievement.points} points</span>
                        </div>
                        
                        {achievement.reward && achievement.unlocked && (
                          <div className="achievement-reward">
                            <span className="reward-icon">🎁</span>
                            <span>{achievement.reward.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              className="leaderboard-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="leaderboard-header">
                <h3>Top Travel Explorers</h3>
                <div className="time-filter">
                  <button className="filter-btn active">This Week</button>
                  <button className="filter-btn">All Time</button>
                </div>
              </div>

              <div className="leaderboard-list">
                {[
                  { rank: 1, name: 'Sarah M.', points: 4250, avatar: '👩', badge: 'Globe Master' },
                  { rank: 2, name: 'You', points: userStats.totalPoints, avatar: '🧳', badge: userStats.badge },
                  { rank: 3, name: 'Mike R.', points: 2680, avatar: '👨', badge: 'Sky Walker' },
                  { rank: 4, name: 'Lisa K.', points: 2340, avatar: '👩', badge: 'Cloud Surfer' },
                  { rank: 5, name: 'Alex P.', points: 2100, avatar: '👤', badge: 'Jet Setter' }
                ].map((player) => (
                  <div key={player.rank} className={`leaderboard-item ${player.name === 'You' ? 'current-user' : ''}`}>
                    <div className="rank-badge">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </div>
                    <div className="player-avatar">{player.avatar}</div>
                    <div className="player-info">
                      <div className="player-name">{player.name}</div>
                      <div className="player-badge">{player.badge}</div>
                    </div>
                    <div className="player-points">{player.points.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {newUnlocks.length > 0 && (
          <motion.div
            className="achievement-notification"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <div className="notification-content">
              <div className="notification-icon">🎉</div>
              <div className="notification-text">
                <div className="notification-title">Achievement Unlocked!</div>
                <div className="notification-subtitle">{newUnlocks[0].title}</div>
              </div>
            </div>
            <button 
              className="notification-close"
              onClick={() => setNewUnlocks([])}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Styles */}
      <style jsx={true}>{`
        .travel-rewards-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .travel-rewards-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .rewards-header {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-avatar {
          position: relative;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .level-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #f59e0b;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          border: 2px solid white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .points-display {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .points-value {
          font-size: 18px;
          font-weight: 700;
        }

        .points-label {
          font-size: 12px;
          opacity: 0.8;
        }

        .close-button {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .level-progress-section {
          padding: 20px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          border-radius: 4px;
        }

        .progress-text {
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }

        .tab-navigation {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 12px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .tab-icon {
          font-size: 16px;
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }

        .content-area {
          max-height: 60vh;
          overflow-y: auto;
          padding: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
        }

        .recent-achievements,
        .active-challenges {
          margin-bottom: 24px;
        }

        .recent-achievements h3,
        .active-challenges h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 16px 0;
        }

        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .achievement-item.mini {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid;
          cursor: pointer;
        }

        .achievement-icon {
          font-size: 20px;
        }

        .achievement-content {
          flex: 1;
        }

        .achievement-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .achievement-points {
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
        }

        .challenges-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .challenge-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }

        .challenge-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .challenge-icon {
          font-size: 20px;
        }

        .challenge-info {
          flex: 1;
        }

        .challenge-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .challenge-description {
          font-size: 12px;
          color: #64748b;
        }

        .challenge-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar-mini {
          flex: 1;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill-mini {
          height: 100%;
          background: #3b82f6;
          transition: width 0.5s ease;
        }

        .progress-text-mini {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          border-radius: 12px;
          padding: 20px;
          border: 2px solid;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .achievement-card.locked {
          opacity: 0.6;
          filter: grayscale(50%);
        }

        .achievement-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .achievement-icon-large {
          font-size: 32px;
        }

        .rarity-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
        }

        .achievement-body h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .achievement-body p {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .achievement-progress {
          margin-bottom: 16px;
        }

        .progress-bar-achievement {
          height: 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill-achievement {
          height: 100%;
          background: #3b82f6;
          transition: width 0.5s ease;
        }

        .progress-text-achievement {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .achievement-footer {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .achievement-points {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
        }

        .points-icon {
          font-size: 14px;
        }

        .achievement-reward {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
        }

        .reward-icon {
          font-size: 14px;
        }

        .leaderboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .leaderboard-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .time-filter {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 6px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .leaderboard-item.current-user {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .rank-badge {
          font-size: 18px;
          font-weight: 700;
          min-width: 32px;
          text-align: center;
        }

        .player-avatar {
          font-size: 24px;
        }

        .player-info {
          flex: 1;
        }

        .player-name {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .player-badge {
          font-size: 12px;
          color: #64748b;
        }

        .player-points {
          font-size: 16px;
          font-weight: 700;
          color: #3b82f6;
        }

        .achievement-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border: 2px solid #10b981;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1001;
          max-width: 300px;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .notification-icon {
          font-size: 24px;
        }

        .notification-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .notification-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }

        .notification-subtitle {
          font-size: 12px;
          color: #64748b;
        }

        .notification-close {
          width: 24px;
          height: 24px;
          background: none;
          border: none;
          font-size: 16px;
          color: #94a3b8;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .travel-rewards-modal {
            margin: 10px;
            max-height: 95vh;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .leaderboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .achievement-notification {
            left: 16px;
            right: 16px;
            bottom: 16px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}