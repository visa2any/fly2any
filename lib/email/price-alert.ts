/**
 * Price Alert Email Service
 *
 * Sends email notifications when price alerts are triggered
 * Supports multiple email providers (Resend, SendGrid, etc.)
 */

import { formatCityCode } from '@/lib/data/airports';

interface PriceAlertEmailParams {
  to: string;
  userName: string;
  alert: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate: string | null;
    targetPrice: number;
    currentPrice: number;
    currency: string;
    savings: number;
  };
}

/**
 * Format date for email
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generate booking URL
 */
function generateBookingUrl(origin: string, destination: string, departDate: string, returnDate: string | null): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';
  const params = new URLSearchParams({
    from: origin,
    to: destination,
    departure: departDate,
    ...(returnDate ? { return: returnDate } : {}),
    adults: '1',
  });

  return `${baseUrl}/flights/results?${params.toString()}`;
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(params: PriceAlertEmailParams): string {
  const { userName, alert } = params;
  const bookingUrl = generateBookingUrl(alert.origin, alert.destination, alert.departDate, alert.returnDate);
  const savingsPercent = Math.round((alert.savings / (alert.currentPrice + alert.savings)) * 100);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Alert Triggered!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #0087FF 0%, #0057B7 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
    }
    .alert-icon {
      background-color: rgba(255, 255, 255, 0.2);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-center;
      margin-bottom: 20px;
      font-size: 40px;
    }
    .content {
      padding: 40px 20px;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .flight-card {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .route {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .airport {
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
    }
    .airport-name {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    .arrow {
      margin: 0 20px;
      font-size: 24px;
      color: #9ca3af;
    }
    .dates {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 20px;
    }
    .price-section {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      color: white;
      margin-bottom: 20px;
    }
    .price-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    .current-price {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 12px;
    }
    .savings-badge {
      background-color: rgba(255, 255, 255, 0.2);
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: bold;
    }
    .comparison {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
    }
    .comparison-item {
      text-align: center;
    }
    .comparison-label {
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    .comparison-value {
      font-size: 20px;
      font-weight: bold;
    }
    .cta-button {
      display: block;
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .tips {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .tips-title {
      font-size: 16px;
      font-weight: bold;
      color: #92400e;
      margin-bottom: 12px;
    }
    .tips ul {
      margin: 0;
      padding-left: 20px;
      color: #78350f;
    }
    .tips li {
      margin-bottom: 8px;
      font-size: 14px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 12px;
    }
    .footer-links {
      margin-top: 12px;
    }
    .footer-link {
      color: #0087FF;
      text-decoration: none;
      font-size: 12px;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="alert-icon">🎯</div>
      <h1>Price Alert Triggered!</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hi ${userName},
      </div>

      <div class="message">
        Great news! The flight you've been tracking has dropped to your target price. Book now before prices go back up!
      </div>

      <!-- Flight Card -->
      <div class="flight-card">
        <div class="route">
          <div>
            <div class="airport">${alert.origin}</div>
            <div class="airport-name">${formatCityCode(alert.origin)}</div>
          </div>
          <div class="arrow">✈️</div>
          <div>
            <div class="airport">${alert.destination}</div>
            <div class="airport-name">${formatCityCode(alert.destination)}</div>
          </div>
        </div>

        <div class="dates">
          📅 Departure: ${formatDate(alert.departDate)}
          ${alert.returnDate ? `<br>🔄 Return: ${formatDate(alert.returnDate)}` : ''}
        </div>

        <!-- Price Section -->
        <div class="price-section">
          <div class="price-label">Current Price</div>
          <div class="current-price">${alert.currency}${alert.currentPrice.toFixed(0)}</div>
          <div class="savings-badge">
            💰 Save ${alert.currency}${alert.savings.toFixed(0)} (${savingsPercent}%)
          </div>

          <div class="comparison">
            <div class="comparison-item">
              <div class="comparison-label">Your Target</div>
              <div class="comparison-value">${alert.currency}${alert.targetPrice.toFixed(0)}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-label">Previous Price</div>
              <div class="comparison-value">${alert.currency}${(alert.currentPrice + alert.savings).toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <a href="${bookingUrl}" class="cta-button">
        ✈️ Book This Flight Now
      </a>

      <!-- Tips -->
      <div class="tips">
        <div class="tips-title">⚡ Quick Tips</div>
        <ul>
          <li><strong>Act fast:</strong> Flight prices can change within hours</li>
          <li><strong>Book directly:</strong> Click the button above to view this flight</li>
          <li><strong>Check details:</strong> Verify baggage allowance and seat selection</li>
          <li><strong>Save more:</strong> Consider setting alerts for flexible dates</li>
        </ul>
      </div>

      <div class="message" style="text-align: center; color: #9ca3af; font-size: 14px;">
        This price was confirmed at ${new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })} on ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        You're receiving this email because you set up a price alert for this route.
      </div>
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'}/account/alerts" class="footer-link">
          Manage Alerts
        </a>
        •
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'}/account/preferences" class="footer-link">
          Email Preferences
        </a>
      </div>
      <div class="footer-text" style="margin-top: 16px;">
        © ${new Date().getFullYear()} Fly2Any. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version
 */
function generateEmailText(params: PriceAlertEmailParams): string {
  const { userName, alert } = params;
  const bookingUrl = generateBookingUrl(alert.origin, alert.destination, alert.departDate, alert.returnDate);
  const savingsPercent = Math.round((alert.savings / (alert.currentPrice + alert.savings)) * 100);

  return `
Hi ${userName},

🎯 PRICE ALERT TRIGGERED!

Great news! The flight you've been tracking has dropped to your target price.

FLIGHT DETAILS:
Route: ${alert.origin} (${formatCityCode(alert.origin)}) ✈️ ${alert.destination} (${formatCityCode(alert.destination)})
Departure: ${formatDate(alert.departDate)}
${alert.returnDate ? `Return: ${formatDate(alert.returnDate)}` : ''}

PRICE BREAKDOWN:
Current Price: ${alert.currency}${alert.currentPrice.toFixed(0)}
Your Target: ${alert.currency}${alert.targetPrice.toFixed(0)}
You Save: ${alert.currency}${alert.savings.toFixed(0)} (${savingsPercent}%)

⚡ BOOK NOW: ${bookingUrl}

QUICK TIPS:
• Act fast - flight prices can change within hours
• Verify baggage allowance and seat selection
• Consider setting alerts for flexible dates

---
You're receiving this email because you set up a price alert for this route.
Manage your alerts: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'}/account/alerts

© ${new Date().getFullYear()} Fly2Any
  `.trim();
}

/**
 * Send price alert email using Mailgun (unified provider)
 */
export async function sendPriceAlertEmail(params: PriceAlertEmailParams): Promise<void> {
  const html = generateEmailHTML(params);
  const text = generateEmailText(params);

  // Use Mailgun (unified email provider for Fly2Any)
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mail.fly2any.com';
  const FROM_EMAIL = process.env.EMAIL_FROM || 'Fly2Any <noreply@mail.fly2any.com>';

  if (!MAILGUN_API_KEY) {
    console.warn('⚠️ MAILGUN_API_KEY not configured. Email not sent.');

    // In development, log email content for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 EMAIL PREVIEW (Dev Mode):');
      console.log('To:', params.to);
      console.log('Subject:', `Price Alert: ${params.alert.origin} → ${params.alert.destination}`);
      console.log('\nPlain Text:');
      console.log(text);
      console.log('\n');
    }
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('from', FROM_EMAIL);
    formData.append('to', params.to);
    formData.append('subject', `🎯 Price Alert: ${params.alert.origin} → ${params.alert.destination} is now ${params.alert.currency}${params.alert.currentPrice}!`);
    formData.append('html', html);
    formData.append('text', text);
    formData.append('h:Reply-To', 'support@fly2any.com');
    formData.append('o:tag', 'price-alert');
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Price alert email sent via Mailgun to ${params.to}:`, result.id);
  } catch (error) {
    console.error('❌ Mailgun price alert email failed:', error);
    throw error;
  }
}
