/**
 * 📨 BOOKING FOLLOW-UP EMAIL TEMPLATE
 * Post-booking follow-up with travel tips and upsells
 */

import { EmailTemplate } from '../email-service';

export default function bookingFollowUpTemplate(data: {
  firstName: string;
  bookingReference: string;
  email: string;
  destination: string;
  departureDate: string;
  daysUntilTravel: number;
  flightDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    airline: string;
  };
  recommendations?: {
    hotels?: Array<{ name: string; price: number; rating: number; url: string }>;
    activities?: Array<{ name: string; price: number; description: string; url: string }>;
    carRentals?: Array<{ company: string; price: number; carType: string; url: string }>;
  };
  travelTips?: string[];
  weatherInfo?: {
    temperature: string;
    condition: string;
    advice: string;
  };
}): EmailTemplate {
  const timeFrame = data.daysUntilTravel <= 7 ? 'soon' : 
                   data.daysUntilTravel <= 30 ? 'next month' : 
                   'in the coming months';
  
  return {
    subject: `✈️ Your ${data.destination} trip is ${timeFrame}! Here's what you need to know`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${data.destination} Travel Guide</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 15px 0 0; opacity: 0.95; }
    .countdown { background: rgba(255,255,255,0.2); border-radius: 12px; padding: 15px; margin: 15px 0; }
    .countdown-number { font-size: 32px; font-weight: bold; }
    .content { padding: 30px 20px; }
    .trip-summary { background: #EFF6FF; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3B82F6; }
    .trip-route { display: flex; align-items: center; justify-content: space-between; margin: 15px 0; }
    .airport { text-align: center; flex: 1; }
    .airport-code { font-size: 20px; font-weight: bold; color: #1E40AF; }
    .route-arrow { font-size: 16px; color: #3B82F6; margin: 0 15px; }
    .section { margin: 30px 0; padding: 20px; border-radius: 12px; }
    .section h3 { margin: 0 0 15px; color: #1F2937; }
    .weather-card { background: linear-gradient(135deg, #DBEAFE, #93C5FD); }
    .tips-card { background: #F0FDF4; border-left: 4px solid #10B981; }
    .recommendations { background: #FEF3C7; border-left: 4px solid #F59E0B; }
    .recommendation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px; }
    .rec-item { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .rec-item h4 { margin: 0 0 8px; color: #1F2937; font-size: 16px; }
    .rec-item p { margin: 4px 0; color: #6B7280; font-size: 14px; }
    .rec-item .price { color: #059669; font-weight: bold; }
    .rec-item .rating { color: #F59E0B; }
    .rec-button { display: inline-block; background: #3B82F6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 10px; }
    .rec-button:hover { background: #2563EB; }
    .checklist { background: #F3F4F6; border-radius: 12px; padding: 20px; }
    .checklist ul { margin: 0; padding-left: 0; list-style: none; }
    .checklist li { margin: 8px 0; padding-left: 25px; position: relative; }
    .checklist li::before { content: '✓'; position: absolute; left: 0; color: #10B981; font-weight: bold; }
    .urgent-reminder { background: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .urgent-reminder h4 { color: #DC2626; margin: 0 0 8px; }
    .urgent-reminder p { color: #991B1B; margin: 0; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    @media (max-width: 600px) {
      .trip-route { flex-direction: column; }
      .route-arrow { transform: rotate(90deg); margin: 10px 0; }
      .recommendation-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ Trip Preparation Guide</h1>
      <p>Your ${data.destination} adventure awaits!</p>
      <div class="countdown">
        <div class="countdown-number">${data.daysUntilTravel}</div>
        <div>Days Until Departure</div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1F2937; margin: 0 0 10px;">Hi ${data.firstName}! 🎉</h2>
        <p style="color: #6B7280;">Your booking ${data.bookingReference} is confirmed and we're excited to help make your trip amazing!</p>
      </div>

      <!-- Trip Summary -->
      <div class="trip-summary">
        <h3 style="color: #1E40AF; margin: 0 0 15px;">📋 Your Trip Summary</h3>
        <div class="trip-route">
          <div class="airport">
            <div class="airport-code">${data.flightDetails.origin}</div>
          </div>
          <div class="route-arrow">✈️</div>
          <div class="airport">
            <div class="airport-code">${data.flightDetails.destination}</div>
          </div>
        </div>
        <p><strong>Departure:</strong> ${new Date(data.departureDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Airline:</strong> ${data.flightDetails.airline}</p>
        <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
      </div>

      <!-- Weather Info -->
      ${data.weatherInfo ? `
      <div class="section weather-card">
        <h3>🌤️ Weather in ${data.destination}</h3>
        <p><strong>Expected Temperature:</strong> ${data.weatherInfo.temperature}</p>
        <p><strong>Conditions:</strong> ${data.weatherInfo.condition}</p>
        <p><strong>Packing Tip:</strong> ${data.weatherInfo.advice}</p>
      </div>
      ` : ''}

      <!-- Urgent Reminders for Near Departure -->
      ${data.daysUntilTravel <= 7 ? `
      <div class="urgent-reminder">
        <h4>🚨 Important: Your trip is in ${data.daysUntilTravel} day${data.daysUntilTravel !== 1 ? 's' : ''}!</h4>
        <p>Make sure to complete your check-in 24 hours before departure and arrive at the airport 2-3 hours early.</p>
      </div>
      ` : ''}

      <!-- Travel Tips -->
      ${data.travelTips ? `
      <div class="section tips-card">
        <h3>💡 Travel Tips for ${data.destination}</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${data.travelTips.map(tip => `<li style="margin: 8px 0; color: #374151;">${tip}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Recommendations -->
      ${data.recommendations ? `
      <div class="section recommendations">
        <h3>🎯 Recommended for Your Trip</h3>
        <p style="margin: 0 0 15px; color: #92400E;">Complete your travel experience with these hand-picked recommendations:</p>
        
        ${data.recommendations.hotels ? `
        <h4 style="color: #92400E; margin: 20px 0 10px;">🏨 Accommodations</h4>
        <div class="recommendation-grid">
          ${data.recommendations.hotels.slice(0, 3).map(hotel => `
          <div class="rec-item">
            <h4>${hotel.name}</h4>
            <p class="rating">${'⭐'.repeat(Math.floor(hotel.rating))} ${hotel.rating}/5</p>
            <p class="price">From $${hotel.price}/night</p>
            <a href="${hotel.url}?utm_source=email&utm_medium=follow_up&utm_campaign=booking_recommendations" class="rec-button">View Hotel</a>
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.recommendations.activities ? `
        <h4 style="color: #92400E; margin: 20px 0 10px;">🎪 Activities & Tours</h4>
        <div class="recommendation-grid">
          ${data.recommendations.activities.slice(0, 3).map(activity => `
          <div class="rec-item">
            <h4>${activity.name}</h4>
            <p>${activity.description}</p>
            <p class="price">From $${activity.price}</p>
            <a href="${activity.url}?utm_source=email&utm_medium=follow_up&utm_campaign=booking_recommendations" class="rec-button">Book Now</a>
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.recommendations.carRentals ? `
        <h4 style="color: #92400E; margin: 20px 0 10px;">🚗 Car Rentals</h4>
        <div class="recommendation-grid">
          ${data.recommendations.carRentals.slice(0, 2).map(car => `
          <div class="rec-item">
            <h4>${car.company}</h4>
            <p>${car.carType}</p>
            <p class="price">From $${car.price}/day</p>
            <a href="${car.url}?utm_source=email&utm_medium=follow_up&utm_campaign=booking_recommendations" class="rec-button">Rent Now</a>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Pre-Travel Checklist -->
      <div class="section checklist">
        <h3>📝 Pre-Travel Checklist</h3>
        <ul>
          <li>Check passport expiration date (6+ months validity)</li>
          <li>Verify visa requirements for ${data.destination}</li>
          <li>Purchase travel insurance</li>
          <li>Notify bank of international travel</li>
          <li>Download offline maps and translation apps</li>
          <li>Check-in online 24 hours before departure</li>
          <li>Confirm hotel reservations</li>
          <li>Pack according to weather forecast</li>
        </ul>
      </div>

      <!-- Contact Information -->
      <div style="background: #EBF8FF; border-radius: 12px; padding: 20px; text-align: center;">
        <h4 style="color: #1E40AF; margin: 0 0 15px;">📞 Need Assistance?</h4>
        <p style="margin: 0; color: #1E3A8A;">
          <strong>24/7 Travel Support:</strong><br>
          📧 support@fly2any.com<br>
          📱 WhatsApp: +1 (888) 359-2269<br>
          🌐 Live Chat: fly2any.com/support
        </p>
      </div>

      <!-- Call to Action -->
      <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
        <h3 style="margin: 0 0 15px;">🎁 Exclusive Member Benefits</h3>
        <p style="margin: 0 0 20px; opacity: 0.9;">Save 15% on your next booking with code RETURN15</p>
        <a href="https://fly2any.com/account?utm_source=email&utm_medium=follow_up&utm_campaign=member_benefits" 
           style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; border: 2px solid white; border-radius: 6px; text-decoration: none; font-weight: bold;">
          View My Account
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Fly2Any - Your Travel Companion</strong></p>
      <p>Have a wonderful trip to ${data.destination}!</p>
      <p>This email was sent to ${data.email}</p>
      <p style="font-size: 12px; color: #9CA3AF;">
        <a href="%unsubscribe_url%" style="color: #9CA3AF;">Unsubscribe</a> | 
        <a href="https://fly2any.com/privacy" style="color: #9CA3AF;">Privacy Policy</a>
      </p>
      <p>© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
    </div>
  </div>

  <!-- Mailgun Tracking Pixel -->
  <img src="%recipient.tracking_pixel%" width="1" height="1" style="display:none;" alt="" />
</body>
</html>
    `,

    textContent: `
YOUR ${data.destination.toUpperCase()} TRIP PREPARATION GUIDE
${'='.repeat(data.destination.length + 30)}

Hi ${data.firstName}! 🎉

Your booking ${data.bookingReference} is confirmed and we're excited to help make your trip amazing!

⏰ COUNTDOWN: ${data.daysUntilTravel} days until departure!

📋 YOUR TRIP SUMMARY:
• Route: ${data.flightDetails.origin} → ${data.flightDetails.destination}
• Departure: ${new Date(data.departureDate).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
• Airline: ${data.flightDetails.airline}
• Booking Reference: ${data.bookingReference}

${data.weatherInfo ? `
🌤️ WEATHER IN ${data.destination.toUpperCase()}:
• Expected Temperature: ${data.weatherInfo.temperature}
• Conditions: ${data.weatherInfo.condition}
• Packing Tip: ${data.weatherInfo.advice}
` : ''}

${data.daysUntilTravel <= 7 ? `
🚨 URGENT: Your trip is in ${data.daysUntilTravel} day${data.daysUntilTravel !== 1 ? 's' : ''}!
Make sure to complete your check-in 24 hours before departure and arrive at the airport 2-3 hours early.
` : ''}

${data.travelTips ? `
💡 TRAVEL TIPS FOR ${data.destination.toUpperCase()}:
${data.travelTips.map((tip, index) => `${index + 1}. ${tip}`).join('\n')}
` : ''}

📝 PRE-TRAVEL CHECKLIST:
✓ Check passport expiration date (6+ months validity)
✓ Verify visa requirements for ${data.destination}
✓ Purchase travel insurance
✓ Notify bank of international travel
✓ Download offline maps and translation apps
✓ Check-in online 24 hours before departure
✓ Confirm hotel reservations
✓ Pack according to weather forecast

${data.recommendations ? `
🎯 RECOMMENDATIONS FOR YOUR TRIP:
${data.recommendations.hotels ? `
🏨 ACCOMMODATIONS:
${data.recommendations.hotels.slice(0, 2).map(hotel => `• ${hotel.name} - ${hotel.rating}⭐ - From $${hotel.price}/night`).join('\n')}
` : ''}
${data.recommendations.activities ? `
🎪 ACTIVITIES:
${data.recommendations.activities.slice(0, 2).map(activity => `• ${activity.name} - From $${activity.price}`).join('\n')}
` : ''}
${data.recommendations.carRentals ? `
🚗 CAR RENTALS:
${data.recommendations.carRentals.slice(0, 1).map(car => `• ${car.company} ${car.carType} - From $${car.price}/day`).join('\n')}
` : ''}
` : ''}

📞 NEED ASSISTANCE?
24/7 Travel Support:
📧 support@fly2any.com
📱 WhatsApp: +1 (888) 359-2269
🌐 Live Chat: fly2any.com/support

🎁 EXCLUSIVE MEMBER BENEFITS:
Save 15% on your next booking with code RETURN15
View your account: https://fly2any.com/account

---
Fly2Any - Your Travel Companion
Have a wonderful trip to ${data.destination}!

This email was sent to ${data.email}
Unsubscribe: %unsubscribe_url%
Privacy Policy: https://fly2any.com/privacy

© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `
  };
}