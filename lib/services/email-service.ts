/**
 * ENTERPRISE EMAIL SERVICE
 *
 * Production-grade email service using Mailgun
 * Features:
 * - Mailgun API integration via unified client
 * - Beautiful HTML email templates
 * - Booking confirmations, price alerts, newsletters
 * - Error handling with retry logic
 * - Development mode console logging
 *
 * @version 2.1.0
 * @author Fly2Any Engineering
 */

import { mailgunClient, MAILGUN_CONFIG } from '@/lib/email/mailgun-client';

// ===================================
// TYPES & INTERFACES
// ===================================

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
}

interface FlightBookingEmailData {
  userName: string;
  bookingReference: string;
  flightNumber: string;
  airline: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  passengers: number;
  cabinClass: string;
  totalPrice: number;
  currency: string;
  bookingUrl: string;
}

interface HotelBookingEmailData {
  userName: string;
  bookingReference: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  guests: number;
  totalPrice: number;
  currency: string;
  bookingUrl: string;
}

interface PriceAlertEmailData {
  userName: string;
  origin: string;
  destination: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  savings: number;
  savingsPercent: number;
  searchUrl: string;
  expiresAt?: string;
}

interface NewsletterSignupData {
  email: string;
  firstName?: string;
}

interface TripBookingEmailData {
  userName: string;
  tripTitle: string;
  tripDestination: string;
  tripDate: string;
  amount: number;
  tripUrl: string;
}

interface CreditEarnedEmailData {
  userName: string;
  creditsEarned: number;
  usdValue: number;
  tripTitle: string;
  dashboardUrl: string;
}

interface WelcomeEmailData {
  userName: string;
  welcomeCredits: number;
  browseUrl: string;
  createUrl: string;
}

interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

// ===================================
// EMAIL SERVICE CLASS
// ===================================

export class EmailService {
  // Configuration (use centralized mailgun config)
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  /**
   * Send email via unified Mailgun client
   * Now supports forceSend for testing in any environment
   */
  private static async sendEmail(options: EmailOptions & { forceSend?: boolean }): Promise<boolean> {
    const result = await mailgunClient.send({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from: options.from || MAILGUN_CONFIG.fromEmail,
      replyTo: options.replyTo,
      tags: options.tags,
      forceSend: options.forceSend ?? true, // Default to forceSend for test emails
    });

    if (!result.success) {
      console.error('❌ [EMAIL] Send failed:', result.error);
    } else if (result.simulated) {
      console.log('📧 [EMAIL] Simulated (dev mode):', options.subject);
    } else {
      console.log('✅ [EMAIL] Sent successfully:', result.messageId);
    }

    return result.success;
  }

  // ===================================
  // EMAIL TEMPLATE STYLES
  // ===================================

  private static getBaseStyles(): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }

        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
          color: white;
          padding: 32px 24px;
          text-align: center;
        }

        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .header p {
          margin: 8px 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .content {
          padding: 32px 24px;
        }

        .content h2 {
          margin: 0 0 16px;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .content p {
          margin: 0 0 16px;
          color: #4b5563;
        }

        .card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          background: #dbeafe;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #6b7280;
          font-size: 14px;
        }

        .detail-value {
          color: #111827;
          font-weight: 500;
          font-size: 14px;
        }

        .price-highlight {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }

        .price-highlight .amount {
          font-size: 32px;
          font-weight: 700;
        }

        .price-highlight .label {
          font-size: 14px;
          opacity: 0.9;
        }

        .btn {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          transition: transform 0.2s;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151 !important;
          border: 1px solid #d1d5db;
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .btn-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .footer {
          background: #f9fafb;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }

        .footer p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .footer a {
          color: #2563eb;
          text-decoration: none;
        }

        .social-links {
          margin: 16px 0;
        }

        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #6b7280;
          font-size: 20px;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 24px 0;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .alert-success {
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .alert-warning {
          background: #fef3c7;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .alert-info {
          background: #dbeafe;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }
      </style>
    `;
  }

  private static getLogoHtml(): string {
    return `<img src="${this.baseUrl}/fly2any-logo-white.png" alt="Fly2Any" style="height: 32px; width: auto;" />`;
  }

  private static getFooterHtml(): string {
    return `
      <div class="footer">
        <img src="${this.baseUrl}/fly2any-logo.png" alt="Fly2Any" style="height: 24px; width: auto; margin-bottom: 12px;" />
        <p style="margin-bottom: 8px;">
          <a href="${this.baseUrl}/help">Help Center</a> &bull;
          <a href="${this.baseUrl}/privacy">Privacy</a> &bull;
          <a href="${this.baseUrl}/terms">Terms</a> &bull;
          <a href="${this.baseUrl}/contact">Contact</a>
        </p>
        <p>&copy; ${new Date().getFullYear()} Fly2Any Travel. All rights reserved.</p>
        <p style="margin-top: 8px; font-size: 11px; color: #9ca3af;">
          24/7 Support: 1-332-220-0838
        </p>
      </div>
    `;
  }

  // ===================================
  // PUBLIC EMAIL METHODS
  // ===================================

  /**
   * Send flight booking confirmation
   */
  static async sendFlightBookingConfirmation(
    email: string,
    data: FlightBookingEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">Booking Confirmed!</h1>
        <p>Reference: ${data.bookingReference}</p>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p>Great news! Your flight has been confirmed. Here are your booking details:</p>

        <div class="card">
          <div class="card-header">
            <div class="card-icon">✈️</div>
            <div>
              <strong style="font-size: 18px;">${data.airline}</strong>
              <span class="badge badge-info" style="margin-left: 8px;">${data.flightNumber}</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: 700;">${data.origin}</div>
              <div style="font-size: 12px; color: #6b7280;">${data.originCity}</div>
              <div style="font-size: 14px; font-weight: 500; margin-top: 4px;">${data.departureTime}</div>
            </div>
            <div style="flex: 1; padding: 0 16px; text-align: center;">
              <div style="border-top: 2px dashed #d1d5db; position: relative;">
                <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #f9fafb; padding: 0 8px;">→</span>
              </div>
              <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">${data.cabinClass}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: 700;">${data.destination}</div>
              <div style="font-size: 12px; color: #6b7280;">${data.destinationCity}</div>
              <div style="font-size: 14px; font-weight: 500; margin-top: 4px;">${data.arrivalTime}</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${data.departureDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Passengers</span>
            <span class="detail-value">${data.passengers} ${data.passengers > 1 ? 'travelers' : 'traveler'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Cabin Class</span>
            <span class="detail-value">${data.cabinClass}</span>
          </div>
        </div>

        <div class="price-highlight">
          <div class="label">Total Paid</div>
          <div class="amount">${data.currency} ${data.totalPrice.toLocaleString()}</div>
        </div>

        <div class="alert alert-info">
          <strong>What's Next?</strong>
          <p style="margin: 8px 0 0;">Check in online 24 hours before departure. Your e-ticket and boarding pass will be sent separately.</p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.bookingUrl}" class="btn">View Booking Details</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `✈️ Booking Confirmed: ${data.originCity} → ${data.destinationCity} | ${data.bookingReference}`,
      html,
      tags: ['booking', 'flight', 'confirmation'],
    });
  }

  /**
   * Send hotel booking confirmation
   */
  static async sendHotelBookingConfirmation(
    email: string,
    data: HotelBookingEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">Hotel Booking Confirmed!</h1>
        <p>Reference: ${data.bookingReference}</p>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p>Your hotel reservation is confirmed. Here are your booking details:</p>

        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background: #ede9fe;">🏨</div>
            <div>
              <strong style="font-size: 18px;">${data.hotelName}</strong>
              <div style="font-size: 13px; color: #6b7280;">${data.location}</div>
            </div>
          </div>

          <div class="detail-row">
            <span class="detail-label">Check-in</span>
            <span class="detail-value">${data.checkIn}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Check-out</span>
            <span class="detail-value">${data.checkOut}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration</span>
            <span class="detail-value">${data.nights} ${data.nights > 1 ? 'nights' : 'night'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Room Type</span>
            <span class="detail-value">${data.roomType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Guests</span>
            <span class="detail-value">${data.guests} ${data.guests > 1 ? 'guests' : 'guest'}</span>
          </div>
        </div>

        <div class="price-highlight" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);">
          <div class="label">Total Paid</div>
          <div class="amount">${data.currency} ${data.totalPrice.toLocaleString()}</div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.bookingUrl}" class="btn" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);">View Booking</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `🏨 Hotel Confirmed: ${data.hotelName} | ${data.bookingReference}`,
      html,
      tags: ['booking', 'hotel', 'confirmation'],
    });
  }

  /**
   * Send price drop alert
   */
  static async sendPriceAlert(
    email: string,
    data: PriceAlertEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">Price Drop Alert!</h1>
        <p>Save ${data.savingsPercent}% on your watched flight</p>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p>Great news! The price for your tracked route has dropped significantly:</p>

        <div class="card" style="text-align: center;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">
            ${data.origin} → ${data.destination}
          </div>

          <div style="display: flex; justify-content: center; align-items: center; gap: 24px; margin: 20px 0;">
            <div>
              <div style="font-size: 14px; color: #6b7280; text-decoration: line-through;">${data.currency} ${data.oldPrice}</div>
              <div style="font-size: 12px; color: #9ca3af;">Previous</div>
            </div>
            <div style="font-size: 24px;">→</div>
            <div>
              <div style="font-size: 32px; font-weight: 700; color: #059669;">${data.currency} ${data.newPrice}</div>
              <div style="font-size: 12px; color: #059669;">New Price</div>
            </div>
          </div>

          <div class="badge badge-success" style="font-size: 14px; padding: 8px 16px;">
            You save ${data.currency} ${data.savings} (${data.savingsPercent}%)
          </div>
        </div>

        ${data.expiresAt ? `
        <div class="alert alert-warning">
          <strong>⏰ Act Fast!</strong>
          <p style="margin: 8px 0 0;">This price is only guaranteed until ${data.expiresAt}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.searchUrl}" class="btn btn-success">Book Now & Save</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `🔔 Price Drop: ${data.origin} → ${data.destination} - Save ${data.savingsPercent}%!`,
      html,
      tags: ['price-alert', 'deal'],
    });
  }

  /**
   * Send welcome email with bonus credits
   */
  static async sendWelcomeEmail(
    email: string,
    data: WelcomeEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">Welcome to Fly2Any!</h1>
        <p>Your journey starts here</p>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p>Welcome to the future of travel! We're thrilled to have you join our community of smart travelers.</p>

        <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: none;">
          <div style="text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">🎁</div>
            <div style="font-size: 14px; color: #92400e;">Welcome Bonus</div>
            <div style="font-size: 36px; font-weight: 700; color: #92400e;">${data.welcomeCredits} Credits</div>
            <div style="font-size: 14px; color: #b45309;">Worth $${(data.welcomeCredits / 10).toFixed(2)} towards your first booking</div>
          </div>
        </div>

        <h3 style="margin-top: 24px;">What makes Fly2Any special?</h3>
        <ul style="padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;"><strong>AI-Powered Search:</strong> Find the best deals in seconds</li>
          <li style="margin-bottom: 8px;"><strong>Price Predictions:</strong> Know when to book for maximum savings</li>
          <li style="margin-bottom: 8px;"><strong>500+ Airlines:</strong> Compare flights from every major carrier</li>
          <li style="margin-bottom: 8px;"><strong>24/7 Support:</strong> We're here whenever you need us</li>
        </ul>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.browseUrl}" class="btn" style="margin: 4px;">Search Flights</a>
          <a href="${data.createUrl}" class="btn btn-secondary" style="margin: 4px;">Create Trip</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to Fly2Any! 🎁 Here's ${data.welcomeCredits} credits to get started`,
      html,
      tags: ['welcome', 'onboarding'],
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    data: PasswordResetEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header" style="background: linear-gradient(135deg, #6b7280 0%, #374151 100%);">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">Reset Your Password</h1>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.resetUrl}" class="btn">Reset Password</a>
        </div>

        <div class="alert alert-warning">
          <strong>⏰ Link expires in ${data.expiresIn}</strong>
          <p style="margin: 8px 0 0;">If you didn't request this reset, you can safely ignore this email.</p>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${data.resetUrl}" style="color: #2563eb; word-break: break-all;">${data.resetUrl}</a>
        </p>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Reset your Fly2Any password`,
      html,
      tags: ['security', 'password-reset'],
    });
  }

  /**
   * Send trip booking confirmation (TripMatch)
   */
  static async sendTripBookingConfirmation(
    email: string,
    data: TripBookingEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">Trip Confirmed!</h1>
        <p>Get ready for an amazing adventure</p>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p><strong>Your trip booking has been confirmed!</strong></p>

        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background: #ede9fe;">🌍</div>
            <div>
              <strong style="font-size: 18px;">${data.tripTitle}</strong>
            </div>
          </div>

          <div class="detail-row">
            <span class="detail-label">Destination</span>
            <span class="detail-value">${data.tripDestination}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${data.tripDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid</span>
            <span class="detail-value">$${(data.amount / 100).toFixed(2)}</span>
          </div>
        </div>

        <p>You'll receive more details about your trip closer to the departure date.</p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.tripUrl}" class="btn" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">View Trip Details</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `✅ Trip Confirmed: ${data.tripTitle}`,
      html,
      tags: ['tripmatch', 'booking'],
    });
  }

  /**
   * Send credits earned notification
   */
  static async sendCreditsEarned(
    email: string,
    data: CreditEarnedEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">You Earned Credits!</h1>
        <p>Someone joined your trip</p>
      </div>

      <div class="content">
        <p>Hi ${data.userName},</p>
        <p><strong>Great news!</strong> Someone joined your trip and you've earned rewards:</p>

        <div class="price-highlight" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
          <div class="amount">${data.creditsEarned}</div>
          <div class="label">Credits Earned (Worth $${data.usdValue.toFixed(2)})</div>
        </div>

        <div class="card">
          <div class="detail-row">
            <span class="detail-label">Trip</span>
            <span class="detail-value">${data.tripTitle}</span>
          </div>
        </div>

        <p>Use your credits towards your next booking or save them to unlock higher tiers!</p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.dashboardUrl}" class="btn btn-warning">View Dashboard</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `🎉 You earned ${data.creditsEarned} credits ($${data.usdValue.toFixed(2)})!`,
      html,
      tags: ['tripmatch', 'credits'],
    });
  }

  /**
   * Send newsletter subscription confirmation
   */
  static async sendNewsletterConfirmation(
    email: string,
    data: NewsletterSignupData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${this.getBaseStyles()}
</head>
<body>
  <div style="padding: 20px; background: #f3f4f6;">
    <div class="email-container">
      <div class="header">
        ${this.getLogoHtml()}
        <h1 style="margin-top: 16px;">You're Subscribed!</h1>
        <p>Welcome to the Fly2Any family</p>
      </div>

      <div class="content">
        <p>Hi${data.firstName ? ` ${data.firstName}` : ''},</p>
        <p>Thanks for subscribing to our newsletter! You'll be the first to know about:</p>

        <ul style="padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">🔥 Exclusive flash deals and error fares</li>
          <li style="margin-bottom: 8px;">✈️ New route announcements</li>
          <li style="margin-bottom: 8px;">💡 Travel tips and destination guides</li>
          <li style="margin-bottom: 8px;">🎁 Special subscriber-only promotions</li>
        </ul>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${this.baseUrl}/deals" class="btn">Browse Today's Deals</a>
        </div>
      </div>

      ${this.getFooterHtml()}
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `✅ You're subscribed to Fly2Any deals & updates`,
      html,
      tags: ['newsletter', 'subscription'],
    });
  }

  /**
   * Send generic email (for custom use cases)
   */
  static async send(options: EmailOptions): Promise<boolean> {
    return this.sendEmail(options);
  }
}
