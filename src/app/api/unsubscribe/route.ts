import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o email existe na base
    const checkResult = await sql`
      SELECT email FROM email_contacts WHERE email = ${email.toLowerCase()}
    `;

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 404 }
      );
    }

    // Marcar como unsubscribed
    const result = await sql`
      UPDATE email_contacts 
      SET 
        status = 'unsubscribed',
        unsubscribed_at = NOW(),
        updated_at = NOW()
      WHERE email = ${email.toLowerCase()}
      RETURNING email, status
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Erro ao processar descadastro' },
        { status: 500 }
      );
    }

    // Log do descadastro
    console.log(`📧 Unsubscribe realizado: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Email removido da lista com sucesso',
      email: result.rows[0].email
    });

  } catch (error) {
    console.error('Erro no unsubscribe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para verificar status de um email (opcional)
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const result = await sql`
      SELECT email, status, unsubscribed_at
      FROM email_contacts 
      WHERE email = ${email.toLowerCase()}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: result.rows[0].email,
      status: result.rows[0].status,
      unsubscribed_at: result.rows[0].unsubscribed_at
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}