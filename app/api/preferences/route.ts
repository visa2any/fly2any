import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { preferencesService } from '@/lib/services/preferences';
import { z } from 'zod';

// Zod validation schema for user preferences
const preferencesSchema = z.object({
  // Travel preferences
  preferredCabinClass: z.enum(['economy', 'premium', 'business', 'first']).optional().nullable(),
  preferredAirlines: z.array(z.string()).optional(),
  homeAirport: z.string().optional().nullable(),

  // Notification preferences
  emailNotifications: z.boolean().optional(),
  priceAlertEmails: z.boolean().optional(),
  dealAlerts: z.boolean().optional(),
  newsletterOptIn: z.boolean().optional(),

  // UI preferences
  currency: z.string().optional(),
  language: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
});

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      );
    }

    // Get user preferences
    const preferences = await preferencesService.getPreferences(session.user.id);

    return NextResponse.json({
      success: true,
      data: preferences,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('GET /api/preferences error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch preferences',
          code: 'FETCH_ERROR',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/preferences
 * Create initial user preferences
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = preferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Create preferences
    const preferences = await preferencesService.createDefaultPreferences(
      session.user.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      data: preferences,
      meta: {
        timestamp: new Date().toISOString(),
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/preferences error:', error);

    // Handle duplicate preferences error
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Preferences already exist for this user',
            code: 'DUPLICATE_PREFERENCES',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to create preferences',
          code: 'CREATE_ERROR',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/preferences
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = preferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Update preferences
    const preferences = await preferencesService.updatePreferences(
      session.user.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      data: preferences,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('PUT /api/preferences error:', error);

    // Handle not found error
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Preferences not found. Please create preferences first.',
            code: 'NOT_FOUND',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to update preferences',
          code: 'UPDATE_ERROR',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
