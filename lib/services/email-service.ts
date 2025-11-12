/**
 * Email Service
 *
 * Centralized email sending service using Resend
 * Fallback to console logging if not configured
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface TripBookingEmailData {
  userName: string;
  tripTitle: string;
  tripDestination: string;
  tripDate: string;
  amount: number;
  tripUrl: string;
}

interface CreditEarnedEmailData {
  userName: string;
  creditsEarned: number;
  usdValue: number;
  tripTitle: string;
  dashboardUrl: string;
}

interface WelcomeEmailData {
  userName: string;
  welcomeCredits: number;
  browseUrl: string;
  createUrl: string;
}

export class EmailService {
  private static apiKey = process.env.RESEND_API_KEY;
  private static fromEmail = process.env.EMAIL_FROM || 'noreply@fly2any.com';
  private static baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

  /**
   * Send email (uses Resend if configured, otherwise logs to console)
   */
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      console.log('📧 Email (simulated):', {
        to: options.to,
        subject: options.subject,
        from: options.from || this.fromEmail,
      });
      return true;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: options.from || this.fromEmail,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`);
      }

      console.log('✅ Email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return false;
    }
  }

  /**
   * Send trip booking confirmation email
   */
  static async sendTripBookingConfirmation(
    email: string,
    data: TripBookingEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ Trip Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>Your trip booking has been confirmed!</strong></p>

      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">${data.tripTitle}</h2>
        <p><strong>Destination:</strong> ${data.tripDestination}</p>
        <p><strong>Date:</strong> ${data.tripDate}</p>
        <p><strong>Amount Paid:</strong> $${(data.amount / 100).toFixed(2)}</p>
      </div>

      <p>Get ready for an amazing adventure! You'll receive more details about your trip closer to the departure date.</p>

      <a href="${data.tripUrl}" class="button">View Trip Details</a>
    </div>
    <div class="footer">
      <p>TripMatch - Social Travel Platform</p>
      <p>© 2025 Fly2Any. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Trip Confirmed: ${data.tripTitle}`,
      html,
    });
  }

  /**
   * Send credits earned notification
   */
  static async sendCreditsEarned(
    email: string,
    data: CreditEarnedEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .credits { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You Earned Credits!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>Great news!</strong> Someone joined your trip and you've earned rewards:</p>

      <div class="credits">
        <h2 style="margin: 0; font-size: 48px;">${data.creditsEarned}</h2>
        <p style="margin: 5px 0; font-size: 18px;">Credits Earned</p>
        <p style="margin: 0; opacity: 0.9;">Value: $${data.usdValue.toFixed(2)} USD</p>
      </div>

      <p><strong>Trip:</strong> ${data.tripTitle}</p>
      <p>Use your credits towards your next booking or save them to unlock higher tiers with bonus multipliers!</p>

      <a href="${data.dashboardUrl}" class="button">View Dashboard</a>
    </div>
    <div class="footer">
      <p>TripMatch - Earn While You Travel</p>
      <p>© 2025 Fly2Any. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `You earned ${data.creditsEarned} credits ($${data.usdValue.toFixed(2)})!`,
      html,
    });
  }

  /**
   * Send welcome email with bonus credits
   */
  static async sendWelcomeEmail(
    email: string,
    data: WelcomeEmailData
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .welcome-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌍 Welcome to TripMatch!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>Welcome to the world's first social travel rewards platform!</strong></p>

      <div class="welcome-box">
        <h3 style="margin-top: 0;">🎁 Welcome Bonus</h3>
        <p>We've credited your account with <strong>${data.welcomeCredits} credits ($${(data.welcomeCredits / 10).toFixed(2)} value)</strong> to get you started!</p>
      </div>

      <h3>What You Can Do:</h3>
      <ul>
        <li><strong>Browse Trips:</strong> Find amazing group travel experiences</li>
        <li><strong>Create Trips:</strong> Organize your own adventure and earn credits</li>
        <li><strong>Earn Rewards:</strong> Get paid when people join your trips</li>
        <li><strong>Book Travel:</strong> Use credits towards flights, hotels & more</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.browseUrl}" class="button">Browse Trips</a>
        <a href="${data.createUrl}" class="button">Create Trip</a>
      </div>
    </div>
    <div class="footer">
      <p>TripMatch - Travel Together, Earn Together</p>
      <p>© 2025 Fly2Any. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to TripMatch! Here's ${data.welcomeCredits} credits to start 🎁`,
      html,
    });
  }
}
