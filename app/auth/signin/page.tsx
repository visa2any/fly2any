'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, Plane, Eye, EyeOff, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';
import { accountErrorTracker } from '@/lib/tracking/account-errors';

// Google Logo SVG Component
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Error messages for OAuth errors
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'This email is already registered with a different sign-in method. Please use your original sign-in method or create a new account.',
  OAuthSignin: 'Error starting the sign-in process. Please try again.',
  OAuthCallback: 'Error during sign-in. Please try again.',
  OAuthCreateAccount: 'Could not create account. Please try again.',
  Callback: 'Sign-in error. Please try again.',
  Default: 'An error occurred during sign-in. Please try again.',
};

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/account';
  const urlError = searchParams?.get('error');
  const isAgentLogin = callbackUrl?.includes('/agent');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle OAuth errors from URL
  useEffect(() => {
    if (urlError) {
      const errorMessage = OAUTH_ERROR_MESSAGES[urlError] || OAUTH_ERROR_MESSAGES.Default;
      setError(errorMessage);

      // Track the error
      accountErrorTracker.trackOAuthError('google', urlError);
    }
  }, [urlError]);

  // Google Auth hook with One Tap + Popup
  const {
    isLoading: isGoogleLoading,
    signInWithPopup,
    isConfigured: isGoogleConfigured
  } = useGoogleAuth({
    callbackUrl,
    context: 'signin',
    enableOneTap: true,
    onError: (err) => setError(err),
  });

  const handleGoogleSignIn = async () => {
    setError('');
    await signInWithPopup();
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start demo');
      router.push('/agent');
    } catch (err) {
      setError('Failed to start demo. Please try again.');
      setIsDemoLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        accountErrorTracker.trackAuthError('AUTH_SIGNIN_FAILED', 'Invalid credentials', { email });
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      accountErrorTracker.trackAuthError('AUTH_SIGNIN_FAILED', 'Unexpected error', { email, error: String(err) });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')] bg-cover bg-center opacity-5" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-[22px] shadow-2xl shadow-blue-500/30 mb-5 hover:scale-105 transition-transform"
          >
            <Plane className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-2 tracking-tight"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-base"
          >
            Sign in to access your bookings & saved searches
          </motion.p>
        </motion.div>

        {/* Sign In Card - Ultra-Premium Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8"
        >

          {/* Google Sign In - Premium Dark Button */}
          {/* Google Sign In - Disabled
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 hover:border-white/30 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
          */}

          {/* Divider */}
          {/* Divider - Disabled
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/50 text-gray-400 font-medium">or sign in with email</span>
            </div>
          </div>
          */}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1 text-red-200">Sign-in Error</p>
                  <p className="text-red-300">{error}</p>
                  {urlError === 'OAuthAccountNotLinked' && (
                    <p className="mt-2 text-xs text-red-400">
                      Try signing in with email/password or contact support if you need help.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-gray-500 backdrop-blur-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-gray-500 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button - Ultra-Premium Gradient */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold rounded-xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-7 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create one
            </Link>
          </div>

          {/* Agent Demo Button - Only show for agent login */}
          {isAgentLogin && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-gray-400 mb-3">
                Want to explore first?
              </p>
              <button
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:from-violet-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isDemoLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>{isDemoLoading ? 'Starting Demo...' : 'Try Agent Demo'}</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Terms & Privacy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
            Privacy Policy
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative text-center z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-[22px] shadow-2xl shadow-blue-500/30 mb-5 animate-pulse">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-400 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
