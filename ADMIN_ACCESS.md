# Admin Access - Quick Setup

## 🎯 **AUTOMATIC SETUP (Recommended)**

The system now **automatically creates admin accounts**! Just follow these steps:

### **Method 1: First User Becomes Admin (Easiest)**

1. **Create any account** (sign up or use Google)
2. **Try to access** `/admin` or `/admin/affiliates`
3. **You'll automatically become admin!** (if no other admins exist)

That's it! The system will:
- ✅ Auto-create a default admin account on first admin page access
- ✅ Make the first user who tries to access admin the super admin
- ✅ Show credentials in server console

---

### **Method 2: Use Default Admin Account**

When you first access any `/admin/*` page, the system creates:

```
Email:    admin@fly2any.com
Password: admin123
```

**Check your server console** for the credentials!

---

## 🌐 **Browser Console Method (Backup)**

If automatic setup doesn't work, open browser console (F12) and run:

```javascript
fetch('/api/admin/seed-admin',{method:'POST'}).then(r=>r.json()).then(d=>alert('Email: '+d.credentials.email+'\nPassword: '+d.credentials.password))
```

**One line, no syntax errors!**

---

## 📋 **Step-by-Step: Access Admin Panel**

### **Option A: Use Your Own Account**

1. **Sign up** at `/auth/signin` (use any email)
2. **Go to** `/admin/affiliates`
3. **You're now admin!** (first user auto-promoted)

### **Option B: Use Default Admin**

1. **Go to** `/admin` (triggers auto-creation)
2. **Check server console** for credentials
3. **Sign in** at `/auth/signin` with the credentials shown
4. **Access** `/admin/affiliates`

---

## 🔍 **Verify Admin Access**

Run this in browser console to check your admin status:

```javascript
fetch('/api/auth/session').then(r=>r.json()).then(console.log)
```

If you're admin, you'll see your session data.

---

## 🚨 **Troubleshooting**

### **Still Getting Redirected?**

1. **Clear cookies** (Ctrl+Shift+Delete)
2. **Sign out** completely
3. **Close all browser tabs**
4. **Restart the dev server** (`npm run dev`)
5. **Sign in again**
6. **Try accessing** `/admin/affiliates`

### **Check Server Logs**

Look for these messages in your terminal:

```
✅ DEFAULT ADMIN CREATED SUCCESSFULLY!
✅ Email:    admin@fly2any.com
✅ Password: admin123
```

OR

```
✅ Made first user admin: your-email@example.com
```

### **Manual Database Check**

If you want to see all admins in the database:

```bash
npx prisma studio
```

Then open the `admin_users` table.

---

## 🔒 **Security Notes**

⚠️ **These features are DEV-ONLY:**
- Auto-creation of admin accounts
- Auto-promotion of first user
- Default admin@fly2any.com account

**In production (`NODE_ENV=production`):**
- ❌ Auto-creation is DISABLED
- ❌ Auto-promotion is DISABLED
- ✅ Manual admin creation required

---

## 🎯 **Current Admin Features**

Once logged in as admin, you can access:

- ✅ `/admin/dashboard` - Overview & metrics
- ✅ `/admin/affiliates` - Manage affiliate partners
- ✅ `/admin/affiliates/[id]` - View affiliate details
- ✅ `/admin/bookings` - View all bookings
- ✅ `/admin/users` - Manage users
- ✅ `/admin/analytics` - View analytics

---

## 📊 **Default Admin Credentials**

```
Email:    admin@fly2any.com
Password: admin123
Role:     super_admin
```

**These are created automatically on first `/admin` page access!**

---

## ✅ **Quick Test**

1. Open browser
2. Go to `http://localhost:3000`
3. Click "Sign In" → Create account (or use Google)
4. Go to `http://localhost:3000/admin/affiliates`
5. ✅ **You're in!** (auto-promoted to admin)

---

## 🎉 **That's It!**

The admin system is now **fully automatic**. Just sign in and access any admin page!
