'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Mail, Lock, Plane, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';

// Google Logo SVG Component
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function AdminSignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin';

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Auth hook - admin context prevents auto-signup
  const {
    isLoading: isGoogleLoading,
    signInWithPopup,
    isConfigured: isGoogleConfigured
  } = useGoogleAuth({
    callbackUrl,
    context: 'admin',
    enableOneTap: false,
    onError: (err) => setError(err),
  });

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Sign in with Google
      const result = await signIn('google', {
        callbackUrl: `/auth/admin-signin?verified=true&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        redirect: false,
      });

      if (result?.error) {
        setError('User not found. Admin accounts must be created by administrators.');
        setIsLoading(false);
      } else if (result?.ok) {
        // User exists, proceed to admin verification
        window.location.href = result.url || callbackUrl;
      } else {
        setError('Google sign-in failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
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
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header - Apple-Class */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[22px] shadow-xl shadow-primary-500/30 mb-5 transform hover:scale-105 transition-transform">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">
            Admin Access
          </h1>
          <p className="text-neutral-500 text-[15px]">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Sign In Card - Apple-Class Glass Morphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-neutral-200/50 p-8 border border-white/50">

          {/* Google Sign In - Apple-Class Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-neutral-200 rounded-2xl text-neutral-700 font-semibold hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            ) : (
              <GoogleLogo />
            )}
            <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-400 font-medium">or sign in with email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-neutral-900 font-medium placeholder:text-neutral-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-neutral-900 font-medium placeholder:text-neutral-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button - Apple-Class Primary */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg active:scale-[0.98] text-[15px]"
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

          {/* Info Message */}
          <div className="mt-7 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-blue-700 text-sm font-medium">
              Admin accounts are managed by the system. Contact your administrator if you need access.
            </p>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary-500 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-500 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[22px] shadow-xl mb-5 animate-pulse">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <p className="text-neutral-500 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <AdminSignInContent />
    </Suspense>
  );
}
