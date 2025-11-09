# 🚀 Admin Area - Quick Start Guide

## How to Access the Admin Dashboard

### **Step 1: Go to Admin URL**
```
http://localhost:3000/admin
```
or
```
https://fly2any.com/admin
```

### **Step 2: You'll See One of Three Scenarios**

#### **A) You're Not Logged In**
You'll see:
```
Authentication Required
[Sign In as Admin] ← Click this button
```

#### **B) You're Logged In as Regular User**
You'll see:
```
Access Denied
This area is restricted to administrators only.
[Go to My Account]
```
→ You need to log in with an admin account

#### **C) You're Logged In as Admin**
✅ You'll see the admin dashboard immediately!

---

## 🔑 Admin Login Credentials

**Email**: `support@fly2any.com`
**Password**: `Fly2n.`

⚠️ **IMPORTANT**: Change this password after first login!

---

## 🎯 What You Can Do in Admin Area

Once logged in as admin, you have access to:

### **1. Admin Dashboard** (`/admin`)
- Overview of bookings, users, and system metrics
- Quick access to all admin functions

### **2. AI Analytics** (`/admin/ai-analytics`)
- View AI chat conversations
- Analyze user queries and bot responses
- Track AI performance metrics

### **3. Bookings Management** (`/admin/bookings`)
- View all bookings
- Confirm or cancel bookings
- Send booking confirmation emails
- Export booking data

### **4. System Monitoring** (`/admin/monitoring`)
- Server health and uptime
- API response times
- Error logs and alerts

### **5. Performance Metrics** (`/admin/performance`)
- Page load times
- User engagement metrics
- Conversion rates

### **6. Webhooks Management** (`/admin/webhooks`)
- Configure Duffel webhooks
- View webhook logs
- Test webhook endpoints

---

## 🔧 Troubleshooting

### **Problem: "Sign In" button doesn't appear**

**Solution**: Clear your browser cache and cookies, then try again.

```bash
# Or test in incognito/private mode
# Chrome: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
# Firefox: Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
```

### **Problem: Can't log in with admin credentials**

**Check**:
1. Is the database connected? (Check Vercel environment variables)
2. Has the admin user been created? (Run `scripts/create-admin-user.ts`)
3. Are you using the correct password? (`Fly2n.` with capital F and period)

**Verify admin user exists**:
```bash
export POSTGRES_URL="your_neon_database_url"
npx tsx scripts/list-admins.ts
```

### **Problem: Logged in but see "Access Denied"**

**Your account doesn't have admin role**. You need to:

1. **Promote your account to admin**:
```bash
export POSTGRES_URL="your_neon_database_url"
npx tsx scripts/make-admin.ts your-email@example.com
```

2. **Log out and log back in** (required for role change to take effect)

### **Problem: Database not configured**

**Error**: `Environment variable not found: POSTGRES_URL`

**Solution**:
1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Add `POSTGRES_URL` with your Neon database connection string
4. Redeploy

---

## 🛠️ How to Create More Admins

### **Method 1: Using Script (Recommended)**

```bash
# 1. Set database URL
export POSTGRES_URL="postgresql://user:password@host/database"

# 2. Run make-admin script
npx tsx scripts/make-admin.ts new-admin@example.com

# Output:
# ✅ User promoted to admin successfully!
# 📧 Email: new-admin@example.com
# 🔑 Role: admin
```

### **Method 2: Database Direct Update**

```sql
-- Connect to your Neon database and run:
UPDATE users
SET role = 'admin'
WHERE email = 'new-admin@example.com';
```

### **Method 3: Create New Admin User**

```bash
# 1. Edit scripts/create-admin-user.ts
# Change email and password variables

# 2. Run the script
export POSTGRES_URL="postgresql://user:password@host/database"
npx tsx scripts/create-admin-user.ts
```

---

## 🔐 Security Best Practices

### **1. Change Default Password**
```
❌ DON'T use: Fly2n.
✅ DO use: Strong password with 12+ characters, mixed case, numbers, symbols
```

### **2. Limit Admin Access**
```
Only promote trusted users to admin role
Regularly audit admin users: npx tsx scripts/list-admins.ts
Remove admin access when no longer needed
```

### **3. Monitor Admin Activity**
```
Check admin logs regularly in /admin/monitoring
Review booking changes in /admin/bookings
Track system changes
```

### **4. Use Strong Passwords**
```
Minimum 12 characters
Mix uppercase, lowercase, numbers, symbols
Don't reuse passwords
Use a password manager
```

---

## 📊 Admin Dashboard Features

### **Bookings**
- View all flight and hotel bookings
- Filter by date, status, user
- Confirm pending bookings
- Cancel bookings
- Send confirmation emails
- Export to CSV/Excel

### **AI Analytics**
- View all AI chat conversations
- Analyze user queries
- Track consultant handoffs
- See booking success rates from AI chat
- Identify areas for AI improvement

### **System Monitoring**
- Server uptime and health
- API response times
- Error rates and logs
- Database connection status
- Cache hit rates

### **Webhooks**
- Configure Duffel webhook endpoints
- View webhook delivery logs
- Retry failed webhooks
- Test webhook handlers

---

## 🎓 Video Tutorials (Coming Soon)

- [ ] How to access admin dashboard
- [ ] Managing bookings
- [ ] Analyzing AI chat conversations
- [ ] Creating new admin users
- [ ] System monitoring best practices

---

## 📞 Need Help?

**Contact**: support@fly2any.com
**Documentation**: See `ADMIN_SECURITY_SETUP.md` for detailed setup
**Issues**: Check `ADMIN_ACCESS_FIXED.md` for troubleshooting

---

## ✅ Quick Checklist

Before using admin area:

- [ ] Database connected (POSTGRES_URL set in Vercel)
- [ ] Admin user created (support@fly2any.com)
- [ ] Can access /admin URL
- [ ] Can log in with admin credentials
- [ ] See admin dashboard after login
- [ ] All admin pages accessible (/admin/bookings, /admin/ai-analytics, etc.)
- [ ] Password changed from default

---

## 🚀 You're All Set!

The admin area is ready to use. Visit `/admin` and log in with your credentials to get started!

**Happy Administrating!** 🎉
