import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export async function GET(request: NextRequest) {
  const results: DiagnosticResult[] = [];
  
  try {
    // 1. Verificar arquivos .env existentes
    results.push({
      step: '1. Verificação de Arquivos .env',
      status: 'success',
      message: 'Verificando arquivos de ambiente...',
      details: checkEnvFiles()
    });

    // 2. Testar carregamento de variáveis
    const envVars = loadAndTestEnvVars();
    results.push({
      step: '2. Carregamento de Variáveis',
      status: envVars.gmail_email && envVars.gmail_password ? 'success' : 'error',
      message: envVars.gmail_email && envVars.gmail_password 
        ? 'Variáveis carregadas com sucesso' 
        : 'Falha ao carregar variáveis Gmail',
      details: envVars
    });

    // 3. Validar formato das credenciais
    if (envVars.gmail_email && envVars.gmail_password) {
      const validation = validateCredentials(envVars.gmail_email, envVars.gmail_password);
      results.push({
        step: '3. Validação de Credenciais',
        status: validation.valid ? 'success' : 'warning',
        message: validation.message,
        details: validation.details
      });

      // 4. Teste de conexão SMTP
      try {
        const smtpTest = await testSMTPConnection(envVars.gmail_email, envVars.gmail_password);
        results.push({
          step: '4. Teste SMTP',
          status: smtpTest.success ? 'success' : 'error',
          message: smtpTest.message,
          details: smtpTest.details
        });

        // 5. Teste de envio de email (se SMTP ok)
        if (smtpTest.success) {
          const emailTest = await testEmailSending(envVars.gmail_email, envVars.gmail_password);
          results.push({
            step: '5. Teste de Envio',
            status: emailTest.success ? 'success' : 'error',
            message: emailTest.message,
            details: emailTest.details
          });
        }
      } catch (error) {
        results.push({
          step: '4. Teste SMTP',
          status: 'error',
          message: 'Erro durante teste SMTP',
          details: { error: error instanceof Error ? error.message : String(error) }
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics: results,
      summary: generateSummary(results)
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      diagnostics: results
    }, { status: 500 });
  }
}

function checkEnvFiles() {
  const envFiles = ['.env', '.env.local', '.env.production.local'];
  const results: any = {};
  
  for (const fileName of envFiles) {
    const filePath = path.join(process.cwd(), fileName);
    const exists = fs.existsSync(filePath);
    results[fileName] = {
      exists,
      size: exists ? fs.statSync(filePath).size : 0,
      hasGmailEmail: false,
      hasGmailPassword: false
    };
    
    if (exists) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        results[fileName].hasGmailEmail = content.includes('GMAIL_EMAIL');
        results[fileName].hasGmailPassword = content.includes('GMAIL_APP_PASSWORD');
      } catch (error) {
        results[fileName].error = 'Erro ao ler arquivo';
      }
    }
  }
  
  return results;
}

function loadAndTestEnvVars() {
  const envFiles = ['.env.local', '.env', '.env.production.local'];
  let gmail_email = process.env.GMAIL_EMAIL;
  let gmail_password = process.env.GMAIL_APP_PASSWORD;
  let source = 'process.env';
  
  // Se não carregou do process.env, tenta carregar manualmente
  if (!gmail_email || !gmail_password) {
    for (const fileName of envFiles) {
      const envPath = path.join(process.cwd(), fileName);
      try {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const lines = envContent.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              const equalIndex = trimmedLine.indexOf('=');
              if (equalIndex > 0) {
                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim().replace(/["']/g, '');
                
                if (key === 'GMAIL_EMAIL' && !gmail_email) {
                  gmail_email = value;
                  source = fileName;
                }
                if (key === 'GMAIL_APP_PASSWORD' && !gmail_password) {
                  gmail_password = value;
                  source = fileName;
                }
              }
            }
          }
          
          if (gmail_email && gmail_password) break;
        }
      } catch (error) {
        // Continue para próximo arquivo
      }
    }
  }
  
  return {
    gmail_email: gmail_email || null,
    gmail_password: gmail_password || null,
    source,
    process_env: {
      GMAIL_EMAIL: process.env.GMAIL_EMAIL || null,
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || null
    }
  };
}

function validateCredentials(email: string, password: string) {
  const details: any = {};
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  details.email_format = emailRegex.test(email);
  details.email_is_gmail = email.includes('@gmail.com');
  
  // Validar app password (deve ter 16 caracteres sem espaços para Gmail)
  details.password_length = password.length;
  details.password_format = /^[a-z\s]+$/i.test(password); // Gmail app passwords são letras e espaços
  details.password_spaces = (password.match(/\s/g) || []).length;
  
  const valid = details.email_format && 
                details.email_is_gmail && 
                (details.password_length === 16 || details.password_length === 19); // 16 chars ou 19 com espaços
  
  return {
    valid,
    message: valid 
      ? 'Credenciais têm formato válido' 
      : 'Problema no formato das credenciais',
    details
  };
}

async function testSMTPConnection(email: string, password: string) {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verificar conexão
    await transporter.verify();
    
    return {
      success: true,
      message: 'Conexão SMTP estabelecida com sucesso',
      details: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth_user: email
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha na conexão SMTP',
      details: {
        error: error instanceof Error ? error.message : String(error),
        code: (error as any).code,
        command: (error as any).command
      }
    };
  }
}

async function testEmailSending(email: string, password: string) {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const result = await transporter.sendMail({
      from: `"Fly2Any Test" <${email}>`,
      to: email, // Envia para o próprio email
      subject: '🧪 Teste de Diagnóstico - Gmail SMTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>✅ Teste SMTP Bem-sucedido!</h1>
          </div>
          <div style="padding: 20px;">
            <h2>🎉 Sistema de Email Funcionando</h2>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Sistema:</strong> Gmail SMTP via Nodemailer</p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>✅ Testes Realizados:</h3>
              <ul>
                <li>✅ Carregamento de variáveis de ambiente</li>
                <li>✅ Validação de credenciais</li>
                <li>✅ Conexão SMTP</li>
                <li>✅ Autenticação Gmail</li>
                <li>✅ Envio de email</li>
              </ul>
            </div>
          </div>
        </div>`
    });

    return {
      success: true,
      message: 'Email de teste enviado com sucesso',
      details: {
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha no envio de email',
      details: {
        error: error instanceof Error ? error.message : String(error),
        code: (error as any).code,
        command: (error as any).command
      }
    };
  }
}

function generateSummary(results: DiagnosticResult[]) {
  const errors = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const successes = results.filter(r => r.status === 'success').length;
  
  let status = 'success';
  let message = 'Todos os testes passaram!';
  
  if (errors > 0) {
    status = 'error';
    message = `${errors} erro(s) encontrado(s)`;
  } else if (warnings > 0) {
    status = 'warning';
    message = `${warnings} aviso(s) encontrado(s)`;
  }
  
  return {
    status,
    message,
    total_tests: results.length,
    successes,
    warnings,
    errors
  };
}