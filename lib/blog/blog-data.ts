/**
 * BLOG DATA & CONTENT MANAGEMENT
 *
 * Centralized blog post data with SEO optimization
 * This file serves as a simple CMS until a full CMS is integrated
 *
 * @version 1.0.0
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedDate: string;
  modifiedDate?: string;
  featuredImage: string;
  readTime: number; // in minutes
  featured?: boolean;
  keywords?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

// Blog Categories
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'flight-deals',
    name: 'Flight Deals & Pricing',
    slug: 'flight-deals',
    description: 'Best flight deals, pricing strategies, and how to find cheap flights',
    icon: '💰',
  },
  {
    id: 'travel-tips',
    name: 'Travel Tips & Hacks',
    slug: 'travel-tips',
    description: 'Expert travel advice, hacks, and insider tips for better trips',
    icon: '✈️',
  },
  {
    id: 'destinations',
    name: 'Destination Guides',
    slug: 'destinations',
    description: 'Complete guides to top travel destinations worldwide',
    icon: '🌍',
  },
  {
    id: 'airline-reviews',
    name: 'Airline Reviews',
    slug: 'airline-reviews',
    description: 'In-depth airline reviews, comparisons, and ratings',
    icon: '⭐',
  },
  {
    id: 'travel-news',
    name: 'Travel News',
    slug: 'travel-news',
    description: 'Latest travel industry news, updates, and trends',
    icon: '📰',
  },
];

// Sample Blog Posts (In production, this would come from a CMS/database)
export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'best-time-to-book-flights-2025',
    title: 'Best Time to Book Flights in 2025: Complete Data-Driven Guide',
    description: 'Discover the optimal booking windows for domestic and international flights. Our 2025 analysis reveals when to book for maximum savings, based on millions of flight price data points.',
    content: `
# Best Time to Book Flights in 2025: Complete Data-Driven Guide

## When Should You Book Flights for the Best Prices?

After analyzing over 10 million flight bookings, we've identified the perfect booking windows for 2025. Here's everything you need to know to save big on your next flight.

## Domestic Flights: The 1-3 Month Sweet Spot

For domestic US flights, the optimal booking window is **1-3 months in advance**. Booking too early (6+ months) or too late (last minute) typically results in higher prices.

### Best Booking Timeline by Season:
- **Summer Travel (June-Aug):** Book 2-3 months ahead
- **Fall Travel (Sep-Nov):** Book 1-2 months ahead
- **Winter Holidays:** Book 3-4 months ahead
- **Spring Break:** Book 2-3 months ahead

## International Flights: Plan 2-8 Months Ahead

International flights require more advance planning. Our data shows:

- **Europe:** 2-4 months for best prices
- **Asia:** 3-6 months for optimal deals
- **South America:** 2-5 months advance booking
- **Australia/Oceania:** 4-8 months recommended

## Best Days to Book & Fly

### Best Days to Book:
1. **Tuesday (3pm EST)** - Airlines often release deals Tuesday afternoon
2. **Wednesday** - Competition drives prices down
3. **Sunday** - Less competition for deals

### Best Days to Fly:
1. **Tuesday & Wednesday** - Cheapest days (avg. 15% cheaper)
2. **Saturday** - Good for international flights
3. **Avoid:** Friday & Sunday (most expensive)

## Price Trends by Month

Based on 2024-2025 data:

**Cheapest Months to Fly:**
- January (post-holidays)
- February
- September (post-summer)
- October

**Most Expensive:**
- June-July (summer peak)
- December (holidays)
- March (spring break)

## Pro Tips from Our Data

1. **Set Price Alerts:** Prices fluctuate daily. Use our price alert tool to track.
2. **Be Flexible:** Shifting dates by 2-3 days can save 20-40%.
3. **Consider Alternative Airports:** Nearby airports can be $100-300 cheaper.
4. **Book One-Way Tickets Separately:** Sometimes cheaper than round-trip.
5. **Clear Cookies:** Airlines may track searches and raise prices.

## The Myth of Tuesday at Midnight

Contrary to popular belief, there's no magic hour. Our analysis shows deals appear throughout the week, with slight advantage to Tuesday-Wednesday afternoons.

## 2025 Predictions

Based on industry trends:
- **Domestic prices:** Expected to remain stable (+2-3%)
- **International:** Slight increase (+5-7%) due to fuel costs
- **Budget airlines:** Expanding routes = more competition = better deals

## Bottom Line

**Domestic:** Book 1-3 months out, fly Tuesday/Wednesday
**International:** Book 2-8 months out, be flexible on dates
**Always:** Use price alerts, compare multiple dates, consider alternatives

Start searching for your next trip on Fly2Any and use our Price Calendar to find the absolute cheapest dates!
    `,
    category: 'flight-deals',
    tags: ['booking tips', 'flight deals', 'best time to book', 'travel planning', 'save money'],
    author: {
      name: 'Sarah Martinez',
      bio: 'Travel industry analyst with 10+ years experience in flight pricing optimization',
    },
    publishedDate: '2025-01-15',
    featuredImage: '/blog/best-time-to-book-2025.jpg',
    readTime: 8,
    featured: true,
    keywords: ['best time to book flights', 'when to book flights', 'cheap flight booking', 'flight deals 2025'],
  },
  {
    id: '2',
    slug: 'hidden-airline-fees-avoid-2025',
    title: '15 Hidden Airline Fees to Avoid in 2025 (And How to Avoid Them)',
    description: 'Airlines collected $33 billion in fees in 2024. Learn how to avoid baggage fees, seat selection charges, and other hidden costs that can double your ticket price.',
    content: `
# 15 Hidden Airline Fees to Avoid in 2025

Airlines are masters at unbundling services and charging fees for everything. Here's how to avoid the most common hidden charges.

## 1. Baggage Fees ($30-$200+)

**The Fee:**
- First checked bag: $30-$35
- Second bag: $40-$45
- Overweight bag: $100-$200

**How to Avoid:**
- Get an airline credit card (free checked bags)
- Pack in a carry-on only
- Ship items ahead for long trips
- Achieve elite status

## 2. Seat Selection Fees ($10-$300)

Many airlines now charge for ANY seat selection, even middle seats.

**How to Avoid:**
- Check in exactly 24 hours before (free seats released)
- Use airline app for better seat options
- Book basic economy? Arrive early at gate for free upgrades

## 3. Change/Cancellation Fees ($75-$400)

**The Fee:** $200-$400 for domestic, up to $750 international

**How to Avoid:**
- Book refundable tickets for uncertain plans
- Buy within 24-hour free cancellation window
- Get trip insurance
- Look for airlines with no change fees (Southwest, JetBlue)

## 4. Carry-On Bag Fees ($35-$60)

Budget airlines now charge for overhead bin space!

**Who Charges:**
- Spirit, Frontier, Allegiant: $35-$60
- Basic Economy on United/American: Sometimes restricted

**How to Avoid:**
- Pack in a personal item (backpack/purse)
- Get airline credit card
- Elite status

## 5. Phone Booking Fees ($15-$25)

**How to Avoid:** Always book online or via app

[Content continues with 10 more fee categories...]

## The Real Cost of "Cheap" Tickets

A $99 Spirit flight can become $200+ after:
- Carry-on: $60
- Checked bag: $40
- Seat selection: $30
- Refreshments: $15
- Change fee: $90

**Total:** $434 (4.4x the ticket price!)

## Bottom Line

Budget airlines aren't always cheapest. Compare total costs including:
1. Bags (carry-on + checked)
2. Seat selection
3. Flexibility to change
4. In-flight amenities

Use Fly2Any's total price calculator to see TRUE costs across all airlines!
    `,
    category: 'travel-tips',
    tags: ['airline fees', 'baggage fees', 'travel tips', 'save money', 'budget travel'],
    author: {
      name: 'Michael Chen',
      bio: 'Consumer advocate and frequent flyer expert',
    },
    publishedDate: '2025-01-12',
    featuredImage: '/blog/hidden-airline-fees.jpg',
    readTime: 10,
    featured: true,
    keywords: ['airline fees', 'baggage fees', 'hidden airline charges', 'avoid airline fees'],
  },
  {
    id: '3',
    slug: 'complete-guide-airline-miles-points',
    title: 'Complete Guide to Airline Miles & Points in 2025',
    description: 'Maximize your travel rewards with our comprehensive guide to airline loyalty programs. Learn how to earn, redeem, and get maximum value from miles and points.',
    content: `
# Complete Guide to Airline Miles & Points in 2025

Airline loyalty programs can save you thousands on flights. Here's everything you need to know.

## Understanding Airline Miles

### Two Types of Programs:

1. **Revenue-Based** (Delta, United, JetBlue)
   - Earn based on dollars spent
   - Typically 5 miles per dollar
   - Elite status earns more

2. **Distance-Based** (less common now)
   - Earn based on miles flown
   - Bonus for premium cabins

## Best Airline Programs 2025

### Top 5 Programs:

1. **Alaska Mileage Plan** (Best for redemptions)
2. **Southwest Rapid Rewards** (No blackout dates)
3. **United MileagePlus** (Best network)
4. **American AAdvantage** (Most partners)
5. **Delta SkyMiles** (Easiest to earn)

[Content continues...]
    `,
    category: 'travel-tips',
    tags: ['airline miles', 'loyalty programs', 'travel rewards', 'frequent flyer', 'points'],
    author: {
      name: 'Jennifer Taylor',
      bio: 'Award travel expert and travel blogger',
    },
    publishedDate: '2025-01-10',
    featuredImage: '/blog/airline-miles-guide.jpg',
    readTime: 12,
    featured: false,
    keywords: ['airline miles', 'frequent flyer programs', 'travel rewards', 'airline points'],
  },
];

// Helper functions
export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug);
}

export function getBlogPostsByCategory(categorySlug: string): BlogPost[] {
  return BLOG_POSTS.filter(post => post.category === categorySlug);
}

export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter(post => post.featured);
}

export function getRecentPosts(limit: number = 5): BlogPost[] {
  return [...BLOG_POSTS]
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, limit);
}

export function getRelatedPosts(post: BlogPost, limit: number = 3): BlogPost[] {
  return BLOG_POSTS
    .filter(p => p.id !== post.id && (
      p.category === post.category ||
      p.tags.some(tag => post.tags.includes(tag))
    ))
    .slice(0, limit);
}
