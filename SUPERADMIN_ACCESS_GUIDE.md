# 🔐 Superadmin Access to Agent Portal - Implementation Guide

**Status:** ✅ Implemented and Ready
**Feature:** Admin Override for Agent Portal Access

---

## 🎯 Problem Solved

**Before:** Superadmins needed to register as agents to test or access the agent portal, creating unnecessary database records and confusion.

**After:** Superadmins can now access the agent portal **directly** without registration. The system automatically creates a test agent profile for them.

---

## ✨ How It Works

### **Automatic Agent Profile Creation**

When a **superadmin** accesses the agent portal:

1. ✅ System checks if user is authenticated
2. ✅ System checks if user has an agent profile
3. ✅ If NO agent profile → Checks if user is a superadmin
4. ✅ If YES superadmin → **Auto-creates test agent profile**
5. ✅ Agent profile is marked with `isTestAccount: true`
6. ✅ Special banner shows to indicate "Admin Mode"

### **What Gets Auto-Created**

```typescript
// Auto-created agent profile for superadmin:
{
  userId: adminUserId,
  agencyName: "Platform Administration",
  businessType: "ADMINISTRATION",
  licenseNumber: "ADMIN-XXXXXXXX",
  status: "ACTIVE", // ← Auto-approved!
  tier: "WHITE_LABEL", // ← Highest tier!
  defaultCommission: 0.15, // ← 15% commission rate
  isTestAccount: true, // ← Marked as test account
  // All premium features enabled
  hasClientPortal: true,
  hasTeamManagement: true,
  hasAdvancedAnalytics: true,
  hasWhiteLabel: true,
  hasApiAccess: true,
  hasPrioritySupport: true,
  hasCustomBranding: true,
  hasSmsNotifications: true,
  hasWhatsappIntegration: true,
}
```

---

## 🚀 How to Use (As Superadmin)

### **Step 1: Ensure You're a Superadmin**

Check your admin role in the database:

```sql
SELECT role FROM "AdminUser" WHERE "userId" = 'your-user-id';
-- Should return: 'super_admin'
```

Or use Prisma Studio:
```bash
npx prisma studio
# Navigate to AdminUser table
# Check that your role = "super_admin"
```

### **Step 2: Access Agent Portal**

Simply navigate to:
```
https://yourdomain.com/agent
```

**What Happens:**
1. If you DON'T have an agent profile → System auto-creates one
2. You're immediately redirected to agent dashboard
3. Purple "Admin Mode" banner appears at top
4. You have full access to all agent features

### **Step 3: Use Agent Features**

You can now:
- ✅ View agent dashboard
- ✅ Create clients
- ✅ Create quotes
- ✅ Generate PDFs
- ✅ Test email delivery
- ✅ View bookings
- ✅ Track commissions
- ✅ Request payouts (test mode)
- ✅ View activity log
- ✅ Access settings

**All features work exactly like a real agent!**

---

## 🎨 Visual Indicators

### **Admin Mode Banner**

When superadmin accesses agent portal, a **purple banner** appears:

```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Admin Mode Active                    [Return to Admin]│
│ You're viewing the agent portal as a superadmin.        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Shows on EVERY page in agent portal
- Clear indication you're in "test mode"
- Quick link to return to admin portal
- Purple gradient (distinct from other banners)

---

## 🔧 Technical Implementation

### **Files Modified:**

#### 1. **Database Schema** (`prisma/schema.prisma`)
```prisma
model TravelAgent {
  // ... existing fields

  // Admin & Testing Flags
  isTestAccount Boolean @default(false) // True for admin-created test agents
}
```

#### 2. **Auth Helper** (`lib/auth-helpers.ts`)
New helper functions:
- `isAdmin(userId)` - Check if user is admin
- `isSuperAdmin(userId)` - Check if user is superadmin
- `getOrCreateAdminAgent(userId)` - Auto-create agent for admin
- `getAgentWithAdminFallback(userId)` - Get agent with admin override
- `checkAdminAccess()` - Check current session admin status
- `checkAgentAccess()` - Check current session agent status

#### 3. **Agent Layout** (`app/agent/layout.tsx`)
Updated to:
- Use `getAgentWithAdminFallback()` instead of direct database query
- Show `AdminModeBanner` when `isTestAccount === true`
- Skip REJECTED/SUSPENDED checks for test accounts

#### 4. **Agent Dashboard** (`app/agent/page.tsx`)
Updated to:
- Use `getAgentWithAdminFallback()` for agent retrieval

#### 5. **Admin Mode Banner** (`components/agent/AdminModeBanner.tsx`)
New component showing admin mode indicator

---

## 🗃️ Database Changes Required

### **Step 1: Add Field to Schema**

Already done! The `isTestAccount` field has been added to `TravelAgent` model.

### **Step 2: Create Migration**

```bash
# Create migration
npx prisma migrate dev --name add-is-test-account-to-agent

# Or for production:
npx prisma migrate deploy
```

### **Step 3: Regenerate Prisma Client**

```bash
npx prisma generate
```

---

## ✅ Testing the Implementation

### **Test 1: Superadmin Access**

1. **Login as superadmin**
   ```bash
   # Email: admin@yourdomain.com (your superadmin account)
   ```

2. **Navigate to agent portal**
   ```
   https://yourdomain.com/agent
   ```

3. **Expected Result:**
   - ✅ No registration required
   - ✅ Agent dashboard loads immediately
   - ✅ Purple "Admin Mode" banner visible
   - ✅ All agent features accessible

### **Test 2: Regular Admin (Not Super)**

1. **Login as regular admin** (role !== 'super_admin')

2. **Navigate to agent portal**

3. **Expected Result:**
   - ❌ Redirected to `/agent/register`
   - Regular admins must register as agents

### **Test 3: Regular User**

1. **Login as regular user** (not admin at all)

2. **Navigate to agent portal**

3. **Expected Result:**
   - ❌ Redirected to `/agent/register`
   - Must complete agent registration

---

## 🔒 Security Considerations

### **✅ What's Protected:**

1. **Only Superadmins Get Override**
   - Regular admins don't get auto-access
   - Only `role === 'super_admin'` triggers auto-creation

2. **Test Accounts Are Marked**
   - `isTestAccount: true` allows tracking
   - Can be filtered out of analytics
   - Can be easily identified in database

3. **No Data Pollution**
   - Test accounts don't affect real agent metrics
   - Can be excluded from commission calculations
   - Can be hidden from public listings

### **⚠️ Important Notes:**

1. **One-Time Creation**
   - Agent profile is created ONCE
   - Subsequent visits use existing profile
   - No duplicate records

2. **Audit Trail**
   - All actions are logged to `AgentActivityLog`
   - Admin actions are traceable
   - Test account flag provides context

3. **Data Separation**
   - Test bookings can be filtered out
   - Test commissions can be excluded
   - Analytics can ignore test accounts

---

## 🎓 Best Practices

### **For Development:**

```typescript
// Exclude test accounts from analytics
const realAgents = await prisma.travelAgent.findMany({
  where: {
    isTestAccount: false, // ← Exclude admin test accounts
  },
});

// Include test accounts for testing
const allAgents = await prisma.travelAgent.findMany({
  // No filter - includes test accounts
});
```

### **For Production:**

1. **Monitor Test Accounts:**
   ```sql
   -- Find all test accounts
   SELECT * FROM "TravelAgent" WHERE "isTestAccount" = true;
   ```

2. **Clean Up Old Test Data:**
   ```sql
   -- Delete test bookings (optional)
   DELETE FROM "AgentBooking"
   WHERE "agentId" IN (
     SELECT id FROM "TravelAgent" WHERE "isTestAccount" = true
   );
   ```

3. **Analytics Exclusion:**
   ```typescript
   // Always exclude test accounts from reports
   const revenue = await prisma.agentBooking.aggregate({
     where: {
       agent: {
         isTestAccount: false, // ← Exclude test data
       },
     },
     _sum: { total: true },
   });
   ```

---

## 🚨 Troubleshooting

### **Issue: "Still redirected to registration"**

**Cause:** User might not be a superadmin

**Solution:**
```sql
-- Check admin status
SELECT role FROM "AdminUser" WHERE "userId" = 'your-user-id';

-- Update to superadmin
UPDATE "AdminUser"
SET role = 'super_admin'
WHERE "userId" = 'your-user-id';
```

### **Issue: "Banner doesn't show"**

**Cause:** Agent profile might not have `isTestAccount` field

**Solution:**
```bash
# Run migration
npx prisma migrate dev

# Regenerate client
npx prisma generate

# Restart dev server
npm run dev
```

### **Issue: "Database error on agent creation"**

**Cause:** Missing field in database

**Solution:**
```sql
-- Add field manually (PostgreSQL)
ALTER TABLE "TravelAgent"
ADD COLUMN "isTestAccount" BOOLEAN DEFAULT false;
```

---

## 📊 Database Queries

### **Find All Admin Test Accounts:**

```sql
SELECT
  ta.id,
  ta.email,
  ta."firstName",
  ta."lastName",
  ta."isTestAccount",
  ta.status,
  ta.tier
FROM "TravelAgent" ta
WHERE ta."isTestAccount" = true;
```

### **Count Test vs Real Agents:**

```sql
SELECT
  "isTestAccount",
  COUNT(*) as count
FROM "TravelAgent"
GROUP BY "isTestAccount";
```

### **Get Admin's Agent Profile:**

```sql
SELECT
  ta.*
FROM "TravelAgent" ta
JOIN "AdminUser" au ON ta."userId" = au."userId"
WHERE au.role = 'super_admin';
```

---

## 🎯 Summary

### **What You Get:**

✅ **Instant Access:** Superadmins access agent portal immediately
✅ **No Registration:** Bypasses agent registration form
✅ **Full Features:** Complete access to all agent capabilities
✅ **Clear Indication:** Purple banner shows admin mode
✅ **Secure:** Only superadmins get this privilege
✅ **Traceable:** Test accounts are marked and identifiable
✅ **Clean:** No data pollution with proper filtering

### **How to Use:**

1. Be a superadmin (`role = 'super_admin'`)
2. Navigate to `/agent`
3. Start using agent features immediately!

### **For Regular Agents:**

Nothing changes! Regular agent registration and flow remains the same.

---

## 🔄 Rollback (If Needed)

If you need to revert this feature:

### **1. Remove Migration:**
```bash
npx prisma migrate reset
```

### **2. Restore Original Files:**
```bash
# Revert app/agent/layout.tsx
# Revert app/agent/page.tsx
# Delete lib/auth-helpers.ts
# Delete components/agent/AdminModeBanner.tsx
```

### **3. Remove Test Accounts:**
```sql
DELETE FROM "TravelAgent" WHERE "isTestAccount" = true;
```

---

**Your superadmin can now access the agent portal seamlessly!** 🎉

---

## 📝 Quick Reference

**Superadmin Access:** ✅ Automatic
**Admin Access:** ❌ Must register
**User Access:** ❌ Must register

**Test Account Indicators:**
- `isTestAccount: true` in database
- Purple "Admin Mode" banner in UI
- Company name: "Platform Administration"
- Highest tier (WHITE_LABEL)
- Auto-approved status (ACTIVE)

**Security:**
- Only `super_admin` role gets override
- Test accounts are clearly marked
- All actions are logged
- Can be excluded from analytics

**Files Changed:**
- ✅ `prisma/schema.prisma` (added field)
- ✅ `lib/auth-helpers.ts` (NEW - helper functions)
- ✅ `app/agent/layout.tsx` (admin override logic)
- ✅ `app/agent/page.tsx` (admin override logic)
- ✅ `components/agent/AdminModeBanner.tsx` (NEW - banner component)

**Next Steps:**
1. Run database migration
2. Test superadmin access
3. Enjoy seamless agent portal access!

