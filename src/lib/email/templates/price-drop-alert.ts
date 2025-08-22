/**
 * 📉 PRICE DROP ALERT EMAIL TEMPLATE
 * Alert email when flight prices drop for saved routes
 */

import { EmailTemplate } from '../email-service';

export default function priceDropAlertTemplate(data: {
  firstName?: string;
  email: string;
  route: {
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
  };
  priceInfo: {
    currentPrice: number;
    previousPrice: number;
    currency: string;
    savings: number;
    percentageOff: number;
  };
  flightDetails: {
    departureDate: string;
    returnDate?: string;
    airline: string;
    duration: string;
    stops: number;
  };
  alertSettings: {
    targetPrice?: number;
    createdDate: string;
  };
  bookingUrl: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  validUntil?: string;
}): EmailTemplate {
  const personalizedGreeting = data.firstName ? `${data.firstName}` : 'Fellow Traveler';
  const urgencyEmoji = data.urgencyLevel === 'high' ? '🚨' : data.urgencyLevel === 'medium' ? '⏰' : '📉';
  const tripType = data.flightDetails.returnDate ? 'Round-trip' : 'One-way';
  
  return {
    subject: `${urgencyEmoji} Price Drop Alert! ${data.route.origin}→${data.route.destination} now ${data.priceInfo.currency}${data.priceInfo.currentPrice} (${data.priceInfo.percentageOff}% off!)`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Drop Alert - ${data.route.origin} to ${data.route.destination}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 30px 20px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.1)"/></svg>') repeat; animation: sparkle 2s linear infinite; }
    @keyframes sparkle { 0% { transform: translate(0, 0); } 100% { transform: translate(-50px, -50px); } }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; position: relative; z-index: 2; }
    .alert-badge { background: rgba(255,255,255,0.2); border-radius: 25px; padding: 8px 16px; display: inline-block; margin-top: 15px; font-weight: bold; font-size: 14px; }
    .content { padding: 30px 20px; }
    .greeting { text-align: center; margin-bottom: 30px; }
    .greeting h2 { color: #1F2937; margin: 0 0 10px; }
    .price-comparison { background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; border: 2px solid #F59E0B; }
    .price-row { display: flex; align-items: center; justify-content: center; margin: 15px 0; }
    .old-price { font-size: 18px; color: #9CA3AF; text-decoration: line-through; margin-right: 15px; }
    .new-price { font-size: 32px; font-weight: bold; color: #DC2626; }
    .savings-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 16px; font-weight: bold; margin: 15px 0; display: inline-block; }
    .route-display { background: #EBF8FF; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .route-header { text-align: center; margin-bottom: 20px; }
    .route-visual { display: flex; align-items: center; justify-content: space-between; margin: 20px 0; }
    .airport { text-align: center; flex: 1; }
    .airport-code { font-size: 24px; font-weight: bold; color: #1E40AF; }
    .airport-city { font-size: 14px; color: #6B7280; margin-top: 5px; }
    .route-arrow { font-size: 20px; color: #3B82F6; margin: 0 20px; animation: fly 2s ease-in-out infinite; }
    @keyframes fly { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
    .flight-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin: 20px 0; }
    .detail-item { text-align: center; background: white; border-radius: 8px; padding: 15px; }
    .detail-label { font-size: 12px; color: #6B7280; font-weight: bold; text-transform: uppercase; }
    .detail-value { font-size: 16px; color: #1F2937; font-weight: bold; margin-top: 5px; }
    .urgency-banner { background: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    .urgency-banner.high { background: #DC2626; color: white; }
    .urgency-banner.medium { background: #F59E0B; color: white; }
    .urgency-text { font-weight: bold; margin: 0; }
    .cta-section { background: linear-gradient(135deg, #1F2937, #374151); color: white; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
    .cta-section h3 { margin: 0 0 15px; font-size: 24px; }
    .cta-section p { margin: 0 0 20px; opacity: 0.9; }
    .book-button { display: inline-block; background: #DC2626; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); }
    .book-button:hover { background: #B91C1C; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4); }
    .alert-info { background: #F0F9FF; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .alert-info h4 { color: #1E40AF; margin: 0 0 10px; }
    .alert-info p { margin: 5px 0; color: #1E3A8A; }
    .target-reached { background: #F0FDF4; border: 2px solid #10B981; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    .target-reached h4 { color: #059669; margin: 0 0 8px; }
    .target-reached p { color: #065F46; margin: 0; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    .social-proof { background: #F3F4F6; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    @media (max-width: 600px) {
      .route-visual { flex-direction: column; }
      .route-arrow { transform: rotate(90deg); margin: 15px 0; }
      .flight-details { grid-template-columns: repeat(2, 1fr); }
      .price-row { flex-direction: column; align-items: center; gap: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📉 Price Drop Alert!</h1>
      <div class="alert-badge">
        ${data.priceInfo.percentageOff}% OFF
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <div class="greeting">
        <h2>Great news, ${personalizedGreeting}! 🎉</h2>
        <p>The flight you've been tracking just dropped in price!</p>
      </div>

      <!-- Price Comparison -->
      <div class="price-comparison">
        <h3 style="color: #92400E; margin: 0 0 15px;">💰 Price Drop Detected!</h3>
        <div class="price-row">
          <span class="old-price">${data.priceInfo.currency}${data.priceInfo.previousPrice}</span>
          <span class="new-price">${data.priceInfo.currency}${data.priceInfo.currentPrice}</span>
        </div>
        <div class="savings-badge">
          You save ${data.priceInfo.currency}${data.priceInfo.savings}!
        </div>
      </div>

      <!-- Target Price Achievement -->
      ${data.alertSettings.targetPrice && data.priceInfo.currentPrice <= data.alertSettings.targetPrice ? `
      <div class="target-reached">
        <h4>🎯 Target Price Reached!</h4>
        <p>Your target of ${data.priceInfo.currency}${data.alertSettings.targetPrice} has been achieved. Current price is even better!</p>
      </div>
      ` : ''}

      <!-- Route Display -->
      <div class="route-display">
        <div class="route-header">
          <h3 style="color: #1E40AF; margin: 0;">Your Flight Details</h3>
        </div>
        <div class="route-visual">
          <div class="airport">
            <div class="airport-code">${data.route.origin}</div>
            <div class="airport-city">${data.route.originCity}</div>
          </div>
          <div class="route-arrow">✈️</div>
          <div class="airport">
            <div class="airport-code">${data.route.destination}</div>
            <div class="airport-city">${data.route.destinationCity}</div>
          </div>
        </div>
        
        <div class="flight-details">
          <div class="detail-item">
            <div class="detail-label">Trip Type</div>
            <div class="detail-value">${tripType}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Departure</div>
            <div class="detail-value">${new Date(data.flightDetails.departureDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}</div>
          </div>
          ${data.flightDetails.returnDate ? `
          <div class="detail-item">
            <div class="detail-label">Return</div>
            <div class="detail-value">${new Date(data.flightDetails.returnDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}</div>
          </div>
          ` : ''}
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${data.flightDetails.duration}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Stops</div>
            <div class="detail-value">${data.flightDetails.stops === 0 ? 'Nonstop' : `${data.flightDetails.stops} stop${data.flightDetails.stops > 1 ? 's' : ''}`}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Airline</div>
            <div class="detail-value">${data.flightDetails.airline}</div>
          </div>
        </div>
      </div>

      <!-- Urgency Banner -->
      ${data.validUntil ? `
      <div class="urgency-banner ${data.urgencyLevel}">
        <p class="urgency-text">
          ${data.urgencyLevel === 'high' ? '🚨 LIMITED TIME: ' : data.urgencyLevel === 'medium' ? '⏰ HURRY: ' : '📅 '}
          This price is valid until ${new Date(data.validUntil).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      ` : ''}

      <!-- Alert Information -->
      <div class="alert-info">
        <h4>📊 Your Price Alert Details</h4>
        <p><strong>Alert created:</strong> ${new Date(data.alertSettings.createdDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        ${data.alertSettings.targetPrice ? `<p><strong>Target price:</strong> ${data.priceInfo.currency}${data.alertSettings.targetPrice}</p>` : ''}
        <p><strong>Price tracked from:</strong> ${data.priceInfo.currency}${data.priceInfo.previousPrice} → ${data.priceInfo.currency}${data.priceInfo.currentPrice}</p>
      </div>

      <!-- Call to Action -->
      <div class="cta-section">
        <h3>🔥 Don't let this deal fly away!</h3>
        <p>Flight prices change frequently. Book now to secure this amazing price.</p>
        <a href="${data.bookingUrl}?utm_source=email&utm_medium=price_alert&utm_campaign=price_drop" class="book-button">
          Book This Flight
        </a>
      </div>

      <!-- Social Proof -->
      <div class="social-proof">
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          <strong>Smart booking tip:</strong> Our users save an average of $247 per flight by booking within 24 hours of receiving a price alert.
        </p>
      </div>

      <!-- Additional Options -->
      <div style="background: #EBF8FF; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <h4 style="color: #1E40AF; margin: 0 0 15px;">✈️ More Options</h4>
        <p style="margin: 0 0 15px; color: #1E3A8A;">Want to see more deals for this route or set up additional alerts?</p>
        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <a href="https://fly2any.com/search?origin=${data.route.origin}&destination=${data.route.destination}" 
             style="display: inline-block; background: #3B82F6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
            View All Options
          </a>
          <a href="https://fly2any.com/alerts" 
             style="display: inline-block; background: #10B981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
            Manage Alerts
          </a>
        </div>
      </div>

      <!-- Support -->
      <div style="background: #F3F4F6; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="margin: 0 0 8px; font-weight: bold; color: #374151;">Questions about booking?</p>
        <p style="margin: 0; color: #6B7280;">
          📧 support@fly2any.com | 📱 WhatsApp: +1 (888) 359-2269
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Fly2Any - Your Travel Companion</strong></p>
      <p>This price alert was sent to ${data.email}</p>
      <p style="font-size: 12px; color: #9CA3AF;">
        <a href="https://fly2any.com/alerts/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #9CA3AF;">Unsubscribe from alerts</a> | 
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
${urgencyEmoji} PRICE DROP ALERT! ${urgencyEmoji}
${'='.repeat(30)}

Great news, ${personalizedGreeting}! 🎉

The flight you've been tracking just dropped in price!

💰 PRICE DROP DETECTED:
• Previous Price: ${data.priceInfo.currency}${data.priceInfo.previousPrice}
• Current Price: ${data.priceInfo.currency}${data.priceInfo.currentPrice}
• You Save: ${data.priceInfo.currency}${data.priceInfo.savings} (${data.priceInfo.percentageOff}% OFF!)

${data.alertSettings.targetPrice && data.priceInfo.currentPrice <= data.alertSettings.targetPrice ? `
🎯 TARGET PRICE REACHED!
Your target of ${data.priceInfo.currency}${data.alertSettings.targetPrice} has been achieved. Current price is even better!
` : ''}

✈️ FLIGHT DETAILS:
• Route: ${data.route.origin} (${data.route.originCity}) → ${data.route.destination} (${data.route.destinationCity})
• Trip Type: ${tripType}
• Departure: ${new Date(data.flightDetails.departureDate).toLocaleDateString('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric' 
})}${data.flightDetails.returnDate ? `\n• Return: ${new Date(data.flightDetails.returnDate).toLocaleDateString('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric' 
})}` : ''}
• Duration: ${data.flightDetails.duration}
• Stops: ${data.flightDetails.stops === 0 ? 'Nonstop' : `${data.flightDetails.stops} stop${data.flightDetails.stops > 1 ? 's' : ''}`}
• Airline: ${data.flightDetails.airline}

${data.validUntil ? `
${data.urgencyLevel === 'high' ? '🚨 LIMITED TIME: ' : data.urgencyLevel === 'medium' ? '⏰ HURRY: ' : '📅 '}
This price is valid until ${new Date(data.validUntil).toLocaleDateString('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric' 
})}
` : ''}

📊 YOUR PRICE ALERT DETAILS:
• Alert created: ${new Date(data.alertSettings.createdDate).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}${data.alertSettings.targetPrice ? `\n• Target price: ${data.priceInfo.currency}${data.alertSettings.targetPrice}` : ''}
• Price tracked from: ${data.priceInfo.currency}${data.priceInfo.previousPrice} → ${data.priceInfo.currency}${data.priceInfo.currentPrice}

🔥 DON'T LET THIS DEAL FLY AWAY!
Flight prices change frequently. Book now to secure this amazing price.

📱 BOOK THIS FLIGHT:
${data.bookingUrl}?utm_source=email&utm_medium=price_alert&utm_campaign=price_drop

💡 SMART BOOKING TIP:
Our users save an average of $247 per flight by booking within 24 hours of receiving a price alert.

✈️ MORE OPTIONS:
• View all flight options: https://fly2any.com/search?origin=${data.route.origin}&destination=${data.route.destination}
• Manage your alerts: https://fly2any.com/alerts

❓ QUESTIONS ABOUT BOOKING?
📧 support@fly2any.com
📱 WhatsApp: +1 (888) 359-2269

---
Fly2Any - Your Travel Companion

This price alert was sent to ${data.email}
Unsubscribe from alerts: https://fly2any.com/alerts/unsubscribe?email=${encodeURIComponent(data.email)}
Privacy Policy: https://fly2any.com/privacy

© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `
  };
}