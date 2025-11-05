# Authentication Modals - Implementation Guide

Complete step-by-step guide to integrate the authentication modal system into Fly2Any.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Detailed Implementation](#detailed-implementation)
3. [NextAuth Integration](#nextauth-integration)
4. [Common Patterns](#common-patterns)
5. [Customization](#customization)
6. [Testing](#testing)

---

## Quick Start

### Step 1: Test the Demo

Visit the demo page to see the modals in action:

```bash
npm run dev
# Visit: http://localhost:3000/auth-demo
```

Try clicking different scenarios to see:
- Signup flow with 10% off incentive
- Login flow with password toggle
- Multi-language switching (EN/PT/ES)
- Form validation
- Password strength indicator
- Success animations

### Step 2: Add to Your Layout

Choose where to add the AuthModalProvider:

**Option A: Global (Entire App)**
```tsx
// app/layout.tsx
import { AuthModalProvider } from '@/components/auth/AuthModals';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthModalProvider defaultLanguage="en">
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}
```

**Option B: Specific Pages Only**
```tsx
// app/(marketing)/layout.tsx
import { AuthModalProvider } from '@/components/auth/AuthModals';

export default function MarketingLayout({ children }) {
  return (
    <AuthModalProvider defaultLanguage="en">
      {children}
    </AuthModalProvider>
  );
}
```

### Step 3: Update Your Header/Navigation

Replace your existing sign in button with the hook:

```tsx
// components/layout/Header.tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { LogIn, UserPlus } from 'lucide-react';

export function Header() {
  const { showLogin, showSignup } = useAuthModal();

  return (
    <header>
      {/* ... other header content ... */}

      <div className="flex items-center gap-3">
        <button onClick={showLogin} className="...">
          <LogIn className="w-4 h-4" />
          Sign In
        </button>

        <button onClick={showSignup} className="...">
          <UserPlus className="w-4 h-4" />
          Sign Up
        </button>
      </div>
    </header>
  );
}
```

---

## Detailed Implementation

### 1. Replace Existing Sign In Button

Find all instances of your current sign in button:

```bash
# Search for existing sign in components
grep -r "signin" components/
grep -r "SignInButton" components/
```

**Before:**
```tsx
import { SignInButton } from '@/components/auth/SignInButton';

<SignInButton />
```

**After:**
```tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { User } from 'lucide-react';

function YourComponent() {
  const { showLogin, showSignup } = useAuthModal();

  return (
    <div>
      <button onClick={showLogin}>Sign In</button>
      <button onClick={showSignup}>Sign Up</button>
    </div>
  );
}
```

### 2. Update AI Assistant Integration

The AI assistant already has placeholders for auth - update them:

**File:** `components/ai/AITravelAssistant.tsx`

Find these lines (around line 402-420):
```tsx
<button
  onClick={() => {
    // TODO: Open signup modal
    setShowAuthPrompt(false);
  }}
  className="..."
>
  <UserPlus className="w-3.5 h-3.5" />
  <span>{t.signUp}</span>
</button>
```

**Update to:**
```tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';

// At the top of the component:
function AITravelAssistant({ language = 'en' }: Props) {
  const { showSignup, showLogin } = useAuthModal();

  // ... existing code ...

  // In the auth prompt section:
  <button
    onClick={() => {
      showSignup();
      setShowAuthPrompt(false);
    }}
    className="..."
  >
    <UserPlus className="w-3.5 h-3.5" />
    <span>{t.signUp}</span>
  </button>

  <button
    onClick={() => {
      showLogin();
      setShowAuthPrompt(false);
    }}
    className="..."
  >
    <LogIn className="w-3.5 h-3.5" />
    <span>{t.signIn}</span>
  </button>
}
```

### 3. Add to Booking Flow

Trigger signup before checkout to offer 10% discount:

```tsx
// app/flights/booking/page.tsx or similar
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { useSession } from 'next-auth/react';

export default function BookingPage() {
  const { showSignup } = useAuthModal();
  const { data: session } = useSession();

  const handleContinueToPayment = () => {
    if (!session) {
      // Show signup modal with 10% off incentive
      showSignup();
    } else {
      // User is authenticated, proceed
      router.push('/checkout');
    }
  };

  return (
    <div>
      {/* Booking form */}

      {!session && (
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl mb-6">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Get 10% off by creating a free account!
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Plus earn rewards, track your bookings, and get exclusive deals.
          </p>
          <button
            onClick={showSignup}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold text-sm"
          >
            Create Account & Save 10%
          </button>
        </div>
      )}

      <button onClick={handleContinueToPayment}>
        Continue to Payment
      </button>
    </div>
  );
}
```

### 4. Protected Features

Show auth modal for protected features:

```tsx
// components/features/PriceAlerts.tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { useSession } from 'next-auth/react';

export function PriceAlerts() {
  const { showLogin } = useAuthModal();
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingDown className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sign In to Set Price Alerts
        </h3>
        <p className="text-gray-600 mb-4">
          Get notified when prices drop on your favorite routes
        </p>
        <button
          onClick={showLogin}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Price alerts interface for authenticated users */}
    </div>
  );
}
```

---

## NextAuth Integration

### Step 1: Create Signup API Route

```tsx
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db/connection';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
```

### Step 2: Update NextAuth Configuration

```tsx
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db/connection';

const handler = NextAuth({
  providers: [
    // Email & Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Apple OAuth
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/', // Redirect to home (modal will handle it)
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

### Step 3: Update AuthModals Component

Find the `handleSubmit` function in `AuthModals.tsx` and update:

```tsx
// In components/auth/AuthModals.tsx

import { signIn } from 'next-auth/react';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    if (currentModal === 'signup') {
      // Create user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Sign in after successful signup
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
    } else {
      // Sign in
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }
    }

    // Show success state
    setShowSuccess(true);

    // Close modal and refresh after delay
    setTimeout(() => {
      closeModal();
      window.location.reload(); // Refresh to update session
    }, 2000);

  } catch (error: any) {
    console.error('Authentication error:', error);
    setErrors({
      email: error.message || 'Authentication failed. Please try again.'
    });
  } finally {
    setIsLoading(false);
  }
};
```

Update social auth:

```tsx
const handleSocialAuth = async (provider: 'google' | 'apple') => {
  setIsLoading(true);
  try {
    await signIn(provider, { callbackUrl: '/' });
  } catch (error) {
    console.error(`${provider} auth error:`, error);
    setErrors({ email: `Failed to sign in with ${provider}` });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Environment Variables

Add to `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

---

## Common Patterns

### Pattern 1: Conditional Rendering Based on Auth

```tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { useSession } from 'next-auth/react';

export function ConditionalFeature() {
  const { showLogin } = useAuthModal();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <button onClick={showLogin}>
        Sign In to Access
      </button>
    );
  }

  return <div>Protected content</div>;
}
```

### Pattern 2: Programmatic Modal Trigger

```tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function AutoAuthPrompt() {
  const { showSignup } = useAuthModal();
  const { data: session } = useSession();

  useEffect(() => {
    // Show signup after user has been on site for 30 seconds
    if (!session) {
      const timer = setTimeout(() => {
        showSignup();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [session, showSignup]);

  return null;
}
```

### Pattern 3: Exit Intent Popup

```tsx
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function ExitIntentAuth() {
  const { showSignup } = useAuthModal();
  const { data: session } = useSession();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (session || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showSignup();
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [session, hasShown, showSignup]);

  return null;
}
```

---

## Customization

### Update Brand Colors

The modals use your Tailwind theme colors. No changes needed if your theme is already configured!

### Update Incentive Text

```tsx
// In translations object
incentiveTitle: 'GET 15% OFF',  // Change from 10%
incentiveSubtitle: 'Your First Flight',  // Customize
incentiveDetails: 'Limited time offer for new members',
```

### Update Features List

```tsx
// In translations object
feature1: 'Your custom feature 1',
feature2: 'Your custom feature 2',
feature3: 'Your custom feature 3',
feature4: 'Your custom feature 4',
```

### Update Stats

```tsx
// In the right panel section
<div className="text-3xl font-bold mb-1">750K+</div>
<div className="text-xs text-white/80">Your Stat</div>
```

---

## Testing

### Manual Testing Checklist

- [ ] Signup modal opens correctly
- [ ] Login modal opens correctly
- [ ] Can switch between signup/login
- [ ] Email validation works
- [ ] Password validation works
- [ ] Password strength meter updates
- [ ] Name fields validation (signup only)
- [ ] Terms checkbox validation (signup only)
- [ ] Remember me checkbox works (login)
- [ ] Forgot password link works
- [ ] Social auth buttons appear
- [ ] ESC key closes modal
- [ ] Backdrop click closes modal
- [ ] Success animation displays
- [ ] Language switching works (EN/PT/ES)
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Loading states display
- [ ] Error messages display

### Test in Different Browsers

```bash
# Chrome
npm run dev

# Firefox
# Open in Firefox

# Safari
# Open in Safari

# Mobile
# Use Chrome DevTools mobile emulation
```

### Test Integration

```tsx
// Create a test component
'use client';

import { useAuthModal } from '@/components/auth/AuthModals';

export function AuthTest() {
  const { showSignup, showLogin, currentModal, language, setLanguage } = useAuthModal();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Auth Modal Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>Current Modal: {currentModal || 'none'}</p>
        <p>Language: {language}</p>
      </div>

      <button onClick={showSignup}>Test Signup</button>
      <button onClick={showLogin}>Test Login</button>
      <button onClick={() => setLanguage('pt')}>Portuguese</button>
      <button onClick={() => setLanguage('es')}>Spanish</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

---

## Troubleshooting

### Modal doesn't appear

**Problem:** Clicking buttons doesn't show modal

**Solutions:**
1. Ensure `AuthModalProvider` wraps your component
2. Check browser console for errors
3. Verify z-index isn't being overridden
4. Check if another element is blocking clicks

### Hook error

**Problem:** `useAuthModal must be used within AuthModalProvider`

**Solution:** Wrap your component tree with `AuthModalProvider`

### Styling issues

**Problem:** Modal looks broken or unstyled

**Solutions:**
1. Clear Next.js cache: `rm -rf .next`
2. Verify Tailwind is configured correctly
3. Check `tailwind.config.ts` includes the component path
4. Restart dev server

### Form submission fails

**Problem:** Clicking submit doesn't work

**Solutions:**
1. Check browser console for errors
2. Verify API routes exist
3. Check NextAuth configuration
4. Test with mock data first

### Social auth doesn't work

**Problem:** Google/Apple buttons don't work

**Solutions:**
1. Verify environment variables are set
2. Check OAuth credentials in Google/Apple console
3. Ensure callback URLs are configured
4. Check NextAuth provider configuration

---

## Next Steps

1. ✅ Test the demo at `/auth-demo`
2. ✅ Add `AuthModalProvider` to your layout
3. ✅ Replace existing sign in buttons
4. ✅ Integrate with booking flow
5. ✅ Set up NextAuth (if not already done)
6. ✅ Configure OAuth providers
7. ✅ Test thoroughly
8. ✅ Deploy!

---

**Questions?** Check the README or review the example file.

**Created for Fly2Any** | Last Updated: 2025-11-04
