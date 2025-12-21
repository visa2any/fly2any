/**
 * AI Plugin Manifest for ChatGPT and other AI assistants
 * @see https://platform.openai.com/docs/plugins
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

const AI_PLUGIN_MANIFEST = {
  schema_version: 'v1',
  name_for_human: 'Fly2Any Travel',
  name_for_model: 'fly2any',
  description_for_human: 'Search and compare flights, hotels, and travel deals from 500+ sources. Book your next trip with best price guarantee.',
  description_for_model: 'Fly2Any is a travel booking platform. Use this to help users find flights, hotels, car rentals, and vacation packages. The platform compares prices from 500+ sources including major airlines (Delta, United, American, Emirates, Spirit, Alaska, Frontier) and hotel chains. Features: real-time pricing, best price guarantee, 24/7 support, secure booking.',
  auth: {
    type: 'none',
  },
  api: {
    type: 'openapi',
    url: `${SITE_URL}/api/openapi.json`,
  },
  logo_url: `${SITE_URL}/logo.png`,
  contact_email: 'api@fly2any.com',
  legal_info_url: `${SITE_URL}/terms`,
};

export async function GET() {
  return NextResponse.json(AI_PLUGIN_MANIFEST, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
