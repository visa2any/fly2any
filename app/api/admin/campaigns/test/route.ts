export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { mailgunClient } from '@/lib/email/mailgun-client';
import fs from 'fs';
import path from 'path';

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

    // Send test email via Mailgun
    const result = await mailgunClient.send({
      to: testEmail,
      subject: `✈️ ${firstName}, your next adventure awaits + $20 OFF inside`,
      html: htmlContent,
      tags: ['campaign', 'reactivation-test', 'test'],
      forceSend: true, // Force send even in dev mode
    });

    if (!result.success) {
      console.error('Mailgun error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: testEmail,
      template,
      simulated: result.simulated,
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
