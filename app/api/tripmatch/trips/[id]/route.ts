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
      WHERE gm.trip_id = ${tripId}
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
    console.error('❌ Error fetching trip details:', error);

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
    console.error('❌ Error updating trip:', error);

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
    console.error('❌ Error deleting trip:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to delete trip',
      message: error.message,
    }, { status: 500 });
  }
}
