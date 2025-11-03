/**
 * TripMatch Individual Component API
 *
 * GET    /api/tripmatch/trips/[id]/components/[componentId] - Get component details
 * PATCH  /api/tripmatch/trips/[id]/components/[componentId] - Update component
 * DELETE /api/tripmatch/trips/[id]/components/[componentId] - Delete component
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';

/**
 * GET /api/tripmatch/trips/[id]/components/[componentId]
 *
 * Get detailed information about a specific component
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; componentId: string } }
) {
  try {
    const { id: tripId, componentId } = params;

    const result = await sql`
      SELECT * FROM trip_components
      WHERE id = ${componentId} AND trip_id = ${tripId}
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Component not found',
      }, { status: 404 });
    }

    const c = result[0];

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching component:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch component',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/tripmatch/trips/[id]/components/[componentId]
 *
 * Update a component (creator/admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; componentId: string } }
) {
  try {
    const { id: tripId, componentId } = params;
    const body = await request.json();

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Verify permissions
    const permission = await sql`
      SELECT gm.role
      FROM group_members gm
      WHERE gm.trip_id = ${tripId} AND gm.user_id = ${userId}
    `;

    if (permission.length === 0 || !['creator', 'admin'].includes(permission[0].role)) {
      return NextResponse.json({
        success: false,
        error: 'Only trip creators and admins can update components',
      }, { status: 403 });
    }

    // Verify component exists
    const existing = await sql`
      SELECT * FROM trip_components
      WHERE id = ${componentId} AND trip_id = ${tripId}
    `;

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Component not found',
      }, { status: 404 });
    }

    // Build update parts conditionally
    // Note: We use JSON.stringify for safe value embedding
    const updates: string[] = [];

    if (body.type !== undefined) updates.push(`type = '${body.type}'`);
    if (body.provider !== undefined) updates.push(`provider = '${body.provider.replace(/'/g, "''")}'`);
    if (body.providerId !== undefined) updates.push(`provider_id = '${String(body.providerId).replace(/'/g, "''")}'`);
    if (body.providerData !== undefined) updates.push(`provider_data = '${JSON.stringify(body.providerData).replace(/'/g, "''")}'::jsonb`);
    if (body.basePricePerPerson !== undefined) updates.push(`base_price_per_person = ${body.basePricePerPerson}`);
    if (body.totalPrice !== undefined) updates.push(`total_price = ${body.totalPrice}`);
    if (body.currency !== undefined) updates.push(`currency = '${body.currency}'`);
    if (body.title !== undefined) updates.push(`title = '${String(body.title).replace(/'/g, "''")}'`);
    if (body.description !== undefined) updates.push(`description = '${String(body.description || '').replace(/'/g, "''")}'`);
    if (body.startDatetime !== undefined) updates.push(`start_datetime = '${body.startDatetime}'`);
    if (body.endDatetime !== undefined) updates.push(`end_datetime = '${body.endDatetime}'`);
    if (body.durationMinutes !== undefined) updates.push(`duration_minutes = ${body.durationMinutes}`);
    if (body.location !== undefined) updates.push(`location = '${String(body.location || '').replace(/'/g, "''")}'`);
    if (body.locationLat !== undefined) updates.push(`location_lat = ${body.locationLat}`);
    if (body.locationLng !== undefined) updates.push(`location_lng = ${body.locationLng}`);
    if (body.isOptional !== undefined) updates.push(`is_optional = ${body.isOptional}`);
    if (body.isRequired !== undefined) updates.push(`is_required = ${body.isRequired}`);
    if (body.customizationOptions !== undefined) updates.push(`customization_options = '${JSON.stringify(body.customizationOptions).replace(/'/g, "''")}'::jsonb`);
    if (body.displayOrder !== undefined) updates.push(`display_order = ${body.displayOrder}`);
    if (body.imageUrl !== undefined) updates.push(`image_url = '${String(body.imageUrl || '').replace(/'/g, "''")}'`);

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update',
      }, { status: 400 });
    }

    updates.push('updated_at = NOW()');

    const result = await sql.unsafe(
      `UPDATE trip_components
       SET ${updates.join(', ')}
       WHERE id = '${componentId}' AND trip_id = '${tripId}'
       RETURNING *`
    ) as any;

    // Update trip pricing if price changed
    if (body.basePricePerPerson !== undefined || body.isRequired !== undefined) {
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
    }

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
        'component_updated',
        ${`Updated component: ${result[0]?.title || 'component'}`},
        ${JSON.stringify({ componentId, updates: Object.keys(body) })}
      )
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Component updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error updating component:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update component',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * DELETE /api/tripmatch/trips/[id]/components/[componentId]
 *
 * Delete a component (creator/admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; componentId: string } }
) {
  try {
    const { id: tripId, componentId } = params;

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Verify permissions
    const permission = await sql`
      SELECT gm.role
      FROM group_members gm
      WHERE gm.trip_id = ${tripId} AND gm.user_id = ${userId}
    `;

    if (permission.length === 0 || !['creator', 'admin'].includes(permission[0].role)) {
      return NextResponse.json({
        success: false,
        error: 'Only trip creators and admins can delete components',
      }, { status: 403 });
    }

    // Get component info before deleting
    const component = await sql`
      SELECT * FROM trip_components
      WHERE id = ${componentId} AND trip_id = ${tripId}
    `;

    if (component.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Component not found',
      }, { status: 404 });
    }

    // Delete component
    await sql`
      DELETE FROM trip_components
      WHERE id = ${componentId} AND trip_id = ${tripId}
    `;

    // Update trip pricing
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
        'component_deleted',
        ${`Deleted ${component[0].type}: ${component[0].title}`},
        ${JSON.stringify({ componentId, type: component[0].type })}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Component deleted successfully. Trip pricing updated.',
    });

  } catch (error: any) {
    console.error('❌ Error deleting component:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to delete component',
      message: error.message,
    }, { status: 500 });
  }
}
