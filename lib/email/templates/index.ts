/**
 * Fly2Any Email Templates v2.0
 * Ultra-Premium / Apple-Class Level 6
 *
 * All production-ready templates
 */

import { buildEmail, components as c, TOKENS } from './base';

// ═══════════════════════════════════════════════════════════════
// TRANSACTIONAL EMAILS
// ═══════════════════════════════════════════════════════════════

export const templates = {
  // ─── Booking Confirmed ───
  bookingConfirmed: (data: {
    firstName: string;
    origin: string;
    destination: string;
    date: string;
    time?: string;
    airline?: string;
    flightNumber?: string;
    bookingId: string;
    totalPrice: string;
    bookingUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Your trip is confirmed', 'We\'ve secured everything for your journey'),
    c.spacer('16px'),
    c.flightCard({
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      time: data.time,
      airline: data.airline,
      flightNumber: data.flightNumber,
    }),
    c.infoBox('Booking Details', [
      { label: 'Confirmation', value: data.bookingId },
      { label: 'Passenger', value: data.firstName },
      { label: 'Total', value: data.totalPrice },
    ]),
    c.cta('View booking details', data.bookingUrl),
    c.alert('Your e-ticket has been sent to this email address.', 'success'),
    c.footer(),
  ], `Your flight to ${data.destination} is confirmed. Booking ref: ${data.bookingId}`),

  // ─── Payment Receipt ───
  paymentReceipt: (data: {
    firstName: string;
    bookingId: string;
    paymentDate: string;
    paymentMethod: string;
    subtotal: string;
    taxes: string;
    total: string;
    receiptUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Payment received', 'Thank you for your purchase'),
    c.paragraph(`Hi ${data.firstName}, we\'ve received your payment. Here\'s your receipt.`),
    c.infoBox('Payment Summary', [
      { label: 'Booking Reference', value: data.bookingId },
      { label: 'Date', value: data.paymentDate },
      { label: 'Payment Method', value: data.paymentMethod },
      { label: 'Subtotal', value: data.subtotal },
      { label: 'Taxes & Fees', value: data.taxes },
      { label: 'Total Charged', value: data.total },
    ]),
    c.cta('Download receipt', data.receiptUrl),
    c.footer(),
  ], `Payment of ${data.total} confirmed for booking ${data.bookingId}`),

  // ─── Price Alert Triggered ───
  priceAlert: (data: {
    firstName: string;
    origin: string;
    destination: string;
    oldPrice: string;
    newPrice: string;
    savings: string;
    savingsPercent: string;
    expiresIn?: string;
    bookingUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Price drop alert', `Save ${data.savingsPercent} on your watched route`),
    c.flightCard({
      origin: data.origin,
      destination: data.destination,
      price: data.newPrice,
    }),
    `<tr>
      <td style="padding: 0 32px 16px; text-align: center;">
        <span style="font-size: 16px; color: ${TOKENS.colors.textSecondary}; text-decoration: line-through;">${data.oldPrice}</span>
        <span style="margin-left: 12px; font-size: 14px; font-weight: 600; color: ${TOKENS.colors.success}; background: #ECFDF5; padding: 4px 12px; border-radius: 20px;">Save ${data.savings}</span>
      </td>
    </tr>`,
    data.expiresIn ? c.alert(`This price is available for the next ${data.expiresIn}`, 'warning') : '',
    c.cta('Book now', data.bookingUrl),
    c.paragraph('Price alerts help you find the best time to book. We monitor fares 24/7 so you don\'t have to.'),
    c.footer(true),
  ], `Price dropped to ${data.newPrice} for ${data.origin} → ${data.destination}. Save ${data.savings}!`),

  // ─── Fare Change Notification ───
  fareChange: (data: {
    firstName: string;
    origin: string;
    destination: string;
    direction: 'up' | 'down';
    oldPrice: string;
    newPrice: string;
    changePercent: string;
    bookingUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline(
      data.direction === 'down' ? 'Good news: Fare decreased' : 'Fare update',
      `${data.origin} to ${data.destination}`
    ),
    c.flightCard({
      origin: data.origin,
      destination: data.destination,
      price: data.newPrice,
    }),
    c.paragraph(
      data.direction === 'down'
        ? `Hi ${data.firstName}, the fare for your watched route has decreased from ${data.oldPrice} to ${data.newPrice}.`
        : `Hi ${data.firstName}, we noticed the fare for your watched route changed from ${data.oldPrice} to ${data.newPrice}. If you're ready to book, now might be a good time.`
    ),
    c.cta(data.direction === 'down' ? 'Book at new price' : 'View current fares', data.bookingUrl),
    c.footer(true),
  ], `Fare ${data.direction === 'down' ? 'dropped' : 'changed'} for ${data.origin} → ${data.destination}`),

  // ─── Refund Confirmation ───
  refundConfirmation: (data: {
    firstName: string;
    bookingId: string;
    refundAmount: string;
    refundDate: string;
    processingDays: string;
    supportUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Refund processed', 'Your refund is on its way'),
    c.paragraph(`Hi ${data.firstName}, we\'ve processed your refund for booking ${data.bookingId}.`),
    c.infoBox('Refund Details', [
      { label: 'Booking Reference', value: data.bookingId },
      { label: 'Refund Amount', value: data.refundAmount },
      { label: 'Processed On', value: data.refundDate },
      { label: 'Expected Arrival', value: `${data.processingDays} business days` },
    ]),
    c.alert('Refunds are returned to your original payment method.', 'info'),
    c.cta('Contact support', data.supportUrl, true),
    c.footer(),
  ], `Your refund of ${data.refundAmount} has been processed`),

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE EMAILS
  // ═══════════════════════════════════════════════════════════════

  // ─── Welcome ───
  welcome: (data: {
    firstName: string;
    couponCode?: string;
    couponValue?: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Welcome to Fly2Any', 'Your journey starts here'),
    c.paragraph(`Hi ${data.firstName}, we\'re excited to have you. Fly2Any makes booking travel simple, transparent, and stress-free.`),
    data.couponCode ? `
    <tr>
      <td style="padding: 0 32px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, ${TOKENS.colors.primary} 0%, #D63930 100%); border-radius: 12px;">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">Your welcome gift</p>
              <p style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #FFFFFF;">${data.couponValue} OFF</p>
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #FFFFFF; background: rgba(0,0,0,0.2); display: inline-block; padding: 8px 20px; border-radius: 8px; letter-spacing: 2px;">${data.couponCode}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '',
    c.cta('Start exploring', 'https://www.fly2any.com'),
    c.paragraph('Need help? Our support team is available 24/7.'),
    c.footer(true),
  ], data.couponCode ? `Welcome! Here\'s ${data.couponValue} off your first booking` : 'Welcome to Fly2Any - Your journey starts here'),

  // ─── Search Abandoned ───
  searchAbandoned: (data: {
    firstName: string;
    origin: string;
    destination: string;
    searchDate: string;
    currentPrice?: string;
    searchUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Still thinking about your trip?', `${data.origin} to ${data.destination}`),
    c.flightCard({
      origin: data.origin,
      destination: data.destination,
      date: data.searchDate,
      price: data.currentPrice,
    }),
    c.paragraph(`Hi ${data.firstName}, we noticed you were looking at flights. Prices can change quickly — we\'re happy to help if you\'re ready to book.`),
    c.cta('Continue searching', data.searchUrl),
    c.alert('Set up a price alert to get notified when fares drop.', 'info'),
    c.footer(true),
  ], `Flights to ${data.destination} from ${data.currentPrice || 'great prices'}`),

  // ─── Booking Abandoned ───
  bookingAbandoned: (data: {
    firstName: string;
    origin: string;
    destination: string;
    date: string;
    price: string;
    bookingUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Your booking is waiting', 'Complete it before prices change'),
    c.flightCard({
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      price: data.price,
    }),
    c.paragraph(`Hi ${data.firstName}, you were just one step away from booking. Your selected fare is still available.`),
    c.cta('Complete booking', data.bookingUrl),
    c.alert('Fares are not guaranteed until payment is complete.', 'warning'),
    c.footer(true),
  ], `Complete your booking: ${data.origin} → ${data.destination} at ${data.price}`),

  // ─── Re-engagement ───
  reengagement: (data: {
    firstName: string;
    lastActivity: string;
    suggestedDestination?: string;
    dealPrice?: string;
    searchUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('We miss you', 'Your next adventure awaits'),
    c.paragraph(`Hi ${data.firstName}, it\'s been a while since your last visit. Whether you\'re planning a getaway or just browsing, we\'re here when you\'re ready.`),
    data.suggestedDestination && data.dealPrice ? c.flightCard({
      origin: 'Your city',
      destination: data.suggestedDestination,
      price: data.dealPrice,
    }) : '',
    c.cta('Explore destinations', data.searchUrl),
    c.footer(true),
  ], `${data.firstName}, ready for your next trip?`),

  // ─── Trip Completed ───
  tripCompleted: (data: {
    firstName: string;
    destination: string;
    tripDate: string;
    reviewUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Hope you had a great trip', `Welcome back from ${data.destination}`),
    c.paragraph(`Hi ${data.firstName}, we hope your journey was everything you wanted. Your feedback helps us improve.`),
    c.cta('Share your experience', data.reviewUrl, true),
    c.paragraph('Thank you for choosing Fly2Any. We look forward to your next adventure.'),
    c.footer(true),
  ], `How was your trip to ${data.destination}?`),

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM EMAILS
  // ═══════════════════════════════════════════════════════════════

  // ─── Password Reset ───
  passwordReset: (data: {
    firstName: string;
    resetUrl: string;
    expiresIn: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Reset your password', 'You requested a password reset'),
    c.paragraph(`Hi ${data.firstName}, click the button below to create a new password.`),
    c.cta('Reset password', data.resetUrl),
    c.alert(`This link expires in ${data.expiresIn}.`, 'warning'),
    c.paragraph('If you didn\'t request this, you can safely ignore this email.'),
    c.footer(),
  ], 'Reset your Fly2Any password'),

  // ─── Email Verification ───
  emailVerification: (data: {
    firstName: string;
    verifyUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Verify your email', 'One quick step to get started'),
    c.paragraph(`Hi ${data.firstName}, please verify your email address to activate your account.`),
    c.cta('Verify email', data.verifyUrl),
    c.paragraph('If you didn\'t create an account, you can ignore this email.'),
    c.footer(),
  ], 'Verify your email to get started'),

  // ─── Security Alert ───
  securityAlert: (data: {
    firstName: string;
    activity: string;
    location?: string;
    device?: string;
    time: string;
    securityUrl: string;
  }) => buildEmail([
    c.logo(),
    c.headline('Security alert', 'New activity on your account'),
    c.alert(`${data.activity} detected on your account.`, 'warning'),
    c.infoBox('Activity Details', [
      { label: 'What', value: data.activity },
      { label: 'When', value: data.time },
      ...(data.location ? [{ label: 'Where', value: data.location }] : []),
      ...(data.device ? [{ label: 'Device', value: data.device }] : []),
    ]),
    c.paragraph(`Hi ${data.firstName}, if this was you, no action is needed. If you don\'t recognize this activity, please secure your account immediately.`),
    c.cta('Review account security', data.securityUrl),
    c.footer(),
  ], `Security alert: ${data.activity}`),
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE GETTER
// ═══════════════════════════════════════════════════════════════

export type TemplateName = keyof typeof templates;

export function getTemplate(name: TemplateName, data: Record<string, any>): string {
  const templateFn = templates[name];
  if (!templateFn) throw new Error(`Template "${name}" not found`);
  return (templateFn as any)(data);
}

export function getAvailableTemplates(): TemplateName[] {
  return Object.keys(templates) as TemplateName[];
}
