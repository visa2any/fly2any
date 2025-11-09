# 🔐 Admin User Setup - Quick Guide

## Admin User Created: support@fly2any.com

**Email**: `support@fly2any.com`
**Password**: `Fly2n.`
**Role**: `admin`

---

## 🚀 Setup Instructions

### Option 1: Automated Script (RECOMMENDED)

```bash
# Make sure POSTGRES_URL is set in .env
export POSTGRES_URL="your-database-url"

# Or add to .env file:
echo "POSTGRES_URL=your-database-url" >> .env

# Run the creation script
npx tsx scripts/create-admin-user.ts
```

**What it does**:
- ✅ Creates user: support@fly2any.com
- ✅ Sets password: Fly2n. (hashed with bcrypt)
- ✅ Sets role: admin
- ✅ Marks email as verified
- ✅ Creates default preferences
- ✅ If user exists, updates to admin role

---

### Option 2: Manual Database Insert

If you prefer to create manually:

```sql
-- Hash the password first (use bcrypt with 10 rounds)
-- Password "Fly2n." hashed = $2a$10$...

-- Insert admin user
INSERT INTO users (
  id,
  email,
  name,
  password,
  role,
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid()::text, -- or use cuid
  'support@fly2any.com',
  'Admin Support',
  '$2a$10$YourHashedPasswordHere', -- Hash "Fly2n." with bcrypt
  'admin',
  NOW(),
  NOW(),
  NOW()
);

-- Create default preferences
INSERT INTO "UserPreferences" (id, "userId")
SELECT gen_random_uuid()::text, id
FROM users
WHERE email = 'support@fly2any.com';
```

---

### Option 3: Make Existing User Admin

If support@fly2any.com already exists as a regular user:

```bash
# Use the make-admin script
npx tsx scripts/make-admin.ts support@fly2any.com
```

---

## 🧪 Testing Admin Access

### Step 1: Sign In
```
1. Go to: http://localhost:3000/auth/signin
2. Email: support@fly2any.com
3. Password: Fly2n.
4. Click "Sign In"
```

### Step 2: Access Admin Dashboard
```
1. Go to: http://localhost:3000/admin
2. Expected: ✅ Dashboard loads (not redirected)
```

### Step 3: Test Analytics
```
1. Go to: http://localhost:3000/admin/ai-analytics
2. Expected: ✅ Analytics dashboard loads
```

---

## 🔒 Security Notes

### Password Security
- Current password: `Fly2n.` (temporary)
- **⚠️ CHANGE THIS PASSWORD** after first login!
- Use strong password in production (12+ chars, mixed case, numbers, symbols)

### Changing Admin Password

**Option 1: Via Web UI** (Coming Soon)
```
1. Sign in as admin
2. Go to: /account/security
3. Change password
```

**Option 2: Via Database**
```bash
# Hash new password
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NewPassword123!', 10));"

# Update in database
psql $POSTGRES_URL -c "UPDATE users SET password = '$2a$10$...' WHERE email = 'support@fly2any.com';"
```

**Option 3: Via Script**
```javascript
// update-password.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  const hashedPassword = await bcrypt.hash('NewPassword123!', 10);
  await prisma.user.update({
    where: { email: 'support@fly2any.com' },
    data: { password: hashedPassword },
  });
  console.log('✅ Password updated!');
}

updatePassword();
```

---

## 📋 Admin User Details

```json
{
  "email": "support@fly2any.com",
  "name": "Admin Support",
  "role": "admin",
  "password": "Fly2n.",
  "emailVerified": true,
  "permissions": [
    "Access all /admin routes",
    "View AI analytics",
    "Manage bookings",
    "View performance metrics",
    "Manage webhooks",
    "System monitoring"
  ]
}
```

---

## 🛠️ Troubleshooting

### "User not found" when signing in
**Cause**: Script hasn't been run yet or database not configured
**Solution**: Run `npx tsx scripts/create-admin-user.ts`

### "Access Denied" after signing in
**Cause**: User role is not 'admin'
**Solution**: Run `npx tsx scripts/make-admin.ts support@fly2any.com`

### "Invalid credentials"
**Cause**: Wrong password or user doesn't exist
**Solution**:
1. Check password is exactly: `Fly2n.` (case-sensitive)
2. Verify user exists: `npx tsx scripts/list-admins.ts`

### "Database not configured"
**Cause**: POSTGRES_URL not set
**Solution**: Add to .env file:
```bash
POSTGRES_URL="postgresql://user:password@host:5432/database"
```

---

## 📊 Verification Commands

### Check if user exists
```bash
npx tsx scripts/list-admins.ts
```

### Check user in database
```sql
SELECT email, role, name, "emailVerified"
FROM users
WHERE email = 'support@fly2any.com';
```

### Test authentication
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"support@fly2any.com","password":"Fly2n."}'
```

---

## 🎯 Next Steps

After creating admin user:

1. ✅ **Test Sign In**
   - Sign in with credentials above
   - Verify access to /admin routes

2. ✅ **Change Password** (IMPORTANT!)
   - Use strong password for production
   - Document new password securely

3. ✅ **Create Additional Admins** (if needed)
   ```bash
   npx tsx scripts/make-admin.ts another-admin@example.com
   ```

4. ✅ **Enable 2FA** (Recommended - TODO)
   - Add 2FA for admin accounts
   - Extra security layer

---

## 📞 Support

**Admin Email**: support@fly2any.com
**Admin Password**: Fly2n. (temporary - change immediately)
**Admin Access**: All /admin routes

**Files**:
- Script: `scripts/create-admin-user.ts`
- Helper: `scripts/make-admin.ts`
- List: `scripts/list-admins.ts`

---

**STATUS**: ✅ Admin user configured and ready to create when database is available.

**Run**: `npx tsx scripts/create-admin-user.ts` (after setting POSTGRES_URL)
