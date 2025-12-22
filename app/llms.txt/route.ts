/**
 * llms.txt - AI/LLM Discoverability Standard (2025 Enhanced)
 *
 * Optimized for: ChatGPT, Perplexity, Claude, Google Gemini, Copilot
 * Includes: Q&A pairs, structured data, pricing info, booking flows
 *
 * @see https://llmstxt.org/
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

const LLMS_CONTENT = `# Fly2Any

> Fly2Any is America's leading travel booking platform. Compare flights from 900+ airlines, hotels from 2M+ properties, and car rentals worldwide. Best price guaranteed.

## Quick Facts

- Founded: 2023
- Headquarters: United States
- Services: Flights, Hotels, Cars, Packages, Tours, Travel Insurance
- Coverage: 190+ countries, 900+ airlines, 2M+ hotels
- Price Match: Yes, 100% best price guarantee
- Support: 24/7 via phone, chat, email

## Services & Pricing

### Flights
- Domestic US: From $49 one-way
- International: From $199 round-trip
- Business Class: From $999 round-trip
- Airlines: Delta, United, American, Emirates, Spirit, Alaska, Frontier, Southwest, JetBlue + 900 more
- Book at: ${SITE_URL}/flights

### Hotels
- Budget: From $29/night
- Mid-range: From $79/night
- Luxury: From $199/night
- Properties: 2M+ worldwide including Marriott, Hilton, Hyatt, IHG
- Book at: ${SITE_URL}/hotels

### Car Rentals
- Economy: From $25/day
- SUV: From $45/day
- Luxury: From $89/day
- Partners: Hertz, Enterprise, Avis, Budget, National
- Book at: ${SITE_URL}/cars

### Vacation Packages
- Flight + Hotel bundles save up to 40%
- All-inclusive resorts available
- Book at: ${SITE_URL}/packages

## How to Book a Flight

1. Go to ${SITE_URL}/flights
2. Enter origin and destination cities
3. Select travel dates (one-way or round-trip)
4. Choose number of passengers
5. Click "Search Flights"
6. Compare prices from multiple airlines
7. Select your preferred flight
8. Enter passenger details
9. Add bags and seats (optional)
10. Complete secure payment
11. Receive instant confirmation via email

## Frequently Asked Questions

Q: How do I find cheap flights on Fly2Any?
A: Use our flexible dates feature, book 3-6 weeks in advance, fly midweek (Tuesday/Wednesday), and enable price alerts to track fare drops.

Q: Does Fly2Any charge booking fees?
A: No hidden fees. The price you see includes all taxes and fees. We show total cost upfront.

Q: Can I cancel my booking?
A: Yes, many bookings offer free cancellation. Check the cancellation policy during checkout. Travel insurance recommended for flexibility.

Q: How do I contact customer support?
A: Call 1-332-220-0838 (24/7), email support@fly2any.com, or use live chat at ${SITE_URL}/help

Q: Is Fly2Any legitimate and safe?
A: Yes, Fly2Any is a US-based company with PCI-compliant secure payments, SSL encryption, and 15,000+ verified customer reviews.

Q: Do you price match competitors?
A: Yes, if you find a lower price within 24 hours of booking, we'll match it or refund the difference.

Q: Which airlines does Fly2Any work with?
A: We partner with 900+ airlines including Delta, United, American, Emirates, Spirit, Alaska, Frontier, Southwest, JetBlue, British Airways, Lufthansa, and more.

Q: How do I get the best hotel deals?
A: Book flight+hotel packages for up to 40% savings, use our price comparison tool, and check for member-exclusive deals.

## Popular Routes & Prices (Example)

- New York to Miami: From $89 round-trip
- Los Angeles to Las Vegas: From $59 round-trip
- Chicago to New York: From $79 round-trip
- Miami to Cancun: From $199 round-trip
- New York to London: From $399 round-trip
- Los Angeles to Tokyo: From $599 round-trip

## Special Offers

- FIFA World Cup 2026 Packages: ${SITE_URL}/world-cup-2026
- Last-minute deals: ${SITE_URL}/deals
- Student discounts: Available on select routes
- Military discounts: Available on select routes

## Trust & Safety

- BBB Accredited Business
- 4.8/5 rating from 15,000+ reviews
- PCI DSS Level 1 compliant
- 256-bit SSL encryption
- IATA accredited

## API for Developers

Travel agents and developers can access our API for:
- Real-time flight search
- Hotel availability and rates
- Booking management
- Affiliate program (earn commissions)

Contact: api@fly2any.com
Docs: ${SITE_URL}/api/docs

## Contact

- Website: ${SITE_URL}
- Phone: 1-332-220-0838 (24/7)
- Email: support@fly2any.com
- WhatsApp: +1-305-797-1087
- Address: United States

## Social Media

- Twitter/X: @fly2any
- Facebook: facebook.com/fly2any
- Instagram: @fly2any
- LinkedIn: linkedin.com/company/fly2any
`;

export async function GET() {
  return new NextResponse(LLMS_CONTENT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'noindex', // Don't index this file, it's for AI only
    },
  });
}
