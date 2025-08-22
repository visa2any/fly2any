/**
 * 🎯 FLIGHT DEAL PROMOTIONAL EMAIL
 * Engaging promotional email for flight deals optimized for Mailgun
 */

import { EmailTemplate } from '../email-service';

export default function flightDealPromoTemplate(data: {
  firstName?: string;
  email: string;
  dealTitle: string;
  deals: Array<{
    origin: string;
    destination: string;
    price: number;
    currency: string;
    originalPrice?: number;
    savings?: number;
    departureDate: string;
    airline: string;
    dealUrl: string;
  }>;
  expiryDate?: string;
  promoCode?: string;
  campaignType?: 'flash_sale' | 'weekly_deals' | 'destination_focus' | 'seasonal';
  urgencyLevel?: 'low' | 'medium' | 'high';
}): EmailTemplate {
  const urgencyEmoji = data.urgencyLevel === 'high' ? '🚨' : data.urgencyLevel === 'medium' ? '⏰' : '✈️';
  const personalizedGreeting = data.firstName ? `${data.firstName}` : 'Fellow Traveler';
  const totalSavings = data.deals.reduce((sum, deal) => sum + (deal.savings || 0), 0);
  
  return {
    subject: `${urgencyEmoji} ${data.dealTitle} - Save up to $${Math.max(...data.deals.map(d => d.savings || 0))}!`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.dealTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #DC2626, #EA580C); color: white; padding: 30px 20px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); animation: shine 3s infinite; }
    @keyframes shine { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(180deg); } }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; position: relative; z-index: 2; }
    .header p { margin: 15px 0 0; opacity: 0.95; font-size: 16px; position: relative; z-index: 2; }
    .deal-badge { background: rgba(255,255,255,0.2); border-radius: 25px; padding: 8px 16px; display: inline-block; margin-top: 15px; font-weight: bold; }
    .content { padding: 30px 20px; }
    .urgency-banner { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .urgency-banner h3 { color: #92400E; margin: 0 0 8px; font-size: 16px; }
    .urgency-banner p { color: #92400E; margin: 0; font-weight: bold; }
    .deals-grid { margin: 30px 0; }
    .deal-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 15px 0; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
    .deal-card::before { content: ''; position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: #10B981; transform: rotate(45deg) translate(30px, -30px); }
    .deal-route { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
    .airport { text-align: center; flex: 1; }
    .airport-code { font-size: 20px; font-weight: bold; color: #1E40AF; }
    .airport-name { font-size: 12px; color: #666; margin-top: 2px; }
    .route-arrow { font-size: 16px; color: #3B82F6; margin: 0 15px; }
    .deal-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; align-items: center; }
    .price-section { text-align: center; }
    .current-price { font-size: 24px; font-weight: bold; color: #DC2626; }
    .original-price { font-size: 14px; color: #9CA3AF; text-decoration: line-through; margin-bottom: 5px; }
    .savings-badge { background: #10B981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .deal-info { color: #6B7280; font-size: 14px; }
    .deal-cta { text-align: center; }
    .deal-button { display: inline-block; background: #DC2626; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: background 0.3s; }
    .deal-button:hover { background: #B91C1C; }
    .promo-section { background: linear-gradient(135deg, #EBF8FF, #DBEAFE); border-radius: 12px; padding: 25px 20px; margin: 30px 0; text-align: center; }
    .promo-code { background: white; border: 2px dashed #3B82F6; padding: 15px; margin: 15px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #1E40AF; letter-spacing: 2px; }
    .stats-row { display: flex; justify-content: space-around; background: #F0FDF4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 20px; font-weight: bold; color: #059669; }
    .stat-label { font-size: 12px; color: #374151; margin-top: 4px; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    .social-links { margin: 15px 0; }
    .social-links a { display: inline-block; margin: 0 10px; color: #6B7280; text-decoration: none; }
    @media (max-width: 600px) {
      .deal-route { flex-direction: column; }
      .route-arrow { transform: rotate(90deg); margin: 10px 0; }
      .deal-details { grid-template-columns: 1fr; text-align: center; gap: 10px; }
      .stats-row { flex-direction: column; gap: 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ Fly2Any</h1>
      <p>${data.dealTitle}</p>
      <div class="deal-badge">
        ${data.deals.length} Exclusive Deal${data.deals.length > 1 ? 's' : ''} Inside
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Personalized Greeting -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1F2937; margin: 0;">Hi ${personalizedGreeting}! 👋</h2>
        <p style="color: #6B7280; margin: 10px 0;">We found some amazing deals you don't want to miss!</p>
      </div>

      <!-- Urgency Banner -->
      ${data.expiryDate ? `
      <div class="urgency-banner">
        <h3>${urgencyEmoji} Limited Time Offer!</h3>
        <p>These deals expire on ${new Date(data.expiryDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} - Don't wait!</p>
      </div>
      ` : ''}

      <!-- Deals Grid -->
      <div class="deals-grid">
        ${data.deals.map((deal, index) => `
        <div class="deal-card">
          <div class="deal-route">
            <div class="airport">
              <div class="airport-code">${deal.origin}</div>
            </div>
            <div class="route-arrow">✈️</div>
            <div class="airport">
              <div class="airport-code">${deal.destination}</div>
            </div>
          </div>
          
          <div class="deal-details">
            <div class="price-section">
              ${deal.originalPrice ? `<div class="original-price">${deal.currency}${deal.originalPrice}</div>` : ''}
              <div class="current-price">${deal.currency}${deal.price}</div>
              ${deal.savings ? `<div class="savings-badge">Save $${deal.savings}</div>` : ''}
            </div>
            
            <div>
              <div class="deal-info">
                <strong>Departure:</strong><br>
                ${new Date(deal.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div class="deal-info" style="margin-top: 8px;">
                <strong>Airline:</strong><br>
                ${deal.airline}
              </div>
            </div>
            
            <div class="deal-cta">
              <a href="${deal.dealUrl}?utm_source=email&utm_medium=deal_promo&utm_campaign=${data.campaignType || 'deal'}" class="deal-button">
                Book Now
              </a>
            </div>
          </div>
        </div>
        `).join('')}
      </div>

      <!-- Promo Code Section -->
      ${data.promoCode ? `
      <div class="promo-section">
        <h3 style="color: #1E40AF; margin: 0 0 15px;">💎 Exclusive Promo Code</h3>
        <p style="margin: 0 0 15px; color: #374151;">Use this code for additional savings on your booking:</p>
        <div class="promo-code">${data.promoCode}</div>
        <p style="margin: 15px 0 0; color: #6B7280; font-size: 14px;">
          *Valid until ${data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'limited time'}
        </p>
      </div>
      ` : ''}

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat">
          <div class="stat-number">${data.deals.length}</div>
          <div class="stat-label">Hot Deals</div>
        </div>
        <div class="stat">
          <div class="stat-number">$${Math.max(...data.deals.map(d => d.savings || 0))}</div>
          <div class="stat-label">Max Savings</div>
        </div>
        <div class="stat">
          <div class="stat-number">${data.deals.length > 5 ? '5+' : data.deals.length}</div>
          <div class="stat-label">Destinations</div>
        </div>
        <div class="stat">
          <div class="stat-number">24H</div>
          <div class="stat-label">Flash Sale</div>
        </div>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; background: #1F2937; color: white; border-radius: 12px; padding: 30px 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px;">🔥 Don't miss out!</h3>
        <p style="margin: 0 0 20px; opacity: 0.9;">These deals won't last long. Book your next adventure today!</p>
        <a href="https://fly2any.com/deals?utm_source=email&utm_medium=deal_promo&utm_campaign=${data.campaignType || 'deal'}" 
           style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          View All Deals
        </a>
      </div>

      <!-- Support -->
      <div style="background: #F3F4F6; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="margin: 0 0 8px; font-weight: bold; color: #374151;">Need help booking?</p>
        <p style="margin: 0; color: #6B7280;">
          📧 support@fly2any.com | 📱 WhatsApp: +1 (888) 359-2269
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Fly2Any - Your Travel Companion</strong></p>
      <div class="social-links">
        <a href="https://facebook.com/fly2any">Facebook</a>
        <a href="https://instagram.com/fly2any">Instagram</a>
        <a href="https://twitter.com/fly2any">Twitter</a>
      </div>
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
${urgencyEmoji} ${data.dealTitle.toUpperCase()}
${'='.repeat(data.dealTitle.length + 2)}

Hi ${personalizedGreeting}! 👋

We found some amazing flight deals you don't want to miss!

${data.expiryDate ? `
🚨 LIMITED TIME OFFER!
These deals expire on ${new Date(data.expiryDate).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})} - Don't wait!
` : ''}

🔥 HOT DEALS:
${data.deals.map((deal, index) => `
${index + 1}. ${deal.origin} → ${deal.destination}
   Price: ${deal.currency}${deal.price}${deal.originalPrice ? ` (was ${deal.currency}${deal.originalPrice})` : ''}${deal.savings ? ` - SAVE $${deal.savings}!` : ''}
   Departure: ${new Date(deal.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
   Airline: ${deal.airline}
   Book: ${deal.dealUrl}?utm_source=email&utm_medium=deal_promo&utm_campaign=${data.campaignType || 'deal'}
`).join('')}

${data.promoCode ? `
💎 EXCLUSIVE PROMO CODE: ${data.promoCode}
Use this code for additional savings on your booking!
*Valid until ${data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'limited time'}
` : ''}

📊 DEAL SUMMARY:
• ${data.deals.length} Hot Deals Available
• Up to $${Math.max(...data.deals.map(d => d.savings || 0))} Maximum Savings
• ${data.deals.length > 5 ? '5+' : data.deals.length} Destinations Featured
• 24H Flash Sale Pricing

🔥 DON'T MISS OUT!
These deals won't last long. Book your next adventure today!
View All Deals: https://fly2any.com/deals?utm_source=email&utm_medium=deal_promo&utm_campaign=${data.campaignType || 'deal'}

❓ NEED HELP BOOKING?
📧 support@fly2any.com
📱 WhatsApp: +1 (888) 359-2269

---
Fly2Any - Your Travel Companion
Follow us: Facebook | Instagram | Twitter

This email was sent to ${data.email}
Unsubscribe: %unsubscribe_url%
Privacy Policy: https://fly2any.com/privacy

© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `
  };
}