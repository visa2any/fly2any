/**
 * TripMatch Trip Components API
 *
 * POST /api/tripmatch/trips/[id]/components - Add component to trip
 * GET  /api/tripmatch/trips/[id]/components - List trip components
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import type { ComponentType } from '@/lib/tripmatch/types';

/**
 * POST /api/tripmatch/trips/[id]/components
 *
 * Add a new component (flight, hotel, car, tour) to a trip
 *
 * Request body:
 * {
 *   type: 'flight' | 'accommodation' | 'car' | 'tour' | 'activity';
 *   provider: string;
 *   providerId: string;
 *   providerData: object;
 *   basePricePerPerson: number;
 *   totalPrice: number;
 *   currency: string;
 *   title: string;
 *   description?: string;
 *   startDatetime: string (ISO datetime);
 *   endDatetime?: string (ISO datetime);
 *   durationMinutes?: number;
 *   location?: string;
 *   locationLat?: number;
 *   locationLng?: number;
 *   isOptional?: boolean;
 *   isRequired?: boolean;
 *   customizationOptions?: object;
 *   displayOrder?: number;
 *   imageUrl?: string;
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    const body = await request.json();

    // TODO: Get user ID from auth and verify they're the creator or admin
    const userId = 'demo-user-001';

    // Verify trip exists and user has permission
    const trip = await sql`
      SELECT tg.*, gm.role
      FROM trip_groups tg
      LEFT JOIN group_members gm ON tg.id = gm.trip_id AND gm.user_id = ${userId}
      WHERE tg.id = ${tripId}
    `;

    if (trip.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found',
      }, { status: 404 });
    }

    const memberRole = trip[0].role;
    if (!memberRole || !['creator', 'admin'].includes(memberRole)) {
      return NextResponse.json({
        success: false,
        error: 'Only trip creators and admins can add components',
      }, { status: 403 });
    }

    // Validate required fields
    if (!body.type || !body.provider || !body.basePricePerPerson || !body.totalPrice || !body.title || !body.startDatetime) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        required: ['type', 'provider', 'basePricePerPerson', 'totalPrice', 'title', 'startDatetime'],
      }, { status: 400 });
    }

    // Validate component type
    const validTypes: ComponentType[] = ['flight', 'hotel', 'car', 'tour', 'activity', 'insurance', 'transfer'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid component type',
        validTypes,
      }, { status: 400 });
    }

    // Insert component
    const result = await sql`
      INSERT INTO trip_components (
        trip_id,
        type,
        provider,
        provider_id,
        provider_data,
        base_price_per_person,
        total_price,
        currency,
        title,
        description,
        start_datetime,
        end_datetime,
        duration_minutes,
        location,
        location_lat,
        location_lng,
        is_optional,
        is_required,
        customization_options,
        display_order,
        image_url
      ) VALUES (
        ${tripId},
        ${body.type},
        ${body.provider},
        ${body.providerId || null},
        ${JSON.stringify(body.providerData || {})},
        ${body.basePricePerPerson},
        ${body.totalPrice},
        ${body.currency || 'USD'},
        ${body.title},
        ${body.description || null},
        ${body.startDatetime},
        ${body.endDatetime || null},
        ${body.durationMinutes || null},
        ${body.location || null},
        ${body.locationLat || null},
        ${body.locationLng || null},
        ${body.isOptional !== undefined ? body.isOptional : false},
        ${body.isRequired !== undefined ? body.isRequired : true},
        ${JSON.stringify(body.customizationOptions || {})},
        ${body.displayOrder || 0},
        ${body.imageUrl || null}
      )
      RETURNING *
    `;

    const component = result[0];

    // Update trip pricing (add up all required components)
    await sql`
      UPDATE trip_groups
      SET
        estimated_price_per_person = (
          SELECT COALESCE(SUM(base_price_per_person), 0)
          FROM trip_components
          WHERE trip_id = ${tripId} AND is_required = true
        ),
        total_booking_value = (
          SELECT COALESCE(SUM(total_price), 0)
          FROM trip_components
          WHERE trip_id = ${tripId}
        ),
        updated_at = NOW()
      WHERE id = ${tripId}
    `;

    // Log activity
    await sql`
      INSERT INTO trip_activities (
        trip_id,
        user_id,
        activity_type,
        description,
        metadata
      ) VALUES (
        ${tripId},
        ${userId},
        'component_added',
        ${`Added ${body.type}: ${body.title}`},
        ${JSON.stringify({ componentId: component.id, type: body.type })}
      )
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: component.id,
        tripId: component.trip_id,
        type: component.type,
        provider: component.provider,
        basePricePerPerson: parseFloat(component.base_price_per_person),
        totalPrice: parseFloat(component.total_price),
        currency: component.currency,
        title: component.title,
        description: component.description,
        startDatetime: component.start_datetime,
        endDatetime: component.end_datetime,
        createdAt: component.created_at,
      },
      message: `${body.type.charAt(0).toUpperCase() + body.type.slice(1)} added successfully! Trip pricing updated.`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error adding component:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to add component',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/tripmatch/trips/[id]/components
 *
 * List all components for a trip
 *
 * Query parameters:
 * - type: Filter by component type (optional)
 * - required: Filter by required status (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    const { searchParams } = new URL(request.url);

    const typeFilter = searchParams.get('type');
    const requiredFilter = searchParams.get('required');

    // Build query with filters using tagged templates
    const components = await sql`
      SELECT * FROM trip_components
      WHERE trip_id = ${tripId}
        ${typeFilter ? sql`AND type = ${typeFilter}` : sql``}
        ${requiredFilter !== null ? sql`AND is_required = ${requiredFilter === 'true'}` : sql``}
      ORDER BY display_order ASC, start_datetime ASC
    `;

    // Transform to camelCase
    const transformedComponents = components.map((c: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: transformedComponents,
      count: transformedComponents.length,
    });

  } catch (error: any) {
    console.error('❌ Error fetching components:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch components',
      message: error.message,
    }, { status: 500 });
  }
}
