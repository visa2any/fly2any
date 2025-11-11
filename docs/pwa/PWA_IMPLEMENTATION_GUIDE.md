# Fly2Any PWA Implementation Guide

## Overview

This guide covers the complete Progressive Web App (PWA) implementation for Fly2Any, including offline support, push notifications, background sync, and performance optimizations.

## Architecture

### Core Components

1. **Service Worker** (`public/service-worker.js`)
   - Offline caching strategies
   - Background sync
   - Push notification handling
   - Cache management

2. **Web App Manifest** (`public/manifest.json`)
   - App metadata
   - Icons and screenshots
   - Display modes
   - Shortcuts

3. **PWA Components**
   - `InstallPrompt.tsx` - Installation banner
   - `OfflineIndicator.tsx` - Connection status

4. **Libraries**
   - `lib/sync/background-sync.ts` - Sync queue management
   - `lib/notifications/push-subscription.ts` - Push notification handling
   - `lib/performance/image-loader.ts` - Image optimization

## Installation & Setup

### 1. Database Migration

Run Prisma migration to add PushSubscription model:

```bash
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

### 2. Environment Variables

Add the following to `.env`:

```env
# VAPID Keys for Push Notifications (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

To generate VAPID keys:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 3. Install Dependencies (Optional)

For full push notification support, install web-push:

```bash
npm install web-push
npm install --save-dev @types/web-push
```

### 4. Register Service Worker

Add to your root layout (`app/layout.tsx`):

```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066cc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fly2Any" />
      </head>
      <body>
        {children}

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(reg => console.log('Service Worker registered:', reg.scope))
                  .catch(err => console.error('Service Worker registration failed:', err));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
```

### 5. Add PWA Components

Add to your main layout or app:

```tsx
import InstallPrompt from '@/components/pwa/InstallPrompt';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';

export default function App({ children }) {
  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      {children}
    </>
  );
}
```

## Features

### Offline Support

The service worker implements multiple caching strategies:

#### 1. Cache First (Static Assets)
```javascript
// Used for: Static assets, images
// Strategy: Check cache first, fallback to network
```

#### 2. Network First (API Calls)
```javascript
// Used for: API requests, dynamic content
// Strategy: Try network first, fallback to cache
```

#### 3. Stale While Revalidate (JS/CSS)
```javascript
// Used for: JavaScript, CSS files
// Strategy: Return cached version, update in background
```

#### 4. Network Only (POST/PUT/DELETE)
```javascript
// Used for: Mutations, form submissions
// Strategy: Network only, queue if offline
```

### Background Sync

#### Queueing Actions for Sync

```typescript
import { queueForSync } from '@/lib/sync/background-sync';

// Queue a booking for sync when online
const bookingId = await queueForSync('booking', {
  userId: 'user_123',
  flightId: 'flight_456',
  // ... booking data
});

// Queue a price alert
await queueForSync('price-alert', {
  origin: 'JFK',
  destination: 'LAX',
  targetPrice: 299,
});
```

#### Checking Sync Status

```typescript
import { getSyncStatus, getSyncStats } from '@/lib/sync/background-sync';

const status = await getSyncStatus();
console.log('Pending:', status.pending);
console.log('Last Sync:', status.lastSync);

const stats = await getSyncStats();
console.log('By Type:', stats.byType);
console.log('Failed:', stats.failedCount);
```

### Push Notifications

#### Setup Notifications

```typescript
import { setupPushNotifications } from '@/lib/notifications/push-subscription';

const result = await setupPushNotifications();

if (result.success) {
  console.log('Subscribed:', result.subscription);
} else {
  console.error('Failed:', result.error);
}
```

#### Send Notification (Server-Side)

```typescript
// In your API route or server action
const response = await fetch('/api/pwa/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Price Alert!',
    message: 'Flight to Paris dropped to $399',
    url: '/flights/paris',
    tag: 'price-alert',
  }),
});
```

#### Test Notification (Client-Side)

```typescript
import { showTestNotification } from '@/lib/notifications/push-subscription';

await showTestNotification();
```

### Image Optimization

#### Using the Image Loader

```typescript
import {
  getOptimizedImageUrl,
  createResponsiveImageSet,
  lazyLoadImage
} from '@/lib/performance/image-loader';

// Get optimized URL
const url = getOptimizedImageUrl('/images/hero.jpg', 1200, 80);

// Create responsive image set
const imageSet = await createResponsiveImageSet('/images/hero.jpg', {
  widths: [640, 1024, 1920],
  quality: 85,
});

// Use in img tag
<img
  src={imageSet.src}
  srcSet={imageSet.srcSet}
  sizes={imageSet.sizes}
  alt="Hero"
/>
```

#### Lazy Loading Images

```typescript
import { useEffect, useRef } from 'react';
import { lazyLoadImage } from '@/lib/performance/image-loader';

function ImageComponent({ src }) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current) {
      const cleanup = lazyLoadImage(imgRef.current, src, {
        rootMargin: '100px',
        onLoad: () => console.log('Image loaded'),
      });

      return cleanup;
    }
  }, [src]);

  return <img ref={imgRef} alt="Lazy loaded" />;
}
```

## API Endpoints

### Subscribe to Push Notifications

```http
POST /api/pwa/subscribe
Content-Type: application/json
Authorization: Bearer <token>

{
  "endpoint": "https://fcm.googleapis.com/...",
  "p256dh": "base64_encoded_key",
  "auth": "base64_encoded_key",
  "userAgent": "Mozilla/5.0..."
}
```

### Unsubscribe from Push Notifications

```http
POST /api/pwa/unsubscribe
Content-Type: application/json
Authorization: Bearer <token>

{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

### Send Notification

```http
POST /api/pwa/send-notification
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Notification Title",
  "message": "Notification message",
  "url": "/target-page",
  "tag": "notification-tag"
}
```

### Test Notification

```http
GET /api/pwa/send-notification
Authorization: Bearer <token>
```

## PWA Settings Page

Users can manage PWA features at `/account/pwa-settings`:

- View installation status
- Enable/disable push notifications
- Test notifications
- View background sync status
- Clear cache
- Monitor storage usage

## Caching Strategies

### Static Assets Cache

**Files Cached:**
- `/` (home page)
- `/offline` (offline page)
- `/manifest.json`
- `/favicon.ico`
- Logo files

**Strategy:** Cache first with network fallback
**Duration:** Permanent (until cache version changes)

### API Cache

**Endpoints Cached:**
- All `/api/*` endpoints

**Strategy:** Network first with cache fallback
**Duration:** 5 minutes (configurable)

### Image Cache

**Files Cached:**
- All images (jpg, png, webp, svg)

**Strategy:** Cache first with network fallback
**Duration:** 7 days (configurable)

### Dynamic Cache

**Files Cached:**
- JavaScript bundles
- CSS stylesheets
- Fonts

**Strategy:** Stale while revalidate
**Duration:** Updates in background

## Testing PWA Features

### 1. Test Service Worker Registration

```javascript
// Open DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered service workers:', regs);
});
```

### 2. Test Offline Mode

1. Open Chrome DevTools
2. Go to Application > Service Workers
3. Check "Offline" checkbox
4. Navigate to pages - should show cached content

### 3. Test Push Notifications

1. Go to `/account/pwa-settings`
2. Enable push notifications
3. Click "Send Test Notification"
4. Should see notification appear

### 4. Test Installation

1. Open in Chrome/Edge
2. Look for install prompt in address bar
3. Click install
4. App should open in standalone window

### 5. Test Background Sync

1. Go offline
2. Perform an action (e.g., save search)
3. Go back online
4. Action should sync automatically

## Performance Optimization Tips

### 1. Preload Critical Resources

```tsx
<link rel="preload" href="/critical.css" as="style" />
<link rel="preload" href="/hero-image.jpg" as="image" />
```

### 2. Use WebP Images

```tsx
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Fallback" />
</picture>
```

### 3. Lazy Load Below-the-Fold Content

```tsx
<img loading="lazy" src="/image.jpg" alt="Lazy loaded" />
```

### 4. Optimize Bundle Size

- Use dynamic imports for large components
- Remove unused dependencies
- Enable tree shaking

## Troubleshooting

### Service Worker Not Updating

1. Unregister old service workers:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

2. Hard reload the page (Ctrl+Shift+R)

### Push Notifications Not Working

1. Check VAPID keys are configured
2. Verify notification permission is granted
3. Check subscription is saved to database
4. Ensure web-push library is installed

### Cache Not Clearing

1. Open DevTools > Application > Storage
2. Click "Clear site data"
3. Reload page

### Background Sync Failing

1. Check network requests in DevTools
2. Verify sync queue in localStorage
3. Check service worker logs
4. Ensure API endpoints are accessible

## Browser Support

### Full Support
- Chrome/Edge 90+
- Firefox 90+
- Safari 15.4+
- Opera 76+

### Partial Support
- Safari 14.5-15.3 (no background sync)
- Firefox 88-89 (limited push support)

### Not Supported
- IE 11 (graceful fallback)
- Safari < 14.5

## Security Considerations

1. **HTTPS Required** - PWA features only work on HTTPS
2. **VAPID Keys** - Keep private key secret
3. **Subscription Endpoint** - Validate on server
4. **Cache Scope** - Limit cached sensitive data
5. **Permission Prompts** - Don't spam users

## Performance Metrics

### Target Metrics
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Monitoring
- Use Lighthouse for PWA audits
- Monitor Web Vitals
- Track installation rate
- Monitor notification engagement

## Deployment Checklist

- [ ] Service worker registered
- [ ] Manifest.json configured
- [ ] VAPID keys generated and set
- [ ] Icons created (192x192, 512x512)
- [ ] Offline page tested
- [ ] Push notifications tested
- [ ] Background sync tested
- [ ] Cache strategies verified
- [ ] HTTPS enabled
- [ ] PWA audit passing (Lighthouse)

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Chrome PWA Documentation](https://developer.chrome.com/docs/workbox/)
- [Push Notification Spec](https://www.w3.org/TR/push-api/)
- [Background Sync Spec](https://wicg.github.io/background-sync/spec/)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for errors
- Check service worker status in DevTools
- Contact development team

---

**Last Updated:** 2025-11-10
**Version:** 1.0.0
**Team:** Team 3 - PWA & Performance
