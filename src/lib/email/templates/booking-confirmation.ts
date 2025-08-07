/**
 * 🎫 BOOKING CONFIRMATION EMAIL TEMPLATE
 * Professional booking confirmation with all details
 */

import { EmailTemplate } from '../email-service';

export default function bookingConfirmationTemplate(data: {
  bookingReference: string;
  passengerName: string;
  passengerEmail: string;
  flightDetails: any;
  totalPrice: number;
  currency: string;
  bookingDate: string;
  nextSteps?: string[];
}): EmailTemplate {
  const flight = data.flightDetails.outbound;
  
  return {
    subject: `✅ Flight Confirmed - ${data.bookingReference} | ${flight.departure.iataCode} → ${flight.arrival.iataCode}`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Booking Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .booking-ref { background: #EFF6FF; border: 2px solid #3B82F6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .booking-ref h2 { color: #1E40AF; margin: 0 0 10px; font-size: 24px; }
    .flight-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10B981; }
    .route { display: flex; align-items: center; justify-content: space-between; margin: 20px 0; }
    .airport { text-align: center; flex: 1; }
    .airport-code { font-size: 24px; font-weight: bold; color: #1E40AF; }
    .airport-name { font-size: 12px; color: #666; margin-top: 5px; }
    .flight-arrow { font-size: 20px; color: #3B82F6; margin: 0 20px; }
    .flight-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .detail-group h4 { margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: 600; }
    .detail-group p { margin: 0; color: #6B7280; }
    .price-summary { background: #F0FDF4; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .price-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .total-price { font-size: 20px; font-weight: bold; color: #059669; border-top: 2px solid #059669; padding-top: 10px; margin-top: 15px; }
    .next-steps { background: #FEF3C7; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .next-steps h3 { color: #92400E; margin: 0 0 15px; }
    .next-steps ul { margin: 0; padding-left: 20px; }
    .next-steps li { color: #92400E; margin: 8px 0; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    .support-info { background: #EBF8FF; border-radius: 8px; padding: 15px; margin: 20px 0; }
    @media (max-width: 600px) {
      .flight-details { grid-template-columns: 1fr; }
      .route { flex-direction: column; text-align: center; }
      .flight-arrow { transform: rotate(90deg); margin: 10px 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ Fly2Any</h1>
      <p>Your flight is confirmed!</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Booking Reference -->
      <div class="booking-ref">
        <h2>🎫 ${data.bookingReference}</h2>
        <p>Save this reference number for your records</p>
      </div>

      <!-- Flight Information -->
      <div class="flight-card">
        <h3 style="margin: 0 0 20px; color: #1F2937;">✈️ Flight Details</h3>
        
        <div class="route">
          <div class="airport">
            <div class="airport-code">${flight.departure.iataCode}</div>
            <div class="airport-name">${flight.departure.city}</div>
            <div class="airport-name">${flight.departure.airportName}</div>
          </div>
          <div class="flight-arrow">✈️</div>
          <div class="airport">
            <div class="airport-code">${flight.arrival.iataCode}</div>
            <div class="airport-name">${flight.arrival.city}</div>
            <div class="airport-name">${flight.arrival.airportName}</div>
          </div>
        </div>

        <div class="flight-details">
          <div class="detail-group">
            <h4>Departure</h4>
            <p><strong>${flight.departure.date}</strong></p>
            <p>${flight.departure.time}</p>
            ${flight.departure.terminal ? `<p>Terminal ${flight.departure.terminal}</p>` : ''}
          </div>
          <div class="detail-group">
            <h4>Arrival</h4>
            <p><strong>${flight.arrival.date}</strong></p>
            <p>${flight.arrival.time}</p>
            ${flight.arrival.terminal ? `<p>Terminal ${flight.arrival.terminal}</p>` : ''}
          </div>
        </div>

        <div class="flight-details">
          <div class="detail-group">
            <h4>Airline & Flight</h4>
            <p>${flight.airline.name}</p>
            <p>Flight ${flight.flightNumber}</p>
          </div>
          <div class="detail-group">
            <h4>Duration & Class</h4>
            <p>${flight.duration}</p>
            <p>${flight.cabin} Class</p>
          </div>
        </div>
      </div>

      <!-- Passenger Information -->
      <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; color: #1F2937;">👤 Passenger Information</h3>
        <p><strong>Name:</strong> ${data.passengerName}</p>
        <p><strong>Email:</strong> ${data.passengerEmail}</p>
        <p><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</p>
      </div>

      <!-- Price Summary -->
      <div class="price-summary">
        <h3 style="margin: 0 0 15px; color: #059669;">💰 Price Summary</h3>
        <div class="price-row total-price">
          <span>Total Paid</span>
          <span>${data.currency} ${data.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <!-- Next Steps -->
      ${data.nextSteps ? `
      <div class="next-steps">
        <h3>📋 Next Steps</h3>
        <ul>
          ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Important Information -->
      <div class="next-steps">
        <h3>⚠️ Important Reminders</h3>
        <ul>
          <li>Arrive at the airport at least 2 hours before domestic flights (3 hours for international)</li>
          <li>Bring valid photo ID and this confirmation email</li>
          <li>Check-in online 24 hours before departure to save time</li>
          <li>Check current COVID-19 travel requirements for your destination</li>
        </ul>
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
FLIGHT BOOKING CONFIRMATION
===========================

✅ Your flight is confirmed!

🎫 BOOKING REFERENCE: ${data.bookingReference}
(Save this reference number for your records)

✈️ FLIGHT DETAILS
-----------------
Route: ${flight.departure.iataCode} (${flight.departure.city}) → ${flight.arrival.iataCode} (${flight.arrival.city})

Departure: ${flight.departure.date} at ${flight.departure.time}
From: ${flight.departure.airportName}${flight.departure.terminal ? ` - Terminal ${flight.departure.terminal}` : ''}

Arrival: ${flight.arrival.date} at ${flight.arrival.time}
To: ${flight.arrival.airportName}${flight.arrival.terminal ? ` - Terminal ${flight.arrival.terminal}` : ''}

Airline: ${flight.airline.name}
Flight: ${flight.flightNumber}
Duration: ${flight.duration}
Class: ${flight.cabin}

👤 PASSENGER INFORMATION
-----------------------
Name: ${data.passengerName}
Email: ${data.passengerEmail}
Booking Date: ${new Date(data.bookingDate).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}

💰 PRICE SUMMARY
---------------
Total Paid: ${data.currency} ${data.totalPrice.toFixed(2)}

${data.nextSteps ? `
📋 NEXT STEPS
------------
${data.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
` : ''}

⚠️ IMPORTANT REMINDERS
---------------------
• Arrive at the airport at least 2 hours before domestic flights (3 hours for international)
• Bring valid photo ID and this confirmation email
• Check-in online 24 hours before departure to save time
• Check current COVID-19 travel requirements for your destination

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