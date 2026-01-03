// app/api/auth/demo/route.ts
// Demo Agent Login - Creates temp session for dashboard preview
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

const DEMO_USER = {
  id: 'demo-agent-001',
  email: 'demo@fly2any.com',
  name: 'Demo Agent',
  image: null,
  role: 'AGENT',
};

const DEMO_AGENT = {
  id: 'demo-agent-001',
  tier: 'DEMO',
  status: 'ACTIVE',
  businessName: 'Demo Travel Agency',
  defaultCommission: 0.10,
};

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    // Create demo JWT token (expires in 30 min)
    const token = await encode({
      token: {
        sub: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        role: DEMO_USER.role,
        isDemo: true,
        agent: DEMO_AGENT,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
      },
      secret,
    });

    // Set session cookie
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60, // 30 min
    });

    // Also set for production with __Secure prefix
    if (isProduction) {
      cookieStore.set('__Secure-next-auth.session-token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 60,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo session started',
      expiresIn: '30 minutes'
    });
  } catch (error) {
    console.error('[DEMO_AUTH_ERROR]', error);
    return NextResponse.json({ error: 'Failed to start demo' }, { status: 500 });
  }
}
