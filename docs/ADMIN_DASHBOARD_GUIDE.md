# Admin Dashboard Guide

## Table of Contents

1. [Overview](#overview)
2. [Access Control](#access-control)
3. [Dashboard Features](#dashboard-features)
4. [API Documentation](#api-documentation)
5. [Security Notes](#security-notes)
6. [Deployment Notes](#deployment-notes)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Fly2Any Admin Dashboard is a comprehensive business intelligence and operations management system that provides real-time insights into bookings, users, revenue, and system health.

### Key Features

- **Real-time Metrics**: Live dashboard with auto-refresh every 5 minutes
- **Advanced Analytics**: Deep dive charts and reports with multiple visualization types
- **User Management**: Complete user CRUD operations with role-based access
- **Booking Management**: Search, filter, sort, and manage all bookings
- **System Settings**: Configure site-wide settings and preferences
- **Export Functionality**: Export data to CSV/Excel/PDF formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices

---

## Access Control

### Admin Role Requirement

All admin pages require the user to have an `admin` role. This is checked at two levels:

1. **Frontend**: Middleware checks the user's role and redirects non-admins
2. **Backend**: API endpoints verify admin role on every request

### How to Grant Admin Access

To grant admin access to a user, update their role in the database:

```typescript
// Using Prisma
await prisma.user.update({
  where: { id: userId },
  data: { role: 'admin' }
});
```

Or manually in your database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@fly2any.com';
```

### Admin Badge Display

Admin users see an "Admin Access" badge in the navbar. This is automatically displayed when the user's role is `admin`.

---

## Dashboard Features

### 1. Main Dashboard (`/admin/dashboard`)

**Key Metrics Cards:**
- Total Revenue (with % change)
- Total Bookings (with pending count)
- Total Users (with new registrations)
- Conversion Rate (with total searches)

**Charts:**
- Revenue Over Time (Area chart)
- User Registrations (Line chart)
- Top Routes (Bar chart with bookings and revenue)

**Quick Stats:**
- Booking status breakdown
- Average values (booking value, monthly revenue)
- User activity stats

**Features:**
- Period selector (Today, Week, Month, Year, All Time)
- Auto-refresh every 5 minutes
- Manual refresh button
- Export functionality

### 2. Bookings Management (`/admin/bookings`)

**Features:**
- **Search**: By booking reference, origin, or destination
- **Filters**:
  - Status (All, Pending, Confirmed, Cancelled, Completed)
  - Date range
- **Sorting**:
  - Newest/Oldest first
  - Highest/Lowest price
- **Stats Cards**: Total, Pending, Confirmed, Cancelled, Revenue
- **Actions**: View booking details

**Table Columns:**
- Booking Reference (with link)
- Route (Origin → Destination)
- Date
- Passengers
- Amount
- Status (with color-coded badge)
- Created timestamp
- Actions (View button)

### 3. Users Management (`/admin/users`)

**Features:**
- **Search**: By name or email
- **Filters**: Role, status, registration date
- **Pagination**: 50 users per page
- **Export**: CSV download
- **Actions**: View, Edit, Delete

**Stats:**
- Total Users
- Active Users
- Admin count
- Total Revenue from users

**User Details:**
- Profile avatar
- Name and email
- Role badge
- Status badge
- Bookings count
- Total spent
- Last login
- Created date

### 4. Analytics & Reports (`/admin/analytics`)

**Available Charts:**

1. **Bookings Trend** (Line chart)
   - Total bookings
   - Confirmed
   - Pending
   - Cancelled

2. **Revenue Trend** (Area chart)
   - Daily revenue over time

3. **Booking Status** (Donut chart)
   - Distribution by status

4. **Devices Used** (Pie chart)
   - Desktop, Mobile, Tablet breakdown

5. **Popular Routes** (Bar chart)
   - Top 10 routes by bookings and revenue

6. **Cabin Class Performance** (Bar chart)
   - Economy, Premium Economy, Business, First Class

7. **Top Airlines** (Bar chart)
   - Bookings and revenue by airline

8. **Conversion Funnel** (Bar chart)
   - Visits → Searches → Views → Selected → Checkout → Payment

**Features:**
- Period selector (7d, 30d, 90d, 1y)
- Auto-refresh
- Export report (PDF/CSV)

### 5. System Settings (`/admin/settings`)

**Settings Categories:**

**General Settings:**
- Site Name
- Site Description
- Contact Email
- Support Phone
- Maintenance Mode toggle

**API Settings:**
- Rate Limit (requests/hour)
- Cache Enabled toggle
- Cache TTL (seconds)

**Email Settings:**
- From Email
- From Name
- SMTP Status

**Payment Settings:**
- Default Currency
- Test Mode toggle
- Enabled Payment Methods (Stripe, PayPal, Apple Pay, Google Pay)

---

## API Documentation

### 1. Admin Statistics

**Endpoint**: `GET /api/admin/stats`

**Query Parameters:**
- `period` (optional): `today` | `week` | `month` | `year` | `all`

**Response:**
```typescript
{
  success: true,
  stats: {
    period: string;
    bookings: {
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      revenue: number;
      averageValue: number;
      change: number;
    };
    users: {
      total: number;
      active: number;
      new: number;
      change: number;
      registrationsByDay: Array<{ date: string; count: number }>;
    };
    searches: {
      total: number;
      flights: number;
      hotels: number;
      cars: number;
      conversion: number;
      change: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      lastMonth: number;
      change: number;
      byDay: Array<{ date: string; amount: number }>;
    };
    topRoutes: Array<{
      from: string;
      to: string;
      count: number;
      revenue: number;
    }>;
  }
}
```

### 2. Admin Users

**Get Users**: `GET /api/admin/users`

**Query Parameters:**
- `search` (optional): Search term
- `role` (optional): Filter by role
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Update User**: `PUT /api/admin/users`

**Request Body:**
```typescript
{
  userId: string;
  updates: {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  }
}
```

**Delete User**: `DELETE /api/admin/users?userId=xxx`

### 3. Admin Analytics

**Endpoint**: `GET /api/admin/analytics`

**Query Parameters:**
- `type` (required): `bookings` | `revenue` | `routes` | `devices` | `status` | `cabinClass` | `airlines` | `conversion`
- `period` (optional): `7d` | `30d` | `90d` | `1y`
- `startDate` (optional): Custom start date (ISO format)
- `endDate` (optional): Custom end date (ISO format)

**Response:**
```typescript
{
  success: true,
  type: string;
  period: string;
  data: any[]; // Structure depends on type
}
```

### 4. Admin Bookings

**Get Bookings**: `GET /api/admin/bookings`

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Results per page (default: 100)
- `offset` (optional): Pagination offset
- `email` (optional): Filter by customer email

**Export Bookings**: `POST /api/admin/bookings?export=true`

---

## Security Notes

### Access Control

1. **Middleware Check**: All `/admin/*` routes are protected by middleware that checks for admin role
2. **API Verification**: Every admin API endpoint verifies the user's role
3. **Session-based**: Uses NextAuth sessions for authentication

### Rate Limiting

Admin endpoints should be rate-limited to prevent abuse:

```typescript
// Recommended limits
- GET endpoints: 1000 requests/hour
- POST/PUT endpoints: 100 requests/hour
- DELETE endpoints: 50 requests/hour
```

### Audit Trail

All admin actions should be logged:

```typescript
// Log format
{
  timestamp: Date;
  userId: string;
  action: string; // 'view', 'create', 'update', 'delete'
  resource: string; // 'user', 'booking', 'settings'
  resourceId?: string;
  changes?: object;
}
```

### Data Privacy

- Sensitive data (passwords, payment details) should never be exposed in admin APIs
- Use environment variables for API keys and credentials
- Implement field-level permissions for sensitive fields

---

## Deployment Notes

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# Redis (for caching)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# API Keys (if needed)
AMADEUS_API_KEY=...
DUFFEL_API_KEY=...
```

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

Ensure all required tables exist:

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Performance Optimization

1. **Enable Redis Caching**: Cache API responses to reduce database load
2. **Enable CDN**: Serve static assets from CDN
3. **Enable Compression**: Use gzip compression for API responses
4. **Database Indexing**: Add indexes on frequently queried fields

```sql
-- Recommended indexes
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

---

## Troubleshooting

### Common Issues

**1. "Access Denied" Error**

**Problem**: User doesn't have admin role

**Solution**:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

**2. Charts Not Loading**

**Problem**: API endpoint returns error or empty data

**Solution**:
- Check browser console for errors
- Verify API endpoint is accessible: `GET /api/admin/stats`
- Check database connection
- Verify environment variables are set

**3. Slow Performance**

**Problem**: Dashboard takes long to load

**Solutions**:
- Enable Redis caching
- Add database indexes
- Implement pagination for large datasets
- Use React Query or SWR for client-side caching

**4. Export Not Working**

**Problem**: CSV export fails or downloads empty file

**Solution**:
- Check browser console for errors
- Verify API returns data
- Check file permissions
- Ensure sufficient memory for large exports

**5. Stats Not Updating**

**Problem**: Dashboard shows stale data

**Solutions**:
- Click the Refresh button
- Clear browser cache
- Check auto-refresh is enabled (every 5 minutes)
- Verify Redis cache TTL settings

### Debug Mode

Enable debug logging:

```typescript
// In your API routes
console.log('📊 Admin Stats Request:', { period, userId });
console.log('✅ Admin Stats Response:', stats);
```

### Support

For additional support:
- Check logs in `/var/log/fly2any/`
- Contact: dev@fly2any.com
- Documentation: https://docs.fly2any.com

---

## Future Enhancements

Planned features for future releases:

1. **Real-time Notifications**: WebSocket-based live updates
2. **Advanced Filters**: More granular filtering options
3. **Custom Dashboards**: User-customizable dashboard layouts
4. **Email Reports**: Scheduled email reports (daily/weekly/monthly)
5. **Mobile App**: Native iOS/Android admin app
6. **API Keys Management**: Self-service API key generation
7. **Webhooks Management**: Configure and test webhooks
8. **Activity Log**: Comprehensive audit trail viewer
9. **Two-Factor Auth**: Enhanced security for admin accounts
10. **Dark Mode**: Theme toggle for better UX

---

## Chart Data Structures

### Bookings Trend

```typescript
{
  date: string;        // "2025-01-10"
  bookings: number;    // Total bookings
  confirmed: number;   // Confirmed bookings
  pending: number;     // Pending bookings
  cancelled: number;   // Cancelled bookings
}
```

### Revenue Data

```typescript
{
  date: string;    // "2025-01-10"
  amount: number;  // Revenue amount
}
```

### Routes Data

```typescript
{
  route: string;   // "JFK → LAX"
  bookings: number; // Number of bookings
  revenue: number;  // Total revenue
}
```

### Status Distribution

```typescript
{
  status: string;      // "confirmed", "pending", etc.
  count: number;       // Number of bookings
  percentage: number;  // Percentage of total
}
```

---

## Version History

- **v1.0.0** (2025-01-10): Initial release
  - Main dashboard with key metrics
  - Bookings management
  - Users management
  - Analytics & reports
  - System settings

---

**Last Updated**: January 10, 2025
**Maintainer**: Fly2Any Development Team
**License**: Proprietary
