/**
 * Admin Notification Service for Host & Property Events
 * 
 * Central service that creates admin notifications and sends Telegram alerts
 * when significant host/property events occur.
 */

import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma';

// ─── Types ───────────────────────────────────────────────────────────
interface HostEventPayload {
  hostId: string;
  userId: string;
  hostName?: string;
  email?: string;
  businessName?: string;
}

interface PropertyEventPayload {
  propertyId: string;
  propertyName: string;
  hostId: string;
  hostName?: string;
  city?: string;
  country?: string;
  propertyType?: string;
}

// ─── Telegram Alert Helper ───────────────────────────────────────────
async function sendTelegramAlert(message: string): Promise<void> {
  try {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch {
    // Fire-and-forget: never throw
  }
}

// ─── Get Admin User IDs ─────────────────────────────────────────────
async function getAdminUserIds(): Promise<string[]> {
  if (!isPrismaAvailable()) return [];
  try {
    const prisma = getPrismaClient();
    const admins = await prisma.adminUser.findMany({
      select: { userId: true },
      take: 10,
    });
    return admins.map((a: any) => a.userId);
  } catch {
    return [];
  }
}

// ─── Create Admin Notifications ─────────────────────────────────────
async function createAdminNotifications(
  type: string,
  title: string,
  message: string,
  priority: string = 'medium',
  actionUrl?: string,
  metadata?: any
): Promise<void> {
  if (!isPrismaAvailable()) return;
  try {
    const prisma = getPrismaClient();
    const adminIds = await getAdminUserIds();
    if (adminIds.length === 0) return;

    await prisma.notification.createMany({
      data: adminIds.map((userId: string) => ({
        userId,
        type,
        title,
        message,
        priority,
        actionUrl: actionUrl || '/admin',
        metadata: metadata || {},
      })),
    });
  } catch (error) {
    console.error('[AdminNotifications] Failed to create notifications:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC API — Call these from route handlers
// ═══════════════════════════════════════════════════════════════════════

/**
 * Notify admins when a new user registers as a host (PropertyOwner created)
 */
export async function notifyNewHost(payload: HostEventPayload): Promise<void> {
  const name = payload.businessName || payload.hostName || payload.email || 'Unknown';

  // In-app notification
  await createAdminNotifications(
    'host_signup',
    '🏠 New Host Registered',
    `${name} has registered as a host on Fly2Any.`,
    'medium',
    '/admin/hosts',
    { hostId: payload.hostId, userId: payload.userId }
  );

  // Telegram alert
  await sendTelegramAlert(
    `🏠 <b>New Host Registered</b>\n\n` +
    `<b>Name:</b> ${name}\n` +
    `<b>Email:</b> ${payload.email || 'N/A'}\n` +
    `<b>Time:</b> ${new Date().toISOString()}\n\n` +
    `Review: /admin/hosts`
  );
}

/**
 * Notify admins when a new property is created
 */
export async function notifyNewProperty(payload: PropertyEventPayload): Promise<void> {
  await createAdminNotifications(
    'property_listed',
    '🏢 New Property Listed',
    `"${payload.propertyName}" in ${payload.city || 'Unknown'}, ${payload.country || ''} by ${payload.hostName || 'a host'}.`,
    'medium',
    '/admin/properties',
    { propertyId: payload.propertyId, hostId: payload.hostId }
  );

  await sendTelegramAlert(
    `🏢 <b>New Property Listed</b>\n\n` +
    `<b>Property:</b> ${payload.propertyName}\n` +
    `<b>Location:</b> ${payload.city || 'N/A'}, ${payload.country || ''}\n` +
    `<b>Type:</b> ${payload.propertyType || 'N/A'}\n` +
    `<b>Host:</b> ${payload.hostName || 'N/A'}\n` +
    `<b>Time:</b> ${new Date().toISOString()}\n\n` +
    `Review: /admin/properties`
  );
}

/**
 * Notify admins when a property is submitted for review
 */
export async function notifyPropertyPendingReview(payload: PropertyEventPayload): Promise<void> {
  await createAdminNotifications(
    'property_pending_review',
    '📋 Property Pending Review',
    `"${payload.propertyName}" by ${payload.hostName || 'a host'} is ready for review.`,
    'high',
    '/admin/properties?status=pending_review',
    { propertyId: payload.propertyId, hostId: payload.hostId }
  );

  await sendTelegramAlert(
    `📋 <b>Property Pending Review</b>\n\n` +
    `<b>Property:</b> ${payload.propertyName}\n` +
    `<b>Location:</b> ${payload.city || 'N/A'}, ${payload.country || ''}\n` +
    `<b>Host:</b> ${payload.hostName || 'N/A'}\n` +
    `<b>Time:</b> ${new Date().toISOString()}\n\n` +
    `⚡ Action required: Review and approve/reject`
  );
}

/**
 * Notify admins when a host requests verification
 */
export async function notifyHostVerificationRequest(payload: HostEventPayload): Promise<void> {
  const name = payload.businessName || payload.hostName || payload.email || 'Unknown';

  await createAdminNotifications(
    'host_verification_request',
    '🔒 Host Verification Request',
    `${name} has submitted identity verification documents.`,
    'high',
    '/admin/hosts?verification=PENDING',
    { hostId: payload.hostId, userId: payload.userId }
  );

  await sendTelegramAlert(
    `🔒 <b>Host Verification Request</b>\n\n` +
    `<b>Host:</b> ${name}\n` +
    `<b>Email:</b> ${payload.email || 'N/A'}\n` +
    `<b>Time:</b> ${new Date().toISOString()}\n\n` +
    `⚡ Review verification documents`
  );
}

/**
 * Notify admins when a property receives a booking
 */
export async function notifyPropertyBooking(
  propertyName: string,
  guestName: string,
  totalPrice: number,
  currency: string = 'USD'
): Promise<void> {
  await createAdminNotifications(
    'property_booking',
    '💰 Property Booking Received',
    `"${propertyName}" received a booking from ${guestName} for ${currency} ${totalPrice.toFixed(2)}.`,
    'medium',
    '/admin/properties',
    { propertyName, guestName, totalPrice, currency }
  );
}
