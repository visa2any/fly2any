/**
 * TripMatch Trip Details API
 *
 * GET    /api/tripmatch/trips/[id] - Get trip details with components and members
 * PATCH  /api/tripmatch/trips/[id] - Update trip
 * DELETE /api/tripmatch/trips/[id] - Delete trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import type { TripWithDetails } from '@/lib/tripmatch/types';

/**
 * GET /api/tripmatch/trips/[id]
 *
 * Returns complete trip details including:
 * - Trip information
 * - All components (flights, hotels, cars, tours)
 * - All members with their profiles
 * - Recent posts
 * - Recent messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;

    // Check if database is configured
    if (!sql) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️  Database not configured - using demo data for trip ${tripId}`);
      }

      // Return demo trip detail data
      const demoTripDetails: TripWithDetails = {
        id: tripId,
        title: 'Summer Adventure in Tokyo',
        description: 'Experience the perfect blend of traditional culture and modern innovation in Japan\'s vibrant capital. This 7-day adventure takes you through ancient temples, neon-lit streets, world-class dining, and unforgettable experiences with fellow travelers. From sunrise at Senso-ji Temple to late-night karaoke in Shibuya, every moment is curated for maximum fun and cultural immersion.',
        destination: 'Tokyo',
        destinationCode: 'NRT',
        destinationCountry: 'Japan',
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'adventure',
        visibility: 'public',
        creatorId: 'demo-user-1',
        minMembers: 4,
        maxMembers: 8,
        currentMembers: 5,
        estimatedPricePerPerson: 185000, // $1,850
        totalBookingValue: 925000, // 5 members × $1,850
        status: 'booking_open',
        featured: true,
        trending: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80',
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
        ],
        tags: ['culture', 'food', 'nightlife', 'adventure', 'photography'],
        rules: 'Be respectful of local customs and traditions. Punctuality is essential for group activities. No solo wandering during scheduled group events. Must be 21+ for nightlife activities. Travel insurance required.',
        metadata: {
          difficulty: 'moderate',
          paceLevel: 'active',
          fitnessRequired: 'moderate',
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: undefined,
        creator: {
          id: 'profile-demo-user-1',
          userId: 'demo-user-1',
          displayName: 'Sarah Chen',
          bio: 'Adventure travel enthusiast and Japan culture expert. Led 12+ group trips across Asia.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          coverImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
          travelStyle: ['adventurer', 'cultural'],
          interests: ['photography', 'hiking', 'local cuisine', 'nightlife'],
          languagesSpoken: ['English', 'Mandarin', 'Basic Japanese'],
          locationCity: 'San Francisco',
          locationCountry: 'USA',
          tripsCreated: 15,
          tripsJoined: 28,
          tripsCompleted: 28,
          totalCompanionsMet: 142,
          avgRating: 4.9,
          totalReviews: 47,
          safetyScore: 95,
          verificationLevel: 3,
          emailVerified: true,
          phoneVerified: true,
          idVerified: true,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        components: [
          {
            id: 'comp-flight-1',
            tripId: tripId,
            type: 'flight',
            provider: 'duffel',
            providerId: 'demo-flight-sfo-nrt',
            providerData: {},
            basePricePerPerson: 75000, // $750
            totalPrice: 600000, // 8 members × $750
            currency: 'USD',
            title: 'Round-trip Flight: SFO → Tokyo Narita',
            description: 'Direct flights with ANA. Premium Economy class with extra legroom and meals.',
            startDatetime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            endDatetime: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 660, // 11 hours
            location: 'San Francisco International Airport → Narita International Airport',
            locationLat: undefined,
            locationLng: undefined,
            isOptional: false,
            isRequired: true,
            customizationOptions: {},
            displayOrder: 1,
            imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'comp-hotel-1',
            tripId: tripId,
            type: 'hotel',
            provider: 'duffel_stays',
            providerId: 'demo-hotel-shibuya',
            providerData: {},
            basePricePerPerson: 85000, // $850 for 6 nights
            totalPrice: 680000,
            currency: 'USD',
            title: 'Hotel in Shibuya - 6 Nights',
            description: 'Modern 4-star hotel in the heart of Shibuya. Walking distance to all major attractions, metro, and nightlife. Shared twin rooms with private bathrooms.',
            startDatetime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            endDatetime: new Date(Date.now() + 66 * 24 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 8640, // 6 days
            location: 'Shibuya, Tokyo',
            locationLat: 35.6617,
            locationLng: 139.7040,
            isOptional: false,
            isRequired: true,
            customizationOptions: { roomType: ['twin', 'single'] },
            displayOrder: 2,
            imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'comp-tour-1',
            tripId: tripId,
            type: 'tour',
            provider: 'viator',
            providerId: 'demo-tour-tokyo-highlights',
            providerData: {},
            basePricePerPerson: 12000, // $120
            totalPrice: 96000,
            currency: 'USD',
            title: 'Full-Day Tokyo Highlights Tour',
            description: 'Visit Senso-ji Temple, Imperial Palace, Meiji Shrine, and Harajuku. Includes English-speaking guide and lunch.',
            startDatetime: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString(),
            endDatetime: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 480, // 8 hours
            location: 'Various locations in Tokyo',
            locationLat: 35.6762,
            locationLng: 139.6503,
            isOptional: false,
            isRequired: true,
            customizationOptions: {},
            displayOrder: 3,
            imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'comp-activity-1',
            tripId: tripId,
            type: 'activity',
            provider: 'local',
            providerId: undefined,
            providerData: {},
            basePricePerPerson: 8000, // $80
            totalPrice: 64000,
            currency: 'USD',
            title: 'Shibuya Nightlife Experience',
            description: 'Explore Tokyo\'s legendary nightlife scene. Bar hopping in Golden Gai, karaoke in Shibuya, and late-night ramen.',
            startDatetime: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(),
            endDatetime: new Date(Date.now() + 64 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 360, // 6 hours
            location: 'Shibuya & Shinjuku, Tokyo',
            locationLat: 35.6617,
            locationLng: 139.7040,
            isOptional: true,
            isRequired: false,
            customizationOptions: {},
            displayOrder: 4,
            imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'comp-dining-1',
            tripId: tripId,
            type: 'activity',
            provider: 'local',
            providerId: undefined,
            providerData: {},
            basePricePerPerson: 5000, // $50
            totalPrice: 40000,
            currency: 'USD',
            title: 'Group Farewell Dinner - Authentic Kaiseki',
            description: 'Traditional multi-course Japanese dinner at a renowned kaiseki restaurant. Includes sake pairing.',
            startDatetime: new Date(Date.now() + 66 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(),
            endDatetime: new Date(Date.now() + 66 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 180, // 3 hours
            location: 'Ginza, Tokyo',
            locationLat: 35.6719,
            locationLng: 139.7648,
            isOptional: false,
            isRequired: true,
            customizationOptions: { dietary: ['vegetarian', 'halal', 'none'] },
            displayOrder: 5,
            imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        members: [
          {
            id: 'member-1',
            tripId: tripId,
            userId: 'demo-user-1',
            role: 'creator',
            status: 'confirmed',
            invitedBy: undefined,
            inviteCode: undefined,
            invitationMessage: undefined,
            userName: 'Sarah Chen',
            userEmail: 'sarah.chen@example.com',
            userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            customizations: {},
            totalPrice: 185000,
            creditsApplied: 0,
            amountPaid: 185000,
            paymentStatus: 'paid',
            paymentIntentId: 'pi_demo_sarah',
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            confirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              id: 'profile-1',
              userId: 'demo-user-1',
              displayName: 'Sarah Chen',
              bio: 'Adventure travel enthusiast and Japan culture expert.',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
              coverImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
              travelStyle: ['adventurer', 'cultural'],
              interests: ['photography', 'hiking'],
              languagesSpoken: ['English', 'Mandarin'],
              ageRange: '25-34',
              gender: 'female',
              locationCity: 'San Francisco',
              locationCountry: 'USA',
              emailVerified: true,
              phoneVerified: true,
              idVerified: true,
              safetyScore: 98,
              verificationLevel: 3,
              tripsCreated: 15,
              tripsJoined: 28,
              tripsCompleted: 28,
              totalCompanionsMet: 145,
              avgRating: 4.9,
              totalReviews: 47,
              personalityVector: undefined,
              settings: {},
              createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          {
            id: 'member-2',
            tripId: tripId,
            userId: 'demo-user-2',
            role: 'member',
            status: 'paid',
            invitedBy: 'demo-user-1',
            inviteCode: 'TOKYO2025',
            invitationMessage: undefined,
            userName: 'Marcus Rodriguez',
            userEmail: 'marcus.r@example.com',
            userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
            customizations: {},
            totalPrice: 185000,
            creditsApplied: 5000,
            amountPaid: 180000,
            paymentStatus: 'paid',
            paymentIntentId: 'pi_demo_marcus',
            paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              id: 'profile-2',
              userId: 'demo-user-2',
              displayName: 'Marcus Rodriguez',
              bio: 'Software engineer who loves exploring new cultures.',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
              coverImageUrl: undefined,
              travelStyle: ['cultural'],
              interests: ['food', 'photography', 'nightlife'],
              languagesSpoken: ['English', 'Spanish'],
              ageRange: '25-34',
              gender: 'male',
              locationCity: 'Austin',
              locationCountry: 'USA',
              emailVerified: true,
              phoneVerified: true,
              idVerified: false,
              safetyScore: 85,
              verificationLevel: 2,
              tripsCreated: 2,
              tripsJoined: 8,
              tripsCompleted: 6,
              totalCompanionsMet: 42,
              avgRating: 4.7,
              totalReviews: 12,
              personalityVector: undefined,
              settings: {},
              createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          {
            id: 'member-3',
            tripId: tripId,
            userId: 'demo-user-3',
            role: 'member',
            status: 'confirmed',
            invitedBy: 'demo-user-1',
            inviteCode: 'TOKYO2025',
            invitationMessage: undefined,
            userName: 'Emma Thompson',
            userEmail: 'emma.t@example.com',
            userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            customizations: {},
            totalPrice: 185000,
            creditsApplied: 0,
            amountPaid: 0,
            paymentStatus: 'pending',
            paymentIntentId: undefined,
            paidAt: undefined,
            joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              id: 'profile-3',
              userId: 'demo-user-3',
              displayName: 'Emma Thompson',
              bio: 'Digital nomad and adventure seeker.',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
              coverImageUrl: undefined,
              travelStyle: ['adventurer', 'budget'],
              interests: ['hiking', 'local cuisine'],
              languagesSpoken: ['English'],
              ageRange: '25-34',
              gender: 'female',
              locationCity: 'London',
              locationCountry: 'UK',
              emailVerified: true,
              phoneVerified: false,
              idVerified: false,
              safetyScore: 75,
              verificationLevel: 1,
              tripsCreated: 0,
              tripsJoined: 4,
              tripsCompleted: 3,
              totalCompanionsMet: 18,
              avgRating: 4.8,
              totalReviews: 5,
              personalityVector: undefined,
              settings: {},
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          {
            id: 'member-4',
            tripId: tripId,
            userId: 'demo-user-4',
            role: 'member',
            status: 'paid',
            invitedBy: 'demo-user-2',
            inviteCode: 'TOKYO2025',
            invitationMessage: undefined,
            userName: 'Alex Kim',
            userEmail: 'alex.kim@example.com',
            userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            customizations: {},
            totalPrice: 185000,
            creditsApplied: 0,
            amountPaid: 185000,
            paymentStatus: 'paid',
            paymentIntentId: 'pi_demo_alex',
            paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              id: 'profile-4',
              userId: 'demo-user-4',
              displayName: 'Alex Kim',
              bio: 'Photographer and culture enthusiast.',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
              coverImageUrl: undefined,
              travelStyle: ['cultural'],
              interests: ['photography', 'art', 'architecture'],
              languagesSpoken: ['English', 'Korean'],
              ageRange: '25-34',
              gender: 'non-binary',
              locationCity: 'Seattle',
              locationCountry: 'USA',
              emailVerified: true,
              phoneVerified: true,
              idVerified: true,
              safetyScore: 92,
              verificationLevel: 3,
              tripsCreated: 5,
              tripsJoined: 15,
              tripsCompleted: 14,
              totalCompanionsMet: 67,
              avgRating: 4.9,
              totalReviews: 22,
              personalityVector: undefined,
              settings: {},
              createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          {
            id: 'member-5',
            tripId: tripId,
            userId: 'demo-user-5',
            role: 'member',
            status: 'invited',
            invitedBy: 'demo-user-1',
            inviteCode: 'TOKYO2025',
            invitationMessage: 'Hey! Would love to have you join us in Tokyo!',
            userName: 'Jordan Lee',
            userEmail: 'jordan.lee@example.com',
            userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
            customizations: {},
            totalPrice: undefined,
            creditsApplied: 0,
            amountPaid: 0,
            paymentStatus: 'pending',
            paymentIntentId: undefined,
            paidAt: undefined,
            joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            confirmedAt: undefined,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            profile: undefined,
          },
        ],
        posts: [],
        messages: [],
      };

      return NextResponse.json({
        success: true,
        data: demoTripDetails,
      });
    }

    // Fetch trip
    const tripResult = await sql`
      SELECT * FROM trip_groups
      WHERE id = ${tripId}
    `;

    if (tripResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found',
      }, { status: 404 });
    }

    const trip = tripResult[0];

    // Fetch components
    const components = await sql`
      SELECT * FROM trip_components
      WHERE trip_id = ${tripId}
      ORDER BY display_order ASC, created_at ASC
    `;

    // Fetch members with profiles
    const members = await sql`
      SELECT
        gm.*,
        tmp.*
      FROM group_members gm
      LEFT JOIN tripmatch_user_profiles tmp ON gm.user_id = tmp.user_id
      WHERE gm.trip_group_id = ${tripId}
      ORDER BY
        CASE gm.role
          WHEN 'creator' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        gm.joined_at ASC
    `;

    // Fetch recent posts (last 20)
    const posts = await sql`
      SELECT
        tp.*,
        tmp.display_name as author_name,
        tmp.avatar_url as author_avatar
      FROM trip_posts tp
      LEFT JOIN tripmatch_user_profiles tmp ON tp.user_id = tmp.user_id
      WHERE tp.trip_id = ${tripId}
      ORDER BY tp.created_at DESC
      LIMIT 20
    `;

    // Fetch recent messages (last 50)
    const messages = await sql`
      SELECT
        tm.*,
        tmp.display_name as author_name,
        tmp.avatar_url as author_avatar
      FROM trip_messages tm
      LEFT JOIN tripmatch_user_profiles tmp ON tm.user_id = tmp.user_id
      WHERE tm.trip_id = ${tripId}
      ORDER BY tm.created_at DESC
      LIMIT 50
    `;

    // Fetch creator profile
    const creatorProfile = await sql`
      SELECT * FROM tripmatch_user_profiles
      WHERE user_id = ${trip.creator_id}
    `;

    // Build response
    const tripDetails: TripWithDetails = {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      destinationCode: trip.destination_code,
      destinationCountry: trip.destination_country,
      startDate: trip.start_date,
      endDate: trip.end_date,
      category: trip.category,
      visibility: trip.visibility,
      creatorId: trip.creator_id,
      minMembers: trip.min_members,
      maxMembers: trip.max_members,
      currentMembers: trip.current_members,
      estimatedPricePerPerson: trip.estimated_price_per_person,
      totalBookingValue: parseFloat(trip.total_booking_value || '0'),
      status: trip.status,
      featured: trip.featured,
      trending: trip.trending,
      coverImageUrl: trip.cover_image_url,
      images: trip.images || [],
      tags: trip.tags || [],
      rules: trip.rules,
      metadata: trip.metadata || {},
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
      publishedAt: trip.published_at,
      completedAt: trip.completed_at,
      creator: creatorProfile[0] as any, // Creator should always exist
      components: components.map((c: any) => ({
        id: c.id,
        tripId: c.trip_id,
        type: c.type,
        provider: c.provider,
        providerId: c.provider_id,
        providerData: c.provider_data,
        basePricePerPerson: parseFloat(c.base_price_per_person),
        totalPrice: parseFloat(c.total_price),
        currency: c.currency,
        title: c.title,
        description: c.description,
        startDatetime: c.start_datetime,
        endDatetime: c.end_datetime,
        durationMinutes: c.duration_minutes,
        location: c.location,
        locationLat: c.location_lat,
        locationLng: c.location_lng,
        isOptional: c.is_optional,
        isRequired: c.is_required,
        customizationOptions: c.customization_options,
        displayOrder: c.display_order,
        imageUrl: c.image_url,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
      members: members.map((m: any) => {
        // Extract profile data - the column naming conflicts require careful mapping
        const profile = m.id && m.user_id ? {
          id: m.id,
          userId: m.user_id,
          displayName: m.display_name,
          bio: m.bio,
          avatarUrl: m.avatar_url,
          coverImageUrl: m.cover_image_url,
          travelStyle: m.travel_style,
          interests: m.interests,
          languagesSpoken: m.languages_spoken,
          ageRange: m.age_range,
          gender: m.gender,
          locationCity: m.location_city,
          locationCountry: m.location_country,
          emailVerified: m.email_verified || false,
          phoneVerified: m.phone_verified || false,
          idVerified: m.id_verified || false,
          safetyScore: m.safety_score || 0,
          verificationLevel: m.verification_level || 0,
          tripsCreated: m.trips_created || 0,
          tripsJoined: m.trips_joined || 0,
          tripsCompleted: m.trips_completed || 0,
          totalCompanionsMet: m.total_companions_met || 0,
          avgRating: m.avg_rating ? parseFloat(m.avg_rating) : 0,
          totalReviews: m.total_reviews || 0,
          personalityVector: m.personality_vector,
          settings: m.settings,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
        } : undefined;

        return {
          id: m.id,
          tripId: m.trip_id,
          userId: m.user_id,
          role: m.role,
          status: m.status,
          invitedBy: m.invited_by,
          inviteCode: m.invite_code,
          invitationMessage: m.invitation_message,
          userName: m.display_name || m.user_email,
          userEmail: m.user_email,
          userAvatarUrl: m.avatar_url,
          customizations: m.customizations,
          totalPrice: m.total_price ? parseFloat(m.total_price) : undefined,
          creditsApplied: m.credits_applied,
          amountPaid: parseFloat(m.amount_paid || '0'),
          paymentStatus: m.payment_status,
          paymentIntentId: m.payment_intent_id,
          paidAt: m.paid_at,
          joinedAt: m.joined_at,
          confirmedAt: m.confirmed_at,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          profile,
        };
      }),
      posts: posts.map((p: any) => ({
        id: p.id,
        tripId: p.trip_id,
        userId: p.user_id,
        content: p.content,
        mediaUrls: p.media_urls,
        mediaType: p.media_type,
        location: p.location,
        locationLat: p.location_lat,
        locationLng: p.location_lng,
        reactionsCount: p.reactions_count,
        commentsCount: p.comments_count,
        visibility: p.visibility,
        postType: p.post_type,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        authorName: p.author_name,
        authorAvatar: p.author_avatar,
      })),
      messages: messages.map((msg: any) => ({
        id: msg.id,
        tripId: msg.trip_id,
        userId: msg.user_id,
        message: msg.message,
        messageType: msg.message_type,
        attachments: msg.attachments,
        isSystemMessage: msg.is_system_message,
        systemEvent: msg.system_event,
        readBy: msg.read_by,
        createdAt: msg.created_at,
        authorName: msg.author_name,
        authorAvatar: msg.author_avatar,
      })),
    };

    return NextResponse.json({
      success: true,
      data: tripDetails,
    });

  } catch (error: any) {
    // If database connection error, return demo data as fallback
    if (error?.message?.includes('connecting to database') || error?.message?.includes('fetch failed')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Database connection failed - falling back to demo data');
      }

      // Return demo trip (same as above, but for this specific trip ID)
      const demoTripDetails: TripWithDetails = {
        id: params.id,
        title: 'Summer Adventure in Tokyo',
        description: 'Experience the perfect blend of traditional culture and modern innovation in Japan\'s vibrant capital.',
        destination: 'Tokyo',
        destinationCode: 'NRT',
        destinationCountry: 'Japan',
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'adventure',
        visibility: 'public',
        creatorId: 'demo-user-1',
        minMembers: 4,
        maxMembers: 8,
        currentMembers: 5,
        estimatedPricePerPerson: 185000,
        totalBookingValue: 925000,
        status: 'booking_open',
        featured: true,
        trending: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
        images: [],
        tags: ['culture', 'food', 'nightlife'],
        rules: 'Be respectful and punctual.',
        metadata: {},
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: undefined,
        creator: {
          id: 'profile-demo-user-1',
          userId: 'demo-user-1',
          displayName: 'Sarah Chen',
          bio: 'Adventure travel enthusiast',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          coverImageUrl: undefined,
          travelStyle: ['adventurer'],
          interests: ['photography'],
          languagesSpoken: ['English'],
          locationCity: 'San Francisco',
          locationCountry: 'USA',
          tripsCreated: 15,
          tripsJoined: 28,
          tripsCompleted: 28,
          totalCompanionsMet: 142,
          avgRating: 4.9,
          totalReviews: 47,
          safetyScore: 95,
          verificationLevel: 3,
          emailVerified: true,
          phoneVerified: true,
          idVerified: true,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        components: [],
        members: [],
        posts: [],
        messages: [],
      };

      return NextResponse.json({
        success: true,
        data: demoTripDetails,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error fetching trip details:', error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trip details',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/tripmatch/trips/[id]
 *
 * Update trip details (creator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const tripId = params.id;
    const body = await request.json();

    // TODO: Get user ID from auth and verify they're the creator
    const userId = 'demo-user-001';

    // Verify user is creator
    const trip = await sql`
      SELECT creator_id FROM trip_groups WHERE id = ${tripId}
    `;

    if (trip.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found',
      }, { status: 404 });
    }

    if (trip[0].creator_id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Only the trip creator can update the trip',
      }, { status: 403 });
    }

    // Build update query dynamically
    const updates: string[] = [];

    if (body.title !== undefined) updates.push(`title = '${String(body.title).replace(/'/g, "''")}'`);
    if (body.description !== undefined) updates.push(`description = '${String(body.description || '').replace(/'/g, "''")}'`);
    if (body.destination !== undefined) updates.push(`destination = '${String(body.destination).replace(/'/g, "''")}'`);
    if (body.destinationCode !== undefined) updates.push(`destination_code = '${String(body.destinationCode || '').replace(/'/g, "''")}'`);
    if (body.destinationCountry !== undefined) updates.push(`destination_country = '${String(body.destinationCountry || '').replace(/'/g, "''")}'`);
    if (body.startDate !== undefined) updates.push(`start_date = '${body.startDate}'`);
    if (body.endDate !== undefined) updates.push(`end_date = '${body.endDate}'`);
    if (body.category !== undefined) updates.push(`category = '${body.category}'`);
    if (body.visibility !== undefined) updates.push(`visibility = '${body.visibility}'`);
    if (body.minMembers !== undefined) updates.push(`min_members = ${body.minMembers}`);
    if (body.maxMembers !== undefined) updates.push(`max_members = ${body.maxMembers}`);
    if (body.coverImageUrl !== undefined) updates.push(`cover_image_url = '${String(body.coverImageUrl || '').replace(/'/g, "''")}'`);
    if (body.tags !== undefined) updates.push(`tags = ARRAY[${body.tags.map((t: string) => `'${t.replace(/'/g, "''")}'`).join(',')}]`);
    if (body.rules !== undefined) updates.push(`rules = '${String(body.rules || '').replace(/'/g, "''")}'`);
    if (body.metadata !== undefined) updates.push(`metadata = '${JSON.stringify(body.metadata).replace(/'/g, "''")}'::jsonb`);
    if (body.status !== undefined) updates.push(`status = '${body.status}'`);

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update',
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const result = await sql.unsafe(
      `UPDATE trip_groups
       SET ${updates.join(', ')}
       WHERE id = '${tripId}'
       RETURNING *`
    ) as any;

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Trip updated successfully',
    });

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error updating trip:', error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update trip',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * DELETE /api/tripmatch/trips/[id]
 *
 * Delete trip (creator only, only if no bookings)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const tripId = params.id;

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Verify user is creator
    const trip = await sql`
      SELECT creator_id, status FROM trip_groups WHERE id = ${tripId}
    `;

    if (trip.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found',
      }, { status: 404 });
    }

    if (trip[0].creator_id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Only the trip creator can delete the trip',
      }, { status: 403 });
    }

    // Check for existing bookings
    const bookings = await sql`
      SELECT COUNT(*) as count FROM group_bookings
      WHERE trip_id = ${tripId}
    `;

    if (parseInt(bookings[0].count) > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete trip with existing bookings',
      }, { status: 400 });
    }

    // Delete trip (cascading deletes will handle related records)
    await sql`
      DELETE FROM trip_groups WHERE id = ${tripId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully',
    });

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error deleting trip:', error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to delete trip',
      message: error.message,
    }, { status: 500 });
  }
}
