/**
 * Onboarding Modal Component
 *
 * Welcome flow for new users with credit bonus celebration
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  DollarSign,
  Users,
  MapPin,
  TrendingUp,
  ArrowRight,
  Gift,
  Check,
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete?: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/user/onboarding');
      if (response.ok) {
        const data = await response.json();
        if (!data.data.isOnboarded) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setCreditsAwarded(data.data.creditsAwarded);
        setStep(4); // Show success step
        setShowConfetti(true);

        setTimeout(() => {
          setIsOpen(false);
          onComplete?.();
        }, 5000);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => step !== 4 && setIsOpen(false)}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#667eea', '#764ba2', '#f59e0b', '#ec4899'][i % 4],
                  }}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          {step !== 4 && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to TripMatch!
              </h2>

              <p className="text-gray-600 mb-8">
                Join thousands of travelers earning rewards while organizing unforgettable group adventures
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Browse Trips</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl">
                  <Users className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Join Groups</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <DollarSign className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Earn Credits</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: How It Works */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-black mb-6 text-center">How TripMatch Works</h2>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Create or Join Trips</h3>
                    <p className="text-sm text-gray-600">
                      Organize your own adventure or join existing group trips to amazing destinations
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Earn Credits</h3>
                    <p className="text-sm text-gray-600">
                      Get 10% in credits when people join your trips (10 credits = $1)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Redeem Rewards</h3>
                    <p className="text-sm text-gray-600">
                      Use credits towards flights, hotels, and activities on future bookings
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Welcome Bonus */}
          {step === 3 && (
            <div className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl animate-pulse">
                  <Gift className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-black mb-4">
                Welcome Bonus!
              </h2>

              <p className="text-gray-600 mb-6">
                To help you get started, we're giving you a special welcome gift:
              </p>

              <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-300">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600 mb-2">
                  100 Credits
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  Worth $10 USD
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Claiming...' : 'Claim My Bonus'}
                  {!loading && <Gift className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-6 flex justify-center"
              >
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
                  <Check className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-black mb-4 text-green-600">
                You're All Set!
              </h2>

              <p className="text-gray-600 mb-6">
                {creditsAwarded} credits have been added to your account
              </p>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl mb-8">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">
                  Start browsing trips or create your own to earn more credits!
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Redirecting you to explore trips...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
