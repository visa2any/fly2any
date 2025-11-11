# User Preferences - Integration Examples

Complete examples showing how to integrate user preferences throughout the application.

---

## Example 1: Pre-fill Flight Search Form

Use user's preferred cabin class and home airport in the search form:

```typescript
// app/flights/search/page.tsx
import { auth } from '@/lib/auth';
import { preferencesService } from '@/lib/services/preferences';

export default async function FlightSearchPage() {
  const session = await auth();
  let defaultValues = {
    cabinClass: 'economy',
    origin: '',
    airlines: [],
  };

  if (session?.user?.id) {
    const prefs = await preferencesService.getPreferences(session.user.id);
    if (prefs) {
      defaultValues = {
        cabinClass: prefs.preferredCabinClass || 'economy',
        origin: prefs.homeAirport || '',
        airlines: prefs.preferredAirlines || [],
      };
    }
  }

  return <FlightSearchForm defaultValues={defaultValues} />;
}
```

---

## Example 2: Filter Flight Results by Preferred Airlines

Show preferred airlines at the top of results:

```typescript
// lib/utils/filterFlights.ts
import { preferencesService } from '@/lib/services/preferences';

export async function sortFlightsByPreferences(
  flights: Flight[],
  userId: string
) {
  const prefs = await preferencesService.getPreferences(userId);

  if (!prefs?.preferredAirlines?.length) {
    return flights;
  }

  const preferred = flights.filter(f =>
    prefs.preferredAirlines.includes(f.airline)
  );

  const others = flights.filter(f =>
    !prefs.preferredAirlines.includes(f.airline)
  );

  return [...preferred, ...others];
}
```

---

## Example 3: Send Emails Based on Notification Preferences

Check preferences before sending emails:

```typescript
// lib/email/notifications.ts
import { preferencesService } from '@/lib/services/preferences';
import { sendEmail } from '@/lib/email';

export async function sendPriceAlertEmail(
  userId: string,
  userEmail: string,
  alertData: PriceAlertData
) {
  // Check if user wants price alert emails
  const prefs = await preferencesService.getPreferences(userId);

  if (!prefs?.emailNotifications || !prefs?.priceAlertEmails) {
    console.log(`User ${userId} has disabled price alert emails`);
    return false;
  }

  // User has notifications enabled, send email
  await sendEmail({
    to: userEmail,
    subject: 'Price Alert: Price Dropped!',
    template: 'price-alert',
    data: alertData,
  });

  return true;
}

export async function sendNewsletterEmail(
  userId: string,
  userEmail: string,
  newsletterData: NewsletterData
) {
  const prefs = await preferencesService.getPreferences(userId);

  // Only send if user opted in to newsletter
  if (!prefs?.newsletterOptIn) {
    return false;
  }

  await sendEmail({
    to: userEmail,
    subject: 'Your Weekly Travel Newsletter',
    template: 'newsletter',
    data: newsletterData,
  });

  return true;
}
```

---

## Example 4: Display Prices in User's Preferred Currency

Convert and display prices in user's currency:

```typescript
// components/FlightCard.tsx
'use client';

import { useEffect, useState } from 'react';

export function FlightCard({ flight, userId }) {
  const [currency, setCurrency] = useState('USD');
  const [convertedPrice, setConvertedPrice] = useState(flight.price);

  useEffect(() => {
    async function loadCurrency() {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const { data } = await response.json();
        if (data?.currency) {
          setCurrency(data.currency);
          // Convert price to user's currency
          const converted = await convertCurrency(
            flight.price,
            'USD',
            data.currency
          );
          setConvertedPrice(converted);
        }
      }
    }

    if (userId) {
      loadCurrency();
    }
  }, [userId, flight.price]);

  return (
    <div className="flight-card">
      <h3>{flight.airline} - {flight.flightNumber}</h3>
      <p className="price">
        {currency} {convertedPrice.toFixed(2)}
      </p>
    </div>
  );
}
```

---

## Example 5: Apply Theme Preference

Apply user's theme preference to the entire app:

```typescript
// app/layout.tsx
import { auth } from '@/lib/auth';
import { preferencesService } from '@/lib/services/preferences';

export default async function RootLayout({ children }) {
  const session = await auth();
  let theme = 'light';

  if (session?.user?.id) {
    const prefs = await preferencesService.getPreferences(session.user.id);
    theme = prefs?.theme || 'light';
  }

  return (
    <html lang="en" className={theme}>
      <body>{children}</body>
    </html>
  );
}
```

Or use client-side theme switching:

```typescript
// components/ThemeProvider.tsx
'use client';

import { useEffect, useState } from 'react';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    async function loadTheme() {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const { data } = await response.json();
        const userTheme = data?.theme || 'light';

        // Apply theme
        if (userTheme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
          setTheme(prefersDark ? 'dark' : 'light');
        } else {
          document.documentElement.classList.toggle('dark', userTheme === 'dark');
          setTheme(userTheme);
        }
      }
    }

    loadTheme();
  }, []);

  return <>{children}</>;
}
```

---

## Example 6: Localize Content Based on Language Preference

Use language preference for internationalization:

```typescript
// lib/i18n/getTranslations.ts
import { preferencesService } from '@/lib/services/preferences';

export async function getTranslations(userId: string) {
  const prefs = await preferencesService.getPreferences(userId);
  const language = prefs?.language || 'en';

  // Load translations for user's language
  const translations = await import(`@/locales/${language}.json`);
  return translations.default;
}

// Usage in component
export async function WelcomeMessage({ userId }) {
  const t = await getTranslations(userId);

  return (
    <div>
      <h1>{t.welcome}</h1>
      <p>{t.tagline}</p>
    </div>
  );
}
```

---

## Example 7: Create Account Hook for Preferences

Client-side React hook for easy access:

```typescript
// hooks/useUserPreferences.ts
import { useEffect, useState } from 'react';
import { UserPreferences } from '@/lib/services/preferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      const response = await fetch('/api/preferences');

      if (!response.ok) {
        throw new Error('Failed to load preferences');
      }

      const { data } = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences(updates: Partial<UserPreferences>) {
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const { data } = await response.json();
      setPreferences(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refresh: loadPreferences,
  };
}

// Usage in component
function MyComponent() {
  const { preferences, loading, updatePreferences } = useUserPreferences();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Currency: {preferences?.currency}</p>
      <button onClick={() => updatePreferences({ currency: 'EUR' })}>
        Switch to EUR
      </button>
    </div>
  );
}
```

---

## Example 8: Middleware to Apply Preferences

Apply preferences globally via middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { preferencesService } from '@/lib/services/preferences';

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (session?.user?.id) {
    const prefs = await preferencesService.getPreferences(session.user.id);

    // Add preferences to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-currency', prefs?.currency || 'USD');
    requestHeaders.set('x-user-language', prefs?.language || 'en');
    requestHeaders.set('x-user-theme', prefs?.theme || 'light');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/flights/:path*', '/hotels/:path*'],
};
```

---

## Example 9: Deal Notification Service

Background job to send deals based on preferences:

```typescript
// scripts/sendDealNotifications.ts
import { prisma } from '@/lib/prisma';
import { preferencesService } from '@/lib/services/preferences';
import { sendEmail } from '@/lib/email';

async function sendDealNotifications() {
  // Get all users with deal alerts enabled
  const users = await prisma.user.findMany({
    include: {
      preferences: true,
    },
  });

  const deals = await fetchLatestDeals();

  for (const user of users) {
    // Check if user wants deal alerts
    if (!user.preferences?.emailNotifications || !user.preferences?.dealAlerts) {
      continue;
    }

    // Filter deals by user preferences
    const relevantDeals = deals.filter(deal => {
      // Match preferred airlines
      if (user.preferences.preferredAirlines?.length > 0) {
        return user.preferences.preferredAirlines.includes(deal.airline);
      }

      // Match home airport
      if (user.preferences.homeAirport) {
        return deal.origin === user.preferences.homeAirport;
      }

      return true;
    });

    if (relevantDeals.length > 0) {
      await sendEmail({
        to: user.email,
        subject: 'New Travel Deals for You!',
        template: 'deals',
        data: {
          deals: relevantDeals,
          currency: user.preferences.currency,
        },
      });
    }
  }
}

// Run daily
setInterval(sendDealNotifications, 24 * 60 * 60 * 1000);
```

---

## Example 10: Context Provider for Preferences

Provide preferences throughout the app:

```typescript
// contexts/PreferencesContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserPreferences } from '@/lib/services/preferences';

interface PreferencesContextType {
  preferences: UserPreferences | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const { data } = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences(updates: Partial<UserPreferences>) {
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const { data } = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}

// Usage
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}

// Any component
function MyComponent() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <div>
      <p>Theme: {preferences?.theme}</p>
    </div>
  );
}
```

---

## Example 11: Admin Dashboard - View User Preferences

Admin interface to view user preferences:

```typescript
// app/admin/users/[id]/preferences/page.tsx
import { preferencesService } from '@/lib/services/preferences';

export default async function AdminUserPreferences({
  params
}: {
  params: { id: string }
}) {
  const preferences = await preferencesService.getPreferences(params.id);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Preferences</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Travel Preferences</h2>
          <dl className="space-y-2">
            <dt className="text-sm text-gray-600">Cabin Class:</dt>
            <dd className="font-medium">{preferences?.preferredCabinClass || 'None'}</dd>

            <dt className="text-sm text-gray-600">Airlines:</dt>
            <dd className="font-medium">
              {preferences?.preferredAirlines?.join(', ') || 'None'}
            </dd>

            <dt className="text-sm text-gray-600">Home Airport:</dt>
            <dd className="font-medium">{preferences?.homeAirport || 'None'}</dd>
          </dl>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Notifications</h2>
          <dl className="space-y-2">
            <dt className="text-sm text-gray-600">Email:</dt>
            <dd className="font-medium">
              {preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
            </dd>

            <dt className="text-sm text-gray-600">Price Alerts:</dt>
            <dd className="font-medium">
              {preferences?.priceAlertEmails ? 'Enabled' : 'Disabled'}
            </dd>

            <dt className="text-sm text-gray-600">Newsletter:</dt>
            <dd className="font-medium">
              {preferences?.newsletterOptIn ? 'Subscribed' : 'Not subscribed'}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
```

---

## Example 12: Analytics - Track Preference Usage

Track which preferences are most commonly used:

```typescript
// lib/analytics/preferenceTracking.ts
import { prisma } from '@/lib/prisma';

export async function getPreferenceStatistics() {
  const allPreferences = await prisma.userPreferences.findMany();

  const stats = {
    totalUsers: allPreferences.length,
    cabinClassDistribution: {
      economy: 0,
      premium: 0,
      business: 0,
      first: 0,
      none: 0,
    },
    averagePreferredAirlines: 0,
    currencyDistribution: {} as Record<string, number>,
    languageDistribution: {} as Record<string, number>,
    themeDistribution: {
      light: 0,
      dark: 0,
      auto: 0,
    },
    notificationOptInRates: {
      email: 0,
      priceAlerts: 0,
      deals: 0,
      newsletter: 0,
    },
  };

  allPreferences.forEach(pref => {
    // Cabin class
    if (pref.preferredCabinClass) {
      stats.cabinClassDistribution[pref.preferredCabinClass]++;
    } else {
      stats.cabinClassDistribution.none++;
    }

    // Airlines
    stats.averagePreferredAirlines += pref.preferredAirlines.length;

    // Currency
    stats.currencyDistribution[pref.currency] =
      (stats.currencyDistribution[pref.currency] || 0) + 1;

    // Language
    stats.languageDistribution[pref.language] =
      (stats.languageDistribution[pref.language] || 0) + 1;

    // Theme
    stats.themeDistribution[pref.theme as keyof typeof stats.themeDistribution]++;

    // Notifications
    if (pref.emailNotifications) stats.notificationOptInRates.email++;
    if (pref.priceAlertEmails) stats.notificationOptInRates.priceAlerts++;
    if (pref.dealAlerts) stats.notificationOptInRates.deals++;
    if (pref.newsletterOptIn) stats.notificationOptInRates.newsletter++;
  });

  stats.averagePreferredAirlines /= stats.totalUsers;

  return stats;
}
```

---

## Summary

These examples demonstrate how to:
1. Pre-fill forms with user preferences
2. Filter and sort results based on preferences
3. Send emails respecting notification settings
4. Display prices in user's currency
5. Apply theme preferences
6. Localize content by language
7. Create reusable hooks and contexts
8. Use middleware for global application
9. Build automated notification systems
10. Create admin dashboards
11. Track preference analytics

All integration points are production-ready and follow best practices for Next.js 14, TypeScript, and Prisma.
