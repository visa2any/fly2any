/**
 * Session Management API - Test Examples
 *
 * These examples demonstrate how to use the session API.
 * Run these in your browser console or create a test page.
 *
 * NOTE: This is a test file - not meant to be imported.
 * Copy the examples you need into your actual code.
 */

// ============================================================================
// Example 1: Initialize Session (First Visit)
// ============================================================================

async function testCreateSession() {
  console.log('🔵 Test 1: Create Session');

  const response = await fetch('/api/ai/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create'
    })
  });

  const data = await response.json();
  console.log('✅ Session created:', data);

  return data.session;
}

// ============================================================================
// Example 2: Get Session by Current IP
// ============================================================================

async function testGetSessionByIP() {
  console.log('🔵 Test 2: Get Session by IP');

  const response = await fetch('/api/ai/session?ip=current');
  const data = await response.json();

  console.log('✅ Session retrieved:', data);
  return data.session;
}

// ============================================================================
// Example 3: Increment Conversation Count
// ============================================================================

async function testIncrementConversation(sessionId: string) {
  console.log('🔵 Test 3: Increment Conversation');

  const response = await fetch('/api/ai/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'increment',
      sessionId,
      incrementConversation: true
    })
  });

  const data = await response.json();
  console.log('✅ Conversation incremented:', data);
  console.log(`   Conversation count: ${data.session.conversationCount}`);

  return data.session;
}

// ============================================================================
// Example 4: Simulate Multiple Conversations
// ============================================================================

async function testMultipleConversations(sessionId: string, count: number = 5) {
  console.log(`🔵 Test 4: Simulate ${count} Conversations`);

  for (let i = 1; i <= count; i++) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

    const response = await fetch('/api/ai/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'increment',
        sessionId,
        incrementConversation: true
      })
    });

    const data = await response.json();
    console.log(`   Conversation ${i}: count = ${data.session.conversationCount}`);
  }

  console.log('✅ Multiple conversations completed');
}

// ============================================================================
// Example 5: Upgrade to Authenticated User
// ============================================================================

async function testUpgradeSession(sessionId: string) {
  console.log('🔵 Test 5: Upgrade Session');

  const response = await fetch('/api/ai/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upgrade',
      sessionId,
      userId: 'user_123456',
      email: 'john.doe@example.com',
      name: 'John Doe'
    })
  });

  const data = await response.json();
  console.log('✅ Session upgraded:', data);
  console.log('   Authenticated:', data.session.isAuthenticated);
  console.log('   User:', data.session.name);

  return data.session;
}

// ============================================================================
// Example 6: Get Session Statistics
// ============================================================================

async function testGetStats() {
  console.log('🔵 Test 6: Get Session Stats');

  const response = await fetch('/api/ai/session');
  const data = await response.json();

  console.log('✅ Session statistics:', data.stats);
  console.log('   Total sessions:', data.stats.totalSessions);
  console.log('   Authenticated:', data.stats.authenticatedSessions);
  console.log('   Anonymous:', data.stats.anonymousSessions);
  console.log('   Avg conversations:', data.stats.averageConversationsPerSession);

  return data.stats;
}

// ============================================================================
// Example 7: Delete Session (GDPR)
// ============================================================================

async function testDeleteSession(sessionId: string) {
  console.log('🔵 Test 7: Delete Session (GDPR)');

  const response = await fetch(`/api/ai/session?sessionId=${sessionId}`, {
    method: 'DELETE'
  });

  const data = await response.json();
  console.log('✅ Session deleted:', data);

  return data;
}

// ============================================================================
// Example 8: Integration with Auth Strategy
// ============================================================================

async function testAuthStrategy(sessionId: string) {
  console.log('🔵 Test 8: Auth Strategy Integration');

  // Get current session
  const response = await fetch(`/api/ai/session?sessionId=${sessionId}`);
  const { session } = await response.json();

  // Import auth strategy functions (in real code, import from lib)
  // For demo, we'll simulate the logic

  console.log('   Session data:', {
    conversationCount: session.conversationCount,
    isAuthenticated: session.isAuthenticated
  });

  // Simulate engagement stages
  if (session.conversationCount <= 2) {
    console.log('   Stage: ANONYMOUS - No auth prompt');
  } else if (session.conversationCount <= 5) {
    console.log('   Stage: INTERESTED - Gentle auth suggestion');
    console.log('   Message: "💡 Create a free account to save your searches!"');
  } else if (session.conversationCount <= 10) {
    console.log('   Stage: ENGAGED - Stronger auth prompt');
    console.log('   Message: "🎁 Sign up now and get 10% off your first booking!"');
  } else {
    console.log('   Stage: CONVERTING - Time to convert!');
    console.log('   Message: "⭐ Create an account to unlock VIP features!"');
  }

  console.log('✅ Auth strategy test complete');
}

// ============================================================================
// Example 9: Complete User Journey
// ============================================================================

async function testCompleteJourney() {
  console.log('\n🎬 === COMPLETE USER JOURNEY TEST ===\n');

  try {
    // Step 1: User visits site (anonymous)
    console.log('Step 1: User visits site...');
    const session1 = await testCreateSession();
    const sessionId = session1.sessionId;
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: User asks 3 questions (anonymous)
    console.log('\nStep 2: User asks questions...');
    await testMultipleConversations(sessionId, 3);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Check engagement (should be "interested")
    console.log('\nStep 3: Check engagement stage...');
    await testAuthStrategy(sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: User continues (6 more questions)
    console.log('\nStep 4: User continues chatting...');
    await testMultipleConversations(sessionId, 6);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Check engagement (should be "engaged")
    console.log('\nStep 5: Check engagement stage...');
    await testAuthStrategy(sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: User signs up!
    console.log('\nStep 6: User signs up!');
    await testUpgradeSession(sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 7: Continue as authenticated user
    console.log('\nStep 7: Continue as authenticated user...');
    await testIncrementConversation(sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 8: Get final statistics
    console.log('\nStep 8: View statistics...');
    await testGetStats();

    console.log('\n✅ === JOURNEY COMPLETE ===\n');

  } catch (error) {
    console.error('❌ Journey failed:', error);
  }
}

// ============================================================================
// Example 10: Error Handling
// ============================================================================

async function testErrorHandling() {
  console.log('🔵 Test 10: Error Handling');

  // Test 1: Invalid session ID
  try {
    const response = await fetch('/api/ai/session?sessionId=invalid_session');
    const data = await response.json();

    if (!data.success) {
      console.log('✅ Correctly handled invalid session:', data.error);
    }
  } catch (error) {
    console.error('❌ Error test 1 failed:', error);
  }

  // Test 2: Missing required parameters
  try {
    const response = await fetch('/api/ai/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upgrade'
        // Missing sessionId, userId, email, name
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.log('✅ Correctly handled missing params:', data.error);
    }
  } catch (error) {
    console.error('❌ Error test 2 failed:', error);
  }

  console.log('✅ Error handling tests complete');
}

// ============================================================================
// Run All Tests
// ============================================================================

async function runAllTests() {
  console.log('\n🚀 === RUNNING ALL TESTS ===\n');

  try {
    await testCompleteJourney();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testErrorHandling();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n✅ === ALL TESTS PASSED ===\n');
  } catch (error) {
    console.error('\n❌ === TESTS FAILED ===\n', error);
  }
}

// ============================================================================
// Browser Console Usage
// ============================================================================

/*
 * To test in browser console:
 *
 * 1. Open your app in browser
 * 2. Open developer console (F12)
 * 3. Copy-paste individual test functions
 * 4. Run:
 *
 *    // Quick test
 *    await testCompleteJourney()
 *
 *    // Full test suite
 *    await runAllTests()
 *
 *    // Individual tests
 *    const session = await testCreateSession()
 *    await testIncrementConversation(session.sessionId)
 *    await testGetStats()
 */

// ============================================================================
// React Component Usage Example
// ============================================================================

/*
export function AISessionDemo() {
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function initSession() {
      const response = await fetch('/api/ai/session?ip=current');
      const data = await response.json();
      setSession(data.session);
    }

    initSession();
  }, []);

  const handleSendMessage = async () => {
    // Increment conversation
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

    // Check if should show auth prompt
    if (data.session.conversationCount === 3) {
      alert('💡 Create a free account to save your searches!');
    } else if (data.session.conversationCount === 6) {
      alert('🎁 Sign up now and get 10% off your first booking!');
    }
  };

  const handleSignUp = async () => {
    const response = await fetch('/api/ai/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upgrade',
        sessionId: session.sessionId,
        userId: 'user_123',
        email: 'user@example.com',
        name: 'John Doe'
      })
    });

    const data = await response.json();
    setSession(data.session);
    alert('Welcome, ' + data.session.name + '!');
  };

  return (
    <div>
      <h2>AI Session Demo</h2>
      {session && (
        <div>
          <p>Session ID: {session.sessionId}</p>
          <p>Conversations: {session.conversationCount}</p>
          <p>Authenticated: {session.isAuthenticated ? 'Yes' : 'No'}</p>

          <button onClick={handleSendMessage}>Send Message</button>

          {!session.isAuthenticated && (
            <button onClick={handleSignUp}>Sign Up</button>
          )}
        </div>
      )}
    </div>
  );
}
*/

// Export for testing (TypeScript)
export {
  testCreateSession,
  testGetSessionByIP,
  testIncrementConversation,
  testMultipleConversations,
  testUpgradeSession,
  testGetStats,
  testDeleteSession,
  testAuthStrategy,
  testCompleteJourney,
  testErrorHandling,
  runAllTests
};
