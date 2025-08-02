import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    // Import Resend inside the function to avoid edge issues
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'Fly2Any <onboarding@resend.dev>',
      to: [email],
      subject: '✅ Simple Test - Working!',
      html: '<h1>✅ Email funcionando!</h1><p>Sistema simples funcionando perfeitamente!</p>'
    });

    if (result.error) {
      return NextResponse.json({ 
        success: false, 
        error: result.error.message || 'Resend error'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado!',
      id: result.data?.id
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}