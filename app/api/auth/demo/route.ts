// app/api/auth/demo/route.ts
// Demo Agent Login - Creates temp session for dashboard preview
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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
      maxAge: 30 * 60,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: "Demo session started",
      expiresIn: "30 minutes",
    });

    // Set cookie via response headers (more reliable than cookies())
    const cookieName = process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60,
    });

    // Also set without prefix for compatibility
    if (process.env.NODE_ENV === "production") {
      response.cookies.set("next-auth.session-token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("[DEMO_AUTH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to start demo", details: String(error) },
      { status: 500 }
    );
  }
}
