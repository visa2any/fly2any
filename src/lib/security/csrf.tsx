/**
 * CSRF Protection Utilities
 * 
 * @description Provides Cross-Site Request Forgery (CSRF) protection
 * for forms and API calls in the email marketing system.
 * 
 * @security CRITICAL: All state-changing requests MUST include CSRF protection
 */

import React from 'react';
import { globalRateLimiter } from './sanitization';

// CSRF token storage and management
class CSRFManager {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly TOKEN_LIFETIME_MS = 3600000; // 1 hour

  /**
   * Generate a new CSRF token
   */
  private generateToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for non-browser environments
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get the current CSRF token, generating a new one if needed
   */
  getToken(): string {
    const now = new Date();
    
    // Generate new token if we don't have one or it's expired
    if (!this.token || !this.tokenExpiry || now >= this.tokenExpiry) {
      this.token = this.generateToken();
      this.tokenExpiry = new Date(now.getTime() + this.TOKEN_LIFETIME_MS);
      
      // Store in session storage for persistence across page reloads
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.setItem('csrf_token', this.token);
          window.sessionStorage.setItem('csrf_token_expiry', this.tokenExpiry.toISOString());
        } catch (error) {
          console.warn('Failed to store CSRF token in session storage:', error);
        }
      }
    }

    return this.token;
  }

  /**
   * Initialize CSRF manager and restore token from storage
   */
  initialize(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const storedToken = window.sessionStorage.getItem('csrf_token');
        const storedExpiry = window.sessionStorage.getItem('csrf_token_expiry');
        
        if (storedToken && storedExpiry) {
          const expiry = new Date(storedExpiry);
          const now = new Date();
          
          // Use stored token if it's still valid
          if (expiry > now) {
            this.token = storedToken;
            this.tokenExpiry = expiry;
            return;
          } else {
            // Clean up expired token
            window.sessionStorage.removeItem('csrf_token');
            window.sessionStorage.removeItem('csrf_token_expiry');
          }
        }
      } catch (error) {
        console.warn('Failed to restore CSRF token from session storage:', error);
      }
    }
    
    // Generate new token if we couldn't restore one
    this.getToken();
  }

  /**
   * Validate a CSRF token (for server-side use)
   */
  validateToken(providedToken: string): boolean {
    if (!providedToken || typeof providedToken !== 'string') {
      return false;
    }

    // Check if token matches and is not expired
    return this.token === providedToken && 
           this.tokenExpiry !== null && 
           new Date() < this.tokenExpiry;
  }

  /**
   * Clear the current token (useful for logout)
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
    
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem('csrf_token');
        window.sessionStorage.removeItem('csrf_token_expiry');
      } catch (error) {
        console.warn('Failed to clear CSRF token from session storage:', error);
      }
    }
  }
}

// Global CSRF manager instance
export const csrfManager = new CSRFManager();

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  csrfManager.initialize();
  
  // Make token available globally for legacy code
  (window as any).csrfToken = csrfManager.getToken();
}

/**
 * Get CSRF headers for fetch requests
 */
export function getCSRFHeaders(): Record<string, string> {
  const token = csrfManager.getToken();
  return {
    'X-CSRF-Token': token,
    'X-Requested-With': 'XMLHttpRequest' // Additional CSRF protection
  };
}

/**
 * Secure fetch wrapper with automatic CSRF protection
 */
export async function securityFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Rate limiting check
  const urlKey = `fetch_${new URL(url, window.location.origin).pathname}`;
  if (globalRateLimiter.isRateLimited(urlKey, 60, 60000)) { // 60 requests per minute per endpoint
    throw new Error('Rate limit exceeded for this endpoint');
  }

  // Merge CSRF headers with existing headers
  const csrfHeaders = getCSRFHeaders();
  const mergedOptions: RequestInit = {
    ...options,
    credentials: 'same-origin', // Ensure cookies are sent
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...options.headers,
    }
  };

  // Add timeout if not specified
  if (!mergedOptions.signal) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    mergedOptions.signal = controller.signal;
    
    // Clear timeout when request completes
    const originalFetch = fetch(url, mergedOptions);
    originalFetch.finally(() => clearTimeout(timeoutId));
    return originalFetch;
  }

  return fetch(url, mergedOptions);
}

/**
 * CSRF-protected form submission handler
 */
export function createSecureFormHandler<T extends Record<string, any>>(
  submitHandler: (formData: T, csrfToken: string) => Promise<void>
) {
  return async (formData: T) => {
    // Rate limiting for form submissions
    if (globalRateLimiter.isRateLimited('form_submit', 10, 300000)) { // 10 per 5 minutes
      throw new Error('Form submission rate limit exceeded');
    }

    const csrfToken = csrfManager.getToken();
    
    try {
      await submitHandler(formData, csrfToken);
    } catch (error) {
      console.error('Secure form submission failed:', error);
      throw error;
    }
  };
}

/**
 * Middleware to verify CSRF tokens (for API routes)
 */
export interface CSRFRequest extends Request {
  csrfToken?: string;
  csrfValid?: boolean;
}

export function verifyCSRF(request: CSRFRequest): boolean {
  // Extract CSRF token from headers
  const tokenFromHeader = request.headers.get('X-CSRF-Token');
  const xRequestedWith = request.headers.get('X-Requested-With');
  
  // Check for X-Requested-With header as additional protection
  if (xRequestedWith !== 'XMLHttpRequest') {
    console.warn('CSRF: Missing X-Requested-With header');
    return false;
  }

  if (!tokenFromHeader) {
    console.warn('CSRF: No token provided in request headers');
    return false;
  }

  // For server-side validation, you would typically:
  // 1. Compare against a server-stored token
  // 2. Check token expiration
  // 3. Validate token format
  
  // This is a simplified client-side validation
  // In production, implement proper server-side CSRF validation
  const isValid = tokenFromHeader.length === 64 && /^[a-f0-9]{64}$/.test(tokenFromHeader);
  
  request.csrfToken = tokenFromHeader;
  request.csrfValid = isValid;
  
  return isValid;
}

/**
 * React hook for CSRF protection in forms
 */
export function useCSRFProtection() {
  const getToken = () => csrfManager.getToken();
  const getHeaders = () => getCSRFHeaders();
  
  const protectedFetch = async (url: string, options: RequestInit = {}) => {
    return securityFetch(url, options);
  };

  const createProtectedFormHandler = <T extends Record<string, any>>(
    handler: (formData: T, csrfToken: string) => Promise<void>
  ) => {
    return createSecureFormHandler(handler);
  };

  return {
    getToken,
    getHeaders,
    protectedFetch,
    createProtectedFormHandler
  };
}

/**
 * CSRF token component for forms that need hidden CSRF fields
 */
export const CSRFTokenInput: React.FC<{ name?: string }> = ({ name = '_csrf' }) => {
  const token = csrfManager.getToken();
  
  return (
    <input
      type="hidden"
      name={name}
      value={token}
      readOnly
    />
  );
};

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // CSRF protection
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Content Security Policy for email content
    'Content-Security-Policy': [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'", // Allow inline styles for email templates
      "script-src 'self'", // No unsafe-eval or unsafe-inline
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // Prevent caching of sensitive responses
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

/**
 * Validate origin for additional CSRF protection
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const host = request.headers.get('Host');
  
  if (!host) {
    console.warn('CSRF: No Host header present');
    return false;
  }

  // Allow same-origin requests
  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`, // Allow HTTP in development
  ];

  // Check Origin header (for CORS requests)
  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`CSRF: Invalid origin: ${origin}`);
    return false;
  }

  // Check Referer header (for same-origin requests)
  if (referer) {
    const refererUrl = new URL(referer);
    if (!allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      console.warn(`CSRF: Invalid referer: ${referer}`);
      return false;
    }
  }

  return true;
}

// Export types for TypeScript
export type CSRFRequestType = CSRFRequest;