'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gift, X, Copy, Check, Share2, Users, Sparkles,
  Twitter, Facebook, MessageCircle, Send, Mail
} from 'lucide-react'

interface ReferralPromptProps {
  variant: 'booking-success' | 'post-search' | 'inline' | 'modal'
  referralCode?: string
  reward?: { referrer: number; referee: number }
  onClose?: () => void
  onShare?: (platform: string) => void
}

const DEFAULT_REWARD = { referrer: 500, referee: 250 } // Points

export function ReferralPrompt({
  variant,
  referralCode = 'FLY2ANY',
  reward = DEFAULT_REWARD,
  onClose,
  onShare
}: ReferralPromptProps) {
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const referralLink = `https://fly2any.com/r/${referralCode}`
  const shareText = `Join me on Fly2Any and save on your next flight! Use my code ${referralCode} for ${reward.referee} bonus points.`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`,
    facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralLink)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent('Save on flights with Fly2Any!')}&body=${encodeURIComponent(shareText + '\n\n' + referralLink)}`
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    onShare?.(platform)
  }

  // Inline compact variant
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Share & Earn {reward.referrer} points</p>
            <p className="text-xs text-gray-500">Invite friends, both get rewarded</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
          >
            Share
          </motion.button>
        </div>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-3 pt-3 border-t border-purple-100">
                {[
                  { key: 'twitter', icon: Twitter, color: 'bg-sky-500' },
                  { key: 'facebook', icon: Facebook, color: 'bg-blue-600' },
                  { key: 'whatsapp', icon: MessageCircle, color: 'bg-green-500' },
                  { key: 'telegram', icon: Send, color: 'bg-sky-400' },
                  { key: 'email', icon: Mail, color: 'bg-gray-600' }
                ].map(social => (
                  <motion.button
                    key={social.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(social.key as any)}
                    className={`${social.color} text-white p-2.5 rounded-lg hover:opacity-90`}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Post-search floating prompt
  if (variant === 'post-search') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Share & Save Together</span>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            Know someone planning a trip? Share Fly2Any and you'll both get rewarded!
          </p>

          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-purple-600">{reward.referrer}</p>
              <p className="text-xs text-gray-500">pts for you</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-pink-600">{reward.referee}</p>
              <p className="text-xs text-gray-500">pts for them</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="flex justify-center gap-3 mt-4">
            {[
              { key: 'twitter', icon: Twitter, color: 'bg-sky-500' },
              { key: 'whatsapp', icon: MessageCircle, color: 'bg-green-500' },
              { key: 'telegram', icon: Send, color: 'bg-sky-400' }
            ].map(social => (
              <motion.button
                key={social.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(social.key as any)}
                className={`${social.color} text-white p-3 rounded-xl hover:opacity-90`}
              >
                <social.icon className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  // Booking success variant - Prominent celebration
  if (variant === 'booking-success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Share the Joy!</h3>
              <p className="text-white/80 text-sm">Invite friends & both earn rewards</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <p className="text-3xl font-bold">{reward.referrer}</p>
              <p className="text-sm text-white/80">Points for you</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <Gift className="w-6 h-6 mx-auto mb-2" />
              <p className="text-3xl font-bold">{reward.referee}</p>
              <p className="text-sm text-white/80">Points for friend</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/50"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                copied
                  ? 'bg-green-500'
                  : 'bg-white text-purple-600 hover:bg-white/90'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : 'Copy'}
            </motion.button>
          </div>

          <div className="flex justify-center gap-3">
            {[
              { key: 'twitter', icon: Twitter, label: 'Twitter' },
              { key: 'facebook', icon: Facebook, label: 'Facebook' },
              { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
              { key: 'email', icon: Mail, label: 'Email' }
            ].map(social => (
              <motion.button
                key={social.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(social.key as any)}
                className="bg-white/10 backdrop-blur hover:bg-white/20 p-3 rounded-xl transition-colors"
                title={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  // Modal variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Share & Earn Together</h2>
          <p className="text-white/80">Invite friends to Fly2Any</p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-purple-600">{reward.referrer}</p>
              <p className="text-sm text-gray-500">Points for you</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-pink-600">{reward.referee}</p>
              <p className="text-sm text-gray-500">Points for friend</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`px-5 py-3 rounded-xl font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { key: 'twitter', icon: Twitter, color: 'bg-sky-500' },
              { key: 'facebook', icon: Facebook, color: 'bg-blue-600' },
              { key: 'whatsapp', icon: MessageCircle, color: 'bg-green-500' },
              { key: 'telegram', icon: Send, color: 'bg-sky-400' },
              { key: 'email', icon: Mail, color: 'bg-gray-600' }
            ].map(social => (
              <motion.button
                key={social.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(social.key as any)}
                className={`${social.color} text-white p-3 rounded-xl hover:opacity-90`}
              >
                <social.icon className="w-5 h-5 mx-auto" />
              </motion.button>
            ))}
          </div>
        </div>

        {onClose && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Maybe Later
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
