'use client';

/**
 * EXAMPLE USAGE OF AUTH MODALS
 *
 * This file demonstrates how to integrate the AuthModals system into your application.
 * Copy these patterns into your actual components as needed.
 */

import { AuthModalProvider, useAuthModal } from './AuthModals';
import { User, LogIn, UserPlus } from 'lucide-react';

// ==================== EXAMPLE 1: WRAPPING YOUR APP ====================

/**
 * Wrap your app (or specific pages) with AuthModalProvider
 * This is typically done in your root layout or a specific page layout
 */
export function AppWithAuthModals({ children }: { children: React.ReactNode }) {
  return (
    <AuthModalProvider defaultLanguage="en">
      {children}
    </AuthModalProvider>
  );
}

// ==================== EXAMPLE 2: USING THE HOOK IN COMPONENTS ====================

/**
 * Use the useAuthModal hook in any component to trigger the modals
 */
export function HeaderWithAuthButtons() {
  const { showSignup, showLogin } = useAuthModal();

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="text-xl font-bold">Fly2Any</div>

      <div className="flex items-center gap-3">
        <button
          onClick={showLogin}
          className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>

        <button
          onClick={showSignup}
          className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Sign Up
        </button>
      </div>
    </header>
  );
}

// ==================== EXAMPLE 3: CONTEXTUAL AUTH PROMPTS ====================

/**
 * Show auth modals based on user actions
 */
export function BookingFlowWithAuth() {
  const { showSignup, showLogin } = useAuthModal();

  const handleBookingClick = () => {
    // Check if user is authenticated
    const isAuthenticated = false; // Replace with actual auth check

    if (!isAuthenticated) {
      // Show signup modal with incentive to create account
      showSignup();
    } else {
      // Proceed with booking
      console.log('Proceeding to booking...');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Complete Your Booking</h2>
      <p className="text-gray-600 mb-6">
        Sign up now to save your booking and get 10% off your first purchase!
      </p>
      <button
        onClick={handleBookingClick}
        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        Continue to Payment
      </button>
    </div>
  );
}

// ==================== EXAMPLE 4: PROTECTED CONTENT ====================

/**
 * Show auth modal when accessing protected content
 */
export function ProtectedFeatureCard() {
  const { showLogin } = useAuthModal();
  const isAuthenticated = false; // Replace with actual auth check

  if (!isAuthenticated) {
    return (
      <div className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-200 text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sign In to Access Price Alerts
        </h3>
        <p className="text-gray-600 mb-4">
          Get notified when prices drop on your favorite routes
        </p>
        <button
          onClick={showLogin}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-2xl border border-gray-200">
      {/* Protected content here */}
      <h3 className="text-xl font-bold mb-4">Your Price Alerts</h3>
      {/* ... */}
    </div>
  );
}

// ==================== EXAMPLE 5: MULTI-LANGUAGE SUPPORT ====================

/**
 * Switch language dynamically
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useAuthModal();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
          language === 'en'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('pt')}
        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
          language === 'pt'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
          language === 'es'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        ES
      </button>
    </div>
  );
}

// ==================== EXAMPLE 6: INTEGRATION WITH AI ASSISTANT ====================

/**
 * Trigger auth modals from AI chat
 */
export function AIAssistantWithAuth() {
  const { showSignup, showLogin } = useAuthModal();

  const handleAIAuthPrompt = (action: 'signup' | 'login') => {
    if (action === 'signup') {
      showSignup();
    } else {
      showLogin();
    }
  };

  // This would be called from your AI assistant component
  // when the AI detects the user needs to authenticate
  return (
    <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl">
      <p className="text-sm text-gray-700 mb-3">
        I can help you book that flight! Would you like to create an account to save your preferences and get 10% off your first booking?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handleAIAuthPrompt('signup')}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Create Free Account
        </button>
        <button
          onClick={() => handleAIAuthPrompt('login')}
          className="px-4 py-2 bg-white hover:bg-gray-50 border-2 border-primary-600 text-primary-600 text-sm font-semibold rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// ==================== EXAMPLE 7: COMPLETE PAGE EXAMPLE ====================

/**
 * Complete page example showing everything together
 */
export function CompletePageExample() {
  return (
    <AuthModalProvider defaultLanguage="en">
      <div className="min-h-screen bg-gray-50">
        <HeaderWithAuthButtons />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to Fly2Any
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
              <ProtectedFeatureCard />
              <BookingFlowWithAuth />
            </div>

            <div className="flex justify-end">
              <LanguageSwitcher />
            </div>
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. ✅ Wrap your app with <AuthModalProvider>
 *    - Add to app/layout.tsx or specific page layouts
 *    - Set defaultLanguage prop
 *
 * 2. ✅ Import and use the hook in components
 *    - import { useAuthModal } from '@/components/auth/AuthModals'
 *    - const { showSignup, showLogin, closeModal } = useAuthModal()
 *
 * 3. ✅ Replace placeholder auth logic
 *    - Search for "TODO: Integrate with NextAuth" in AuthModals.tsx
 *    - Implement actual NextAuth integration
 *    - Connect to your backend API
 *
 * 4. ✅ Update links
 *    - /terms → Your terms of service page
 *    - /privacy → Your privacy policy page
 *
 * 5. ✅ Test all scenarios
 *    - Signup flow
 *    - Login flow
 *    - Social auth (Google, Apple)
 *    - Form validation
 *    - Error handling
 *    - Mobile responsiveness
 *
 * 6. ✅ Customize as needed
 *    - Update incentive text
 *    - Modify colors to match brand
 *    - Add/remove features
 *    - Adjust translations
 */
