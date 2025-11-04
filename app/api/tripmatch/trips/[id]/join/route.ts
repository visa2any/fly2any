/**
 * TripMatch Trip Join API
 *
 * POST /api/tripmatch/trips/[id]/join - Join trip with invite code
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { calculateMemberReward } from '@/lib/tripmatch/credits';

/**
 * POST /api/tripmatch/trips/[id]/join
 *
 * Join a trip using an invite code
 *
 * Request body:
 * {
 *   inviteCode: string; // Required invite code
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
    const userId = 'demo-user-001';

    // Validate invite code
    if (!body.inviteCode) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: inviteCode',
      }, { status: 400 });
    }

    // Verify trip exists
    const tripData = await sql`
      SELECT * FROM trip_groups
      WHERE id = ${tripId}
    `;

    if (tripData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found',
      }, { status: 404 });
    }

    const trip = tripData[0];

    // Check trip status
    if (!['published', 'booking_open'].includes(trip.status)) {
      return NextResponse.json({
        success: false,
        error: 'This trip is not accepting new members',
        tripStatus: trip.status,
      }, { status: 400 });
    }

    // Find invitation
    const invitation = await sql`
      SELECT * FROM group_members
      WHERE trip_id = ${tripId}
        AND invite_code = ${body.inviteCode}
        AND status = 'invited'
    `;

    if (invitation.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired invite code',
      }, { status: 400 });
    }

    const member = invitation[0];

    // Verify the invitation is for this user
    // In a real app, we'd check if user.email matches the invited email
    // For now, we'll update the user_id to the authenticated user

    // Check if trip is full
    const memberCount = await sql`
      SELECT COUNT(*) as count
      FROM group_members
      WHERE trip_id = ${tripId} AND status IN ('confirmed', 'paid')
    `;

    if (parseInt(memberCount[0].count) >= trip.max_members) {
      return NextResponse.json({
        success: false,
        error: 'Trip is full',
        maxMembers: trip.max_members,
      }, { status: 400 });
    }

    // Confirm membership
    const updateResult = await sql`
      UPDATE group_members
      SET
        user_id = ${userId},
        status = 'confirmed',
        confirmed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${member.id} AND trip_id = ${tripId}
      RETURNING *
    `;

    const confirmedMember = updateResult[0];

    // Count total confirmed members
    const newMemberCount = await sql`
      SELECT COUNT(*) as count
      FROM group_members
      WHERE trip_id = ${tripId} AND status IN ('confirmed', 'paid')
    `;

    const currentMembers = parseInt(newMemberCount[0].count);

    // Award credits to inviter
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
          ${`Member ${currentMembers} joined ${trip.title}`},
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

    // Initialize user's credit account if not exists
    await sql`
      INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
      VALUES (${userId}, 0, 0, 0)
      ON CONFLICT (user_id) DO NOTHING
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
        'member_joined',
        'Joined the trip',
        ${JSON.stringify({ memberId: member.id, memberCount: currentMembers, creditsAwarded: creditReward })}
      )
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: confirmedMember.id,
        tripId: confirmedMember.trip_id,
        userId: confirmedMember.user_id,
        role: confirmedMember.role,
        status: confirmedMember.status,
        confirmedAt: confirmedMember.confirmed_at,
      },
      message: `Welcome to ${trip.title}! You are member #${currentMembers}.`,
      trip: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.end_date,
        currentMembers,
        maxMembers: trip.max_members,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error joining trip:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to join trip',
      message: error.message,
    }, { status: 500 });
  }
}
