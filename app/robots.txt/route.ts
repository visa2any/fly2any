/**
 * Dynamic robots.txt with AI Crawler Support
 * SEO + GEO + AEO + LLMCO Optimized
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export async function GET() {
  const robotsTxt = `# Fly2Any robots.txt
# SEO + GEO + AEO + LLMCO Optimized

# ============================================
# TRADITIONAL SEARCH ENGINES
# ============================================
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /

User-agent: Yandex
Allow: /
Crawl-delay: 2

# ============================================
# AI CRAWLERS & LLM TRAINING (LLMCO)
# ============================================

# OpenAI / ChatGPT
User-agent: GPTBot
Allow: /
Allow: /flights
Allow: /hotels
Allow: /cars
Allow: /tours
Allow: /deals
Allow: /airlines
Allow: /destinations
Allow: /world-cup-2026
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/
Disallow: /booking/

# Google AI (Bard/Gemini)
User-agent: Google-Extended
Allow: /
Disallow: /api/
Disallow: /admin/

# Anthropic Claude
User-agent: anthropic-ai
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: Claude-Web
Allow: /
Disallow: /api/
Disallow: /admin/

# Perplexity AI
User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /admin/

# Meta AI
User-agent: FacebookBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

# Apple AI (Siri/Apple Intelligence)
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Microsoft Copilot
User-agent: Copilot
Allow: /
Disallow: /api/

# Amazon Alexa
User-agent: Amazonbot
Allow: /

# Cohere AI
User-agent: cohere-ai
Allow: /

# Common Crawl (used for AI training)
User-agent: CCBot
Allow: /

# Diffbot (AI data extraction)
User-agent: Diffbot
Allow: /

# ============================================
# ANSWER ENGINE OPTIMIZATION (AEO)
# ============================================

# Featured Snippets & Voice Search
User-agent: AdsBot-Google
Allow: /

User-agent: AdsBot-Google-Mobile
Allow: /

# ============================================
# SOCIAL MEDIA CRAWLERS
# ============================================

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

# ============================================
# BLOCKED CRAWLERS
# ============================================

User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# ============================================
# DEFAULT RULE
# ============================================

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /checkout/
Disallow: /booking/confirm/
Disallow: /account/
Disallow: /auth/
Disallow: /payments/
# Block search result pages (infinite URL variations)
Disallow: /flights/results
Disallow: /hotels/results
Disallow: /cars/results
Disallow: /tours/results
Disallow: /activities/results
Disallow: /transfers/results

# ============================================
# SITEMAPS
# ============================================

Sitemap: ${SITE_URL}/sitemap.xml

# ============================================
# AI/LLM DISCOVERY FILES
# ============================================

# AI Plugin Manifest (ChatGPT)
# ${SITE_URL}/.well-known/ai-plugin.json

# OpenAPI Spec for AI Agents
# ${SITE_URL}/api/openapi.json

# LLM Instructions
# ${SITE_URL}/llms.txt

# ============================================
# HOST
# ============================================

Host: ${SITE_URL}
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
