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

-- Contact Tags Table
CREATE TABLE IF NOT EXISTS contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Tag Assignments
CREATE TABLE IF NOT EXISTS contact_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES contact_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100),
    UNIQUE(contact_id, tag_id)
);

-- Activity Timeline
CREATE TABLE IF NOT EXISTS contact_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(200),
    INDEX idx_contact_activities_contact (contact_id),
    INDEX idx_contact_activities_timestamp (timestamp)
);

-- Contact Notes
CREATE TABLE IF NOT EXISTS contact_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE,
    INDEX idx_contact_notes_contact (contact_id)
);

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
    avg_click_rate DECIMAL(5,2),
    INDEX idx_templates_category (category)
);

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

-- Contact List Memberships
CREATE TABLE IF NOT EXISTS contact_list_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    list_id VARCHAR(200) NOT NULL,
    list_name VARCHAR(200),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(100),
    UNIQUE(contact_id, list_id)
);

-- Enhanced Campaign Table
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS preview_text VARCHAR(200);
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'regular';
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES email_templates(id);
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

-- A/B Test Variants
CREATE TABLE IF NOT EXISTS campaign_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    subject VARCHAR(500),
    preview_text VARCHAR(200),
    from_name VARCHAR(100),
    html_content TEXT,
    send_time TIMESTAMP,
    stats JSONB DEFAULT '{}',
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Workflow Steps
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
    step_type VARCHAR(50) NOT NULL,
    step_order INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    config JSONB DEFAULT '{}',
    next_step_id UUID,
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workflow_steps_workflow (workflow_id)
);

-- Workflow Enrollments
CREATE TABLE IF NOT EXISTS workflow_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES workflow_steps(id),
    status VARCHAR(20) DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(workflow_id, contact_id)
);

-- Campaign Link Tracking
CREATE TABLE IF NOT EXISTS campaign_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    tracking_url TEXT NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_campaign_links_campaign (campaign_id)
);

-- Link Click Events
CREATE TABLE IF NOT EXISTS link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID REFERENCES campaign_links(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    INDEX idx_link_clicks_link (link_id),
    INDEX idx_link_clicks_contact (contact_id)
);

-- Email Opens Tracking
CREATE TABLE IF NOT EXISTS email_opens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(20),
    email_client VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    INDEX idx_email_opens_campaign (campaign_id),
    INDEX idx_email_opens_contact (contact_id)
);

-- Bulk Operations Log
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_by VARCHAR(100),
    config JSONB DEFAULT '{}',
    result_file_url TEXT
);

-- Deliverability Reports
CREATE TABLE IF NOT EXISTS deliverability_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_score INTEGER,
    domain_reputation INTEGER,
    ip_reputation INTEGER,
    spf_status VARCHAR(20),
    dkim_status VARCHAR(20),
    dmarc_status VARCHAR(20),
    blacklists JSONB DEFAULT '[]',
    inbox_placement JSONB DEFAULT '{}',
    bounce_breakdown JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) UNIQUE NOT NULL,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    default_from_name VARCHAR(100),
    default_from_email VARCHAR(200),
    default_reply_to VARCHAR(200),
    signature_html TEXT,
    campaign_defaults JSONB DEFAULT '{}',
    email_notifications JSONB DEFAULT '{}',
    ui_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_engagement_score ON email_contacts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_last_activity ON email_contacts(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON email_contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email_status ON email_contacts(email_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_sent_at ON email_campaigns(sent_at DESC);

-- Create views for quick access
CREATE OR REPLACE VIEW active_contacts AS
SELECT * FROM email_contacts 
WHERE status = 'active' 
AND email_status = 'verified';

CREATE OR REPLACE VIEW high_engagement_contacts AS
SELECT * FROM email_contacts 
WHERE engagement_score >= 70 
AND status = 'active';

CREATE OR REPLACE VIEW recent_campaigns AS
SELECT * FROM email_campaigns 
WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days' 
ORDER BY sent_at DESC;