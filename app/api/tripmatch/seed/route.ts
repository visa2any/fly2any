/**
 * TripMatch Seed Data API
 *
 * POST /api/tripmatch/seed - Populate database with sample trips for testing
 *
 * ⚠️  WARNING: This endpoint should be protected in production!
 * Only use for development/demo purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import * as fs from 'fs';
import * as path from 'path';

const SAMPLE_TRIPS = [
  {
    title: '🏝️ Ibiza Summer Party',
    description: 'Epic summer party week in Ibiza! Join us for beach clubs, boat parties, and unforgettable nights. Includes accommodation at a villa with pool, club entries, and boat party tickets.',
    destination: 'Ibiza, Spain',
    destinationCode: 'IBZ',
    destinationCountry: 'Spain',
    startDate: '2025-07-15',
    endDate: '2025-07-22',
    category: 'party',
    visibility: 'public',
    minMembers: 8,
    maxMembers: 12,
    estimatedPricePerPerson: 1899,
    coverImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    tags: ['party', 'beach', 'nightlife', 'summer', 'ibiza'],
    rules: 'Must be 21+. No drama, just good vibes!',
    trending: true,
    featured: false,
  },
  {
    title: '🎉 Miami Spring Break',
    description: 'Ultimate Miami spring break experience! South Beach parties, pool parties at luxury hotels, and VIP club access. Stay at a beachfront hotel in the heart of the action.',
    destination: 'Miami, USA',
    destinationCode: 'MIA',
    destinationCountry: 'United States',
    startDate: '2025-03-10',
    endDate: '2025-03-17',
    category: 'spring_break',
    visibility: 'public',
    minMembers: 6,
    maxMembers: 10,
    estimatedPricePerPerson: 1450,
    coverImageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop',
    tags: ['spring break', 'beach', 'party', 'miami', 'usa'],
    rules: 'College students welcome! Must be 18+.',
    trending: false,
    featured: true,
  },
  {
    title: '💃 Girls Trip to Barcelona',
    description: 'Amazing girls getaway to Barcelona! Explore Gothic Quarter, tapas tours, beach time, spa day, and rooftop bars. Stay in a beautiful Airbnb in Eixample.',
    destination: 'Barcelona, Spain',
    destinationCode: 'BCN',
    destinationCountry: 'Spain',
    startDate: '2025-06-05',
    endDate: '2025-06-12',
    category: 'girls_trip',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 8,
    estimatedPricePerPerson: 1650,
    coverImageUrl: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop',
    tags: ['girls trip', 'culture', 'food', 'barcelona', 'spain'],
    rules: 'Women only. Ages 25-40 preferred.',
    trending: true,
    featured: false,
  },
  {
    title: '🏔️ Swiss Alps Adventure',
    description: 'Breathtaking adventure in the Swiss Alps! Hiking, paragliding, mountain biking, and exploring charming alpine villages. Stay in Interlaken with views of Jungfrau.',
    destination: 'Interlaken, Switzerland',
    destinationCode: 'ZRH',
    destinationCountry: 'Switzerland',
    startDate: '2025-08-20',
    endDate: '2025-08-27',
    category: 'adventure',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 10,
    estimatedPricePerPerson: 2299,
    coverImageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
    tags: ['adventure', 'hiking', 'mountains', 'switzerland', 'nature'],
    rules: 'Moderate fitness level required.',
    trending: false,
    featured: false,
  },
  {
    title: '🎊 Vegas Bachelor Party',
    description: 'Ultimate Vegas bachelor party! Pool parties, nightclubs, shows, and unforgettable experiences. Stay at a top casino resort on the Strip with VIP treatment.',
    destination: 'Las Vegas, USA',
    destinationCode: 'LAS',
    destinationCountry: 'United States',
    startDate: '2025-05-18',
    endDate: '2025-05-21',
    category: 'bachelor',
    visibility: 'public',
    minMembers: 8,
    maxMembers: 12,
    estimatedPricePerPerson: 999,
    coverImageUrl: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&h=600&fit=crop',
    tags: ['bachelor party', 'vegas', 'nightlife', 'casino', 'usa'],
    rules: 'Guys only. What happens in Vegas stays in Vegas!',
    trending: false,
    featured: true,
  },
  {
    title: '🌴 Bali Backpacker Trip',
    description: 'Amazing backpacking adventure through Bali! Ubud rice terraces, beach hopping, temple visits, surfing, and yoga. Budget-friendly hostels and local experiences.',
    destination: 'Bali, Indonesia',
    destinationCode: 'DPS',
    destinationCountry: 'Indonesia',
    startDate: '2025-09-01',
    endDate: '2025-09-14',
    category: 'backpacker',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 12,
    estimatedPricePerPerson: 1299,
    coverImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    tags: ['backpacking', 'budget', 'adventure', 'bali', 'indonesia'],
    rules: 'Open-minded travelers. Budget-conscious group.',
    trending: true,
    featured: false,
  },
  {
    title: '🇬🇷 Greek Islands Sailing',
    description: 'Sail through the stunning Greek islands! Santorini, Mykonos, Paros, and hidden gems. Private yacht charter, swimming in crystal waters, authentic tavernas, and sunset views.',
    destination: 'Greek Islands, Greece',
    destinationCode: 'JTR',
    destinationCountry: 'Greece',
    startDate: '2025-06-20',
    endDate: '2025-06-30',
    category: 'adventure',
    visibility: 'public',
    minMembers: 6,
    maxMembers: 10,
    estimatedPricePerPerson: 2499,
    coverImageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
    tags: ['sailing', 'islands', 'luxury', 'greece', 'beach'],
    rules: 'Sailing experience helpful but not required.',
    trending: true,
    featured: true,
  },
  {
    title: '🗼 Paris Fashion Week',
    description: 'Experience Paris during Fashion Week! Designer boutiques, runway shows, champagne at rooftop bars, Louvre visits, and chic cafes. Stay in a stylish apartment in Le Marais.',
    destination: 'Paris, France',
    destinationCode: 'CDG',
    destinationCountry: 'France',
    startDate: '2025-09-25',
    endDate: '2025-10-02',
    category: 'girls_trip',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 6,
    estimatedPricePerPerson: 3299,
    coverImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
    tags: ['fashion', 'luxury', 'culture', 'paris', 'shopping'],
    rules: 'Fashion lovers only! Ages 25-45.',
    trending: false,
    featured: true,
  },
  {
    title: '🏂 Whistler Ski Trip',
    description: 'Epic week of skiing and snowboarding in Whistler! World-class slopes, cozy lodges, aprés-ski parties, and stunning mountain views. All skill levels welcome.',
    destination: 'Whistler, Canada',
    destinationCode: 'YVR',
    destinationCountry: 'Canada',
    startDate: '2025-02-10',
    endDate: '2025-02-17',
    category: 'adventure',
    visibility: 'public',
    minMembers: 6,
    maxMembers: 12,
    estimatedPricePerPerson: 1999,
    coverImageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop',
    tags: ['skiing', 'snowboarding', 'winter', 'canada', 'adventure'],
    rules: 'All skill levels welcome. Gear rental available.',
    trending: true,
    featured: false,
  },
  {
    title: '🍜 Tokyo Food Tour',
    description: 'Ultimate culinary adventure in Tokyo! Michelin-starred sushi, ramen alley, izakayas, street food in Shibuya, sake tasting, and cooking classes. Foodie paradise!',
    destination: 'Tokyo, Japan',
    destinationCode: 'NRT',
    destinationCountry: 'Japan',
    startDate: '2025-04-15',
    endDate: '2025-04-22',
    category: 'cultural',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 8,
    estimatedPricePerPerson: 2799,
    coverImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    tags: ['food', 'culture', 'japan', 'tokyo', 'culinary'],
    rules: 'Adventurous eaters only!',
    trending: true,
    featured: false,
  },
  {
    title: '🌊 Tulum Beach Retreat',
    description: 'Wellness and beach vibes in Tulum! Yoga at sunrise, cenote swimming, Mayan ruins, beach clubs, healthy eats, and sunset meditation. Stay at an eco-chic beachfront resort.',
    destination: 'Tulum, Mexico',
    destinationCode: 'CUN',
    destinationCountry: 'Mexico',
    startDate: '2025-11-05',
    endDate: '2025-11-12',
    category: 'wellness',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 10,
    estimatedPricePerPerson: 1799,
    coverImageUrl: 'https://images.unsplash.com/photo-1569157475940-0cc4aa5236ad?w=800&h=600&fit=crop',
    tags: ['wellness', 'yoga', 'beach', 'mexico', 'relaxation'],
    rules: 'Wellness-focused trip. Yoga beginners welcome.',
    trending: true,
    featured: false,
  },
  {
    title: '🎭 Morocco Cultural Journey',
    description: 'Magical week exploring Morocco! Marrakech souks, Sahara camel trek, Fes medina, Chefchaouen blue streets, traditional riads, mint tea, and authentic tagines.',
    destination: 'Marrakech, Morocco',
    destinationCode: 'RAK',
    destinationCountry: 'Morocco',
    startDate: '2025-10-10',
    endDate: '2025-10-20',
    category: 'cultural',
    visibility: 'public',
    minMembers: 6,
    maxMembers: 12,
    estimatedPricePerPerson: 1599,
    coverImageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=600&fit=crop',
    tags: ['culture', 'adventure', 'morocco', 'desert', 'food'],
    rules: 'Respectful of local customs. Moderate walking required.',
    trending: false,
    featured: false,
  },
  {
    title: '🏖️ Maldives Luxury Escape',
    description: 'Ultimate luxury in the Maldives! Overwater bungalows, private beach dinners, snorkeling with manta rays, spa treatments, and endless turquoise waters. Pure paradise.',
    destination: 'Maldives',
    destinationCode: 'MLE',
    destinationCountry: 'Maldives',
    startDate: '2025-12-15',
    endDate: '2025-12-22',
    category: 'luxury',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 8,
    estimatedPricePerPerson: 4999,
    coverImageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
    tags: ['luxury', 'beach', 'relaxation', 'maldives', 'honeymoon'],
    rules: 'Luxury experience. Couples or friends groups.',
    trending: false,
    featured: true,
  },
  {
    title: '🎸 Austin Music Festival',
    description: 'Rock out in Austin during SXSW! Live music every night, BBQ joints, food trucks, breweries, 6th Street parties, and discovering new bands. Music lover\'s dream!',
    destination: 'Austin, USA',
    destinationCode: 'AUS',
    destinationCountry: 'United States',
    startDate: '2025-03-14',
    endDate: '2025-03-21',
    category: 'party',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 10,
    estimatedPricePerPerson: 1299,
    coverImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    tags: ['music', 'festival', 'party', 'austin', 'culture'],
    rules: 'Music lovers. Festival passes included.',
    trending: true,
    featured: false,
  },
  {
    title: '🌋 Iceland Northern Lights',
    description: 'Chase the Northern Lights in Iceland! Blue Lagoon, glacier hiking, ice caves, black sand beaches, waterfalls, and hopefully the aurora borealis. Winter wonderland adventure!',
    destination: 'Reykjavik, Iceland',
    destinationCode: 'KEF',
    destinationCountry: 'Iceland',
    startDate: '2025-02-01',
    endDate: '2025-02-08',
    category: 'adventure',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 8,
    estimatedPricePerPerson: 2699,
    coverImageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop',
    tags: ['adventure', 'nature', 'iceland', 'northern lights', 'winter'],
    rules: 'Warm clothing essential. Photography enthusiasts welcome.',
    trending: true,
    featured: false,
  },
  {
    title: '🍕 Italy Food & Wine Tour',
    description: 'Culinary journey through Italy! Tuscany vineyards, Rome\'s trattorias, Florence gelato, Amalfi Coast seafood, cooking classes with nonnas, and wine tasting in Chianti.',
    destination: 'Rome, Italy',
    destinationCode: 'FCO',
    destinationCountry: 'Italy',
    startDate: '2025-05-10',
    endDate: '2025-05-20',
    category: 'cultural',
    visibility: 'public',
    minMembers: 6,
    maxMembers: 10,
    estimatedPricePerPerson: 3199,
    coverImageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
    tags: ['food', 'wine', 'italy', 'culture', 'culinary'],
    rules: 'Foodies welcome. Wine lovers preferred.',
    trending: false,
    featured: true,
  },
  {
    title: '🏜️ Dubai Luxury Weekend',
    description: 'Luxe weekend in Dubai! Burj Khalifa, desert safari with dinner, beach clubs, gold souk, infinity pools, rooftop lounges, and shopping in the world\'s biggest malls.',
    destination: 'Dubai, UAE',
    destinationCode: 'DXB',
    destinationCountry: 'United Arab Emirates',
    startDate: '2025-11-28',
    endDate: '2025-12-02',
    category: 'luxury',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 8,
    estimatedPricePerPerson: 2499,
    coverImageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    tags: ['luxury', 'shopping', 'city', 'dubai', 'desert'],
    rules: 'Luxury experience. Dress code for some venues.',
    trending: false,
    featured: false,
  },
  {
    title: '🏞️ New Zealand Road Trip',
    description: 'Epic 2-week road trip across New Zealand! Milford Sound, Queenstown adventures, Hobbiton, bungee jumping, wine regions, geothermal pools, and breathtaking landscapes.',
    destination: 'Queenstown, New Zealand',
    destinationCode: 'ZQN',
    destinationCountry: 'New Zealand',
    startDate: '2025-03-01',
    endDate: '2025-03-15',
    category: 'adventure',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 8,
    estimatedPricePerPerson: 3499,
    coverImageUrl: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=800&h=600&fit=crop',
    tags: ['adventure', 'road trip', 'nature', 'new zealand', 'outdoors'],
    rules: 'Valid driver\'s license required. Adventure seekers!',
    trending: true,
    featured: false,
  },
  {
    title: '🎪 Rio Carnival',
    description: 'Experience Rio Carnival! Samba parades, street parties, beach vibes at Copacabana, Sugarloaf Mountain, Christ the Redeemer, caipirinhas, and the world\'s biggest party!',
    destination: 'Rio de Janeiro, Brazil',
    destinationCode: 'GIG',
    destinationCountry: 'Brazil',
    startDate: '2025-02-28',
    endDate: '2025-03-07',
    category: 'party',
    visibility: 'public',
    minMembers: 6,
    maxMembers: 12,
    estimatedPricePerPerson: 1999,
    coverImageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop',
    tags: ['carnival', 'party', 'brazil', 'culture', 'festival'],
    rules: 'Energy and dancing required! Ages 21+.',
    trending: true,
    featured: true,
  },
  {
    title: '🏕️ Patagonia Trekking',
    description: 'Challenging trek through Patagonia! Torres del Paine, glaciers, mountain lakes, wildlife spotting, camping under stars, and conquering the W Trek. For serious hikers.',
    destination: 'Patagonia, Chile',
    destinationCode: 'PUQ',
    destinationCountry: 'Chile',
    startDate: '2025-01-15',
    endDate: '2025-01-28',
    category: 'adventure',
    visibility: 'public',
    minMembers: 4,
    maxMembers: 10,
    estimatedPricePerPerson: 2899,
    coverImageUrl: 'https://images.unsplash.com/photo-1552057426-c4d3cc6c1be4?w=800&h=600&fit=crop',
    tags: ['trekking', 'adventure', 'patagonia', 'hiking', 'nature'],
    rules: 'High fitness level required. Experienced hikers preferred.',
    trending: false,
    featured: false,
  },
];

export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    console.log('🌱 Starting TripMatch seed data creation...\n');

    // Step 1: Check if schema exists, if not apply it
    console.log('📋 Step 1: Checking database schema...');

    try {
      await sql`SELECT 1 FROM trip_groups LIMIT 1`;
      console.log('✅ Schema exists\n');
    } catch (error: any) {
      if (error.message?.includes('relation "trip_groups" does not exist')) {
        console.log('⚠️  Schema not found. Creating tables...\n');

        // Create tables inline (without forward references)
        try {
          // 1. User profiles
          await sql`
            CREATE TABLE IF NOT EXISTS tripmatch_user_profiles (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id VARCHAR(255) NOT NULL UNIQUE,
              display_name VARCHAR(255),
              bio TEXT,
              avatar_url TEXT,
              email_verified BOOLEAN DEFAULT false,
              phone_verified BOOLEAN DEFAULT false,
              id_verified BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `;

          // 2. User credits
          await sql`
            CREATE TABLE IF NOT EXISTS user_credits (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id VARCHAR(255) NOT NULL UNIQUE,
              balance INTEGER NOT NULL DEFAULT 0,
              lifetime_earned INTEGER NOT NULL DEFAULT 0,
              lifetime_spent INTEGER NOT NULL DEFAULT 0,
              pending_balance INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `;

          // 3. Trip groups (core table)
          await sql`
            CREATE TABLE IF NOT EXISTS trip_groups (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title VARCHAR(255) NOT NULL,
              description TEXT,
              destination VARCHAR(255) NOT NULL,
              destination_code VARCHAR(10),
              destination_country VARCHAR(100),
              start_date DATE NOT NULL,
              end_date DATE NOT NULL,
              category VARCHAR(50) NOT NULL,
              visibility VARCHAR(20) DEFAULT 'public',
              creator_id VARCHAR(255) NOT NULL,
              min_members INTEGER DEFAULT 4,
              max_members INTEGER NOT NULL,
              current_members INTEGER DEFAULT 1,
              estimated_price_per_person DECIMAL(10,2),
              total_booking_value DECIMAL(12,2) DEFAULT 0,
              status VARCHAR(50) DEFAULT 'draft',
              featured BOOLEAN DEFAULT false,
              trending BOOLEAN DEFAULT false,
              cover_image_url TEXT,
              images JSONB DEFAULT '[]',
              tags TEXT[] DEFAULT '{}',
              rules TEXT,
              metadata JSONB DEFAULT '{}',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              published_at TIMESTAMP WITH TIME ZONE,
              completed_at TIMESTAMP WITH TIME ZONE
            )
          `;

          // 4. Group members
          await sql`
            CREATE TABLE IF NOT EXISTS group_members (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
              user_id VARCHAR(255) NOT NULL,
              role VARCHAR(50) DEFAULT 'member',
              status VARCHAR(50) DEFAULT 'invited',
              invite_code VARCHAR(20),
              joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              confirmed_at TIMESTAMP WITH TIME ZONE,
              UNIQUE(trip_id, user_id)
            )
          `;

          // 5. Credit transactions
          await sql`
            CREATE TABLE IF NOT EXISTS credit_transactions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id VARCHAR(255) NOT NULL,
              amount INTEGER NOT NULL,
              type VARCHAR(50) NOT NULL,
              source VARCHAR(50) NOT NULL,
              trip_id UUID REFERENCES trip_groups(id) ON DELETE SET NULL,
              description TEXT,
              status VARCHAR(20) DEFAULT 'completed',
              metadata JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `;

          // 6. Trip activities
          await sql`
            CREATE TABLE IF NOT EXISTS trip_activities (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
              user_id VARCHAR(255),
              activity_type VARCHAR(50) NOT NULL,
              description TEXT,
              metadata JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `;

          console.log(`✅ Created essential tables\n`);
        } catch (migrationError: any) {
          console.error(`❌ Table creation failed: ${migrationError.message}`);
          console.error('Full error:', migrationError);
          throw new Error(`Failed to create tables: ${migrationError.message}`);
        }
      } else {
        throw error;
      }
    }

    // Step 2: Check if seed data already exists
    console.log('📋 Step 2: Checking existing trips...');

    const existing = await sql`SELECT COUNT(*) as count FROM trip_groups`;
    const existingCount = parseInt(existing[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} trips`);

      // Ask if we should clear
      const clearParam = new URL(request.url).searchParams.get('clear');
      if (clearParam !== 'true') {
        return NextResponse.json({
          success: false,
          error: 'Database already contains trips',
          existing: existingCount,
          hint: 'Add ?clear=true to clear existing data and reseed',
        }, { status: 400 });
      }

      console.log('🗑️  Clearing existing data...');
      await sql`TRUNCATE TABLE trip_groups CASCADE`;
      await sql`TRUNCATE TABLE user_credits RESTART IDENTITY CASCADE`;
      await sql`TRUNCATE TABLE tripmatch_user_profiles RESTART IDENTITY CASCADE`;
      console.log('✅ Cleared\n');
    }

    // Step 3: Create demo users
    console.log('📋 Step 3: Creating demo users...');

    const demoUsers = [
      { id: 'demo-creator-001', name: 'Sarah Martinez', email: 'sarah@example.com' },
      { id: 'demo-creator-002', name: 'Mike Johnson', email: 'mike@example.com' },
      { id: 'demo-creator-003', name: 'Emma Chen', email: 'emma@example.com' },
    ];

    for (const user of demoUsers) {
      await sql`
        INSERT INTO tripmatch_user_profiles (
          user_id, display_name, email_verified, phone_verified, id_verified
        ) VALUES (
          ${user.id}, ${user.name}, true, false, false
        )
        ON CONFLICT (user_id) DO NOTHING
      `;

      await sql`
        INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
        VALUES (${user.id}, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING
      `;
    }

    console.log(`✅ Created ${demoUsers.length} demo users\n`);

    // Step 4: Create sample trips
    console.log('📋 Step 4: Creating sample trips...');

    const createdTrips = [];
    let tripIndex = 0;

    for (const trip of SAMPLE_TRIPS) {
      const creatorId = demoUsers[tripIndex % demoUsers.length].id;

      const result = await sql`
        INSERT INTO trip_groups (
          title, description, destination, destination_code, destination_country,
          start_date, end_date, category, visibility, creator_id,
          min_members, max_members, current_members,
          estimated_price_per_person, total_booking_value,
          status, featured, trending, cover_image_url, tags, rules
        ) VALUES (
          ${trip.title},
          ${trip.description},
          ${trip.destination},
          ${trip.destinationCode},
          ${trip.destinationCountry},
          ${trip.startDate},
          ${trip.endDate},
          ${trip.category},
          ${trip.visibility},
          ${creatorId},
          ${trip.minMembers},
          ${trip.maxMembers},
          ${Math.floor(Math.random() * (trip.maxMembers - trip.minMembers)) + trip.minMembers},
          ${trip.estimatedPricePerPerson},
          0,
          'published',
          ${trip.featured},
          ${trip.trending},
          ${trip.coverImageUrl},
          ${trip.tags},
          ${trip.rules}
        )
        RETURNING *
      `;

      const createdTrip = result[0];
      createdTrips.push(createdTrip);

      // Add creator as first member
      await sql`
        INSERT INTO group_members (
          trip_id, user_id, role, status, joined_at, confirmed_at
        ) VALUES (
          ${createdTrip.id}, ${creatorId}, 'creator', 'confirmed', NOW(), NOW()
        )
      `;

      console.log(`✅ Created: ${trip.title}`);
      tripIndex++;
    }

    console.log(`\n✅ Created ${createdTrips.length} sample trips\n`);

    // Step 5: Summary
    console.log('='.repeat(60));
    console.log('🎉 Seed data created successfully!');
    console.log('='.repeat(60));
    console.log(`   Users:  ${demoUsers.length}`);
    console.log(`   Trips:  ${createdTrips.length}`);
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully!',
      data: {
        users: demoUsers.length,
        trips: createdTrips.length,
        tripIds: createdTrips.map(t => t.id),
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Seed data creation failed:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to create seed data',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
