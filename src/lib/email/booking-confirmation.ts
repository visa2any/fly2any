/**
 * 📧 BOOKING CONFIRMATION EMAIL SYSTEM
 * Sends professional booking confirmation emails
 */

import { generateCalendarEvent } from '@/lib/flights/booking-utils';
import { emailService } from './email-service';

interface BookingConfirmationData {
  email: string;
  bookingReference: string;
  passengerInfo: any;
  flightDetails: any;
  services: any;
  totalPrice: number;
  paymentIntentId: string;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(data: BookingConfirmationData): Promise<boolean> {
  try {
    console.log('📧 Preparing booking confirmation email for:', data.email);

    // Use the new email service with templates
    const result = await emailService.sendTemplatedEmail(
      'booking-confirmation',
      data.email,
      {
        bookingReference: data.bookingReference,
        passengerName: `${data.passengerInfo.firstName} ${data.passengerInfo.lastName}`,
        passengerEmail: data.email,
        flightDetails: data.flightDetails,
        totalPrice: data.totalPrice,
        currency: 'USD',
        bookingDate: new Date().toISOString(),
        nextSteps: [
          '📧 Check your email for the e-ticket attachment',
          '📱 Download the airline app for mobile check-in',
          '🧳 Review baggage allowances and restrictions',
          '⏰ Arrive at the airport 2-3 hours early'
        ]
      }
    );

    console.log(result.success ? '✅ Booking confirmation sent' : '❌ Email sending failed:', result.error);
    return result.success;

  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(data: BookingConfirmationData): string {
  const servicesList = [];
  if (data.services.seatSelection) servicesList.push('Seat Selection (+$25)');
  if (data.services.meals) servicesList.push('Special Meal (Free)');
  if (data.services.baggage) servicesList.push('Extra Baggage (+$50)');
  if (data.services.insurance) servicesList.push('Travel Insurance (+$35)');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight Booking Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #E5E7EB; }
            .booking-ref { background: #F3F4F6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .flight-details { background: #EFF6FF; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .services { background: #F0FDF4; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .total { background: #FEF3C7; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; }
            .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6B7280; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
            .important { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✈️ Flight Booking Confirmed!</h1>
            <p>Your journey begins here</p>
        </div>
        
        <div class="content">
            <div class="booking-ref">
                <h2>Booking Reference</h2>
                <div style="font-size: 24px; font-weight: bold; color: #3B82F6; font-family: monospace;">
                    ${data.bookingReference}
                </div>
                <p style="color: #6B7280; font-size: 14px;">Please save this reference number</p>
            </div>

            <h3>👤 Passenger Information</h3>
            <p><strong>Name:</strong> ${data.passengerInfo.firstName} ${data.passengerInfo.lastName}</p>
            <p><strong>Email:</strong> ${data.passengerInfo.email}</p>
            <p><strong>Phone:</strong> ${data.passengerInfo.phone}</p>

            <div class="flight-details">
                <h3>🛫 Flight Details</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <strong>${data.flightDetails.outbound.departure.iataCode}</strong>
                        <div style="font-size: 14px; color: #6B7280;">${data.flightDetails.outbound.departure.time}</div>
                        <div style="font-size: 12px; color: #9CA3AF;">${data.flightDetails.outbound.departure.date}</div>
                    </div>
                    <div style="text-align: center; color: #3B82F6;">
                        <div>✈️</div>
                        <div style="font-size: 12px;">${data.flightDetails.outbound.duration}</div>
                    </div>
                    <div style="text-align: right;">
                        <strong>${data.flightDetails.outbound.arrival.iataCode}</strong>
                        <div style="font-size: 14px; color: #6B7280;">${data.flightDetails.outbound.arrival.time}</div>
                        <div style="font-size: 12px; color: #9CA3AF;">${data.flightDetails.outbound.arrival.date}</div>
                    </div>
                </div>
                ${data.flightDetails.inbound ? `
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${data.flightDetails.inbound.departure.iataCode}</strong>
                        <div style="font-size: 14px; color: #6B7280;">${data.flightDetails.inbound.departure.time}</div>
                        <div style="font-size: 12px; color: #9CA3AF;">${data.flightDetails.inbound.departure.date}</div>
                    </div>
                    <div style="text-align: center; color: #3B82F6;">
                        <div>✈️</div>
                        <div style="font-size: 12px;">${data.flightDetails.inbound.duration}</div>
                    </div>
                    <div style="text-align: right;">
                        <strong>${data.flightDetails.inbound.arrival.iataCode}</strong>
                        <div style="font-size: 14px; color: #6B7280;">${data.flightDetails.inbound.arrival.time}</div>
                        <div style="font-size: 12px; color: #9CA3AF;">${data.flightDetails.inbound.arrival.date}</div>
                    </div>
                </div>
                ` : ''}
            </div>

            ${servicesList.length > 0 ? `
            <div class="services">
                <h3>🎯 Selected Services</h3>
                <ul>
                    ${servicesList.map(service => `<li>${service}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="total">
                💰 Total Paid: $${data.totalPrice.toFixed(2)} USD
            </div>

            <div class="important">
                <h4>📋 Important Information</h4>
                <ul>
                    <li>Arrive at the airport at least 2 hours before domestic flights (3 hours for international)</li>
                    <li>Bring a valid government-issued photo ID</li>
                    <li>Check baggage restrictions with your airline</li>
                    <li>Download the airline's mobile app for real-time updates</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://fly2any.com/account/bookings" class="button">Manage Booking</a>
                <a href="https://fly2any.com/support" class="button" style="background: #6B7280;">Get Support</a>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing Fly2Any!</p>
            <p style="font-size: 12px;">
                This is an automated message. Please do not reply to this email.<br>
                For support, visit <a href="https://fly2any.com/support">fly2any.com/support</a>
            </p>
            <p style="font-size: 10px; color: #9CA3AF;">
                Payment ID: ${data.paymentIntentId}
            </p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email content
 */
function generateEmailText(data: BookingConfirmationData): string {
  return `
Flight Booking Confirmation - ${data.bookingReference}

Dear ${data.passengerInfo.firstName} ${data.passengerInfo.lastName},

Your flight booking has been confirmed! Here are your travel details:

BOOKING REFERENCE: ${data.bookingReference}

PASSENGER INFORMATION:
Name: ${data.passengerInfo.firstName} ${data.passengerInfo.lastName}
Email: ${data.passengerInfo.email}
Phone: ${data.passengerInfo.phone}

FLIGHT DETAILS:
${data.flightDetails.outbound.departure.iataCode} → ${data.flightDetails.outbound.arrival.iataCode}
Departure: ${data.flightDetails.outbound.departure.time} on ${data.flightDetails.outbound.departure.date}
Arrival: ${data.flightDetails.outbound.arrival.time} on ${data.flightDetails.outbound.arrival.date}
Duration: ${data.flightDetails.outbound.duration}

TOTAL PAID: $${data.totalPrice.toFixed(2)} USD

IMPORTANT REMINDERS:
- Arrive at the airport at least 2 hours before domestic flights (3 hours for international)
- Bring a valid government-issued photo ID
- Check baggage restrictions with your airline
- Download the airline's mobile app for real-time updates

Manage your booking: https://fly2any.com/account/bookings
Get support: https://fly2any.com/support

Thank you for choosing Fly2Any!

Payment ID: ${data.paymentIntentId}
  `.trim();
}

/**
 * Send email using email provider (placeholder implementation)
 */
async function sendWithEmailProvider(emailData: any): Promise<{ success: boolean }> {
  // This is where you would integrate with your email provider
  // Examples: SendGrid, Mailgun, AWS SES, etc.
  
  try {
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);
    
    // Example with Mailgun:
    // const mailgun = require('mailgun-js')({
    //   apiKey: process.env.MAILGUN_API_KEY,
    //   domain: process.env.MAILGUN_DOMAIN
    // });
    // await mailgun.messages().send(emailData);
    
    console.log('📧 Email sent successfully (placeholder)');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Email provider error:', error);
    return { success: false };
  }
}

/**
 * Send booking modification email
 */
export async function sendBookingModificationEmail(data: any): Promise<boolean> {
  // Implementation for booking changes/modifications
  console.log('📧 Booking modification email requested');
  return true;
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationConfirmationEmail(data: {
  email: string;
  bookingReference: string;
  passengerInfo: any;
  flightDetails: any;
  cancellationPolicy: any;
  refundAmount: number;
  refundId?: string;
}): Promise<boolean> {
  try {
    console.log('📧 Preparing cancellation confirmation email for:', data.email);

    const result = await emailService.sendTemplatedEmail(
      'cancellation-confirmation',
      data.email,
      {
        bookingReference: data.bookingReference,
        passengerName: `${data.passengerInfo.firstName} ${data.passengerInfo.lastName}`,
        passengerEmail: data.email,
        flightDetails: data.flightDetails,
        originalAmount: data.refundAmount + (data.cancellationPolicy.cancellationFee || 0),
        refundAmount: data.refundAmount,
        currency: 'USD',
        cancellationDate: new Date().toISOString(),
        refundId: data.refundId,
        cancellationPolicy: data.cancellationPolicy.policy || 'Standard cancellation terms apply'
      }
    );

    console.log(result.success ? '✅ Cancellation confirmation sent' : '❌ Email sending failed:', result.error);
    return result.success;

  } catch (error) {
    console.error('❌ Cancellation email error:', error);
    return false;
  }
}