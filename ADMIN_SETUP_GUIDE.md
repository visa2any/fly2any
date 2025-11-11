# Admin Dashboard Setup Guide

## 🎉 What's New

Your admin dashboard now has:
- ✅ **Authentication & Authorization** - Login required, RBAC system
- ✅ **Full-Width Layout** - Matches site header, maximum screen utilization
- ✅ **Role-Based Access** - Super Admin, Admin, Moderator roles
- ✅ **Professional UI** - Modern sidebar navigation, search, notifications
- ✅ **Secure Access** - Protected routes, audit trail logging

## 🚀 Quick Start (3 Steps)

### Step 1: Apply Database Migration

The Phase 8 & 9 migration adds 17 new tables including the admin system.

**Option A: Using Vercel CLI (Recommended)**
```bash
# Pull production environment variables
vercel env pull .env.production

# Apply migration
npx prisma migrate deploy
```

**Option B: Via Neon Dashboard**
1. Go to https://console.neon.tech
2. Open SQL Editor
3. Copy contents from `prisma/migrations/20251111113117_add_phase8_and_phase9_features/migration.sql`
4. Execute

**Verify Migration**
```bash
npx prisma migrate status
# Should show: ✓ 20251111113117_add_phase8_and_phase9_features
```

### Step 2: Create Your Admin User

First, sign up normally at `/auth/signin` with your email. Then run:

```bash
# Replace with your email
npx tsx scripts/create-admin.ts your-email@fly2any.com super_admin
```

**Roles Available:**
- `super_admin` - Full system access
- `admin` - Most permissions, can't manage other admins
- `moderator` - Limited access, content moderation only

**Example Output:**
```
🔍 Creating admin user...
Email: admin@fly2any.com
Role: super_admin

✅ Admin user created successfully!
   User ID: clxxx...
   Email: admin@fly2any.com
   Role: super_admin

🎉 admin@fly2any.com can now access /admin
```

### Step 3: Access Admin Dashboard

1. Visit `/admin` on your site
2. You'll be redirected to login if not authenticated
3. After login, you'll see the full admin dashboard

## 📐 Admin Dashboard Layout

### Full-Width Header
- **Search Bar** - Search users, bookings, analytics
- **Notifications** - Real-time alerts
- **Settings** - Quick access
- **User Menu** - Profile, role badge, sign out

### Sidebar Navigation
- **Dashboard** - Overview metrics
- **Analytics** - Business intelligence
- **AI Analytics** - ML insights
- **Users** - User management (Admin+ only)
- **Bookings** - Booking management
- **Performance** - System performance
- **Monitoring** - Health checks
- **Webhooks** - Integration management (Admin+ only)
- **Settings** - System settings (Admin+ only)

### CMS Section
- **Travel Deals** - Create and manage deals
- **Destinations** - Destination content
- **Email Templates** - Email system

## 🔐 Role Permissions

### Super Admin
- ✅ All permissions
- ✅ User management
- ✅ Admin user management
- ✅ System settings
- ✅ All CMS operations
- ✅ Audit log access

### Admin
- ✅ User management
- ✅ Booking management
- ✅ Analytics access
- ✅ CMS operations
- ✅ Limited system settings
- ❌ Can't create other admins

### Moderator
- ✅ View analytics
- ✅ Manage bookings
- ✅ CMS content moderation
- ❌ No user management
- ❌ No system settings

## 🎨 UI Components

### AdminHeader
```typescript
<AdminHeader
  user={session.user}
  adminRole={adminUser.role}
/>
```

Features:
- Full-width design
- Role badge display
- Search functionality
- Notification bell
- User dropdown menu

### AdminSidebar
```typescript
<AdminSidebar role={adminUser.role} />
```

Features:
- Active route highlighting
- Role-based visibility
- Collapsible sections
- Super admin badge

## 🔧 Configuration

### Add New Menu Items

Edit `components/admin/AdminSidebar.tsx`:

```typescript
const navItems: NavItem[] = [
  {
    label: 'New Section',
    href: '/admin/new-section',
    icon: YourIcon,
    roles: ['super_admin', 'admin'] // Optional: restrict by role
  }
]
```

### Customize Roles

Edit `lib/admin/rbac.ts` to add new roles or permissions.

## 📊 Phase 8 & 9 Features Now Available

With the migration applied, you have access to:

### Phase 8: Analytics & ML
- **Analytics Events** - Track all user interactions
- **Performance Metrics** - Web Vitals monitoring
- **ML Price Predictions** - AI-powered price forecasting
- **A/B Testing** - Feature flags and experiments
- **Error Tracking** - Automatic error grouping
- **Conversion Funnels** - User journey analysis

### Phase 9: Admin & CMS
- **Admin Users** - Role-based access control
- **Audit Logs** - Complete action trail
- **Travel Deals CMS** - Manage deals
- **Destinations CMS** - Destination content
- **Email Templates** - Template management
- **System Monitoring** - Health checks

## 🧪 Testing Checklist

After setup, verify:

- [ ] Can access `/admin` after login
- [ ] Redirected to login when not authenticated
- [ ] Role badge shows correctly in header
- [ ] Sidebar navigation works
- [ ] User menu dropdown functions
- [ ] Role-based menu items visible/hidden correctly
- [ ] Can navigate to all dashboard sections
- [ ] Admin user created successfully
- [ ] Database migration applied

## 🐛 Troubleshooting

### "Not authorized" or redirect to home
- Verify admin user was created: `npx tsx scripts/create-admin.ts your-email@example.com super_admin`
- Check database has `admin_users` table
- Verify migration was applied

### Migration fails
- Ensure DATABASE_URL is set correctly
- Check database connection
- Verify Prisma client is generated: `npx prisma generate`

### Admin page shows errors
- Run `npm run build` to check for TypeScript errors
- Verify all components are properly imported
- Check browser console for client-side errors

### Can't create admin user
- Make sure user exists: Sign up at `/auth/signin` first
- Verify database connection
- Check script output for specific errors

## 📝 Next Steps

1. **Populate CMS** - Add travel deals and destinations
2. **Enable Analytics** - Start tracking events
3. **Configure A/B Tests** - Create feature flags
4. **Set Up Monitoring** - Configure health checks
5. **Invite Team** - Create admin users for your team

## 🔗 Related Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Full migration details
- [Phase 8 README](./prisma/migrations/20251111113117_add_phase8_and_phase9_features/README.md) - Migration specifics
- [RBAC Documentation](./lib/admin/rbac.ts) - Role permissions

## 🎯 Admin Dashboard URLs

- **Main Dashboard**: `/admin`
- **Analytics**: `/admin/analytics`
- **Users**: `/admin/users`
- **Bookings**: `/admin/bookings`
- **Settings**: `/admin/settings`
- **CMS Deals**: `/admin/cms/deals`
- **CMS Destinations**: `/admin/cms/destinations`

---

**Created:** November 11, 2025
**Version:** Phase 8 & 9 Complete
**Status:** ✅ Production Ready
