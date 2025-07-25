# 🔐 N8N Credentials Setup Guide - Fly2Any

## 🌐 N8N Instance Access
- **URL**: https://n8n-production-81b6.up.railway.app
- **Status**: ✅ Online and accessible
- **Authentication**: Required (API token expired)

## 🚨 Current Status
- ❌ Webhooks not active: `/webhook/whatsapp` and `/webhook/email-marketing-final`
- ❌ API authentication tokens expired
- ✅ N8N instance responding correctly
- ✅ Workflow files available for import

## 🔑 Authentication Methods

### Method 1: Web Interface Login
1. Navigate to: https://n8n-production-81b6.up.railway.app
2. Try these common approaches:
   - **First setup**: May require creating initial admin account
   - **Existing account**: Use your email/password
   - **OAuth**: Google, GitHub, or other configured providers
   - **Environment variables**: Check Railway deployment settings

### Method 2: API Key Generation
After logging into web interface:
1. Go to **Settings** → **API Keys**
2. Generate new API key
3. Use format: `Bearer [your-api-key]` or `X-N8N-API-KEY: [your-api-key]`

## 📋 Step-by-Step Import Process

### Step 1: Access N8N Web Interface
```bash
# Open in browser
https://n8n-production-81b6.up.railway.app
```

### Step 2: Import WhatsApp Workflow
1. Click **"+ New Workflow"** or **"Import from JSON"**
2. Copy content from: `/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json`
3. Paste into import dialog
4. Click **"Import"**
5. **Save** the workflow

### Step 3: Import Email Marketing Workflow  
1. Repeat import process
2. Use file: `/mnt/d/Users/vilma/fly2any/n8n-workflows/email-marketing-final.json`
3. Import and save

### Step 4: Configure Credentials

#### WhatsApp Workflow Requirements:
```javascript
// Required credentials:
{
  "whatsappToken": "your-whatsapp-business-api-token",
  "verifyToken": "your-webhook-verification-token",
  "databaseUrl": "your-database-connection-string"
}
```

#### Email Marketing Workflow Requirements:
```javascript
// Gmail SMTP Configuration:
{
  "gmailEmail": "your-email@gmail.com",
  "gmailAppPassword": "xxxx-xxxx-xxxx-xxxx", // 16-digit app password
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587
}
```

#### Gmail App Password Setup:
1. Go to: https://myaccount.google.com/security
2. Enable **"2-Step Verification"**
3. Navigate to **"App passwords"**
4. Select **"Mail"** application
5. Generate 16-digit password
6. Use this as `gmailAppPassword`

### Step 5: Activate Workflows
1. Open each imported workflow
2. Click **"Active"** toggle (top-right corner)
3. Verify status shows **"Active"**
4. Check that webhook URLs are registered

### Step 6: Test Webhook Endpoints
```bash
# Test WhatsApp webhook
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "from": "+1234567890",
    "message": "Hello World",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'

# Test Email Marketing webhook  
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "subject": "Test Campaign",
    "htmlContent": "<h1>Test Email</h1>",
    "contacts": [
      {"email": "test@example.com", "name": "Test User"}
    ]
  }'
```

## 📊 Workflow Details

### WhatsApp Automation Workflow
```json
{
  "name": "WhatsApp Automation - Fly2Any",
  "webhook": "/webhook/whatsapp",
  "features": [
    "Message processing and intent detection",
    "Lead qualification and scoring",
    "Business hours handling",
    "Automated responses",
    "CRM integration",
    "Priority-based routing"
  ]
}
```

### Email Marketing Workflow
```json
{
  "name": "Email Marketing Final Working", 
  "webhook": "/webhook/email-marketing-final",
  "features": [
    "Batch email processing",
    "Gmail SMTP integration",
    "Contact list handling",
    "HTML email support",
    "Delivery tracking",
    "Error handling and retries"
  ]
}
```

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **401 Unauthorized** | API calls fail | Generate new API key or login via web |
| **404 Webhook Not Found** | `{"code":404,"message":"webhook not registered"}` | Activate workflow and verify webhook path |
| **500 Server Error** | Internal server error | Check credentials and node configurations |
| **SMTP Auth Failed** | Email sending fails | Verify Gmail app password and 2FA enabled |
| **WhatsApp Token Invalid** | WhatsApp messages fail | Update Business API token |

### Environment Variables Check
If using Railway deployment, verify these variables:
```bash
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-password
WEBHOOK_URL=https://n8n-production-81b6.up.railway.app
GENERIC_TIMEZONE=America/New_York
```

### Database Connection
Ensure your database is accessible from N8N:
```javascript
// Example connection string
"postgresql://user:password@host:5432/fly2any_db"
```

## 🧪 Testing Checklist

After setup, verify:
- [ ] N8N web interface accessible
- [ ] Both workflows imported successfully  
- [ ] All credentials configured
- [ ] Workflows activated (toggle shows "Active")
- [ ] WhatsApp webhook responds (not 404)
- [ ] Email webhook responds (not 404)
- [ ] Test messages trigger workflow execution
- [ ] Email sending works with real Gmail credentials
- [ ] Database connections functional
- [ ] Error logging works

## 📚 Additional Resources

- **N8N Documentation**: https://docs.n8n.io/
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Railway Deployments**: https://docs.railway.app/

## 🆘 Support

If manual import fails:
1. Check Railway logs for N8N deployment
2. Verify all environment variables
3. Test database connectivity
4. Generate fresh API credentials
5. Consider redeploying N8N instance if issues persist

---
*Generated by N8N Import Script - $(date)*