import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Lazy initialization to avoid build-time errors when env vars aren't available
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    const { testEmail, template = 'reactivation-campaign', firstName = 'Valued Customer' } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email is required' }, { status: 400 });
    }

    // Read template
    const templatePath = path.join(process.cwd(), 'emails', 'templates', `${template}.html`);

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders
    htmlContent = htmlContent
      .replace(/\{\{first_name\}\}/g, firstName)
      .replace(/\{\{unsubscribe_url\}\}/g, `https://www.fly2any.com/unsubscribe?email=${encodeURIComponent(testEmail)}`);

    // Send test email
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Fly2Any <hello@fly2any.com>',
      to: testEmail,
      subject: `✈️ ${firstName}, your next adventure awaits + 10% OFF inside`,
      html: htmlContent,
      tags: [
        { name: 'campaign', value: 'reactivation-test' },
        { name: 'type', value: 'test' }
      ]
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      sentTo: testEmail,
      template
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Preview template as HTML
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'reactivation-campaign';
  const firstName = searchParams.get('name') || 'Valued Customer';

  const templatePath = path.join(process.cwd(), 'emails', 'templates', `${template}.html`);

  if (!fs.existsSync(templatePath)) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  let htmlContent = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders for preview
  htmlContent = htmlContent
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{unsubscribe_url\}\}/g, '#');

  return new NextResponse(htmlContent, {
    headers: { 'Content-Type': 'text/html' }
  });
}
