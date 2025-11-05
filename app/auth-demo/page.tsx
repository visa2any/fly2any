'use client';

/**
 * AUTHENTICATION MODALS DEMO PAGE
 *
 * This page demonstrates the AuthModals system with various use cases.
 * Visit /auth-demo to see it in action!
 */

import { AuthModalProvider, useAuthModal } from '@/components/auth/AuthModals';
import {
  User,
  LogIn,
  UserPlus,
  Sparkles,
  Gift,
  Shield,
  Star,
  TrendingDown,
  Globe,
  CheckCircle2
} from 'lucide-react';

function DemoContent() {
  const { showSignup, showLogin, language, setLanguage } = useAuthModal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fly2Any</h1>
                <p className="text-xs text-gray-500">Auth Modals Demo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['en', 'pt', 'es'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      language === lang
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Auth Buttons */}
              <button
                onClick={showLogin}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>

              <button
                onClick={showSignup}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-6">
            <Gift className="w-4 h-4" />
            Limited Time: 10% Off First Booking
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
            Experience the Best
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Travel Booking Platform
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join over 500,000 smart travelers who save up to 70% on flights, hotels, and packages.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={showSignup}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-5 h-5" />
              Get Started Free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={showLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 border-2 border-primary-600 text-primary-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Free Cancellation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Scenarios */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Try Different Scenarios
          </h2>
          <p className="text-gray-600 mb-12 text-center">
            Click any card to see how the auth modals work in different contexts
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Scenario 1: Booking */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-500 p-6 transition-all hover:shadow-xl cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Book with Discount
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Sign up to unlock exclusive 10% off on your first booking
              </p>
              <button
                onClick={showSignup}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Get 10% Off Now
              </button>
            </div>

            {/* Scenario 2: Price Alerts */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-secondary-500 p-6 transition-all hover:shadow-xl cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Set Price Alerts
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Create an account to get notified when prices drop
              </p>
              <button
                onClick={showSignup}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Enable Alerts
              </button>
            </div>

            {/* Scenario 3: Saved Searches */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 p-6 transition-all hover:shadow-xl cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Save Your Searches
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Sign in to access your saved searches and bookings
              </p>
              <button
                onClick={showLogin}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Access Saved Items
              </button>
            </div>

            {/* Scenario 4: Member Benefits */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 p-6 transition-all hover:shadow-xl cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Member Exclusive
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Join to access members-only deals and rewards
              </p>
              <button
                onClick={showSignup}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Become a Member
              </button>
            </div>

            {/* Scenario 5: Returning User */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 p-6 transition-all hover:shadow-xl cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Sign in to continue where you left off
              </p>
              <button
                onClick={showLogin}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Scenario 6: Multi-language */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-500 p-6 transition-all hover:shadow-xl cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Change Language
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Switch to Portuguese or Spanish to see translations
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-orange-100 rounded-lg font-semibold text-sm transition-colors"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('pt')}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-orange-100 rounded-lg font-semibold text-sm transition-colors"
                >
                  PT
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-orange-100 rounded-lg font-semibold text-sm transition-colors"
                >
                  ES
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Create an Account?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">10% Off First Booking</h3>
              <p className="text-sm text-gray-600">
                Exclusive welcome discount for new members
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Price Alerts</h3>
              <p className="text-sm text-gray-600">
                Get notified when prices drop on your routes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Collect points on every booking you make
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-sm text-gray-600">
                Your data is encrypted and protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Authentication Modals Demo</strong> - Created for Fly2Any
            </p>
            <p>
              This demo showcases the comprehensive auth modal system with multi-language support,
              conversion optimization, and beautiful design.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AuthDemoPage() {
  return (
    <AuthModalProvider defaultLanguage="en">
      <DemoContent />
    </AuthModalProvider>
  );
}
