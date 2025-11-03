/**
 * TripMatch Trips API
 *
 * GET  /api/tripmatch/trips - List all published trips
 * POST /api/tripmatch/trips - Create a new trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import type { TripGroup, TripSummary } from '@/lib/tripmatch/types';

/**
 * GET /api/tripmatch/trips
 *
 * Query parameters:
 * - category: Filter by trip category (optional)
 * - featured: Filter featured trips (optional, boolean)
 * - trending: Filter trending trips (optional, boolean)
 * - limit: Limit number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 TripMatch API: Fetching trips with filters:', { category, featured, trending, limit, offset });

    // First, check if table exists
    let tableExists = false;
    try {
      await sql`SELECT 1 FROM trip_groups LIMIT 1`;
      tableExists = true;
    } catch (checkError: any) {
      if (checkError.message?.includes('relation "trip_groups" does not exist')) {
        console.log('⚠️  TripMatch: Database schema not initialized');
        return NextResponse.json({
          success: false,
          error: 'Database not initialized',
          hint: 'Please run the seed endpoint first: POST /api/tripmatch/seed',
        }, { status: 503 });
      }
    }

    // Build query with filters
    let whereConditions = [`tg.status IN ('published', 'booking_open')`, `tg.visibility = 'public'`];

    if (category) {
      whereConditions.push(`tg.category = '${category}'`);
    }

    if (featured) {
      whereConditions.push(`tg.featured = true`);
    }

    if (trending) {
      whereConditions.push(`tg.trending = true`);
    }

    // Execute query using template literals (not unsafe)
    const result = await sql`
      SELECT
        tg.*,
        COUNT(DISTINCT gm.id) as member_count
      FROM trip_groups tg
      LEFT JOIN group_members gm ON tg.id = gm.trip_id AND gm.status IN ('confirmed', 'paid')
      WHERE tg.status IN ('published', 'booking_open')
        AND tg.visibility = 'public'
        ${category ? sql`AND tg.category = ${category}` : sql``}
        ${featured ? sql`AND tg.featured = true` : sql``}
        ${trending ? sql`AND tg.trending = true` : sql``}
      GROUP BY tg.id
      ORDER BY
        tg.featured DESC,
        tg.trending DESC,
        tg.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Ensure result is an array and safely log
    const rows = Array.isArray(result) ? result : [];
    console.log(`✅ TripMatch: Found ${rows.length} trips (result type: ${typeof result}, isArray: ${Array.isArray(result)})`);

    // Safety check before mapping
    if (!Array.isArray(rows)) {
      console.error('⚠️  Result is not an array:', { resultType: typeof result, result });
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        limit,
        offset,
      });
    }

    // Transform to TripSummary format
    const trips: TripSummary[] = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      destination: row.destination,
      destinationCode: row.destination_code,
      destinationCountry: row.destination_country,
      startDate: row.start_date,
      endDate: row.end_date,
      category: row.category,
      visibility: row.visibility,
      creatorId: row.creator_id,
      minMembers: row.min_members,
      maxMembers: row.max_members,
      currentMembers: row.current_members || 0,
      estimatedPricePerPerson: row.estimated_price_per_person,
      totalBookingValue: parseFloat(row.total_booking_value || '0'),
      status: row.status,
      featured: row.featured,
      trending: row.trending,
      coverImageUrl: row.cover_image_url,
      images: row.images || [],
      tags: row.tags || [],
      rules: row.rules,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
      completedAt: row.completed_at,
    }));

    return NextResponse.json({
      success: true,
      data: trips,
      count: trips.length,
      limit,
      offset,
    });

  } catch (error: any) {
    console.error('❌ Error fetching trips:', error);

    // Check if table doesn't exist
    if (error.message?.includes('relation "trip_groups" does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'TripMatch schema not initialized. Please run database migration first.',
        hint: 'Run: npx tsx scripts/apply-tripmatch-migration.ts',
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trips',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/trips
 *
 * Create a new trip group
 *
 * Request body:
 * {
 *   title: string;
 *   description?: string;
 *   destination: string;
 *   startDate: string (ISO date);
 *   endDate: string (ISO date);
 *   category: TripCategory;
 *   visibility: 'public' | 'private';
 *   maxMembers: number;
 *   minMembers?: number;
 *   coverImageUrl?: string;
 *   tags?: string[];
 *   rules?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Get user ID from auth session (Clerk/NextAuth)
    // For now, using a placeholder - this needs to be replaced with actual auth
    const userId = 'demo-user-001'; // Replace with: const { userId } = await auth();

    // Validate required fields
    if (!body.title || !body.destination || !body.startDate || !body.endDate || !body.category || !body.maxMembers) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'destination', 'startDate', 'endDate', 'category', 'maxMembers'],
      }, { status: 400 });
    }

    // Insert trip
    const result = await sql`
      INSERT INTO trip_groups (
        title,
        description,
        destination,
        destination_code,
        destination_country,
        start_date,
        end_date,
        category,
        visibility,
        creator_id,
        min_members,
        max_members,
        current_members,
        status,
        featured,
        trending,
        cover_image_url,
        tags,
        rules,
        metadata
      ) VALUES (
        ${body.title},
        ${body.description || null},
        ${body.destination},
        ${body.destinationCode || null},
        ${body.destinationCountry || null},
        ${body.startDate},
        ${body.endDate},
        ${body.category},
        ${body.visibility || 'public'},
        ${userId},
        ${body.minMembers || 4},
        ${body.maxMembers},
        1,
        'draft',
        false,
        false,
        ${body.coverImageUrl || null},
        ${JSON.stringify(body.tags || [])},
        ${body.rules || null},
        ${JSON.stringify(body.metadata || {})}
      )
      RETURNING *
    `;

    const trip = result[0];

    // Auto-add creator as first member
    await sql`
      INSERT INTO group_members (
        trip_id,
        user_id,
        role,
        status,
        joined_at,
        confirmed_at
      ) VALUES (
        ${trip.id},
        ${userId},
        'creator',
        'confirmed',
        NOW(),
        NOW()
      )
    `;

    // Initialize creator's credit account if it doesn't exist
    await sql`
      INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
      VALUES (${userId}, 0, 0, 0)
      ON CONFLICT (user_id) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.end_date,
        category: trip.category,
        status: trip.status,
        createdAt: trip.created_at,
      },
      message: 'Trip created successfully! Add components (flights, hotels) to complete your trip.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating trip:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to create trip',
      message: error.message,
    }, { status: 500 });
  }
}
