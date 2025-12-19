/**
 * Affiliate Email Notification Service
 * Handles all email notifications for the affiliate program
 */

import { mailgunClient } from '@/lib/email/mailgun-client'

// Initialize Resend (only if API key exists)


// Configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'affiliates@fly2any.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fly2any.com'
const COMPANY_NAME = 'Fly2Any'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface AffiliateRegistrationData {
  name: string
  email: string
  businessName?: string
  website?: string
  referralCode: string
  trackingUrl: string
}

interface AffiliateApprovalData {
  name: string
  email: string
  referralCode: string
  trackingUrl: string
  dashboardUrl: string
}

/**
 * Send welcome email to new affiliate applicant
 */
export async function sendAffiliateWelcomeEmail(data: AffiliateRegistrationData) {
  if (!mailgunClient.isConfigured()) {
    console.warn('⚠️  Email service not configured (RESEND_API_KEY missing)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const subject = `Welcome to ${COMPANY_NAME} Affiliate Program!`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Welcome, Partner!</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 18px;">Your affiliate application has been received</p>
  </div>

  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${data.name},</p>

    <p style="font-size: 16px;">Thank you for applying to join the <strong>${COMPANY_NAME} Affiliate Program</strong>! We're excited to have you on board.</p>

    <!-- Status Box -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">📋 Application Status: PENDING REVIEW</h3>
      <p style="margin: 0; color: #78350f; font-size: 15px;">
        Our team will review your application within 1-2 business days. You'll receive an email once your account is approved.
      </p>
    </div>

    <!-- Application Details -->
    <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin: 25px 0; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">📝 Your Application Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${data.businessName ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Business Name:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1f2937;">${data.businessName}</td>
        </tr>` : ''}
        ${data.website ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Website:</td>
          <td style="padding: 10px 0; text-align: right; color: #3b82f6;"><a href="${data.website}" style="text-decoration: none; color: #3b82f6;">${data.website}</a></td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-weight: 600;">Your Referral Code:</td>
          <td style="padding: 12px 0; text-align: right;">
            <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #8b5cf6; background: #f3e8ff; padding: 6px 12px; border-radius: 6px;">${data.referralCode}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- What Happens Next -->
    <h3 style="color: #1f2937; font-size: 20px; margin-top: 30px;">⏭️ What Happens Next?</h3>
    <ol style="color: #4b5563; font-size: 15px; line-height: 1.8; padding-left: 20px;">
      <li><strong>Review (1-2 days):</strong> Our team will review your application and marketing channels</li>
      <li><strong>Approval Email:</strong> You'll receive an email with your tracking links and dashboard access</li>
      <li><strong>Start Promoting:</strong> Share your links and start earning commissions!</li>
      <li><strong>First Payout:</strong> Earn at least $50 to request your first payout</li>
    </ol>

    <!-- Commission Structure -->
    <div style="margin: 30px 0;">
      <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 15px;">💰 Commission Structure</h3>
      <div style="display: flex; gap: 10px;">
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);">
              <th style="padding: 12px; text-align: left; color: white; font-size: 14px;">Tier</th>
              <th style="padding: 12px; text-align: center; color: white; font-size: 14px;">Monthly Trips</th>
              <th style="padding: 12px; text-align: right; color: white; font-size: 14px;">Commission</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #6b7280;">🥉 Starter</td>
              <td style="padding: 12px; text-align: center; color: #6b7280;">0-4</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #3b82f6;">15%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #cd7f32;">🥉 Bronze</td>
              <td style="padding: 12px; text-align: center; color: #6b7280;">5-14</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #3b82f6;">20%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #c0c0c0;">🥈 Silver</td>
              <td style="padding: 12px; text-align: center; color: #6b7280;">15-29</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #3b82f6;">25%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #ffd700;">🥇 Gold</td>
              <td style="padding: 12px; text-align: center; color: #6b7280;">30-49</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #3b82f6;">30%</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #8b5cf6;">💎 Platinum</td>
              <td style="padding: 12px; text-align: center; color: #6b7280;">50+</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #10b981; font-size: 16px;">35%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 10px 0 0 0; font-style: italic;">* Commission based on our profit margin per booking</p>
    </div>

    <!-- CTA Box -->
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border: 2px solid #3b82f6; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
      <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">📊 Check Application Status</h3>
      <p style="margin: 0 0 20px 0; color: #1e40af;">Log in to view your application status and access your dashboard once approved.</p>
      <a href="${APP_URL}/affiliate/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Dashboard</a>
    </div>

    <!-- Questions -->
    <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
      <h3 style="color: #1f2937; font-size: 18px;">❓ Have Questions?</h3>
      <p style="color: #6b7280; font-size: 15px; margin: 10px 0;">
        Our affiliate support team is here to help! Reach out anytime:
      </p>
      <p style="color: #3b82f6; font-size: 15px; margin: 5px 0;">
        📧 <a href="mailto:${FROM_EMAIL}" style="color: #3b82f6; text-decoration: none;">${FROM_EMAIL}</a>
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #6b7280; margin: 0; font-size: 14px;">
      You're receiving this email because you applied to the ${COMPANY_NAME} Affiliate Program.
    </p>
    <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 13px;">
      © ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
    </p>
  </div>
</body>
</html>
    `

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    })

    console.log(`✅ Welcome email sent to affiliate: ${data.email}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send affiliate welcome email:', error)
    return { success: false, error }
  }
}

/**
 * Send approval email to affiliate
 */
export async function sendAffiliateApprovalEmail(data: AffiliateApprovalData) {
  if (!mailgunClient.isConfigured()) {
    console.warn('⚠️  Email service not configured (RESEND_API_KEY missing)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const subject = `🎉 Your ${COMPANY_NAME} Affiliate Account is Approved!`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
  <!-- Celebration Header -->
  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 50px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 36px;">🎉 Congratulations!</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 20px;">You're officially a ${COMPANY_NAME} Affiliate Partner!</p>
  </div>

  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${data.name},</p>

    <p style="font-size: 16px;"><strong>Great news!</strong> Your affiliate application has been approved. You can now start earning commissions by promoting ${COMPANY_NAME}.</p>

    <!-- Tracking URL Box -->
    <div style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border: 3px solid #3b82f6; padding: 25px; border-radius: 10px; margin: 30px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">🔗 Your Unique Tracking URL</h3>
      <div style="background: white; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 15px; color: #3b82f6; word-break: break-all; margin-bottom: 15px;">
        ${data.trackingUrl}
      </div>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">Share this link everywhere - every booking through it earns you commission!</p>
    </div>

    <!-- Quick Start Guide -->
    <h3 style="color: #1f2937; font-size: 20px; margin-top: 30px;">🚀 Quick Start Guide</h3>
    <ol style="color: #4b5563; font-size: 15px; line-height: 1.9; padding-left: 20px;">
      <li><strong>Access Your Dashboard:</strong> Log in to track clicks, bookings, and earnings in real-time</li>
      <li><strong>Share Your Link:</strong> Post on social media, add to your website, share with travel groups</li>
      <li><strong>Track Performance:</strong> Monitor what's working and optimize your strategy</li>
      <li><strong>Earn & Withdraw:</strong> Request payouts once you reach $50 balance</li>
    </ol>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Access Your Dashboard →</a>
    </div>

    <!-- Referral Code -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e7eb;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Your Referral Code:</td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="font-family: monospace; font-size: 22px; font-weight: bold; color: #8b5cf6;">${data.referralCode}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Current Tier:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #6b7280;">🥉 Starter (15%)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Min. Payout:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">$50 USD</td>
        </tr>
      </table>
    </div>

    <!-- Tips for Success -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px;">💡 Tips for Success</h3>
      <ul style="margin: 0; padding-left: 20px; color: #78350f;">
        <li style="margin: 8px 0;">Share authentic travel stories with your link</li>
        <li style="margin: 8px 0;">Post consistently on social media channels</li>
        <li style="margin: 8px 0;">Join travel Facebook groups and share value first</li>
        <li style="margin: 8px 0;">Create comparison content (e.g., "Best Flight Deals to Europe")</li>
      </ul>
    </div>

    <!-- Support -->
    <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
      <h3 style="color: #1f2937; font-size: 18px;">💬 Need Help?</h3>
      <p style="color: #6b7280; font-size: 15px; margin: 10px 0;">
        Our affiliate support team is here to help you succeed:
      </p>
      <p style="color: #3b82f6; font-size: 15px; margin: 5px 0;">
        📧 <a href="mailto:${FROM_EMAIL}" style="color: #3b82f6; text-decoration: none;">${FROM_EMAIL}</a>
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">
      Ready to start earning? Let's make it happen! 💰
    </p>
    <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 13px;">
      © ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
    </p>
  </div>
</body>
</html>
    `

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    })

    console.log(`✅ Approval email sent to affiliate: ${data.email}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send affiliate approval email:', error)
    return { success: false, error }
  }
}

/**
 * Send notification to admin about new affiliate application
 */
export async function sendAdminAffiliateNotification(data: AffiliateRegistrationData) {
  if (!mailgunClient.isConfigured()) {
    console.warn('⚠️  Email service not configured (RESEND_API_KEY missing)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const subject = `🆕 New Affiliate Application - ${data.name || data.email}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1f2937; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🆕 New Affiliate Application</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
    <p>A new affiliate has applied to join the ${COMPANY_NAME} Affiliate Program:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; font-weight: bold;">Name:</td>
        <td style="padding: 12px 0;">${data.name}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; font-weight: bold;">Email:</td>
        <td style="padding: 12px 0;">${data.email}</td>
      </tr>
      ${data.businessName ? `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; font-weight: bold;">Business:</td>
        <td style="padding: 12px 0;">${data.businessName}</td>
      </tr>` : ''}
      ${data.website ? `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; font-weight: bold;">Website:</td>
        <td style="padding: 12px 0;"><a href="${data.website}">${data.website}</a></td>
      </tr>` : ''}
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; font-weight: bold;">Referral Code:</td>
        <td style="padding: 12px 0;"><code>${data.referralCode}</code></td>
      </tr>
    </table>

    <div style="margin: 30px 0; text-align: center;">
      <a href="${APP_URL}/admin/affiliates" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Application</a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Please review and approve/reject this application in the admin panel.
    </p>
  </div>
</body>
</html>
    `

    const result = await mailgunClient.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    })

    console.log(`✅ Admin notification sent for affiliate: ${data.email}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
    return { success: false, error }
  }
}
