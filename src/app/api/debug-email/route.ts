import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    return NextResponse.json({
      hasResendKey: !!resendApiKey,
      resendKeyLength: resendApiKey?.length || 0,
      resendKeyStart: resendApiKey?.substring(0, 10) || 'none',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: 'Fly2Any <onboarding@resend.dev>',
      to: [email],
      subject: '🧪 Debug Test - Resend Direct',
      html: `
        <h2>✅ Debug Test Success!</h2>
        <p>Direct Resend API test working!</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
      `,
      text: 'Debug test success - Direct Resend API working!'
    });

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error,
        hasKey: !!resendApiKey
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      hasKey: !!resendApiKey
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 });
  }
}