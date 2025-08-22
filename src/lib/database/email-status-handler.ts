/**
 * Email Status Handler - Type-safe handling of email status updates
 * Handles missing enum values and database fields gracefully
 */

import { EmailStatus } from '@prisma/client';

// Extended email status type that includes all possible values
export type ExtendedEmailStatus = EmailStatus | 'COMPLAINED' | 'UNSUBSCRIBED' | 'OPENED' | 'CLICKED';

// Map extended statuses to valid EmailStatus enum values
export function normalizeEmailStatus(status: ExtendedEmailStatus): EmailStatus {
  switch (status) {
    case 'COMPLAINED':
    case 'UNSUBSCRIBED':
      // Map these to BOUNCED as closest equivalent
      return 'BOUNCED';
    case 'OPENED':
    case 'CLICKED':
      // Map these to DELIVERED as closest equivalent
      return 'DELIVERED';
    case 'PENDING':
    case 'SENT':
    case 'DELIVERED':
    case 'FAILED':
    case 'BOUNCED':
      // These are valid enum values
      return status;
    default:
      // Fallback for any unknown status
      return 'DELIVERED';
  }
}

// Safe email log update function
export function createSafeEmailLogUpdate(data: {
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounceReason?: string;
  status?: ExtendedEmailStatus;
}) {
  // Create update object with only valid fields
  const updateData: any = {};
  
  // Only include status if it's provided
  if (data.status) {
    updateData.status = normalizeEmailStatus(data.status);
  }
  
  // Note: deliveredAt, openedAt, clickedAt are not in the current schema
  // We log these for future schema updates but don't include in Prisma update
  if (data.deliveredAt || data.openedAt || data.clickedAt || data.bounceReason) {
    console.info('[EMAIL_STATUS] Extended fields detected (not in current schema):', {
      deliveredAt: data.deliveredAt,
      openedAt: data.openedAt,
      clickedAt: data.clickedAt,
      bounceReason: data.bounceReason
    });
  }
  
  return updateData;
}

// Safe user update function  
export function createSafeUserUpdate(data: {
  lastActivityAt?: Date;
  country?: string;
  preferences?: any;
}) {
  // Create update object with only valid fields
  const updateData: any = {};
  
  // Note: These fields are not in the current User schema
  // We log these for future schema updates but don't include in Prisma update
  if (data.lastActivityAt || data.country || data.preferences) {
    console.info('[USER_UPDATE] Extended fields detected (not in current schema):', {
      lastActivityAt: data.lastActivityAt,
      country: data.country,
      preferences: data.preferences
    });
  }
  
  return updateData;
}

// Safe email log select function
export function createSafeEmailLogSelect() {
  // Return select object with only valid fields
  return {
    id: true,
    status: true,
    createdAt: true,
    to: true,
    subject: true,
    template: true,
    htmlContent: true,
    textContent: true,
    emailProvider: true,
    providerMessageId: true,
    bookingId: true,
    sentAt: true,
    // Note: these fields are not in current schema but may be referenced in code:
    // campaignId, openedAt, clickedAt, priority, deliveredAt, bounceReason
  };
}

// Extended EmailLog type that includes potential missing fields
export interface ExtendedEmailLog {
  id: string;
  status: string;
  createdAt: Date;
  to: string;
  subject: string;
  template: string;
  htmlContent?: string | null;
  textContent?: string | null;
  emailProvider?: string | null;
  providerMessageId?: string | null;
  bookingId?: string | null;
  sentAt?: Date | null;
  // Extended fields that may not be in schema
  campaignId?: string;
  openedAt?: Date;
  clickedAt?: Date;
  deliveredAt?: Date;
  priority?: string;
  bounceReason?: string;
}

// Safe type guard for extended email log fields
export function getExtendedEmailLogField<K extends keyof ExtendedEmailLog>(
  emailLog: any, 
  field: K
): ExtendedEmailLog[K] | undefined {
  return emailLog && typeof emailLog === 'object' && field in emailLog 
    ? emailLog[field] 
    : undefined;
}