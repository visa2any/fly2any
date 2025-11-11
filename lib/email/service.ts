/**
 * Email Service using Resend
 * Handles all transactional emails for the booking system
 */

import { Resend } from 'resend';
import type { Booking } from '@/lib/bookings/types';

// Initialize Resend with API key from environment variables (only if key exists)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@fly2any.com';
const COMPANY_NAME = 'Fly2Any';
const SUPPORT_EMAIL = 'support@fly2any.com';

/**
 * Email Templates
 */

/**
 * Payment Instructions Email
 * Sent after booking is created but before payment is confirmed
 */
function getPaymentInstructionsEmail(booking: Booking) {
  const subject = `Payment Instructions - Booking ${booking.bookingReference}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✈️ ${COMPANY_NAME}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your booking is almost complete!</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Payment Instructions</h2>

    <p>Dear ${booking.passengers[0].firstName},</p>

    <p>Thank you for choosing ${COMPANY_NAME}! Your booking has been created successfully.</p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 16px; color: #2563eb;">${booking.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Route:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Departure:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${new Date(booking.flight.segments[0].departure.at).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Passengers:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${booking.passengers.length}</td>
        </tr>
        <tr style="border-top: 2px solid #d1d5db;">
          <td style="padding: 12px 0;"><strong style="font-size: 18px;">Total Amount:</strong></td>
          <td style="padding: 12px 0; text-align: right; font-size: 20px; color: #059669; font-weight: bold;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #92400e;">⏳ Next Steps</h3>
      <p style="margin: 0; color: #78350f;">Please complete payment within 24 hours to confirm your booking. After payment verification, we'll send your flight confirmation and e-tickets.</p>
    </div>

    <h3 style="color: #1f2937;">Payment Methods</h3>

    <div style="margin: 20px 0;">
      <h4 style="color: #1f2937; margin-bottom: 10px;">💳 Credit Card Details:</h4>
      <p style="margin: 5px 0; color: #4b5563;">Card ending in: •••• ${booking.payment.cardLast4 || '****'}</p>
      <p style="margin: 5px 0; color: #4b5563; font-size: 14px;">We will process your payment manually and send confirmation within 2-4 business hours.</p>
    </div>

    <div style="margin: 20px 0;">
      <h4 style="color: #1f2937; margin-bottom: 10px;">🏦 Bank Transfer (Alternative):</h4>
      <div style="background: #f9fafb; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
        <p style="margin: 5px 0; font-size: 14px;"><strong>Bank Name:</strong> [Your Bank Name]</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Account Number:</strong> [Your Account Number]</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Routing Number:</strong> [Your Routing Number]</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>SWIFT/BIC:</strong> [Your SWIFT Code]</p>
        <p style="margin: 15px 0 5px 0; font-size: 14px;"><strong>Reference:</strong> <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px;">${booking.bookingReference}</span></p>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">⚠️ Please include your booking reference in the transfer description.</p>
    </div>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af;"><strong>💡 Tip:</strong> After making payment, you can email your receipt to <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb;">${SUPPORT_EMAIL}</a> for faster processing.</p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">If you have any questions, please contact our support team:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Support</a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
      This email was sent by ${COMPANY_NAME}<br>
      Booking Reference: ${booking.bookingReference}
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Payment Instructions - Booking ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Thank you for choosing ${COMPANY_NAME}! Your booking has been created successfully.

BOOKING DETAILS:
Booking Reference: ${booking.bookingReference}
Route: ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}
Departure: ${new Date(booking.flight.segments[0].departure.at).toLocaleDateString()}
Passengers: ${booking.passengers.length}
Total Amount: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

NEXT STEPS:
Please complete payment within 24 hours to confirm your booking. After payment verification, we'll send your flight confirmation and e-tickets.

If you have any questions, please contact: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
  `;

  return { subject, html, text };
}

/**
 * Booking Confirmation Email
 * Sent after payment is confirmed
 */
function getBookingConfirmationEmail(booking: Booking) {
  const subject = `✅ Booking Confirmed - ${booking.bookingReference}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✈️ ${COMPANY_NAME}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">✅ Your booking is confirmed!</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
      <h2 style="color: #065f46; margin: 0 0 10px 0;">🎉 Payment Received!</h2>
      <p style="color: #047857; margin: 0; font-size: 16px;">Your flight is now confirmed and ready for travel.</p>
    </div>

    <p>Dear ${booking.passengers[0].firstName},</p>

    <p>Great news! We have received your payment and your booking is now confirmed. Your e-tickets and itinerary are attached to this email.</p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Flight Details</h3>

      ${booking.flight.segments.map((segment, idx) => `
        <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin: 15px 0;">
          <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Flight ${idx + 1}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
            <div>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${segment.departure.iataCode}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${new Date(segment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div style="text-align: center; flex: 1; padding: 0 15px;">
              <p style="margin: 0; color: #9ca3af;">✈️</p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">${segment.carrierCode}${segment.flightNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${segment.arrival.iataCode}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${new Date(segment.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <p style="margin: 5px 0; font-size: 13px; color: #6b7280;">${new Date(segment.departure.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      `).join('')}

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border-top: 2px solid #d1d5db; padding-top: 15px;">
        <tr>
          <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 16px; color: #2563eb;">${booking.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Passengers:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Payment Status:</strong></td>
          <td style="padding: 8px 0; text-align: right;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">PAID</span></td>
        </tr>
      </table>
    </div>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #1e40af;">📋 Important Reminders</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #1e3a8a;">
        <li style="margin: 5px 0;">Check in online 24-48 hours before departure</li>
        <li style="margin: 5px 0;">Arrive at the airport at least 2 hours before departure</li>
        <li style="margin: 5px 0;">Bring a valid photo ID and passport (for international flights)</li>
        <li style="margin: 5px 0;">Your e-ticket reference: ${booking.bookingReference}</li>
      </ul>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px;">Need to make changes or have questions? Contact our support team:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Support</a>
    </div>

    <p style="color: #6b7280; font-size: 14px; text-align: center;">Have a great flight! ✈️</p>

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
      This email was sent by ${COMPANY_NAME}<br>
      Booking Reference: ${booking.bookingReference}
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Booking Confirmed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Great news! We have received your payment and your booking is now confirmed.

FLIGHT DETAILS:
${booking.flight.segments.map((seg, idx) => `
Flight ${idx + 1}:
${seg.departure.iataCode} → ${seg.arrival.iataCode}
${new Date(seg.departure.at).toLocaleString()} - ${new Date(seg.arrival.at).toLocaleString()}
${seg.carrierCode}${seg.flightNumber}
`).join('\n')}

BOOKING REFERENCE: ${booking.bookingReference}
PASSENGERS: ${booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
PAYMENT STATUS: PAID

IMPORTANT REMINDERS:
- Check in online 24-48 hours before departure
- Arrive at the airport at least 2 hours before departure
- Bring a valid photo ID and passport (for international flights)

Need help? Contact us at ${SUPPORT_EMAIL}

Have a great flight!
${COMPANY_NAME} Team
  `;

  return { subject, html, text };
}

/**
 * Email Service Functions
 */

export async function sendPaymentInstructionsEmail(booking: Booking): Promise<boolean> {
  try {
    const { subject, html, text } = getPaymentInstructionsEmail(booking);

    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email will be logged to console.');
      console.log('📧 Sending payment instructions email...');
      console.log(`   To: ${booking.contactInfo.email}`);
      console.log(`   Subject: ${subject}`);
      console.log('✅ Payment instructions email sent (logged to console)');
      return true; // Return true so booking creation continues
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ Payment instructions email sent successfully');
    console.log(`   To: ${booking.contactInfo.email}`);
    console.log(`   Email ID: ${result.data?.id}`);

    return true;
  } catch (error) {
    console.error('❌ Error sending payment instructions email:', error);
    return false;
  }
}

export async function sendBookingConfirmationEmail(booking: Booking): Promise<boolean> {
  try {
    const { subject, html, text } = getBookingConfirmationEmail(booking);

    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email will be logged to console.');
      console.log('📧 Sending booking confirmation email...');
      console.log(`   To: ${booking.contactInfo.email}`);
      console.log(`   Subject: ${subject}`);
      console.log('✅ Booking confirmation email sent (logged to console)');
      return true; // Return true so payment confirmation continues
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ Booking confirmation email sent successfully');
    console.log(`   To: ${booking.contactInfo.email}`);
    console.log(`   Email ID: ${result.data?.id}`);

    return true;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
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

    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email will be logged to console.');
      console.log('📧 Sending price alert email...');
      console.log(`   To: ${email}`);
      console.log(`   Subject: ${subject}`);
      console.log('✅ Price alert email sent (logged to console)');
      return true;
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
      text,
    });

    console.log('✅ Price alert email sent successfully');
    console.log(`   To: ${email}`);
    console.log(`   Email ID: ${result.data?.id}`);

    return true;
  } catch (error) {
    console.error('❌ Error sending price alert email:', error);
    return false;
  }
}

export const emailService = {
  sendPaymentInstructions: sendPaymentInstructionsEmail,
  sendBookingConfirmation: sendBookingConfirmationEmail,
  sendPriceAlert: sendPriceAlertEmail,
};
