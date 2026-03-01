'use client';

import { useEffect } from 'react';

// Generates/retrieves a session ID from sessionStorage — survives page refresh but not new tabs
function getSessionId(): string {
  const key = 'fly2any_session';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function QuoteViewTracker({ shareableLink }: { shareableLink: string }) {
  useEffect(() => {
    const sessionId = getSessionId();
    // Fire-and-forget — track this view once per session
    fetch(`/api/quotes/share/${shareableLink}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {}); // Non-critical — ignore errors
  }, [shareableLink]);

  return null;
}
