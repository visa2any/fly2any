'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import { Mail, Lock, User, Plane, Eye, EyeOff, CheckCircle2, Loader2, AlertTriangle, Globe, Shield, Star, Home, Users, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

// Context-aware content
const HOST_PATHS = ['/host', '/list-your-property'];

const contextContent = {
  host: {
    heading: (
      <>
        Start earning
        <br />
        with your
        <br />
        <span className="text-secondary-300">property.</span>
      </>
    ),
    subtitle: 'Create an account to list your property, manage bookings, and maximize your revenue.',
    formTitle: 'Create host account',
    formSubtitle: 'List your property and start earning',
    stats: [
      { value: '10K+', label: 'Active Hosts', icon: Users },
      { value: '98%', label: 'Occupancy', icon: TrendingUp },
      { value: '24/7', label: 'Support', icon: Shield },
      { value: 'Real-time', label: 'Analytics', icon: BarChart3 },
    ],
  },
  traveler: {
    heading: (
      <>
        Join the
        <br />
        travel
        <br />
        <span className="text-secondary-300">community.</span>
      </>
    ),
    subtitle: 'Create an account to save searches, set price alerts, and get exclusive deals.',
    formTitle: 'Create your account',
    formSubtitle: 'Join Fly2Any for exclusive deals & easy bookings',
    stats: [
      { value: '900+', label: 'Airlines', icon: Plane },
      { value: '500K+', label: 'Travelers', icon: Globe },
      { value: '4.8/5', label: 'Rating', icon: Star },
      { value: '256-bit', label: 'Encryption', icon: Shield },
    ],
  },
};

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get('callbackUrl') || '/account';

  // Detect context from callbackUrl
  const context = useMemo(() => {
    return HOST_PATHS.some(p => callbackUrl?.includes(p)) ? 'host' : 'traveler';
  }, [callbackUrl]);

  const content = contextContent[context];

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Google Auth
  const {
    isLoading: isGoogleLoading,
    signInWithPopup,
  } = useGoogleAuth({
    callbackUrl,
    context: 'signup',
    enableOneTap: true,
    onError: (err) => setError(err),
  });

  const handleGoogleSignUp = async () => {
    setError('');
    await signInWithPopup();
  };

  const handleCredentialsSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — silently block bots
    if (honeypot) {
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); setSuccess(true); }, 1500);
      return;
    }

    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, website: honeypot }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but failed to sign in. Please sign in manually.');
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-error-500', 'bg-warning-500', 'bg-secondary-500', 'bg-success-500'];
    return { strength, label: labels[strength - 1] || '', color: colors[strength - 1] || '' };
  };

  const passwordStrength = getPasswordStrength();

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
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white/25 transition-all shadow-lg">
                {context === 'host' ? (
                  <Home className="w-6 h-6 text-white" />
                ) : (
                  <Plane className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-2xl font-black text-white tracking-tight">FLY2ANY</span>
            </Link>
          </motion.div>

          {/* Hero Text */}
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

          {/* Trust Stats */}
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
          RIGHT PANEL — Signup Form (viewport-locked)
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-[100dvh] bg-neutral-50 overflow-hidden">
        {/* Mobile-only top bar */}
        <div className="lg:hidden bg-gradient-to-r from-primary-500 to-primary-600 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-4 flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
              {context === 'host' ? (
                <Home className="w-4.5 h-4.5 text-white" />
              ) : (
                <Plane className="w-4.5 h-4.5 text-white" />
              )}
            </div>
            <span className="text-lg font-black text-white tracking-tight">FLY2ANY</span>
          </Link>
        </div>

        {/* Form — centered, no scroll */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 overflow-hidden">
          <div className="w-full max-w-[400px]">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-800 mb-1.5 tracking-tight">
                {content.formTitle}
              </h1>
              <p className="text-neutral-500 text-sm">
                {content.formSubtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Success */}
              {success && (
                <div className="mb-3 p-3 bg-success-50 border-2 border-success-200 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                  <span className="text-success-700 text-xs font-semibold">Account created! Signing you in...</span>
                </div>
              )}

              {/* Google Sign Up — Disabled until OAuth is configured */}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 bg-error-50 border-2 border-error-200 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-error-500 flex-shrink-0 mt-0.5" />
                    <p className="text-error-700 text-xs font-semibold">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleCredentialsSignUp} className="space-y-3">
                {/* Honeypot — hidden from humans, bots auto-fill */}
                <div className="absolute" style={{ left: '-9999px', top: '-9999px' }} aria-hidden="true">
                  <label htmlFor="signup-website">Website</label>
                  <input
                    id="signup-website"
                    name="website"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-neutral-600 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-neutral-800 font-medium placeholder:text-neutral-400 outline-none text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-neutral-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                  <label htmlFor="password" className="block text-xs font-semibold text-neutral-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-2.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-neutral-800 font-medium placeholder:text-neutral-400 outline-none text-sm"
                      placeholder="At least 8 characters"
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
                  {/* Password strength */}
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold ${
                        passwordStrength.strength <= 1 ? 'text-error-500' :
                        passwordStrength.strength === 2 ? 'text-warning-500' :
                        passwordStrength.strength === 3 ? 'text-secondary-600' : 'text-success-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-neutral-600 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-11 py-2.5 bg-white border-2 rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-neutral-800 font-medium placeholder:text-neutral-400 outline-none text-sm ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-error-300 focus:border-error-500'
                          : confirmPassword && confirmPassword === password
                          ? 'border-success-300 focus:border-success-500'
                          : 'border-neutral-200 focus:border-primary-500'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-0.5"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`mt-1 text-[10px] font-semibold ${
                      confirmPassword === password ? 'text-success-600' : 'text-error-500'
                    }`}>
                      {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-4 text-center text-sm text-neutral-500">
                Already have an account?{' '}
                <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                  Sign in
                </Link>
              </div>
            </motion.div>

            {/* Terms */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center text-[11px] text-neutral-400 leading-relaxed"
            >
              By creating an account, you agree to our{' '}
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

export default function SignUpPage() {
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
      <SignUpContent />
    </Suspense>
  );
}
