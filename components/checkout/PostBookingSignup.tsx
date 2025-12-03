'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Gift,
  Star,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Sparkles,
  Heart,
  Bell,
  Shield,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PostBookingSignupProps {
  bookingId: string;
  guestEmail: string;
  guestName?: string;
  bookingAmount: number;
  pointsEarned?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PostBookingSignup({
  bookingId,
  guestEmail,
  guestName,
  bookingAmount,
  pointsEarned,
  onClose,
  onSuccess,
}: PostBookingSignupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'prompt' | 'form' | 'success'>('prompt');

  // Calculate estimated points (10 points per dollar + bonus for new signup)
  const estimatedPoints = pointsEarned || Math.round(bookingAmount * 10);
  const signupBonusPoints = 500;

  const handleCreateAccount = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create account with the email already used for booking
      const response = await fetch('/api/auth/register-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestEmail,
          password,
          name: guestName,
          linkBookingId: bookingId, // Link the booking to the new account
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Auto sign in
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: guestEmail,
        password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      if (signInResult?.ok) {
        setStep('success');
        toast.success('Account created! Your booking is now linked.');
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signIn('google', {
        callbackUrl: `/account/bookings?linkBooking=${bookingId}`,
      });
    } catch (err) {
      setIsLoading(false);
      toast.error('Failed to sign in with Google');
    }
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Gift className="w-5 h-5" />
          <span className="font-medium">Earn {estimatedPoints.toLocaleString()} points!</span>
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Success State */}
          {step === 'success' ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Fly2Any!</h2>
              <p className="text-gray-600 mb-4">
                Your account has been created and your booking is linked.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-lg">{(estimatedPoints + signupBonusPoints).toLocaleString()} points</span>
                </div>
                <p className="text-sm text-purple-600">added to your account</p>
              </div>
              <p className="text-xs text-gray-500">Redirecting to your account...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Don't Miss Your Rewards!</h2>
                      <p className="text-white/80 text-sm">Create account to claim your points</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Points Preview */}
                <div className="relative mt-4 bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/80">Points from this booking</p>
                      <p className="text-2xl font-bold">{estimatedPoints.toLocaleString()} pts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/80">+ Sign up bonus</p>
                      <p className="text-xl font-bold text-amber-300">+{signupBonusPoints} pts</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                    <span className="text-sm">Total you'll earn:</span>
                    <span className="text-xl font-bold text-amber-200">{(estimatedPoints + signupBonusPoints).toLocaleString()} pts</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'prompt' ? (
                  <>
                    {/* Benefits */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Star className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Earn 5% Cashback</p>
                          <p className="text-sm text-gray-600">On all future hotel bookings</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Heart className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Save Favorites</p>
                          <p className="text-sm text-gray-600">Wishlist hotels and track prices</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bell className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Price Alerts</p>
                          <p className="text-sm text-gray-600">Get notified when prices drop</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => setStep('form')}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Claim {(estimatedPoints + signupBonusPoints).toLocaleString()} Points
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700"
                    >
                      Maybe later
                    </button>
                  </>
                ) : (
                  <>
                    {/* Email Display */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Account email</p>
                        <p className="font-medium text-gray-900">{guestEmail}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                    </div>

                    {/* Google Signup */}
                    <button
                      onClick={handleGoogleSignup}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="font-semibold text-gray-700">Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Password Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Create a password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setError('');
                            }}
                            placeholder="At least 6 characters"
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}

                      <button
                        onClick={handleCreateAccount}
                        disabled={isLoading || !password}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <User className="w-5 h-5" />
                            Create Account & Claim Points
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setStep('prompt')}
                        className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
                        disabled={isLoading}
                      >
                        Back
                      </button>
                    </div>

                    {/* Security Note */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="w-3 h-3" />
                      <span>Your data is secure and encrypted</span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PostBookingSignup;
