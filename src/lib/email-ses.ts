// Amazon SES Configuration for Real Email Sending
// Install: npm install @aws-sdk/client-ses

interface SESConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  fromEmail: string;
}

interface EmailData {
  to: string[];
  subject: string;
  htmlBody: string;
  textBody: string;
}

class AmazonSESService {
  private config: SESConfig;
  private sesClient: any;

  constructor() {
    this.config = {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      fromEmail: process.env.SES_FROM_EMAIL || 'noreply@fly2any.com'
    };
  }

  // Inicializar cliente SES
  async initialize(): Promise<boolean> {
    try {
      // Verificar se as credenciais estão configuradas
      if (!this.config.accessKeyId || !this.config.secretAccessKey) {
        console.log('⚠️  AWS credentials not configured. Using simulation mode.');
        return false;
      }

      // Dinamically import AWS SDK (only when needed)
      const { SESClient } = await import('@aws-sdk/client-ses');
      
      this.sesClient = new SESClient({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });

      console.log('✅ Amazon SES initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize SES:', error);
      return false;
    }
  }

  // Enviar email em lote
  async sendBulkEmail(emailData: EmailData): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const result = {
      success: false,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      const isInitialized = await this.initialize();
      
      if (!isInitialized) {
        // Modo simulação
        return this.simulateBulkEmail(emailData);
      }

      const { SendBulkTemplatedEmailCommand } = await import('@aws-sdk/client-ses');
      
      // Dividir em lotes de 50 (limite do SES)
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < emailData.to.length; i += batchSize) {
        batches.push(emailData.to.slice(i, i + batchSize));
      }

      // Enviar cada lote
      for (const batch of batches) {
        try {
          const destinations = batch.map(email => ({
            Destination: {
              ToAddresses: [email],
            },
            ReplacementTemplateData: JSON.stringify({
              email: email,
              nome: email.split('@')[0] // Fallback name
            }),
          }));

          const command = new SendBulkTemplatedEmailCommand({
            Source: this.config.fromEmail,
            Template: 'DefaultTemplate', // You need to create this in SES
            DefaultTemplateData: JSON.stringify({
              subject: emailData.subject,
              htmlBody: emailData.htmlBody,
              textBody: emailData.textBody
            }),
            Destinations: destinations,
          });

          const response = await this.sesClient.send(command);
          result.sent += batch.length;
          
        } catch (batchError) {
          result.failed += batch.length;
          result.errors.push(`Batch error: ${batchError}`);
        }

        // Rate limiting: aguardar 1 segundo entre lotes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      result.success = result.sent > 0;
      return result;

    } catch (error) {
      result.errors.push(`SES Error: ${error}`);
      return result;
    }
  }

  // Modo simulação (quando SES não está configurado)
  private async simulateBulkEmail(emailData: EmailData): Promise<any> {
    console.log('🎭 SIMULATION MODE - Email Marketing');
    console.log('📧 Subject:', emailData.subject);
    console.log('👥 Recipients:', emailData.to.length);
    console.log('📝 Content preview:', emailData.htmlBody.substring(0, 100) + '...');
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      sent: emailData.to.length,
      failed: 0,
      errors: [],
      mode: 'simulation'
    };
  }

  // Enviar email simples
  async sendSingleEmail(to: string, subject: string, htmlBody: string, textBody: string): Promise<boolean> {
    try {
      const isInitialized = await this.initialize();
      
      if (!isInitialized) {
        console.log(`🎭 SIMULATION: Email to ${to} with subject "${subject}"`);
        return true;
      }

      const { SendEmailCommand } = await import('@aws-sdk/client-ses');
      
      const command = new SendEmailCommand({
        Source: this.config.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      return true;

    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Verificar status do SES
  async getQuota(): Promise<{ dailyQuota: number; sentLast24h: number; sendingEnabled: boolean }> {
    try {
      const isInitialized = await this.initialize();
      
      if (!isInitialized) {
        return {
          dailyQuota: 62000, // Free tier quota
          sentLast24h: 0,
          sendingEnabled: false
        };
      }

      const { GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
      
      const command = new GetSendQuotaCommand({});
      const response = await this.sesClient.send(command);
      
      return {
        dailyQuota: response.Max24HourSend || 0,
        sentLast24h: response.SentLast24Hours || 0,
        sendingEnabled: true
      };

    } catch (error) {
      console.error('Failed to get SES quota:', error);
      return {
        dailyQuota: 0,
        sentLast24h: 0,
        sendingEnabled: false
      };
    }
  }
}

export const amazonSESService = new AmazonSESService();

// Função utilitária para enviar campanha via SES
export async function sendCampaignViaSES(
  emails: string[], 
  subject: string, 
  htmlContent: string, 
  textContent: string
): Promise<any> {
  return amazonSESService.sendBulkEmail({
    to: emails,
    subject,
    htmlBody: htmlContent,
    textBody: textContent
  });
}