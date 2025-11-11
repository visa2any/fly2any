# Notification System - Quick Start Guide

**Team 2 - Notification & Communication**

Get started with the notification system in 5 minutes.

---

## Prerequisites

- Database migration applied
- Prisma client generated
- User authentication working (NextAuth)

---

## Step 1: Apply Database Migration

```bash
# Navigate to project root
cd C:\Users\Power\fly2any-fresh

# Create migration
npx prisma migrate dev --name add_notification_system

# Generate Prisma client (already done)
npx prisma generate
```

---

## Step 2: Add NotificationBell to Header

Find your header/navbar component and add the notification bell:

```tsx
// In your header component (e.g., components/Header.tsx)
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useSession } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between p-4">
      {/* Your existing header content */}

      {/* Add this before user menu */}
      {session?.user?.id && (
        <NotificationBell
          userId={session.user.id}
          enableSound={false} // Set to true for sound notifications
        />
      )}

      {/* User menu, etc. */}
    </header>
  );
}
```

---

## Step 3: Add Link to Notification Center

Add a link to the notification center in your account navigation:

```tsx
// In your account sidebar/navigation
<Link href="/account/notifications">
  <Bell className="h-5 w-5" />
  Notifications
</Link>
```

The notification center page is already created at `/account/notifications`.

---

## Step 4: Create Test Notifications

Test the system by creating some notifications:

```typescript
// In your API route or server action
import { createNotification } from '@/lib/services/notifications';

// Example 1: Simple notification
await createNotification({
  userId: 'user-id-here',
  type: 'system_update',
  title: 'Welcome to Notifications!',
  message: 'You can now receive real-time updates about your bookings and price alerts.',
  priority: 'low',
});

// Example 2: Booking confirmation
import { sendBookingConfirmationNotification } from '@/lib/services/notifications';

await sendBookingConfirmationNotification(
  userId,
  bookingId,
  {
    origin: 'JFK',
    destination: 'LAX',
    departDate: '2024-12-25',
    totalPrice: 299.99,
    currency: 'USD',
  }
);

// Example 3: Price alert
import { sendPriceAlertNotification } from '@/lib/services/notifications';

await sendPriceAlertNotification(
  userId,
  priceAlertId,
  {
    origin: 'NYC',
    destination: 'LON',
    originalPrice: 800,
    newPrice: 599,
    currency: 'USD',
  }
);
```

---

## Step 5: Integrate with Existing Workflows

### Booking Confirmation Flow

```typescript
// In your booking confirmation handler
import { sendBookingConfirmationNotification } from '@/lib/services/notifications';

export async function confirmBooking(bookingData) {
  // Your existing booking logic
  const booking = await createBooking(bookingData);

  // Add notification
  await sendBookingConfirmationNotification(
    booking.userId,
    booking.id,
    {
      origin: booking.origin,
      destination: booking.destination,
      departDate: booking.departDate,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
    }
  );

  return booking;
}
```

### Price Alert Trigger

```typescript
// In your price monitoring cron job
import { sendPriceAlertNotification } from '@/lib/services/notifications';

export async function checkPriceAlerts() {
  const alerts = await getActiveAlerts();

  for (const alert of alerts) {
    const currentPrice = await fetchCurrentPrice(alert.route);

    if (currentPrice <= alert.targetPrice) {
      // Send notification
      await sendPriceAlertNotification(
        alert.userId,
        alert.id,
        {
          origin: alert.origin,
          destination: alert.destination,
          originalPrice: alert.currentPrice,
          newPrice: currentPrice,
          currency: alert.currency,
        }
      );

      // Update alert status
      await markAlertAsTriggered(alert.id);
    }
  }
}
```

### Payment Processing

```typescript
// In your payment handler
import { sendPaymentSuccessNotification } from '@/lib/services/notifications';

export async function processPayment(paymentData) {
  const result = await chargeCard(paymentData);

  if (result.success) {
    // Send success notification
    await sendPaymentSuccessNotification(
      paymentData.userId,
      paymentData.bookingId,
      paymentData.amount,
      paymentData.currency
    );
  } else {
    // Send failure notification
    await createNotification({
      userId: paymentData.userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      priority: 'urgent',
      actionUrl: `/account/bookings/${paymentData.bookingId}/payment`,
    });
  }

  return result;
}
```

---

## Step 6: Add Preferences to Settings (Optional)

If you have an account settings page:

```tsx
// In your account settings page
import { NotificationPreferences } from '@/components/account/NotificationPreferences';

export default function SettingsPage() {
  return (
    <div>
      {/* Other settings sections */}

      <NotificationPreferences />
    </div>
  );
}
```

---

## Common Use Cases

### 1. Send Notification on Event

```typescript
import { createNotification } from '@/lib/services/notifications';

await createNotification({
  userId: user.id,
  type: 'booking_confirmed',
  title: 'Booking Confirmed!',
  message: 'Your reservation is confirmed.',
  priority: 'high',
  actionUrl: `/bookings/${bookingId}`,
  metadata: {
    bookingId,
    destination: 'Paris',
  },
});
```

### 2. Send to Multiple Users

```typescript
import { createBulkNotifications } from '@/lib/services/notifications';

const notifications = users.map(user => ({
  userId: user.id,
  type: 'promotion',
  title: 'Flash Sale!',
  message: 'Save 50% on flights to Europe this weekend only!',
  priority: 'low',
  actionUrl: '/deals/europe-flash-sale',
}));

await createBulkNotifications(notifications);
```

### 3. Get User's Notifications

```typescript
import { getNotifications } from '@/lib/services/notifications';

const result = await getNotifications(userId, {
  page: 1,
  limit: 20,
  filters: {
    type: 'price_alert_triggered',
    read: false,
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

console.log(result.notifications);
console.log(`Unread count: ${result.unreadCount}`);
```

### 4. Mark Notifications as Read

```typescript
import { markAsRead, markAllAsRead } from '@/lib/services/notifications';

// Mark single notification as read
await markAsRead(notificationId, userId);

// Mark all as read
const count = await markAllAsRead(userId);
console.log(`Marked ${count} notifications as read`);
```

---

## Testing the System

### 1. Create Test Notifications

```bash
# Use the Next.js API routes
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "type": "system_update",
    "title": "Test Notification",
    "message": "This is a test notification",
    "priority": "low"
  }'
```

### 2. Check Notification Bell

- Look for the bell icon in your header
- Should show unread count badge
- Click to see dropdown preview

### 3. Visit Notification Center

Navigate to: `http://localhost:3000/account/notifications`

- Should see all your notifications
- Test filtering by type
- Test pagination
- Test mark as read
- Test delete

### 4. Test Real-time Updates

1. Open two browser windows
2. In one window, create a notification
3. In other window, wait ~30 seconds
4. Should see new notification appear

---

## Troubleshooting

### Bell Icon Not Showing

- Check if `userId` prop is passed correctly
- Verify user is logged in (session exists)
- Check browser console for errors

### Notifications Not Appearing

- Verify database migration was applied
- Check if notifications were actually created (check database)
- Look for errors in server logs
- Test API endpoints directly

### Real-time Updates Not Working

- Check browser Network tab for polling requests
- Verify polling interval (should be 30s)
- Check for JavaScript errors in console

### Database Errors

- Make sure Prisma migration was applied: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`
- Check database connection

---

## Next Steps

1. **Email Integration** (Future)
   - Connect to Resend email service
   - Create email templates
   - Enable email notifications in preferences

2. **Push Notifications** (Future)
   - Implement service worker
   - Register push subscriptions
   - Test browser notifications

3. **Analytics** (Future)
   - Track notification delivery rates
   - Monitor read rates
   - A/B test notification content

---

## Quick Reference

### Notification Types
- `booking_confirmed` - Booking confirmations
- `booking_cancelled` - Booking cancellations
- `booking_modified` - Booking changes
- `price_alert_triggered` - Price drops
- `payment_successful` - Successful payments
- `payment_failed` - Failed payments
- `system_update` - System announcements
- `promotion` - Deals and offers
- `account_security` - Security alerts
- `trip_reminder` - Trip reminders

### Priority Levels
- `low` - Non-urgent (promotions, updates)
- `medium` - Normal (bookings, trips)
- `high` - Important (price alerts, confirmations)
- `urgent` - Critical (payment failures, security)

### Useful API Endpoints
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/[id]` - Mark as read/unread
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read

---

## Support

For detailed documentation, see:
- `docs/notifications/NOTIFICATION_SYSTEM_GUIDE.md` - Complete system guide
- `docs/notifications/TEAM2_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

**Built by Team 2 - Notification & Communication**
*Last updated: 2025-11-10*
