'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Plane,
  ArrowRight,
  AlertCircle,
  Loader2,
  Gift,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  flightContext?: {
    origin: string;
    destination: string;
    departDate: string;
    price: number;
    currency: string;
  };
}

type AuthMode = 'signin' | 'signup';

export function AuthModal({ isOpen, onClose, onSuccess, flightContext }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the same Google auth hook as signin page
  const {
    isLoading: isGoogleLoading,
    signInWithPopup,
    isConfigured: isGoogleConfigured
  } = useGoogleAuth({
    callbackUrl: '/account',
    context: 'signin',
    enableOneTap: false, // Don't show One Tap in modal
    onSuccess: () => {
      toast.success('Welcome back!');
      onSuccess();
    },
    onError: (err) => {
      setError(err);
      toast.error('Sign-in failed');
    },
  });

  // Capture referral code from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');

      if (refParam) {
        setReferralCode(refParam.toUpperCase());
        // Store in localStorage for later use
        localStorage.setItem('pendingReferralCode', refParam.toUpperCase());
      } else {
        // Check if there's a stored referral code
        const storedRef = localStorage.getItem('pendingReferralCode');
        if (storedRef) {
          setReferralCode(storedRef);
        }
      }
    }
  }, []);

  // Reset form when modal opens/closes
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setShowPassword(false);
    setMode('signin');
    onClose();
  };

  // Google sign in using the hook
  const handleGoogleSignIn = async () => {
    setError('');
    await signInWithPopup();
  };

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Signed in successfully!');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      const errorMessage = err.message || 'Invalid email or password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call registration API (include referral code if present)
      const response = await fetch('/api/auth/register-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      if (signInResult?.ok) {
        // Clear stored referral code after successful registration
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingReferralCode');
        }
        toast.success('Account created successfully!');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Sign-up error:', err);
      const errorMessage = err.message || 'Failed to create account';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header - Matching CreatePriceAlert design */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3.5 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Sign in to track prices</h2>
                <p className="text-primary-100 text-xs">Get notified when prices drop</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Flight Context Preview */}
          {flightContext && (
            <div className="mb-4 p-3.5 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Plane className="w-4 h-4 text-primary-500" />
                <span className="font-bold text-gray-900">{flightContext.origin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-bold text-gray-900">{flightContext.destination}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {new Date(flightContext.departDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-gray-500">•</span>
                <span className="font-bold text-blue-600">
                  {flightContext.currency}{flightContext.price}
                </span>
              </div>
            </div>
          )}

          {/* Social Login - Google */}
          <div className="mb-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  <span className="text-sm font-semibold text-gray-600">Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Sign In / Sign Up Tabs */}
          <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleSignUp} className="space-y-3.5">
            {/* Name field (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required={mode === 'signup'}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="mt-1.5 text-xs text-gray-500">
                  At least 6 characters
                </p>
              )}
            </div>

            {/* Referral Code (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Referral Code <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Gift className="w-4 h-4 text-primary-500" />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="FLY2A-XXXXX"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    disabled={isLoading}
                    maxLength={12}
                  />
                </div>
                {referralCode && (
                  <p className="mt-1.5 text-xs text-primary-600 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    You'll join the referrer's network and earn points together!
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Forgot Password (Sign In only) */}
            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Notice */}
          <div className="mt-4 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
