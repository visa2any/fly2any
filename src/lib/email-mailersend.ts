import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend client
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || 'mlsn.ec479149fa82385db9f243869ff65ead519498c3e2de85810e24c77f61c6fa75',
});

// Default sender configuration
const DEFAULT_SENDER: Sender = {
  email: process.env.MAILERSEND_FROM_EMAIL || 'noreply@trial-jy7zpl9ddj6g5vx6.mlsender.net',
  name: process.env.MAILERSEND_FROM_NAME || 'Fly2Any'
};

export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    content: string;
    filename: string;
    encoding?: string;
  }>;
  tags?: string[];
  variables?: Record<string, any>;
}

export async function sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Convert recipients to array
    const toAddresses = Array.isArray(data.to) ? data.to : [data.to];
    const recipients: Recipient[] = toAddresses.map(email => ({ email }));

    // Build email parameters
    const emailParams = new EmailParams()
      .setFrom(DEFAULT_SENDER)
      .setTo(recipients)
      .setSubject(data.subject);

    // Add content
    if (data.html) {
      emailParams.setHtml(data.html);
    }
    if (data.text) {
      emailParams.setText(data.text);
    }

    // Add reply-to if provided
    if (data.replyTo) {
      emailParams.setReplyTo({ email: data.replyTo });
    }

    // Add CC recipients
    if (data.cc && data.cc.length > 0) {
      const ccRecipients: Recipient[] = data.cc.map(email => ({ email }));
      emailParams.setCc(ccRecipients);
    }

    // Add BCC recipients
    if (data.bcc && data.bcc.length > 0) {
      const bccRecipients: Recipient[] = data.bcc.map(email => ({ email }));
      emailParams.setBcc(bccRecipients);
    }

    // Add tags for tracking
    if (data.tags && data.tags.length > 0) {
      emailParams.setTags(data.tags);
    }

    // Add variables for personalization
    if (data.variables) {
      // Note: setVariables might not be available in all MailerSend SDK versions
      // This is a workaround until the SDK is updated
      const paramsWithVariables = emailParams as any;
      if (typeof paramsWithVariables.setVariables === 'function') {
        Object.entries(data.variables).forEach(([email, vars]) => {
          paramsWithVariables.setVariables([{ email, substitutions: vars }]);
        });
      }
    }

    // Send the email
    const response = await mailerSend.email.send(emailParams);
    
    console.log('✅ Email sent successfully via MailerSend:', {
      messageId: response.headers?.['x-message-id'],
      to: toAddresses
    });

    return { 
      success: true, 
      messageId: response.headers?.['x-message-id'] as string 
    };
  } catch (error: any) {
    console.error('❌ MailerSend error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
}

// Lead notification email template
export async function sendLeadNotification(lead: any): Promise<{ success: boolean; error?: string }> {
  const subject = `New Lead: ${lead.name} - ${lead.serviceType || 'Flight Quote'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; margin-left: 10px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px; }
        .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🎉 New Lead Received!</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${lead.name}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${lead.email}</span>
          </div>
          <div class="field">
            <span class="label">Phone:</span>
            <span class="value">${lead.phone || 'Not provided'}</span>
          </div>
          <div class="field">
            <span class="label">Service:</span>
            <span class="value">${lead.serviceType || 'Flight Quote'}</span>
          </div>
          ${lead.origin ? `
          <div class="field">
            <span class="label">Origin:</span>
            <span class="value">${lead.origin}</span>
          </div>
          ` : ''}
          ${lead.destination ? `
          <div class="field">
            <span class="label">Destination:</span>
            <span class="value">${lead.destination}</span>
          </div>
          ` : ''}
          ${lead.departureDate ? `
          <div class="field">
            <span class="label">Departure:</span>
            <span class="value">${new Date(lead.departureDate).toLocaleDateString()}</span>
          </div>
          ` : ''}
          ${lead.returnDate ? `
          <div class="field">
            <span class="label">Return:</span>
            <span class="value">${new Date(lead.returnDate).toLocaleDateString()}</span>
          </div>
          ` : ''}
          ${lead.message ? `
          <div class="field">
            <span class="label">Message:</span>
            <div class="value" style="margin-top: 5px; padding: 10px; background: white; border-radius: 5px;">
              ${lead.message}
            </div>
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${lead.email}" class="btn" style="margin-right: 10px;">Reply to Lead</a>
            <a href="https://wa.me/551151944717?text=New%20lead%20from%20${encodeURIComponent(lead.name)}" class="btn" style="background: #25D366;">Contact Support</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Fly2Any Lead Management System</p>
          <p>Sent via MailerSend</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Lead Received!

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Service: ${lead.serviceType || 'Flight Quote'}
${lead.origin ? `Origin: ${lead.origin}` : ''}
${lead.destination ? `Destination: ${lead.destination}` : ''}
${lead.departureDate ? `Departure: ${new Date(lead.departureDate).toLocaleDateString()}` : ''}
${lead.returnDate ? `Return: ${new Date(lead.returnDate).toLocaleDateString()}` : ''}
${lead.message ? `Message: ${lead.message}` : ''}

Reply to: ${lead.email}
  `;

  return sendEmail({
    to: process.env.NOTIFICATION_EMAIL || 'fly2any.travel@gmail.com',
    subject,
    html,
    text,
    replyTo: lead.email,
    tags: ['lead-notification', 'new-lead', lead.serviceType || 'flight']
  });
}

// Customer welcome email
export async function sendWelcomeEmail(customer: { name: string; email: string }): Promise<{ success: boolean; error?: string }> {
  const subject = 'Welcome to Fly2Any - Your Travel Journey Starts Here!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .features { margin: 20px 0; }
        .feature { padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to Fly2Any!</h1>
          <p style="margin: 10px 0 0 0;">Your Gateway to USA-Brazil Travel</p>
        </div>
        <div class="content">
          <h2>Hello ${customer.name}!</h2>
          <p>Thank you for choosing Fly2Any for your travel needs. We're excited to help you discover the best deals on flights from USA to Brazil and worldwide destinations.</p>
          
          <div class="features">
            <h3>What you can expect from us:</h3>
            <div class="feature">✈️ Exclusive flight deals and discounts</div>
            <div class="feature">🏨 Curated hotel recommendations</div>
            <div class="feature">🚗 Car rental options</div>
            <div class="feature">🎯 Personalized travel suggestions</div>
            <div class="feature">💬 24/7 customer support</div>
          </div>
          
          <p>Our team of travel experts is already working on finding the best options for your trip. You'll receive a personalized quote within the next 24 hours.</p>
          
          <div style="text-align: center;">
            <a href="https://wa.me/551151944717?text=Hello%20Fly2Any!" class="button" style="background: #25D366;">Contact on WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 Fly2Any. All rights reserved.</p>
          <p>You're receiving this email because you signed up at fly2any.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customer.email,
    subject,
    html,
    tags: ['welcome', 'customer-onboarding']
  });
}

// Quote ready notification
export async function sendQuoteReadyEmail(data: {
  customer: { name: string; email: string };
  quote: { 
    price: string; 
    route: string; 
    departureDate: string;
    returnDate?: string;
    quoteId: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  const subject = `Your Travel Quote is Ready - ${data.quote.route}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .quote-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
        .price { font-size: 32px; font-weight: bold; color: #667eea; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Your Quote is Ready!</h1>
          <p style="margin: 10px 0 0 0;">Quote ID: ${data.quote.quoteId}</p>
        </div>
        <div class="content">
          <h2>Hello ${data.customer.name}!</h2>
          <p>Great news! We've found an excellent deal for your trip.</p>
          
          <div class="quote-box">
            <h3 style="margin-top: 0;">Flight Details:</h3>
            <p><strong>Route:</strong> ${data.quote.route}</p>
            <p><strong>Departure:</strong> ${new Date(data.quote.departureDate).toLocaleDateString()}</p>
            ${data.quote.returnDate ? `<p><strong>Return:</strong> ${new Date(data.quote.returnDate).toLocaleDateString()}</p>` : ''}
            <div class="price">${data.quote.price}</div>
            <p style="color: #28a745; font-weight: bold;">✅ Best Price Guaranteed</p>
          </div>
          
          <p><strong>This quote includes:</strong></p>
          <ul>
            <li>All taxes and fees</li>
            <li>Carry-on baggage</li>
            <li>Seat selection</li>
            <li>24/7 customer support</li>
          </ul>
          
          <p style="color: #dc3545;"><strong>⏰ This offer expires in 48 hours</strong></p>
          
          <div style="text-align: center;">
            <a href="https://fly2any.com/book?quote=${data.quote.quoteId}" class="button" style="margin-right: 10px;">Book Now</a>
            <a href="https://wa.me/551151944717?text=I%20have%20a%20question%20about%20quote%20${data.quote.quoteId}" class="button" style="background: #25D366;">Chat on WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 Fly2Any. All rights reserved.</p>
          <p>This quote was generated specifically for you based on your search preferences.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.customer.email,
    subject,
    html,
    tags: ['quote', 'sales', data.quote.route]
  });
}

export default {
  sendEmail,
  sendLeadNotification,
  sendWelcomeEmail,
  sendQuoteReadyEmail
};