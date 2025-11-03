/**
 * TripMatch Credit History API
 *
 * GET /api/tripmatch/credits/history - Get transaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';

/**
 * GET /api/tripmatch/credits/history
 *
 * Get user's credit transaction history
 *
 * Query parameters:
 * - type: Filter by transaction type (reward, redemption, bonus, refund)
 * - source: Filter by source (member_recruitment, trip_completion, etc.)
 * - status: Filter by status (pending, completed, failed, reversed)
 * - limit: Number of transactions to return (default: 50, max: 200)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    const { searchParams } = new URL(request.url);

    const typeFilter = searchParams.get('type');
    const sourceFilter = searchParams.get('source');
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with filters
    let query = `
      SELECT * FROM credit_transactions
      WHERE user_id = $1
    `;

    const queryParams: any[] = [userId];
    let paramIndex = 2;

    if (typeFilter) {
      query += ` AND type = $${paramIndex}`;
      queryParams.push(typeFilter);
      paramIndex++;
    }

    if (sourceFilter) {
      query += ` AND source = $${paramIndex}`;
      queryParams.push(sourceFilter);
      paramIndex++;
    }

    if (statusFilter) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(statusFilter);
      paramIndex++;
    }

    query += `
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const transactions = await sql.unsafe(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM credit_transactions
      WHERE user_id = $1
    `;

    const countParams: any[] = [userId];
    let countParamIndex = 2;

    if (typeFilter) {
      countQuery += ` AND type = $${countParamIndex}`;
      countParams.push(typeFilter);
      countParamIndex++;
    }

    if (sourceFilter) {
      countQuery += ` AND source = $${countParamIndex}`;
      countParams.push(sourceFilter);
      countParamIndex++;
    }

    if (statusFilter) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(statusFilter);
      countParamIndex++;
    }

    const totalResult = await sql.unsafe(countQuery, countParams);
    const total = parseInt(totalResult[0].total);

    // Transform transactions
    const transformedTransactions = transactions.map((t: any) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      source: t.source,
      description: t.description,
      referenceType: t.reference_type,
      referenceId: t.reference_id,
      status: t.status,
      expiresAt: t.expires_at,
      processedAt: t.processed_at,
      createdAt: t.created_at,
      metadata: t.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: transformedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching credit history:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch credit history',
      message: error.message,
    }, { status: 500 });
  }
}
