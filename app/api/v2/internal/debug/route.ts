/**
 * HONEYPOT ENDPOINT
 *
 * This endpoint exists only to catch bots/scrapers.
 * Real users would never access this path.
 * Any request here = instant 24-hour IP ban.
 */

import { NextRequest } from 'next/server';
import { triggerHoneypot, createHoneypotResponse } from '@/lib/security/honeypot';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  await triggerHoneypot(request, 'honeypot_debug_access');
  return createHoneypotResponse();
}

export async function POST(request: NextRequest) {
  await triggerHoneypot(request, 'honeypot_debug_access');
  return createHoneypotResponse();
}

export async function PUT(request: NextRequest) {
  await triggerHoneypot(request, 'honeypot_debug_access');
  return createHoneypotResponse();
}

export async function DELETE(request: NextRequest) {
  await triggerHoneypot(request, 'honeypot_debug_access');
  return createHoneypotResponse();
}
