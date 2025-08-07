/**
 * 🚫 CANCELLATION CONFIRMATION EMAIL TEMPLATE
 * Professional cancellation confirmation with refund details
 */

import { EmailTemplate } from '../email-service';

export default function cancellationConfirmationTemplate(data: {
  bookingReference: string;
  passengerName: string;
  passengerEmail: string;
  flightDetails: any;
  originalAmount: number;
  refundAmount: number;
  currency: string;
  cancellationDate: string;
  refundId?: string;
  cancellationPolicy: string;
}): EmailTemplate {
  const flight = data.flightDetails.outbound;
  
  return {
    subject: `❌ Booking Cancelled - ${data.bookingReference} | Refund: ${data.currency} ${data.refundAmount.toFixed(2)}`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Booking Cancellation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #EF4444, #F97316); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .booking-ref { background: #FEF2F2; border: 2px solid #EF4444; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .booking-ref h2 { color: #DC2626; margin: 0 0 10px; font-size: 24px; }
    .status-cancelled { background: #FEE2E2; color: #991B1B; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
    .refund-card { background: #F0FDF4; border: 2px solid #10B981; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .refund-amount { font-size: 28px; font-weight: bold; color: #059669; text-align: center; margin: 15px 0; }
    .flight-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #6B7280; }
    .route { display: flex; align-items: center; justify-content: space-between; margin: 20px 0; }
    .airport { text-align: center; flex: 1; }
    .airport-code { font-size: 20px; font-weight: bold; color: #6B7280; text-decoration: line-through; }
    .airport-name { font-size: 12px; color: #666; margin-top: 5px; }
    .cancelled-flight { opacity: 0.6; }
    .refund-details { background: #F9FAFB; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
    .detail-row:last-child { border-bottom: none; }
    .policy-info { background: #FEF3C7; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    .support-info { background: #EBF8FF; border-radius: 8px; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ Fly2Any</h1>
      <p>Booking Cancellation Confirmed</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Booking Reference -->
      <div class="booking-ref">
        <h2>🚫 ${data.bookingReference}</h2>
        <div class="status-cancelled">CANCELLED</div>
        <p style="margin-top: 15px;">Cancellation processed on ${new Date(data.cancellationDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</p>
      </div>

      <!-- Refund Information -->
      ${data.refundAmount > 0 ? `
      <div class="refund-card">
        <h3 style="margin: 0 0 15px; color: #059669; text-align: center;">💰 Refund Information</h3>
        <div class="refund-amount">${data.currency} ${data.refundAmount.toFixed(2)}</div>
        <p style="text-align: center; margin: 0; color: #065F46;">
          Your refund will be processed within 5-10 business days
        </p>
        ${data.refundId ? `<p style="text-align: center; margin: 10px 0 0; font-size: 12px; color: #6B7280;">Refund ID: ${data.refundId}</p>` : ''}
      </div>
      ` : `
      <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <h3 style="margin: 0 0 10px; color: #DC2626;">No Refund Applicable</h3>
        <p style="margin: 0; color: #991B1B;">As per our cancellation policy, no refund is available for this booking.</p>
      </div>
      `}

      <!-- Refund Breakdown -->
      <div class="refund-details">
        <h3 style="margin: 0 0 15px; color: #374151;">📊 Payment Breakdown</h3>
        <div class="detail-row">
          <span>Original Amount</span>
          <span>${data.currency} ${data.originalAmount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span>Cancellation Fee</span>
          <span>-${data.currency} ${(data.originalAmount - data.refundAmount).toFixed(2)}</span>
        </div>
        <div class="detail-row" style="font-weight: bold; color: ${data.refundAmount > 0 ? '#059669' : '#DC2626'};">
          <span>Refund Amount</span>
          <span>${data.currency} ${data.refundAmount.toFixed(2)}</span>
        </div>
      </div>

      <!-- Cancelled Flight Information -->
      <div class="flight-card cancelled-flight">
        <h3 style="margin: 0 0 20px; color: #6B7280;">✈️ Cancelled Flight Details</h3>
        
        <div class="route">
          <div class="airport">
            <div class="airport-code">${flight.departure.iataCode}</div>
            <div class="airport-name">${flight.departure.city}</div>
          </div>
          <div style="font-size: 20px; color: #EF4444; margin: 0 20px;">✗</div>
          <div class="airport">
            <div class="airport-code">${flight.arrival.iataCode}</div>
            <div class="airport-name">${flight.arrival.city}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div>
            <h4 style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">Flight</h4>
            <p style="margin: 0; color: #9CA3AF;">${flight.airline.name} ${flight.flightNumber}</p>
          </div>
          <div>
            <h4 style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">Date</h4>
            <p style="margin: 0; color: #9CA3AF;">${flight.departure.date} at ${flight.departure.time}</p>
          </div>
        </div>
      </div>

      <!-- Cancellation Policy -->
      <div class="policy-info">
        <h3 style="margin: 0 0 15px; color: #92400E;">📋 Cancellation Policy</h3>
        <p style="margin: 0; color: #92400E;">${data.cancellationPolicy}</p>
      </div>

      <!-- Passenger Information -->
      <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; color: #374151;">👤 Passenger Information</h3>
        <p><strong>Name:</strong> ${data.passengerName}</p>
        <p><strong>Email:</strong> ${data.passengerEmail}</p>
      </div>

      <!-- Support Information -->
      <div class="support-info">
        <h4 style="margin: 0 0 10px; color: #1E40AF;">💬 Need Help?</h4>
        <p style="margin: 0; color: #1E3A8A;">
          <strong>24/7 Support:</strong> support@fly2any.com | +1-888-FLY-2ANY<br>
          <strong>WhatsApp:</strong> +1 (888) 359-2269
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Fly2Any - Your Travel Companion</strong></p>
      <p>This email was sent to ${data.passengerEmail}</p>
      <p>© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,

    textContent: `
FLIGHT BOOKING CANCELLATION
============================

🚫 Your booking has been cancelled

🎫 BOOKING REFERENCE: ${data.bookingReference}
STATUS: CANCELLED
Cancellation Date: ${new Date(data.cancellationDate).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}

${data.refundAmount > 0 ? `
💰 REFUND INFORMATION
--------------------
Refund Amount: ${data.currency} ${data.refundAmount.toFixed(2)}
Processing Time: 5-10 business days
${data.refundId ? `Refund ID: ${data.refundId}` : ''}
` : `
❌ NO REFUND APPLICABLE
As per our cancellation policy, no refund is available for this booking.
`}

📊 PAYMENT BREAKDOWN
-------------------
Original Amount: ${data.currency} ${data.originalAmount.toFixed(2)}
Cancellation Fee: -${data.currency} ${(data.originalAmount - data.refundAmount).toFixed(2)}
Refund Amount: ${data.currency} ${data.refundAmount.toFixed(2)}

✈️ CANCELLED FLIGHT DETAILS
---------------------------
Route: ${flight.departure.iataCode} (${flight.departure.city}) ✗ ${flight.arrival.iataCode} (${flight.arrival.city})
Flight: ${flight.airline.name} ${flight.flightNumber}
Date: ${flight.departure.date} at ${flight.departure.time}

📋 CANCELLATION POLICY
----------------------
${data.cancellationPolicy}

👤 PASSENGER INFORMATION
-----------------------
Name: ${data.passengerName}
Email: ${data.passengerEmail}

💬 NEED HELP?
------------
24/7 Support: support@fly2any.com | +1-888-FLY-2ANY
WhatsApp: +1 (888) 359-2269

---
Fly2Any - Your Travel Companion
This email was sent to ${data.passengerEmail}
© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `
  };
}