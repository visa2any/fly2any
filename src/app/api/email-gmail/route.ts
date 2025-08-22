import { NextRequest, NextResponse } from 'next/server';

/**
 * Gmail SMTP para envio de emails reais
 * Versão limpa sem templates de teste
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, subject, html, text } = body;

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email é obrigatório' 
      }, { status: 400 });
    }

    if (!subject || !html) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subject e HTML são obrigatórios' 
      }, { status: 400 });
    }

    const nodemailer = await import('nodemailer');
    
    // Configuração Gmail simplificada
    const smtpConfig = {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    };

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais Gmail não configuradas' 
      }, { status: 500 });
    }

    const transporter = nodemailer.default.createTransport(smtpConfig as any);
    await transporter.verify();

    const mailOptions = {
      from: `"Fly2Any" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
      text: text,
      replyTo: 'info@fly2any.com'
    };

    const result = await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: `Email enviado via Gmail para ${email}!`,
      messageId: result.messageId,
      provider: 'Gmail SMTP'
    });

  } catch (error) {
    console.error('Erro Gmail SMTP:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno Gmail'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    provider: 'Gmail SMTP',
    status: 'active',
    note: 'Endpoint limpo apenas para emails reais'
  });
}