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
  james: {
    id: '5',
    name: 'James Mitchell',
    avatar: '/authors/james.jpg',
    bio: 'James Mitchell is an aviation pricing analyst with over 15 years of experience studying airline revenue management and pricing strategies across major international carriers.',
    role: 'Senior Aviation Analyst',
    social: {
      twitter: '@jamesaviation',
    },
  },
  'industry-analyst': {
    id: 'industry-analyst',
    name: 'Travel Industry Analyst',
    avatar: '/authors/industry-analyst.jpg',
    bio: 'B2B travel technology specialist with expertise in travel distribution systems and agent business models.',
    role: 'B2B Travel Technology Specialist',
  },
};

// Sample blog posts
export const sampleBlogPosts: BlogPost[] = [
  // NEW: TOP 5 CITIES 2025
  {
    id: 'top-5-most-visited-cities-2025',
    slug: 'top-5-most-visited-cities-2025',
    title: 'Top 5 Most Visited Cities in the World in 2025 (Ranked by Tourism Growth, Experience & Global Influence)',
    excerpt: 'The definitive ranking of the world’s most visited cities in 2025. We analyze tourism numbers, infrastructure, safety, luxury presence, and cultural impact to help you plan smarter.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&q=90',
      alt: 'Skyline collage of the most visited cities in the world in 2025 including Bangkok, Paris, Dubai, Tokyo and New York.',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['Top Cities 2025', 'Tourism Rankings', 'Luxury Travel', 'World Travel', 'City Guides', 'Travel Trends 2025', 'Most Visited Cities'],
    author: {
      id: 'sarah',
      name: 'Sarah Jenkins',
      avatar: '/consultants/sarah-flight.png',
      bio: 'Sarah has logged over 2 million miles across 80 countries, analyzing airline performance and cabin innovation for over a decade.',
      role: 'Senior Global Travel Analyst & Aviation Strategy Expert',
    },
    publishedAt: new Date('2025-12-15'),
    readTime: 18,
    views: 42500,
    likes: 1240,
    isPremium: true,
    isFeatured: false
  },
  // NEW: BEST AIRLINES 2025
  {
    id: 'best-airlines-in-the-world-2025',
    slug: 'best-airlines-in-the-world-2025',
    title: 'Top 5 Best Airlines in the World in 2025 (Ranked by Service, Comfort, Innovation & Reliability)',
    excerpt: 'The definitive ranking of the world\'s best airlines for 2025. We analyze service, comfort, innovation, and reliability to help you fly smarter.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90',
      alt: 'Luxury airline cabin interior with first class suites',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['Best Airlines 2025', 'Airline Rankings', 'Business Class', 'Luxury Travel', 'Aviation News', 'Travel Guide'],
    author: {
      id: 'sarah',
      name: 'Sarah Jenkins',
      avatar: '/authors/sarah.jpg',
      bio: 'Sarah has logged over 2 million miles across 80 countries, analyzing airline performance and cabin innovation for over a decade.',
      role: 'Senior Aviation Analyst & Global Travel Strategist',
    },
    publishedAt: new Date('2025-12-10'),
    readTime: 14,
    views: 38200,
    likes: 950,
    isFeatured: true,
    isPremium: true,
    metaTitle: 'Best Airlines in the World 2025 | Top 5 Ranked',
    metaDescription: 'Discover the Top 5 Best Airlines of 2025. Comprehensive ranking based on service, business class, reliability, and innovation. See who took #1.',
    keywords: ['best airlines 2025', 'top airlines 2025', 'airline rankings', 'best business class', 'safest airlines'],
    faq: [
      {
        question: 'What is the #1 best airline in 2025?',
        answer: 'Singapore Airlines takes the top spot for its unmatched service consistency and new First Class suites.',
      },
      {
        question: 'Which airline has the best economy class?',
        answer: 'Japan Airlines (JAL) leads with the widest seat pitch (34 inches) and superior catering.',
      },
      {
        question: 'Which airline is the most reliable?',
        answer: 'ANA (All Nippon Airways) consistently ranks highest for on-time performance and lowest cancellation rates globally.',
      },
    ],
  },

  // NEW: USA WORLD CUP VISA GUIDE 2026
  {
    id: 'usa-world-cup-visa-guide-2026',
    slug: 'usa-world-cup-visa-guide-2026',
    title: 'USA World Cup Visa Guide 2026: Who Needs a Visa, Processing Times & What Fans Must Know',
    excerpt: 'Planning to attend the FIFA World Cup in the United States? Here’s everything international travelers need to know about visas, ESTA, processing times, and entry requirements.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=90',
      alt: 'US Passport and travel documents on a map',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'guide',
    tags: ['World Cup 2026', 'USA Visa', 'ESTA', 'Travel Guide', 'FIFA World Cup', 'Visa Requirements'],
    author: {
      id: 'michael',
      name: 'Michael Torres',
      avatar: '/authors/michael.jpg',
      bio: 'Michael has been tracking international flight prices for over 8 years and has helped thousands save on transatlantic travel.',
      role: 'Senior Travel & Global Mobility Analyst',
    },
    publishedAt: new Date('2026-02-16'),
    readTime: 14,
    views: 28400,
    likes: 670,
    isFeatured: true,
    isPremium: true,
    metaTitle: 'USA World Cup Visa Guide 2026 | Requirements & Processing Times',
    metaDescription: 'Essential guide for international fans attending World Cup 2026 in USA. Learn about B1/B2 visas, ESTA requirements, and avoid denial.',
    keywords: ['World Cup 2026 Visa', 'USA Visa Requirements', 'ESTA World Cup', 'US Visitor Visa', 'World Cup Travel Guide'],
    faq: [
      {
        question: 'Do I need a visa to attend the 2026 World Cup in the USA?',
        answer: 'Unless you are a U.S. citizen or Green Card holder, yes. You will need either an ESTA (if from a Visa Waiver country) or a B1/B2 Visitor Visa.',
      },
      {
        question: 'Can I travel with just a match ticket?',
        answer: 'No. A match ticket grants entry to the stadium, not the country. Immigration officials will not let you enter without a valid visa or ESTA, regardless of your tickets.',
      },
      {
        question: 'How early should I apply for a U.S. visa for the World Cup?',
        answer: 'Immediately. If you need a B1/B2 visa, apply 12–18 months in advance if possible due to backlog risks. If eligible for ESTA, apply at least 1 month in advance.',
      },
      {
        question: 'What happens if my visa is denied?',
        answer: 'You generally cannot appeal a denial immediately. You would need to reapply with new evidence, which takes time and money. This is why applying early is critical.',
      },
      {
        question: 'Can I extend my stay during the tournament?',
        answer: 'B1/B2 visas typically allow stays up to 6 months, determined at entry. ESTA allows up to 90 days. Extensions for ESTA are generally not possible. Extensions for B1/B2 are difficult and take months to process.',
      },
      {
        question: 'Is ESTA enough to attend the World Cup?',
        answer: 'Yes, provided you are a citizen of a qualifying country, have a valid e-passport, and haven\'t violated previous immigration rules or visited restricted countries.',
      },
    ],
  },

  // PREMIUM SEO ARTICLE - NYC TO PARIS
  {
    id: 'nyc-paris-2026',
    slug: 'cheap-flights-new-york-paris-2026',
    title: 'Cheap Flights from New York to Paris: 2026 Price Guide & Best Deals',
    excerpt: 'Find the best deals on flights from New York to Paris with our comprehensive 2026 price guide. Compare airlines, discover the cheapest months to fly, and save up to 40% on your transatlantic journey.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=90',
      alt: 'Paris Eiffel Tower at sunset',
      credit: 'Photo by Anthony Delanoix / Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'guide',
    tags: ['new-york', 'paris', 'cheap-flights', 'flight-deals', 'europe', 'transatlantic'],
    author: {
      id: 'michael',
      name: 'Michael Torres',
      avatar: '/authors/michael.jpg',
      bio: 'Michael has been tracking international flight prices for over 8 years and has helped thousands save on transatlantic travel.',
      role: 'Travel Deals Expert',
    },
    publishedAt: new Date('2026-01-17'),
    readTime: 12,
    views: 15420,
    likes: 892,
    isFeatured: true,
    isPremium: true,
  },

  // AIRLINE PRICING EDUCATION ARTICLE
  {
    id: 'airline-pricing-mechanics-2026',
    slug: 'why-flight-prices-change-airline-fares-2026',
    title: 'Why Flight Prices Change So Much — And How Airlines Really Set Fares in 2026',
    excerpt: 'Understanding airline pricing mechanics can help you make smarter travel decisions. Learn how airlines set fares, why prices fluctuate, and the real factors behind airfare changes.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90',
      alt: 'Commercial airplane flying above clouds during sunset',
      credit: 'Photo by Jason Blackeye / Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
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
    views: 12500,
    likes: 420,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'Why Flight Prices Change — How Airlines Set Fares in 2026',
    metaDescription: 'Learn how airline pricing works, why flight prices fluctuate, and the real factors behind airfare changes from an aviation pricing analyst.',
    keywords: ['flight prices', 'airline pricing', 'airfare changes', 'booking flights', 'airline revenue management'],
  },

  // INTERNATIONAL TRAVEL GUIDE - FIRST-TIME MISTAKES
  {
    id: 'mistakes-first-time-international-travelers',
    slug: '10-mistakes-first-time-international-travelers-make',
    title: '10 Mistakes First-Time International Travelers Always Make (And How to Avoid Them)',
    excerpt:
      'These common mistakes ruin trips, waste money, and cause stress — even before boarding the plane. Learn how to avoid them and travel smarter.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90',
      alt: 'Airplane window view above clouds during international flight',
      credit: 'Photo by Jason Blackeye / Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'tip',
    tags: ['International Travel', 'First-Time Travel', 'Travel Tips', 'Flight Planning', 'Travel Mistakes', 'Travel Planning'],
    author: authors.james,
    publishedAt: new Date('2025-01-22'),
    readTime: 10,
    views: 8900,
    likes: 310,
    isFeatured: true,
    metaTitle: '10 Mistakes First-Time International Travelers Always Make (And How to Avoid Them)',
    metaDescription: 'These common mistakes ruin trips, waste money, and cause stress — even before boarding the plane. Learn how to avoid them and travel smarter.',
    keywords: ['international travel mistakes', 'first-time international travel', 'travel tips', 'flight booking mistakes', 'airport tips', 'visa requirements'],
  },

  // NYC AIRPORT PRICING GUIDE
  {
    id: 'nyc-airport-pricing-2026',
    slug: 'jfk-vs-newark-vs-laguardia-airport-pricing-2026',
    title: 'JFK vs Newark vs LaGuardia: Which NYC Airport Really Saves You Money on International Flights?',
    excerpt: 'Choosing the wrong NYC airport can cost you hundreds. Learn how JFK, Newark, and LaGuardia pricing really works for international flights.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1920&q=90',
      alt: 'Aerial view of New York City with multiple airports',
      credit: 'Photo by Andrew Ruiz / Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['nyc-airports', 'jfk', 'newark', 'laguardia', 'international-flights', 'flight-pricing', 'travel-tips'],
    author: {
      id: 'james',
      name: 'James Mitchell',
      avatar: '/authors/james.jpg',
      bio: 'James Mitchell is an aviation pricing analyst with over 15 years of experience studying airline revenue management and pricing strategies across major international carriers.',
      role: 'Senior Aviation Analyst',
    },
    publishedAt: new Date('2026-01-21'),
    readTime: 12,
    views: 15600,
    likes: 480,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'JFK vs Newark vs LaGuardia: NYC Airport Pricing for International Flights 2026',
    metaDescription: 'Compare JFK, Newark, and LaGuardia international flight prices. Learn which NYC airport saves you the most money on flights to Europe, Asia, and beyond.',
    keywords: ['NYC airports', 'JFK vs Newark', 'LaGuardia international flights', 'NYC airport pricing', 'international flight deals'],
  },

  // B2B WHOLESALE TRAVEL PLATFORM ANALYSIS
  {
    id: 'b2b-wholesale-platform-analysis-2025',
    slug: 'what-is-b2b-wholesale-travel-platform',
    title: 'What Is a B2B Wholesale Travel Platform for Independent Agents?',
    excerpt: 'A comprehensive analysis of B2B wholesale travel platforms, how they work, and why independent agents are moving toward technology-enabled wholesale models instead of traditional host agencies.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1920&q=90',
      alt: 'Professional travel agent working on laptop with booking platform',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['B2B travel platform', 'wholesale travel', 'independent travel agents', 'travel industry', 'host agencies', 'net rates', 'GDS connectivity'],
    author: {
      id: 'industry-analyst',
      name: 'Travel Industry Analyst',
      avatar: '/authors/industry-analyst.jpg',
      bio: 'B2B travel technology specialist with expertise in travel distribution systems and agent business models.',
      role: 'B2B Travel Technology Specialist',
    },
    publishedAt: new Date('2025-01-23'),
    readTime: 8,
    views: 5400,
    likes: 180,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'What Is a B2B Wholesale Travel Platform for Independent Agents?',
    metaDescription: 'Learn about B2B wholesale travel platforms, net rates, agent-controlled markups, direct airline contracts, and why independent agents are moving away from host agencies.',
    keywords: ['B2B wholesale travel platform', 'net rates', 'independent travel agents', 'GDS connectivity', 'host agencies', 'wholesale vs retail travel distribution'],
  },

  // PERFORMANCE-BASED TRAVEL AFFILIATE PROGRAM ANALYSIS
  {
    id: 'performance-based-affiliate-program-analysis-2026',
    slug: 'what-is-performance-based-travel-affiliate-program',
    title: 'What Is a Performance-Based Travel Affiliate Program?',
    excerpt: 'Understanding performance-based travel affiliate programs operated directly by booking platforms, including first-party tracking, commission structures, and how they differ from OTA networks.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=90',
      alt: 'Content creator creating travel content for affiliate marketing',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['Travel Affiliate Programs', 'Performance Marketing', 'Affiliate Tracking', 'Travel Industry Analysis'],
    author: {
      id: 'industry-analyst',
      name: 'Travel Industry Analyst',
      avatar: '/authors/industry-analyst.jpg',
      bio: 'B2B travel technology specialist with expertise in travel distribution systems and agent business models.',
      role: 'B2B Travel Technology Specialist',
    },
    publishedAt: new Date('2026-01-15'),
    readTime: 5,
    views: 4200,
    likes: 120,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'What Is a Performance-Based Travel Affiliate Program?',
    metaDescription: 'Understanding performance-based travel affiliate programs operated directly by booking platforms, including first-party tracking, commission structures, and how they differ from OTA networks.',
    keywords: ['travel affiliate program', 'performance-based affiliate program', 'first-party tracking', 'affiliate marketing', 'travel booking platform'],
  },

  // TRAVEL AFFILIATE PROGRAMS VS OTA NETWORKS COMPARATIVE ANALYSIS
  {
    id: 'affiliate-programs-vs-ota-networks-analysis-2024',
    slug: 'travel-affiliate-programs-vs-ota-networks',
    title: 'Travel Affiliate Programs vs OTA Affiliate Networks: What Creators and Publishers Should Know',
    excerpt: 'Understanding structural differences between travel affiliate programs, OTA networks, cashback sites, and performance-based models for content creators and publishers.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=90',
      alt: 'Comparative analysis of affiliate marketing models in travel industry',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['Travel Affiliate Programs', 'OTA Networks', 'Affiliate Marketing', 'Performance Marketing', 'Travel Industry Analysis'],
    author: {
      id: 'industry-analyst',
      name: 'Travel Industry Analyst',
      avatar: '/authors/industry-analyst.jpg',
      bio: 'B2B travel technology specialist with expertise in travel distribution systems and agent business models.',
      role: 'B2B Travel Technology Specialist',
    },
    publishedAt: new Date('2024-01-15'),
    readTime: 5,
    views: 6800,
    likes: 240,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'Travel Affiliate Programs vs OTA Affiliate Networks: What Creators and Publishers Should Know',
    metaDescription: 'Understanding structural differences between travel affiliate programs, OTA networks, cashback sites, and performance-based models for content creators and publishers.',
    keywords: ['travel affiliate program', 'OTA affiliate networks', 'performance-based affiliate program', 'first-party tracking', 'affiliate marketing'],
  },

  // AFFILIATE MONETIZATION ECONOMICS ANALYSIS
  {
    id: 'affiliate-monetization-economics-analysis-2024',
    slug: 'how-affiliate-monetization-works-travel-industry',
    title: 'How Affiliate Monetization Really Works in the Travel Industry',
    excerpt: 'Understanding the economics behind travel affiliate programs, why OTA networks dominate, and how performance-based models with first-party tracking are changing creator economics.',
    content: 'Premium article - see dedicated article file',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=90',
      alt: 'Economic analysis of travel affiliate monetization models',
      credit: 'Photo by Unsplash',
      width: 1920,
      height: 1080,
    },
    category: 'analysis',
    tags: ['Travel Affiliate Programs', 'Affiliate Economics', 'Performance Marketing', 'Creator Monetization', 'Travel Industry Analysis'],
    author: {
      id: 'industry-analyst',
      name: 'Travel Industry Analyst',
      avatar: '/authors/industry-analyst.jpg',
      bio: 'B2B travel technology specialist with expertise in travel distribution systems and agent business models.',
      role: 'B2B Travel Technology Specialist',
    },
    publishedAt: new Date('2024-01-15'),
    readTime: 4,
    views: 7900,
    likes: 310,
    isFeatured: true,
    isPremium: false,
    metaTitle: 'How Affiliate Monetization Really Works in the Travel Industry',
    metaDescription: 'Understanding how affiliate monetization works in travel industry, including economics, tracking, and why creators are shifting to performance-based models.',
    keywords: ['affiliate monetization', 'travel affiliate program', 'OTA affiliate networks', 'performance-based affiliate program', 'first-party tracking'],
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
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
      alt: 'Stunning sunset view over Santorini white buildings and blue domes',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
      alt: 'Cherry blossoms in full bloom at Kyoto temple',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
      alt: 'Eiffel Tower illuminated at night',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      alt: 'Pristine Caribbean beach with turquoise water',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      alt: 'Hawaiian beach with palm trees and clear blue water',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
      alt: 'Backpacker overlooking rice terraces in Southeast Asia',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
      alt: 'Scenic European street with historic architecture',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80',
      alt: 'Digital nomad working in modern cafe with laptop',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80',
      alt: 'Beautiful Thai temple with golden details',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
      alt: 'Commercial airplane flying in blue sky',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1473862170180-84427c485aca?w=1200&q=80',
      alt: 'Modern airport terminal interior',
      credit: 'Photo by Unsplash',
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
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80',
      alt: 'Organized carry-on luggage with travel essentials',
      credit: 'Photo by Unsplash',
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
