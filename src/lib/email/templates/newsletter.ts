/**
 * 📰 NEWSLETTER EMAIL TEMPLATE
 * Weekly/monthly newsletter with travel news, deals, and tips
 */

import { EmailTemplate } from '../email-service';

export default function newsletterTemplate(data: {
  firstName?: string;
  email: string;
  newsletterTitle: string;
  edition: string;
  date: string;
  featuredDestination: {
    name: string;
    description: string;
    imageUrl: string;
    bestTime: string;
    avgPrice: number;
    currency: string;
    dealUrl: string;
  };
  topDeals: Array<{
    origin: string;
    destination: string;
    price: number;
    currency: string;
    savings?: number;
    validUntil: string;
    dealUrl: string;
  }>;
  travelNews: Array<{
    headline: string;
    summary: string;
    readMoreUrl?: string;
    category: 'news' | 'tips' | 'deals' | 'destinations';
  }>;
  travelTips: Array<{
    title: string;
    tip: string;
    category: string;
  }>;
  upcomingEvents?: Array<{
    name: string;
    location: string;
    date: string;
    description: string;
  }>;
}): EmailTemplate {
  const personalizedGreeting = data.firstName ? `Hi ${data.firstName}` : 'Hello Traveler';
  
  return {
    subject: `${data.newsletterTitle} - ${data.edition} | ${data.featuredDestination.name} spotlight 🌟`,
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.newsletterTitle} - ${data.edition}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .newsletter-info { margin: 15px 0 0; opacity: 0.9; }
    .edition-badge { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 6px 12px; display: inline-block; font-size: 14px; }
    .content { padding: 30px 20px; }
    .greeting { text-align: center; margin-bottom: 30px; }
    .greeting h2 { color: #1F2937; margin: 0 0 10px; }
    .section { margin: 40px 0; }
    .section-header { border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 20px; }
    .section-header h3 { margin: 0; color: #1F2937; font-size: 20px; }
    .featured-destination { background: linear-gradient(135deg, #EBF8FF, #DBEAFE); border-radius: 12px; padding: 0; overflow: hidden; margin: 25px 0; }
    .featured-image { width: 100%; height: 200px; background-size: cover; background-position: center; position: relative; }
    .featured-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; padding: 20px; }
    .featured-content { padding: 20px; }
    .featured-stats { display: flex; justify-content: space-between; background: #F0F9FF; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .stat { text-align: center; }
    .stat-value { font-weight: bold; color: #1E40AF; }
    .stat-label { font-size: 12px; color: #6B7280; }
    .deals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
    .deal-card { background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #10B981; }
    .deal-route { font-weight: bold; color: #1F2937; margin-bottom: 8px; }
    .deal-price { color: #DC2626; font-size: 18px; font-weight: bold; }
    .deal-savings { color: #059669; font-size: 12px; }
    .deal-expiry { color: #6B7280; font-size: 12px; margin-top: 8px; }
    .deal-button { display: inline-block; background: #3B82F6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 10px; }
    .news-grid { display: grid; gap: 20px; }
    .news-item { background: #F9FAFB; border-radius: 8px; padding: 20px; border-left: 4px solid #6366F1; }
    .news-category { display: inline-block; background: #6366F1; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
    .news-headline { font-weight: bold; color: #1F2937; margin: 0 0 8px; }
    .news-summary { color: #6B7280; margin: 0; }
    .read-more { color: #3B82F6; text-decoration: none; font-size: 14px; }
    .tips-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .tip-card { background: #F0FDF4; border-radius: 8px; padding: 15px; border-left: 4px solid #10B981; }
    .tip-category { color: #059669; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
    .tip-title { font-weight: bold; color: #1F2937; margin: 0 0 8px; }
    .tip-content { color: #374151; font-size: 14px; margin: 0; }
    .events-timeline { background: #FEF3C7; border-radius: 12px; padding: 20px; }
    .event-item { border-left: 3px solid #F59E0B; padding-left: 15px; margin: 15px 0; }
    .event-date { color: #92400E; font-weight: bold; font-size: 14px; }
    .event-name { font-weight: bold; color: #1F2937; margin: 5px 0; }
    .event-location { color: #6B7280; font-style: italic; }
    .cta-section { background: linear-gradient(135deg, #1F2937, #374151); color: white; border-radius: 12px; padding: 30px 20px; text-align: center; margin: 30px 0; }
    .cta-section h3 { margin: 0 0 15px; }
    .cta-section p { margin: 0 0 20px; opacity: 0.9; }
    .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 0 10px; }
    .footer { background: #F9FAFB; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 5px 0; color: #6B7280; font-size: 14px; }
    .social-links { margin: 15px 0; }
    .social-links a { display: inline-block; margin: 0 10px; color: #6B7280; text-decoration: none; }
    @media (max-width: 600px) {
      .deals-grid { grid-template-columns: 1fr; }
      .tips-grid { grid-template-columns: 1fr; }
      .featured-stats { flex-direction: column; gap: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ ${data.newsletterTitle}</h1>
      <div class="newsletter-info">
        <div class="edition-badge">${data.edition}</div>
        <p>${new Date(data.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <div class="greeting">
        <h2>${personalizedGreeting}! 👋</h2>
        <p>Welcome to this week's travel inspiration, deals, and tips from around the world!</p>
      </div>

      <!-- Featured Destination -->
      <div class="section">
        <div class="section-header">
          <h3>🌟 Destination Spotlight</h3>
        </div>
        <div class="featured-destination">
          <div class="featured-image" style="background-image: url('${data.featuredDestination.imageUrl}');">
            <div class="featured-overlay">
              <h3 style="margin: 0; font-size: 24px;">${data.featuredDestination.name}</h3>
            </div>
          </div>
          <div class="featured-content">
            <p style="margin: 0 0 15px; color: #374151;">${data.featuredDestination.description}</p>
            <div class="featured-stats">
              <div class="stat">
                <div class="stat-value">Best Time</div>
                <div class="stat-label">${data.featuredDestination.bestTime}</div>
              </div>
              <div class="stat">
                <div class="stat-value">${data.featuredDestination.currency}${data.featuredDestination.avgPrice}</div>
                <div class="stat-label">Avg. Flight Price</div>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="${data.featuredDestination.dealUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=destination_spotlight" 
                 class="cta-button">
                Explore ${data.featuredDestination.name}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Deals -->
      <div class="section">
        <div class="section-header">
          <h3>🔥 This Week's Top Deals</h3>
        </div>
        <div class="deals-grid">
          ${data.topDeals.map(deal => `
          <div class="deal-card">
            <div class="deal-route">${deal.origin} → ${deal.destination}</div>
            <div class="deal-price">${deal.currency}${deal.price}</div>
            ${deal.savings ? `<div class="deal-savings">Save $${deal.savings}</div>` : ''}
            <div class="deal-expiry">Valid until ${new Date(deal.validUntil).toLocaleDateString()}</div>
            <a href="${deal.dealUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_deals" class="deal-button">
              Book Now
            </a>
          </div>
          `).join('')}
        </div>
      </div>

      <!-- Travel News -->
      <div class="section">
        <div class="section-header">
          <h3>📰 Travel News & Updates</h3>
        </div>
        <div class="news-grid">
          ${data.travelNews.map(news => `
          <div class="news-item">
            <div class="news-category ${news.category}">${news.category.toUpperCase()}</div>
            <h4 class="news-headline">${news.headline}</h4>
            <p class="news-summary">${news.summary}</p>
            ${news.readMoreUrl ? `<a href="${news.readMoreUrl}" class="read-more">Read More →</a>` : ''}
          </div>
          `).join('')}
        </div>
      </div>

      <!-- Travel Tips -->
      <div class="section">
        <div class="section-header">
          <h3>💡 Travel Tips & Tricks</h3>
        </div>
        <div class="tips-grid">
          ${data.travelTips.map(tip => `
          <div class="tip-card">
            <div class="tip-category">${tip.category}</div>
            <h4 class="tip-title">${tip.title}</h4>
            <p class="tip-content">${tip.tip}</p>
          </div>
          `).join('')}
        </div>
      </div>

      <!-- Upcoming Events -->
      ${data.upcomingEvents && data.upcomingEvents.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <h3>📅 Upcoming Travel Events</h3>
        </div>
        <div class="events-timeline">
          ${data.upcomingEvents.map(event => `
          <div class="event-item">
            <div class="event-date">${new Date(event.date).toLocaleDateString()}</div>
            <div class="event-name">${event.name}</div>
            <div class="event-location">${event.location}</div>
            <p style="margin: 8px 0 0; color: #6B7280; font-size: 14px;">${event.description}</p>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Call to Action -->
      <div class="cta-section">
        <h3>Ready for your next adventure? 🌍</h3>
        <p>Don't miss out on these exclusive deals and travel opportunities!</p>
        <a href="https://fly2any.com/deals?utm_source=newsletter&utm_medium=email&utm_campaign=cta" class="cta-button">
          Browse All Deals
        </a>
        <a href="https://fly2any.com/alerts?utm_source=newsletter&utm_medium=email&utm_campaign=cta" class="cta-button" style="background: #10B981;">
          Set Price Alert
        </a>
      </div>

      <!-- Feedback -->
      <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center;">
        <h4 style="margin: 0 0 10px; color: #374151;">💌 We'd love your feedback!</h4>
        <p style="margin: 0 0 15px; color: #6B7280;">How can we make our newsletter even better for you?</p>
        <a href="mailto:feedback@fly2any.com?subject=Newsletter Feedback" style="color: #3B82F6; text-decoration: none;">
          Send us your thoughts →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Fly2Any - Your Travel Companion</strong></p>
      <div class="social-links">
        <a href="https://facebook.com/fly2any">Facebook</a>
        <a href="https://instagram.com/fly2any">Instagram</a>
        <a href="https://twitter.com/fly2any">Twitter</a>
        <a href="https://linkedin.com/company/fly2any">LinkedIn</a>
      </div>
      <p>This newsletter was sent to ${data.email}</p>
      <p style="font-size: 12px; color: #9CA3AF;">
        <a href="%unsubscribe_url%" style="color: #9CA3AF;">Unsubscribe</a> | 
        <a href="https://fly2any.com/newsletter/preferences" style="color: #9CA3AF;">Email Preferences</a> |
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
${data.newsletterTitle.toUpperCase()} - ${data.edition.toUpperCase()}
${'='.repeat(data.newsletterTitle.length + data.edition.length + 3)}

${new Date(data.date).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

${personalizedGreeting}! 👋

Welcome to this week's travel inspiration, deals, and tips from around the world!

🌟 DESTINATION SPOTLIGHT: ${data.featuredDestination.name.toUpperCase()}
${data.featuredDestination.description}

• Best Time to Visit: ${data.featuredDestination.bestTime}
• Average Flight Price: ${data.featuredDestination.currency}${data.featuredDestination.avgPrice}
• Explore Now: ${data.featuredDestination.dealUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=destination_spotlight

🔥 THIS WEEK'S TOP DEALS:
${data.topDeals.map((deal, index) => `
${index + 1}. ${deal.origin} → ${deal.destination}
   Price: ${deal.currency}${deal.price}${deal.savings ? ` (Save $${deal.savings})` : ''}
   Valid until: ${new Date(deal.validUntil).toLocaleDateString()}
   Book: ${deal.dealUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_deals
`).join('')}

📰 TRAVEL NEWS & UPDATES:
${data.travelNews.map((news, index) => `
${index + 1}. [${news.category.toUpperCase()}] ${news.headline}
   ${news.summary}${news.readMoreUrl ? `\n   Read more: ${news.readMoreUrl}` : ''}
`).join('')}

💡 TRAVEL TIPS & TRICKS:
${data.travelTips.map((tip, index) => `
${index + 1}. ${tip.title} (${tip.category})
   ${tip.tip}
`).join('')}

${data.upcomingEvents && data.upcomingEvents.length > 0 ? `
📅 UPCOMING TRAVEL EVENTS:
${data.upcomingEvents.map((event, index) => `
${index + 1}. ${event.name} - ${new Date(event.date).toLocaleDateString()}
   Location: ${event.location}
   ${event.description}
`).join('')}
` : ''}

🌍 READY FOR YOUR NEXT ADVENTURE?
Don't miss out on these exclusive deals and travel opportunities!

• Browse All Deals: https://fly2any.com/deals?utm_source=newsletter&utm_medium=email&utm_campaign=cta
• Set Price Alert: https://fly2any.com/alerts?utm_source=newsletter&utm_medium=email&utm_campaign=cta

💌 WE'D LOVE YOUR FEEDBACK!
How can we make our newsletter even better for you?
Send us your thoughts: feedback@fly2any.com

---
Fly2Any - Your Travel Companion
Follow us: Facebook | Instagram | Twitter | LinkedIn

This newsletter was sent to ${data.email}
Unsubscribe: %unsubscribe_url%
Email Preferences: https://fly2any.com/newsletter/preferences
Privacy Policy: https://fly2any.com/privacy

© ${new Date().getFullYear()} Fly2Any. All rights reserved.
    `
  };
}