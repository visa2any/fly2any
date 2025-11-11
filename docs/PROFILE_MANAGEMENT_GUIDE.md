# Profile Management System - Complete Guide

## Overview

The Profile Management System provides comprehensive user account management features including profile editing, avatar uploads, password management, session monitoring, and account deletion.

## Features

### 1. Profile Information Management
- **Personal Details**: First name, last name, phone, date of birth, gender
- **Location**: Country/region and timezone
- **Biography**: Personal bio (up to 500 characters)
- **Profile Completion**: Visual indicator showing profile completion percentage

### 2. Avatar Management
- **Upload**: Drag & drop or click to upload
- **Supported Formats**: JPG, PNG, WEBP
- **File Size Limit**: 5MB maximum
- **Image Editing**: Rotate and preview before upload
- **Cropping**: Automatic square crop to 400x400px
- **Storage**: Local filesystem (/public/avatars/)

### 3. Security Features
- **Password Change**: With strength validation
- **Password Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **Session Management**: View and revoke active sessions
- **Login History**: Track all login attempts (last 50)
- **Multi-Session Logout**: Revoke all other sessions on password change

### 4. Session Monitoring
- **Active Sessions**: View all active login sessions
- **Session Details**:
  - Device type (Desktop, Mobile, Tablet)
  - Browser name
  - Operating system
  - Location (city, country)
  - IP address (masked for privacy)
  - Last active timestamp
- **Session Control**: Revoke individual or all sessions

### 5. Login History
- **Tracking**: Records all login attempts
- **Details Captured**:
  - Success/failure status
  - Date and time
  - Device and browser information
  - Location
  - IP address (masked)
- **Suspicious Login Detection**: Flags unusual activity
- **Export**: Download history as CSV

### 6. Account Deletion
- **Warning System**: Clear consequences before deletion
- **Confirmation**: Type "DELETE" to confirm
- **Reason Collection**: Optional feedback
- **Data Deletion**: Removes all user data:
  - Profile information
  - Saved searches
  - Price alerts
  - Booking history
  - AI conversation history
  - Sessions and login history

## File Structure

```
app/
├── account/
│   └── profile/
│       └── page.tsx              # Main profile page
├── api/
    └── account/
        ├── route.ts              # GET, PUT, DELETE user profile
        ├── avatar/
        │   └── route.ts          # POST, DELETE avatar
        ├── password/
        │   └── route.ts          # PUT password
        ├── sessions/
        │   ├── route.ts          # GET, DELETE all sessions
        │   └── [id]/
        │       └── route.ts      # DELETE specific session
        └── login-history/
            └── route.ts          # GET login history

components/
└── account/
    ├── EditProfileButton.tsx      # Opens edit modal
    ├── EditProfileModal.tsx       # Profile editing form
    ├── AvatarUploadButton.tsx     # Opens avatar upload modal
    ├── AvatarUploadModal.tsx      # Avatar upload & crop
    ├── ChangePasswordButton.tsx   # Opens password modal
    ├── ChangePasswordModal.tsx    # Password change form
    ├── DeleteAccountButton.tsx    # Opens delete modal
    ├── DeleteAccountModal.tsx     # Account deletion confirmation
    ├── ActiveSessions.tsx         # Session management
    └── LoginHistory.tsx           # Login history display

public/
└── avatars/                       # User avatar storage

prisma/
└── schema.prisma                  # Database schema
```

## Database Schema

### User Model Extensions
```prisma
model User {
  // Profile fields
  firstName     String?
  lastName      String?
  phone         String?
  dateOfBirth   DateTime?
  gender        String?
  country       String?
  timezone      String?
  bio           String?
  avatarUrl     String?

  // Metadata
  profileCompleted Boolean @default(false)

  // Relations
  userSessions  UserSession[]
  loginHistory  LoginHistory[]
}
```

### UserSession Model
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
```

### LoginHistory Model
```prisma
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

## API Documentation

### GET /api/account
Get user profile information.

**Response:**
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01T00:00:00Z",
    "gender": "male",
    "country": "US",
    "timezone": "America/New_York",
    "bio": "Travel enthusiast",
    "avatarUrl": "/avatars/user123.jpg",
    "profileCompleted": true
  }
}
```

### PUT /api/account
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "gender": "male",
  "country": "US",
  "timezone": "America/New_York",
  "bio": "Travel enthusiast"
}
```

**Response:**
```json
{
  "user": { /* updated user object */ }
}
```

### DELETE /api/account
Delete user account permanently.

**Request Body:**
```json
{
  "reason": "not_using" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### POST /api/account/avatar
Upload user avatar.

**Request:** multipart/form-data
- `avatar`: File (max 5MB, JPG/PNG/WEBP)

**Response:**
```json
{
  "success": true,
  "avatarUrl": "/avatars/user123.jpg"
}
```

### DELETE /api/account/avatar
Remove user avatar.

**Response:**
```json
{
  "success": true
}
```

### PUT /api/account/password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "logoutOtherSessions": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### GET /api/account/sessions
Get all active sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "...",
      "device": "Desktop",
      "browser": "Chrome",
      "os": "Windows",
      "location": "New York, US",
      "ipAddress": "192.168.1.***",
      "lastActive": "2025-01-15T10:30:00Z",
      "isCurrent": true
    }
  ]
}
```

### DELETE /api/account/sessions/[id]
Revoke specific session.

**Response:**
```json
{
  "success": true,
  "message": "Session revoked"
}
```

### DELETE /api/account/sessions/all
Revoke all other sessions.

**Response:**
```json
{
  "success": true,
  "message": "All other sessions revoked"
}
```

### GET /api/account/login-history
Get login history (last 50 entries).

**Response:**
```json
{
  "history": [
    {
      "id": "...",
      "device": "Desktop",
      "browser": "Chrome",
      "os": "Windows",
      "location": "New York, US",
      "ipAddress": "192.168.1.***",
      "success": true,
      "timestamp": "2025-01-15T10:30:00Z",
      "suspicious": false
    }
  ]
}
```

## Security Considerations

### 1. File Upload Security
- **Validation**: File type and size checks
- **Sanitization**: Safe file naming
- **Storage**: Outside public code directories
- **Rate Limiting**: Max 5 uploads per hour (TODO)
- **Malware Scanning**: Implement for production (TODO)

### 2. Password Security
- **Hashing**: bcrypt with salt rounds
- **Strength Requirements**: Enforced on client and server
- **Current Password**: Required for changes
- **Session Invalidation**: Optional logout on change
- **Email Notification**: Sent on password change (TODO)

### 3. Session Security
- **Token Storage**: Secure HTTP-only cookies
- **Session Expiration**: Automatic timeout
- **Device Tracking**: Browser, OS, location
- **IP Masking**: Privacy protection in display
- **Revocation**: Immediate session termination

### 4. Data Privacy
- **IP Masking**: Last octet hidden in UI
- **Data Encryption**: In transit (HTTPS)
- **Access Control**: User can only access own data
- **Audit Logging**: Track security events (TODO)

### 5. Account Deletion
- **Confirmation**: Type "DELETE" required
- **Cascade Delete**: All related data removed
- **Irreversible**: Clear warning displayed
- **Audit Trail**: Log deletion events (TODO)
- **Goodbye Email**: Sent on deletion (TODO)

## Avatar Storage Options

### Option 1: Local Storage (Current Implementation)
**Location:** `/public/avatars/`
**Filename:** `{userId}.{ext}`

**Pros:**
- Simple implementation
- No external dependencies
- Fast local access

**Cons:**
- Not scalable for production
- No CDN benefits
- No automatic backups
- Requires manual cleanup

**Use Case:** Development and small deployments

### Option 2: Cloud Storage (Production Recommendation)

#### Vercel Blob Storage
```typescript
import { put } from '@vercel/blob';

const blob = await put(filename, file, {
  access: 'public',
  addRandomSuffix: false,
});
```

**Pros:**
- Built-in CDN
- Automatic scaling
- Simple integration
- Good pricing

#### AWS S3
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });
await s3.send(new PutObjectCommand({
  Bucket: 'avatars-bucket',
  Key: filename,
  Body: buffer,
}));
```

**Pros:**
- Industry standard
- Highly scalable
- Advanced features
- Global CDN (CloudFront)

#### Cloudinary
```typescript
import cloudinary from 'cloudinary';

const result = await cloudinary.uploader.upload(file, {
  folder: 'avatars',
  transformation: [
    { width: 400, height: 400, crop: 'fill' },
    { quality: 'auto' },
  ],
});
```

**Pros:**
- Image optimization
- Automatic transformations
- CDN included
- Easy to use

## Implementation Notes

### Profile Completion Calculation
```typescript
const fields = [
  user.firstName,
  user.lastName,
  user.phone,
  user.dateOfBirth,
  user.gender,
  user.country,
  user.timezone,
  user.bio,
  user.avatarUrl || user.image,
];
const completedFields = fields.filter(Boolean).length;
const profileCompletion = Math.round((completedFields / fields.length) * 100);
```

### Password Strength Calculation
```typescript
let score = 0;
if (password.length >= 8) score++;
if (password.length >= 12) score++;
if (/[a-z]/.test(password)) score++;
if (/[A-Z]/.test(password)) score++;
if (/[0-9]/.test(password)) score++;
if (/[^A-Za-z0-9]/.test(password)) score++;

// Score: 0-2 = weak, 3-4 = medium, 5-6 = strong
```

### User Agent Parsing
```typescript
function parseUserAgent(ua: string) {
  // Detect device
  let device = 'Desktop';
  if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile';
  if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  // Detect browser
  let browser = 'Unknown';
  if (/Chrome/i.test(ua)) browser = 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  if (/Firefox/i.test(ua)) browser = 'Firefox';

  // Detect OS
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  if (/Mac OS X/i.test(ua)) os = 'macOS';
  if (/Android/i.test(ua)) os = 'Android';
  if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}
```

## Testing Guide

### Manual Testing Checklist

#### Profile Management
- [ ] Load profile page successfully
- [ ] Edit profile with valid data
- [ ] Edit profile with invalid phone number (should fail)
- [ ] Edit profile with bio > 500 chars (should fail)
- [ ] Profile completion updates correctly
- [ ] Changes persist after page refresh

#### Avatar Upload
- [ ] Upload valid image (JPG, PNG, WEBP)
- [ ] Upload image > 5MB (should fail)
- [ ] Upload non-image file (should fail)
- [ ] Drag and drop image
- [ ] Rotate image before upload
- [ ] Remove existing avatar
- [ ] Avatar displays correctly after upload

#### Password Change
- [ ] Change password with valid data
- [ ] Change password with weak password (should fail)
- [ ] Change password with wrong current password (should fail)
- [ ] Change password with mismatched confirmation (should fail)
- [ ] Password strength indicator works
- [ ] All requirements show correct status
- [ ] Logout other sessions works

#### Session Management
- [ ] Active sessions list displays
- [ ] Current session marked correctly
- [ ] Revoke single session
- [ ] Revoke all other sessions
- [ ] Cannot revoke current session
- [ ] Sessions update every minute

#### Login History
- [ ] Login history displays
- [ ] Filter by success/failed
- [ ] Export to CSV
- [ ] Suspicious logins flagged (if implemented)
- [ ] Timestamps display correctly

#### Account Deletion
- [ ] Delete modal shows warnings
- [ ] Cannot delete without typing "DELETE"
- [ ] Account deletion works
- [ ] User logged out after deletion
- [ ] All data removed from database

#### Responsive Design
- [ ] Profile page on mobile
- [ ] Modals on mobile
- [ ] Avatar upload on mobile
- [ ] Session list on mobile
- [ ] Login history on mobile

### Automated Testing

```typescript
// Example Jest test
describe('Profile API', () => {
  it('should update user profile', async () => {
    const response = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.user.firstName).toBe('John');
  });
});
```

## Future Enhancements

### Phase 1: Security
- [ ] Two-factor authentication (2FA)
- [ ] Email verification for profile changes
- [ ] SMS verification for phone changes
- [ ] Advanced suspicious login detection
- [ ] Rate limiting on all endpoints
- [ ] CAPTCHA for sensitive operations

### Phase 2: Features
- [ ] Profile visibility settings (public/private)
- [ ] Social media account linking
- [ ] Data export (GDPR compliance)
- [ ] Account deactivation (temporary)
- [ ] Profile themes/customization
- [ ] Travel preferences integration

### Phase 3: Cloud Integration
- [ ] Migrate to Vercel Blob Storage
- [ ] Implement CDN for avatars
- [ ] Add image optimization
- [ ] Automatic backups
- [ ] Multi-region support

### Phase 4: Analytics
- [ ] Profile completion tracking
- [ ] Login pattern analysis
- [ ] Feature usage metrics
- [ ] A/B testing for UI improvements

## Troubleshooting

### Avatar Upload Fails
- Check file size < 5MB
- Verify file format (JPG, PNG, WEBP)
- Ensure /public/avatars/ directory exists
- Check file system permissions
- Review server logs for errors

### Password Change Fails
- Verify current password is correct
- Check new password meets requirements
- Ensure user has password (not OAuth-only)
- Check bcryptjs is installed

### Sessions Not Displaying
- Verify database connection
- Check UserSession table exists
- Ensure session middleware is active
- Review API route logs

### Login History Empty
- Check LoginHistory table exists
- Verify login tracking is implemented
- Ensure auth middleware logs logins
- Review database migrations

## Support & Maintenance

### Regular Maintenance
- Monitor avatar storage usage
- Clean up orphaned avatars
- Review suspicious login flags
- Archive old login history
- Update security dependencies

### Monitoring
- Track API response times
- Monitor error rates
- Alert on failed login spikes
- Track storage usage
- Monitor session counts

### Backup Strategy
- Database: Daily automated backups
- Avatars: Weekly filesystem backup
- Configuration: Version control
- Logs: 30-day retention

## Conclusion

The Profile Management System provides a comprehensive solution for user account management with strong security features and an intuitive user interface. Follow this guide for implementation, testing, and maintenance to ensure a smooth user experience.

For questions or issues, refer to the troubleshooting section or consult the development team.
