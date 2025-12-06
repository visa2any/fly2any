/**
 * Notification Preferences API
 *
 * GET - Retrieve user's notification preferences
 * PUT - Update user's notification preferences
 *
 * Stores comprehensive notification settings in UserPreferences.notifications JSON field
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES = {
  // In-app notifications
  inAppEnabled: true,
  inAppSound: true,

  // Email notifications
  emailEnabled: true,
  emailBookingConfirmed: true,
  emailBookingCancelled: true,
  emailBookingModified: true,
  emailPriceAlerts: true,
  emailPaymentUpdates: true,
  emailPromotions: false,
  emailTripReminders: true,
  emailSecurityAlerts: true,

  // Push notifications
  pushEnabled: false,
  pushBookingUpdates: false,
  pushPriceAlerts: false,
  pushPromotions: false,
  pushTripReminders: false,

  // Quiet hours
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  quietHoursTimezone: 'America/New_York',

  // Digest settings
  digestEnabled: false,
  digestFrequency: 'never',
  digestTime: '09:00',
};

/**
 * GET /api/account/notification-preferences
 * Retrieve user's notification preferences
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get or create user preferences
    let userPrefs = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      select: {
        notifications: true,
        emailNotifications: true,
        priceAlertEmails: true,
        dealAlerts: true,
        newsletterOptIn: true,
      },
    });

    // If no preferences exist, create with defaults
    if (!userPrefs) {
      userPrefs = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          notifications: DEFAULT_NOTIFICATION_PREFERENCES,
        },
        select: {
          notifications: true,
          emailNotifications: true,
          priceAlertEmails: true,
          dealAlerts: true,
          newsletterOptIn: true,
        },
      });
    }

    // Merge stored preferences with defaults (for new fields)
    const storedPrefs = (userPrefs.notifications as Record<string, any>) || {};
    const preferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...storedPrefs,
      // Also include legacy fields for backwards compatibility
      emailEnabled: userPrefs.emailNotifications ?? true,
      emailPriceAlerts: userPrefs.priceAlertEmails ?? true,
      emailPromotions: userPrefs.dealAlerts ?? true,
    };

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/account/notification-preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const prisma = getPrismaClient();

    // Validate and sanitize input
    const sanitizedPrefs: Record<string, any> = {};
    const booleanFields = [
      'inAppEnabled', 'inAppSound',
      'emailEnabled', 'emailBookingConfirmed', 'emailBookingCancelled',
      'emailBookingModified', 'emailPriceAlerts', 'emailPaymentUpdates',
      'emailPromotions', 'emailTripReminders', 'emailSecurityAlerts',
      'pushEnabled', 'pushBookingUpdates', 'pushPriceAlerts',
      'pushPromotions', 'pushTripReminders',
      'quietHoursEnabled', 'digestEnabled',
    ];

    const stringFields = [
      'quietHoursStart', 'quietHoursEnd', 'quietHoursTimezone',
      'digestFrequency', 'digestTime',
    ];

    // Sanitize boolean fields
    for (const field of booleanFields) {
      if (typeof body[field] === 'boolean') {
        sanitizedPrefs[field] = body[field];
      }
    }

    // Sanitize string fields
    for (const field of stringFields) {
      if (typeof body[field] === 'string') {
        sanitizedPrefs[field] = body[field].trim();
      }
    }

    // Validate digest frequency
    if (sanitizedPrefs.digestFrequency && !['daily', 'weekly', 'never'].includes(sanitizedPrefs.digestFrequency)) {
      sanitizedPrefs.digestFrequency = 'never';
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const field of ['quietHoursStart', 'quietHoursEnd', 'digestTime']) {
      if (sanitizedPrefs[field] && !timeRegex.test(sanitizedPrefs[field])) {
        delete sanitizedPrefs[field];
      }
    }

    // Get existing preferences
    const existingPrefs = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      select: { notifications: true },
    });

    // Merge with existing preferences
    const existingNotifs = (existingPrefs?.notifications as Record<string, any>) || {};
    const mergedPrefs = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...existingNotifs,
      ...sanitizedPrefs,
      updatedAt: new Date().toISOString(),
    };

    // Upsert user preferences
    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        notifications: mergedPrefs,
        // Also update legacy fields for backwards compatibility
        emailNotifications: sanitizedPrefs.emailEnabled ?? existingNotifs.emailEnabled ?? true,
        priceAlertEmails: sanitizedPrefs.emailPriceAlerts ?? existingNotifs.emailPriceAlerts ?? true,
        dealAlerts: sanitizedPrefs.emailPromotions ?? existingNotifs.emailPromotions ?? true,
      },
      create: {
        userId: session.user.id,
        notifications: mergedPrefs,
        emailNotifications: sanitizedPrefs.emailEnabled ?? true,
        priceAlertEmails: sanitizedPrefs.emailPriceAlerts ?? true,
        dealAlerts: sanitizedPrefs.emailPromotions ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: mergedPrefs,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
