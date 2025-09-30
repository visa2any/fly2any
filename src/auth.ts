import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { nextAuthLogger, logAuthEvent } from "@/lib/auth-logger"

// Environment validation for secure credentials
function validateEnvironmentCredentials() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  // Validate NextAuth secret
  if (!nextAuthSecret) {
    console.warn('⚠️  [AUTH] NEXTAUTH_SECRET not set - using fallback (not secure for production)');
  }

  // Validate admin credentials
  if (!adminEmail || !adminPassword) {
    console.warn('⚠️  [AUTH] Using fallback credentials - set ADMIN_EMAIL and ADMIN_PASSWORD in environment');
  }

  return {
    email: adminEmail || 'admin@fly2any.com',
    password: adminPassword || 'fly2any2024!',
    secret: nextAuthSecret || 'fly2any-dev-secret-2024'
  };
}

// Admin credentials with environment validation
const ADMIN_CREDENTIALS = validateEnvironmentCredentials();

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          logAuthEvent('info', 'AUTHORIZATION_ATTEMPT', {
            email: credentials?.email,
            hasPassword: !!credentials?.password,
            timestamp: new Date().toISOString()
          });

          if (!credentials?.email || !credentials?.password) {
            logAuthEvent('error', 'MISSING_CREDENTIALS', { provided: { email: !!credentials?.email, password: !!credentials?.password } });
            return null;
          }

          // Enhanced input validation
          if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
            logAuthEvent('error', 'INVALID_CREDENTIAL_TYPES', {
              emailType: typeof credentials.email,
              passwordType: typeof credentials.password
            });
            return null;
          }

          if (credentials.email.length > 254 || credentials.password.length > 128) {
            logAuthEvent('error', 'CREDENTIALS_TOO_LONG', {
              emailLength: credentials.email.length,
              passwordLength: credentials.password.length
            });
            return null;
          }

          // Check admin credentials
          if (credentials.email === ADMIN_CREDENTIALS.email &&
              credentials.password === ADMIN_CREDENTIALS.password) {
            logAuthEvent('info', 'ADMIN_LOGIN_SUCCESS', {
              email: ADMIN_CREDENTIALS.email,
              userId: 'admin'
            });
            return {
              id: 'admin',
              email: ADMIN_CREDENTIALS.email,
              name: 'Administrator',
              role: 'admin'
            };
          }

          logAuthEvent('warn', 'INVALID_CREDENTIALS', {
            attemptedEmail: credentials.email
          });
          return null;
        } catch (error) {
          logAuthEvent('error', 'AUTHORIZATION_EXCEPTION', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        if (user) {
          // Type-safe user assignment
          token.role = user.role || 'admin';
          token.loginTime = Date.now();
          token.id = user.id;
        }

        // Handle session updates for App Router
        if (trigger === 'update') {
          // Token is preserved but refreshed
          token.loginTime = Date.now();
        }

        return token;
      } catch (error) {
        logAuthEvent('error', 'JWT_CALLBACK_ERROR', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          // Type-safe session assignment
          session.user.role = token.role as string;
          session.user.loginTime = token.loginTime as number;
          session.user.id = token.id as string;
        }
        return session;
      } catch (error) {
        logAuthEvent('error', 'SESSION_CALLBACK_ERROR', error);
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        logAuthEvent('debug', 'REDIRECT_CALLBACK', { url, baseUrl });

        // Handle relative URLs
        if (url.startsWith("/")) {
          const redirectUrl = `${baseUrl}${url}`;
          logAuthEvent('info', 'RELATIVE_REDIRECT', { redirectUrl });
          return redirectUrl;
        }

        // Handle same-origin URLs
        try {
          if (new URL(url).origin === baseUrl) {
            logAuthEvent('info', 'SAME_ORIGIN_REDIRECT', { url });
            return url;
          }
        } catch {
          // URL parsing failed, fallback to admin
          logAuthEvent('warn', 'URL_PARSING_FAILED', { url });
        }

        // Default fallback
        const fallbackUrl = `${baseUrl}/admin`;
        logAuthEvent('info', 'FALLBACK_REDIRECT', { fallbackUrl });
        return fallbackUrl;
      } catch (error) {
        logAuthEvent('error', 'REDIRECT_CALLBACK_ERROR', error);
        return `${baseUrl}/admin`;
      }
    },
    async authorized({ auth, request }) {
      try {
        // Enhanced authorization for App Router
        const { pathname } = request.nextUrl;

        // Public routes that don't require authentication
        if (pathname.startsWith('/api/auth') ||
            pathname === '/' ||
            pathname.startsWith('/admin/login')) {
          return true;
        }

        // Admin routes require authentication
        if (pathname.startsWith('/admin')) {
          return !!auth?.user;
        }

        // Allow all other routes
        return true;
      } catch (error) {
        logAuthEvent('error', 'AUTHORIZATION_CALLBACK_ERROR', error);
        return false;
      }
    }
  },
  events: {
    async signIn({ user, isNewUser }) {
      logAuthEvent('info', 'USER_SIGNED_IN', {
        userId: user.id,
        email: user.email,
        isNewUser,
        timestamp: new Date().toISOString()
      });
    },
    async signOut(message) {
      // NextAuth v5 compatible - message can be { session, token } depending on strategy
      let userId;
      if ('token' in message && message.token) {
        userId = message.token.id || message.token.sub;
      } else if ('session' in message && message.session) {
        // AdapterSession might have userId directly
        userId = (message.session as any).userId || (message.session as any).user?.id;
      }

      logAuthEvent('info', 'USER_SIGNED_OUT', {
        userId,
        timestamp: new Date().toISOString()
      });
    },
    async session({ session, token }) {
      // Track session usage in debug mode only
      if (process.env.NODE_ENV === 'development') {
        logAuthEvent('debug', 'SESSION_ACCESSED', {
          userId: session?.user?.id,
          hasToken: !!token
        });
      }
    }
  },
  secret: ADMIN_CREDENTIALS.secret,
  debug: false,
  logger: {
    error: (error: Error) => nextAuthLogger.error(error.message, { error }),
    warn: (code: string) => nextAuthLogger.warn(code),
    debug: (code: string) => nextAuthLogger.debug(code)
  },
  // Explicitly disable all debug actions to prevent _log endpoint
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Always false for localhost development
        maxAge: 24 * 60 * 60 // 24 hours in seconds (not milliseconds for cookies)
      }
    }
  },
  experimental: {
    enableWebAuthn: false,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)