/**
 * TripMatch Individual Member API
 *
 * GET    /api/tripmatch/trips/[id]/members/[memberId] - Get member details
 * PATCH  /api/tripmatch/trips/[id]/members/[memberId] - Update member (accept/decline, change role)
 * DELETE /api/tripmatch/trips/[id]/members/[memberId] - Remove member from trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { calculateMemberReward } from '@/lib/tripmatch/credits';

/**
 * GET /api/tripmatch/trips/[id]/members/[memberId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id: tripId, memberId } = params;

    const result = await sql`
      SELECT
        gm.*,
        tmp.display_name,
        tmp.avatar_url,
        tmp.bio,
        tmp.travel_style,
        tmp.trips_completed,
        tmp.avg_rating
      FROM group_members gm
      LEFT JOIN tripmatch_user_profiles tmp ON gm.user_id = tmp.user_id
      WHERE gm.id = ${memberId} AND gm.trip_id = ${tripId}
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
      }, { status: 404 });
    }

    const m = result[0];

    return NextResponse.json({
      success: true,
      data: {
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
        totalPrice: m.total_price ? parseFloat(m.total_price) : null,
        creditsApplied: m.credits_applied,
        amountPaid: parseFloat(m.amount_paid || '0'),
        paymentStatus: m.payment_status,
        paidAt: m.paid_at,
        joinedAt: m.joined_at,
        confirmedAt: m.confirmed_at,
        profile: {
          displayName: m.display_name,
          avatarUrl: m.avatar_url,
          bio: m.bio,
          travelStyle: m.travel_style,
          tripsCompleted: m.trips_completed,
          avgRating: m.avg_rating ? parseFloat(m.avg_rating) : null,
        },
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching member:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch member',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/tripmatch/trips/[id]/members/[memberId]
 *
 * Update member status or role
 *
 * Request body:
 * {
 *   status?: 'confirmed' | 'declined' | 'cancelled'; // Accept/decline invitation
 *   role?: 'member' | 'admin'; // Change role (creator/admin only)
 *   customizations?: object; // Update member-specific customizations
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id: tripId, memberId } = params;
    const body = await request.json();

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Get member and trip info
    const memberData = await sql`
      SELECT gm.*, tg.max_members, tg.title as trip_title, tg.creator_id
      FROM group_members gm
      JOIN trip_groups tg ON gm.trip_id = tg.id
      WHERE gm.id = ${memberId} AND gm.trip_id = ${tripId}
    `;

    if (memberData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
      }, { status: 404 });
    }

    const member = memberData[0];
    const isOwnMembership = member.user_id === userId;
    const isCreator = member.creator_id === userId;

    // Get requester's role
    const requesterRole = await sql`
      SELECT role FROM group_members
      WHERE trip_id = ${tripId} AND user_id = ${userId}
    `;

    const canManageMembers = requesterRole.length > 0 && ['creator', 'admin'].includes(requesterRole[0].role);

    // Validate permissions
    if (body.role && !canManageMembers) {
      return NextResponse.json({
        success: false,
        error: 'Only trip creators and admins can change member roles',
      }, { status: 403 });
    }

    if (body.status && !isOwnMembership && !canManageMembers) {
      return NextResponse.json({
        success: false,
        error: 'You can only update your own membership status',
      }, { status: 403 });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.status) {
      updates.push(`status = $${paramIndex}`);
      values.push(body.status);
      paramIndex++;

      // If confirming, set confirmed_at
      if (body.status === 'confirmed' && !member.confirmed_at) {
        updates.push(`confirmed_at = NOW()`);
      }
    }

    if (body.role && ['member', 'admin'].includes(body.role)) {
      // Can't change creator role
      if (member.role === 'creator') {
        return NextResponse.json({
          success: false,
          error: 'Cannot change creator role',
        }, { status: 400 });
      }

      updates.push(`role = $${paramIndex}`);
      values.push(body.role);
      paramIndex++;
    }

    if (body.customizations) {
      updates.push(`customizations = $${paramIndex}`);
      values.push(JSON.stringify(body.customizations));
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update',
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE group_members
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND trip_id = $${paramIndex + 1}
      RETURNING *
    `;
    values.push(memberId, tripId);

    const result = await sql.unsafe(query, values);

    // If member confirmed, award credits to inviter
    if (body.status === 'confirmed' && member.status === 'invited') {
      // Count confirmed members
      const memberCount = await sql`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE trip_id = ${tripId} AND status IN ('confirmed', 'paid')
      `;

      const currentMembers = parseInt(memberCount[0].count);
      const creditReward = calculateMemberReward(currentMembers);

      if (creditReward > 0 && member.invited_by) {
        await sql`
          UPDATE user_credits
          SET
            balance = balance + ${creditReward},
            lifetime_earned = lifetime_earned + ${creditReward},
            updated_at = NOW()
          WHERE user_id = ${member.invited_by}
        `;

        // Log credit transaction
        await sql`
          INSERT INTO credit_transactions (
            user_id,
            amount,
            type,
            source,
            description,
            reference_type,
            reference_id,
            status
          ) VALUES (
            ${member.invited_by},
            ${creditReward},
            'reward',
            'member_recruitment',
            ${`Member ${currentMembers} joined ${member.trip_title}`},
            'trip',
            ${tripId},
            'completed'
          )
        `;
      }

      // Update trip member count
      await sql`
        UPDATE trip_groups
        SET
          current_members = ${currentMembers},
          updated_at = NOW()
        WHERE id = ${tripId}
      `;
    }

    // Log activity
    const activityDescription = body.status === 'confirmed'
      ? 'Joined the trip'
      : body.status === 'declined'
      ? 'Declined the invitation'
      : body.role
      ? `Role changed to ${body.role}`
      : 'Updated membership';

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
        'member_updated',
        ${activityDescription},
        ${JSON.stringify({ memberId, updates: body })}
      )
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Member updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error updating member:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update member',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * DELETE /api/tripmatch/trips/[id]/members/[memberId]
 *
 * Remove member from trip (creator/admin or self)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id: tripId, memberId } = params;

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Get member info
    const memberData = await sql`
      SELECT gm.*, tg.creator_id
      FROM group_members gm
      JOIN trip_groups tg ON gm.trip_id = tg.id
      WHERE gm.id = ${memberId} AND gm.trip_id = ${tripId}
    `;

    if (memberData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
      }, { status: 404 });
    }

    const member = memberData[0];
    const isOwnMembership = member.user_id === userId;
    const isCreator = member.creator_id === userId;

    // Can't remove creator
    if (member.role === 'creator') {
      return NextResponse.json({
        success: false,
        error: 'Cannot remove trip creator',
      }, { status: 400 });
    }

    // Verify permissions
    const requesterRole = await sql`
      SELECT role FROM group_members
      WHERE trip_id = ${tripId} AND user_id = ${userId}
    `;

    const canManageMembers = requesterRole.length > 0 && ['creator', 'admin'].includes(requesterRole[0].role);

    if (!isOwnMembership && !canManageMembers) {
      return NextResponse.json({
        success: false,
        error: 'You can only remove yourself or you must be a trip admin',
      }, { status: 403 });
    }

    // Check for existing bookings
    const hasBookings = await sql`
      SELECT COUNT(*) as count
      FROM group_bookings
      WHERE member_id = ${memberId}
    `;

    if (parseInt(hasBookings[0].count) > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot remove member with existing bookings',
        hint: 'Please cancel bookings first',
      }, { status: 400 });
    }

    // Remove member
    await sql`
      DELETE FROM group_members
      WHERE id = ${memberId} AND trip_id = ${tripId}
    `;

    // Update trip member count
    const newCount = await sql`
      SELECT COUNT(*) as count
      FROM group_members
      WHERE trip_id = ${tripId} AND status IN ('confirmed', 'paid')
    `;

    await sql`
      UPDATE trip_groups
      SET
        current_members = ${parseInt(newCount[0].count)},
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
        'member_removed',
        ${isOwnMembership ? 'Left the trip' : 'Removed member from trip'},
        ${JSON.stringify({ memberId, userId: member.user_id })}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });

  } catch (error: any) {
    console.error('❌ Error removing member:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to remove member',
      message: error.message,
    }, { status: 500 });
  }
}
