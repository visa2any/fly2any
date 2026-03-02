// app/api/dev/unlock/route.ts
// DEV-ONLY: Unlock rate-limited accounts for local testing
// This route is blocked in production
import { NextRequest, NextResponse } from 'next/server';
import { clearLoginAttempts } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  await clearLoginAttempts(email);
  return NextResponse.json({ success: true, message: `Unlocked: ${email}` });
}
