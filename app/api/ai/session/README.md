# AI Session Management API

Complete session tracking system for anonymous and authenticated users with GDPR/CCPA compliance.

## Features

- **Anonymous Session Tracking**: Track users by IP without requiring authentication
- **Progressive Engagement**: Seamlessly migrate from anonymous to authenticated
- **Privacy-First**: IP anonymization after 24 hours, GDPR/CCPA compliant
- **Conversation Tracking**: Monitor user engagement and conversation count
- **Automatic Cleanup**: Old sessions removed after 30 days
- **Secure**: Cryptographically secure session IDs, hashed IP addresses

## API Endpoints

### 1. Create or Update Session

**POST** `/api/ai/session`

#### Create New Session
```typescript
// Request
POST /api/ai/session
Content-Type: application/json

{
  "action": "create"
}

// Response
{
  "success": true,
  "session": {
    "sessionId": "session_1699564800123_a1b2c3d4e5f6",
    "ipAddress": "[hidden for privacy]",
    "isAuthenticated": false,
    "conversationCount": 0,
    "lastActivity": "2025-11-04T12:00:00.000Z",
    "createdAt": "2025-11-04T12:00:00.000Z",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### Update Existing Session
```typescript
// Request
POST /api/ai/session
Content-Type: application/json

{
  "action": "update",
  "sessionId": "session_1699564800123_a1b2c3d4e5f6"
}

// Response
{
  "success": true,
  "session": {
    "sessionId": "session_1699564800123_a1b2c3d4e5f6",
    "conversationCount": 0,
    "lastActivity": "2025-11-04T12:05:00.000Z",
    ...
  }
}
```

#### Increment Conversation Count
```typescript
// Request
POST /api/ai/session
Content-Type: application/json

{
  "action": "increment",
  "sessionId": "session_1699564800123_a1b2c3d4e5f6",
  "incrementConversation": true
}

// Response
{
  "success": true,
  "session": {
    "sessionId": "session_1699564800123_a1b2c3d4e5f6",
    "conversationCount": 1, // Incremented!
    "lastActivity": "2025-11-04T12:10:00.000Z",
    ...
  }
}
```

#### Upgrade to Authenticated User
```typescript
// Request
POST /api/ai/session
Content-Type: application/json

{
  "action": "upgrade",
  "sessionId": "session_1699564800123_a1b2c3d4e5f6",
  "userId": "user_123",
  "email": "john@example.com",
  "name": "John Doe"
}

// Response
{
  "success": true,
  "session": {
    "sessionId": "session_1699564800123_a1b2c3d4e5f6",
    "isAuthenticated": true,
    "userId": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "conversationCount": 5,
    ...
  },
  "message": "Session upgraded to authenticated user"
}
```

### 2. Retrieve Session

**GET** `/api/ai/session?sessionId=xxx` or `/api/ai/session?ip=current`

#### Get by Session ID
```typescript
// Request
GET /api/ai/session?sessionId=session_1699564800123_a1b2c3d4e5f6

// Response
{
  "success": true,
  "session": {
    "sessionId": "session_1699564800123_a1b2c3d4e5f6",
    "conversationCount": 5,
    ...
  }
}
```

#### Get by Current IP
```typescript
// Request
GET /api/ai/session?ip=current

// Response
{
  "success": true,
  "session": {
    "sessionId": "session_1699564800123_a1b2c3d4e5f6",
    "conversationCount": 5,
    ...
  }
}
```

#### Get Session Statistics
```typescript
// Request
GET /api/ai/session

// Response
{
  "success": true,
  "stats": {
    "totalSessions": 150,
    "authenticatedSessions": 45,
    "anonymousSessions": 105,
    "anonymizedSessions": 30,
    "activeSessions24h": 87,
    "totalConversations": 892,
    "averageConversationsPerSession": "5.95"
  }
}
```

### 3. Delete Session (GDPR)

**DELETE** `/api/ai/session?sessionId=xxx`

```typescript
// Request
DELETE /api/ai/session?sessionId=session_1699564800123_a1b2c3d4e5f6

// Response
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### 4. Cleanup Old Sessions

**GET** `/api/ai/session?cleanup=true`

```typescript
// Request
GET /api/ai/session?cleanup=true

// Response
{
  "success": true,
  "message": "Cleanup completed",
  "totalSessions": 120
}
```

## Integration with Auth Strategy

This API integrates seamlessly with `lib/ai/auth-strategy.ts`:

```typescript
import { UserSession } from '@/lib/ai/auth-strategy';
import { getEngagementStage, shouldRequireAuth } from '@/lib/ai/auth-strategy';

// Get session
const response = await fetch('/api/ai/session?ip=current');
const { session } = await response.json();

// Check engagement stage
const engagement = getEngagementStage(session, 'search-flights');

// Determine if auth required
const authTrigger = shouldRequireAuth('book-flight');

// Increment conversation
await fetch('/api/ai/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'increment',
    sessionId: session.sessionId,
    incrementConversation: true
  })
});
```

## Usage Examples

### Client-Side React Hook

```typescript
// hooks/useSession.ts
import { useState, useEffect } from 'react';

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        const response = await fetch('/api/ai/session?ip=current');
        const data = await response.json();
        setSession(data.session);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  const incrementConversation = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment',
          sessionId: session.sessionId,
          incrementConversation: true
        })
      });

      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error('Failed to increment conversation:', error);
    }
  };

  const upgradeSession = async (userId: string, email: string, name: string) => {
    if (!session) return;

    try {
      const response = await fetch('/api/ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upgrade',
          sessionId: session.sessionId,
          userId,
          email,
          name
        })
      });

      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error('Failed to upgrade session:', error);
    }
  };

  return {
    session,
    loading,
    incrementConversation,
    upgradeSession
  };
}
```

### Usage in AI Chat Component

```typescript
// components/AIChat.tsx
import { useSession } from '@/hooks/useSession';
import { getEngagementStage } from '@/lib/ai/auth-strategy';

export function AIChat() {
  const { session, incrementConversation, upgradeSession } = useSession();

  const handleMessage = async (message: string) => {
    // Increment conversation count
    await incrementConversation();

    // Check if we should show auth prompt
    if (session) {
      const engagement = getEngagementStage(session, 'ask-question');

      if (engagement.showAuthPrompt) {
        // Show auth prompt after response
        console.log(engagement.promptMessage);
      }
    }

    // Send message to AI...
  };

  const handleSignUp = async (user: { id: string; email: string; name: string }) => {
    // Upgrade session to authenticated
    await upgradeSession(user.id, user.email, user.name);

    // User now has authenticated session!
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

## Privacy & Compliance

### GDPR Compliance

1. **Data Minimization**: Only essential data collected
2. **Purpose Limitation**: Clear purpose for each data point
3. **Storage Limitation**: Automatic deletion after 30 days
4. **IP Anonymization**: Full IP anonymized after 24 hours
5. **Right to Access**: `GET /api/ai/session?sessionId=xxx`
6. **Right to Delete**: `DELETE /api/ai/session?sessionId=xxx`
7. **Right to Portability**: JSON format responses

### CCPA Compliance

1. **Transparency**: Clear data collection notices
2. **Opt-Out**: Easy session deletion
3. **No Sale**: User data never sold
4. **Access Rights**: Full data access via API

### Security Features

- **Hashed IPs**: IP addresses hashed (SHA-256) before storage
- **Secure Session IDs**: Cryptographically secure random IDs
- **No Sensitive Logs**: IP addresses never logged
- **HTTPS Required**: All requests must use HTTPS in production

## Migration to Database

Currently using in-memory storage. To migrate to database:

1. Create tables (SQL provided in route.ts comments)
2. Replace Map operations with database queries
3. Add database connection
4. Implement cleanup cron job

```sql
-- See app/api/ai/session/route.ts for complete schema
CREATE TABLE user_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  ip_address_hash VARCHAR(64) NOT NULL,
  ...
);
```

## Performance Considerations

- **In-Memory**: Fast reads/writes, limited by RAM
- **Auto-Cleanup**: Runs on-demand (not automatic in dev)
- **Scale**: Supports ~100k concurrent sessions in memory
- **Database**: Required for production scale

## Monitoring

```typescript
// Check session stats
const stats = await fetch('/api/ai/session').then(r => r.json());

console.log({
  totalSessions: stats.stats.totalSessions,
  activeUsers: stats.stats.activeSessions24h,
  engagementRate: stats.stats.averageConversationsPerSession
});
```

## Error Handling

All endpoints return consistent error format:

```typescript
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common errors:
- `400`: Missing required parameters
- `404`: Session not found
- `500`: Internal server error

## Next Steps

1. Test the API endpoints
2. Integrate with your AI chat component
3. Add session tracking to conversations
4. Implement progressive auth prompts
5. Monitor engagement metrics
6. Migrate to database when ready

## Questions?

See `lib/ai/auth-strategy.ts` for progressive engagement logic and auth triggers.
