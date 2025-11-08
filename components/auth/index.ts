/**
 * Auth Components Barrel Export
 *
 * Centralized exports for all authentication-related components
 * This helps with module resolution on Vercel and provides a cleaner import API
 */

// Export AuthModals components
export { AuthModalProvider, useAuthModal, default as AuthModals } from './AuthModals';

// Export SessionProvider
export { SessionProvider } from './SessionProvider';

// Export SignInButton
export { SignInButton } from './SignInButton';
