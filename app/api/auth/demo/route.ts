// app/api/auth/demo/route.ts
// Demo Agent Login - Creates temp session for dashboard preview
import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export const dynamic = "force-dynamic";

const DEMO_USER = {
  id: "demo-agent-001",
  email: "demo@fly2any.com",
  name: "Demo Agent",
  image: null,
  role: "AGENT",
};

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[DEMO_AUTH] Missing NEXTAUTH_SECRET");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const isProd = process.env.NODE_ENV === "production";

    // Auth.js v5 uses "authjs.session-token" as the salt/cookie name
    const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";

    // Create demo JWT token (expires in 30 min)
    const now = Math.floor(Date.now() / 1000);
    const token = await encode({
      token: {
        sub: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        picture: null,
        role: DEMO_USER.role,
        isDemo: true,
        iat: now,
        exp: now + 30 * 60,
        jti: `demo-${Date.now()}`,
      },
      secret,
      salt: cookieName, // Auth.js v5 requires salt (cookie name)
      maxAge: 30 * 60,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: "Demo session started",
      expiresIn: "30 minutes",
    });

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 30 * 60,
    };

    // Set the session cookie
    response.cookies.set(cookieName, token, cookieOptions);

    // Also set non-secure version for compatibility
    if (isProd) {
      response.cookies.set("authjs.session-token", token, cookieOptions);
    }

    console.log("[DEMO_AUTH] Session created for demo-agent-001");
    return response;
  } catch (error) {
    console.error("[DEMO_AUTH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to start demo", details: String(error) },
      { status: 500 }
    );
  }
}
