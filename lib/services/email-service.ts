/**
 * FLY2ANY STATE-OF-THE-ART EMAIL SERVICE
 *
 * Premium email templates with:
 * - 100% INLINE STYLES (email-client compatible)
 * - TABLE-BASED LAYOUTS (works in all email clients)
 * - Fly2Any branded design matching FlightCard/HotelCard styles
 * - Marketing cross-sell sections for conversion
 * - Mobile responsive (using max-width tables)
 *
 * @version 4.0.0
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
  airlineLogo?: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  arrivalDate?: string;
  passengers: number;
  cabinClass: string;
  totalPrice: number;
  currency: string;
  bookingUrl: string;
  duration?: string;
  stops?: number;
  aircraft?: string;
  terminal?: string;
  baggageIncluded?: number;
  seatSelection?: boolean;
}

interface HotelBookingEmailData {
  userName: string;
  bookingReference: string;
  hotelName: string;
  hotelImage?: string;
  starRating?: number;
  location: string;
  address?: string;
  checkIn: string;
  checkInTime?: string;
  checkOut: string;
  checkOutTime?: string;
  nights: number;
  roomType: string;
  guests: number;
  totalPrice: number;
  currency: string;
  bookingUrl: string;
  amenities?: string[];
  cancellationPolicy?: string;
  confirmationNumber?: string;
}

interface PriceAlertEmailData {
  userName: string;
  origin: string;
  originCity?: string;
  destination: string;
  destinationCity?: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  savings: number;
  savingsPercent: number;
  searchUrl: string;
  expiresAt?: string;
  airline?: string;
  departureDate?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  historicalLow?: number;
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
  tripImage?: string;
  amount: number;
  tripUrl: string;
  organizerName?: string;
  spotsLeft?: number;
}

interface CreditEarnedEmailData {
  userName: string;
  creditsEarned: number;
  usdValue: number;
  tripTitle: string;
  dashboardUrl: string;
  totalCredits?: number;
  tierStatus?: string;
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
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  /**
   * Send email via unified Mailgun client
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
      forceSend: options.forceSend ?? true,
    });

    if (!result.success) {
      console.error('[EMAIL] Send failed:', result.error);
    } else if (result.simulated) {
      console.log('[EMAIL] Simulated (dev mode):', options.subject);
    } else {
      console.log('[EMAIL] Sent successfully:', result.messageId);
    }

    return result.success;
  }

  // ===================================
  // EMAIL TEMPLATE COMPONENTS (INLINE STYLES)
  // ===================================

  private static getEmailWrapper(content: string, bgColor: string = '#1e40af'): string {
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Fly2Any</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f4f6;">
    <!-- WRAPPER TABLE -->
    <table role="presentation" style="width:100%;border:none;border-spacing:0;background:linear-gradient(180deg,${bgColor} 0%,${bgColor} 300px,#f3f4f6 300px);">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <!-- CONTAINER -->
          <table role="presentation" style="width:100%;max-width:600px;border:none;border-spacing:0;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
            ${content}
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
  }

  private static getHeader(title: string, subtitle: string, refBadge?: string, bgGradient: string = '#2563eb'): string {
    return `
    <tr>
      <td style="background:${bgGradient};padding:32px 24px;text-align:center;">
        <!-- LOGO -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <img src="${this.baseUrl}/fly2any-logo-white.png" alt="Fly2Any" width="140" style="display:block;border:0;height:auto;max-width:140px;">
            </td>
          </tr>
          <tr>
            <td align="center">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:8px;">
              <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);font-family:Arial,Helvetica,sans-serif;">${subtitle}</p>
            </td>
          </tr>
          ${refBadge ? `
          <tr>
            <td align="center" style="padding-top:16px;">
              <span style="display:inline-block;background:rgba(255,255,255,0.2);padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;color:#ffffff;letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">REF: ${refBadge}</span>
            </td>
          </tr>
          ` : ''}
        </table>
      </td>
    </tr>`;
  }

  private static getFooter(): string {
    return `
    <tr>
      <td style="background:#1e293b;padding:32px 24px;text-align:center;">
        <!-- FOOTER LOGO -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <img src="${this.baseUrl}/fly2any-logo-white.png" alt="Fly2Any" width="100" style="display:block;border:0;height:auto;max-width:100px;opacity:0.8;">
            </td>
          </tr>
          <!-- LINKS -->
          <tr>
            <td align="center" style="padding:16px 0;">
              <a href="${this.baseUrl}/help" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px;font-family:Arial,Helvetica,sans-serif;">Help Center</a>
              <a href="${this.baseUrl}/my-trips" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px;font-family:Arial,Helvetica,sans-serif;">My Trips</a>
              <a href="${this.baseUrl}/deals" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px;font-family:Arial,Helvetica,sans-serif;">Deals</a>
            </td>
          </tr>
          <!-- SUPPORT -->
          <tr>
            <td align="center" style="padding:16px 0;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0 0 4px 0;font-size:14px;color:#ffffff;font-weight:600;font-family:Arial,Helvetica,sans-serif;">24/7 Customer Support</p>
              <p style="margin:0;font-size:14px;color:#94a3b8;font-family:Arial,Helvetica,sans-serif;">1-332-220-0838 | support@fly2any.com</p>
            </td>
          </tr>
          <!-- COPYRIGHT -->
          <tr>
            <td align="center" style="padding-top:16px;">
              <p style="margin:0;font-size:12px;color:#64748b;font-family:Arial,Helvetica,sans-serif;">
                &copy; ${new Date().getFullYear()} Fly2Any Travel. All rights reserved.<br>
                <a href="${this.baseUrl}/privacy" style="color:#64748b;text-decoration:underline;">Privacy Policy</a> |
                <a href="${this.baseUrl}/terms" style="color:#64748b;text-decoration:underline;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  private static getButton(text: string, url: string, bgColor: string = '#2563eb'): string {
    return `
    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
      <tr>
        <td align="center" style="padding:24px 0;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:52px;v-text-anchor:middle;width:250px;" arcsize="25%" stroke="f" fillcolor="${bgColor}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">${text}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${url}" style="display:inline-block;padding:16px 40px;background:${bgColor};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;font-family:Arial,Helvetica,sans-serif;box-shadow:0 4px 14px 0 rgba(37,99,235,0.39);">${text}</a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
  }

  private static getCrossSellSection(type: 'flight' | 'hotel' | 'general' = 'general'): string {
    const items = type === 'flight' ? [
      { icon: '🏨', label: 'Book a Hotel', url: `${this.baseUrl}/hotels` },
      { icon: '🚗', label: 'Rent a Car', url: `${this.baseUrl}/cars` },
      { icon: '🛡️', label: 'Travel Insurance', url: `${this.baseUrl}/insurance` },
      { icon: '🎯', label: 'Activities', url: `${this.baseUrl}/activities` },
    ] : type === 'hotel' ? [
      { icon: '✈️', label: 'Book Flights', url: `${this.baseUrl}/flights` },
      { icon: '🚐', label: 'Airport Transfer', url: `${this.baseUrl}/airport-transfer` },
      { icon: '🗺️', label: 'Local Tours', url: `${this.baseUrl}/tours` },
      { icon: '🍽️', label: 'Restaurants', url: `${this.baseUrl}/restaurants` },
    ] : [
      { icon: '✈️', label: 'Flights', url: `${this.baseUrl}/flights` },
      { icon: '🏨', label: 'Hotels', url: `${this.baseUrl}/hotels` },
      { icon: '🌍', label: 'TripMatch', url: `${this.baseUrl}/tripmatch` },
      { icon: '🔥', label: 'Flash Deals', url: `${this.baseUrl}/deals` },
    ];

    return `
    <tr>
      <td style="padding:24px;">
        <table role="presentation" style="width:100%;border:none;border-spacing:0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <tr>
            <td style="padding:20px;">
              <h3 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">${type === 'flight' ? '✨ Complete Your Trip' : type === 'hotel' ? '✨ Enhance Your Stay' : '✨ Explore Fly2Any'}</h3>
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  ${items.slice(0, 2).map(item => `
                  <td width="50%" style="padding:6px;">
                    <a href="${item.url}" style="display:block;background:#ffffff;padding:16px;border-radius:10px;text-decoration:none;text-align:center;border:1px solid #e5e7eb;">
                      <span style="font-size:28px;display:block;margin-bottom:8px;">${item.icon}</span>
                      <span style="font-size:13px;font-weight:600;color:#374151;font-family:Arial,Helvetica,sans-serif;">${item.label}</span>
                    </a>
                  </td>
                  `).join('')}
                </tr>
                <tr>
                  ${items.slice(2, 4).map(item => `
                  <td width="50%" style="padding:6px;">
                    <a href="${item.url}" style="display:block;background:#ffffff;padding:16px;border-radius:10px;text-decoration:none;text-align:center;border:1px solid #e5e7eb;">
                      <span style="font-size:28px;display:block;margin-bottom:8px;">${item.icon}</span>
                      <span style="font-size:13px;font-weight:600;color:#374151;font-family:Arial,Helvetica,sans-serif;">${item.label}</span>
                    </a>
                  </td>
                  `).join('')}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  // ===================================
  // PUBLIC EMAIL METHODS
  // ===================================

  /**
   * Send flight booking confirmation - PREMIUM TICKET STYLE
   */
  static async sendFlightBookingConfirmation(
    email: string,
    data: FlightBookingEmailData
  ): Promise<boolean> {
    const stopsText = data.stops === 0 || data.stops === undefined ? 'Direct' : data.stops === 1 ? '1 Stop' : `${data.stops} Stops`;
    const stopsColor = data.stops === 0 || data.stops === undefined ? '#059669' : data.stops === 1 ? '#d97706' : '#dc2626';
    const stopsBg = data.stops === 0 || data.stops === undefined ? '#d1fae5' : data.stops === 1 ? '#fef3c7' : '#fee2e2';

    const content = `
    ${this.getHeader('Booking Confirmed! ✈️', 'Your adventure awaits', data.bookingReference, '#2563eb')}

    <!-- CONTENT -->
    <tr>
      <td style="padding:32px 24px;">
        <!-- GREETING -->
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          Great news! Your flight has been confirmed and you're all set for takeoff. Here's your digital boarding pass with all the details you need.
        </p>

        <!-- FLIGHT TICKET CARD -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;border:2px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <!-- TICKET HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);padding:16px 20px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td>
                    <table role="presentation" style="border:none;border-spacing:0;">
                      <tr>
                        <td style="width:40px;height:40px;background:#ffffff;border-radius:8px;text-align:center;vertical-align:middle;font-size:20px;">✈️</td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${data.airline}</p>
                          <p style="margin:2px 0 0 0;font-size:13px;color:rgba(255,255,255,0.9);font-family:Arial,Helvetica,sans-serif;">Flight ${data.flightNumber}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${data.cabinClass}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ROUTE -->
          <tr>
            <td style="padding:28px 20px;background:#f8fafc;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <!-- DEPARTURE -->
                  <td width="35%" style="text-align:center;vertical-align:top;">
                    <p style="margin:0;font-size:32px;font-weight:800;color:#1e40af;letter-spacing:-1px;font-family:Arial,Helvetica,sans-serif;">${data.origin}</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.originCity}</p>
                    <p style="margin:12px 0 0 0;font-size:20px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.departureTime}</p>
                    <p style="margin:2px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.departureDate}</p>
                  </td>

                  <!-- ROUTE LINE -->
                  <td width="30%" style="text-align:center;vertical-align:middle;padding:0 10px;">
                    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                      <tr>
                        <td style="border-bottom:2px dashed #d1d5db;position:relative;">
                          <span style="display:inline-block;background:#f8fafc;padding:0 8px;font-size:24px;">✈️</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px;text-align:center;">
                          <p style="margin:0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.duration || 'Direct'}</p>
                          <span style="display:inline-block;margin-top:6px;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;background:${stopsBg};color:${stopsColor};font-family:Arial,Helvetica,sans-serif;">${stopsText}</span>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- ARRIVAL -->
                  <td width="35%" style="text-align:center;vertical-align:top;">
                    <p style="margin:0;font-size:32px;font-weight:800;color:#1e40af;letter-spacing:-1px;font-family:Arial,Helvetica,sans-serif;">${data.destination}</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.destinationCity}</p>
                    <p style="margin:12px 0 0 0;font-size:20px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.arrivalTime}</p>
                    <p style="margin:2px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.arrivalDate || data.departureDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DETAILS -->
          <tr>
            <td style="background:#f1f5f9;padding:16px 20px;border-top:1px dashed #e5e7eb;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="33%" style="text-align:center;padding:8px;">
                    <p style="margin:0;font-size:20px;">👥</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">Passengers</p>
                    <p style="margin:2px 0 0 0;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.passengers} ${data.passengers > 1 ? 'travelers' : 'traveler'}</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:8px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:20px;">💼</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">Baggage</p>
                    <p style="margin:2px 0 0 0;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.baggageIncluded || 1} bag included</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:8px;">
                    <p style="margin:0;font-size:20px;">💺</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">Seat</p>
                    <p style="margin:2px 0 0 0;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.seatSelection ? 'Select at check-in' : 'Assigned'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- PRICE BOX -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:24px;">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:20px;border-radius:12px;text-align:center;">
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);font-family:Arial,Helvetica,sans-serif;">Total Paid</p>
              <p style="margin:4px 0 0 0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1px;font-family:Arial,Helvetica,sans-serif;">${data.currency} ${data.totalPrice.toLocaleString()}</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:rgba(255,255,255,0.8);font-family:Arial,Helvetica,sans-serif;">Includes all taxes and fees</p>
            </td>
          </tr>
        </table>

        <!-- INFO BOX -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:20px;">
          <tr>
            <td style="background:#eff6ff;border:1px solid #bfdbfe;padding:16px;border-radius:10px;">
              <p style="margin:0 0 4px 0;font-weight:700;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">📋 What's Next?</p>
              <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">Check in online 24 hours before departure. Your e-ticket and boarding pass will be available in your account and sent via email.</p>
            </td>
          </tr>
        </table>

        ${this.getButton('View Booking Details', data.bookingUrl, '#2563eb')}
      </td>
    </tr>

    ${this.getCrossSellSection('flight')}

    <!-- SOCIAL PROOF -->
    <tr>
      <td style="padding:0 24px 24px 24px;">
        <table role="presentation" style="width:100%;border:none;border-spacing:0;background:#fef3c7;border-radius:8px;">
          <tr>
            <td style="padding:12px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#92400e;font-family:Arial,Helvetica,sans-serif;">🔥 Over 50,000 happy travelers this month</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#1e40af');

    return this.sendEmail({
      to: email,
      subject: `✈️ Booking Confirmed: ${data.originCity} → ${data.destinationCity} | ${data.bookingReference}`,
      html,
      tags: ['booking', 'flight', 'confirmation'],
    });
  }

  /**
   * Send hotel booking confirmation - PREMIUM CARD STYLE
   */
  static async sendHotelBookingConfirmation(
    email: string,
    data: HotelBookingEmailData
  ): Promise<boolean> {
    const stars = data.starRating ? '★'.repeat(data.starRating) + '☆'.repeat(5 - data.starRating) : '';

    const content = `
    ${this.getHeader('Hotel Confirmed! 🏨', 'Your stay is secured', data.bookingReference, '#7c3aed')}

    <!-- CONTENT -->
    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          Excellent choice! Your hotel reservation is confirmed. Pack your bags - an amazing stay awaits you.
        </p>

        <!-- HOTEL CARD -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;border:2px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <!-- HOTEL IMAGE -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);height:160px;text-align:center;vertical-align:middle;">
              <span style="font-size:64px;">🏨</span>
            </td>
          </tr>

          <!-- HOTEL INFO -->
          <tr>
            <td style="padding:20px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td>
                    <h3 style="margin:0 0 4px 0;font-size:20px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.hotelName}</h3>
                    <p style="margin:0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">📍 ${data.location}</p>
                  </td>
                  ${stars ? `<td align="right" style="color:#fbbf24;font-size:14px;">${stars}</td>` : ''}
                </tr>
              </table>

              <!-- DATES -->
              <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:20px;background:#f9fafb;border-radius:12px;">
                <tr>
                  <td width="45%" style="padding:16px;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">Check-in</p>
                    <p style="margin:4px 0 0 0;font-size:16px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.checkIn}</p>
                    <p style="margin:2px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.checkInTime || 'From 3:00 PM'}</p>
                  </td>
                  <td width="10%" style="text-align:center;color:#9ca3af;font-size:20px;">→</td>
                  <td width="45%" style="padding:16px;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">Check-out</p>
                    <p style="margin:4px 0 0 0;font-size:16px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.checkOut}</p>
                    <p style="margin:2px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.checkOutTime || 'By 11:00 AM'}</p>
                  </td>
                </tr>
              </table>

              <!-- DETAILS -->
              <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:16px;background:#f8fafc;border-radius:10px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:12px;">
                    <p style="margin:0;font-size:20px;">🛏️</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Room</p>
                    <p style="margin:2px 0 0 0;font-size:13px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.roomType}</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:12px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:20px;">🌙</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Duration</p>
                    <p style="margin:2px 0 0 0;font-size:13px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.nights} night${data.nights > 1 ? 's' : ''}</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:12px;">
                    <p style="margin:0;font-size:20px;">👥</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Guests</p>
                    <p style="margin:2px 0 0 0;font-size:13px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.guests} guest${data.guests > 1 ? 's' : ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- PRICE BOX -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:24px;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);padding:20px;border-radius:12px;text-align:center;">
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);font-family:Arial,Helvetica,sans-serif;">Total Paid</p>
              <p style="margin:4px 0 0 0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1px;font-family:Arial,Helvetica,sans-serif;">${data.currency} ${data.totalPrice.toLocaleString()}</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:rgba(255,255,255,0.8);font-family:Arial,Helvetica,sans-serif;">Includes all taxes and fees</p>
            </td>
          </tr>
        </table>

        ${data.cancellationPolicy ? `
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:20px;">
          <tr>
            <td style="background:#ecfdf5;border:1px solid #a7f3d0;padding:16px;border-radius:10px;">
              <p style="margin:0 0 4px 0;font-weight:700;color:#065f46;font-family:Arial,Helvetica,sans-serif;">✅ Cancellation Policy</p>
              <p style="margin:0;font-size:14px;color:#065f46;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">${data.cancellationPolicy}</p>
            </td>
          </tr>
        </table>
        ` : ''}

        ${this.getButton('View Reservation', data.bookingUrl, '#7c3aed')}
      </td>
    </tr>

    ${this.getCrossSellSection('hotel')}
    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#5b21b6');

    return this.sendEmail({
      to: email,
      subject: `🏨 Hotel Confirmed: ${data.hotelName} | ${data.bookingReference}`,
      html,
      tags: ['booking', 'hotel', 'confirmation'],
    });
  }

  /**
   * Send price drop alert - URGENCY FOCUSED
   */
  static async sendPriceAlert(
    email: string,
    data: PriceAlertEmailData
  ): Promise<boolean> {
    const content = `
    <!-- URGENCY BANNER -->
    <tr>
      <td style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:12px 20px;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">⏰ Limited Time! Price may increase anytime</p>
      </td>
    </tr>

    ${this.getHeader('Price Drop Alert! 🔔', `Save ${data.savingsPercent}% on your watched flight`, undefined, '#10b981')}

    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          <strong>Great news!</strong> The flight you've been tracking just dropped in price. This is one of the lowest prices we've seen for this route.
        </p>

        <!-- SAVINGS BANNER -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border:2px solid #f59e0b;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0;font-size:32px;">🎉</p>
              <p style="margin:8px 0 0 0;font-size:20px;font-weight:700;color:#92400e;font-family:Arial,Helvetica,sans-serif;">You Save ${data.currency} ${data.savings.toLocaleString()} (${data.savingsPercent}% OFF)</p>
              ${data.historicalLow ? `<p style="margin:4px 0 0 0;font-size:14px;color:#b45309;font-family:Arial,Helvetica,sans-serif;">Near historical low of ${data.currency} ${data.historicalLow}</p>` : ''}
            </td>
          </tr>
        </table>

        <!-- FLIGHT ROUTE -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;border:2px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-top:24px;">
          <tr>
            <td style="padding:32px 20px;background:#f8fafc;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40%" style="text-align:center;">
                    <p style="margin:0;font-size:32px;font-weight:800;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">${data.origin}</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.originCity || ''}</p>
                  </td>
                  <td width="20%" style="text-align:center;">
                    <p style="margin:0;font-size:24px;">✈️</p>
                    ${data.departureDate ? `<p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.departureDate}</p>` : ''}
                  </td>
                  <td width="40%" style="text-align:center;">
                    <p style="margin:0;font-size:32px;font-weight:800;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">${data.destination}</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${data.destinationCity || ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:20px;border-top:2px solid #10b981;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="50%" style="text-align:center;">
                    <p style="margin:0;text-decoration:line-through;color:#9ca3af;font-size:18px;font-family:Arial,Helvetica,sans-serif;">${data.currency} ${data.oldPrice}</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Previous Price</p>
                  </td>
                  <td width="50%" style="text-align:center;">
                    <p style="margin:0;color:#059669;font-size:28px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">${data.currency} ${data.newPrice}</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">New Price</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${data.expiresAt ? `
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:20px;">
          <tr>
            <td style="background:#fffbeb;border:1px solid #fde68a;padding:16px;border-radius:10px;">
              <p style="margin:0 0 4px 0;font-weight:700;color:#92400e;font-family:Arial,Helvetica,sans-serif;">⚡ Act Fast!</p>
              <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">This price is only guaranteed until ${data.expiresAt}. Prices can change anytime.</p>
            </td>
          </tr>
        </table>
        ` : ''}

        <!-- SOCIAL PROOF -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:16px;">
          <tr>
            <td style="background:#fef3c7;padding:12px;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#92400e;font-family:Arial,Helvetica,sans-serif;">🔥 12 people booked this route in the last hour</p>
            </td>
          </tr>
        </table>

        ${this.getButton(`Book Now & Save ${data.savingsPercent}%`, data.searchUrl, '#059669')}
      </td>
    </tr>

    ${this.getCrossSellSection('general')}
    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#059669');

    return this.sendEmail({
      to: email,
      subject: `🔔 Price Drop: ${data.origin} → ${data.destination} - Save ${data.savingsPercent}%!`,
      html,
      tags: ['price-alert', 'deal', 'urgency'],
    });
  }

  /**
   * Send welcome email with bonus credits - CONVERSION FOCUSED
   */
  static async sendWelcomeEmail(
    email: string,
    data: WelcomeEmailData
  ): Promise<boolean> {
    const content = `
    ${this.getHeader('Welcome to Fly2Any! 🎉', 'Your journey to smarter travel starts now', undefined, '#2563eb')}

    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          Welcome to the future of travel! You've just joined a community of <strong>500,000+ smart travelers</strong> who save an average of <strong>$200 per trip</strong> with Fly2Any.
        </p>

        <!-- WELCOME BONUS -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td style="background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);border:2px solid #d97706;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0;font-size:32px;">🎁</p>
              <p style="margin:8px 0 0 0;font-size:20px;font-weight:700;color:#78350f;font-family:Arial,Helvetica,sans-serif;">Welcome Bonus: ${data.welcomeCredits} Credits</p>
              <p style="margin:4px 0 0 0;font-size:14px;color:#92400e;font-family:Arial,Helvetica,sans-serif;">Worth $${(data.welcomeCredits / 10).toFixed(2)} towards your first booking</p>
            </td>
          </tr>
        </table>

        <!-- FEATURES -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:24px;">
          <tr>
            <td>
              <h3 style="margin:0 0 16px 0;font-size:18px;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">Why Fly2Any?</h3>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;vertical-align:top;">🤖</td>
                  <td>
                    <p style="margin:0;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">AI-Powered Search</p>
                    <p style="margin:4px 0 0 0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Find the best deals in seconds with our smart algorithms</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;vertical-align:top;">📊</td>
                  <td>
                    <p style="margin:0;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">Price Predictions</p>
                    <p style="margin:4px 0 0 0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Know when to book with 95% accurate price forecasts</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;vertical-align:top;">🌍</td>
                  <td>
                    <p style="margin:0;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">500+ Airlines</p>
                    <p style="margin:4px 0 0 0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Compare flights from every major carrier worldwide</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;vertical-align:top;">🎯</td>
                  <td>
                    <p style="margin:0;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">TripMatch</p>
                    <p style="margin:4px 0 0 0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Join group trips and share costs with like-minded travelers</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${this.getButton('Search Flights', data.browseUrl, '#2563eb')}

        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:12px;">
          <tr>
            <td align="center">
              <a href="${data.createUrl}" style="display:inline-block;padding:14px 36px;background:#ffffff;color:#2563eb;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;border:2px solid #2563eb;font-family:Arial,Helvetica,sans-serif;">Create a Trip</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${this.getCrossSellSection('general')}
    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#1e40af');

    return this.sendEmail({
      to: email,
      subject: `Welcome to Fly2Any! 🎁 Here's ${data.welcomeCredits} credits to get started`,
      html,
      tags: ['welcome', 'onboarding', 'new-user'],
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    data: PasswordResetEmailData
  ): Promise<boolean> {
    const content = `
    ${this.getHeader('Reset Your Password 🔐', 'Secure your account', undefined, '#4b5563')}

    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>

        ${this.getButton('Reset Password', data.resetUrl, '#2563eb')}

        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:20px;">
          <tr>
            <td style="background:#fffbeb;border:1px solid #fde68a;padding:16px;border-radius:10px;">
              <p style="margin:0 0 4px 0;font-weight:700;color:#92400e;font-family:Arial,Helvetica,sans-serif;">⏰ Link expires in ${data.expiresIn}</p>
              <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">If you didn't request this reset, you can safely ignore this email. Your password won't be changed.</p>
            </td>
          </tr>
        </table>

        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:24px;">
          <tr>
            <td style="background:#f9fafb;padding:16px;border-radius:8px;">
              <p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${data.resetUrl}" style="color:#2563eb;word-break:break-all;font-size:12px;">${data.resetUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#374151');

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
    const content = `
    ${this.getHeader('Trip Confirmed! 🌍', 'Get ready for an amazing adventure', undefined, '#8b5cf6')}

    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          <strong>You're going on a trip!</strong> Your spot has been confirmed. Start packing - an unforgettable experience awaits.
        </p>

        <!-- TRIP CARD -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;border:2px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%);height:140px;text-align:center;vertical-align:middle;">
              <span style="font-size:64px;">🌍</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <h3 style="margin:0 0 4px 0;font-size:20px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.tripTitle}</h3>
              <p style="margin:0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">📍 ${data.tripDestination}</p>

              <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:16px;background:#f8fafc;border-radius:10px;">
                <tr>
                  <td width="50%" style="text-align:center;padding:12px;">
                    <p style="margin:0;font-size:20px;">📅</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Date</p>
                    <p style="margin:2px 0 0 0;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.tripDate}</p>
                  </td>
                  ${data.spotsLeft ? `
                  <td width="50%" style="text-align:center;padding:12px;border-left:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:20px;">👥</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Spots Left</p>
                    <p style="margin:2px 0 0 0;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.spotsLeft} spots</p>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- PRICE BOX -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:24px;">
          <tr>
            <td style="background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);padding:20px;border-radius:12px;text-align:center;">
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);font-family:Arial,Helvetica,sans-serif;">Amount Paid</p>
              <p style="margin:4px 0 0 0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1px;font-family:Arial,Helvetica,sans-serif;">$${(data.amount / 100).toFixed(2)}</p>
            </td>
          </tr>
        </table>

        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:20px;">
          <tr>
            <td style="background:#eff6ff;border:1px solid #bfdbfe;padding:16px;border-radius:10px;">
              <p style="margin:0 0 4px 0;font-weight:700;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">📋 What's Next?</p>
              <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">You'll receive detailed trip information closer to the departure date. In the meantime, feel free to connect with other travelers in your group!</p>
            </td>
          </tr>
        </table>

        ${this.getButton('View Trip Details', data.tripUrl, '#8b5cf6')}
      </td>
    </tr>

    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#5b21b6');

    return this.sendEmail({
      to: email,
      subject: `🌍 You're going to ${data.tripDestination}! Trip confirmed`,
      html,
      tags: ['tripmatch', 'booking', 'trip'],
    });
  }

  /**
   * Send credits earned notification
   */
  static async sendCreditsEarned(
    email: string,
    data: CreditEarnedEmailData
  ): Promise<boolean> {
    const content = `
    ${this.getHeader('You Earned Credits! 🎉', 'Someone joined your trip', undefined, '#f59e0b')}

    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi ${data.userName},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          <strong>Ka-ching!</strong> Someone just joined your trip and you've earned rewards. Keep sharing to earn even more!
        </p>

        <!-- CREDITS BANNER -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td style="background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);border:2px solid #d97706;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0;font-size:32px;">🎉</p>
              <p style="margin:8px 0 0 0;font-size:24px;font-weight:700;color:#78350f;font-family:Arial,Helvetica,sans-serif;">+${data.creditsEarned} Credits Earned</p>
              <p style="margin:4px 0 0 0;font-size:14px;color:#92400e;font-family:Arial,Helvetica,sans-serif;">Worth $${data.usdValue.toFixed(2)} towards your next booking</p>
            </td>
          </tr>
        </table>

        <!-- DETAILS -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:24px;background:#f9fafb;border-radius:12px;">
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td style="font-weight:600;color:#374151;font-family:Arial,Helvetica,sans-serif;">Trip</td>
                  <td align="right" style="font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${data.tripTitle}</td>
                </tr>
              </table>
            </td>
          </tr>
          ${data.totalCredits ? `
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td style="font-weight:600;color:#374151;font-family:Arial,Helvetica,sans-serif;">Total Credits</td>
                  <td align="right" style="font-weight:700;color:#f59e0b;font-family:Arial,Helvetica,sans-serif;">${data.totalCredits}</td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          ${data.tierStatus ? `
          <tr>
            <td style="padding:16px 20px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td style="font-weight:600;color:#374151;font-family:Arial,Helvetica,sans-serif;">Status</td>
                  <td align="right" style="font-weight:700;color:#8b5cf6;font-family:Arial,Helvetica,sans-serif;">${data.tierStatus}</td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
        </table>

        <p style="margin:20px 0;font-size:15px;color:#4b5563;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
          Use your credits towards your next booking or save them to unlock higher tier benefits. The more you share, the more you earn!
        </p>

        ${this.getButton('View Dashboard', data.dashboardUrl, '#f59e0b')}
      </td>
    </tr>

    ${this.getCrossSellSection('general')}
    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#b45309');

    return this.sendEmail({
      to: email,
      subject: `🎉 You earned ${data.creditsEarned} credits ($${data.usdValue.toFixed(2)})!`,
      html,
      tags: ['tripmatch', 'credits', 'rewards'],
    });
  }

  /**
   * Send newsletter subscription confirmation
   */
  static async sendNewsletterConfirmation(
    email: string,
    data: NewsletterSignupData
  ): Promise<boolean> {
    const content = `
    ${this.getHeader("You're Subscribed! ✉️", 'Welcome to the Fly2Any family', undefined, '#2563eb')}

    <tr>
      <td style="padding:32px 24px;">
        <p style="margin:0 0 8px 0;font-size:18px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Hi${data.firstName ? ` ${data.firstName}` : ''},</p>
        <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          Thanks for subscribing! You're now part of an exclusive group that gets first access to the best travel deals on the planet.
        </p>

        <!-- WHAT TO EXPECT -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td>
              <h3 style="margin:0 0 16px 0;font-size:18px;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">What to expect:</h3>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:8px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;">🔥</td>
                  <td style="font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">Exclusive flash deals and error fares</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="background:#f9fafb;padding:12px;border-radius:8px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;">✈️</td>
                  <td style="font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">New route announcements</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="background:#f9fafb;padding:12px;border-radius:8px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;">💡</td>
                  <td style="font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">Travel tips and destination guides</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="background:#f9fafb;padding:12px;border-radius:8px;">
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td width="40" style="font-size:24px;">🎁</td>
                  <td style="font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">Subscriber-only promotions</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${this.getButton("Browse Today's Deals", `${this.baseUrl}/deals`, '#2563eb')}

        <!-- SOCIAL PROOF -->
        <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-top:16px;">
          <tr>
            <td style="background:#fef3c7;padding:12px;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#92400e;font-family:Arial,Helvetica,sans-serif;">🌟 Join 250,000+ subscribers getting the best deals</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${this.getFooter()}`;

    const html = this.getEmailWrapper(content, '#1e40af');

    return this.sendEmail({
      to: email,
      subject: `You're subscribed to Fly2Any deals & updates ✉️`,
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
