# PWA Quick Start Guide

## 5-Minute Setup

### 1. Database Migration (1 min)
```bash
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

### 2. Generate VAPID Keys (1 min)
```bash
npx web-push generate-vapid-keys
```

Add to `.env`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 3. Register Service Worker (1 min)
Add to `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066cc" />
      </head>
      <body>
        {children}

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/service-worker.js')
                .catch(err => console.error('SW registration failed:', err));
            }
          `}
        </Script>
      </body>
    </html>
  );
}
```

### 4. Add PWA Components (1 min)
Add to your main layout:

```tsx
import InstallPrompt from '@/components/pwa/InstallPrompt';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';

export default function Layout({ children }) {
  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      {children}
    </>
  );
}
```

### 5. Test (1 min)
1. Start dev server: `npm run dev`
2. Open in Chrome
3. Open DevTools > Application > Service Workers
4. Check "Service Worker" is registered
5. Go offline - should show offline page

## Using PWA Features

### Queue Action for Background Sync
```tsx
import { queueForSync } from '@/lib/sync/background-sync';

// Queue when user performs action
await queueForSync('booking', bookingData);
```

### Enable Push Notifications
```tsx
import { setupPushNotifications } from '@/lib/notifications/push-subscription';

const result = await setupPushNotifications();
if (result.success) {
  console.log('Notifications enabled!');
}
```

### Optimize Images
```tsx
import { getOptimizedImageUrl } from '@/lib/performance/image-loader';

const url = getOptimizedImageUrl('/image.jpg', 800, 80);
```

### Use PWA Hook
```tsx
import { usePWA } from '@/lib/pwa/use-pwa';

function MyComponent() {
  const [state, actions] = usePWA();

  return (
    <div>
      <p>Online: {state.isOnline ? 'Yes' : 'No'}</p>
      <p>Installed: {state.isInstalled ? 'Yes' : 'No'}</p>
      {state.isInstallable && (
        <button onClick={actions.promptInstall}>
          Install App
        </button>
      )}
    </div>
  );
}
```

## Test Checklist

- [ ] Service worker registered
- [ ] Offline page shows when disconnected
- [ ] Install prompt appears
- [ ] Can install to home screen
- [ ] Notifications can be enabled
- [ ] Settings page works at `/account/pwa-settings`

## Common Issues

**Service worker not registering?**
- Check HTTPS is enabled
- Clear browser cache
- Check console for errors

**Push notifications not working?**
- VAPID keys must be set
- User must grant permission
- web-push library needed for production

**Offline page not showing?**
- Service worker must be active
- Navigate to a page first to cache it
- Check cache in DevTools > Application

## Next Steps

1. Read full guide: `docs/pwa/PWA_IMPLEMENTATION_GUIDE.md`
2. Install web-push: `npm install web-push`
3. Test on mobile devices
4. Run Lighthouse audit
5. Deploy to production

## Resources

- Full Documentation: `docs/pwa/PWA_IMPLEMENTATION_GUIDE.md`
- Implementation Summary: `docs/pwa/TEAM3_PWA_SUMMARY.md`
- PWA Settings: `/account/pwa-settings`

---

Need help? Check the troubleshooting section in the full guide.
