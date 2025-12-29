/**
 * TripMatch Credits API
 *
 * GET /api/tripmatch/credits - Get user's credit balance and summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';

/**
 * GET /api/tripmatch/credits
 *
 * Get authenticated user's credit balance and stats
 */
export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Get or create credit account
    let creditAccount = await sql`
      SELECT * FROM user_credits
      WHERE user_id = ${userId}
    `;

    if (creditAccount.length === 0) {
      // Create credit account
      await sql`
        INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
        VALUES (${userId}, 0, 0, 0)
      `;

      creditAccount = await sql`
        SELECT * FROM user_credits
        WHERE user_id = ${userId}
      `;
    }

    const account = creditAccount[0];

    // Get recent transactions
    const recentTransactions = await sql`
      SELECT * FROM credit_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Get pending balance (credits being processed)
    const pendingCredits = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM credit_transactions
      WHERE user_id = ${userId}
        AND status = 'pending'
        AND type = 'reward'
    `;

    // Get breakdown by source
    const sourceBreakdown = await sql`
      SELECT
        source,
        SUM(amount) as total_earned,
        COUNT(*) as transaction_count
      FROM credit_transactions
      WHERE user_id = ${userId}
        AND type = 'reward'
        AND status = 'completed'
      GROUP BY source
      ORDER BY total_earned DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        balance: account.balance,
        lifetimeEarned: account.lifetime_earned,
        lifetimeSpent: account.lifetime_spent,
        pendingBalance: parseInt(pendingCredits[0].total),
        tier: account.tier,
        bonusMultiplier: parseFloat(account.bonus_multiplier),
        lastUpdated: account.updated_at,
        stats: {
          totalTransactions: account.lifetime_earned + account.lifetime_spent,
          averageEarningPerTransaction: account.lifetime_earned > 0
            ? Math.floor(account.lifetime_earned / recentTransactions.filter(t => t.type === 'reward').length)
            : 0,
          sourceBreakdown: sourceBreakdown.map((s: any) => ({
            source: s.source,
            totalEarned: s.total_earned,
            transactionCount: parseInt(s.transaction_count),
          })),
        },
        recentTransactions: recentTransactions.slice(0, 5).map((t: any) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          source: t.source,
          description: t.description,
          status: t.status,
          createdAt: t.created_at,
        })),
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching credits:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch credit balance',
      message: error.message,
    }, { status: 500 });
  }
}
