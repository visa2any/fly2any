# Quick Start Guide - 5 Minutes to Integration

## 1. Test the API (30 seconds)

Open your browser console and run:

```javascript
// Create a session
fetch('/api/ai/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'create' })
}).then(r => r.json()).then(console.log)

// Get session stats
fetch('/api/ai/session').then(r => r.json()).then(console.log)
```

## 2. Add to Your AI Chat (2 minutes)

```tsx
// app/ai-chat/page.tsx
'use client';

import { useAISession } from '@/lib/hooks/useAISession';

export default function AIChatPage() {
  const { session, incrementConversation, shouldShowAuthPrompt, authPromptMessage } = useAISession();

  const handleSendMessage = async (message: string) => {
    // Increment conversation count
    await incrementConversation();

    // Your existing AI logic here...

    // Show auth prompt if needed
    if (shouldShowAuthPrompt) {
      console.log('Show auth prompt:', authPromptMessage);
      // Or show in your UI: toast.info(authPromptMessage)
    }
  };

  return (
    <div>
      <h1>AI Chat</h1>
      {session && <p>Conversations: {session.conversationCount}</p>}
      {/* Your chat UI */}
    </div>
  );
}
```

## 3. Test User Journey (2 minutes)

Open browser console:

```javascript
// Test complete user journey
async function testJourney() {
  // Create session
  const { session } = await fetch('/api/ai/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create' })
  }).then(r => r.json());

  console.log('Session created:', session.sessionId);

  // Simulate 5 conversations
  for (let i = 0; i < 5; i++) {
    await fetch('/api/ai/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'increment',
        sessionId: session.sessionId,
        incrementConversation: true
      })
    });
    console.log(`Conversation ${i + 1} sent`);
  }

  // Check final state
  const { session: final } = await fetch(`/api/ai/session?sessionId=${session.sessionId}`)
    .then(r => r.json());

  console.log('Final state:', final);
  console.log('Conversations:', final.conversationCount);
}

testJourney();
```

## 4. Add Admin Dashboard (30 seconds)

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

## 5. Handle Sign Up (30 seconds)

```tsx
// When user signs up
const handleSignUpSuccess = async (newUser: { id: string; email: string; name: string }) => {
  const { upgradeSession } = useAISession();

  await upgradeSession(newUser.id, newUser.email, newUser.name);

  console.log('Session upgraded to authenticated user!');
};
```

## That's It! 🎉

Your AI session tracking is now live. You can:

- ✅ Track anonymous users by IP
- ✅ Monitor conversation count
- ✅ Show progressive auth prompts
- ✅ Upgrade to authenticated users
- ✅ View analytics in admin dashboard
- ✅ GDPR/CCPA compliant

## Common Use Cases

### Use Case 1: Show Auth Prompt After 3 Conversations

```tsx
const { session, shouldShowAuthPrompt, authPromptMessage } = useAISession();

useEffect(() => {
  if (session && session.conversationCount === 3 && shouldShowAuthPrompt) {
    toast.info(authPromptMessage, {
      action: {
        label: 'Sign Up',
        onClick: () => router.push('/auth/signup')
      }
    });
  }
}, [session?.conversationCount]);
```

### Use Case 2: Require Auth for Booking

```tsx
const { requiresAuth, session } = useAISession({ currentAction: 'book-flight' });

const handleBookFlight = () => {
  if (requiresAuth && !session?.isAuthenticated) {
    router.push('/auth/signin?redirect=/booking');
    return;
  }

  // Proceed with booking...
};
```

### Use Case 3: Track Conversion Metrics

```tsx
const { stats } = useSessionStats();

console.log({
  conversionRate: (stats.authenticatedSessions / stats.totalSessions * 100).toFixed(1) + '%',
  avgEngagement: stats.averageConversationsPerSession
});
```

## Troubleshooting

### Session not created?
```javascript
// Check API is working
fetch('/api/ai/session?ip=current').then(r => r.json()).then(console.log)
```

### Hook not updating?
```tsx
// Make sure you're using 'use client' at the top
'use client';

import { useAISession } from '@/lib/hooks/useAISession';
```

### Need to delete session? (GDPR)
```javascript
// In browser console
fetch('/api/ai/session?sessionId=YOUR_SESSION_ID', { method: 'DELETE' })
  .then(r => r.json())
  .then(console.log)
```

## Next Steps

1. Read full docs: `README.md`
2. Check integration guide: `INTEGRATION_GUIDE.md`
3. Run tests: `test.example.ts`
4. Customize auth prompts
5. Add analytics events
6. Migrate to database (when ready)

## Support

- Full API docs: `README.md`
- Integration examples: `INTEGRATION_GUIDE.md`
- Type definitions: `../../../types/session.ts`
- Auth strategy: `../../../lib/ai/auth-strategy.ts`
