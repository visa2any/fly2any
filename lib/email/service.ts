/**
 * Email Service using Mailgun
 * Handles all transactional emails for the booking system
 */

import { mailgunClient, MAILGUN_CONFIG } from '@/lib/email/mailgun-client';
import type { Booking } from '@/lib/bookings/types';

// Configuration
const FROM_EMAIL = MAILGUN_CONFIG.fromEmail;
const COMPANY_NAME = 'Fly2Any';
const SUPPORT_EMAIL = 'support@fly2any.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fly2any.com';

// Email failure tracking (for retry logic)
interface EmailFailure {
  type: string;
  recipient: string;
  error: string;
  timestamp: Date;
  bookingReference?: string;
}

// In-memory failure queue (in production, use Redis or database)
const emailFailureQueue: EmailFailure[] = [];

/**
 * Notify admin when critical email fails
 * This ensures booking-related email failures don't go unnoticed
 */
async function notifyAdminOfEmailFailure(
  emailType: string,
  recipient: string,
  error: string,
  bookingReference?: string
): Promise<void> {
  const failure: EmailFailure = {
    type: emailType,
    recipient,
    error,
    timestamp: new Date(),
    bookingReference,
  };

  // Add to failure queue
  emailFailureQueue.push(failure);

  // Log prominently
  console.error('🚨 ==========================================');
  console.error('🚨 CRITICAL: EMAIL DELIVERY FAILURE');
  console.error('🚨 ==========================================');
  console.error(`   Type: ${emailType}`);
  console.error(`   Recipient: ${recipient}`);
  console.error(`   Booking: ${bookingReference || 'N/A'}`);
  console.error(`   Error: ${error}`);
  console.error(`   Time: ${failure.timestamp.toISOString()}`);
  console.error('🚨 ==========================================');

  // Try to notify admin via Mailgun
  if (!mailgunClient.isConfigured()) {
    console.error('⚠️  Cannot send admin notification - MAILGUN_API_KEY not configured');
    return;
  }

  try {
    await mailgunClient.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Email Delivery Failed - ${emailType}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px;">
            <h2 style="color: #dc2626; margin-top: 0;">🚨 Email Delivery Failed</h2>
            <p><strong>Type:</strong> ${emailType}</p>
            <p><strong>Recipient:</strong> ${recipient}</p>
            ${bookingReference ? `<p><strong>Booking Reference:</strong> ${bookingReference}</p>` : ''}
            <p><strong>Time:</strong> ${failure.timestamp.toISOString()}</p>
          </div>

          <div style="background: #f3f4f6; padding: 15px; margin-top: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Error Details</h3>
            <pre style="background: #1f2937; color: #f9fafb; padding: 10px; border-radius: 4px; overflow-x: auto;">${error}</pre>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0;"><strong>Action Required:</strong> Please manually send the email or investigate the failure.</p>
          </div>
        </div>
      `,
      text: `
Email Delivery Failed

Type: ${emailType}
Recipient: ${recipient}
${bookingReference ? `Booking Reference: ${bookingReference}` : ''}
Time: ${failure.timestamp.toISOString()}

Error:
${error}

Action Required: Please manually send the email or investigate the failure.
      `,
      forceSend: true,
      tags: ['admin', 'alert', 'email-failure'],
    });

    console.log('✅ Admin notification sent successfully');
  } catch (notifyError) {
    console.error('❌ Failed to notify admin:', notifyError);
    // At this point, we've done everything we can
    // In production, this should trigger a monitoring alert (Sentry, PagerDuty, etc.)
  }
}

/**
 * Get pending email failures for admin dashboard
 */
export function getEmailFailures(): EmailFailure[] {
  return [...emailFailureQueue];
}

/**
 * Clear email failure queue (after manual resolution)
 */
export function clearEmailFailures(): void {
  emailFailureQueue.length = 0;
}

/**
 * Email Templates
 */

/**
 * Payment Instructions Email
 * Sent after booking is created but before payment is confirmed
 */
function getPaymentInstructionsEmail(booking: Booking) {
  const subject = `Payment Instructions - ${booking.bookingReference}`;
  const route = `${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}`;
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'}/account/bookings?ref=${booking.bookingReference}`;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>table{border-collapse:collapse;}</style><![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>@media only screen and (max-width:620px){.mobile-full{width:100%!important}.mobile-padding{padding-left:16px!important;padding-right:16px!important}.mobile-font-lg{font-size:28px!important}}</style>
</head>
<body style="margin:0;padding:0;background-color:#FAFAFA;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAFAFA;">Complete your booking ${route} - Ref: ${booking.bookingReference}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFAFA;">
    <tr>
      <td align="center" style="padding:32px 16px;" class="mobile-padding">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#E74035 0%,#D63930 100%);padding:32px 24px;text-align:center;">
              <img src="https://www.fly2any.com/logo-email.png" width="140" height="40" alt="Fly2Any" style="display:block;margin:0 auto 16px;border:0;">
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">Complete Your Booking</h1>
              <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">Your flight is reserved</p>
            </td>
          </tr>
          <!-- PENDING STATUS -->
          <tr>
            <td style="padding:24px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#FEF3C7 0%,#FDE68A 100%);border-radius:12px;border:2px solid #F7C928;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0;font-size:32px;">⏳</p>
                    <h2 style="margin:8px 0 4px;font-size:20px;font-weight:700;color:#92400E;">Payment Pending</h2>
                    <p style="margin:0;font-size:14px;color:#78350F;">Complete payment within 24 hours to secure your booking</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- BOOKING REF -->
          <tr>
            <td style="padding:20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
                    <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#F7C928;font-family:'SF Mono','Fira Code',monospace;letter-spacing:2px;">${booking.bookingReference}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- GREETING -->
          <tr>
            <td style="padding:0 24px 16px;">
              <p style="margin:0;font-size:16px;color:#1C1C1C;line-height:1.6;">Dear <strong>${booking.passengers[0].firstName}</strong>,<br><br>Thank you for choosing ${COMPANY_NAME}! Your booking has been created. Please complete payment to confirm your flight.</p>
            </td>
          </tr>
          <!-- FLIGHT SUMMARY -->
          <tr>
            <td style="padding:0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#F8F9FA 0%,#F2F4F5 100%);border-radius:12px;border:1px solid #E6E6E6;overflow:hidden;">
                <tr><td style="background:#E74035;padding:10px 16px;"><p style="margin:0;font-size:12px;font-weight:600;color:#FFFFFF;">Flight Summary</p></td></tr>
                <tr>
                  <td style="padding:20px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="35%" style="text-align:center;"><p style="margin:0;font-size:32px;font-weight:800;color:#1a1a1a;" class="mobile-font-lg">${booking.flight.segments[0].departure.iataCode}</p></td>
                        <td width="30%" style="text-align:center;"><p style="margin:0;font-size:11px;color:#6B6B6B;">✈️</p><div style="height:2px;background:linear-gradient(90deg,#E74035 0%,#F7C928 100%);margin:8px 0;"></div></td>
                        <td width="35%" style="text-align:center;"><p style="margin:0;font-size:32px;font-weight:800;color:#1a1a1a;" class="mobile-font-lg">${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}</p></td>
                      </tr>
                    </table>
                    <p style="margin:12px 0 0;font-size:13px;color:#6B6B6B;text-align:center;">📅 ${new Date(booking.flight.segments[0].departure.at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p style="margin:8px 0 0;font-size:13px;color:#6B6B6B;text-align:center;">👥 ${booking.passengers.length} ${booking.passengers.length === 1 ? 'passenger' : 'passengers'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- TOTAL -->
          <tr>
            <td style="padding:0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F9FA;border-radius:10px;border:1px solid #E6E6E6;">
                <tr>
                  <td style="padding:16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><p style="margin:0;font-size:14px;font-weight:600;color:#1C1C1C;">Amount Due</p></td>
                        <td style="text-align:right;"><p style="margin:0;font-size:28px;font-weight:800;color:#E74035;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CARD INFO -->
          <tr>
            <td style="padding:0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#d1fae5;border-radius:10px;border:1px solid #10b981;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#065f46;">💳 Card Payment</p>
                    <p style="margin:0;font-size:13px;color:#047857;line-height:1.6;">Card ending in •••• ${booking.payment.cardLast4 || '****'}<br>We'll process your payment and send confirmation within 2-4 hours.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- TIP -->
          <tr>
            <td style="padding:0 24px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FEF3C7;border-left:4px solid #F7C928;border-radius:8px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0;font-size:13px;color:#78350F;line-height:1.6;"><strong>💡 Tip:</strong> Email your receipt to <a href="mailto:${SUPPORT_EMAIL}" style="color:#E74035;font-weight:600;">${SUPPORT_EMAIL}</a> for faster processing.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 24px 24px;">
              <a href="${bookingUrl}" target="_blank" style="display:inline-block;padding:16px 40px;background:#E74035;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(231,64,53,0.3);">Track Your Booking</a>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr><td style="padding:0 24px;"><div style="height:1px;background:#E6E6E6;"></div></td></tr>
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="margin:0 0 12px;font-size:14px;color:#6B6B6B;">Questions? We're here 24/7</p>
              <a href="mailto:${SUPPORT_EMAIL}" style="display:inline-block;padding:12px 28px;background:transparent;color:#E74035;font-size:14px;font-weight:600;text-decoration:none;border:2px solid #E74035;border-radius:8px;">Contact Support</a>
              <p style="margin:20px 0 0;font-size:12px;color:#9F9F9F;">${COMPANY_NAME} Inc. • Global Travel Platform</p>
              <p style="margin:12px 0 0;font-size:11px;color:#DCDCDC;">Ref: ${booking.bookingReference}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
══════════════════════════════════════════════════
FLY2ANY - COMPLETE YOUR BOOKING
══════════════════════════════════════════════════

Dear ${booking.passengers[0].firstName},

Thank you for choosing ${COMPANY_NAME}! Your booking has been created.

──────────────────────────────────────────────────
BOOKING REFERENCE: ${booking.bookingReference}
STATUS: Payment Pending
──────────────────────────────────────────────────

FLIGHT: ${route}
DATE: ${new Date(booking.flight.segments[0].departure.at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
PASSENGERS: ${booking.passengers.length}

AMOUNT DUE: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

Card on file: •••• ${booking.payment.cardLast4 || '****'}
We'll process your payment and send confirmation within 2-4 hours.

──────────────────────────────────────────────────
Track your booking: ${bookingUrl}
Need help? Contact us at ${SUPPORT_EMAIL}
──────────────────────────────────────────────────

Fly2Any Inc. • Global Travel Platform
www.fly2any.com
  `;

  return { subject, html, text };
}

/**
 * Card Payment Processing Email - Apple Level 6 Premium Design
 * Sent when card payment is captured and pending manual processing
 * Clean template without bank transfer info - only for card payments
 */
function getCardPaymentProcessingEmail(booking: Booking) {
  const subject = `Booking Received - ${booking.bookingReference}`;
  const route = `${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}`;
  const departureDate = new Date(booking.flight.segments[0].departure.at).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'}/account/bookings?ref=${booking.bookingReference}`;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>table{border-collapse:collapse;}td,th{padding:0;}</style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 620px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-font-lg { font-size: 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #FAFAFA;">
    Your booking ${route} is being processed! Ref: ${booking.bookingReference}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA;">
    <tr>
      <td align="center" style="padding: 32px 16px;" class="mobile-padding">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 600px; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER - Fly2Any Brand -->
          <tr>
            <td style="background: linear-gradient(135deg, #E74035 0%, #D63930 100%); padding: 32px 24px; text-align: center;">
              <img src="https://www.fly2any.com/logo-email.png" width="140" height="40" alt="Fly2Any" style="display: block; margin: 0 auto 16px; border: 0;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Booking Received</h1>
              <p style="margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">We're processing your reservation</p>
            </td>
          </tr>

          <!-- PROCESSING STATUS -->
          <tr>
            <td style="padding: 24px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; border: 2px solid #3b82f6;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 32px;">💳</p>
                    <h2 style="margin: 8px 0 4px; font-size: 20px; font-weight: 700; color: #1e40af;">Payment Being Processed</h2>
                    <p style="margin: 0; font-size: 14px; color: #1e3a8a;">Your card has been securely captured</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOOKING REFERENCE STRIP -->
          <tr>
            <td style="padding: 20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #1a1a1a; border-radius: 10px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                          <p style="margin: 4px 0 0; font-size: 24px; font-weight: 800; color: #F7C928; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 2px;">${booking.bookingReference}</p>
                        </td>
                        <td style="text-align: right;">
                          <span style="display: inline-block; padding: 8px 16px; background: #F7C928; color: #1a1a1a; font-size: 11px; font-weight: 700; border-radius: 20px; text-transform: uppercase;">Processing</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <p style="margin: 0; font-size: 16px; color: #1C1C1C; line-height: 1.6;">
                Dear <strong>${booking.passengers[0].firstName}</strong>,<br><br>
                Thank you for booking with ${COMPANY_NAME}! We've received your reservation and your payment is being processed.
              </p>
            </td>
          </tr>

          <!-- FLIGHT SUMMARY CARD -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F8F9FA 0%, #F2F4F5 100%); border-radius: 12px; border: 1px solid #E6E6E6; overflow: hidden;">
                <tr>
                  <td style="background: #E74035; padding: 10px 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #FFFFFF;">Flight Summary</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="35%" style="text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a;" class="mobile-font-lg">${booking.flight.segments[0].departure.iataCode}</p>
                        </td>
                        <td width="30%" style="text-align: center; vertical-align: middle;">
                          <p style="margin: 0; font-size: 11px; color: #6B6B6B;">✈️</p>
                          <div style="height: 2px; background: linear-gradient(90deg, #E74035 0%, #F7C928 100%); margin: 8px 0;"></div>
                        </td>
                        <td width="35%" style="text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a;" class="mobile-font-lg">${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 12px 0 0; font-size: 13px; color: #6B6B6B; text-align: center;">📅 ${departureDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOOKING DETAILS -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F8F9FA; border-radius: 10px; border: 1px solid #E6E6E6;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px;">Booking Details</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 8px 0;"><p style="margin: 0; font-size: 13px; color: #6B6B6B;">Passengers</p></td>
                        <td style="padding: 8px 0; text-align: right;"><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">${booking.passengers.length} ${booking.passengers.length === 1 ? 'traveler' : 'travelers'}</p></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;"><p style="margin: 0; font-size: 13px; color: #6B6B6B;">Card</p></td>
                        <td style="padding: 8px 0; text-align: right;"><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">•••• ${booking.payment.cardLast4 || '****'}</p></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 12px; border-top: 1px solid #E6E6E6;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">Total</p></td>
                              <td style="text-align: right;"><p style="margin: 0; font-size: 22px; font-weight: 800; color: #E74035;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WHAT'S NEXT STEPS -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #d1fae5; border-radius: 10px; border: 1px solid #10b981;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #065f46;">What happens next?</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 6px 0; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background: #10b981; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">1</span>
                        </td>
                        <td style="padding: 6px 0 6px 12px;">
                          <p style="margin: 0; font-size: 13px; color: #047857;">We verify your payment (usually 2-4 hours)</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background: #10b981; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">2</span>
                        </td>
                        <td style="padding: 6px 0 6px 12px;">
                          <p style="margin: 0; font-size: 13px; color: #047857;">Your ticket is issued with the airline</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background: #10b981; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">3</span>
                        </td>
                        <td style="padding: 6px 0 6px 12px;">
                          <p style="margin: 0; font-size: 13px; color: #047857;">You receive your e-ticket confirmation via email</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PAYMENT NOTE -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEF3C7; border-left: 4px solid #F7C928; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #78350F; line-height: 1.6;">
                      <strong>💳 Payment Note:</strong> Your card ending in •••• ${booking.payment.cardLast4 || '****'} will be charged ${booking.payment.currency} ${booking.payment.amount.toFixed(2)} once verified.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td align="center" style="padding: 0 24px 24px;">
              <a href="${bookingUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background: #E74035; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(231,64,53,0.3);">Track Your Booking</a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background: #E6E6E6;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6B6B6B;">Questions? We're here to help 24/7</p>
              <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; padding: 12px 28px; background: transparent; color: #E74035; font-size: 14px; font-weight: 600; text-decoration: none; border: 2px solid #E74035; border-radius: 8px;">Contact Support</a>
              <p style="margin: 20px 0 0; font-size: 12px; color: #9F9F9F;">
                ${COMPANY_NAME} Inc. • Global Travel Platform<br>
                <a href="https://www.fly2any.com/privacy" style="color: #9F9F9F;">Privacy</a> • <a href="https://www.fly2any.com/terms" style="color: #9F9F9F;">Terms</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #DCDCDC;">Ref: ${booking.bookingReference}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
══════════════════════════════════════════════════
FLY2ANY - BOOKING RECEIVED
══════════════════════════════════════════════════

Dear ${booking.passengers[0].firstName},

Thank you for booking with ${COMPANY_NAME}! We've received your reservation and your payment is being processed.

──────────────────────────────────────────────────
BOOKING REFERENCE: ${booking.bookingReference}
STATUS: Processing
──────────────────────────────────────────────────

FLIGHT SUMMARY:
${route}
${departureDate}
${booking.passengers.length} ${booking.passengers.length === 1 ? 'traveler' : 'travelers'}

PAYMENT:
Card: •••• ${booking.payment.cardLast4 || '****'}
Total: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

──────────────────────────────────────────────────
WHAT HAPPENS NEXT:
──────────────────────────────────────────────────
1. We verify your payment (usually 2-4 hours)
2. Your ticket is issued with the airline
3. You receive your e-ticket confirmation via email

Track your booking: ${bookingUrl}

──────────────────────────────────────────────────
Need help? Contact us at ${SUPPORT_EMAIL}
──────────────────────────────────────────────────

Fly2Any Inc. • Global Travel Platform
www.fly2any.com
  `;

  return { subject, html, text };
}

/**
 * Booking Confirmation Email - Apple Level 6 Premium Design
 * Sent after payment is confirmed
 */
function getBookingConfirmationEmail(booking: Booking) {
  const subject = `✅ Booking Confirmed - ${booking.bookingReference}`;
  const route = `${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}`;
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'}/account/bookings?ref=${booking.bookingReference}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(bookingUrl)}&bgcolor=ffffff&color=E74035`;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>table{border-collapse:collapse;}td,th{padding:0;}</style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 620px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
      .mobile-font-lg { font-size: 28px !important; }
      .mobile-font-md { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #FAFAFA;">
    Your flight ${route} is confirmed! Booking ref: ${booking.bookingReference}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA;">
    <tr>
      <td align="center" style="padding: 32px 16px;" class="mobile-padding">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 600px; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER - Fly2Any Brand -->
          <tr>
            <td style="background: linear-gradient(135deg, #E74035 0%, #D63930 100%); padding: 32px 24px; text-align: center;">
              <img src="https://www.fly2any.com/logo-email.png" width="140" height="40" alt="Fly2Any" style="display: block; margin: 0 auto 16px; border: 0;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Booking Confirmed</h1>
              <p style="margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">Your journey starts here</p>
            </td>
          </tr>

          <!-- SUCCESS BADGE -->
          <tr>
            <td style="padding: 24px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 32px;">✅</p>
                    <h2 style="margin: 8px 0 4px; font-size: 20px; font-weight: 700; color: #065f46;">Payment Received!</h2>
                    <p style="margin: 0; font-size: 14px; color: #047857;">Your flight is confirmed and ready for travel</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOOKING REFERENCE STRIP -->
          <tr>
            <td style="padding: 20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #1a1a1a; border-radius: 10px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                          <p style="margin: 4px 0 0; font-size: 24px; font-weight: 800; color: #F7C928; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 2px;">${booking.bookingReference}</p>
                        </td>
                        <td width="100" style="text-align: right;">
                          <img src="${qrCodeUrl}" width="80" height="80" alt="QR Code" style="display: block; border-radius: 8px; background: #fff; padding: 4px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <p style="margin: 0; font-size: 16px; color: #1C1C1C; line-height: 1.6;">
                Dear <strong>${booking.passengers[0].firstName}</strong>,<br><br>
                Great news! Your payment has been received and your booking is now confirmed. Your e-ticket details are below.
              </p>
            </td>
          </tr>

          <!-- FLIGHT CARDS -->
          ${booking.flight.segments.map((segment, idx) => `
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F8F9FA 0%, #F2F4F5 100%); border-radius: 12px; border: 1px solid #E6E6E6; overflow: hidden;">
                <!-- Flight Header -->
                <tr>
                  <td style="background: #E74035; padding: 10px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.9);">Flight ${idx + 1}</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0; font-size: 12px; font-weight: 600; color: #FFFFFF;">${segment.carrierCode} ${segment.flightNumber}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Route Visual -->
                <tr>
                  <td style="padding: 20px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="35%" style="text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a;" class="mobile-font-lg">${segment.departure.iataCode}</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #6B6B6B;">${new Date(segment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td width="30%" style="text-align: center; vertical-align: middle;">
                          <p style="margin: 0; font-size: 11px; color: #6B6B6B;">✈️</p>
                          <div style="height: 2px; background: linear-gradient(90deg, #E74035 0%, #F7C928 100%); margin: 8px 0;"></div>
                          <p style="margin: 0; font-size: 10px; color: #9F9F9F;">DIRECT</p>
                        </td>
                        <td width="35%" style="text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a;" class="mobile-font-lg">${segment.arrival.iataCode}</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #6B6B6B;">${new Date(segment.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 12px 0 0; font-size: 13px; color: #6B6B6B; text-align: center;">
                      📅 ${new Date(segment.departure.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `).join('')}

          <!-- PASSENGERS -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F8F9FA; border-radius: 10px; border: 1px solid #E6E6E6;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px;">Passengers</p>
                    ${booking.passengers.map((p, idx) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">👤 ${p.firstName} ${p.lastName}</p>
                        </td>
                        <td style="text-align: right;">
                          <span style="display: inline-block; padding: 4px 10px; background: #E74035; color: #fff; font-size: 10px; font-weight: 600; border-radius: 4px; text-transform: uppercase;">${p.type || 'Adult'}</span>
                        </td>
                      </tr>
                    </table>
                    `).join('')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PAYMENT SUMMARY -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F8F9FA; border-radius: 10px; border: 1px solid #E6E6E6;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px;">Payment</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 4px 0;"><p style="margin: 0; font-size: 13px; color: #6B6B6B;">Status</p></td>
                        <td style="padding: 4px 0; text-align: right;"><span style="display: inline-block; padding: 4px 12px; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; border-radius: 20px;">PAID</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;"><p style="margin: 0; font-size: 13px; color: #6B6B6B;">Card</p></td>
                        <td style="padding: 4px 0; text-align: right;"><p style="margin: 0; font-size: 13px; font-weight: 600; color: #1C1C1C;">•••• ${booking.payment.cardLast4 || '****'}</p></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 12px; border-top: 1px solid #E6E6E6;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">Total Paid</p></td>
                              <td style="text-align: right;"><p style="margin: 0; font-size: 22px; font-weight: 800; color: #E74035;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- IMPORTANT INFO -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEF3C7; border-left: 4px solid #F7C928; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400E;">📋 Before You Fly</p>
                    <p style="margin: 0; font-size: 13px; color: #78350F; line-height: 1.6;">
                      • Check in online 24-48 hours before departure<br>
                      • Arrive at the airport at least 2 hours early<br>
                      • Bring valid photo ID and passport (international)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td align="center" style="padding: 0 24px 24px;">
              <a href="${bookingUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background: #E74035; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(231,64,53,0.3);">View Booking Online</a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background: #E6E6E6;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6B6B6B;">Questions? We're here to help 24/7</p>
              <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; padding: 12px 28px; background: transparent; color: #E74035; font-size: 14px; font-weight: 600; text-decoration: none; border: 2px solid #E74035; border-radius: 8px;">Contact Support</a>
              <p style="margin: 20px 0 0; font-size: 12px; color: #9F9F9F;">
                ${COMPANY_NAME} Inc. • Global Travel Platform<br>
                <a href="https://www.fly2any.com/privacy" style="color: #9F9F9F;">Privacy</a> • <a href="https://www.fly2any.com/terms" style="color: #9F9F9F;">Terms</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #DCDCDC;">Ref: ${booking.bookingReference}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
══════════════════════════════════════════════════
FLY2ANY - BOOKING CONFIRMED
══════════════════════════════════════════════════

Dear ${booking.passengers[0].firstName},

Great news! Your payment has been received and your booking is now confirmed.

──────────────────────────────────────────────────
BOOKING REFERENCE: ${booking.bookingReference}
──────────────────────────────────────────────────

FLIGHT DETAILS:
${booking.flight.segments.map((seg, idx) => `
Flight ${idx + 1}: ${seg.carrierCode}${seg.flightNumber}
${seg.departure.iataCode} → ${seg.arrival.iataCode}
Departure: ${new Date(seg.departure.at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date(seg.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Arrival: ${new Date(seg.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
`).join('\n')}

PASSENGERS:
${booking.passengers.map(p => `• ${p.firstName} ${p.lastName}`).join('\n')}

PAYMENT:
Total Paid: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}
Card: •••• ${booking.payment.cardLast4 || '****'}
Status: PAID

──────────────────────────────────────────────────
BEFORE YOU FLY:
──────────────────────────────────────────────────
• Check in online 24-48 hours before departure
• Arrive at the airport at least 2 hours early
• Bring valid photo ID and passport (international)

View your booking online: ${bookingUrl}

──────────────────────────────────────────────────
Need help? Contact us at ${SUPPORT_EMAIL}
──────────────────────────────────────────────────

Have a great flight!

Fly2Any Inc. • Global Travel Platform
www.fly2any.com
  `;

  return { subject, html, text };
}

/**
 * Email Service Functions
 */

export async function sendPaymentInstructionsEmail(booking: Booking): Promise<boolean> {
  try {
    const { subject, html, text } = getPaymentInstructionsEmail(booking);

    console.log('📧 Sending payment instructions email via Mailgun...');
    console.log(`   To: ${booking.contactInfo.email}`);
    console.log(`   Subject: ${subject}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      forceSend: true, // Always send booking emails
      tags: ['booking', 'payment-instructions'],
    });

    if (result.success) {
      console.log('✅ Payment instructions email sent successfully');
      console.log(`   Email ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending payment instructions email:', error);

    // CRITICAL: Notify admin of failure - don't let email failures go unnoticed
    await notifyAdminOfEmailFailure(
      'Payment Instructions',
      booking.contactInfo?.email || 'unknown',
      error?.message || String(error),
      booking.bookingReference
    );

    return false;
  }
}

/**
 * Send card payment processing email
 * For card payments that need manual verification
 */
export async function sendCardPaymentProcessingEmail(booking: Booking): Promise<boolean> {
  try {
    const { subject, html, text } = getCardPaymentProcessingEmail(booking);

    console.log('📧 Sending card payment processing email via Mailgun...');
    console.log(`   To: ${booking.contactInfo.email}`);
    console.log(`   Subject: ${subject}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['booking', 'card-processing'],
    });

    if (result.success) {
      console.log('✅ Card payment processing email sent successfully');
      console.log(`   Email ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending card payment processing email:', error);

    await notifyAdminOfEmailFailure(
      'Card Payment Processing',
      booking.contactInfo?.email || 'unknown',
      error?.message || String(error),
      booking.bookingReference
    );

    return false;
  }
}

export async function sendBookingConfirmationEmail(booking: Booking): Promise<boolean> {
  try {
    const { subject, html, text } = getBookingConfirmationEmail(booking);

    console.log('📧 Sending booking confirmation email via Mailgun...');
    console.log(`   To: ${booking.contactInfo.email}`);
    console.log(`   Subject: ${subject}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['booking', 'confirmation'],
    });

    if (result.success) {
      console.log('✅ Booking confirmation email sent successfully');
      console.log(`   Email ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending booking confirmation email:', error);

    // CRITICAL: Notify admin of failure
    await notifyAdminOfEmailFailure(
      'Booking Confirmation',
      booking.contactInfo?.email || 'unknown',
      error?.message || String(error),
      booking.bookingReference
    );

    return false;
  }
}

/**
 * Price Alert Triggered Email
 * Sent when a price alert is triggered
 */
function getPriceAlertEmail(alert: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  currentPrice: number;
  targetPrice: number;
  currency: string;
}) {
  const subject = `🎉 Price Alert: ${alert.origin} → ${alert.destination} - ${alert.currency} ${alert.currentPrice}`;

  const savings = ((alert.targetPrice - alert.currentPrice) / alert.targetPrice * 100).toFixed(0);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔔 ${COMPANY_NAME}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Price Alert Triggered!</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
      <h2 style="color: #92400e; margin: 0 0 10px 0;">🎉 Great News!</h2>
      <p style="color: #78350f; margin: 0; font-size: 16px;">The price for your watched route has dropped below your target!</p>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Flight Route</h3>

      <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0;">
        <div style="text-align: center; flex: 1;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">${alert.origin}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">${new Date(alert.departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
        <div style="text-align: center; padding: 0 20px;">
          <p style="margin: 0; color: #9ca3af; font-size: 24px;">✈️</p>
        </div>
        <div style="text-align: center; flex: 1;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">${alert.destination}</p>
          ${alert.returnDate ? `<p style="margin: 5px 0; font-size: 14px; color: #6b7280;">${new Date(alert.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>` : ''}
        </div>
      </div>

      <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">Current Price</p>
        <p style="margin: 5px 0; color: #047857; font-size: 36px; font-weight: bold;">${alert.currency} ${alert.currentPrice.toFixed(2)}</p>
        <p style="margin: 0; color: #059669; font-size: 16px;">
          <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;">
            ${savings}% below target!
          </span>
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Your Target Price:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #1f2937; text-decoration: line-through;">${alert.currency} ${alert.targetPrice.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Trip Type:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 16px; color: #1f2937;">${alert.returnDate ? 'Round Trip' : 'One Way'}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #92400e;">⏰ Act Fast!</h3>
      <p style="margin: 0; color: #78350f;">Flight prices can change quickly. We recommend booking soon to lock in this great price!</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/flights?from=${alert.origin}&to=${alert.destination}&departure=${alert.departDate}${alert.returnDate ? `&return=${alert.returnDate}` : ''}" style="display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Search This Flight</a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Want to stop receiving alerts for this route?<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/alerts" style="color: #2563eb;">Manage your price alerts</a>
    </p>

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
      This alert was sent by ${COMPANY_NAME}<br>
      ${alert.origin} → ${alert.destination}
    </p>
  </div>
</body>
</html>
  `;

  const text = `
🔔 Price Alert Triggered!

${alert.origin} → ${alert.destination}
Departure: ${new Date(alert.departDate).toLocaleDateString()}
${alert.returnDate ? `Return: ${new Date(alert.returnDate).toLocaleDateString()}` : 'One Way'}

Current Price: ${alert.currency} ${alert.currentPrice.toFixed(2)}
Your Target: ${alert.currency} ${alert.targetPrice.toFixed(2)}

Great news! The price has dropped below your target by ${savings}%!

Act fast - flight prices can change quickly. Book now to lock in this great price.

Search this flight: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/flights?from=${alert.origin}&to=${alert.destination}&departure=${alert.departDate}${alert.returnDate ? `&return=${alert.returnDate}` : ''}

Manage your alerts: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/alerts

${COMPANY_NAME}
  `;

  return { subject, html, text };
}

export async function sendPriceAlertEmail(
  email: string,
  alert: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string | null;
    currentPrice: number;
    targetPrice: number;
    currency: string;
  }
): Promise<boolean> {
  try {
    const { subject, html, text } = getPriceAlertEmail(alert);

    console.log('📧 Sending price alert email via Mailgun...');
    console.log(`   To: ${email}`);
    console.log(`   Subject: ${subject}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['price-alert'],
    });

    if (result.success) {
      console.log('✅ Price alert email sent successfully');
      console.log(`   Email ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending price alert email:', error);

    // Notify admin of failure (price alerts are important for customer retention)
    await notifyAdminOfEmailFailure(
      'Price Alert',
      email,
      error?.message || String(error)
    );

    return false;
  }
}

/**
 * E-Ticket Confirmation Email - Apple Level 6 Premium Design
 * Sent after ticket is issued (manual ticketing workflow)
 */
function getTicketedConfirmationEmail(booking: Booking) {
  const subject = `🎫 Your E-Ticket - ${booking.bookingReference}`;
  const route = `${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}`;
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'}/account/bookings?ref=${booking.bookingReference}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(bookingUrl)}&bgcolor=ffffff&color=E74035`;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>table{border-collapse:collapse;}td,th{padding:0;}</style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 620px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-font-lg { font-size: 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #FAFAFA;">
    Your e-ticket for ${route} is ready! PNR: ${booking.airlineRecordLocator || booking.bookingReference}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA;">
    <tr>
      <td align="center" style="padding: 32px 16px;" class="mobile-padding">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 600px; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER - Fly2Any Brand -->
          <tr>
            <td style="background: linear-gradient(135deg, #E74035 0%, #D63930 100%); padding: 32px 24px; text-align: center;">
              <img src="https://www.fly2any.com/logo-email.png" width="140" height="40" alt="Fly2Any" style="display: block; margin: 0 auto 16px; border: 0;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Your E-Ticket is Ready</h1>
              <p style="margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">You're all set to fly!</p>
            </td>
          </tr>

          <!-- SUCCESS BADGE -->
          <tr>
            <td style="padding: 24px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 32px;">🎫</p>
                    <h2 style="margin: 8px 0 4px; font-size: 20px; font-weight: 700; color: #065f46;">Ticket Issued Successfully!</h2>
                    <p style="margin: 0; font-size: 14px; color: #047857;">Save this email for check-in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PNR & QR CODE STRIP -->
          <tr>
            <td style="padding: 20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #1a1a1a; border-radius: 10px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Airline Confirmation (PNR)</p>
                          <p style="margin: 4px 0 0; font-size: 28px; font-weight: 800; color: #F7C928; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 3px;">${booking.airlineRecordLocator || 'N/A'}</p>
                          <p style="margin: 8px 0 0; font-size: 11px; color: #6B6B6B;">Fly2Any Ref: ${booking.bookingReference}</p>
                        </td>
                        <td width="100" style="text-align: right;">
                          <img src="${qrCodeUrl}" width="80" height="80" alt="QR Code" style="display: block; border-radius: 8px; background: #fff; padding: 4px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <p style="margin: 0; font-size: 16px; color: #1C1C1C; line-height: 1.6;">
                Dear <strong>${booking.passengers[0].firstName}</strong>,<br><br>
                Great news! Your ticket has been issued and you're ready to travel. Please save this email for check-in.
              </p>
            </td>
          </tr>

          <!-- E-TICKET NUMBERS -->
          ${booking.eticketNumbers && booking.eticketNumbers.length > 0 ? `
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #d1fae5; border-radius: 10px; border: 1px solid #10b981;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; color: #065f46; text-transform: uppercase; letter-spacing: 1px;">E-Ticket Numbers</p>
                    ${booking.passengers.map((p, idx) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; background: #fff; border-radius: 6px;">
                      <tr>
                        <td style="padding: 10px 12px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">${p.firstName} ${p.lastName}</p>
                        </td>
                        <td style="padding: 10px 12px; text-align: right;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #065f46; font-family: 'SF Mono', monospace;">${booking.eticketNumbers?.[idx] || 'N/A'}</p>
                        </td>
                      </tr>
                    </table>
                    `).join('')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- FLIGHT CARDS -->
          ${booking.flight.segments.map((segment, idx) => `
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F8F9FA 0%, #F2F4F5 100%); border-radius: 12px; border: 1px solid #E6E6E6; overflow: hidden;">
                <tr>
                  <td style="background: #E74035; padding: 10px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.9);">Flight ${idx + 1}</p></td>
                        <td style="text-align: right;"><p style="margin: 0; font-size: 12px; font-weight: 600; color: #FFFFFF;">${segment.carrierCode} ${segment.flightNumber}</p></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="35%" style="text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a;" class="mobile-font-lg">${segment.departure.iataCode}</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #6B6B6B;">${new Date(segment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td width="30%" style="text-align: center; vertical-align: middle;">
                          <p style="margin: 0; font-size: 11px; color: #6B6B6B;">✈️</p>
                          <div style="height: 2px; background: linear-gradient(90deg, #E74035 0%, #F7C928 100%); margin: 8px 0;"></div>
                          <p style="margin: 0; font-size: 10px; color: #9F9F9F;">DIRECT</p>
                        </td>
                        <td width="35%" style="text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a;" class="mobile-font-lg">${segment.arrival.iataCode}</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #6B6B6B;">${new Date(segment.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 12px 0 0; font-size: 13px; color: #6B6B6B; text-align: center;">
                      📅 ${new Date(segment.departure.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `).join('')}

          <!-- PASSENGERS & CLASS -->
          <tr>
            <td style="padding: 0 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F8F9FA; border-radius: 10px; border: 1px solid #E6E6E6;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px;">Passengers</p>
                    ${booking.passengers.map((p, idx) => `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                      <tr>
                        <td><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C;">👤 ${p.firstName} ${p.lastName}</p></td>
                        <td style="text-align: right;">
                          <span style="display: inline-block; padding: 4px 10px; background: #E74035; color: #fff; font-size: 10px; font-weight: 600; border-radius: 4px; text-transform: uppercase;">${p.type || 'Adult'}</span>
                        </td>
                      </tr>
                    </table>
                    `).join('')}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E6E6E6;">
                      <tr>
                        <td><p style="margin: 0; font-size: 13px; color: #6B6B6B;">Class</p></td>
                        <td style="text-align: right;"><p style="margin: 0; font-size: 14px; font-weight: 600; color: #1C1C1C; text-transform: capitalize;">${booking.flight.segments[0].class || 'Economy'}</p></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CHECK-IN REMINDERS -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEF3C7; border-left: 4px solid #F7C928; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400E;">📋 Check-in Reminders</p>
                    <p style="margin: 0; font-size: 13px; color: #78350F; line-height: 1.6;">
                      • Online check-in opens 24-48 hours before departure<br>
                      • Use your PNR <strong style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px;">${booking.airlineRecordLocator || booking.bookingReference}</strong> on the airline's website<br>
                      • Arrive at the airport at least 2 hours early (3 hours for international)<br>
                      • Bring valid photo ID and passport (international flights)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td align="center" style="padding: 0 24px 24px;">
              <a href="${bookingUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background: #E74035; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(231,64,53,0.3);">View E-Ticket Online</a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background: #E6E6E6;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6B6B6B;">Questions? We're here to help 24/7</p>
              <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; padding: 12px 28px; background: transparent; color: #E74035; font-size: 14px; font-weight: 600; text-decoration: none; border: 2px solid #E74035; border-radius: 8px;">Contact Support</a>
              <p style="margin: 20px 0 0; font-size: 14px; color: #6B6B6B;">Have a great flight! ✈️</p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #9F9F9F;">
                ${COMPANY_NAME} Inc. • Global Travel Platform<br>
                <a href="https://www.fly2any.com/privacy" style="color: #9F9F9F;">Privacy</a> • <a href="https://www.fly2any.com/terms" style="color: #9F9F9F;">Terms</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #DCDCDC;">Ref: ${booking.bookingReference} | PNR: ${booking.airlineRecordLocator || 'N/A'}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
══════════════════════════════════════════════════
FLY2ANY - YOUR E-TICKET IS READY
══════════════════════════════════════════════════

Dear ${booking.passengers[0].firstName},

Great news! Your ticket has been issued and you're ready to travel.

──────────────────────────────────────────────────
AIRLINE CONFIRMATION (PNR): ${booking.airlineRecordLocator || 'N/A'}
BOOKING REFERENCE: ${booking.bookingReference}
──────────────────────────────────────────────────

${booking.eticketNumbers && booking.eticketNumbers.length > 0 ? `
E-TICKET NUMBERS:
${booking.passengers.map((p, idx) => `• ${p.firstName} ${p.lastName}: ${booking.eticketNumbers?.[idx] || 'N/A'}`).join('\n')}
` : ''}

FLIGHT DETAILS:
${booking.flight.segments.map((seg, idx) => `
Flight ${idx + 1}: ${seg.carrierCode}${seg.flightNumber}
${seg.departure.iataCode} → ${seg.arrival.iataCode}
Departure: ${new Date(seg.departure.at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date(seg.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
`).join('\n')}

PASSENGERS:
${booking.passengers.map(p => `• ${p.firstName} ${p.lastName}`).join('\n')}
Class: ${booking.flight.segments[0].class || 'Economy'}

──────────────────────────────────────────────────
CHECK-IN REMINDERS:
──────────────────────────────────────────────────
• Online check-in opens 24-48 hours before departure
• Use your PNR ${booking.airlineRecordLocator || booking.bookingReference} on the airline's website
• Arrive at the airport at least 2 hours early (3 hours for international)
• Bring valid photo ID and passport (international flights)

View your e-ticket online: ${bookingUrl}

──────────────────────────────────────────────────
Need help? Contact us at ${SUPPORT_EMAIL}
──────────────────────────────────────────────────

Have a great flight!

Fly2Any Inc. • Global Travel Platform
www.fly2any.com
  `;

  return { subject, html, text };
}

export async function sendTicketedConfirmationEmail(booking: Booking): Promise<boolean> {
  try {
    const { subject, html, text } = getTicketedConfirmationEmail(booking);

    console.log('📧 Sending e-ticket confirmation email via Mailgun...');
    console.log(`   To: ${booking.contactInfo.email}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   PNR: ${booking.airlineRecordLocator}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['booking', 'eticket'],
    });

    if (result.success) {
      console.log('✅ E-ticket confirmation email sent successfully');
      console.log(`   Email ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending e-ticket confirmation email:', error);

    // CRITICAL: E-ticket emails are essential - customer needs their ticket!
    await notifyAdminOfEmailFailure(
      'E-Ticket Confirmation',
      booking.contactInfo?.email || 'unknown',
      error?.message || String(error),
      booking.bookingReference
    );

    return false;
  }
}

/**
 * Email Verification Email (Apple-Class Level 6)
 * Sent when user needs to verify their email address
 */
function getEmailVerificationEmail(data: {
  firstName: string;
  verificationUrl: string;
  expiresIn: string;
}) {
  const subject = `Verify Your Email - ${COMPANY_NAME}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]><style>table{border-collapse:collapse;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">

          <!-- HEADER -->
          <tr>
            <td style="background:#E74035;padding:32px 24px;text-align:center;">
              <img src="https://www.fly2any.com/fly2any-logo-white.png" alt="Fly2Any" width="120" style="display:block;margin:0 auto 16px;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Verify Your Email</h1>
              <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">One quick step to secure your account</p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 16px;font-size:18px;color:#111827;">Hi ${data.firstName},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#6b7280;line-height:1.6;">
                Welcome to ${COMPANY_NAME}! Please verify your email address to complete your registration and start booking amazing flights.
              </p>

              <!-- VERIFICATION BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#fef3c7;border:2px solid #f59e0b;padding:20px;border-radius:12px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:14px;color:#92400e;">⏰ This link expires in</p>
                    <p style="margin:0;font-size:24px;font-weight:700;color:#78350f;">${data.expiresIn}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="${data.verificationUrl}" style="display:inline-block;padding:16px 48px;background:#E74035;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>

              <!-- FALLBACK LINK -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                <tr>
                  <td style="background:#f8fafc;padding:16px;border-radius:8px;">
                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                      If the button doesn't work, copy and paste this link:<br>
                      <a href="${data.verificationUrl}" style="color:#E74035;word-break:break-all;font-size:12px;">${data.verificationUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- SECURITY NOTE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:4px;">
                    <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.5;">
                      <strong>🔒 Security Note:</strong> If you didn't create an account with ${COMPANY_NAME}, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1e293b;padding:24px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#ffffff;">24/7 Support: ${SUPPORT_EMAIL}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
                <a href="https://www.fly2any.com/privacy" style="color:#94a3b8;">Privacy</a> |
                <a href="https://www.fly2any.com/terms" style="color:#94a3b8;">Terms</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#64748b;">© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Verify Your Email - ${COMPANY_NAME}

Hi ${data.firstName},

Welcome to ${COMPANY_NAME}! Please verify your email address to complete your registration.

Click here to verify: ${data.verificationUrl}

This link expires in ${data.expiresIn}.

If you didn't create an account, you can safely ignore this email.

${COMPANY_NAME}
  `;

  return { subject, html, text };
}

export async function sendEmailVerificationEmail(
  email: string,
  data: {
    firstName: string;
    verificationUrl: string;
    expiresIn: string;
  }
): Promise<boolean> {
  try {
    const { subject, html, text } = getEmailVerificationEmail(data);

    console.log('📧 Sending email verification email via Mailgun...');
    console.log(`   To: ${email}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['verification', 'security'],
    });

    if (result.success) {
      console.log('✅ Email verification email sent successfully');
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending email verification:', error);
    await notifyAdminOfEmailFailure('Email Verification', email, error?.message || String(error));
    return false;
  }
}

/**
 * Abandoned Booking Email (Apple-Class Level 6)
 * Sent when user abandons booking mid-flow
 */
function getAbandonedBookingEmail(data: {
  firstName: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  price: number;
  currency: string;
  airline?: string;
  resumeUrl: string;
  expiresIn?: string;
}) {
  const subject = `Complete your ${data.origin} → ${data.destination} booking`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">

          <!-- URGENCY BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);padding:12px 20px;text-align:center;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#78350f;">⏰ Your flight selection is waiting - price not guaranteed</p>
            </td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="background:#E74035;padding:32px 24px;text-align:center;">
              <img src="https://www.fly2any.com/fly2any-logo-white.png" alt="Fly2Any" width="120" style="display:block;margin:0 auto 16px;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Don't Miss Your Flight!</h1>
              <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">Your booking is almost complete</p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 16px;font-size:18px;color:#111827;">Hi ${data.firstName},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#6b7280;line-height:1.6;">
                You were so close to booking your trip! We've saved your flight selection. Complete your booking now before prices change.
              </p>

              <!-- FLIGHT CARD -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="background:#f8fafc;padding:24px;text-align:center;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="40%" style="text-align:center;">
                          <p style="margin:0;font-size:32px;font-weight:800;color:#E74035;">${data.origin}</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${data.originCity}</p>
                        </td>
                        <td width="20%" style="text-align:center;">
                          <p style="margin:0;font-size:24px;">✈️</p>
                          ${data.airline ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${data.airline}</p>` : ''}
                        </td>
                        <td width="40%" style="text-align:center;">
                          <p style="margin:0;font-size:32px;font-weight:800;color:#E74035;">${data.destination}</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${data.destinationCity}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">📅 ${data.departureDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#ffffff;padding:20px;border-top:2px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">Your Price</p>
                    <p style="margin:4px 0 0;font-size:32px;font-weight:800;color:#10b981;">${data.currency} ${data.price.toLocaleString()}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Total including taxes</p>
                  </td>
                </tr>
              </table>

              ${data.expiresIn ? `
              <!-- COUNTDOWN -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#fef3c7;border:1px solid #fde68a;padding:16px;border-radius:8px;text-align:center;">
                    <p style="margin:0;font-size:14px;color:#92400e;"><strong>⚡ Price locked for ${data.expiresIn}</strong> - Complete your booking now!</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="${data.resumeUrl}" style="display:inline-block;padding:16px 48px;background:#E74035;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Complete Booking</a>
                  </td>
                </tr>
              </table>

              <!-- TRUST SIGNALS -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:12px;">
                    <p style="margin:0;font-size:20px;">🔒</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Secure Payment</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:12px;">
                    <p style="margin:0;font-size:20px;">💬</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">24/7 Support</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:12px;">
                    <p style="margin:0;font-size:20px;">✅</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Best Price Guarantee</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1e293b;padding:24px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#ffffff;">24/7 Support: ${SUPPORT_EMAIL}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
                <a href="https://www.fly2any.com/privacy" style="color:#94a3b8;">Privacy</a> |
                <a href="https://www.fly2any.com/terms" style="color:#94a3b8;">Terms</a> |
                <a href="https://www.fly2any.com/unsubscribe" style="color:#94a3b8;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Complete your ${data.origin} → ${data.destination} booking

Hi ${data.firstName},

You were so close to booking your trip! We've saved your flight selection.

Flight: ${data.origin} (${data.originCity}) → ${data.destination} (${data.destinationCity})
Date: ${data.departureDate}
${data.airline ? `Airline: ${data.airline}` : ''}
Price: ${data.currency} ${data.price.toLocaleString()}

Complete your booking: ${data.resumeUrl}

${data.expiresIn ? `Price locked for ${data.expiresIn} - book now!` : ''}

${COMPANY_NAME}
  `;

  return { subject, html, text };
}

export async function sendAbandonedBookingEmail(
  email: string,
  data: {
    firstName: string;
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
    departureDate: string;
    price: number;
    currency: string;
    airline?: string;
    resumeUrl: string;
    expiresIn?: string;
  }
): Promise<boolean> {
  try {
    const { subject, html, text } = getAbandonedBookingEmail(data);

    console.log('📧 Sending abandoned booking email via Mailgun...');
    console.log(`   To: ${email}`);
    console.log(`   Route: ${data.origin} → ${data.destination}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['abandoned', 'booking', 'recovery'],
    });

    if (result.success) {
      console.log('✅ Abandoned booking email sent successfully');
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending abandoned booking email:', error);
    return false; // Don't notify admin for marketing emails
  }
}

/**
 * Abandoned Search Email (Apple-Class Level 6)
 * Sent when user abandons search without booking
 */
function getAbandonedSearchEmail(data: {
  firstName: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  returnDate?: string;
  lowestPrice?: number;
  currency: string;
  searchUrl: string;
}) {
  const subject = `Still looking for ${data.origin} → ${data.destination} flights?`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">

          <!-- HEADER -->
          <tr>
            <td style="background:#E74035;padding:32px 24px;text-align:center;">
              <img src="https://www.fly2any.com/fly2any-logo-white.png" alt="Fly2Any" width="120" style="display:block;margin:0 auto 16px;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">We Found Great Deals!</h1>
              <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">For your recent search</p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 16px;font-size:18px;color:#111827;">Hi ${data.firstName},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#6b7280;line-height:1.6;">
                We noticed you were searching for flights. Great news - we've found some excellent deals for your route!
              </p>

              <!-- ROUTE CARD -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="background:#f8fafc;padding:24px;text-align:center;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="40%" style="text-align:center;">
                          <p style="margin:0;font-size:28px;font-weight:800;color:#E74035;">${data.origin}</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${data.originCity}</p>
                        </td>
                        <td width="20%" style="text-align:center;">
                          <p style="margin:0;font-size:24px;">${data.returnDate ? '↔️' : '✈️'}</p>
                          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${data.returnDate ? 'Round Trip' : 'One Way'}</p>
                        </td>
                        <td width="40%" style="text-align:center;">
                          <p style="margin:0;font-size:28px;font-weight:800;color:#E74035;">${data.destination}</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${data.destinationCity}</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                      <tr>
                        <td width="50%" style="text-align:center;padding:8px;">
                          <p style="margin:0;font-size:12px;color:#6b7280;">Departure</p>
                          <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#111827;">${data.departureDate}</p>
                        </td>
                        ${data.returnDate ? `
                        <td width="50%" style="text-align:center;padding:8px;border-left:1px solid #e5e7eb;">
                          <p style="margin:0;font-size:12px;color:#6b7280;">Return</p>
                          <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#111827;">${data.returnDate}</p>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                  </td>
                </tr>
                ${data.lowestPrice ? `
                <tr>
                  <td style="background:#d1fae5;padding:16px;text-align:center;border-top:2px solid #10b981;">
                    <p style="margin:0;font-size:14px;color:#065f46;">Prices starting from</p>
                    <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#059669;">${data.currency} ${data.lowestPrice.toLocaleString()}</p>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="${data.searchUrl}" style="display:inline-block;padding:16px 48px;background:#E74035;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">See All Flights</a>
                  </td>
                </tr>
              </table>

              <!-- TIP BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                <tr>
                  <td style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:4px;">
                    <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.5;">
                      <strong>💡 Pro Tip:</strong> Set up a price alert to get notified when prices drop for this route!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- SOCIAL PROOF -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                <tr>
                  <td style="background:#fef3c7;padding:12px;border-radius:8px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#92400e;">🔥 23 people booked this route today</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1e293b;padding:24px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#ffffff;">24/7 Support: ${SUPPORT_EMAIL}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
                <a href="https://www.fly2any.com/privacy" style="color:#94a3b8;">Privacy</a> |
                <a href="https://www.fly2any.com/terms" style="color:#94a3b8;">Terms</a> |
                <a href="https://www.fly2any.com/unsubscribe" style="color:#94a3b8;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Still looking for ${data.origin} → ${data.destination} flights?

Hi ${data.firstName},

We noticed you were searching for flights. Great news - we've found some excellent deals!

Route: ${data.origin} (${data.originCity}) → ${data.destination} (${data.destinationCity})
Departure: ${data.departureDate}
${data.returnDate ? `Return: ${data.returnDate}` : 'One Way'}
${data.lowestPrice ? `Prices from: ${data.currency} ${data.lowestPrice.toLocaleString()}` : ''}

Search again: ${data.searchUrl}

Tip: Set up a price alert to get notified when prices drop!

${COMPANY_NAME}
  `;

  return { subject, html, text };
}

export async function sendAbandonedSearchEmail(
  email: string,
  data: {
    firstName: string;
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
    departureDate: string;
    returnDate?: string;
    lowestPrice?: number;
    currency: string;
    searchUrl: string;
  }
): Promise<boolean> {
  try {
    const { subject, html, text } = getAbandonedSearchEmail(data);

    console.log('📧 Sending abandoned search email via Mailgun...');
    console.log(`   To: ${email}`);
    console.log(`   Route: ${data.origin} → ${data.destination}`);

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
      text,
      forceSend: true,
      tags: ['abandoned', 'search', 'recovery'],
    });

    if (result.success) {
      console.log('✅ Abandoned search email sent successfully');
      return true;
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('❌ Error sending abandoned search email:', error);
    return false;
  }
}

export const emailService = {
  sendPaymentInstructions: sendPaymentInstructionsEmail,
  sendCardPaymentProcessing: sendCardPaymentProcessingEmail, // FIX: Was missing - caused email failures
  sendBookingConfirmation: sendBookingConfirmationEmail,
  sendFlightConfirmation: sendBookingConfirmationEmail, // Alias for capture endpoint
  sendPriceAlert: sendPriceAlertEmail,
  sendTicketedConfirmation: sendTicketedConfirmationEmail,
  sendEmailVerification: sendEmailVerificationEmail,
  sendAbandonedBooking: sendAbandonedBookingEmail,
  sendAbandonedSearch: sendAbandonedSearchEmail,
  // Admin functions
  getEmailFailures,
  clearEmailFailures,
};
