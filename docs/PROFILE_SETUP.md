# Profile Management System - Setup Guide

## Quick Start

### 1. Database Migration

Run the Prisma migration to add the new profile and security tables:

```bash
npx prisma migrate dev --name add_profile_management
```

This will create:
- User profile fields (firstName, lastName, phone, etc.)
- UserSession table
- LoginHistory table

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Create Avatars Directory

The avatars directory has been created at `/public/avatars/`. Ensure it has write permissions:

```bash
# Unix/Linux/Mac
chmod 755 public/avatars

# Windows - no action needed, directory is ready
```

### 4. Environment Variables

No additional environment variables are required for basic functionality.

For production with cloud storage, add:

```env
# Vercel Blob (optional)
BLOB_READ_WRITE_TOKEN=your_token_here

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 5. Test the System

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/account/profile`

3. You should see the profile page with all sections

## What Was Created

### Pages
- `/app/account/profile/page.tsx` - Main profile management page

### Components (11 files)
- `EditProfileButton.tsx` + `EditProfileModal.tsx` - Profile editing
- `AvatarUploadButton.tsx` + `AvatarUploadModal.tsx` - Avatar management
- `ChangePasswordButton.tsx` + `ChangePasswordModal.tsx` - Password change
- `DeleteAccountButton.tsx` + `DeleteAccountModal.tsx` - Account deletion
- `ActiveSessions.tsx` - Session monitoring
- `LoginHistory.tsx` - Login history tracking

### API Routes (6 endpoints)
- `GET /api/account` - Get user profile
- `PUT /api/account` - Update profile
- `DELETE /api/account` - Delete account
- `POST /api/account/avatar` - Upload avatar
- `DELETE /api/account/avatar` - Remove avatar
- `PUT /api/account/password` - Change password
- `GET /api/account/sessions` - List sessions
- `DELETE /api/account/sessions/[id]` - Revoke session
- `DELETE /api/account/sessions/all` - Revoke all sessions
- `GET /api/account/login-history` - Get login history

### Database Schema Updates
- Added 9 profile fields to User model
- Created UserSession model
- Created LoginHistory model

### Documentation
- `PROFILE_MANAGEMENT_GUIDE.md` - Complete feature documentation
- `PROFILE_SETUP.md` - This setup guide

## Database Schema Changes

The following fields were added to the User model:

```prisma
model User {
  // NEW: Profile fields
  firstName     String?
  lastName      String?
  phone         String?
  dateOfBirth   DateTime?
  gender        String?
  country       String?
  timezone      String?
  bio           String?
  avatarUrl     String?

  // NEW: Metadata
  profileCompleted Boolean @default(false)

  // NEW: Relations
  userSessions  UserSession[]
  loginHistory  LoginHistory[]
}
```

Two new models were added:

```prisma
model UserSession {
  id         String   @id @default(cuid())
  userId     String
  token      String   @unique
  device     String?
  browser    String?
  os         String?
  location   String?
  ipAddress  String?
  lastActive DateTime @default(now())
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LoginHistory {
  id        String   @id @default(cuid())
  userId    String
  device    String?
  browser   String?
  os        String?
  location  String?
  ipAddress String?
  success   Boolean  @default(true)
  timestamp DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Feature Access

After setup, users can access the profile page at:
```
/account/profile
```

From the account dashboard (`/account`), there should be a link to the profile page.

## Testing Checklist

Run through these tests to verify everything works:

### Basic Functionality
- [ ] Profile page loads without errors
- [ ] All sections display correctly
- [ ] Edit profile modal opens and closes
- [ ] Avatar upload modal opens and closes
- [ ] Change password modal opens and closes
- [ ] Delete account modal opens and closes

### Profile Editing
- [ ] Can update first name and last name
- [ ] Can update phone number
- [ ] Can select date of birth
- [ ] Can select gender
- [ ] Can select country
- [ ] Can select timezone
- [ ] Can enter bio
- [ ] Changes save successfully
- [ ] Page refreshes with new data

### Avatar Upload
- [ ] Can click to select image
- [ ] Can drag and drop image
- [ ] Can rotate image
- [ ] Upload succeeds
- [ ] Avatar displays on profile
- [ ] Can remove avatar

### Password Change
- [ ] Password requirements display
- [ ] Strength meter works
- [ ] Validation works
- [ ] Password change succeeds
- [ ] Error shows for wrong current password

### Session Management
- [ ] Active sessions display
- [ ] Current session is marked
- [ ] Can revoke individual session
- [ ] Can revoke all sessions

### Login History
- [ ] Login history displays
- [ ] Can filter by status
- [ ] Can export to CSV

### Account Deletion
- [ ] Warning displays
- [ ] Must type DELETE
- [ ] Deletion works
- [ ] User is logged out

## Common Issues

### Issue: Profile page shows "Database not configured"
**Solution:** Ensure `DATABASE_URL` is set in `.env` and run `npx prisma migrate dev`

### Issue: Avatar upload fails with "Cannot write file"
**Solution:** Check that `/public/avatars/` directory exists and has write permissions

### Issue: Password change fails
**Solution:** Verify bcryptjs is installed: `npm install bcryptjs`

### Issue: Sessions don't display
**Solution:** Ensure the UserSession table was created by running the migration

### Issue: Login history is empty
**Solution:** Login history is only populated on new logins. This feature tracks future logins.

## Security Considerations

### Before Production

1. **Rate Limiting**: Implement rate limiting on all endpoints
   ```typescript
   // Example using middleware
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

2. **File Upload**: Consider migrating to cloud storage (Vercel Blob, S3, Cloudinary)

3. **Email Notifications**: Implement email sending for:
   - Password changes
   - Account deletions
   - Suspicious logins

4. **Audit Logging**: Add comprehensive audit trail for security events

5. **2FA**: Implement two-factor authentication

6. **HTTPS**: Ensure all connections use HTTPS in production

## Migration from Local to Cloud Storage

When ready to migrate avatars to cloud storage:

### Option 1: Vercel Blob
```typescript
// app/api/account/avatar/route.ts
import { put } from '@vercel/blob';

const blob = await put(`avatars/${userId}.jpg`, file, {
  access: 'public',
});

// Update user with blob.url
await prisma.user.update({
  where: { id: userId },
  data: { avatarUrl: blob.url },
});
```

### Option 2: AWS S3
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const key = `avatars/${userId}.jpg`;

await s3.send(new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: key,
  Body: buffer,
  ContentType: file.type,
}));

const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
```

## Performance Optimization

### Database Indexes
The schema includes indexes for optimal query performance:
```prisma
@@index([userId])
@@index([userId, lastActive])
@@index([userId, timestamp])
```

### Image Optimization
Consider adding image optimization:
```typescript
import sharp from 'sharp';

const optimized = await sharp(buffer)
  .resize(400, 400)
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Caching
Implement caching for profile data:
```typescript
import { cache } from 'react';

export const getProfile = cache(async (userId: string) => {
  return await prisma.user.findUnique({ where: { id: userId } });
});
```

## Monitoring

Set up monitoring for:
- Avatar upload success rate
- Password change attempts
- Failed login rate
- Session revocation events
- Account deletion rate

Use services like:
- Sentry for error tracking
- Vercel Analytics for performance
- Custom logging for security events

## Support

For issues or questions:
1. Check the troubleshooting section in `PROFILE_MANAGEMENT_GUIDE.md`
2. Review the API documentation
3. Check server logs for errors
4. Verify database schema matches expected structure

## Next Steps

1. Run database migration
2. Test all features manually
3. Set up email notifications
4. Implement rate limiting
5. Add 2FA (optional)
6. Migrate to cloud storage (optional)
7. Set up monitoring
8. Deploy to production

Congratulations! Your profile management system is ready to use.
