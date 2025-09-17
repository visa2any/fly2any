import { sql } from '@vercel/postgres';

export async function initializeEmailMarketingDatabase() {
  try {
    console.log('🗄️ Initializing Email Marketing Database...');

    // Run the complete database schema
    await sql`
      -- Enhanced Email Marketing Database Schema
      -- PostgreSQL schema for enterprise email marketing system

      -- Contact Profiles Extension
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS company VARCHAR(200);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS position VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 50;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS total_emails_sent INTEGER DEFAULT 0;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS total_opened INTEGER DEFAULT 0;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS total_clicked INTEGER DEFAULT 0;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS avg_open_rate DECIMAL(5,2) DEFAULT 0;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS avg_click_rate DECIMAL(5,2) DEFAULT 0;
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS country VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS preferred_open_time VARCHAR(10);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS email_client VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS source VARCHAR(50);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);
      ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR(100);
    `;

    await sql`
      -- Contact Tags Table
      CREATE TABLE IF NOT EXISTS contact_tags (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          color VARCHAR(7) DEFAULT '#3B82F6',
          category VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      -- Contact Tag Assignments
      CREATE TABLE IF NOT EXISTS contact_tag_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          contact_id UUID,
          tag_id UUID REFERENCES contact_tags(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          assigned_by VARCHAR(100),
          UNIQUE(contact_id, tag_id)
      );
    `;

    await sql`
      -- Email Templates Gallery
      CREATE TABLE IF NOT EXISTS email_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(200) NOT NULL,
          category VARCHAR(50) NOT NULL,
          thumbnail TEXT,
          html_content TEXT NOT NULL,
          text_content TEXT,
          variables JSONB DEFAULT '[]',
          is_responsive BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usage_count INTEGER DEFAULT 0,
          avg_open_rate DECIMAL(5,2),
          avg_click_rate DECIMAL(5,2)
      );
      CREATE INDEX IF NOT EXISTS idx_templates_category ON email_templates(category);
    `;

    await sql`
      -- Segments
      CREATE TABLE IF NOT EXISTS segments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(200) NOT NULL,
          description TEXT,
          type VARCHAR(20) DEFAULT 'dynamic',
          conditions JSONB DEFAULT '[]',
          match_type VARCHAR(10) DEFAULT 'all',
          contact_count INTEGER DEFAULT 0,
          icon VARCHAR(50),
          color VARCHAR(7),
          created_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      -- Enhanced Campaign Table
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS preview_text VARCHAR(200);
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'regular';
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS template_id UUID;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS recipient_segments JSONB DEFAULT '[]';
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS exclude_lists JSONB DEFAULT '[]';
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS send_time TIMESTAMP;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS send_optimization BOOLEAN DEFAULT FALSE;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS batch_size INTEGER DEFAULT 500;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS throttle_rate INTEGER;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS track_opens BOOLEAN DEFAULT TRUE;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS track_clicks BOOLEAN DEFAULT TRUE;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS google_analytics BOOLEAN DEFAULT FALSE;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS utm_parameters JSONB DEFAULT '{}';
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS ab_test_config JSONB;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}';
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
      ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    `;

    await sql`
      -- Automation Workflows
      CREATE TABLE IF NOT EXISTS automation_workflows (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'draft',
          trigger_type VARCHAR(50) NOT NULL,
          trigger_conditions JSONB DEFAULT '{}',
          allow_reentry BOOLEAN DEFAULT FALSE,
          max_reentries INTEGER,
          cooldown_period INTEGER,
          stats JSONB DEFAULT '{}',
          created_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_triggered TIMESTAMP
      );
    `;

    await sql`
      -- Email Queue for Redis integration
      CREATE TABLE IF NOT EXISTS email_queue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id UUID,
          contact_id UUID,
          email_address VARCHAR(255) NOT NULL,
          subject VARCHAR(500) NOT NULL,
          html_content TEXT NOT NULL,
          text_content TEXT,
          from_email VARCHAR(255) NOT NULL,
          from_name VARCHAR(255),
          reply_to VARCHAR(255),
          status VARCHAR(20) DEFAULT 'pending',
          priority INTEGER DEFAULT 1,
          scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          sent_at TIMESTAMP,
          attempts INTEGER DEFAULT 0,
          max_attempts INTEGER DEFAULT 3,
          error_message TEXT,
          mailgun_message_id VARCHAR(255),
          tracking_data JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
      CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC);
    `;

    await sql`
      -- Create performance indexes
      CREATE INDEX IF NOT EXISTS idx_contacts_engagement_score ON email_contacts(engagement_score DESC);
      CREATE INDEX IF NOT EXISTS idx_contacts_last_activity ON email_contacts(last_activity DESC);
      CREATE INDEX IF NOT EXISTS idx_contacts_status ON email_contacts(status);
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_campaigns_sent_at ON email_campaigns(sent_at DESC);
    `;

    await sql`
      -- Insert default email templates
      INSERT INTO email_templates (name, category, html_content, variables) VALUES
      ('Welcome Newsletter', 'welcome', '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #2c5aa0;">Welcome to {{company_name}}! 🎉</h1><p>Hi {{first_name}},</p><p>Thanks for joining our community! We''re excited to have you aboard.</p><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>What''s next?</h3><ul><li>Complete your profile</li><li>Explore our services</li><li>Get exclusive offers</li></ul></div><p>If you have any questions, feel free to reply to this email.</p><p>Best regards,<br>{{company_name}} Team</p></div></body></html>', ''[{"name": "first_name", "type": "text", "defaultValue": "Valued Customer", "required": false}, {"name": "company_name", "type": "text", "defaultValue": "Fly2Any", "required": true}]'')
      ON CONFLICT DO NOTHING;
    `;

    await sql`
      INSERT INTO email_templates (name, category, html_content, variables) VALUES
      ('Flight Deal Promotion', 'promotional', '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Flight Deals</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #e74c3c;">🛫 Exclusive Flight Deals Just for You!</h1><p>Hi {{first_name}},</p><p>We found amazing flight deals that match your travel preferences:</p><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;"><h2 style="margin: 0; color: white;">{{destination}} ✈️</h2><p style="font-size: 18px; margin: 10px 0;">Starting from</p><h1 style="font-size: 48px; margin: 0; color: #FFD700;">$\${{price}}</h1><p style="margin: 10px 0;">Round trip</p></div><div style="text-align: center; margin: 30px 0;"><a href="{{booking_url}}" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Book Now</a></div><p><strong>✅ Highlights:</strong></p><ul><li>{{duration}} flight duration</li><li>{{airline}} - Premium service</li><li>Free cancellation within 24h</li></ul><p>Hurry! These deals won''t last long.</p></div></body></html>', '[{"name": "first_name", "type": "text", "defaultValue": "Traveler", "required": false}, {"name": "destination", "type": "text", "defaultValue": "Paris", "required": true}, {"name": "price", "type": "text", "defaultValue": "499", "required": true}, {"name": "booking_url", "type": "text", "defaultValue": "#", "required": true}, {"name": "duration", "type": "text", "defaultValue": "8h 30m", "required": false}, {"name": "airline", "type": "text", "defaultValue": "Premium Airlines", "required": false}]')
      ON CONFLICT DO NOTHING;
    `;

    await sql`
      INSERT INTO email_templates (name, category, html_content, variables) VALUES
      ('Newsletter Template', 'newsletter', '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Newsletter</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; margin-bottom: 30px;"><img src="{{logo_url}}" alt="{{company_name}}" style="max-width: 200px;"></div><h1 style="color: #2c5aa0; text-align: center;">{{newsletter_title}}</h1><p>Hi {{first_name}},</p><p>{{intro_message}}</p><div style="border-left: 4px solid #2c5aa0; padding-left: 20px; margin: 20px 0;"><h3>📰 This Week''s Highlights</h3><ul><li>{{highlight_1}}</li><li>{{highlight_2}}</li><li>{{highlight_3}}</li></ul></div><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;"><h3>🎯 Featured Content</h3><p>{{featured_content}}</p><a href="{{cta_url}}" style="background: #2c5aa0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">{{cta_text}}</a></div><hr style="border: none; height: 1px; background: #eee; margin: 30px 0;"><p style="font-size: 14px; color: #666;">Thank you for being part of our community!</p><p style="font-size: 12px; color: #999;">{{company_name}} | {{company_address}}</p></div></body></html>', ''[{"name": "first_name", "type": "text", "defaultValue": "Subscriber", "required": false}, {"name": "company_name", "type": "text", "defaultValue": "Fly2Any", "required": true}, {"name": "logo_url", "type": "image", "defaultValue": "/logo.png", "required": false}, {"name": "newsletter_title", "type": "text", "defaultValue": "Weekly Travel Update", "required": true}, {"name": "intro_message", "type": "text", "defaultValue": "Here are the latest travel deals and updates!", "required": true}, {"name": "highlight_1", "type": "text", "defaultValue": "New destinations added", "required": true}, {"name": "highlight_2", "type": "text", "defaultValue": "Exclusive member discounts", "required": true}, {"name": "highlight_3", "type": "text", "defaultValue": "Travel tips and guides", "required": true}, {"name": "featured_content", "type": "text", "defaultValue": "Check out our latest travel guide!", "required": true}, {"name": "cta_text", "type": "text", "defaultValue": "Read More", "required": true}, {"name": "cta_url", "type": "text", "defaultValue": "#", "required": true}, {"name": "company_address", "type": "text", "defaultValue": "Miami, FL, USA", "required": false}]'')
      ON CONFLICT DO NOTHING;
    `;

    console.log('✅ Email Marketing Database initialized successfully!');
    return { success: true, message: 'Database initialized' };

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}