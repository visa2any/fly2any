/**
 * Sample Blog Posts Data
 *
 * Comprehensive sample data for the Fly2Any travel blog
 * Includes featured posts, flash deals, guides, news alerts, and travel tips
 */

import {
  BlogPost,
  ContentType,
  UrgencyLevel,
  type Author,
} from '@/lib/types/blog';

// Sample authors
export const authors: Record<string, Author> = {
  sarah: {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/authors/sarah.jpg',
    bio: 'Travel expert with 10+ years exploring over 80 countries',
    role: 'Senior Travel Writer',
    social: {
      twitter: '@sarahtravels',
      instagram: '@sarahjohnson.travels',
    },
  },
  mike: {
    id: '2',
    name: 'Mike Rodriguez',
    avatar: '/authors/mike.jpg',
    bio: 'Deal hunter and budget travel specialist',
    role: 'Deals Editor',
    social: {
      twitter: '@mikedeals',
    },
  },
  emily: {
    id: '3',
    name: 'Emily Chen',
    avatar: '/authors/emily.jpg',
    bio: 'Destination expert and cultural enthusiast',
    role: 'Travel Guide Writer',
    social: {
      instagram: '@emilyexplores',
    },
  },
  alex: {
    id: '4',
    name: 'Alex Turner',
    avatar: '/authors/alex.jpg',
    bio: 'Breaking travel news and industry updates',
    role: 'News Editor',
    social: {
      twitter: '@alextravelnews',
    },
  },
};

// Sample blog posts
export const sampleBlogPosts: BlogPost[] = [
  // AIRLINE PRICING EDUCATION ARTICLE
  {
    id: 'airline-pricing-mechanics-2026',
    slug: 'why-flight-prices-change-airline-fares-2026',
    title: 'Why Flight Prices Change So Much — And How Airlines Really Set Fares in 2026',
    excerpt: 'Understanding airline pricing mechanics can help you make smarter travel decisions. Learn how airlines set fares, why prices fluctuate, and the real factors behind airfare changes.',
    content: `# Why Flight Prices Change So Much — And How Airlines Really Set Fares in 2026

You've been there. You find a flight that looks perfect, take a moment to double-check your dates, and when you return—the price has jumped. Or you check a route multiple times over several weeks, watching fares bounce up and down with what seems like no rhyme or reason.

It's frustrating, but it's not random. Behind every price change is a sophisticated pricing system that airlines have refined over decades. These shifts happen for specific, logical reasons based on data, competition, and market dynamics.

Understanding how airline pricing actually works won't just satisfy your curiosity—it will help you approach flight search with more confidence and recognize when a price is worth acting on.

## Flights Are Not Priced Like Products

When you buy a pair of shoes or a television, the price is relatively stable. The store doesn't change the price on a daily basis based on how many people are looking at the item or when you decide to buy. But airline seats are fundamentally different—they're perishable inventory.

Every seat on every flight has an expiration date. Once the plane takes off, any unsold seat loses its value completely. An airline cannot sell today's empty seat tomorrow. This time sensitivity is the core of why flight pricing operates so differently from retail or hotel pricing.

Hotels have some similar constraints, but they can often sell a room's availability for the next night if tonight goes unsold. Airlines don't have that flexibility. This is why airlines invest heavily in systems designed to maximize revenue from every seat before it expires.

## The Role of Demand Forecasting

Airlines don't just react to current demand—they predict it months in advance. Across major US and international carriers, revenue management teams use sophisticated algorithms to forecast how many seats will sell on each flight at different price points.

These forecasts consider seasonal patterns, holidays, major events, and business travel cycles. For example, routes to Florida see predictable demand spikes during winter months from Northern travelers escaping cold weather. Business routes between major financial centers often have higher weekday pricing when corporate travelers are booking.

Based on observed airline pricing behavior, carriers categorize routes by demand patterns. High-demand routes with limited competition typically maintain higher base prices. Routes with multiple airlines competing often see more aggressive pricing strategies as carriers vie for market share.

The forecasting isn't just about the route overall—it's specific to each individual flight. A Tuesday afternoon flight might have very different demand characteristics than a Friday evening departure on the same route, even with the same aircraft.

## Why Two People See Different Prices

One of the most persistent myths in travel is that airlines track your browsing history and show higher prices based on how often you've checked a specific route. This isn't how airline pricing works across major carriers.

When two people search the same route at the same moment and see different prices, it's almost always due to fare buckets and inventory availability—not cookies or browsing history.

Airlines sell seats in fare classes or buckets, not at a single price. A flight might have economy seats available at multiple price points: a basic economy fare, a standard economy fare, and a flexible economy fare. As lower-priced fare buckets sell out, the system shows higher-priced buckets.

This happens dynamically. If one person searches and sees 10 seats available at the lowest fare, and another person searches moments later when 7 of those have been purchased, they'll see a higher price. The same applies to seat selection, baggage allowances, and other variables that affect the fare.

Incognito mode doesn't prevent these price differences because the issue isn't tracking—it's real-time inventory changing as other travelers make bookings.

## Competition Matters More Than Distance

It seems counterintuitive, but a longer flight can be cheaper than a shorter one. Distance is only one factor in airline pricing, and often not the most important one.

The level of competition on a route frequently drives pricing more than distance. A route with four or five airlines competing for passengers will typically see lower fares than a route with only one or two carriers, even if the competitive route is longer.

Consider transatlantic flights. Routes between major US hubs and major European cities often have multiple carriers operating them. This competition can make them more affordable than some shorter domestic routes with limited competition.

Airline alliances also play a role. Carriers within the same alliance often coordinate schedules and pricing strategies, which can reduce competitive pressure on certain routes. Conversely, routes served primarily by low-cost carriers tend to have lower base prices than similar routes dominated by full-service airlines.

Capacity is another factor. If airlines add more flights to a route, increased seat supply can push prices down. If they reduce capacity or use smaller aircraft, prices may rise even if demand remains constant.

Based on observed airline pricing behavior, the most expensive routes are typically those with high demand, limited competition, and constrained capacity—not necessarily the longest flights.

## When Prices Drop — And When They Almost Never Do

One of the most common questions about flight pricing is when to book. Across major US and international carriers, there are consistent patterns, but they vary by route type.

For many domestic and short-haul international routes, prices tend to drop in the window 1-3 months before departure. Airlines open with higher fares early, then lower them as they seek to fill seats. However, this pattern isn't universal.

Long-haul international routes often see different behavior. On many transatlantic and long-haul routes, fares are relatively stable for months, then may rise as the departure date approaches rather than dropping. Airlines know business travelers on these routes tend to book closer to departure and are less price-sensitive.

The idea that last-minute deals are common is largely a myth across most routes. Occasionally, airlines may discount unsold seats on low-demand flights, but this is the exception rather than the rule. Relying on last-minute deals is a risky strategy—most flights that aren't selling well enough to merit discounts simply stay full at higher prices.

Some routes have consistent pricing patterns year after year. If you fly a particular route regularly, you may notice that prices tend to stabilize at certain levels. This is particularly true on routes where one or two carriers dominate the market.

## How Smart Travelers Use This Information

Understanding airline pricing mechanics doesn't mean you can predict exactly when prices will change. But it does help you make better decisions about when and how to search for flights.

Timing matters, but flexibility matters more. Being able to shift your travel dates by a few days or weeks often has more impact on price than trying to time the perfect booking window. Tuesdays and Wednesdays are typically cheaper than weekends for departures, and shoulder seasons often offer lower fares than peak travel periods.

Monitoring prices over time can help you recognize when a fare is genuinely good compared to what's typical for that route. If you've been watching a route and see a sudden drop that's significantly below recent averages, that's often worth acting on.

Being flexible with routing helps too. Flying into an alternative airport nearby or taking a connection instead of a direct flight can sometimes mean substantial savings, especially on routes where direct service has limited competition.

## What This Means When You're Ready to Book

The key takeaway from understanding airline pricing is this: when you see a fare that looks reasonable for the route and travel dates you want, it's usually worth serious consideration rather than waiting for something better to appear.

Airline pricing systems are designed to extract the maximum revenue from each seat. They don't generally leave money on the table by underpricing flights. While prices do fluctuate, truly exceptional deals are relatively uncommon.

When you're ready to book, comparing options across different carriers and times helps you understand the market rate for your route. This context makes it easier to recognize when you're seeing a good value rather than just the lowest price.

The airlines have sophisticated systems working on their side. Your advantage comes from understanding those systems and using that knowledge to make informed decisions when you search for flights—rather than trying to outsmart algorithms that process millions of data points daily.

## Frequently Asked Questions

**Why do flight prices change every day?**
Flight prices change daily because airline inventory management systems are constantly adjusting based on booking pace, competitor pricing, and demand forecasts. Every time someone books a seat, the system reassesses remaining inventory and may adjust prices for remaining seats.

**Are airlines using AI to set prices?**
Yes, airlines increasingly use artificial intelligence and machine learning in their revenue management systems. These technologies help carriers process vast amounts of data to predict demand patterns and optimize pricing strategies more precisely than traditional methods.

**Do prices drop at specific times of the week?**
Based on observed airline pricing behavior, some routes do show weekly patterns, but these vary significantly. The common wisdom about Tuesday price drops is inconsistent—some routes follow this pattern while others don't. Day-of-week effects are route-specific rather than universal.

**Is booking early always cheaper?**
Not always. While booking well in advance is often beneficial for popular travel periods and high-demand routes, some routes have relatively stable pricing for months. The optimal booking window depends on the specific route, time of year, and competitive dynamics on that corridor.

**Why are some international flights cheaper than domestic ones?**
International flights can be cheaper than domestic ones for several reasons: more competition on international routes, the presence of low-cost carriers on certain international corridors, different market dynamics, and occasionally government subsidies or tourism incentives. Distance is only one factor among many in airline pricing calculations.`,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90',
      alt: 'Commercial airplane flying above clouds during sunset',
      credit: 'Photo by Jason Blackeye / Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'guide',
    tags: ['airline-pricing', 'flight-prices', 'airfare-tips', 'travel-planning', 'aviation', 'booking-flights'],
    author: {
      id: 'james',
      name: 'James Mitchell',
      avatar: '/authors/james.jpg',
      bio: 'James Mitchell is an aviation pricing analyst with over 15 years of experience studying airline revenue management and pricing strategies across major international carriers.',
      role: 'Senior Aviation Analyst',
    },
    publishedAt: new Date('2026-01-20'),
    readTime: 10,
    views: 0,
    likes: 0,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'Why Flight Prices Change — How Airlines Set Fares in 2026',
    metaDescription: 'Learn how airline pricing works, why flight prices fluctuate, and the real factors behind airfare changes from an aviation pricing analyst.',
    keywords: ['flight prices', 'airline pricing', 'airfare changes', 'booking flights', 'airline revenue management'],
  },
  // FEATURED BLOG POST 1
  {
    id: '1',
    slug: 'ultimate-guide-santorini-2025',
    title: 'The Ultimate Guide to Santorini in 2025: Hidden Gems & Must-See Spots',
    excerpt:
      'Discover the magic of Santorini beyond the crowds. From secret beaches to authentic tavernas, explore the Greek island like a local.',
    content: `# The Ultimate Guide to Santorini in 2025

Santorini, the jewel of the Aegean Sea, continues to captivate travelers with its iconic white-washed buildings, stunning sunsets, and crystal-clear waters. But there's so much more to this volcanic island than meets the eye.

## Hidden Beaches Worth Exploring

While everyone flocks to the famous Red Beach, we've discovered several hidden gems that offer the same beauty without the crowds...

## Authentic Dining Experiences

Forget the touristy restaurants in Fira. Here are our top picks for authentic Greek cuisine...

## Best Time to Visit

The sweet spot for visiting Santorini is...`,
    featuredImage: {
      url: '/blog/santorini-sunset.jpg',
      alt: 'Stunning sunset view over Santorini white buildings and blue domes',
      credit: 'Photo by John Doe',
      width: 1200,
      height: 800,
    },
    category: 'blog',
    tags: ['Greece', 'Santorini', 'Mediterranean', 'Island Travel', 'Destination Guide'],
    author: authors.sarah,
    publishedAt: new Date('2025-09-15'),
    readTime: 12,
    isFeatured: true,
    views: 15420,
    likes: 892,
    metaTitle: 'Ultimate Santorini Travel Guide 2025 | Hidden Gems & Local Tips',
    metaDescription:
      'Plan your perfect Santorini vacation with our comprehensive 2025 guide. Discover hidden beaches, authentic restaurants, and insider tips.',
    keywords: ['Santorini travel guide', 'Greece vacation', 'hidden beaches Santorini'],
  },

  // FEATURED BLOG POST 2
  {
    id: '2',
    slug: 'kyoto-cherry-blossom-season-guide',
    title: 'Kyoto Cherry Blossom Season 2025: When, Where & How to Experience Hanami',
    excerpt:
      'Plan your dream hanami experience in Kyoto. Complete guide to the best viewing spots, timing, and cultural traditions.',
    content: `# Kyoto Cherry Blossom Season 2025

Cherry blossom season in Kyoto is one of the most spectacular natural phenomena in the world. Here's everything you need to know...

## Peak Bloom Forecast

Based on meteorological data, we're predicting peak bloom around...

## Top 10 Viewing Spots

From famous temples to secret gardens, here are the best places to experience hanami...`,
    featuredImage: {
      url: '/blog/kyoto-cherry-blossoms.jpg',
      alt: 'Cherry blossoms in full bloom at Kyoto temple',
      credit: 'Photo by Sakura Studio',
      width: 1200,
      height: 800,
    },
    category: 'blog',
    tags: ['Japan', 'Kyoto', 'Cherry Blossoms', 'Hanami', 'Spring Travel'],
    author: authors.emily,
    publishedAt: new Date('2025-09-20'),
    readTime: 15,
    isFeatured: true,
    views: 12340,
    likes: 756,
    metaTitle: 'Kyoto Cherry Blossom Guide 2025 | Best Hanami Spots & Timing',
    metaDescription:
      'Experience cherry blossom season in Kyoto like a local. Peak bloom forecasts, top viewing spots, and cultural insights.',
    keywords: ['Kyoto cherry blossoms', 'hanami season', 'Japan spring travel'],
  },

  // FLASH DEAL 1
  {
    id: '3',
    slug: 'flash-deal-paris-thanksgiving-70-off',
    title: 'Flash Deal: Paris for Thanksgiving - Up to 70% Off Flights!',
    excerpt:
      'Book now! Round-trip flights to Paris from major US cities starting at $289. Limited time offer expires in 24 hours.',
    content: `# Unbelievable Paris Deal!

We've just secured an incredible flash deal for Thanksgiving travel to Paris. This is the lowest price we've seen all year!

## Deal Details
- Routes: NYC, Boston, Chicago, LA → Paris
- Travel Dates: Nov 20-30, 2025
- Starting Price: $289 round-trip
- Includes: Carry-on bag

## How to Book
Click the link below to secure your spot...`,
    featuredImage: {
      url: '/blog/paris-eiffel-tower.jpg',
      alt: 'Eiffel Tower illuminated at night',
      credit: 'Photo by Paris Tourism',
      width: 1200,
      height: 800,
    },
    category: 'deal',
    tags: ['Flash Deal', 'Paris', 'France', 'Thanksgiving', 'Flight Deals'],
    author: authors.mike,
    publishedAt: new Date('2025-10-08'),
    readTime: 3,
    isFeatured: false,
    views: 8920,
    likes: 543,
    dealMetadata: {
      originalPrice: 989,
      discountedPrice: 289,
      discount: 70,
      validUntil: new Date('2025-10-11T23:59:59'),
      destinations: ['Paris, France'],
      restrictions: ['Non-refundable', 'Limited seats', 'Carry-on only'],
      bookingUrl: '/flights/search?deal=paris-thanksgiving-2025',
    },
  },

  // FLASH DEAL 2
  {
    id: '4',
    slug: 'caribbean-winter-escape-all-inclusive-deal',
    title: 'Caribbean Winter Escape: All-Inclusive Resort + Flights $599',
    excerpt:
      '5-night all-inclusive packages to Cancun, Punta Cana, or Jamaica. Expires in 48 hours!',
    content: `# Caribbean All-Inclusive Deal

Beat the winter blues with this incredible all-inclusive Caribbean package!

## Package Includes
- Round-trip flights
- 5 nights accommodation
- All meals & drinks
- Beach activities

## Available Destinations
Choose from 3 stunning locations...`,
    featuredImage: {
      url: '/blog/caribbean-beach.jpg',
      alt: 'Pristine Caribbean beach with turquoise water',
      credit: 'Photo by Caribbean Tourism',
      width: 1200,
      height: 800,
    },
    category: 'deal',
    tags: ['Flash Deal', 'Caribbean', 'All-Inclusive', 'Beach', 'Winter Travel'],
    author: authors.mike,
    publishedAt: new Date('2025-10-09'),
    readTime: 4,
    isFeatured: false,
    views: 11250,
    likes: 687,
    dealMetadata: {
      originalPrice: 1499,
      discountedPrice: 599,
      discount: 60,
      validUntil: new Date('2025-10-12T23:59:59'),
      destinations: ['Cancun, Mexico', 'Punta Cana, Dominican Republic', 'Montego Bay, Jamaica'],
      restrictions: ['Based on double occupancy', 'Travel dates: Dec 1-20, 2025', 'Subject to availability'],
      bookingUrl: '/packages/search?deal=caribbean-winter-2025',
    },
  },

  // FLASH DEAL 3
  {
    id: '5',
    slug: 'hawaii-flash-sale-west-coast-399',
    title: 'Hawaii Flash Sale: West Coast to Maui or Honolulu from $399',
    excerpt:
      'Aloha deals! Non-stop flights to Hawaii from West Coast cities. Book within 12 hours!',
    content: `# Hawaii Flash Sale!

Your dream Hawaiian vacation is more affordable than ever!

## Deal Highlights
- Non-stop flights from LAX, SFO, SEA, PDX
- Travel through winter and spring
- Both Maui and Honolulu available

## Why Book Now
This is the lowest Hawaii pricing we've seen since 2020...`,
    featuredImage: {
      url: '/blog/hawaii-beach.jpg',
      alt: 'Hawaiian beach with palm trees and clear blue water',
      credit: 'Photo by Hawaii Visitors Bureau',
      width: 1200,
      height: 800,
    },
    category: 'deal',
    tags: ['Flash Deal', 'Hawaii', 'Maui', 'Honolulu', 'Beach', 'West Coast'],
    author: authors.mike,
    publishedAt: new Date('2025-10-10'),
    readTime: 3,
    isFeatured: false,
    views: 9870,
    likes: 612,
    dealMetadata: {
      originalPrice: 899,
      discountedPrice: 399,
      discount: 56,
      validUntil: new Date('2025-10-11T12:00:00'),
      destinations: ['Maui, Hawaii', 'Honolulu, Hawaii'],
      restrictions: ['Non-stop flights only', 'Travel dates: Nov 15 - Mar 15', 'Excludes holidays'],
      bookingUrl: '/flights/search?deal=hawaii-west-coast-2025',
    },
  },

  // TRAVEL GUIDE 1
  {
    id: '6',
    slug: 'backpacking-southeast-asia-complete-guide',
    title: 'Backpacking Southeast Asia: The Complete 2025 Guide',
    excerpt:
      'Plan your epic Southeast Asia adventure. Routes, budgets, safety tips, and must-visit destinations.',
    content: `# Backpacking Southeast Asia

Southeast Asia remains one of the world's top backpacking destinations. Here's how to do it right in 2025...

## Suggested Routes
- The Classic Loop: Thailand → Laos → Vietnam → Cambodia
- The Island Hopper: Indonesia & Philippines
- The Less Traveled: Myanmar → Northern Thailand → Laos

## Budget Breakdown
Daily costs across the region...`,
    featuredImage: {
      url: '/blog/southeast-asia-backpacking.jpg',
      alt: 'Backpacker overlooking rice terraces in Southeast Asia',
      credit: 'Photo by Adventure Collective',
      width: 1200,
      height: 800,
    },
    category: 'guide',
    tags: ['Southeast Asia', 'Backpacking', 'Budget Travel', 'Thailand', 'Vietnam'],
    author: authors.sarah,
    publishedAt: new Date('2025-09-25'),
    readTime: 18,
    isFeatured: false,
    views: 7650,
    likes: 423,
  },

  // TRAVEL GUIDE 2
  {
    id: '7',
    slug: 'first-time-europe-trip-planning-guide',
    title: 'First-Time Europe Trip: Complete Planning Guide & Itinerary',
    excerpt:
      'Planning your first European adventure? This comprehensive guide covers everything from visas to itineraries.',
    content: `# First-Time Europe Trip Planning

Embarking on your first European adventure is exciting! Here's everything you need to know...

## Best Time to Visit
Shoulder season (April-May, September-October) offers...

## Suggested 2-Week Itinerary
- Days 1-3: London
- Days 4-6: Paris
- Days 7-9: Amsterdam
- Days 10-12: Berlin
- Days 13-14: Prague

## Budget & Costs
Expect to spend approximately...`,
    featuredImage: {
      url: '/blog/europe-travel.jpg',
      alt: 'Scenic European street with historic architecture',
      credit: 'Photo by Europe Tourism',
      width: 1200,
      height: 800,
    },
    category: 'guide',
    tags: ['Europe', 'First-Time Travel', 'Itinerary', 'Travel Planning', 'Multi-City'],
    author: authors.emily,
    publishedAt: new Date('2025-09-28'),
    readTime: 20,
    isFeatured: false,
    views: 9320,
    likes: 567,
  },

  // TRAVEL GUIDE 3
  {
    id: '8',
    slug: 'digital-nomad-guide-best-cities-2025',
    title: 'Digital Nomad Guide: Best Cities for Remote Work in 2025',
    excerpt:
      'Top destinations for digital nomads with fast WiFi, affordable living, and vibrant communities.',
    content: `# Best Digital Nomad Cities 2025

Working remotely while traveling? Here are the top cities for digital nomads this year...

## Top 10 Cities
1. Lisbon, Portugal - Affordable, great weather, excellent infrastructure
2. Chiang Mai, Thailand - Budget-friendly, large nomad community
3. Medellín, Colombia - Perfect climate, modern amenities
...

## Cost of Living Comparison
Monthly budget breakdown for each city...`,
    featuredImage: {
      url: '/blog/digital-nomad-cafe.jpg',
      alt: 'Digital nomad working in modern cafe with laptop',
      credit: 'Photo by Remote Work Collective',
      width: 1200,
      height: 800,
    },
    category: 'guide',
    tags: ['Digital Nomad', 'Remote Work', 'Work From Anywhere', 'Lisbon', 'Chiang Mai'],
    author: authors.sarah,
    publishedAt: new Date('2025-10-01'),
    readTime: 14,
    isFeatured: false,
    views: 11240,
    likes: 789,
  },

  // NEWS/ALERT 1
  {
    id: '9',
    slug: 'new-visa-free-travel-thailand-extended-2025',
    title: 'Breaking: Thailand Extends Visa-Free Travel to 90 Days for US Citizens',
    excerpt:
      'Major update for US travelers! Thailand announces extended visa-free stay from 30 to 90 days starting November 2025.',
    content: `# Thailand Visa Policy Update

In a major announcement for international travelers, Thailand has extended its visa-free stay period...

## What Changed
- Previous: 30 days visa-free
- New: 90 days visa-free
- Effective: November 1, 2025

## Who's Eligible
Citizens from 93 countries, including the US, Canada, UK, and EU nations...`,
    featuredImage: {
      url: '/blog/thailand-temple.jpg',
      alt: 'Beautiful Thai temple with golden details',
      credit: 'Photo by Tourism Authority of Thailand',
      width: 1200,
      height: 800,
    },
    category: 'news',
    tags: ['Breaking News', 'Thailand', 'Visa Policy', 'Travel Updates', 'Southeast Asia'],
    author: authors.alex,
    publishedAt: new Date('2025-10-09'),
    readTime: 5,
    isFeatured: false,
    views: 18920,
    likes: 1243,
    newsMetadata: {
      urgency: UrgencyLevel.HIGH,
      source: 'Royal Thai Immigration Bureau',
      relatedDestinations: ['Bangkok', 'Phuket', 'Chiang Mai'],
    },
  },

  // NEWS/ALERT 2
  {
    id: '10',
    slug: 'airlines-drop-fuel-surcharges-flights-cheaper',
    title: 'Airlines Drop Fuel Surcharges: International Flights Could Get 15% Cheaper',
    excerpt:
      'Good news for travelers! Major airlines announce removal of fuel surcharges amid falling oil prices.',
    content: `# Airlines Drop Fuel Surcharges

In a welcome development for travelers worldwide, several major airlines have announced the removal of fuel surcharges...

## Which Airlines
- United Airlines
- Delta Air Lines
- American Airlines
- British Airways
- Lufthansa

## Expected Savings
Travelers can expect to save approximately 10-15% on long-haul international flights...`,
    featuredImage: {
      url: '/blog/airplane-sky.jpg',
      alt: 'Commercial airplane flying in blue sky',
      credit: 'Photo by Aviation Media',
      width: 1200,
      height: 800,
    },
    category: 'news',
    tags: ['Airlines', 'Fuel Surcharges', 'Travel News', 'Flight Prices', 'Good News'],
    author: authors.alex,
    publishedAt: new Date('2025-10-08'),
    readTime: 4,
    isFeatured: false,
    views: 14567,
    likes: 892,
    newsMetadata: {
      urgency: UrgencyLevel.MEDIUM,
      source: 'Industry Announcement',
    },
  },

  // TRAVEL TIP 1
  {
    id: '11',
    slug: '10-airport-hacks-save-time-money',
    title: '10 Airport Hacks to Save Time and Money Every Traveler Should Know',
    excerpt:
      'Navigate airports like a pro with these insider tips. From TSA tricks to lounge access hacks.',
    content: `# 10 Airport Hacks

After years of frequent travel, we've learned some tricks that make airport experiences much smoother...

## Hack #1: Book Early Morning Flights
Fewer delays, shorter security lines, and better odds of upgrades...

## Hack #2: Use Alternative Airports
Save hundreds by checking nearby airports...

## Hack #3: Sign Up for TSA PreCheck
Worth every penny...`,
    featuredImage: {
      url: '/blog/airport-terminal.jpg',
      alt: 'Modern airport terminal interior',
      credit: 'Photo by Airport Guide',
      width: 1200,
      height: 800,
    },
    category: 'tip',
    tags: ['Travel Tips', 'Airport Hacks', 'Money Saving', 'TSA', 'Flight Tips'],
    author: authors.mike,
    publishedAt: new Date('2025-10-05'),
    readTime: 8,
    isFeatured: false,
    views: 6789,
    likes: 445,
  },

  // TRAVEL TIP 2
  {
    id: '12',
    slug: 'packing-light-carry-on-only-guide',
    title: 'The Art of Packing Light: Travel 2 Weeks With Only a Carry-On',
    excerpt:
      'Master the art of minimalist packing. Travel lighter, faster, and stress-free with these expert tips.',
    content: `# Packing Light Masterclass

Traveling with only a carry-on is liberating. No checked bag fees, no waiting at baggage claim, and total mobility...

## The Essential Packing List
- 3 tops (versatile colors)
- 2 bottoms (1 jeans, 1 versatile pants)
- 1 dress/shirt for nice dinners
...

## The Rolling Method
Maximize space by rolling instead of folding...`,
    featuredImage: {
      url: '/blog/carry-on-luggage.jpg',
      alt: 'Organized carry-on luggage with travel essentials',
      credit: 'Photo by Travel Essentials',
      width: 1200,
      height: 800,
    },
    category: 'tip',
    tags: ['Packing Tips', 'Carry-On Only', 'Minimalist Travel', 'Travel Hacks', 'Light Packing'],
    author: authors.sarah,
    publishedAt: new Date('2025-10-03'),
    readTime: 10,
    isFeatured: false,
    views: 5432,
    likes: 378,
  },
];

// Helper function to get posts by category
export function getPostsByCategory(category: string): BlogPost[] {
  return sampleBlogPosts.filter((post) => post.category === category);
}

// Helper function to get featured posts
export function getFeaturedPosts(): BlogPost[] {
  return sampleBlogPosts.filter((post) => post.isFeatured);
}

// Helper function to get active deals (not expired)
export function getActiveDeals(): BlogPost[] {
  const now = new Date();
  return sampleBlogPosts.filter(
    (post) =>
      post.category === 'deal' &&
      post.dealMetadata &&
      new Date(post.dealMetadata.validUntil) > now
  );
}

// Helper function to get latest news
export function getLatestNews(limit: number = 5): BlogPost[] {
  return sampleBlogPosts
    .filter((post) => post.category === 'news')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

// Helper function to get post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  return sampleBlogPosts.find((post) => post.slug === slug);
}

// Helper function to get related posts
export function getRelatedPosts(postId: string, limit: number = 3): BlogPost[] {
  const currentPost = sampleBlogPosts.find((post) => post.id === postId);
  if (!currentPost) return [];

  return sampleBlogPosts
    .filter((post) => {
      if (post.id === postId) return false;
      // Check if posts share tags or category
      const sharedTags = post.tags.some((tag) => currentPost.tags.includes(tag));
      const sameCategory = post.category === currentPost.category;
      return sharedTags || sameCategory;
    })
    .slice(0, limit);
}
