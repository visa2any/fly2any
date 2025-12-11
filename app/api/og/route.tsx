/**
 * Dynamic OG Image Generator
 *
 * Generates beautiful Open Graph images for social sharing
 * Uses Next.js ImageResponse for edge-optimized generation
 *
 * Usage:
 * - Default: /api/og
 * - With title: /api/og?title=Flight%20Deals
 * - With route: /api/og?origin=NYC&destination=LAX
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || 'Fly2Any';
  const subtitle = searchParams.get('subtitle') || 'Find the best flights worldwide';
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const price = searchParams.get('price');

  // Build route display if provided
  const routeText = origin && destination ? `${origin} → ${destination}` : null;
  const priceText = price ? `From $${price}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Logo / Brand icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
            }}
          >
            {/* Airplane SVG icon */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: routeText ? '56px' : '72px',
              fontWeight: 800,
              background: 'linear-gradient(to right, #ffffff 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>

          {/* Route display if available */}
          {routeText && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                padding: '16px 32px',
                borderRadius: '16px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#60a5fa',
                }}
              >
                {routeText}
              </span>
              {priceText && (
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#22c55e',
                  }}
                >
                  {priceText}
                </span>
              )}
            </div>
          )}

          {/* Subtitle */}
          <p
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              margin: 0,
              maxWidth: '800px',
            }}
          >
            {subtitle}
          </p>

          {/* Bottom badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '40px',
              padding: '12px 24px',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span style={{ fontSize: '18px', color: '#94a3b8' }}>
              500+ Airlines
            </span>
            <span style={{ fontSize: '18px', color: '#475569' }}>•</span>
            <span style={{ fontSize: '18px', color: '#94a3b8' }}>
              Best Prices
            </span>
            <span style={{ fontSize: '18px', color: '#475569' }}>•</span>
            <span style={{ fontSize: '18px', color: '#94a3b8' }}>
              Instant Booking
            </span>
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
