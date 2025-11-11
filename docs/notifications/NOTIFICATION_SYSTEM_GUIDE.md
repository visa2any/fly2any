# Notification System Guide

**Team 2 - Notification & Communication**

A comprehensive notification system with real-time updates, filtering, and multi-channel delivery support.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Components](#components)
7. [Usage Examples](#usage-examples)
8. [Integration Guide](#integration-guide)
9. [Best Practices](#best-practices)
10. [Testing](#testing)
11. [Future Enhancements](#future-enhancements)

---

## Overview

The notification system provides a complete solution for managing user notifications across the Fly2Any platform. It supports:

- **In-app notifications** with real-time polling
- **Email notifications** (ready for integration)
- **Push notifications** (infrastructure ready)
- **Filtering and pagination**
- **Notification preferences**
- **Bulk operations**

---

## Features

### Core Features

- **Real-time Updates**: Automatic polling every 30 seconds for new notifications
- **Multiple Notification Types**: Booking updates, price alerts, payments, promotions, and more
- **Priority Levels**: Low, medium, high, and urgent priorities
- **Read/Unread Tracking**: Automatic read status management
- **Rich Metadata**: Store additional data with each notification
- **Action URLs**: Deep linking to relevant pages

### User Features

- **Notification Bell**: Header component with unread count badge
- **Preview Dropdown**: Quick view of last 5 notifications
- **Full Notification Center**: Complete list with filtering and pagination
- **Advanced Filters**: By type, read status, and priority
- **Bulk Actions**: Mark all as read, delete all read notifications
- **Preferences Management**: Granular control over notification settings

### Technical Features

- **Optimistic UI Updates**: Instant feedback for user actions
- **Error Handling**: Graceful degradation with retry mechanisms
- **Loading States**: Skeleton loaders for better UX
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Accessibility**: ARIA labels and keyboard navigation

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Notification System                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Notification │    │ Notification │    │ Notification │  │
│  │    Bell      │    │    Center    │    │ Preferences  │  │
│  │  Component   │    │     Page     │    │  Component   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                    │                    │          │
│         └────────────────────┼────────────────────┘          │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │  API Routes       │                     │
│                    │  /api/notifications│                    │
│                    └─────────┬─────────┘                     │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │ Notification      │                     │
│                    │ Service Layer     │                     │
│                    └─────────┬─────────┘                     │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │ Prisma ORM        │                     │
│                    │ Database Layer    │                     │
│                    └─────────┬─────────┘                     │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │  PostgreSQL       │                     │
│                    │  Database         │                     │
│                    └───────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Notification Model

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String   // 'booking', 'price_alert', 'system', 'promotion'
  title       String
  message     String   @db.Text
  priority    String   @default("medium") // 'low', 'medium', 'high', 'urgent'
  read        Boolean  @default(false)
  actionUrl   String?
  metadata    Json?
  createdAt   DateTime @default(now())
  readAt      DateTime?

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}
```

### Indexes

- **`[userId, read]`**: Fast filtering by user and read status
- **`[createdAt]`**: Efficient sorting by date

---

## API Endpoints

### GET /api/notifications

Get notifications for the current user with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `type` (string): Filter by notification type ('all' or specific type)
- `read` (string): Filter by read status ('all', 'true', 'false')
- `priority` (string): Filter by priority ('all' or specific priority)
- `sortBy` (string): Sort field ('createdAt', 'priority', 'read')
- `sortOrder` (string): Sort order ('asc', 'desc')

**Response:**
```json
{
  "notifications": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "unreadCount": 5
}
```

### POST /api/notifications

Create a new notification.

**Request Body:**
```json
{
  "type": "booking_confirmed",
  "title": "Booking Confirmed",
  "message": "Your flight has been confirmed",
  "priority": "high",
  "actionUrl": "/account/bookings/123",
  "metadata": {
    "bookingId": "123"
  }
}
```

### GET /api/notifications/[id]

Get a single notification by ID.

### PATCH /api/notifications/[id]

Update notification (mark as read/unread).

**Request Body:**
```json
{
  "read": true
}
```

### DELETE /api/notifications/[id]

Delete a single notification.

### POST /api/notifications/mark-all-read

Mark all notifications as read for the current user.

### DELETE /api/notifications?scope=read

Delete all read notifications (or all with `scope=all`).

---

## Components

### NotificationBell

Header bell icon with unread count and dropdown preview.

**Usage:**
```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

<NotificationBell
  userId={session.user.id}
  showLabel={false}
  enableSound={true}
/>
```

**Props:**
- `userId` (string, optional): Current user ID
- `showLabel` (boolean, default: false): Show "Notifications" text
- `enableSound` (boolean, default: false): Play sound for new notifications
- `className` (string, optional): Additional CSS classes

**Features:**
- Real-time polling (30s interval)
- Unread count badge
- Dropdown with last 5 notifications
- Click to open notification center
- Toast notifications for new items
- Auto-close on outside click

### NotificationCard

Display a single notification with actions.

**Usage:**
```tsx
import { NotificationCard } from '@/components/notifications/NotificationCard';

<NotificationCard
  notification={notification}
  onMarkAsRead={handleMarkAsRead}
  onDelete={handleDelete}
  onAction={handleAction}
  compact={false}
/>
```

**Props:**
- `notification` (Notification): Notification data
- `onMarkAsRead` (function, optional): Mark as read callback
- `onDelete` (function, optional): Delete callback
- `onAction` (function, optional): Action button callback
- `compact` (boolean, default: false): Use compact layout

**Features:**
- Icon based on notification type
- Priority badge
- Read/unread indicator
- Relative timestamps
- Action buttons
- Responsive design

### NotificationPreferences

Manage notification preferences.

**Usage:**
```tsx
import { NotificationPreferences } from '@/components/account/NotificationPreferences';

<NotificationPreferences />
```

**Features:**
- In-app notification toggle
- Email preferences (per type)
- Push notification settings
- Quiet hours configuration
- Email digest settings
- Auto-save with change detection

---

## Usage Examples

### Create a Booking Confirmation Notification

```typescript
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
```

### Create a Price Alert Notification

```typescript
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

### Create a Custom Notification

```typescript
import { createNotification } from '@/lib/services/notifications';

await createNotification({
  userId: 'user123',
  type: 'system_update',
  title: 'New Feature Available',
  message: 'Check out our new flight comparison tool!',
  priority: 'low',
  actionUrl: '/features/comparison',
  metadata: {
    featureId: 'comparison-tool',
  },
});
```

### Get Notifications with Filters

```typescript
import { getNotifications } from '@/lib/services/notifications';

const result = await getNotifications('user123', {
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
console.log(result.unreadCount);
```

---

## Integration Guide

### Step 1: Database Migration

Run Prisma migration to add the Notification table:

```bash
npx prisma migrate dev --name add_notification_model
```

### Step 2: Add NotificationBell to Header

```tsx
// In your header/navbar component
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useSession } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header>
      {/* Other header content */}
      <NotificationBell userId={session?.user?.id} enableSound />
    </header>
  );
}
```

### Step 3: Add Notification Center Route

The notification center is already available at:
```
/account/notifications
```

Add a link to it in your account navigation.

### Step 4: Integrate Notification Creation

In your booking, payment, or alert workflows:

```typescript
// After successful booking
import { sendBookingConfirmationNotification } from '@/lib/services/notifications';

await sendBookingConfirmationNotification(userId, bookingId, details);

// After price drop detected
import { sendPriceAlertNotification } from '@/lib/services/notifications';

await sendPriceAlertNotification(userId, alertId, priceDetails);
```

### Step 5: Add Preferences to Settings

```tsx
// In your account settings page
import { NotificationPreferences } from '@/components/account/NotificationPreferences';

<NotificationPreferences />
```

---

## Best Practices

### 1. Notification Creation

- **Be Specific**: Use clear, actionable titles and messages
- **Include Context**: Add relevant metadata for future reference
- **Set Appropriate Priority**: Use 'urgent' sparingly
- **Provide Actions**: Always include `actionUrl` when applicable

### 2. Performance

- **Batch Operations**: Use bulk create for multiple notifications
- **Optimize Queries**: Leverage database indexes
- **Cache Unread Count**: Consider caching for high-traffic scenarios
- **Limit Polling**: 30s interval is reasonable, don't go lower

### 3. User Experience

- **Don't Overwhelm**: Respect quiet hours and user preferences
- **Group Related**: Consider digest emails for multiple notifications
- **Clear Actions**: Make it obvious what users should do
- **Quick Dismissal**: Allow easy deletion of notifications

### 4. Security

- **Verify Ownership**: Always check userId matches session
- **Sanitize Input**: Validate notification data before creation
- **Rate Limiting**: Implement rate limits on API endpoints
- **Authorization**: Ensure users can only access their notifications

---

## Testing

### Manual Testing Checklist

- [ ] Create notifications of each type
- [ ] Verify real-time polling updates
- [ ] Test mark as read/unread
- [ ] Test bulk mark all as read
- [ ] Test delete single notification
- [ ] Test delete all read notifications
- [ ] Test filtering by type
- [ ] Test filtering by read status
- [ ] Test pagination
- [ ] Test notification bell dropdown
- [ ] Test notification preferences
- [ ] Test quiet hours (mock time)
- [ ] Test on mobile devices
- [ ] Test with screen reader

### API Testing

```bash
# Get notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: your-session-cookie"

# Create notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "type": "system_update",
    "title": "Test Notification",
    "message": "This is a test",
    "priority": "low"
  }'

# Mark as read
curl -X PATCH http://localhost:3000/api/notifications/notification-id \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"read": true}'

# Delete notification
curl -X DELETE http://localhost:3000/api/notifications/notification-id \
  -H "Cookie: your-session-cookie"
```

---

## Future Enhancements

### Short-term (Phase 3)

1. **Email Integration**
   - Connect to Resend email service
   - Implement email templates
   - Add email digest functionality

2. **Push Notifications**
   - Implement service worker
   - Register push subscriptions
   - Handle push notification delivery

3. **Advanced Features**
   - Notification grouping (by date, type)
   - Search notifications
   - Export notification history

### Long-term (Phase 4+)

1. **Real-time WebSocket Updates**
   - Replace polling with WebSocket connections
   - Instant notification delivery
   - Presence indicators

2. **AI-Powered Notifications**
   - Smart notification scheduling
   - Predictive importance scoring
   - Personalized delivery timing

3. **Multi-channel Orchestration**
   - SMS notifications
   - WhatsApp integration
   - Slack/Teams integration

4. **Analytics Dashboard**
   - Notification delivery rates
   - Read/click-through rates
   - A/B testing for notification content

---

## Notification Types Reference

| Type | Icon | Use Case | Priority |
|------|------|----------|----------|
| `booking_confirmed` | CheckCircle | Flight/hotel booking confirmed | High |
| `booking_cancelled` | XCircle | Booking was cancelled | High |
| `booking_modified` | Edit | Booking details changed | Medium |
| `price_alert_triggered` | TrendingDown | Price dropped below target | High |
| `payment_successful` | CreditCard | Payment processed | Medium |
| `payment_failed` | AlertTriangle | Payment failed | Urgent |
| `system_update` | Settings | Platform updates | Low |
| `promotion` | Tag | Special offers and deals | Low |
| `account_security` | Shield | Security alerts | Urgent |
| `trip_reminder` | Bell | Upcoming trip reminders | Medium |

---

## Troubleshooting

### Notifications Not Appearing

1. Check if user is logged in
2. Verify database connection
3. Check browser console for errors
4. Ensure polling is working (check Network tab)

### Unread Count Not Updating

1. Check if mark-as-read API is working
2. Verify database update
3. Clear browser cache
4. Check for race conditions in state updates

### Performance Issues

1. Reduce polling frequency
2. Implement pagination earlier
3. Add database indexes
4. Consider caching unread count

### Push Notifications Not Working

1. Check browser support
2. Verify HTTPS connection
3. Check permission status
4. Verify service worker registration

---

## Support

For questions or issues:
- Check this documentation
- Review the code comments
- Test with the provided examples
- Contact the Team 2 developers

---

**Built by Team 2 - Notification & Communication**
*Last updated: 2025-11-10*
