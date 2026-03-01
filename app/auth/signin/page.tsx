'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { Mail, Lock, Plane, Eye, EyeOff, Loader2, AlertTriangle, Globe, Shield, Star, Home, Users, TrendingUp, BarChart3, Briefcase, DollarSign, HeadphonesIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

// ──────────────────────────────────────────────
// Context-aware content: Agent vs Host vs Traveler
// ──────────────────────────────────────────────
const HOST_PATHS = ['/host', '/list-your-property'];
const AGENT_PATHS = ['/agent'];

const contextContent = {
  agent: {
    slogan: 'The smart platform for travel professionals',
    heading: (
      <>
        Your agency.
        <br />
        Your clients.
        <br />
        <span className="text-secondary-300">All in one place.</span>
      </>
    ),
    subtitle: 'Manage quotes, bookings, commissions and client accounts — all from your agent portal.',
    formTitle: 'Agent Portal',
    formSubtitle: 'Sign in to access your bookings & agent dashboard',
    icon: Briefcase,
    stats: [
      { value: 'Up to 15%', label: 'Commission', icon: DollarSign },
      { value: '900+', label: 'Airlines', icon: Plane },
      { value: '24/7', label: 'Agent Support', icon: HeadphonesIcon },
      { value: 'Live', label: 'Booking Tools', icon: BookOpen },
    ],
  },
  host: {
    slogan: 'Grow your hosting business with Fly2Any',
    heading: (
      <>
        Manage your
        <br />
        properties
        <br />
        <span className="text-secondary-300">like a pro.</span>
      </>
    ),
    subtitle: 'Sign in to manage listings, track bookings, view analytics, and connect with guests.',
    formTitle: 'Host sign-in',
    formSubtitle: 'Access your host dashboard & property listings',
    icon: Home,
    stats: [
      { value: '10K+', label: 'Active Hosts', icon: Users },
      { value: '98%', label: 'Occupancy', icon: TrendingUp },
      { value: '24/7', label: 'Support', icon: Shield },
      { value: 'Real-time', label: 'Analytics', icon: BarChart3 },
    ],
  },
  traveler: {
    slogan: 'Fly anywhere. Any airline. Best price.',
    heading: (
      <>
        Your next
        <br />
        adventure
        <br />
        <span className="text-secondary-300">starts here.</span>
      </>
    ),
    subtitle: 'Sign in to access your bookings, saved searches, price alerts, and personalized travel deals.',
    formTitle: 'Welcome back',
    formSubtitle: 'Sign in to access your bookings & saved searches',
    icon: Plane,
    stats: [
      { value: '900+', label: 'Airlines', icon: Plane },
      { value: '500K+', label: 'Travelers', icon: Globe },
      { value: '4.8/5', label: 'Rating', icon: Star },
      { value: '256-bit', label: 'Encryption', icon: Shield },
    ],
  },
};

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/account';
  const urlError = searchParams?.get('error');

  // Detect context from callbackUrl
  const context = useMemo(() => {
    if (AGENT_PATHS.some(p => callbackUrl?.startsWith(p))) return 'agent';
    if (HOST_PATHS.some(p => callbackUrl?.includes(p))) return 'host';
    return 'traveler';
  }, [callbackUrl]);

  const content = contextContent[context];

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Handle OAuth errors from URL
  useEffect(() => {
    if (urlError) {
      const errorMessage = OAUTH_ERROR_MESSAGES[urlError] || OAUTH_ERROR_MESSAGES.Default;
      setError(errorMessage);
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

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — silently block bots
    if (honeypot) {
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); setError('Invalid email or password'); }, 1500);
      return;
    }

    // Block if locked out
    if (lockoutSeconds > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        let errorMsg = result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error;

        // Detect lockout from rate limiter
        const lockoutMatch = errorMsg.match(/Try again in (\d+) minutes?/);
        if (lockoutMatch) {
          setLockoutSeconds(parseInt(lockoutMatch[1]) * 60);
          errorMsg = `Account temporarily locked. Too many failed attempts.`;
        }

        setError(errorMsg);
        accountErrorTracker.trackAuthError('AUTH_SIGNIN_FAILED', result.error, { email }, email);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      accountErrorTracker.trackAuthError('AUTH_SIGNIN_FAILED', 'Unexpected error', { email, error: String(err) }, email);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] flex overflow-hidden">
      {/* ═══════════════════════════════════════════════
          LEFT PANEL — Brand Visual (Desktop only)
          ═══════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500" />

        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        {/* Floating decorative orbs */}
        <div className="absolute top-[15%] right-[10%] w-[300px] h-[300px] bg-secondary-400/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] bg-white/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] right-[30%] w-[180px] h-[180px] bg-primary-300/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/" className="inline-flex flex-col gap-1.5 group">
              <Image
                src="/logo-transparent.png"
                alt="Fly2Any"
                width={140}
                height={42}
                className="w-[140px] h-auto brightness-0 invert drop-shadow-lg"
                priority
              />
              <span className="text-white/80 text-[11px] font-semibold tracking-wide uppercase pl-0.5">
                {content.slogan}
              </span>
            </Link>
          </motion.div>

          {/* Hero Text — Context-aware */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {content.heading}
            </h2>
            <p className="text-white/70 text-lg max-w-sm leading-relaxed font-medium">
              {content.subtitle}
            </p>
          </motion.div>

          {/* Trust Stats — Context-aware */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {content.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-white/90" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/60 font-medium">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT PANEL — Auth Form (viewport-locked, no scroll)
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-[100dvh] bg-neutral-50 overflow-hidden">
        {/* Mobile-only top bar with brand */}
        <div className="lg:hidden bg-gradient-to-r from-primary-500 to-primary-600 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex-shrink-0">
          <Link href="/" className="inline-flex flex-col gap-0.5">
            <Image
              src="/logo-transparent.png"
              alt="Fly2Any"
              width={100}
              height={30}
              className="w-[100px] h-auto brightness-0 invert"
              priority
            />
            <span className="text-white/80 text-[10px] font-semibold tracking-wide uppercase">
              {content.slogan}
            </span>
          </Link>
        </div>

        {/* Auth form — centered vertically, no scroll */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 overflow-hidden">
          <div className="w-full max-w-[400px]">
            {/* Header — Context-aware */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-800 mb-1.5 tracking-tight">
                {content.formTitle}
              </h1>
              <p className="text-neutral-500 text-sm">
                {content.formSubtitle}
              </p>
            </motion.div>

            {/* Auth Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Google Sign In — Disabled until OAuth is configured */}

              {/* Error / Lockout Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 border-2 rounded-xl text-sm ${
                    lockoutSeconds > 0
                      ? 'bg-warning-50 border-warning-200'
                      : 'bg-error-50 border-error-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {lockoutSeconds > 0 ? (
                      <Shield className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-error-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold text-xs ${lockoutSeconds > 0 ? 'text-warning-700' : 'text-error-700'}`}>
                        {error}
                      </p>
                      {lockoutSeconds > 0 && (
                        <p className="mt-1 text-xs text-warning-600 font-mono">
                          Try again in {Math.floor(lockoutSeconds / 60)}:{String(lockoutSeconds % 60).padStart(2, '0')}
                        </p>
                      )}
                      {urlError === 'OAuthAccountNotLinked' && (
                        <p className="mt-1 text-xs text-error-500">
                          Try signing in with email/password or contact support.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleCredentialsSignIn} className="space-y-3.5">
                {/* Honeypot — hidden from humans, bots auto-fill */}
                <div className="absolute" style={{ left: '-9999px', top: '-9999px' }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-neutral-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-[16px] h-[16px] text-neutral-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-neutral-800 font-medium placeholder:text-neutral-400 outline-none text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-semibold text-neutral-600">
                      Password
                    </label>
                    <Link href="/auth/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-[16px] h-[16px] text-neutral-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-neutral-800 font-medium placeholder:text-neutral-400 outline-none text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Sign Up / Register Link */}
              {context === 'agent' ? (
                <div className="mt-5 text-center text-sm text-neutral-500">
                  Not an agent yet?{' '}
                  <Link href="/auth/signup?callbackUrl=%2Fagent%2Fregister" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                    Apply to join
                  </Link>
                </div>
              ) : (
                <div className="mt-5 text-center text-sm text-neutral-500">
                  Don&apos;t have an account?{' '}
                  <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                    Create one
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Terms */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-5 text-center text-[11px] text-neutral-400 leading-relaxed"
            >
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary-500 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] flex items-center justify-center bg-neutral-50 overflow-hidden">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl shadow-primary-500/20 mb-4 animate-pulse">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <p className="text-neutral-400 font-medium text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
