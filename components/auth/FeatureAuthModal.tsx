'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  X,
  Heart,
  Scale,
  Bell,
  Gift,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Star,
  Lock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Feature configurations for different login walls
const FEATURE_CONFIG = {
  wishlist: {
    icon: Heart,
    title: 'Save to Wishlist',
    subtitle: 'Keep track of your favorite destinations',
    benefits: [
      'Save unlimited flights & hotels',
      'Get price drop alerts',
      'Access from any device',
    ],
    gradient: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
  },
  compare: {
    icon: Scale,
    title: 'Compare & Decide',
    subtitle: 'Side-by-side comparison made easy',
    benefits: [
      'Compare up to 4 options',
      'Save comparisons for later',
      'Share with travel companions',
    ],
    gradient: 'from-info-500 to-primary-500',
    iconBg: 'bg-info-100',
    iconColor: 'text-info-500',
  },
  priceAlert: {
    icon: Bell,
    title: 'Price Drop Alerts',
    subtitle: 'Never miss a deal',
    benefits: [
      'Instant email notifications',
      'Track multiple routes',
      'Historical price trends',
    ],
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  loyalty: {
    icon: Star,
    title: 'Earn Rewards',
    subtitle: 'Join our loyalty program',
    benefits: [
      'Earn 5% cashback on hotels',
      'Exclusive member discounts',
      'Priority customer support',
    ],
    gradient: 'from-purple-500 to-violet-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
  booking: {
    icon: Lock,
    title: 'Complete Your Booking',
    subtitle: 'Sign in to finish checkout',
    benefits: [
      'Manage all bookings in one place',
      'Easy cancellation & changes',
      'Earn loyalty points',
    ],
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
  },
  savedSearch: {
    icon: Bell,
    title: 'Save Your Search',
    subtitle: 'Track flights and get price alerts',
    benefits: [
      'Save unlimited searches',
      'Get instant price drop alerts',
      'Sync across all devices',
    ],
    gradient: 'from-primary-500 to-purple-500',
    iconBg: 'bg-primary-100',
    iconColor: 'text-indigo-500',
  },
};

export type FeatureType = keyof typeof FEATURE_CONFIG;

interface FeatureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feature: FeatureType;
  productContext?: {
    name: string;
    price?: number;
    currency?: string;
    image?: string;
  };
}

type AuthMode = 'signin' | 'signup';

export function FeatureAuthModal({
  isOpen,
  onClose,
  onSuccess,
  feature,
  productContext,
}: FeatureAuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signup'); // Default to signup for new users
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const config = FEATURE_CONFIG[feature];
  const FeatureIcon = config.icon;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setShowPassword(false);
    setMode('signup');
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: window.location.href,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Welcome! You now have access to all features.');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

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
        toast.success('Welcome back!');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      if (signInResult?.ok) {
        toast.success('Account created! Use code WELCOME5 for 5% off your first booking.');
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${config.gradient} px-6 py-5 text-white rounded-t-2xl overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <FeatureIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{config.title}</h2>
                <p className="text-white/80 text-sm">{config.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product context preview */}
          {productContext && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {productContext.image && (
                  <img
                    src={productContext.image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{productContext.name}</p>
                  {productContext.price && (
                    <p className="text-white/80 text-sm">
                      {productContext.currency || '$'}{productContext.price}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-700">Member Benefits</span>
            </div>
            <ul className="space-y-2">
              {config.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <div className={`w-5 h-5 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <FeatureIcon className={`w-3 h-3 ${config.iconColor}`} />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Welcome offer banner */}
          <div className="mb-5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-800">New Member Bonus!</p>
                <p className="text-xs text-amber-600">Use code <span className="font-mono font-bold">WELCOME5</span> for 5% off</p>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
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

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleSignUp} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required={mode === 'signup'}
                disabled={isLoading}
              />
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${config.gradient} text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <FeatureIcon className="w-4 h-4" />
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Continue as guest (for booking only) */}
          {feature === 'booking' && (
            <button
              onClick={handleClose}
              className="w-full mt-3 py-2.5 px-4 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Continue as guest instead
            </button>
          )}

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for easy feature auth modal usage
import { createContext, useContext, ReactNode, useCallback } from 'react';

interface FeatureAuthContextType {
  showAuthModal: (feature: FeatureType, productContext?: FeatureAuthModalProps['productContext']) => Promise<boolean>;
}

const FeatureAuthContext = createContext<FeatureAuthContextType | null>(null);

export function FeatureAuthProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    feature: FeatureType;
    productContext?: FeatureAuthModalProps['productContext'];
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    feature: 'wishlist',
  });

  const showAuthModal = useCallback((
    feature: FeatureType,
    productContext?: FeatureAuthModalProps['productContext']
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        feature,
        productContext,
        resolve,
      });
    });
  }, []);

  const handleClose = () => {
    modalState.resolve?.(false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSuccess = () => {
    modalState.resolve?.(true);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <FeatureAuthContext.Provider value={{ showAuthModal }}>
      {children}
      <FeatureAuthModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        feature={modalState.feature}
        productContext={modalState.productContext}
      />
    </FeatureAuthContext.Provider>
  );
}

export function useFeatureAuth() {
  const context = useContext(FeatureAuthContext);
  if (!context) {
    throw new Error('useFeatureAuth must be used within a FeatureAuthProvider');
  }
  return context;
}

export default FeatureAuthModal;
