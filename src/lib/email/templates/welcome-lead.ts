/**
 * 🎯 WELCOME EMAIL FOR NEW LEADS
 * Professional welcome email optimized for Mailgun deliverability
 */

import { EmailTemplate } from '../email-service';

export default function welcomeLeadTemplate(data: {
  firstName: string;
  email: string;
  source?: string;
  preferredDestination?: string;
  interests?: string[];
  utmSource?: string;
  utmCampaign?: string;
}): EmailTemplate {
  const personalizedGreeting = data.firstName ? `Hi ${data.firstName}` : 'Welcome to Fly2Any';
  const sourceText = data.source ? `via ${data.source}` : '';
  
  return {
    subject: `${personalizedGreeting}! Your exclusive flight deals await ✈️`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Fly2Any</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
    .header p { margin: 15px 0 0; opacity: 0.95; font-size: 18px; }
    .welcome-badge { background: rgba(255,255,255,0.2); border-radius: 25px; padding: 8px 16px; display: inline-block; margin-top: 15px; }
    .content { padding: 30px 20px; }
    .welcome-message { text-align: center; padding: 20px 0; }
    .welcome-message h2 { color: #1E40AF; margin: 0 0 15px; font-size: 24px; }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .benefit-card { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; border-left: 4px solid #10B981; }
    .benefit-icon { font-size: 32px; margin-bottom: 10px; }
    .benefit-title { font-weight: bold; color: #1F2937; margin: 10px 0 8px; }
    .benefit-desc { color: #6B7280; font-size: 14px; }
    .cta-section { background: linear-gradient(135deg, #EFF6FF, #F0F9FF); border-radius: 12px; padding: 30px 20px; text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 15px 10px 5px; transition: background 0.3s; }
    .cta-button:hover { background: #2563EB; }
    .social-proof { background: #F0FDF4; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .stats { display: flex; justify-content: space-around; flex-wrap: wrap; }
    .stat { margin: 10px; }
    .stat-number { font-size: 24px; font-weight: bold; color: #059669; }
    .stat-label { color: #374151; font-size: 12px; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    .unsubscribe { font-size: 12px; color: #9CA3AF; }
    @media (max-width: 600px) {
      .benefits-grid { grid-template-columns: 1fr; }
      .stats { flex-direction: column; align-items: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ Fly2Any</h1>
      <p>Welcome aboard, ${data.firstName || 'Traveler'}!</p>
      <div class="welcome-badge">
        New Member ${sourceText}
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Welcome Message -->
      <div class="welcome-message">
        <h2>🎉 Thanks for joining our travel community!</h2>
        <p>You're now part of an exclusive group that gets access to the best flight deals and travel insights. Let's help you explore the world for less!</p>
      </div>

      <!-- Benefits Grid -->
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">💰</div>
          <div class="benefit-title">Exclusive Deals</div>
          <div class="benefit-desc">Save up to 70% on flights with our member-only deals and price alerts</div>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🔔</div>
          <div class="benefit-title">Price Alerts</div>
          <div class="benefit-desc">Get notified instantly when prices drop for your favorite destinations</div>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🌍</div>
          <div class="benefit-title">Global Coverage</div>
          <div class="benefit-desc">Access to flights worldwide with our extensive airline partnership network</div>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🎯</div>
          <div class="benefit-title">Personalized</div>
          <div class="benefit-desc">AI-powered recommendations based on your travel preferences and history</div>
        </div>
      </div>

      <!-- Personalization -->
      ${data.preferredDestination ? `
      <div style="background: #FEF3C7; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <h3 style="color: #92400E; margin: 0 0 10px;">🎯 We noticed you're interested in ${data.preferredDestination}</h3>
        <p style="color: #92400E; margin: 0;">We'll send you exclusive deals and price alerts for flights to ${data.preferredDestination} first!</p>
      </div>
      ` : ''}

      <!-- CTA Section -->
      <div class="cta-section">
        <h3 style="color: #1E40AF; margin: 0 0 15px;">Ready to start saving on flights?</h3>
        <p style="margin: 0 0 20px; color: #374151;">Explore our current deals or set up your first price alert</p>
        <a href="https://fly2any.com/flights?utm_source=email&utm_medium=welcome&utm_campaign=new_lead" class="cta-button">
          🔍 Browse Flight Deals
        </a>
        <a href="https://fly2any.com/alerts?utm_source=email&utm_medium=welcome&utm_campaign=new_lead" class="cta-button" style="background: #10B981;">
          🔔 Set Price Alert
        </a>
      </div>

      <!-- Social Proof -->
      <div class="social-proof">
        <h4 style="color: #059669; margin: 0 0 15px;">Join 100K+ Smart Travelers</h4>
        <div class="stats">
          <div class="stat">
            <div class="stat-number">$2.3M</div>
            <div class="stat-label">Total Saved</div>
          </div>
          <div class="stat">
            <div class="stat-number">100K+</div>
            <div class="stat-label">Happy Travelers</div>
          </div>
          <div class="stat">
            <div class="stat-number">500+</div>
            <div class="stat-label">Destinations</div>
          </div>
          <div class="stat">
            <div class="stat-number">4.9⭐</div>
            <div class="stat-label">User Rating</div>
          </div>
        </div>
      </div>

      <!-- What's Next -->
      <div style="background: #EBF8FF; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #1E40AF; margin: 0 0 15px;">📬 What to expect next:</h4>
        <ul style="color: #1E3A8A; margin: 0; padding-left: 20px;">
          <li>Weekly curated flight deals matching your interests</li>
          <li>Flash sale alerts for last-minute bookings</li>
          <li>Travel tips and destination guides</li>
          <li>Exclusive member-only promotional codes</li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div style="background: #F3F4F6; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
        <h4 style="margin: 0 0 10px; color: #374151;">Questions? We're here to help!</h4>
        <p style="margin: 0; color: #6B7280;">
          <strong>Email:</strong> support@fly2any.com<br>
          <strong>WhatsApp:</strong> +1 (888) 359-2269
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Fly2Any - Your Travel Companion</strong></p>
      <p>This email was sent to ${data.email}</p>
      <p class="unsubscribe">
        Don't want these emails? <a href="%unsubscribe_url%" style="color: #9CA3AF;">Unsubscribe here</a>
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
WELCOME TO FLY2ANY!
===================

Hi ${data.firstName || 'there'}! 👋

Thanks for joining our travel community! You're now part of an exclusive group that gets access to the best flight deals and travel insights.

🎉 WELCOME BENEFITS:
• Save up to 70% on flights with exclusive member deals
• Get instant price alerts for your favorite destinations  
• Access to 500+ destinations worldwide
• AI-powered personalized recommendations

${data.preferredDestination ? `
🎯 PERSONALIZED FOR YOU:
We noticed you're interested in ${data.preferredDestination}. We'll send you exclusive deals and price alerts for flights there first!
` : ''}

📬 WHAT TO EXPECT NEXT:
• Weekly curated flight deals matching your interests
• Flash sale alerts for last-minute bookings  
• Travel tips and destination guides
• Exclusive member-only promotional codes

🚀 GET STARTED:
• Browse current deals: https://fly2any.com/flights
• Set up price alerts: https://fly2any.com/alerts

📊 JOIN 100K+ SMART TRAVELERS:
• $2.3M Total Saved by our community
• 500+ Destinations available
• 4.9⭐ Average user rating

❓ QUESTIONS? WE'RE HERE TO HELP:
Email: support@fly2any.com
WhatsApp: +1 (888) 359-2269

---
Fly2Any - Your Travel Companion
This email was sent to ${data.email}

Don't want these emails? Reply with "UNSUBSCRIBE" 
© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `
  };
}