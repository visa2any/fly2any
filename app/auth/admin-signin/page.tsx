'use client';

import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { Mail, Lock, Plane, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

function AdminSignInContent() {
  const searchParams = useSearchParams()!;
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin';

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const SIGN_IN_TIMEOUT = 15000;

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), SIGN_IN_TIMEOUT)
      );

      const result = await Promise.race([
        signIn('credentials', {
          email,
          password,
          redirect: false,
        }),
        timeoutPromise
      ]) as any;

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(result.error || 'Authentication failed');
        }
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.message === 'TIMEOUT') {
        setError('Connection timed out. The database might be waking up or responding slowly. Please try again in a moment.');
      } else {
        setError('An unexpected error occurred. Please check your connection and try again.');
      }
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[22px] shadow-xl mb-5 animate-pulse">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <p className="text-neutral-500 font-medium">
            {status === 'authenticated' ? 'Redirecting to Dashboard...' : 'Checking Session...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
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

        {/* Sign In Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-neutral-200/50 p-8 border border-white/50">

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
