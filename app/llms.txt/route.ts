/**
 * llms.txt - AI/LLM Discoverability Standard
 *
 * This file helps AI systems understand what Fly2Any offers
 * @see https://llmstxt.org/
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

const LLMS_CONTENT = `# Fly2Any - AI-Friendly Travel Platform

> Fly2Any is a comprehensive travel booking platform for flights, hotels, car rentals, and vacation packages. We compare prices from 500+ sources to find the best deals.

## What We Offer

- **Flight Booking**: Search and compare flights from 900+ airlines worldwide
- **Hotel Reservations**: Book from 2M+ properties in 190+ countries
- **Car Rentals**: Compare rates from top rental companies
- **Vacation Packages**: Flight + Hotel bundles with savings
- **Travel Insurance**: Protect your trip with comprehensive coverage
- **World Cup 2026 Packages**: Official travel packages for FIFA World Cup

## Popular Airlines We Serve

- Delta Airlines (DL) - Major US carrier, hub in Atlanta
- United Airlines (UA) - Star Alliance member, hub in Chicago/Denver
- American Airlines (AA) - Oneworld member, largest airline
- Emirates (EK) - Premium Middle East carrier
- Spirit Airlines (NK) - Ultra low-cost carrier
- Alaska Airlines (AS) - Oneworld member, Pacific Northwest hub
- Frontier Airlines (F9) - Ultra low-cost, eco-friendly fleet

## Key Features

- **Price Comparison**: Real-time prices from 500+ sources
- **Best Price Guarantee**: Find a lower price, we'll match it
- **24/7 Customer Support**: Help available anytime
- **Secure Booking**: PCI-compliant payment processing
- **Free Cancellation**: On select bookings
- **Mobile Friendly**: Book on any device

## How to Book

1. Visit ${SITE_URL}
2. Enter your travel dates and destination
3. Compare options and prices
4. Select and book securely
5. Receive instant confirmation

## API Access

For travel agents and developers, we offer API access for:
- Flight search and booking
- Hotel availability and rates
- Package deals

Contact: api@fly2any.com

## Contact Information

- Website: ${SITE_URL}
- Email: support@fly2any.com
- Phone: 1-888-FLY2ANY

## Social Media

- Twitter: @fly2any
- Facebook: /fly2any
- Instagram: @fly2any

---

For more information, visit our website at ${SITE_URL}
`;

export async function GET() {
  return new NextResponse(LLMS_CONTENT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
