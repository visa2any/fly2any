/**
 * Hotel Booking Confirmation Email Service
 * Sends professional HTML emails for booking confirmations, reminders, and cancellations
 */

import { Resend } from 'resend'
import { format } from 'date-fns'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent.')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'bookings@fly2any.com'
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || 'support@fly2any.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://fly2any.com'

export interface HotelBookingEmailData {
  confirmationNumber: string
  bookingId: string
  hotelName: string
  hotelAddress?: string
  hotelCity?: string
  hotelCountry?: string
  hotelPhone?: string
  hotelEmail?: string
  roomName: string
  checkInDate: Date
  checkOutDate: Date
  nights: number
  guestName: string
  guestEmail: string
  totalPrice: number
  currency: string
  specialRequests?: string
  additionalGuests?: Array<{
    firstName: string
    lastName: string
  }>
}

/**
 * Send booking confirmation email
 */
export async function sendHotelConfirmationEmail(data: HotelBookingEmailData): Promise<boolean> {
  if (!resend) {
    console.error('Resend is not configured. Cannot send confirmation email.')
    return false
  }

  try {
    const checkIn = format(data.checkInDate, 'EEEE, MMMM d, yyyy')
    const checkOut = format(data.checkOutDate, 'EEEE, MMMM d, yyyy')
    const checkInTime = format(data.checkInDate, 'h:mm a')

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
    }).format(data.totalPrice)

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - ${data.hotelName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f8fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f8fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Booking Confirmed!</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.95); font-size: 18px;">Your adventure awaits</p>
            </td>
          </tr>

          <!-- Confirmation Number -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #f8f9fa;">
              <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Confirmation Number</p>
              <p style="margin: 0; color: #212529; font-size: 28px; font-weight: 700; letter-spacing: 2px;">${data.confirmationNumber}</p>
            </td>
          </tr>

          <!-- Hotel Details -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #212529; font-size: 24px; font-weight: 600;">${data.hotelName}</h2>
              ${data.hotelAddress ? `<p style="margin: 0 0 8px 0; color: #6c757d; font-size: 15px;">${data.hotelAddress}</p>` : ''}
              ${data.hotelCity && data.hotelCountry ? `<p style="margin: 0 0 8px 0; color: #6c757d; font-size: 15px;">${data.hotelCity}, ${data.hotelCountry}</p>` : ''}
              ${data.hotelPhone ? `<p style="margin: 0 0 8px 0; color: #6c757d; font-size: 15px;">📞 ${data.hotelPhone}</p>` : ''}
              ${data.hotelEmail ? `<p style="margin: 0; color: #6c757d; font-size: 15px;">✉️ ${data.hotelEmail}</p>` : ''}
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e9ecef; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e9ecef;">
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 13px; text-transform: uppercase;">Check-in</p>
                    <p style="margin: 0; color: #212529; font-size: 16px; font-weight: 600;">${checkIn}</p>
                    <p style="margin: 4px 0 0 0; color: #6c757d; font-size: 14px;">After ${checkInTime}</p>
                  </td>
                  <td style="padding: 20px; border-bottom: 1px solid #e9ecef;">
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 13px; text-transform: uppercase;">Check-out</p>
                    <p style="margin: 0; color: #212529; font-size: 16px; font-weight: 600;">${checkOut}</p>
                    <p style="margin: 4px 0 0 0; color: #6c757d; font-size: 14px;">Before 11:00 AM</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 13px; text-transform: uppercase;">Room Type</p>
                    <p style="margin: 0; color: #212529; font-size: 16px; font-weight: 600;">${data.roomName}</p>
                  </td>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 13px; text-transform: uppercase;">Total Nights</p>
                    <p style="margin: 0; color: #212529; font-size: 16px; font-weight: 600;">${data.nights} ${data.nights === 1 ? 'night' : 'nights'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Information -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #212529; font-size: 18px; font-weight: 600;">Guest Information</h3>
              <p style="margin: 0 0 8px 0; color: #212529; font-size: 15px;"><strong>Primary Guest:</strong> ${data.guestName}</p>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">${data.guestEmail}</p>
              ${data.additionalGuests && data.additionalGuests.length > 0 ? `
                <p style="margin: 16px 0 8px 0; color: #6c757d; font-size: 14px;"><strong>Additional Guests:</strong></p>
                ${data.additionalGuests.map(guest => `<p style="margin: 4px 0; color: #6c757d; font-size: 14px;">• ${guest.firstName} ${guest.lastName}</p>`).join('')}
              ` : ''}
            </td>
          </tr>

          ${data.specialRequests ? `
          <!-- Special Requests -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #212529; font-size: 18px; font-weight: 600;">Special Requests</h3>
              <p style="margin: 0; color: #6c757d; font-size: 15px;">${data.specialRequests}</p>
              <p style="margin: 12px 0 0 0; color: #6c757d; font-size: 13px; font-style: italic;">*Requests are subject to availability</p>
            </td>
          </tr>
          ` : ''}

          <!-- Payment Summary -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #212529; font-size: 16px; font-weight: 600;">Total Paid</p>
                  </td>
                  <td align="right">
                    <p style="margin: 0; color: #FF6B35; font-size: 24px; font-weight: 700;">${formattedPrice}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next Section -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h3 style="margin: 0 0 20px 0; color: #212529; font-size: 20px; font-weight: 600;">What's Next?</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;" width="40">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF6B35, #F7931E); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
                  </td>
                  <td style="padding: 12px 0 12px 12px;">
                    <p style="margin: 0 0 4px 0; color: #212529; font-size: 15px; font-weight: 600;">We'll send you a reminder</p>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">24 hours before your check-in time</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;" width="40">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF6B35, #F7931E); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
                  </td>
                  <td style="padding: 12px 0 12px 12px;">
                    <p style="margin: 0 0 4px 0; color: #212529; font-size: 15px; font-weight: 600;">Bring this confirmation</p>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">Show your confirmation number at check-in (print or digital)</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;" width="40">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF6B35, #F7931E); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
                  </td>
                  <td style="padding: 12px 0 12px 12px;">
                    <p style="margin: 0 0 4px 0; color: #212529; font-size: 15px; font-weight: 600;">Enjoy your stay!</p>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">We hope you have an amazing experience</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${BASE_URL}/account/bookings/${data.bookingId}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #FF6B35, #F7931E); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">View Booking Details</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${BASE_URL}/help/contact" style="display: inline-block; padding: 14px 28px; background: #ffffff; color: #FF6B35; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; border: 2px solid #FF6B35;">Contact Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 13px;">Need to make changes to your booking?</p>
              <p style="margin: 0 0 16px 0;"><a href="${BASE_URL}/account/bookings/${data.bookingId}" style="color: #FF6B35; text-decoration: none; font-weight: 600;">Manage Your Booking</a></p>
              <p style="margin: 16px 0 0 0; color: #adb5bd; font-size: 12px;">© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
              <p style="margin: 8px 0 0 0; color: #adb5bd; font-size: 12px;">You're receiving this email because you booked a hotel through Fly2Any.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const plainText = `
BOOKING CONFIRMED!

Confirmation Number: ${data.confirmationNumber}

Hotel: ${data.hotelName}
${data.hotelAddress || ''}
${data.hotelCity && data.hotelCountry ? `${data.hotelCity}, ${data.hotelCountry}` : ''}
${data.hotelPhone ? `Phone: ${data.hotelPhone}` : ''}

CHECK-IN: ${checkIn}
CHECK-OUT: ${checkOut}
ROOM: ${data.roomName}
NIGHTS: ${data.nights}

GUEST: ${data.guestName}
EMAIL: ${data.guestEmail}

TOTAL PAID: ${formattedPrice}

${data.specialRequests ? `SPECIAL REQUESTS:\n${data.specialRequests}\n*Requests are subject to availability\n` : ''}

WHAT'S NEXT:
1. We'll send you a reminder 24 hours before check-in
2. Bring this confirmation number to the hotel
3. Enjoy your stay!

View your booking: ${BASE_URL}/account/bookings/${data.bookingId}
Need help? Contact support: ${BASE_URL}/help/contact

© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: `Booking Confirmed - ${data.hotelName} (${data.confirmationNumber})`,
      html: emailHtml,
      text: plainText,
    })

    console.log(`✅ Confirmation email sent to ${data.guestEmail}`)
    return true
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return false
  }
}

/**
 * Send pre-arrival reminder email (24 hours before check-in)
 */
export async function sendPreArrivalReminder(data: HotelBookingEmailData): Promise<boolean> {
  if (!resend) {
    console.error('Resend is not configured. Cannot send reminder email.')
    return false
  }

  try {
    const checkIn = format(data.checkInDate, 'EEEE, MMMM d, yyyy')

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: `Reminder: Check-in Tomorrow at ${data.hotelName}`,
      html: `
        <h1>Your check-in is tomorrow!</h1>
        <p>Hi ${data.guestName},</p>
        <p>Just a friendly reminder that you're checking in at <strong>${data.hotelName}</strong> tomorrow, ${checkIn}.</p>
        <p><strong>Confirmation Number:</strong> ${data.confirmationNumber}</p>
        <p><strong>Room:</strong> ${data.roomName}</p>
        <p>Don't forget to bring a valid ID and your confirmation number.</p>
        <p>Have a wonderful stay!</p>
        <p>View booking details: <a href="${BASE_URL}/account/bookings/${data.bookingId}">Manage Booking</a></p>
      `,
      text: `Your check-in is tomorrow at ${data.hotelName}!\n\nConfirmation: ${data.confirmationNumber}\nRoom: ${data.roomName}\n\nBring your ID and confirmation number.\n\nView booking: ${BASE_URL}/account/bookings/${data.bookingId}`,
    })

    console.log(`✅ Pre-arrival reminder sent to ${data.guestEmail}`)
    return true
  } catch (error) {
    console.error('Error sending pre-arrival reminder:', error)
    return false
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationEmail(
  data: HotelBookingEmailData & { refundAmount?: number; cancellationReason?: string }
): Promise<boolean> {
  if (!resend) {
    console.error('Resend is not configured. Cannot send cancellation email.')
    return false
  }

  try {
    const refundText = data.refundAmount
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.refundAmount)
      : 'No refund (non-refundable booking)'

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: `Booking Cancelled - ${data.hotelName} (${data.confirmationNumber})`,
      html: `
        <h1>Booking Cancelled</h1>
        <p>Hi ${data.guestName},</p>
        <p>Your booking at <strong>${data.hotelName}</strong> has been cancelled.</p>
        <p><strong>Confirmation Number:</strong> ${data.confirmationNumber}</p>
        <p><strong>Refund Amount:</strong> ${refundText}</p>
        ${data.refundAmount ? '<p>Refunds typically appear in 5-10 business days.</p>' : ''}
        ${data.cancellationReason ? `<p><strong>Reason:</strong> ${data.cancellationReason}</p>` : ''}
        <p>If you have any questions, please contact our support team.</p>
      `,
      text: `Booking Cancelled\n\nHotel: ${data.hotelName}\nConfirmation: ${data.confirmationNumber}\nRefund: ${refundText}\n${data.refundAmount ? 'Refunds appear in 5-10 business days.' : ''}`,
    })

    console.log(`✅ Cancellation email sent to ${data.guestEmail}`)
    return true
  } catch (error) {
    console.error('Error sending cancellation email:', error)
    return false
  }
}
