# Session Management Integration Guide

Quick guide to integrate session tracking into your AI chat.

## Step 1: Add Session Hook to Your AI Chat Component

```tsx
// app/ai-chat/page.tsx or wherever your AI chat is
'use client';

import { useAISession } from '@/lib/hooks/useAISession';
import { useState } from 'react';

export default function AIChatPage() {
  const {
    session,
    loading,
    incrementConversation,
    shouldShowAuthPrompt,
    authPromptMessage,
    requiresAuth,
    upgradeSession
  } = useAISession({
    currentAction: 'ask-question' // Change based on what user is doing
  });

  const [messages, setMessages] = useState([]);

  const handleSendMessage = async (message: string) => {
    // 1. Increment conversation count
    await incrementConversation();

    // 2. Send message to AI
    // ... your existing AI logic ...

    // 3. Check if should show auth prompt
    if (shouldShowAuthPrompt) {
      // Show auth prompt in your UI
      showAuthPrompt(authPromptMessage);
    }
  };

  const handleUserSignUp = async (user: { id: string; email: string; name: string }) => {
    // Upgrade session when user signs up
    await upgradeSession(user.id, user.email, user.name);

    // Session is now authenticated!
    // You can award sign-up bonus, etc.
  };

  return (
    <div>
      {/* Your chat UI */}
      {shouldShowAuthPrompt && (
        <div className="auth-prompt">
          {authPromptMessage}
          <button onClick={() => showSignUpForm()}>Sign Up</button>
        </div>
      )}
    </div>
  );
}
```

## Step 2: Track Different Actions

```tsx
// When user is searching flights
const flightSearch = useAISession({ currentAction: 'search-flights' });

// When user is about to book
const booking = useAISession({ currentAction: 'book-flight' });
// booking.requiresAuth will be TRUE - you must ask them to sign in

// When browsing destinations
const browse = useAISession({ currentAction: 'browse-destinations' });
// browse.requiresAuth will be FALSE - they can continue as guest
```

## Step 3: Handle Progressive Authentication

```tsx
function AuthPrompt({ session, message, onSignUp, onDismiss }) {
  // Show different UI based on engagement stage

  if (session.conversationCount <= 2) {
    return null; // Don't show anything yet
  }

  if (session.conversationCount <= 5) {
    // Gentle suggestion
    return (
      <div className="toast">
        <p>{message}</p>
        <button onClick={onSignUp}>Sign Up</button>
        <button onClick={onDismiss}>Maybe Later</button>
      </div>
    );
  }

  if (session.conversationCount <= 10) {
    // Stronger prompt with benefits
    return (
      <div className="modal">
        <h3>Unlock Exclusive Benefits!</h3>
        <p>{message}</p>
        <ul>
          <li>✅ Save your searches</li>
          <li>✅ Get personalized deals</li>
          <li>✅ 10% off first booking</li>
        </ul>
        <button onClick={onSignUp}>Create Free Account</button>
        <button onClick={onDismiss}>Continue as Guest</button>
      </div>
    );
  }

  // Power user - time to convert!
  return (
    <div className="full-screen-modal">
      <h2>You're a Power User!</h2>
      <p>{message}</p>
      <button onClick={onSignUp}>Unlock VIP Features</button>
    </div>
  );
}
```

## Step 4: Add to Admin Dashboard

```tsx
// app/admin/sessions/page.tsx
import { AISessionMonitor } from '@/components/admin/AISessionMonitor';

export default function AdminSessionsPage() {
  return (
    <div className="container mx-auto py-8">
      <AISessionMonitor />
    </div>
  );
}
```

## Step 5: API Integration Examples

### Example 1: Track AI Conversation
```typescript
// In your AI chat handler
async function handleAIMessage(message: string, sessionId: string) {
  // Increment conversation
  await fetch('/api/ai/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'increment',
      sessionId,
      incrementConversation: true
    })
  });

  // Process AI message...
}
```

### Example 2: Check Auth Requirement
```typescript
import { shouldRequireAuth } from '@/lib/ai/auth-strategy';

function checkAuthForAction(action: string) {
  const authTrigger = shouldRequireAuth(action);

  if (authTrigger.requiresAuth) {
    // Show sign-in modal
    showSignInModal(authTrigger.reason);
    return false; // Block action
  }

  return true; // Allow action
}
```

### Example 3: Upgrade on Sign Up
```typescript
// In your sign-up success handler
async function onSignUpSuccess(sessionId: string, newUser: User) {
  // Upgrade session
  await fetch('/api/ai/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upgrade',
      sessionId,
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name
    })
  });

  // Award sign-up bonus
  await awardSignUpBonus(newUser.id);

  // Show welcome message
  showWelcome(newUser.name);
}
```

## Step 6: Testing

```typescript
// In browser console or test file
async function testSession() {
  // Get current session
  const session = await fetch('/api/ai/session?ip=current')
    .then(r => r.json());

  console.log('Session:', session);

  // Simulate 5 conversations
  for (let i = 0; i < 5; i++) {
    await fetch('/api/ai/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'increment',
        sessionId: session.session.sessionId,
        incrementConversation: true
      })
    });
  }

  // Check engagement
  const updated = await fetch(`/api/ai/session?sessionId=${session.session.sessionId}`)
    .then(r => r.json());

  console.log('After 5 conversations:', updated);
}
```

## Common Integration Patterns

### Pattern 1: Chat with Progressive Auth
```tsx
const { session, incrementConversation, shouldShowAuthPrompt } = useAISession();
const [showAuthToast, setShowAuthToast] = useState(false);

useEffect(() => {
  if (shouldShowAuthPrompt && !session?.isAuthenticated) {
    setShowAuthToast(true);
  }
}, [shouldShowAuthPrompt, session]);

const handleMessage = async (msg: string) => {
  await incrementConversation();
  // Send to AI...
};
```

### Pattern 2: Booking Flow with Required Auth
```tsx
const { session, requiresAuth } = useAISession({ currentAction: 'book-flight' });

const handleBooking = async () => {
  if (requiresAuth && !session?.isAuthenticated) {
    // Must sign in
    router.push('/auth/signin?redirect=/booking');
    return;
  }

  // Proceed with booking...
};
```

### Pattern 3: Stats Dashboard
```tsx
import { useSessionStats } from '@/lib/hooks/useAISession';

function AdminDashboard() {
  const { stats, loading, refresh } = useSessionStats();

  return (
    <div>
      <h2>Total Sessions: {stats?.totalSessions}</h2>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Privacy Best Practices

1. **Show Privacy Notice**:
```tsx
<div className="privacy-notice">
  We use cookies and IP tracking to improve your experience.
  <a href="/privacy">Privacy Policy</a>
</div>
```

2. **Allow Session Deletion** (GDPR):
```tsx
async function handleDeleteData() {
  await fetch(`/api/ai/session?sessionId=${sessionId}`, {
    method: 'DELETE'
  });

  alert('Your data has been deleted.');
}
```

3. **Export User Data** (GDPR):
```tsx
async function handleExportData() {
  const response = await fetch(`/api/ai/session?sessionId=${sessionId}`);
  const data = await response.json();

  // Download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-data.json';
  a.click();
}
```

## Next Steps

1. ✅ API endpoint created
2. ✅ React hooks available
3. ✅ Admin monitor ready
4. ⏳ Integrate into your AI chat
5. ⏳ Add progressive auth prompts
6. ⏳ Test user journey
7. ⏳ Monitor engagement metrics
8. ⏳ Migrate to database (when ready)

## Database Migration (Future)

When you're ready to move to database:

1. Create tables (schema in `route.ts`)
2. Replace `sessionStore` Map with database queries
3. Add cron job for cleanup
4. Add analytics tracking

```typescript
// Example database implementation
import { sql } from '@/lib/db/connection';

async function findSessionByIP(ipHash: string) {
  const result = await sql`
    SELECT * FROM user_sessions
    WHERE ip_address_hash = ${ipHash}
    AND anonymized_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return result[0] || null;
}
```

## Support

- Questions? Check the README.md in this directory
- Examples? See test.example.ts
- Auth logic? See lib/ai/auth-strategy.ts
- Monitoring? Use AISessionMonitor component
