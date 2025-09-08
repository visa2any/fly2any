require('dotenv').config();
const { sql } = require('@vercel/postgres');

console.log('🎨 INTEGRATING EMAIL MARKETING TEMPLATES\n');

// Default templates from TemplateGallery.tsx
const defaultTemplates = [
  {
    id: 'template_welcome_001',
    name: 'Welcome Email',
    category: 'Welcome',
    description: 'Template de boas-vindas moderno',
    subject: 'Bem-vindo à {{company_name}}!',
    html_content: `<div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">
      <h1 style="color:#333;">Bem-vindo!</h1>
      <p>Obrigado por se juntar a nós!</p>
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
        <h2 style="color:#007bff;">Olá {{user_name}}!</h2>
        <p>Seja bem-vindo à {{company_name}}! Estamos muito felizes em tê-lo conosco.</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="{{getting_started_url}}" style="background:#007bff;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;display:inline-block;">Começar Agora</a>
      </div>
      <p style="color:#666;font-size:14px;text-align:center;">
        <a href="{{unsubscribe_url}}" style="color:#666;">Descadastrar</a>
      </p>
    </div>`,
    variables: 'company_name,user_name,getting_started_url,unsubscribe_url',
    industry: 'General',
    usage_count: 0
  },
  {
    id: 'template_newsletter_001', 
    name: 'Newsletter Modern',
    category: 'Newsletter',
    description: 'Newsletter clean e responsivo',
    subject: 'Newsletter Semanal - {{week}}',
    html_content: `<div style="max-width:600px;margin:0 auto;background:#f8f9fa;padding:40px 20px;">
      <div style="background:white;padding:40px;border-radius:8px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#333;margin:0;">{{company_name}}</h1>
          <p style="color:#666;margin:5px 0;">Newsletter Semanal</p>
        </div>
        
        <h2 style="color:#007bff;border-bottom:2px solid #007bff;padding-bottom:10px;">{{headline}}</h2>
        
        <div style="margin:20px 0;">
          {{content}}
        </div>
        
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:30px 0;">
          <h3 style="color:#333;margin-top:0;">Destaques da Semana</h3>
          <ul style="color:#666;">
            <li>{{highlight_1}}</li>
            <li>{{highlight_2}}</li>
            <li>{{highlight_3}}</li>
          </ul>
        </div>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="{{cta_url}}" style="background:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;">{{cta_text}}</a>
        </div>
        
        <div style="border-top:1px solid #e9ecef;padding-top:20px;margin-top:40px;text-align:center;">
          <p style="color:#666;font-size:12px;">
            {{company_name}} | <a href="{{unsubscribe_url}}" style="color:#666;">Descadastrar</a>
          </p>
        </div>
      </div>
    </div>`,
    variables: 'company_name,week,headline,content,highlight_1,highlight_2,highlight_3,cta_url,cta_text,unsubscribe_url',
    industry: 'Technology',
    usage_count: 0
  },
  {
    id: 'template_promotional_001',
    name: 'Promotional Sale',
    category: 'Promotional', 
    description: 'Template para promoções e vendas',
    subject: '🔥 {{discount}}% de Desconto Imperdível!',
    html_content: `<div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px;text-align:center;">
      <div style="background:rgba(255,255,255,0.1);padding:30px;border-radius:15px;margin:20px 0;">
        <h1 style="font-size:48px;margin:0;text-shadow:2px 2px 4px rgba(0,0,0,0.3);">{{discount}}% OFF</h1>
        <p style="font-size:20px;margin:10px 0;">{{offer_text}}</p>
      </div>
      
      <div style="background:white;color:#333;padding:30px;border-radius:10px;margin:20px 0;">
        <h2 style="color:#667eea;margin-top:0;">{{product_name}}</h2>
        <p style="font-size:16px;line-height:1.6;">{{product_description}}</p>
        
        <div style="margin:20px 0;">
          <span style="font-size:14px;color:#999;text-decoration:line-through;">De: R$ {{original_price}}</span><br>
          <span style="font-size:24px;color:#e74c3c;font-weight:bold;">Por: R$ {{sale_price}}</span>
        </div>
      </div>
      
      <a href="{{link}}" style="background:white;color:#667eea;padding:18px 40px;text-decoration:none;border-radius:50px;font-weight:bold;display:inline-block;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-size:18px;">
        APROVEITAR AGORA
      </a>
      
      <p style="margin-top:30px;font-size:14px;opacity:0.8;">
        Oferta válida até {{expiry_date}} ou enquanto durarem os estoques
      </p>
      
      <div style="border-top:1px solid rgba(255,255,255,0.3);margin-top:40px;padding-top:20px;">
        <p style="font-size:12px;opacity:0.7;">
          <a href="{{unsubscribe_url}}" style="color:white;">Descadastrar</a>
        </p>
      </div>
    </div>`,
    variables: 'discount,offer_text,product_name,product_description,original_price,sale_price,link,expiry_date,unsubscribe_url',
    industry: 'E-commerce', 
    usage_count: 0
  },
  {
    id: 'template_event_001',
    name: 'Event Invitation',
    category: 'Event',
    description: 'Convite para eventos e webinars',
    subject: '🎉 Convite: {{event_name}}',
    html_content: `<div style="max-width:600px;margin:0 auto;padding:20px;">
      <div style="border:3px solid #ff6b6b;border-radius:10px;padding:40px;text-align:center;background:white;">
        <div style="margin-bottom:30px;">
          <h1 style="color:#ff6b6b;font-size:32px;margin:0;">Você está convidado!</h1>
          <div style="width:60px;height:3px;background:#ff6b6b;margin:20px auto;"></div>
        </div>
        
        <h2 style="color:#333;font-size:28px;margin:20px 0;">{{event_name}}</h2>
        
        <div style="background:#f8f9fa;padding:25px;border-radius:8px;margin:30px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
            <strong style="color:#555;">📅 Data:</strong>
            <span>{{event_date}}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
            <strong style="color:#555;">⏰ Horário:</strong> 
            <span>{{event_time}}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
            <strong style="color:#555;">📍 Local:</strong>
            <span>{{event_location}}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <strong style="color:#555;">👥 Vagas:</strong>
            <span>{{available_spots}} disponíveis</span>
          </div>
        </div>
        
        <div style="margin:30px 0;">
          <p style="font-size:16px;color:#666;line-height:1.6;">{{event_description}}</p>
        </div>
        
        <a href="{{rsvp_link}}" style="background:#ff6b6b;color:white;padding:15px 40px;text-decoration:none;border-radius:50px;font-size:18px;font-weight:bold;display:inline-block;box-shadow:0 4px 15px rgba(255,107,107,0.3);">
          CONFIRMAR PRESENÇA
        </a>
        
        <p style="margin-top:25px;font-size:14px;color:#999;">
          Confirme até {{rsvp_deadline}} para garantir sua vaga
        </p>
        
        <div style="border-top:1px solid #eee;margin-top:40px;padding-top:20px;">
          <p style="font-size:12px;color:#999;">
            {{organizer_name}} | <a href="{{unsubscribe_url}}" style="color:#999;">Descadastrar</a>
          </p>
        </div>
      </div>
    </div>`,
    variables: 'event_name,event_date,event_time,event_location,available_spots,event_description,rsvp_link,rsvp_deadline,organizer_name,unsubscribe_url',
    industry: 'Events',
    usage_count: 0
  }
];

async function importDefaultTemplates() {
  console.log('📥 IMPORTING 4 DEFAULT TEMPLATES TO DATABASE...\n');
  
  let imported = 0;
  
  for (const template of defaultTemplates) {
    try {
      // Check if template already exists
      const existing = await sql`
        SELECT id FROM email_templates WHERE id = ${template.id}
      `;
      
      if (existing.rows.length > 0) {
        console.log(`⚠️  Template ${template.name} already exists - skipping`);
        continue;
      }
      
      // Insert template
      await sql`
        INSERT INTO email_templates (
          id, name, description, category, subject,
          html_content, text_content, variables, preview_text,
          usage_count, created_by, created_at, updated_at, is_active
        ) VALUES (
          ${template.id},
          ${template.name},
          ${template.description},
          ${template.category},
          ${template.subject},
          ${template.html_content},
          NULL,
          ${template.variables},
          ${template.description},
          ${template.usage_count},
          'system',
          ${new Date().toISOString()},
          ${new Date().toISOString()},
          true
        )
      `;
      
      console.log(`✅ Imported: ${template.name} (${template.category})`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing ${template.name}:`, error.message);
    }
  }
  
  console.log(`\n🎯 IMPORTED ${imported} DEFAULT TEMPLATES`);
  return imported;
}

async function extractCampaignTemplates() {
  console.log('\n📧 EXTRACTING EXISTING CAMPAIGN TEMPLATES...\n');
  
  try {
    // Get campaigns with rich HTML content
    const campaigns = await sql`
      SELECT id, name, subject, template_type, html_content, created_at
      FROM email_campaigns
      WHERE html_content IS NOT NULL 
      AND LENGTH(html_content) > 1000
      AND template_type IS NOT NULL
    `;
    
    console.log(`📊 Found ${campaigns.rows.length} campaigns with rich templates`);
    
    let extracted = 0;
    
    for (const campaign of campaigns.rows) {
      try {
        const templateId = `template_campaign_${campaign.id}`;
        const templateName = `${campaign.name} (Campaign Template)`;
        
        // Check if already extracted
        const existing = await sql`
          SELECT id FROM email_templates WHERE id = ${templateId}
        `;
        
        if (existing.rows.length > 0) {
          console.log(`⚠️  Template from campaign ${campaign.name} already extracted - skipping`);
          continue;
        }
        
        // Extract variables from HTML
        const variables = extractVariables(campaign.html_content);
        const variableString = variables.join(',');
        
        // Insert as template
        await sql`
          INSERT INTO email_templates (
            id, name, description, category, subject,
            html_content, variables, usage_count,
            created_by, created_at, updated_at, is_active
          ) VALUES (
            ${templateId},
            ${templateName},
            ${'Template extraído de campanha existente'},
            ${campaign.template_type || 'promotional'},
            ${campaign.subject},
            ${campaign.html_content},
            ${variableString},
            1,
            'campaign_extractor',
            ${new Date().toISOString()},
            ${new Date().toISOString()},
            true
          )
        `;
        
        console.log(`✅ Extracted: ${templateName}`);
        console.log(`   Variables found: ${variables.length > 0 ? variables.join(', ') : 'none'}`);
        extracted++;
        
      } catch (error) {
        console.error(`❌ Error extracting campaign ${campaign.name}:`, error.message);
      }
    }
    
    console.log(`\n🎯 EXTRACTED ${extracted} CAMPAIGN TEMPLATES`);
    return extracted;
    
  } catch (error) {
    console.error('❌ Error extracting campaign templates:', error);
    return 0;
  }
}

function extractVariables(htmlContent) {
  const regex = /{{([^}]+)}}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}

async function verifyIntegration() {
  console.log('\n🔍 VERIFYING TEMPLATE INTEGRATION...\n');
  
  try {
    // Count templates by category
    const summary = await sql`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(usage_count) as total_usage
      FROM email_templates 
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `;
    
    console.log('📊 Template Summary:');
    let totalTemplates = 0;
    summary.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} templates (${row.total_usage} uses)`);
      totalTemplates += parseInt(row.count);
    });
    
    console.log(`\n🎨 TOTAL ACTIVE TEMPLATES: ${totalTemplates}`);
    
    // Show some sample templates
    const samples = await sql`
      SELECT name, category, variables, LENGTH(html_content) as html_size
      FROM email_templates
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 8
    `;
    
    console.log('\n📋 Template Gallery Preview:');
    samples.rows.forEach(template => {
      const varCount = template.variables ? template.variables.split(',').length : 0;
      console.log(`   📄 ${template.name}`);
      console.log(`      Category: ${template.category} | Variables: ${varCount} | HTML: ${template.html_size} chars`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying integration:', error);
  }
}

// Execute integration
async function runIntegration() {
  try {
    const defaultImported = await importDefaultTemplates();
    const campaignExtracted = await extractCampaignTemplates();
    await verifyIntegration();
    
    console.log('\n🎉 TEMPLATE INTEGRATION COMPLETE!');
    console.log('=' .repeat(50));
    console.log(`✅ ${defaultImported} default templates imported`);
    console.log(`✅ ${campaignExtracted} campaign templates extracted`);
    console.log(`✅ Total: ${defaultImported + campaignExtracted} templates ready`);
    console.log('\n🚀 Templates are now available in the gallery and campaign builder!');
    
  } catch (error) {
    console.error('💥 Integration failed:', error);
  }
}

runIntegration();