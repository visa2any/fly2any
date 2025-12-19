/**
 * Email Marketing System - Fly2Any Growth OS
 * Automated email sequences, newsletters, and transactional emails
 */

export enum EmailTemplateType {
  WELCOME = 'welcome',
  PRICE_ALERT = 'price_alert',
  WEEKLY_DEALS = 'weekly_deals',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  ABANDONED_SEARCH = 'abandoned_search',
  REFERRAL_INVITE = 'referral_invite',
  REFERRAL_SUCCESS = 'referral_success',
  POINTS_EARNED = 'points_earned'
}

export interface EmailRecipient {
  email: string
  name?: string
  userId?: string
  preferences?: Record<string, boolean>
}

export interface EmailTemplate {
  type: EmailTemplateType
  subject: string
  preheader?: string
  html: string
  text: string
}

export interface EmailCampaign {
  id: string
  name: string
  template: EmailTemplateType
  recipients: number
  sent: number
  opened: number
  clicked: number
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduledAt?: Date
}

export class EmailMarketingService {
  constructor() {}

  /**
   * Send transactional email via Mailgun
   */
  async sendEmail(to: EmailRecipient, template: EmailTemplateType, data: Record<string, any>): Promise<boolean> {
    const emailTemplate = this.getTemplate(template, data)

    try {
      const { mailgunClient } = await import('@/lib/email/mailgun-client')
      const result = await mailgunClient.send({
        to: to.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        forceSend: true,
      })
      return result.success
    } catch (error) {
      console.error('Email send error:', error)
      return false
    }
  }

  /**
   * Send bulk campaign
   */
  async sendCampaign(campaign: EmailCampaign, recipients: EmailRecipient[], data: Record<string, any>): Promise<{sent: number, failed: number}> {
    let sent = 0, failed = 0

    for (const recipient of recipients) {
      const success = await this.sendEmail(recipient, campaign.template, {
        ...data,
        recipientName: recipient.name,
        recipientEmail: recipient.email
      })
      success ? sent++ : failed++

      // Rate limiting
      await new Promise(r => setTimeout(r, 100))
    }

    return { sent, failed }
  }

  /**
   * Get email template with data interpolation
   */
  private getTemplate(type: EmailTemplateType, data: Record<string, any>): EmailTemplate {
    const templates: Record<EmailTemplateType, () => EmailTemplate> = {
      [EmailTemplateType.WELCOME]: () => ({
        type,
        subject: `Welcome to Fly2Any, ${data.name || 'Traveler'}!`,
        preheader: 'Start saving on flights today',
        html: this.welcomeEmailHtml(data),
        text: `Welcome to Fly2Any! Start finding the best flight deals at fly2any.com`
      }),

      [EmailTemplateType.PRICE_ALERT]: () => ({
        type,
        subject: `Price Drop Alert: ${data.route} now $${data.price}!`,
        preheader: `Save $${data.savings} on your flight`,
        html: this.priceAlertHtml(data),
        text: `Great news! The price for ${data.route} dropped to $${data.price}. Book now!`
      }),

      [EmailTemplateType.WEEKLY_DEALS]: () => ({
        type,
        subject: `This Week's Top Flight Deals`,
        preheader: 'Up to 60% off popular routes',
        html: this.weeklyDealsHtml(data),
        text: `Check out this week's best flight deals at fly2any.com`
      }),

      [EmailTemplateType.BOOKING_CONFIRMATION]: () => ({
        type,
        subject: `Booking Confirmed: ${data.route}`,
        preheader: `Confirmation #${data.confirmationNumber}`,
        html: this.bookingConfirmationHtml(data),
        text: `Your booking is confirmed! Confirmation: ${data.confirmationNumber}`
      }),

      [EmailTemplateType.ABANDONED_SEARCH]: () => ({
        type,
        subject: `Still looking for ${data.destination}?`,
        preheader: 'We found better prices for you',
        html: this.abandonedSearchHtml(data),
        text: `We noticed you were searching for flights to ${data.destination}. Check out these deals!`
      }),

      [EmailTemplateType.REFERRAL_INVITE]: () => ({
        type,
        subject: `${data.referrerName} wants you to save on flights`,
        preheader: 'Get exclusive flight deals',
        html: this.referralInviteHtml(data),
        text: `${data.referrerName} invited you to Fly2Any. Sign up and start saving!`
      }),

      [EmailTemplateType.REFERRAL_SUCCESS]: () => ({
        type,
        subject: `You earned ${data.points} points!`,
        preheader: 'Your referral just signed up',
        html: this.referralSuccessHtml(data),
        text: `Great news! ${data.refereeName} signed up and you earned ${data.points} points!`
      }),

      [EmailTemplateType.POINTS_EARNED]: () => ({
        type,
        subject: `${data.points} points added to your account`,
        preheader: 'Keep earning for free flights',
        html: this.pointsEarnedHtml(data),
        text: `You just earned ${data.points} points! Total: ${data.totalPoints}`
      })
    }

    return templates[type]()
  }

  // Email HTML Templates - Apple-class design
  private baseHtml(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f7; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center; }
    .header img { height: 40px; }
    .content { padding: 40px 32px; }
    .footer { background: #f5f5f7; padding: 24px 32px; text-align: center; font-size: 12px; color: #86868b; }
    .btn { display: inline-block; background: #2563eb; color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; }
    .btn:hover { background: #1d4ed8; }
    h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 16px; }
    p { font-size: 16px; line-height: 1.6; color: #424245; margin: 0 0 16px; }
    .deal-card { background: #f5f5f7; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .price { font-size: 36px; font-weight: 700; color: #2563eb; }
    .original-price { text-decoration: line-through; color: #86868b; font-size: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://fly2any.com/logo-white.png" alt="Fly2Any" />
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Fly2Any - Find Your Perfect Flight</p>
      <p><a href="https://fly2any.com/unsubscribe">Unsubscribe</a> | <a href="https://fly2any.com/preferences">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`
  }

  private welcomeEmailHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>Welcome to Fly2Any!</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>You're now part of a community of smart travelers who save up to 60% on flights. Here's what you can do:</p>
      <div class="deal-card">
        <p><strong>Set Price Alerts</strong> - Get notified when prices drop</p>
        <p><strong>Earn Rewards</strong> - Refer friends and earn points</p>
        <p><strong>Weekly Deals</strong> - Exclusive deals in your inbox</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="https://fly2any.com/search" class="btn">Start Searching</a>
      </p>
    `)
  }

  private priceAlertHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>Price Drop Alert!</h1>
      <p>Great news! The price for your watched route just dropped.</p>
      <div class="deal-card" style="text-align: center;">
        <p style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${data.origin} → ${data.destination}</p>
        <p><span class="original-price">$${data.originalPrice}</span></p>
        <p class="price">$${data.price}</p>
        <p style="color: #22c55e; font-weight: 600;">Save $${data.savings}!</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="${data.bookingUrl}" class="btn">Book Now</a>
      </p>
      <p style="font-size: 14px; color: #86868b; text-align: center;">Prices may change. Book soon to lock in this rate.</p>
    `)
  }

  private weeklyDealsHtml(data: Record<string, any>): string {
    const dealsHtml = (data.deals || []).map((deal: any) => `
      <div class="deal-card">
        <p style="font-weight: 600;">${deal.route}</p>
        <p class="price">$${deal.price}</p>
        <p style="color: #22c55e;">Save ${deal.discount}%</p>
      </div>
    `).join('')

    return this.baseHtml(`
      <h1>This Week's Top Deals</h1>
      <p>Hand-picked flight deals just for you:</p>
      ${dealsHtml}
      <p style="text-align: center; margin-top: 32px;">
        <a href="https://fly2any.com/deals" class="btn">View All Deals</a>
      </p>
    `)
  }

  private bookingConfirmationHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>Booking Confirmed!</h1>
      <p>Your flight is booked. Here are your details:</p>
      <div class="deal-card">
        <p><strong>Confirmation:</strong> ${data.confirmationNumber}</p>
        <p><strong>Route:</strong> ${data.route}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Passengers:</strong> ${data.passengers}</p>
        <p class="price">$${data.price}</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="https://fly2any.com/bookings/${data.bookingId}" class="btn">View Booking</a>
      </p>
    `)
  }

  private abandonedSearchHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>Still dreaming of ${data.destination}?</h1>
      <p>We noticed you were looking for flights. Good news - we found some great options!</p>
      <div class="deal-card" style="text-align: center;">
        <p style="font-weight: 600;">${data.origin} → ${data.destination}</p>
        <p class="price">From $${data.lowestPrice}</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="${data.searchUrl}" class="btn">Continue Searching</a>
      </p>
    `)
  }

  private referralInviteHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>${data.referrerName} thinks you'll love Fly2Any</h1>
      <p>Your friend invited you to join Fly2Any and start saving on flights!</p>
      <div class="deal-card" style="text-align: center;">
        <p style="font-size: 18px;">Sign up with this link and both of you earn rewards!</p>
        <p style="font-weight: 600; color: #2563eb;">${data.referralCode}</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="${data.referralUrl}" class="btn">Join Fly2Any</a>
      </p>
    `)
  }

  private referralSuccessHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>You earned ${data.points} points!</h1>
      <p>Great news! ${data.refereeName} just signed up using your referral link.</p>
      <div class="deal-card" style="text-align: center;">
        <p style="font-size: 18px;">Points Earned</p>
        <p class="price">${data.points}</p>
        <p>Total Points: ${data.totalPoints}</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="https://fly2any.com/rewards" class="btn">View Rewards</a>
      </p>
    `)
  }

  private pointsEarnedHtml(data: Record<string, any>): string {
    return this.baseHtml(`
      <h1>Points Added!</h1>
      <p>You've earned more Fly2Any points.</p>
      <div class="deal-card" style="text-align: center;">
        <p style="font-size: 18px;">+${data.points} points</p>
        <p style="font-weight: 600; color: #2563eb;">Total: ${data.totalPoints} points</p>
        <p style="color: #86868b;">Worth $${(data.totalPoints / 100).toFixed(2)} in travel credit</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="https://fly2any.com/rewards" class="btn">Redeem Points</a>
      </p>
    `)
  }
}

export const emailService = new EmailMarketingService()
