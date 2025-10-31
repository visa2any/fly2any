/**
 * Notification Service
 * Handles all customer and admin notifications for booking events
 */

import { Resend } from 'resend';
import type { Booking } from '@/lib/bookings/types';
import type { DuffelOrder } from '@/lib/webhooks/event-handlers';

// Initialize Resend with API key from environment variables
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@fly2any.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fly2any.com';
const COMPANY_NAME = 'Fly2Any';
const SUPPORT_EMAIL = 'support@fly2any.com';

/**
 * Email Templates
 */

function getBaseEmailTemplate(title: string, content: string, accentColor: string = '#2563eb'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✈️ ${COMPANY_NAME}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    ${content}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <div style="text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Need help? Contact our support team:</p>
      <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; background: ${accentColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Support</a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
      This email was sent by ${COMPANY_NAME}<br>
      ${new Date().toLocaleDateString()}
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Order Created Email
 */
export async function sendOrderCreatedEmail(booking: Booking, order: DuffelOrder): Promise<boolean> {
  try {
    const subject = `Order Created - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #1f2937; margin-top: 0;">Order Created Successfully</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>Your flight order has been created successfully in our system. We're now processing your booking.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 16px; color: #2563eb;">${booking.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Duffel Order ID:</strong></td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 14px; color: #6b7280;">${order.id}</td>
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
        <p style="margin: 0; color: #78350f;"><strong>⏳ Next Steps:</strong> We'll send you a confirmation email once payment is processed.</p>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content);

    const text = `
Order Created - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Your flight order has been created successfully. We're now processing your booking.

Booking Reference: ${booking.bookingReference}
Route: ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}
Total: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

We'll send you a confirmation email once payment is processed.

Best regards,
${COMPANY_NAME} Team
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Order created email (console only):', booking.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Order created email sent:', booking.bookingReference);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending order created email:', error);
    return false;
  }
}

/**
 * Order Failed Email
 */
export async function sendOrderFailedEmail(booking: Booking, errorMessage: string): Promise<boolean> {
  try {
    const subject = `Order Creation Failed - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #dc2626; margin-top: 0;">⚠️ Order Creation Failed</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>We're sorry, but there was an issue creating your flight order.</p>

      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;"><strong>Error:</strong> ${errorMessage}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p>
      </div>

      <p>Our team has been notified and will investigate this issue. We'll contact you shortly to resolve this.</p>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;">💡 <strong>What happens next?</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
          <li>Our support team will review your booking</li>
          <li>We'll contact you within 24 hours</li>
          <li>No charges have been made to your payment method</li>
        </ul>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content, '#dc2626');

    const text = `
Order Creation Failed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

We're sorry, but there was an issue creating your flight order.

Error: ${errorMessage}

Booking Reference: ${booking.bookingReference}

Our team has been notified and will contact you shortly to resolve this.

Contact us: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Order failed email (console only):', booking.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Order failed email sent:', booking.bookingReference);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending order failed email:', error);
    return false;
  }
}

/**
 * Payment Success Email
 */
export async function sendPaymentSuccessEmail(booking: Booking): Promise<boolean> {
  try {
    const subject = `✅ Payment Confirmed - ${booking.bookingReference}`;

    const content = `
      <div style="background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #065f46; margin: 0 0 10px 0;">🎉 Payment Received!</h2>
        <p style="color: #047857; margin: 0; font-size: 16px;">Your flight is now confirmed and ready for travel.</p>
      </div>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>Great news! We have received your payment and your booking is now confirmed.</p>

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

      <p style="color: #6b7280; font-size: 14px; text-align: center;">Have a great flight! ✈️</p>
    `;

    const html = getBaseEmailTemplate(subject, content, '#10b981');

    const text = `
Payment Confirmed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Great news! We have received your payment and your booking is now confirmed.

Booking Reference: ${booking.bookingReference}
Payment Status: PAID

IMPORTANT REMINDERS:
- Check in online 24-48 hours before departure
- Arrive at the airport at least 2 hours before departure
- Bring a valid photo ID and passport (for international flights)

Have a great flight!
${COMPANY_NAME} Team
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Payment success email (console only):', booking.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Payment success email sent:', booking.bookingReference);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending payment success email:', error);
    return false;
  }
}

/**
 * Payment Failed Email
 */
export async function sendPaymentFailedEmail(booking: Booking, errorMessage: string): Promise<boolean> {
  try {
    const subject = `Payment Failed - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #dc2626; margin-top: 0;">❌ Payment Failed</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>We were unable to process your payment for booking ${booking.bookingReference}.</p>

      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${errorMessage}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p>
      </div>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #78350f;"><strong>⏰ Action Required:</strong> Please update your payment information within 24 hours to secure your booking.</p>
      </div>

      <p>You can retry your payment or contact our support team for assistance.</p>
    `;

    const html = getBaseEmailTemplate(subject, content, '#dc2626');

    const text = `
Payment Failed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

We were unable to process your payment for booking ${booking.bookingReference}.

Reason: ${errorMessage}
Amount: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

Please update your payment information within 24 hours to secure your booking.

Contact us: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Payment failed email (console only):', booking.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Payment failed email sent:', booking.bookingReference);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending payment failed email:', error);
    return false;
  }
}

/**
 * Schedule Change Email
 */
export async function sendScheduleChangeEmail(
  booking: Booking,
  changeDetails: {
    changeType: string;
    description: string;
    detectedAt: string;
    newDetails?: any[];
  }
): Promise<boolean> {
  try {
    const subject = `⚠️ Flight Schedule Change - ${booking.bookingReference}`;

    const content = `
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Schedule Change Detected</h2>
        <p style="color: #78350f; margin: 0; font-size: 16px;">The airline has made changes to your flight.</p>
      </div>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>We've detected a change to your flight schedule. The airline has notified us of the following update:</p>

      <div style="background: #fef2f2; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e;"><strong>Change Type:</strong> ${changeDetails.changeType}</p>
        <p style="margin: 10px 0 0 0; color: #78350f;">${changeDetails.description}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Your Booking</h3>
        <p style="margin: 5px 0;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p style="margin: 5px 0;"><strong>Route:</strong> ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}</p>
        <p style="margin: 5px 0;"><strong>Original Departure:</strong> ${new Date(booking.flight.segments[0].departure.at).toLocaleString()}</p>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;"><strong>📞 What should I do?</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
          <li style="margin: 5px 0;">Our team is reviewing this change</li>
          <li style="margin: 5px 0;">We'll contact you within 2 hours with options</li>
          <li style="margin: 5px 0;">You may be eligible for a refund or rebooking</li>
          <li style="margin: 5px 0;">Contact us immediately if you have urgent concerns</li>
        </ul>
      </div>

      <p>We apologize for any inconvenience and will do our best to help you find a suitable solution.</p>
    `;

    const html = getBaseEmailTemplate(subject, content, '#f59e0b');

    const text = `
Flight Schedule Change - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

The airline has made changes to your flight schedule.

Change Type: ${changeDetails.changeType}
Description: ${changeDetails.description}

Booking Reference: ${booking.bookingReference}
Route: ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}

Our team is reviewing this change and will contact you within 2 hours with options.

Contact us immediately if you have urgent concerns: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Schedule change email (console only):', booking.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Schedule change email sent:', booking.bookingReference);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending schedule change email:', error);
    return false;
  }
}

/**
 * Cancellation Confirmed Email
 */
export async function sendCancellationConfirmedEmail(
  booking: Booking,
  refundDetails: {
    refundAmount: number;
    refundCurrency: string;
    refundMethod: string;
    confirmedAt: string;
  }
): Promise<boolean> {
  try {
    const subject = `Cancellation Confirmed - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #1f2937; margin-top: 0;">Cancellation Confirmed</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>Your booking cancellation has been confirmed.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Cancellation Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${booking.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Original Amount:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Refund Amount:</strong></td>
            <td style="padding: 8px 0; text-align: right; color: #059669; font-weight: bold;">${refundDetails.refundCurrency} ${refundDetails.refundAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Refund Method:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${refundDetails.refundMethod.replace('_', ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Confirmed At:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${new Date(refundDetails.confirmedAt).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;"><strong>💳 Refund Timeline:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
          <li style="margin: 5px 0;">Card refunds: 5-10 business days</li>
          <li style="margin: 5px 0;">Bank transfers: 3-7 business days</li>
          <li style="margin: 5px 0;">The exact timing depends on your bank/card issuer</li>
        </ul>
      </div>

      <p>We're sorry to see you go. If you have any questions about your cancellation or refund, please don't hesitate to contact us.</p>
    `;

    const html = getBaseEmailTemplate(subject, content);

    const text = `
Cancellation Confirmed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Your booking cancellation has been confirmed.

Booking Reference: ${booking.bookingReference}
Original Amount: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}
Refund Amount: ${refundDetails.refundCurrency} ${refundDetails.refundAmount.toFixed(2)}
Refund Method: ${refundDetails.refundMethod}

REFUND TIMELINE:
- Card refunds: 5-10 business days
- Bank transfers: 3-7 business days

If you have any questions, contact us: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Cancellation confirmed email (console only):', booking.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contactInfo.email,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Cancellation confirmed email sent:', booking.bookingReference);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending cancellation email:', error);
    return false;
  }
}

/**
 * Admin Alert
 */
export async function sendAdminAlert(alert: {
  type: string;
  bookingReference?: string;
  error?: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high';
  [key: string]: any;
}): Promise<boolean> {
  try {
    const priorityColors = {
      low: '#3b82f6',
      normal: '#f59e0b',
      high: '#dc2626',
    };

    const color = priorityColors[alert.priority || 'normal'];
    const subject = `[${alert.priority?.toUpperCase() || 'ALERT'}] ${alert.type.replace(/_/g, ' ').toUpperCase()}`;

    const content = `
      <h2 style="color: ${color}; margin-top: 0;">Admin Alert: ${alert.type.replace(/_/g, ' ')}</h2>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Alert Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(alert).map(([key, value]) => `
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>${key.replace(/_/g, ' ')}:</strong></td>
              <td style="padding: 8px 0; text-align: right; vertical-align: top;">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div style="background: #fef2f2; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;"><strong>⚠️ This alert requires immediate attention.</strong></p>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content, color);

    const text = `
Admin Alert: ${alert.type.replace(/_/g, ' ')}

${Object.entries(alert).map(([key, value]) => `${key}: ${value}`).join('\n')}

This alert requires immediate attention.

${COMPANY_NAME} Admin System
    `;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 [Notification] Admin alert (console only):', alert.type, alert.bookingReference);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
      text,
    });

    console.log('✅ [Notification] Admin alert sent:', alert.type);
    return true;
  } catch (error) {
    console.error('❌ [Notification] Error sending admin alert:', error);
    return false;
  }
}

export const notificationService = {
  sendOrderCreatedEmail,
  sendOrderFailedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendScheduleChangeEmail,
  sendCancellationConfirmedEmail,
  sendAdminAlert,
};
