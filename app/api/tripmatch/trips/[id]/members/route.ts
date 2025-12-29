/**
 * TripMatch Trip Members API
 *
 * GET  /api/tripmatch/trips/[id]/members - List all members
 * POST /api/tripmatch/trips/[id]/members - Invite/add member to trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';
import { generateInviteCode, calculateMemberReward } from '@/lib/tripmatch/credits';
import crypto from 'crypto';

/**
 * GET /api/tripmatch/trips/[id]/members
 *
 * List all members of a trip
 *
 * Query parameters:
 * - status: Filter by member status (optional)
 * - role: Filter by member role (optional)
 */
export async function GET(
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
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get('status');
    const roleFilter = searchParams.get('role');

    // Build query with filters using tagged templates
    const members = await sql`
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
      WHERE gm.trip_group_id = ${tripId}
        ${statusFilter ? sql`AND gm.status = ${statusFilter}` : sql``}
        ${roleFilter ? sql`AND gm.role = ${roleFilter}` : sql``}
      ORDER BY
        CASE gm.role
          WHEN 'creator' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        gm.joined_at ASC
    `;

    // Transform to camelCase
    const transformedMembers = members.map((m: any) => ({
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
      profile: {
        displayName: m.display_name,
        avatarUrl: m.avatar_url,
        bio: m.bio,
        travelStyle: m.travel_style,
        tripsCompleted: m.trips_completed,
        avgRating: m.avg_rating ? parseFloat(m.avg_rating) : undefined,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedMembers,
      count: transformedMembers.length,
    });

  } catch (error: any) {
    console.error('❌ Error fetching members:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch members',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/trips/[id]/members
 *
 * Invite or add a member to a trip
 *
 * Request body:
 * {
 *   email: string; // User to invite (will create if doesn't exist)
 *   role?: 'member' | 'admin'; // Default: 'member'
 *   invitationMessage?: string;
 *   autoConfirm?: boolean; // Skip invitation, add directly (creator only)
 * }
 */
export async function POST(
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

    // TODO: Get user ID from auth
    const inviterId = 'demo-user-001';

    // Validate required fields
    if (!body.email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: email',
      }, { status: 400 });
    }

    // Verify trip exists and check permissions
    const tripData = await sql`
      SELECT tg.*, gm.role as inviter_role
      FROM trip_groups tg
      LEFT JOIN group_members gm ON tg.id = gm.trip_group_id AND gm.user_id = ${inviterId}
      WHERE tg.id = ${tripId}
    `;

    if (tripData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found',
      }, { status: 404 });
    }

    const trip = tripData[0];
    const inviterRole = trip.inviter_role;

    // Check if inviter has permission
    if (!inviterRole || !['creator', 'admin'].includes(inviterRole)) {
      return NextResponse.json({
        success: false,
        error: 'Only trip creators and admins can invite members',
      }, { status: 403 });
    }

    // Check if trip is full
    const currentMemberCount = await sql`
      SELECT COUNT(*) as count
      FROM group_members
      WHERE trip_id = ${tripId} AND status IN ('confirmed', 'paid')
    `;

    if (parseInt(currentMemberCount[0].count) >= trip.max_members) {
      return NextResponse.json({
        success: false,
        error: 'Trip is full',
        maxMembers: trip.max_members,
      }, { status: 400 });
    }

    // Find or create user
    let inviteeUserId: string;

    const existingUser = await sql`
      SELECT user_id FROM tripmatch_user_profiles
      WHERE email = ${body.email}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      inviteeUserId = existingUser[0].user_id;
    } else {
      // Create placeholder user profile
      const newUserId = `user-${crypto.randomBytes(8).toString('hex')}`;
      await sql`
        INSERT INTO tripmatch_user_profiles (
          user_id, display_name, email_verified, phone_verified, id_verified
        ) VALUES (
          ${newUserId}, ${body.email.split('@')[0]}, false, false, false
        )
      `;
      inviteeUserId = newUserId;

      // Initialize credit account
      await sql`
        INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
        VALUES (${newUserId}, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING
      `;
    }

    // Check if already a member
    const existingMember = await sql`
      SELECT * FROM group_members
      WHERE trip_id = ${tripId} AND user_id = ${inviteeUserId}
    `;

    if (existingMember.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User is already a member of this trip',
        member: existingMember[0],
      }, { status: 400 });
    }

    // Generate invite code
    const inviteCode = generateInviteCode();

    // Determine initial status
    const autoConfirm = body.autoConfirm && inviterRole === 'creator';
    const initialStatus = autoConfirm ? 'confirmed' : 'invited';

    // Add member
    const memberResult = await sql`
      INSERT INTO group_members (
        trip_id,
        user_id,
        role,
        status,
        invited_by,
        invite_code,
        invitation_message,
        joined_at,
        confirmed_at
      ) VALUES (
        ${tripId},
        ${inviteeUserId},
        ${body.role || 'member'},
        ${initialStatus},
        ${inviterId},
        ${inviteCode},
        ${body.invitationMessage || undefined},
        NOW(),
        ${autoConfirm ? 'NOW()' : undefined}
      )
      RETURNING *
    `;

    const member = memberResult[0];

    // If auto-confirmed, award credits to inviter
    if (autoConfirm) {
      const currentMembers = parseInt(currentMemberCount[0].count) + 1;
      const creditReward = calculateMemberReward(currentMembers);

      if (creditReward > 0) {
        await sql`
          UPDATE user_credits
          SET
            balance = balance + ${creditReward},
            lifetime_earned = lifetime_earned + ${creditReward},
            updated_at = NOW()
          WHERE user_id = ${inviterId}
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
            ${inviterId},
            ${creditReward},
            'reward',
            'member_recruitment',
            ${`Recruited member ${currentMembers} to ${trip.title}`},
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
    await sql`
      INSERT INTO trip_activities (
        trip_id,
        user_id,
        activity_type,
        description,
        metadata
      ) VALUES (
        ${tripId},
        ${inviterId},
        'member_invited',
        ${`Invited ${body.email} to join the trip`},
        ${JSON.stringify({ memberId: member.id, email: body.email, status: initialStatus })}
      )
    `;

    // TODO: Send invitation email with invite code

    return NextResponse.json({
      success: true,
      data: {
        id: member.id,
        tripId: member.trip_id,
        userId: member.user_id,
        role: member.role,
        status: member.status,
        inviteCode: member.invite_code,
        joinedAt: member.joined_at,
      },
      message: autoConfirm
        ? 'Member added successfully! Credits awarded to inviter.'
        : `Invitation sent to ${body.email}. They can join using code: ${inviteCode}`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error inviting member:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to invite member',
      message: error.message,
    }, { status: 500 });
  }
}
